---
title: "Criteria -> QueryDSL 마이그레이션 해보기" 
date: 2021-09-27  
tags:
- jpql
---

## 기존 검색 API

**/api/search/workbooks?type=name&criteria=date&order=desc&keyword=JAVA&start=0&size=10**

- type: name, tag, user 중 택 1 (검색할 때 종류)
- criteria: date, name, count, like 중 택 1 (조회할 때 정렬 기준)
- order: asc (오름차순), desc (내림차순)
- keyword: 검색어
- start: 페이징 시작점
- size: 가져올 문제집 개수

보또보 기존 검색 api이다.

문제집 이름으로 검색, 태그로 검색, 유저명으로 검색 이렇게 3개로 나누어져있었고 검색을 실시간으로 할 수 있었다.

태그나 유저로 검색된 결과에서 최신순, 이름순, 카드개수순, 좋아요순으로 정렬이 가능했다.

![Untitled (8)](https://user-images.githubusercontent.com/62014888/140268421-87b1995d-7311-449b-bffd-f7d504dd5218.png)

<br/>

## 새로운 검색 API

**/api/search/workbooks?keyword=JAVA&tags=1&users=1&criteria=date&start=0&size=10**

- criteria: date, name, count, like 중 택 1 (조회할 때 정렬 기준)
- keyword: 검색어
- tags: 태그 id (원하는 태그들로 필터링)
- users: 유저 id (원하는 유저들로 필터링)
- start: 페이징 시작점
- size: 가져올 문제집 개수

보또보 새로운 검색 api이다.

다른 검색 사이트 + 프롤로그 검색을 참고했다.

프롤로그의 태그로 필터링 하는 기능을 보고 우리도 태그 또는 유저 검색 기능을 필터링으로 바꾸자는 의견이 나와서 이를 적용시키고 싶었다.

하지만 실시간으로 검색된 결과에 태그나 유저로 필터링을 하는 것이 뭔가 어색한 것 같았고 실제 다른 검색 사이트에서도 검색된 결과 페이지에서 필터링을 주로 한다는 것을 발견할 수 있었다.

그래서 검색어에 대한 결과를 실시간으로 보여주는 것이 아닌 검색을 한 결과 페이지에서 보여주기로 했으며 태그, 유저 검색은 삭제하고 문제집 검색만 남기기로 했다. 문제집 이름으로 검색된 결과를 바탕으로 해당 문제집들의 태그, 유저로 필터링을 할 수 있고 최신순, 이름순, 카드개수순, 좋아요순으로 정렬이 가능하도록 했다.



![Untitled (9)](https://user-images.githubusercontent.com/62014888/140268459-3ee4e7b5-416b-44a7-80d2-80d395729c81.png)

<br/>

## Criteria? QueryDSL?

기존의 검색 기능은 동적 쿼리 구현을 위해 JPQL 빌더로 criteria를 사용하고 specification을 이용하여 쿼리 조건을 처리하였다.

### Criteria

Criteria는 JPQL을 자바 코드로 작성하도록 도와주는 빌더 클래스 API다.

Criteria를 사용하면 문자가 아닌 코드로 JPQL을 작성하므로 문법 오류를 컴파일 단계에서 잡을 수 있고 문자 기반의 JPQL보다 동적 쿼리를 안전하게 생성할 수 있다는 장점이 있다. 하지만 코드가 복잡하고 장황해서 직관적으로 이해가 힘들다는 단점도 있다.

뿐만 아니라 문법 오류를 컴파일 단계에서 잡을 수 있다곤 하지만 사용하다보면 필드명을 문자로 적어야 해서 실수를 한다면 컴파일 단계에서 잡을 수가 없게 된다.

![화면 캡처 2021-09-27 120432](https://user-images.githubusercontent.com/62014888/140268498-b1127b99-6866-4889-b517-a6298564f637.jpg)

물론 이를 위해 메타 모델 API를 사용하면 된다고 한다.

다만, 메타 모델 API를 사용하려면 메타 모텔 클래스를 만들어야 하는데 이는 코드 자동 생성기가 있어 만들어 준다고 한다. 이러한 코드 생성기는 빌드 도구를 사용해서 실행한다.

<br/>

### Specification

Specification은 검색 조건을 추상화한 객체다.

즉, 검색 조건에 대해 Specification을 생성하고, 이를 통해 다양한 조건의 검색을 할 수 있다는 뜻이다.

우리 프로젝트로 예를 들면 어떤 타입의 검색어인지 어떤 순서로 정렬할 것인지를 Criteria를 이용해 만들고 이러한 다양한 검색 조건을 Specification으로 생성한 뒤 Repository 메서드 인자로 넘겨주어서 사용했다.

<br/>

## QueryDSL 특징

Criteria는 위에서 말한 특징들의 장점을 확실하게 가지고 있다.

하지만 너무 복잡하고 어렵다는 가장 큰 단점이 있다.

작성된 코드를 보면 그 복잡성으로 인해 어떤 JPQL이 생성될지 파악하기가 쉽지 않다.

쿼리를 문자가 아닌 코드로 작성해도, 쉽고 간결하며 그 모양도 쿼리와 비슷하게 개발할 수 있는 JPQL 빌더가 바로 QueryDSL이다.

<br/>

## Why use QueryDSL?

일단 어떤 기술을 적용하기 전에 반드시 '왜 적용하는가?' 에 대해 짚고 넘어가야 한다고 생각한다.

사실 이미 중간곰이랑 피케이가 Criteria, Specification으로 검색 기능을 잘 구현 해놓았기에 처음에는 QueryDSL을 적용할 필요가 있을까 싶었다.

하지만 곰곰히 생각한 끝에 QueryDSL로 변경하기로 했다.

그 이유는 두 가지이다.

1. 기존의 Criteria, Specification를 적용한 코드를 내가 구현한게 아니기에 어차피 처음부터 공부했어야 했다. 둘 다 그렇게 해야하는거면 QueryDSL을 적용해보는 것도 괜찮겠다고 생각했다.

2. 가독성 및 컴파일 오류다.

아무래도 Criteria로 작성한 코드는 한번에 의미를 파악하기 어려웠고 따라서 기존 코드에서 새롭게 바뀐 API대로 적용시키는게 생각보다 어려울 것 같았다.

또한 메타 모델 API를 사용하지 않는 이상 문자열 그대로 코드를 작성해야 하니 컴파일 단계에서 오류를 완전히 잡아주지 못하였다.

이러한 이유들로 Criteria에서 QueryDSL로 변경하며 새로운 검색 API를 적용시키기로 하였다.

<br/>

## QueryDSL 설정

```groovy
plugins {
		//1
    id "com.ewerk.gradle.plugins.querydsl" version "1.0.10"
}

dependencies {
    //2
    implementation 'com.querydsl:querydsl-jpa'
}

//3
def querydslDir = "$buildDir/generated/querydsl"

//4
querydsl {
    jpa = true
    querydslSourcesDir = querydslDir
}

//5
sourceSets {
    main.java.srcDir querydslDir
}

//6
configurations {
    querydsl.extendsFrom compileClasspath
}

//7
compileQuerydsl {
    options.annotationProcessorPath = configurations.querydsl
}
```

빌드툴로 gradle을 사용했다.

신기하게도 QueryDSL 공식 문서를 보면 maven이나 ant로 설정하는 방법은 나오지만 gradle에서 설정하는 방법은 나오지 않는다. 그래서 검색을 통해 해결하였다.

설정들을 위에서부터 하나씩 설명하자면 이렇다.

1. Q클래스 생성을 위한 QueryDSL 플러그인을 추가한다.
2. QueryDSL 의존성을 추가한다.
3. Q클래스가 저장되는 위치를 뜻한다. Q클래스는 자동으로 생성되는 파일들이라 .gitignore에 추가하여 깃헙에 올리지 않도록 하는것이 좋은데 build 디렉토리에 있는 파일들은 모두 올라가지 않고 있는 중이라 이렇게 설정하였다.
4. jpa true로 하면 빌드할 때 자동으로 Q클래스가 생성된다. querydslSourcesDir는 Q클래스가 어디에 생성할지 결정한다.
5. 빌드할 때 Q클래스가 생성된 위치를 나타낸다.
6. gradle 6.x 버전에서 이 코드를 작성해야 정상작동한다고 한다. compile로 걸린 JPA 의존성에 접근하도록 해준다.
7. annotation processor의 경로를 설정해주어 빌드 시 Q클래스가 생성되도록 해준다.

complieQuerydsl을 실행해주면 이렇게 원하는 위치에 Q클래스가 잘 생성된 모습을 볼 수 있다.

![Untitled (10)](https://user-images.githubusercontent.com/62014888/140268538-abad940c-0956-4877-b423-b80ed149b34c.png)

<br/>

## 기존 코드와 변경된 코드 비교

```java
@EqualsAndHashCode
@Getter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class WorkbookSearchParameter {

    private static final int MINIMUM_START_PAGE = 0;
    private static final int DEFAULT_START_PAGE = 0;
    private static final int MINIMUM_PAGE_SIZE = 1;
    private static final int MAXIMUM_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 20;

    private SearchKeyword searchKeyword;
    private SearchCriteria searchCriteria;
    private int start;
    private int size;

    private WorkbookSearchParameter(SearchCriteria searchCriteria, SearchKeyword searchKeyword, int start, int size) {
        this.start = start;
        this.size = size;
        this.searchKeyword = searchKeyword;
        this.searchCriteria = searchCriteria;
    }

    public static WorkbookSearchParameter ofRequest(String searchCriteria,
                                                    String searchKeyword,
                                                    String start, String size) {
        return of(
                SearchCriteria.of(searchCriteria),
                SearchKeyword.of(searchKeyword),
                initializeStartValue(start),
                initializeSizeValue(size)
        );
    }

    public static WorkbookSearchParameter of(SearchCriteria searchCriteria,
                                             SearchKeyword searchKeyword,
                                             int start, int size) {
        return new WorkbookSearchParameter(
                searchCriteria,
                searchKeyword,
                start,
                size
        );
    }

    private static int initializeStartValue(String start) {
        try {
            int value = Integer.parseInt(start);
            if (value < MINIMUM_START_PAGE) {
                throw new InvalidPageStartException();
            }
            return value;
        } catch (NumberFormatException e) {
            return DEFAULT_START_PAGE;
        }
    }

    private static int initializeSizeValue(String size) {
        try {
            int value = Integer.parseInt(size);
            if (value < MINIMUM_PAGE_SIZE || value > MAXIMUM_PAGE_SIZE) {
                throw new InvalidPageSizeException();
            }
            return value;
        } catch (NumberFormatException e) {
            return DEFAULT_PAGE_SIZE;
        }
    }

    public PageRequest toPageRequest() {
        return PageRequest.of(start, size);
    }
}

```

기존 코드에서는 검색 조건 파라미터 값을 가지고 있으며 Specification을 이용해 검색 조건을 처리하는 클래스인 WorkbookSearchParameter이다.

여기에 타입, 정렬 기준 등을 처리해주는 SearchCriteria, SearchType, SearchOrder 등이 있다.

```java
@EqualsAndHashCode
@Getter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class WorkbookSearchParameter {

    private static final int MINIMUM_START_PAGE = 0;
    private static final int DEFAULT_START_PAGE = 0;
    private static final int MINIMUM_PAGE_SIZE = 1;
    private static final int MAXIMUM_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 20;

    private SearchKeyword searchKeyword;
    private SearchCriteria searchCriteria;
    private int start;
    private int size;

    @Builder
    private WorkbookSearchParameter(String searchCriteria, String searchKeyword, String start, String size) {
        this.start = initializeStartValue(start);
        this.size = initializeSizeValue(size);
        this.searchKeyword = SearchKeyword.of(searchKeyword);
        this.searchCriteria = SearchCriteria.of(searchCriteria);
    }

    private int initializeStartValue(String start) {
        try {
            int value = Integer.parseInt(start);
            if (value < MINIMUM_START_PAGE) {
                throw new InvalidPageStartException();
            }
            return value;
        } catch (NumberFormatException e) {
            return DEFAULT_START_PAGE;
        }
    }

    private int initializeSizeValue(String size) {
        try {
            int value = Integer.parseInt(size);
            if (value < MINIMUM_PAGE_SIZE || value > MAXIMUM_PAGE_SIZE) {
                throw new InvalidPageSizeException();
            }
            return value;
        } catch (NumberFormatException e) {
            return DEFAULT_PAGE_SIZE;
        }
    }

    public PageRequest toPageRequest() {
        return PageRequest.of(start, size);
    }
}
```

```java
@RequiredArgsConstructor
@Repository
public class WorkbookSearchRepository {

    private final JPAQueryFactory jpaQueryFactory;

    public Page<Workbook> searchAll(WorkbookSearchParameter parameter,
                                    List<Long> tags,
                                    List<Long> users,
                                    Pageable pageable) {
        QueryResults<Workbook> results = queryBy(parameter, tags, users)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetchResults();
        return new PageImpl<>(results.getResults(), pageable, results.getTotal());
    }

    public List<Workbook> searchAll(WorkbookSearchParameter parameter) {
        return queryBy(parameter)
                .limit(parameter.getSize())
                .fetch();
    }

    private JPAQuery<Workbook> queryBy(WorkbookSearchParameter parameter) {
        return queryBy(parameter, Collections.emptyList(), Collections.emptyList());
    }

    private JPAQuery<Workbook> queryBy(WorkbookSearchParameter parameter, List<Long> tags, List<Long> users) {
        return jpaQueryFactory.selectFrom(workbook)
                .innerJoin(workbook.user, user).fetchJoin()
                .innerJoin(workbook.cards.cards, card)
                .leftJoin(workbook.workbookTags, workbookTag)
                .leftJoin(workbookTag.tag, tag)
                .leftJoin(workbook.hearts.hearts, heart)
                .where(containKeyword(parameter.getSearchKeyword()),
                        containTags(tags),
                        containUsers(users),
                        openedTrue())
                .groupBy(workbook.id)
                .orderBy(findCriteria(parameter.getSearchCriteria()), workbook.id.asc());
    }

    private BooleanExpression containKeyword(SearchKeyword searchKeyword) {
        if (searchKeyword == null) {
            return null;
        }
        String keyword = searchKeyword.getValue();
        return containsKeywordInWorkbookName(keyword)
                .or(equalsKeywordInWorkbookTag(keyword));
    }

    private BooleanExpression containsKeywordInWorkbookName(String keyword) {
        return workbook.name.lower().contains(keyword);
    }

    private BooleanExpression equalsKeywordInWorkbookTag(String keyword) {
        return workbook.workbookTags.any().tag.tagName.value.eq(keyword);
    }

    private BooleanExpression containTags(List<Long> tags) {
        if (tags == null || tags.isEmpty()) {
            return null;
        }
        return workbookTag
                .tag
                .id
                .in(tags);
    }

    private BooleanExpression containUsers(List<Long> users) {
        if (users == null || users.isEmpty()) {
            return null;
        }
        return user
                .id
                .in(users);
    }

    private BooleanExpression openedTrue() {
        return workbook.opened.isTrue();
    }

    private OrderSpecifier<?> findCriteria(SearchCriteria searchCriteria) {
        if (searchCriteria == SearchCriteria.DATE) {
            return workbook.createdAt.desc();
        }
        if (searchCriteria == SearchCriteria.NAME) {
            return workbook.name.asc();
        }
        if (searchCriteria == SearchCriteria.COUNT) {
            return card.countDistinct().desc();
        }
        return heart.countDistinct().desc();
    }
}

```

QueryDSL로 바꾸면서 기존의 WorkbookSearchParameter는 파라미터로 들어온 값만 가지고 있고 이 값을 이용해 QueryDSL 전용 Repository에서 조회를 처리했다.

configuration으로 JPAQueryFactory를 빈으로 등록한 뒤 이를 이용해 동적 쿼리를 작성하는 방식이다.

디테일한 부분은 설명하기 아직 지식이 부족하지만 대략적으로 JPAQueryFactory를 사용해 동적 쿼리를 만드는데 파라미터로 넘겨온 값을 where 내에 있는 메서드들을 이용해 BooleanExpression을 반환받도록 하여 조건에 맞게 쿼리를 만들 수 있다.

물론 이와 함께 paging도 가능하다!

Criteria와 비교하면 상대적으로 가독성이 좋다는 것을 알 수 있다.

<br/>

## 주의할 점

적용하다 생긴 트러블 슈팅을 공유한다.

1. 소나큐브와 함께 사용하다 보니 테스트 커버리지를 통과하지 못해 빌드할 때 에러가 발생했다.

   Q클래스도 테스트 커버리지 검증을 하다보니 발생하는 에러였는데 이를 위해 테스트 커버리지 검증에서 Q클래스를 제외시켰다.

   역시나 검색을 해보니 이런 상황을 맞이한 분들이 있으셔서 이 블로그를 참고하였다.
   [https://velog.io/@lxxjn0/코드-분석-도구-적용기-2편-JaCoCo-적용하기](https://velog.io/@lxxjn0/%EC%BD%94%EB%93%9C-%EB%B6%84%EC%84%9D-%EB%8F%84%EA%B5%AC-%EC%A0%81%EC%9A%A9%EA%B8%B0-2%ED%8E%B8-JaCoCo-%EC%A0%81%EC%9A%A9%ED%95%98%EA%B8%B0)

    ```groovy
    jacocoTestCoverageVerification {
        def Qdomains = []
    
        for (qPattern in '*.QA'..'*.QZ') {
            Qdomains.add(qPattern + '*')
        }
    
        violationRules {
            rule {
                enabled = true
                element = 'CLASS'
    
                limit {
                    counter = 'BRANCH'
                    value = 'COVEREDRATIO'
                    minimum = 0.80
                }
    
                limit {
                    counter = 'LINE'
                    value = 'COVEREDRATIO'
                    minimum = 0.80
                }
    
                excludes = [
                        //제외될 다른 클래스들
                ] + Qdomains
            }
        }
    }
    ```

<br/>

2. distinct와 orderBy가 동시에 적용되지 않는 현상이 발생했다.

   찾아보니 H2 문법 문제였고 MySQL에서는 같이 사용해도 적용이 되었다.

   그래서 일단은 workbook의 id로 groupBy를 해서 distinct를 사용하지 않는 방향으로 수정했다. 프로젝트를 진행하며 Flyway를 적용할 때도 그렇고 이번에도 그렇고 local과 test에서는 H2를 사용하고 dev와 prod에서는 Mariadb를 사용하다 보니 H2와 MySQL의 문법 차이 때문에 여러 번 syntax 에러를 경험하는 일이 많았다.

   그리하여 다음 스프린트 때는 이 차이를 해소시킬 방법을 찾아볼 생각이다.

<br/>

3. 이건 우리가 겪은 트러블 슈팅은 아니지만 gradle에서 QueryDSL 설정과 관련해서 많이들 이슈가 있다고 한다. 현재 우리가 적용시킨 설정 방법은 플러그인을 사용해서 Q클래스를 만드는데 이때 gradle 버전이 업그레이드 됨에 따라 여러 가지 설정을 추가해주어야 했다.
   그래서 이 플러그인을 걷어내기 위해 gradle AnnotationProcessor를 사용하여 처리하는 방법이 있다고 한다.
   이게 궁금하다면 [http://honeymon.io/tech/2020/07/09/gradle-annotation-processor-with-querydsl.html](http://honeymon.io/tech/2020/07/09/gradle-annotation-processor-with-querydsl.html) 블로그를 참고하도록 하자.