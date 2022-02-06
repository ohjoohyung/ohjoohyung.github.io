---
title: 검색 기능에 Spring Event 써보기
date: 2022-02-05  
tags: 
- spring
---

여느 때와 다름없이 공부를 하고 있던 중 [프로젝트](https://github.com/woowacourse-teams/2021-botobo) 에서 막혔던 부분이 생각났고 
이를 어떻게 해결할 수 있을지 궁금해졌다.  
이미 다 끝난 프로젝트긴하지만 갑자기 궁금해졌으므로 고민을 해보았고 그 과정과 찾은 해결책 중 하나를 포스팅해보려고 한다.  
물론 적절한 해결책이라고 할 수 있을진 모르겠으나 한번 고민을 해보았다는거에 의미를 두기 위해..ㅎㅎ

---

## 어떤 상황이었는가?
기존에 문제집 검색 기능이 존재했다.  
프로젝트를 진행하면서 인기 검색어 기능이 추가되었고 이를 위해 검색어가 몇번 사용되었는지를 저장해주어야 했다.  
저장소로 redis를 사용하였고 이 부분을 담당했던 팀원이 멋지게 기능 구현을 해주었다.  
이때 검색어로 조회 + 해당 검색어의 score 증가는 하나의 트랜잭션에서 이루어지는 것이 좋겠다 싶어 팀원이 다음과 같은 코드를 작성해주었다.   

```java
@Transactional(readOnly = true)
public List<WorkbookResponse> searchWorkbooks(WorkbookSearchParameter workbookSearchParameter,
                                              List<Long> tags,
                                              List<Long> users) {

    PageRequest pageRequest = workbookSearchParameter.toPageRequest();
    if (pageRequest.getPageNumber() == 0) {
        String searchKeywordValue = workbookSearchParameter.getSearchKeyword().getValue();
        searchRankService.increaseScore(searchKeywordValue);
    }
    Page<Workbook> page = workbookQueryRepository.searchAll(workbookSearchParameter, tags, users, pageRequest);
    List<Workbook> workbooks = page.toList();
    return WorkbookResponse.openedListOf(workbooks);
}
```

문제는 @Transactional(readOnly = true)에서 시작되었다. 당시에 성능 향상(자동으로 flush 하지 않음) 및 replication을 적용해 readOnly 속성에 따라 작업 분리 목적으로 readOnly = true를 설정해두었다. 당연 검색 기능 또한 read 작업이기에 readOnly = true로 설정해두었는데 score 증가 작업을 추가함에 따라 애매해진 것.  
그런데 신기한건 readOnly = true여도 redis에서 write 작업은 잘 작동된다.
문제는 readOnly = true일 때 redis에서 score 증가 작업이 성공하고 에러가 발생한다면 rollback이 되지 않았다.
반면 readOnly = false로 바꾸면 에러가 발생해도 정상적으로 rollback이 되었다.  

왜 그럴까? 에 대해 좀 찾아보았는데 정확한지는 모르겠으나 공식 문서 + 디버깅을 통한 뇌피셜은 다음과 같다.  
우선 공식 문서의 내용이다.
> Spring Data Redis distinguishes between read-only and write commands in an ongoing transaction. Read-only commands, such as KEYS, are piped to a fresh (non-thread-bound) RedisConnection to allow reads. Write commands are queued by RedisTemplate and applied upon commit.

간단하게 트랜잭션에서 read only 명령과 write 명령을 구분하며 write 명령은 queue에 쌓아두고 한꺼번에 실행하나 read only 명령은 바로 실행이 된다는 뜻이다.  
근데 read only인지 write 명령인지 정하는 기준이 @Transactional에 readOnly 설정인듯 싶다.  
실제로 readOnly = true로 두고 score 증가 명령을 실행하면 redis transaction 명령어를 실행해주는 곳을 통과하지 못한다.  
![image](https://user-images.githubusercontent.com/62014888/152642034-1dfdbcad-427d-476c-933f-cad100fbe6d1.png)
이는 readOnly일 경우 위 작업을 해주는 곳과 별개로 명령이 실행된다고 볼 수 있다.  
즉, 이로 인해 해당 명령이 실행되는 서비스 메서드에서 예외가 발생하더라도 rollback되지 않는 것!

반면 readOnly = false로 두고 score 증가 명령을 실행하면 이 곳을 통과하고 해당 서비스 메서드의 트랜잭션 상태에 따라 redis 명령이 실행된다.
![image](https://user-images.githubusercontent.com/62014888/152642269-3526a941-1845-4877-adb4-b837de0eee08.png)
이로 인해 rollback이 되어 score가 증가하지 않게 된다.

이야기가 길었지만 결론은 redis write 명령 transcation에 에러가 발생하면 rollback 하기 위해 @Transaction의 readOnly = true를 삭제하게 되었다.
```java
@Transactional
public List<WorkbookResponse> searchWorkbooks(WorkbookSearchParameter workbookSearchParameter,
                                              List<Long> tags,
                                              List<Long> users) {

    PageRequest pageRequest = workbookSearchParameter.toPageRequest();
    if (pageRequest.getPageNumber() == 0) {
        String searchKeywordValue = workbookSearchParameter.getSearchKeyword().getValue();
        searchRankService.increaseScore(searchKeywordValue);
    }
    Page<Workbook> page = workbookQueryRepository.searchAll(workbookSearchParameter, tags, users, pageRequest);
    List<Workbook> workbooks = page.toList();
    return WorkbookResponse.openedListOf(workbooks);
}
```
하지만 이렇게 되면 write와 read 작업을 master, slave db로 나누었는데 read 작업 중 제일 많은 부분을 차지하게 될 검색 기능이 slave db를 타질 못한다.  
당시 팀원들과 어떻게 하면 검색 조회는 readOnly = true로 score 증가는 readOnly = false로 나눌 수 있을까에 대해 고민해보았지만 마땅한 해결책이 없었고 더 좋은 해결책이 나오기 전까지 위 방법을 사용하기로 하였다.

<br/>

## 다른 방법은 없을까?

프로젝트가 끝난지 한참이 지나긴 했지만 갑자기 생각이 나 고민을 해보고 싶었다.  
우선 살펴보니 위 코드는 다음과 같은 아쉬운 점이 있었다.  

1. score 증가 작업이 조회 작업보다 먼저 있음. (로직 흐름상 조회 후 증가가 맞음) 
2. 검색 작업이 slave db를 이용하지 못함.
3. read 작업인데 서로 연관이 없는 write 작업이 같이 있음.
4. score 증가하다가 에러가 발생하면 검색 기능이 되질 않는데 과연 score 증가하는 작업이 검색 기능을 막아버릴 정도로 중요한가 싶음. (score 증가하다 에러 발생해도 검색은 영향을 받지 않아야하지 않을까..?)

따라서 두 작업을 나누는게 좋을 것 같다고 생각했고 어떻게 나누는게 좋을지 고민해보았다.  
1. SearchController에서 score 증가, 검색 조회 순으로 두 개의 서비스 메서드를 호출하도록 수정 -> 1, 2, 3을 만족하나 4를 만족시킬 수 없다고 생각.
2. SearchService의 searchWorkbooks 메서드를 readOnly = true로 수정하고 SearchRankServce의 increaseScore 메서드의 transaction 전파 레벨을 REQUIRES_NEW로 설정 
-> 1, 2, 3을 만족하나 4를 충족시키지 않고 잘못하다가 검색은 실패하는데 score는 증가될 수 있다고 생각.
3. AOP는? 가능하지 않을까 싶긴했지만 여기서만 사용되기에 공통 관심사는 아니라고 생각했고 쪼끔 부담스러운 작업이 아닐까 생각..
4. event는? 검색 조회 작업이 끝나고 transaction이 commit이 되어야지만 event listener에 의해서 score 증가 작업이 실행된다면 1, 2, 3을 만족시키는데다 
찾아보니 @TransactionalEventListener를 사용하면 event listener에서 에러가 발생해도 event publisher에서의 작업은 그대로 진행이 된다는데..? 그럼 4도 만족시킬 수 있지 않을까 해서 이것을 적용시켜보기로 했다.

물론 이렇게 event를 발행해서 사용하는게 적합한 방법일까 싶지만 (필자는 아직까지 event에 대해 잘 알지 못한다..) 이런 방법으로도 해결할 수 있겠구나 싶은 생각으로 
적용해볼 것이다.

<br/>

## Spring Events

Spring에서는 이벤트 프로그래밍을 위한 몇가지 인터페이스를 제공한다.  
기본적으로 이벤트 게시자(Event Publisher)가 이벤트를 발행하고 이러한 이벤트를 이벤트 리스너(Event Listener)가 소비하는 흐름으로 진행된다.

- Event는 ApplicationEvent를 확장해서 사용하지만 Spirng FrameWork 4.2 버전부터 확장하지 않아도 사용 가능하다. (POJO)
- Event Publisher는 ApplicationEventPublisher에 이벤트를 발행한다. ApplicationEventPublisher는 ApplicationContext가 상속받고 있기 때문에 따로 빈으로 등록하지 않아도 의존성 주입을 할 수 있다.
- Event Listener는 ApplicationListener 인터페이스를 구현하여 이벤트를 받지만 4.2 버전부터 @EventListener나 @TransactionalEventListener를 통해 이벤트를 받을 수 있다.

<br/>

### @TransactionalEventListener

이렇게 이벤트를 발행하도록 만들게 되면 두 서비스간의 결합도가 낮아지게 된다.  
더이상 SearchServcie에서 SearchRankService를 의존하지 않아도 되며 read 작업, write 작업도 분리가 된다.  
또한 read 작업과 write 작업을 독립적으로 분리(에러 전파가 안됨)할 수 있도록 @TransactionalEventListener를 사용할 수 있다.  
@TransactionalEventListener를 사용하면 TransactionPhase에 따른 이벤트 처리가 가능하다.  
phase는 4개가 있으며 다음과 같다. 참고로 phase를 설정하지 않으면 트랜잭션이 성공적으로 완료되었을 때 이벤트가 실행된다.  

- AFTER_COMMIT (default): 트랜잭션이 성공했을 때 실행
- AFTER_ROLLBACK: 트랜잭션이 롤백되었을 때 실행
- AFTER_COMPLETION: 트랜잭션이 완료되었을 때 실행
- BEFORE_COMMIT: 트랜잭션이 커밋되기 전에 실행 

조회가 성공하면 검색어 score를 증가해주면 되었기에 AFTER_COMMIT으로 설정해주었다.

<br/>

## 적용 코드

### Event Publisher
```java
@Service
@Transactional(readOnly = true)
public class SearchService {

    private static final int SIZE_LIMIT = 10;

    private final WorkbookSearchRepository workbookSearchRepository;
    private final TagSearchRepository tagSearchRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

    public SearchService(WorkbookSearchRepository workbookSearchRepository,
                         TagSearchRepository tagSearchRepository,
                         ApplicationEventPublisher applicationEventPublisher) {
        this.workbookSearchRepository = workbookSearchRepository;
        this.tagSearchRepository = tagSearchRepository;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    public List<WorkbookResponse> searchWorkbooks(WorkbookSearchParameter workbookSearchParameter,
                                                  List<Long> tags,
                                                  List<Long> users) {
        PageRequest pageRequest = workbookSearchParameter.toPageRequest();
        Page<Workbook> page = workbookSearchRepository.searchAll(workbookSearchParameter, tags, users, pageRequest);
        List<Workbook> workbooks = page.toList();
        applicationEventPublisher.publishEvent(new SearchRankEvent(
                pageRequest.getPageNumber(),
                workbookSearchParameter.getSearchKeyword().getValue()));
        return WorkbookResponse.openedListOf(workbooks);
    }
}
```
SearchService에 ApplicationEventPublisher를 의존하고 주입받게 하였다.  
조회 작업 후 이벤트를 만들어서 발행하도록 하였다.

<br/>

### Event
```java
public class SearchRankEvent {
    private final int pageNumber;
    private final String keyWord;

    public SearchRankEvent(int pageNumber, String keyWord) {
        this.pageNumber = pageNumber;
        this.keyWord = keyWord;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public String getKeyWord() {
        return keyWord;
    }
}
```

<br/>

### EventListener
```java
@Component
public class SearchRankEventHandler {

    private final SearchRankService searchRankService;
    
    public SearchRankEventHandler(SearchRankService searchRankService) {
        this.searchRankService = searchRankService;
    }

    @TransactionalEventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void increaseScore(SearchRankEvent event) {
        if (event.getPageNumber() == 0) {
            searchRankService.increaseScore(event.getKeyWord());
        }
    }
}
```
따로 EventListener를 만들고 이벤트를 받아 실행해주도록 하였다.  
여기서 주의해야할 점이 전파 레벨인데 @TransactionalEventListener를 설정했더라도 이미 commit된 트랜잭션에 참여하고 있기에 재 commit이 불가능하다.
redis에 score를 증가시키기 위해선 commit이 필요하므로 publisher와 listener의 트랜잭션을 완전히 분리시켜주기 위해 
전파 레벨을 REQUIRES_NEW로 설정해주어야 한다.  
위 코드처럼 listener에 설정해주어도 되고 SearchRankService의 increaseScore 메서드에서 설정해주어도 된다.

<br/>

### 테스트

```java
@Test
@DisplayName("문제집을 검색하고 score가 증가한다.")
void searchWorkbooks() {
    // given
    String keyword = "java";
    WorkbookSearchParameter searchParameter = WorkbookSearchParameterUtils.builder()
            .searchKeyword(keyword).build();

    // when
    searchService.searchWorkbooks(searchParameter, Collections.emptyList(), Collections.emptyList());

    // then
    assertThat(searchScoreRepository.score(keyword)).isEqualTo(1.0);
}
```
테스트 결과 이벤트도 잘 동작하며 조회시 slave db도 제대로 타게 된다.  
![image](https://user-images.githubusercontent.com/62014888/152673323-6f471c7f-1fa2-42ea-827c-f1fa7fcfc336.png)

```java
public List<WorkbookResponse> searchWorkbooks(WorkbookSearchParameter workbookSearchParameter,
                                                  List<Long> tags,
                                                  List<Long> users) {
    PageRequest pageRequest = workbookSearchParameter.toPageRequest();
    Page<Workbook> page = workbookSearchRepository.searchAll(workbookSearchParameter, tags, users, pageRequest);
    List<Workbook> workbooks = page.toList();
    applicationEventPublisher.publishEvent(new SearchRankEvent(
            pageRequest.getPageNumber(),
            workbookSearchParameter.getSearchKeyword().getValue()));
    throw new IllegalArgumentException();
}

@Test
@DisplayName("문제집 검색하고 score 증가 후 에러 발생하면 rollback 한다.")
void searchWorkbooksWithSearchException() {
    // given
    String keyword = "java";
    WorkbookSearchParameter searchParameter = WorkbookSearchParameterUtils.builder()
    .searchKeyword(keyword).build();

    // when, then
    assertThatThrownBy(() -> searchService.searchWorkbooks(searchParameter, Collections.emptyList(), Collections.emptyList()))
    .isInstanceOf(IllegalArgumentException.class);
    assertThat(searchScoreRepository.score(keyword)).isNull();
}
```

```java
@TransactionalEventListener
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void increaseScore(SearchRankEvent event) {
    if (event.getPageNumber() == 0) {
        searchRankService.increaseScore(event.getKeyWord());
    }
    throw new IllegalArgumentException();
}

@Test
@DisplayName("문제집 검색하고 score 증가시 에러 발생하면 score는 rollback하지만 검색은 정상으로 된다.")
void searchWorkbooksWithScoreException() {
    // given
    String keyword = "java";
    WorkbookSearchParameter searchParameter = WorkbookSearchParameterUtils.builder()
    .searchKeyword(keyword).build();
    
    // when
    searchService.searchWorkbooks(searchParameter, Collections.emptyList(), Collections.emptyList());
    
    // then
    assertThat(searchScoreRepository.score(keyword)).isNull();
}
```

또한 위와 같이   
조회 성공 -> 증가 성공 -> 예외 발생한 경우엔 검색 기능 예외 발생 및 정상적으로 rollback되며  
조회 성공 -> 증가 실패한 경우에 증가에 대한 트랜잭션은 rollback되고 검색 기능은 정상적으로 작동된다.  

<br/>

## 마무리

원하는대로 구현을 할 수 있게 되어 좋았지만 반드시 이게 정답은 아닐 것이다.  
우선 분리를 해서 좋으나 전체적인 로직 파악이 한번에 되진 않는다.  
이벤트 로직까지 코드를 봐야 알 수 있으니까..ㅎㅎ  
그리고 이벤트 로직에서 예외가 발생했을 때는 어떻게 관리를 해야할지 생각해봐야겠다.  
정상적으로 검색 기능은 작동하나 예외가 발생하고 있는지도 모를 수 있으니까..  
마지막으로 SearchRankService가 사라지는 대신에 ApplicationEventPublisher를 의존하니 이벤트를 만들고 등록하는 로직이 
서비스 로직에 추가된거 같아 이거도 다른 곳으로 이동할 수 없을까 생각했었는데 [관련 글](https://supawer0728.github.io/2018/03/24/spring-event/) 이 있었다.  
이벤트 만들고 등록하는 로직을 AOP로 분리하는 것이었는데 이렇게 분리하면 후에 이벤트가 필요한 곳에 재사용 가능하니 좋은 방법이지 않을까 싶었다.

<br/>

## 참고

- https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#context-functionality-events
- https://supawer0728.github.io/2018/03/24/spring-event/
- https://daddyprogrammer.org/post/14625/spring-boot-events/
- https://soongjamm.tistory.com/m/155
- https://seller-lee.github.io/notification-service