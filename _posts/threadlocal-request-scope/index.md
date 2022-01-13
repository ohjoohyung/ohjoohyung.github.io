---
title: ThreadLocal과 Request Scope  
date: 2022-01-12  
tags:
- java
- spring
---

## ThreadLocal?

김영한님의 [스프링 고급편](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%ED%95%B5%EC%8B%AC-%EC%9B%90%EB%A6%AC-%EA%B3%A0%EA%B8%89%ED%8E%B8/dashboard) 을 
들으면 ThreadLocal에 대한 내용이 나온다.   
ThreadLocal이 나오게 된 이유는 다음과 같다.
```java
@Slf4j
public class FieldLogTrace implements LogTrace {

    private static final String START_PREFIX = "-->";
    private static final String COMPLETE_PREFIX = "<--";
    private static final String EX_PREFIX = "<X-";

    private TraceId traceIdHolder; //traceId 동기화, 동시성 이슈 발생

    @Override
    public TraceStatus begin(String message) {
        syncTraceId();
        TraceId traceId = traceIdHolder;
        Long startTimeMs = System.currentTimeMillis();
        log.info("[{}] {}{}", traceId.getId(), addSpace(START_PREFIX,
                traceId.getLevel()), message);
        return new TraceStatus(traceId, startTimeMs, message);
    }

    private void syncTraceId() {
        if (traceIdHolder == null) {
            traceIdHolder = new TraceId();
        } else {
            traceIdHolder = traceIdHolder.createNextId();
        }
    }
    
    // ...
}
```

