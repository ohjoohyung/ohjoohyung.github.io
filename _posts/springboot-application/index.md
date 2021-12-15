---
title: "@SpringBootApplication 파헤치기"
date: 2021-06-15  
tags:
- spring
---

## @SpringBootApplication

- 우테코에서 미션을 하며 스프링 부트를 이용해서 웹 애플리케이션을 만들어보았다.
- 스프링은 간단하게 이야기하면 스프링 빈 컨테이너를 만들어 빈 등록을 하고 필요한 객체에게 의존성 주입을 하는 방식으로 애플리케이션이 실행이 된다.
- 근데 미션을 진행하는 동안 컨트롤러 위에 @Controller, 서비스 위에 @Service, DAO 위에 @Repository와 같은 애노테이션만 명시해주었을 뿐이고 따로 컨테이너를 생성하는 작업을 해 준 적이 없는데 어떻게 main 메서드만 실행하면 모든 작업이 이루어지는 것일까?
- 그럼 차근차근 알아보도록 하자.

![Untitled (41)](https://user-images.githubusercontent.com/62014888/145945185-711ac646-32f0-4a0b-ad9c-10bc7dc40bcf.png)

![Untitled (42)](https://user-images.githubusercontent.com/62014888/145945190-c9d881b3-c304-4bb7-a708-504c669fe9ad.png)

- 일단 결론부터 이야기하자면 스프링 부트를 이용해 처음 프로젝트를 만들때 생기는 main 메서드의 run 메서드에 의해 컨테이너가 생기고 설정을 한다.
- 그렇다면 여기서 궁금한 점이 생겼다.
- 바로 위에 있는 @SpringBootApplication은 어떤 기능을 담당하고 있을까?

![Untitled (43)](https://user-images.githubusercontent.com/62014888/145945309-9f7f21e2-2391-422b-98f2-e7725ce305a3.png)

- @SpringBootApplication의 위에 있는 많은 애노테이션이 있다.
- 하나하나 살펴보자면
    - @Target - 애노테이션이 적용할 위치를 결정한다. ElementType.Type는 타입 선언시 적용한다는 뜻이다.
    - @Retention - 애노테이션의 범위라고 할 수 있는데 어떤 시점까지 애노테이션이 영향을 미치는지 결정한다. RetetionPolicy.RUNTIME의 경우 컴파일 이후에도 JVM에 의해서 참조가 가능하다는 뜻이다.
    - @Documented - 문서에도 애노테이션의 정보가 표현된다.
    - @Inherited - 이 애노테이션을 선언하면 자식 클래스가 애노테이션을 상속 받을 수 있다.
    - @SpringBootConfiguration - 스프링 부트의 설정을 나타내는 애노테이션이다. 스프링의 @Configuration을 대체하며 스프링 부트 전용 애노테이션이다. 테스트 애노테이션을 사용할 때 계속 이 애노테이션을 찾기 때문에 스프링 부트에서는 필수 애노테이션이다.
    - @EnableAutoConfiguration - 자동 설정의 핵심 애노테이션이다. 클래스 경로에 지정된 내용을 기반으로 설정 자동화를 수행한다.
    - @ComponentScan - 해당 패키지에서 @Component 애노테이션을 가진 Bean들을 스캔해서 등록한다. (@Configuration, @Repository, @Service, @Controller, @RestController 이 애노테이션들도 다 까보면 @Component가 존재함)

  이러하다.

<br/>

## @ComponentScan, @EnableAutoConfiguration

- 다른 애노테이션보다 설정 관련 중요한 애노테이션은 @SpringBootConfiguration, @ComponentScan, @EnableAutoConfiguration이다.
- @SpringBootConfiguration은 위에 적힌 대로 스프링의 @Configuration을 대체하는 기능을 하므로 넘어가고 나머지 두 애노테이션을 살펴보도록 하자.
- 빈 등록할 때 순서가 존재한다.
  처음에 @ComponentScan으로 등록하고 그 후 @EnableAutoConfiguration으로 추가적인 Bean을 읽어 등록한다.

  1단계: @ComponentScan

  2단계: @EnableAutoConfiguration

  인 셈이다.

- 우선 @ComponentScan이 지정된 클래스의 패키지 밑으로 component scan을 진행한다. @Componet 계열 애노테이션 (@Configuration, @Repository, @Service, @Controller, @RestController)과 @Bean 애노테이션이 붙은 method return 객체를 모두 bean으로 등록한다.
- 다음으로 @EnableAutoConfiguration에 의해서 spring.factories 라는 파일 안에 들어있는 많은 설정들을 읽어 bean이 생성되고 스프링 부트 애플리케이션이 실행되는 것이다.

![Untitled (44)](https://user-images.githubusercontent.com/62014888/145945318-451a5ae7-f2aa-466b-8cf5-5b43c0abdec2.png)

- @EnableAutoConfiguration의 경우 AutoConfigurationImportSelector를 import하고 있는데 이를 통해 spring.factories에 있는 bean들을 선택하고 등록시킬 수 있다.

![Untitled (45)](https://user-images.githubusercontent.com/62014888/145945323-3f9664c3-7266-4d06-a873-81d341ac4ce5.png)

- 그렇다면 spring.factories는 이렇게 되어있는데 여기 있는 모든 bean이 자동 등록될까?
- 그건 아니다.
  ConfigurationClassParser 클래스의 processConfigurationClass() 메서드의 shouldSkip 과정에서 Conditional 애노테이션을 찾아 조건에 부합하는지 확인하고 해당 조건을 충족하는 경우에만 등록을 진행한다고 한다.
- 그리고 우리는 application.properties나 application.yml 파일을 이용해 설정을 하는 경우도 있다. 이때 설정을 하게 되면 spring-configuration-metadata.json 이라는 자동 설정에 사용할 프로퍼티 정의 파일에 작성한 값으로 프로퍼티를 세팅한 후 구현되어 있는 자동 설정에 값을 주입시켜준다.

```java
Caused by: org.springframework.context.ApplicationContextException: Unable to start ServletWebServerApplicationContext due to missing ServletWebServerFactory bean.
```

![Untitled (46)](https://user-images.githubusercontent.com/62014888/145945327-39d2fef0-c548-4211-882d-c8e2c0c40b21.png)

- 참고로 @EnableAutoConfiguration이 있어야 컨테이너에 ServletWebServerFactory bean이 등록이 되어 Web application으로 만들어준다.
- 그래서 @EnableAutoConfiguration이 없다면 위와 같은 오류가 발생하는데 밑과 같이 WebApplicationType.NONE으로 셋팅해주면 정상적으로 실행은 된다.

<br/>

## 마무리

- 스프링 부트의 경우 애노테이션을 통해 자동으로 필요한 빈들을 등록시켜준다는 것을 알게 되었다.
- 이러한 점을 인식하고 사용을 해야 자동 등록 기능을 끄고 수동으로 빈을 등록시켜줘야 할 때 어떤 빈들을 등록을 시켜줘야할지 빠르게 파악할 수 있을 것이다.
    - 대표적인 예로 Repilcation을 하기 위해 직접 Datasource를 설정해줄 때 jpa와 관련해서 어떤 빈을 등록시켜줘야 하는지와 같은 예가 있다.

<br/>

## 참고

- [https://camel-it.tistory.com/26](https://camel-it.tistory.com/26)
- [https://duooo-story.tistory.com/52?category=882088](https://duooo-story.tistory.com/52?category=882088)
- [https://rlawls1991.tistory.com/entry/스프링-부트-원리-자동설정-이해](https://rlawls1991.tistory.com/entry/%EC%8A%A4%ED%94%84%EB%A7%81-%EB%B6%80%ED%8A%B8-%EC%9B%90%EB%A6%AC-%EC%9E%90%EB%8F%99%EC%84%A4%EC%A0%95-%EC%9D%B4%ED%95%B4)
- [https://velog.io/@adam2/SpringBoot-자동-환경-설정AutoConfiguration](https://velog.io/@adam2/SpringBoot-%EC%9E%90%EB%8F%99-%ED%99%98%EA%B2%BD-%EC%84%A4%EC%A0%95AutoConfiguration)
- [https://jdm.kr/blog/216](https://jdm.kr/blog/216)
- [https://www.youtube.com/watch?v=Y11h-NUmNXI](https://www.youtube.com/watch?v=Y11h-NUmNXI)