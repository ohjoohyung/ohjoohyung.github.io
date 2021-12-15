---
title: Spring Cache 살펴보기
date: 2021-12-04
tags:
  - spring
  - cache
---

캐싱이라는 용어는 프로그래밍에서 자주 등장하게 된다.
캐싱이란 '성능 향상을 위해 사용이 많은 데이터를 별도 공간에 일시적으로 저장하여 필요할 때마다 데이터를 가져오는 기술'이다.
메모리, 네트워크 등 다양한 곳에서 사용하게 되는데 Spring에서도 편리하게 캐싱을 사용하기 위해 캐싱 추상화 형식으로 제공해준다.
공식 문서를 바탕으로 간단하게 이를 알아보도록 하자.

---

## Spring Cache?

Spring Framework는 버전 3.1 부터 기존 Spring 애플리케이션에 투명하게 캐싱을 추가하는 지원을 제공한다. Spring에서 제공하는 트랜잭션 지원과 유사하게 캐싱 추상화를 통해 코드에 미치는 영향을 최소화하면서 다양한 캐싱 솔루션을 일관되게 사용할 수 있다.

간단하게 이야기하자면 Java 메소드에 애노테이션과 같은 추상화된 캐싱을 적용하여 캐시에서 사용 가능한 정보를 기반으로 실행 횟수를 줄이는 것이다. 즉, 해당 메소드가 호출될 때 주어진 인자에 대해 메소드가 이미 실행되었는지 여부를 확인하고 실행되었다면 실제 메소드를 실행할 필요 없이 캐시된 결과가 반환된다.

이를 통해 값비싼 메소드(CPU or I/O 바인딩 여부)를 주어진 매개변수 집합에 대해 한 번만 실행할 수 있으며 실제로 메소드를 다시 실행할 필요 없이 결과를 재사용할 수 있다.

캐시 추상화를 사용하려면 개발자는 두 가지 측면을 처리해야 한다.

- caching declaration(캐싱 선언) - 캐싱해야 하는 메소드와 해당 정책 식별
- cache configuration(캐시 구성) - 데이터가 저장되고 읽히는 백업 캐시

Spring Framework의 다른 서비스와 마찬가지로 캐싱 서비스는 추상화(캐시 구현이 아님)이며 캐시 데이터를 저장하기 위해 실제 저장소를 사용해야 한다. 기본적으로 Spring에서는 EhCache, Caffeine, Redis 등 여러 캐시들을 지원해주며 애플리케이션에 저장하는 ConcurrentMap 또한 저장소로 사용할 수 있다.

<br/>

## Configuration

Spring Boot, Gradle을사용하고 있다면 간단하게 아래 dependencies를 추가하여 사용 가능하다.

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-cache'
}
```

```java
@EnableCaching
@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("workbooks");
    }

}
```

- Spring에서는 설정과 상관없이 동일한 코드로 캐시에 접근하기 위해서 CacheManager를 제공헤준다.
- 예시를 위해 ConcurrentMap을 사용했는데 상황에 따라 무엇을 사용할지 결정될 것 같다.
    - ConcurrerntMap의 경우 TTL을 설정할 수 없고 애플리케이션 내에서 사용되는 캐시이기에 WAS가 늘어나면 WAS 별로 따로 관리를 해줘야한다.
        - TTL을 설정할 수 없기에 Scheduling 등을 이용해 삭제해줘야 한다.
    - 외부에 같은 캐시 저장소를 사용하려면 Redis나 Memcached를 사용하는게 좋다.
- @EnableCaching은 내부적으로 Spring AOP를 이용하여 애노테이션 기반 캐싱 설정을 사용하게 해준다.
    - 원래는 proxyTargetClass가 false인 경우 JDK Dynamic Proxy 사용, true인 경우 CGLIB Proxy를 사용하나 Spring Boot가 버전이 업데이트 되면서 CGLIB 사용을 강제했기 때문에 현재 2.5.1 기준 false 여도 CGLIB를 사용한다.

<br/>

## @Cacheable

@Cacheable은 캐싱할 수 있는 메소드를 지정하는데 사용한다.

```java

