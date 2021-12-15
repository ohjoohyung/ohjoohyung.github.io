---
title: Servlet, DispatcherServlet 살펴보기
date: 2021-06-10  
tags:
- java
- spring
---
## Servlet

- 컨테이너는 서블릿을 실행하고 관리한다.
- 컨테이너가 주는 혜택
    - 통신(커뮤니케이션) 지원
        - 컨테이너는 서블릿과 웹 서버가 서로 통신할 수 있는 손쉬운 방법을 제공.
        - 서버와 대화하기 위해 개발자가 직접 ServcerSocket을 만들고, 특정 포트에 리스닝하고, 연결요청이 들어오면 스트림을 생성하는 등 이런 복잡한 일련의 일을 할 필요가 없다.
        - 컨테이너는 어떻게 웹 서버와 통신해야 하는지 잘 알고 있으며, 이런 통신 기능을 API로 제공.
        - 고로 개발자가 신경 쓸 부분은 서블릿이 구현해야할 비즈니스 로직에만 집중하면 됨.
    - 생명주기(라이프사이클) 관리
        - 컨테이너는 서블릿의 탄생과 죽음을 관리함.
        - 서블릿 클래스를 로딩하여 인스턴스화하고, 초기화 메서드를 호출하고, 요청이 들어오면 적절한 서블릿 메서드를 호출하는 작업을 컨테이너가 함.
        - 서블릿이 생명을 다한 순간에는 적절하게 가비지 컬렉션을 진행함.
    - 멀티스레딩 지원
        - 컨테이너는 요청이 들어올 때마다 새로운 자바 스레드를 하나 만듦.
        - 클라이언트의 요청에 따라 적절한 HTTP 서비스 메서드를 실행하면 그걸로 스레딩 작업은 끝이 남.
    - 선언적인 보안 관리
        - 컨테이너를 사용하면, 보안에 관련된 내용을 서블릿 또는 자바 클래스 코드 안에 하드코딩할 필요가 없다.
- 컨테이너는 서블릿 하나에 대한 다수의 요청을 처리하기 위하여 다수의 스레드를 실행하지 다수의 인스턴스를 만들지는 않는다.

<br/>

## Dispatcher Servlet

- 기존의 Servlet 방식은 요청 url 당 Servlet을 생성하고 그에 맞는 Controller에게 요청을 보내주는 코드를 각각 다 따로 작성해야 했다.
- 그러다보니 수많은 Servlet과 Controller를 만들어야하는 일이 발생했다.
- Spring에서는 Front Controller 패턴을 취하는 Servlet을 미리 만들어 두었다. 그것이 바로 Dispatcher Servlet!
    - 즉, 모든 요청을 한 곳에서 받아서 필요한 처리를 한 뒤, 요청에 맞는 handler로 요청을 dispatch하고, 해당 handler의 실행 결과를 http response 형태로 만드는 역할을 한다.
- 참고로 Front Controller 패턴을 적용하면 하나의 Servlet에서 모든 요청을 받아들여 적절한 Controller로 요청을 위임해준다.