LogTrace를 사용해 원하는 부분에 로그를 출력할 수 있게 만들었다.  
이때 FieldLogTrace 내부에 있는 TraceId에 의해서 로그 id, 출력 depth가 결정된다.
![image](https://user-images.githubusercontent.com/62014888/149298246-3f595189-f9eb-4048-8bf1-aadab9904041.png)

그런데 상태가 변하는 값이다 보니 싱글 스레드에서는 문제 없으나 요청이 많이 발생하는 멀티 스레드 환경에서는 다음과 같이 원치않는 로그가 찍히게 된다.
![image](https://user-images.githubusercontent.com/62014888/149298465-8b51d708-0f81-492c-8336-d77981037c89.png)

이를 위해 스레드마다 고유한 값을 가지기 위해 등장하는 것이 ThreadLocal이다. 
ThreadLocal은 동일한 스레드에서만 접근할 수 있는 특별한 저장소를 뜻한다.     
내부를 살펴보게 되면 ThreadLocalMap이 존재하게 되는데 이 Map을 각 스레드가 가지고 있게 된다. 그래서 set을 하게 될 때 
이 Map에 현재 ThreadLocal을 key로 두고 입력받은 값을 value로 저장하는 것이다.
![image](https://user-images.githubusercontent.com/62014888/149313990-fddea7b4-c2b5-4e53-bde5-91a76c9169ac.png)

ThreadLocal로 변경한 코드는 다음과 같다.
```java
@Slf4j
public class ThreadLocalLogTrace implements LogTrace {

    private static final String START_PREFIX = "-->";
    private static final String COMPLETE_PREFIX = "<--";
    private static final String EX_PREFIX = "<X-";
    
    private ThreadLocal<TraceId> traceIdHolder = new ThreadLocal<>();


    @Override
    public TraceStatus begin(String message) {
        syncTraceId();
        TraceId traceId = traceIdHolder.get();
        Long startTimeMs = System.currentTimeMillis();
        log.info("[{}] {}{}", traceId.getId(), addSpace(START_PREFIX,
                traceId.getLevel()), message);
        return new TraceStatus(traceId, startTimeMs, message);
    }

    private void syncTraceId() {
        TraceId traceId = traceIdHolder.get();
        if (traceId == null) {
            traceIdHolder.set(new TraceId());
        } else {
            traceIdHolder.set(traceId.createNextId());
        }
    }
    
    // ...
}
```
그리고 로그를 출력해보면 다수의 요청이 오더라도 원하는 결과값이 나오는 것을 확인할 수 있다.
![image](https://user-images.githubusercontent.com/62014888/149314438-efae6baf-05c7-45ac-b5d6-e31b4158544f.png)


<br/>

## Request Scope?

그런데 생각해보니 이 LogTrace는 Spring 빈으로 등록해서 사용한다. 그리고 변경할 수 있는 상태 값을 가지며 요청마다 이용된다. 
그렇다면 빈 스코프를 request로 설정하여 동일한 요청에서만 생성하고 소멸시키면 동일하게 문제를 해결할 수 있지 않을까?

```java
@Configuration
public class LogTraceConfig {

    @Bean
    @Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)
    public LogTrace logTrace() {
        return new ThreadLocalLogTrace();
    }
}
```
ThreadLocal로 되어있던 필드를 원래대로 수정하고 Config 클래스의 @Bean을 다음과 같이 설정했다.
이때 LogTrace를 필드에 두고 사용하기 때문에 proxymode 설정을 해주어야 한다. 그 이유는 런타임때 의존관계를 맺어주게 되는데 스코프를 request로 설정했기에 맺어주는 시점에서 
LogTrace가 존재하지 않아 에러가 터지기 때문이다.
![image](https://user-images.githubusercontent.com/62014888/149315630-d076b9ab-fa14-4280-9af8-45763646268e.png)

그리하여 proxymode를 TARGET_CLASS로 설정하여 프록시 객체를 삽입해주도록 한다.

그리고나서 로그를 출력해보면 다음과 같이 제대로 동작하는 모습을 볼 수 있다.
![image](https://user-images.githubusercontent.com/62014888/149325477-4115c8ed-90c9-4e46-9510-0f09eae2f4fd.png)

<br/>

## 무엇을 사용하는게 좋을까?

그렇다면 실제로 이런 상황이 생길 때 ThreadLocal을 써주는게 좋을까 빈 스코프를 request로 설정하는 것이 좋을까?  
혹시나 관련 글이 있을까 해서 검색을 했더니 역시나 [존재](https://www.facebook.com/groups/springkorea/posts/879493075495656/) 했다. 
[스택오버플로우](https://stackoverflow.com/questions/25406157/spring-request-scope-vs-java-thread-local) 에도 있었다.  
찾아보니 목적에 따라 다를 것 같다.   
request 안에서 여러 개의 스레드가 필요한 환경에서 사용하거나 성능을 좀 더 중요시하면 ThreadLocal, 
관리 포인트를 줄이고 깔끔한 코드를 원한다면 Request Scope를 사용하는 것이 좋아보인다.  
개인적으로는 위와 같은 상황이 생기면 Request Scope를 사용할 것 같다. (물론 실제로 로깅을 위해서라면 AOP를 만들겠지만..) 
물론 둘 다 실제로 써본 적이 없어서 아직까지 제대로 감이 오진 않는당..ㅎㅎ;;


<br/>

## 번외

ThreadLocal의 주의사항으로 저장된 값은 반드시 remove()를 통해 제거해라고 적혀있다.  
제거하지 않으면 한번 스레드가 사용되고 그 후에 동일한 스레드를 사용하게 될 경우 ThreadLocal의 남아있는 값 때문에 예상치 못한 오류가 발생할 수 있기 때문이다.  
물론 위에서 말했듯 스레드에 존재하는 ThreadLocalMap에 저장하기 때문에 당연히 그렇겠다 생각이 들지만 한번 테스트 해보도록 하자.  

```java
public class ThreadLocalTest {

    @Test
    void threadLocalTest() {
        ExecutorService executorService = Executors.newFixedThreadPool(10);
        for (int i = 1; i <= 100; i++) {
            int now = i;
            executorService.execute(() -> {
                Item item = new Item();
                // item.remove();
                System.out.println(item.getItem());
                item.setItem(String.valueOf(now));
            });
        }
    }

    private static class Item {

        private static ThreadLocal<String> threadLocal = new ThreadLocal<>();

        private String getItem() {
            return threadLocal.get();
        }

        private void setItem(String item) {
            threadLocal.set(item);
        }

        private void remove() {
            threadLocal.remove();
        }
    }
}
```
약간 억지스러운 테스트인거 같지만 대충 스레드풀 사이즈를 10으로 잡고 100번 스레드를 실행시키도록 했다.  
그리고 ThreadLocal에서 먼저 값을 꺼내어 출력하고 set을 하였다.  
이렇게 테스트하면 어떻게 될까?  
예상대로라면 10개만 null이 출력되고 나머지는 숫자가 세팅되어 출력될 것이다.

![image](https://user-images.githubusercontent.com/62014888/149331361-acac21b8-793b-4e68-bc5c-bad052073313.png)

예상한 결과대로 출력되었다.  
참고로 remove() 주석을 풀고 실행시키면 세팅된 값이 제거되므로 전부 null로 출력되는 것을 볼 수 있었다.

<br/>

## 참고
- 스프링 코어 고급편, 김영한님 강의
- https://hwannny.tistory.com/95