@Cacheable(cacheNames = "workbooks", key = "#keyword")
public Workbook findWorkbookByKeyword(String keyword) {
    return workbookRepository.findByName(keyword);
}
```

```java

@Test
void findWorkbookByKeyword() {
    // given
    String keyword = "java";
    given(workbookRepository.findByName(anyString()))
            .willReturn(new Workbook());

    // when
    workbookService.findWorkbookByKeyword(keyword);
    workbookService.findWorkbookByKeyword(keyword);
    workbookService.findWorkbookByKeyword(keyword);

    // then
    then(workbookRepository)
            .should(times(1))
            .findByName(anyString());
}
```

- cacheNames는 설정에서 ConcurrentMapCacheManager의 저장소 명과 일치한 값이 들어가며 value도 같은 역할을 한다. (일치하지 않으면 캐싱이 안됨)
- key의 경우 캐시 데이터가 들어있는 key (여기서는 ConcurrentMap의 key) 이며 해당 key의 value가 존재하면 findWorkbookByKeyword 메소드가 수행되지 않고, 존재하지 않으면 수행된다.
    - key는 SpEL (Spring Expression Language) 문법을 사용할 수 있는데 위와 같이 파라미터로 넘어온 값을 지정할 수 있고 파라미터가 객체일 경우 객체의 멤버 변수에도 접근할 수 있다.
    - SpEL에 대한 자세한 사항은 [공식 문서](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/cache.html) 를 참고하자.

    ```java
    @Cacheable(cacheNames = "workbooks", key = "#workbook.name")
    public Workbook findWorkbookByKeyword(Workbook workbook) {
        return workbookRepository.findByName(workbook.getName());
    }
    ```

    ```java
    @Test
    void findWorkbookByKeyword() {
        // given
        Cache cache = Objects.requireNonNull(concurrentMapCacheManager.getCache("workbooks"));
        Workbook workbook = new Workbook("java");
        given(workbookRepository.findByName(anyString()))
                .willReturn(workbook);
    
        // when
        workbookService.findWorkbookByKeyword(workbook);
    
        // then
        assertThat(cache.get(workbook.getName())).isNotNull();
    }
    ```


- condition 속성을 이용하면 조건도 부여할 수 있다.

    ```java
    @Cacheable(cacheNames = "workbooks", key = "#workbook.name", condition = "#workbook.name.length() > 4")
    public Workbook findWorkbookByKeyword(Workbook workbook) {
        return workbookRepository.findByName(workbook.getName());
    }
    ```

    ```java
    @Test
    void findWorkbookByKeywordWhenConditionExists() {
        // given
        Workbook workbook = new Workbook("java");
        given(workbookRepository.findByName(anyString()))
                .willReturn(workbook);
    
        // when
        workbookService.findWorkbookByKeyword(workbook);
        workbookService.findWorkbookByKeyword(workbook);
        workbookService.findWorkbookByKeyword(workbook);
    
        // then
        then(workbookRepository)
                .should(times(3))
                .findByName(anyString());
    }
    ```

    - workbook의 name length가 4보다 큰 경우에 캐싱하도록 조건을 부여했기에 캐싱이 되지 않은 모습을 볼 수 있다.

- 특정 로직에 의해 key를 만들고자 하는 경우 KeyGenerator 인터페이스를 별도로 구현하여 Custom KeyGenerator를 만들어 사용할 수 있다고 한다.
    - default는 SimpleKeyGeneretor를 사용한다고 하며 파라미터를 보고 key를 생성해주게 된다.

        ![Untitled (11)](https://user-images.githubusercontent.com/62014888/145708088-61abe80d-72c8-4dda-b679-053c455ada65.png)

    - 파라미터가 없는 경우는 빈 값,
      1개일 경우 해당 파라미터,
      여러 개일 경우 모든 파라미터의 해시에서 계산된 키를 반환한다.
    - 만약 key를 따로 지정하지 않는다면 side effect가 생길 수 있으니 지정해주는 것이 좋다.

- cacheManager가 여러 개라면 cacheManager 속성을 사용해 원하는 cacheManager 설정도 가능하다.

<br/>

## @CachePut

@CachePut은 메소드 실행에 영향을 주지 않고 캐시를 갱신해야 할 경우 사용한다. 즉, 메소드를 항상 실행하고 그 결과를 캐시에 보관한다.

```java
@CachePut(cacheNames = "workbooks", key = "#workbook.name")
public Workbook findWorkbookByKeyword(Workbook workbook) {
    return workbookRepository.findByName(workbook.getName());
}
```

```java
@Test
void findWorkbookByKeywordWhenCachePut() {
	  // given
	  Workbook workbook = new Workbook("java");
	  given(workbookRepository.findByName(anyString()))
	          .willReturn(workbook);
	
	  // when
	  workbookService.findWorkbookByKeyword(workbook);
	  workbookService.findWorkbookByKeyword(workbook);
	  workbookService.findWorkbookByKeyword(workbook);
	
	  // then
	  then(workbookRepository)
	          .should(times(3))
	          .findByName(anyString());
}
```

- Spring에서는 같은 메소드에 @CachePut과 @Cacheable을 사용하는 것을 권장하지 않는다. @Cacheable은 캐시를 사용해서 메소드를 건너뛰려하고 @CachePut은 메소드 실행을 강제하기 때문에 의도치 않은 동작이 발생할 수 있기 때문이다.

    ![Untitled (12)](https://user-images.githubusercontent.com/62014888/145708123-70dd5b48-4324-4088-894d-8b70c3e3c841.png)


<br/>

## @CacheEvict

@CacheEvict는 저장된 캐시를 제거할 때 사용한다. 메소드 실행 시,  해당 캐시를 삭제한다.

```java
@CacheEvict(cacheNames = "workbooks", key = "#keyword")
public void removeWorkbookCache(String keyword) {
    // ...
}
```

```java
@Test
void removeWorkbookCacheByKeyword() {
    // given
    String keyword = "java";
    String anotherKeyword = "spring";
    Cache cache = Objects.requireNonNull(concurrentMapCacheManager.getCache("workbooks"));
    given(workbookRepository.findByName(anyString()))
            .willReturn(new Workbook());

    // when
    workbookService.findWorkbookByKeyword(keyword);
    workbookService.findWorkbookByKeyword(anotherKeyword);
    workbookService.removeWorkbookCache(keyword);

    // then
    assertThat(cache.get(keyword)).isNull();
    assertThat(cache.get(anotherKeyword)).isNotNull();
}
```

- allEntries 속성을 true로 설정하여 하나의 캐시가 아닌 전체 캐시를 제거할 수 있다. default가 false다.

    ```java
    @CacheEvict(cacheNames = "workbooks", allEntries = true)
    public void removeWorkbookCache() {
        // ...
    }
    ```

    ```java
    @Test
    void removeWorkbookAllCacheByKeyword() {
        // given
        String keyword = "java";
        String anotherKeyword = "spring";
        Cache cache = Objects.requireNonNull(concurrentMapCacheManager.getCache("workbooks"));
        given(workbookRepository.findByName(anyString()))
                .willReturn(new Workbook());
    
        // when
        workbookService.findWorkbookByKeyword(keyword);
        workbookService.findWorkbookByKeyword(anotherKeyword);
        workbookService.removeWorkbookCache();
    
        // then
        assertThat(cache.get(keyword)).isNull();
        assertThat(cache.get(anotherKeyword)).isNull();
    }
    ```


- beforeInvocation 속성을 이용해 true면 메소드 실행 이전에 캐시를 삭제하고, false면 메소드 실행 이후 삭제를 할 수 있다. default가 false다.
- 위 예제처럼 void 메소드와 함께 사용할 수 있다. 메소드가 트리거로 동작하므로 반환값은 무시한다.

<br/>

## @Caching

@Caching은 @CacheEvict나 @CachePut을 여러 개 지정해야 하는 경우에 사용한다.

- 예를 들어 조건이나 키 표현식이 캐시에 따라 다른 경우다.
- 여러가지의 key에 대한 캐시를 중첩적으로 삭제해야할 때 사용할 수 있다.

```java
@Caching(evict = {@CacheEvict(value = "workbooks", key = "#keyword"), @CacheEvict("tags")})
public void removeWorkbookCache(String keyword) {
    // ...
}
```

- @Cacheable, @CachePut, @CacheEvict를 같은 메소드에 다수 사용할 수 있다.

<br/>

## @CacheConfig

@CacheConfig는 클래스 단위로 캐시 설정을 동일하게 하는데 사용한다.

- CacheManager가 여러 개인 경우 사용할 수 있다.
- 프로젝트를 진행하면서 Redis용 CacheManager와 ConcurrentMapCacheManager를 같이 사용했는데 이때 ConcurrentMapCacheManager를 사용하는 클래스에서 다음과 같이 @CacheConfig를 사용할 수 있다.

    ```java
    @Slf4j
    @Service
    @CacheConfig(cacheManager = "concurrentMapCacheManager")
    public class SearchRankService {
    
        private static final String SEARCH_RANKS_CACHE_VALUE = "SearchRanks";
        private static final int SEARCH_RANK_COUNT = 3;
    
        private final SearchRankRepository searchRankRepository;
        private final SearchScoreRepository searchScoreRepository;
    
        public SearchRankService(SearchRankRepository searchRankRepository, SearchScoreRepository searchScoreRepository) {
            this.searchRankRepository = searchRankRepository;
            this.searchScoreRepository = searchScoreRepository;
        }
    
        @Cacheable(value = SEARCH_RANKS_CACHE_VALUE, key = "'SearchRanksKey'")
        public List<SearchRankResponse> bringSearchRanks() {
            List<SearchRank> searchRanks = findSearchRanks();
            return SearchRankResponse.listOf(searchRanks);
        }
    
        @CacheEvict(value = SEARCH_RANKS_CACHE_VALUE, key = "'SearchRanksKey'")
        public void removeSearchRanksCache() {
            log.info("cleared cache for search rankings request");
        }
    	
    		// ...
    }
    ```

<br/>

## 마무리

- Spring Cache에 대해 대략적으로 알아보았다. Spring에서 제공하는 이러한 추상화 기술(PSA)을 통해 트랜잭션을 사용하는 것과 마찬가지로 간단하게 캐싱을 적용할 수가 있었다.
- 위에서 설명한 것보다 더 많은 애노테이션 속성이 존재하기 때문에 필요한 경우 공식 문서를 참고하는 것이 좋을 듯 하다.
- 프로젝트에서 사용한 캐싱 전략 및 설정, 코드에 대한 설명은 다음 포스트에 적도록 하겠다.

<br/>

## 참고

- [https://docs.spring.io/spring-framework/docs/4.3.x/spring-framework-reference/html/cache.html](https://docs.spring.io/spring-framework/docs/4.3.x/spring-framework-reference/html/cache.html)
- [https://12bme.tistory.com/550](https://12bme.tistory.com/550)
- [https://sunghs.tistory.com/132](https://sunghs.tistory.com/132)
- [https://jaehun2841.github.io/2018/11/07/2018-10-03-spring-ehcache/#spring-cache-annotation](https://jaehun2841.github.io/2018/11/07/2018-10-03-spring-ehcache/#spring-cache-annotation)