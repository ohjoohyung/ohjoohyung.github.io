---
title: 로깅이 성능에 미치는 영향과 비동기 로깅  
date: 2021-10-02  
tags:
- spring
- logback
---

## 프로젝트 로깅 문제

- 현재 보또보 프로젝트에서는 로깅을 위해 Logback을 사용하고 있다.
- 기본적으로 스프링에서 생기는 로그 + HTTP 요청 응답 로그 + JPA로 생기는 쿼리와 바인딩 데이터 로그를 남기기로 했다.
- Local, Test 환경에서는 콘솔에 로그를 출력시키기만 했고 Dev, Prod 환경에서는 INFO, WARN, ERROR 로그, HTTP 요청 응답 로그, 쿼리 + 바인딩 데이터 로그를 파일로 남기기로 했다.
    - 더 자세한 것은 [보또보 위키](https://github.com/woowacourse-teams/2021-botobo/wiki/로깅-전략) 를 참고하자!  

- 문제는 쿼리 + 바인딩 데이터 로그에서 시작되었다.
- 다양한 문제집 보기라는 보또보 사이트에서 제공해주는 기능이 있다.
  이 기능은 사이트 내 등록이 되어있는 문제집 중 랜덤으로 100개를 제공해주는 기능이다.
- 100개의 문제집을 조회하기 위해서는 하나의 조회문에서 파생되는 여러 조회문이 있었고 (한방 쿼리를 사용하기에는 연관관계가 너무 많고 N+1 문제를 해결하기 위해 Batch Size를 설정했다) 그러다보니 쿼리문 + 바인딩된 데이터 로그가 정말 많이 발생하게 되었다.

그 결과 한번 서비스를 접근해서 100개의 문제집을 제공 받기까지 사용자 입장에서 시간이 너무 오래걸렸다.
- 일단 Prod 서버에는 쿼리 + 바인딩 데이터 로그를 남기지 않기기로 했다.
  우리가 이 로그를 남기기로 했는 이유는 최대한 로그를 많이 남기는게 에러를 추적하기 용이하다 + 한번 로그를 다 남겨보자 였다.
  검색해보니 이 로그는 보통 테스트하는 환경에서 남기고 실제 운영 서버에서는 남기지 않는 경우가 많다기에 Prod 서버에서는 남기지 않기로 하였고 그 결과 로딩 시간이 단축되는 현상을 볼 수 있었다.

하지만 여전히 Dev 서버에는 로그를 남기고 있었기에 어떻게 하면 로그를 남기면서 성능을 향상시킬 수 있을까 고민했다.

## 비동기 로깅

- 현재 Logback에서 로그를 동기로 남기고 있었고 비동기로 남기면 성능이 향상될 수 있다는 이야기를 들었고 이에 비동기로 로깅을 변경해보기로 했다.

```xml
<included>
    <property name="QUERY_LOG_PATH" value="logs/query"/>
    <property name="QUERY_LOG_FILE_NAME" value="query"/>

    <appender name="QUERY_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>TRACE</level>
        </filter>

        <encoder>
            <pattern>
                %d{yyyy-MM-dd HH:mm:ss} %n    > %msg%n
            </pattern>
        </encoder>

        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>${QUERY_LOG_PATH}/${QUERY_LOG_FILE_NAME}.%d{yyyy-MM-dd}_%i.log</fileNamePattern>
            <maxFileSize>3MB</maxFileSize>
            <maxHistory>100</maxHistory>
        </rollingPolicy>
    </appender>

		// AsyncAppender 설정
    <appender name="QUERY_FILE_ASYNC" class="ch.qos.logback.classic.AsyncAppender">
        <appender-ref ref="QUERY_FILE" />
        <queueSize>512</queueSize>
        <discardingThreshold>0</discardingThreshold>
        <includeCallerData>false</includeCallerData>
        <neverBlock>true</neverBlock>
        <maxFlushTime>1000</maxFlushTime>
    </appender>

    <logger name="org.hibernate.SQL" level="DEBUG" additivity="false">
        <appender-ref ref="QUERY_FILE_ASYNC"/>
    </logger>
    <logger name="org.hibernate.type.descriptor.sql.BasicBinder" level="TRACE" additivity="false">
        <appender-ref ref="QUERY_FILE_ASYNC"/>
    </logger>
    <logger name="org.hibernate.type.descriptor.sql.BasicExtractor" level="TRACE" additivity="false">
        <appender-ref ref="QUERY_FILE_ASYNC"/>
    </logger>

</included>
```

- 적용 방법은 생각보다 간단했다.
    - 파일로 남기는 설정인 RollingFileAppender를 AsyncAppender로 감싸기만 하면 되었다.

- 각각의 AsyncAppender 설정 옵션은 이렇다.
    1. queueSize
        - async로 동작하기 위해서는 log들을 BlockingQueue를 이용해 버퍼에 저장해 둔다. 버퍼에 저장해두는 queue의 사이즈를 의미하며 해당 queue 사이즈의 80%가 초과하게 되면 WARN, ERROR를 제외하고 drop한다. 따라서 적절한 queueSize를 사용해야 하며 default는 256이다.
          밑에 사이트를 바탕으로 512로 설정하였다.

            ![Untitled - 2021-12-18T135152 434](https://user-images.githubusercontent.com/62014888/146629449-4622b679-2300-4e54-b6e1-59e1633bf6e7.png)

            - [https://dzone.com/articles/how-instantly-improve-your-0](https://dzone.com/articles/how-instantly-improve-your-0)
    2. discardingThreshold
        - 기본적으로 blocking queue에 20% 용량이 남아 있으면 TRACE, DEBUG 및 INFO 수준의 이벤트를 삭제하고 WARN 및 ERROR 수준의 이벤트만 유지한다. 이 값을 0으로 설정하면 모든 이벤트를 유지한다. default는 20이다.
          INFO 로그를 삭제하고 싶지않아서 0으로 설정했다.
    3. includeCallData
        - 발신자의 정보(class명, 줄번호 등)가 추가되어 수집 서버로 전송여부를 결정한다. true 설정 시 성능 저하를 일으킬 수 있다. default는 false이다. 성능 문제로 인해 false를 권장하지만 false로 설정할 경우에는 class, method, line 수 등을 로그에서 확인할 수 없다. 실제로 false로 설정했을 때 ?.?.? 이런 형식으로 로그가 남는 결과를 볼 수 있었다.
    4. maxFlushTime
        - LoggerContext가 정지하면 AsyncAppender의 stop 메서드는 작업 스레드가 timeout 될 때까지 대기한다. maxFlushTime을 사용하면 timeout 시간을 밀리초로 설정할 수 있다. 해당 시간안에 처리하지 못한 이벤트는 삭제된다. defult는 1000이다.
    5. neverBlock
        - queue에 가득차게 되는 경우 다른 쓰레드의 작업들이 blocking 상태에 빠지게 되는데 해당 옵션을 true하게 되면 blocking 상태에 빠지지 않고 log를 drop하며 계속 진행할 수 있게 해준다. 로그의 버퍼가 꽉 차서 application이 blocking되지 않기 위해 반드시 true를 적용하는 것을 권장한다. default는 false이다.


## 비동기 적용 결과

- 적용하고 성능 테스트를 해보았다.
- 생각보다 결과가 흥미로웠다.
- 성능 테스트 도구로 k6를 사용했다. 설정은 다음과 같다.
    - VUSER는 100명
    - 1분동안 진행
    - 모든 요청의 99% 이상의 소요시간이 1500ms 이내에 들어야 한다.
    - 모든 요청은 다양한 문제집 보기 서비스에 접근하여 100개의 문제집을 조회하도록 하였다.

- 비동기 로깅 적용 전

    ![Screen_Shot_2021-09-29_at_5 51 26_PM (1)](https://user-images.githubusercontent.com/62014888/146629455-3582b1e2-4a26-460a-b855-59c80dfdca25.png)


주목할 점은 http&#95;req&#95;duration, http&#95;req&#95;failed, 
http_reqs이다.

http&#95;req&#95;duration은 평균적으로 한번의 요청당 얼마만큼의 시간이 소요되었는지를 알 수 있는데 평균 31초가 걸렸다고 적혀있다.

http&#95;req&#95;failed는 요청 실패율,
http_reqs는 총 요청 수를 나타낸다.
73.50%의 실패율과 요청 수가 151개로 측정되었다.

- 비동기 로깅 적용 후

    ![Screen_Shot_2021-09-29_at_6 26 02_PM (1)](https://user-images.githubusercontent.com/62014888/146629461-807d2b5d-df69-4bb8-bfc0-55c35f37824a.png)


로깅 전과 비교해보면 확실하게 성능이 좋아졌다는 것을 볼 수 있다.

요청 소요 시간도 평균 4.85초로 줄어들었으며 실패율도 0%, 그에 따라 요청 수도 680개로 이를 모두 처리했다는 결과를 볼 수 있었다.

## 그렇다면 꼭 비동기로 로깅을 해야할까?

- 그렇다면 앞으로 모든 로깅을 비동기로 처리해야할까?
- 일단 이렇게 비동기로 로깅을 처리하게 되면 단점들이 몇 가지 있다고 한다.
    - queueSize를 너무 작게 하는 경우 WARN, ERROR를 제외하고 로그의 손실을 가져올 수 있다.
    - 버퍼를 이용하니 메모리의 사용량이 증가하고 CPU 사용량 또한 증가한다.
    - 중간에 서버가 다운되는 경우 버퍼에 로그가 남아 있으면 버퍼가 로그를 다 쓰기 전에 종료되어 손실이 발생한다.
- 개인적인 생각으로 어느 정도 규모가 있고 로그를 많이 남겨야 하는 서비스에서는 비동기로 로깅을 하지 않을 이유는 없다고 생각한다. 비동기로 로그를 남기는게 성능상 이점을 더 챙겨올 수 있고 로그 손실 이슈에 경우는 설정만 잘 해놓으면 어느 정도 방지할 수도 있으니 말이다.
- 그리고 Logback 비동기를 좀 찾아보니 Log4j2 비동기가 훨씬 더 성능상 좋은거 같았다.
  로깅을 남기면서 성능상의 이점을 더 챙기려면 Log4j2를 가지고 가는 것도 좋은것 같으니 필요하면 찾아보도록 하자.

![Untitled - 2021-12-18T135205 226](https://user-images.githubusercontent.com/62014888/146629463-64520617-fa7d-403c-89de-d421d8f5a663.png)

[https://logging.apache.org/log4j/2.x/performance.html](https://logging.apache.org/log4j/2.x/performance.html)

## 마무리

- 로깅을 비동기로 바꿨을 뿐인데 이렇게 눈에 띄는 성능 차이를 보일 줄은 몰랐다.
- 생각보다 성능 테스트를 하는게 재밌었다.
- 다만 아쉬운점은 테스트용 서버를 따로 구축해서 테스트를 한 것이 아닌 기존 Dev 서버에서 진행했다는 점.
  Redis를 도입하게 될 경우도 생각하면 테스트용 서버를 하나 만들어서 대량의 데이터를 넣어두고 VUSER를 더 높인 테스트를 진행해봐야겠다.