![Untitled (47)](https://user-images.githubusercontent.com/62014888/145956098-0dcf31f3-3a70-435f-bfdd-90753e0de378.png)

- 그림과 같이 dispatcher servlet은 servlet context와 root context가 존재하는데 여기서 말하는 WebApplicationContext는 ApplicationContext를 확장한 WebApplicationContext 인터페이스의 구현체를 말하며 ApplicationContext를 상속받아 사용한다.
- Root WebApplicationContext
    - ContextLoaderListner에 의해 생성되며, 자식 Context에서 Root Context를 참조할 수 있다.
    - 여러 Servlet Context를 서로 공유해야 하는 빈들을 등록하고 설정할 때 사용한다.
    - 주로 Service와 Repository 빈들이 등록됨.
- Servlet WebApplicationContext
    - DispatcherServlet에 의해 생성되며 Root Context에서는 상속 개념이기에 참조가 불가능하다.
    - 해당 Servlet Context에서만 사용이 가능하며, 스프링 Dispatcher Servlet에서 관리하는 독립적인 웹 애플리케이션 형태로 사용한다.
    - 주로 Controller, HandlerMapping 등이 등록됨.

```xml
<listener>
  	<listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
  </listener>
  <context-param>
  	 <param-name>contextConfigLocation</param-name>
  	 <param-value>
  	 	/WEB-INF/spring/root-context.xml
  	 </param-value>
  </context-param>
  
  <servlet>
  	<servlet-name>dispatcher</servlet-name>
  	<servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
  	<init-param>
  		<param-name>contextConfigLocation</param-name>
  		<param-value>/WEB-INF/spring/appServlet/servlet-context.xml</param-value>
  	</init-param>
  </servlet>
  <servlet-mapping>
  	<servlet-name>dispatcher</servlet-name>
  	<url-pattern>*.htm</url-pattern>
  </servlet-mapping>
```

- 예전 스프링 레거시를 보면 web.xml (Deployment Descriptor)에 context를 등록시켜둔다.
- was 구동 시 /WEB-INF 디렉토리에 존재하는 web.xml을 읽어 웹 애플리케이션의 설정을 구성한다.
- 그런데 우테코 미션을 진행하면서 이런 web.xml을 한 번도 본 적이 없다.
- 그 이유는 뭘까?
- 정답은 스프링 부트와 Servlet 3.0에 있다.
- 우선, 스프링 부트는 servlet이 내장되어 있다. 또한 Servlet 3.0부터 자바 소스 설정으로도 context 설정이 가능하다.
- 스프링 부트에서는 spring-boot-starter 모듈에 이미 모든 내장 컨테이너들의 설정을 지원한다. 부트는 서블릿 컨테이너의 라이프 사이클에 연결하는 대신 스프링 설정을 사용하여 부트 자체와 내장된 서블릿 컨테이너를 구동시킨다. 필터 및 서블릿 선언은 스프링 구성으로 서블릿 컨테이너에 등록한다.
    - 즉, 간단하게 말하면 부트로 프로젝트를 만들때 생기는 application 클래스를 보면 @SpringBootApplication이 존재하는데 이 친구에 의해 빈 자동 등록이 된다고 생각하면 된다.
- 그리고 요즘은 굳이 context를 2개로 나누어서 사용하지 않고 root context 하나를 만들어 모든 빈을 등록하여 사용한다고 한다.

![Untitled (48)](https://user-images.githubusercontent.com/62014888/145955885-4fbe43ab-2859-4595-8f04-1d9c86af3041.png)

### Dispatcher Servlet 동작 순서
1. 클라이언트가 was에 접근하면 front controller 역할을 하는 dispatcher servlet이 요청을 가로챔.
2. handler mapping 설정에서 해당 요청을 처리할 controller를 탐색
3. form data 요청이다 그럼 ModelAttributeProcessor가 파라미터를 바인딩함.
   그게 아닌 json 요청이다? RequestResponseBodyMethodProcessor가 MessageConverter을 이용하여 파라미터를 바인딩함. (즉 jackson 라이브러리 사용)
4. 데이터 저장 및 응답 가공
5. 요청을 처리한 뒤, html로 응답할 경우 결과를 출력할 view의 이름, data로 응답할 경우 MessageConverter을 이용하여 json 데이터로 반환,
6. html로 응답한 경우 ViewResolver에서 받은 view 이름(string)으로부터 해당 view를 탐색
7. 탐색한 view 객체를 반환
8. 처리 결과가 포함된 view를 dispatcher servlet에 전달
9. 클라이언트에게 최종 결과 출력

## 궁금한 점
- dispatcher servlet을 여러 개 둔다는게 무슨 말이지?
- dispatcher servlet이 요청을 받아 적절한 처리를 하는 것 아닌가?
- 요즘은 하나의 서블릿에 하나의 컨텍스트로 처리를 하는게 국룰이다라는 글을 보았고 토비 이일민님께서도 하나의 컨텍스트를 사용한다고 했다. 출력해보니 전부 AnnotationConfigServletWebServerApplicationContext 라는 곳에서 모든 빈이 등록되어 있던데 그럼 더이상 계층이 나누어진 컨텍스트는 공부할 필요없이 그냥 넘어가면 되는걸까? 아니면 레거시를 위해 공부하는 것이 좋을까?

## 출처

- [https://velog.io/@gokoy/Spring-동작-순서](https://velog.io/@gokoy/Spring-%EB%8F%99%EC%9E%91-%EC%88%9C%EC%84%9C)
- [https://gompangs.tistory.com/entry/Dispatcher-Servlet](https://gompangs.tistory.com/entry/Dispatcher-Servlet)
- [https://docs.spring.io/spring-framework/docs/3.0.0.RC2/spring-framework-reference/html/ch15s02.html](https://docs.spring.io/spring-framework/docs/3.0.0.RC2/spring-framework-reference/html/ch15s02.html)
- [https://sabarada.tistory.com/16](https://sabarada.tistory.com/16)
- [https://linked2ev.github.io/spring/2019/09/15/Spring-5-서블릿과-스프링에서-Context(컨텍스트)란/](https://linked2ev.github.io/spring/2019/09/15/Spring-5-%EC%84%9C%EB%B8%94%EB%A6%BF%EA%B3%BC-%EC%8A%A4%ED%94%84%EB%A7%81%EC%97%90%EC%84%9C-Context(%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8)%EB%9E%80/)
- [https://jeong-pro.tistory.com/222](https://jeong-pro.tistory.com/222)
- [https://github.com/binghe819/TIL/blob/master/Spring/MVC/DispatcherServlet.md](https://github.com/binghe819/TIL/blob/master/Spring/MVC/DispatcherServlet.md)
- [https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/mvc.html](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/mvc.html)