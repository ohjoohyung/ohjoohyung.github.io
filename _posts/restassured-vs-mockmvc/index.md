---
title: RestAssured Test vs MockMvc Test  
date: 2021-06-18  
tags:
- spring
- test
---

## RestAssured Test

- RestAssured는 REST 웹 서비스를 검증하기 위한 라이브러리.
- 대부분 End-to-End or 인수 테스트에서 사용된다.
- @SpringBootTest를 통해 애플리케이션에 등록될 빈을 모두 가져와 실제 요청을 보내서 전체적인 로직을 테스트한다. 실제 요청 시 필요한 다양한 메서드도 존재.

```java
testImplementation 'io.rest-assured:rest-assured:3.3.0'
```

- RestAssured의 경우 직접 의존성을 추가해주어야 한다. gradle을 사용한다면 dependencies에 위의 내용을 추가하면 된다.
- 의존성을 추가한다는 것은 프로젝트가 점점 무거워진다는 뜻이므로 RestAssured를 사용하는 순간이 온다면 왜 사용하는지에 대해 고민할 필요가 있다.

![Untitled (49)](https://user-images.githubusercontent.com/62014888/145994041-5dcde623-477f-490f-bcfc-52484b84e5e6.png)

- RestAssured의 경우 별도의 구성없이 @WebMvcTest를 사용할 수 없다. 즉, 컨트롤러에 대한 단위테스트를 하기 위해서는 spring-mock-mvc 모듈에 있는 RestAssuredMockMvc를 사용해야한다. (따로 의존성을 추가해야함)
- 그래서 @SpringBootTest로 수행해야한다. 다만 이걸로 수행하면 등록된 Spring Bean을 전부 로드하기 때문에 시간이 오래걸린다.

![Untitled (50)](https://user-images.githubusercontent.com/62014888/145994045-8bb45ed4-3733-49c0-b2c3-369561823aaa.png)

- RestAssured는 BDD 스타일로 작성할 수 있어서 가독성이 좋다.
- BDD(Behavior Driven Development)는 TDD를 근간으로 파생된 개발 방법이다.
- 테스트 메서드 이름을 "이 클래스가 어떤 행위를 해야한다(should do something)"라는 식의 문장으로 작성하여 행위에 대한 테스트에 집중할 수 있다.
- 즉, 시나리오를 기반으로 테스트 케이스 작성이 가능함. 비개발자가 봐도 이해할 수 있을 정도의 레벨을 권장하며 Given, When, Then 구조를 가지는 것을 기본 패턴으로 권장한다.
- 또한 RestAssured을 사용할 경우 json data를 더 쉽고 편하게 검증할 수 있다.

<br/>

## MockMvc Test

- MockMvc는 웹 애플리케이션을 애플리케이션 서버에 배포하지 않고도 스프링 MVC의 동작을 재현할 수 있는 라이브러리이며 대부분 Controller Layer Unit Test에 사용된다.
- @WebMvcTest를 통해 Presentation Layer Bean들만 불러온다. 그리고 그 외 Bean은 Mock 객체 설정을 해주어 순수한 Controller 로직을 테스트한다.
- MockMvc는 Spring Framework Test 클래스 중 하나다. 즉 Spring test 의존성이 추가되어 있는 경우 별도의 의존성 추가를 하지 않아도 사용할 수 있다.

![Untitled (51)](https://user-images.githubusercontent.com/62014888/145994048-aef3c277-7b4c-406b-a6bc-d3176bbde926.png)

- @WebMvcTest는 Presentation Layer의 Bean들만 로드하기 때문에 시간이 상대적으로 빠르다. (@Controller, @ControllerAdvice, @JsonComponent, Converter, GenericConverter, Filter, HandlerInterceptor, WebMvcConfigurer, HandlerMethodArgumentResolver 이거만 스캔하도록 제한)
- controllers로 명시해둔건 MemberController만 가져온다는 뜻이다.

![Untitled (52)](https://user-images.githubusercontent.com/62014888/145994054-137de9dd-044a-4329-abf8-8c1e10ca5e3a.png)

- BDD 스타일로 작성한 RestAssured에 비해 쉽게 읽히지는 않는다.
- 또한 RestAssured에 비해 json data 검증도 조금 힘들다.

<br/>

## 참고

- [https://dundung.tistory.com/229](https://dundung.tistory.com/229)
- [https://beomseok95.tistory.com/293](https://beomseok95.tistory.com/293)
- [https://stackoverflow.com/questions/52051570/whats-the-difference-between-mockmvc-restassured-and-testresttemplate](https://stackoverflow.com/questions/52051570/whats-the-difference-between-mockmvc-restassured-and-testresttemplate)
- [https://woowacourse.github.io/javable/post/2020-09-29-compare-mockito-bddmockito/](https://woowacourse.github.io/javable/post/2020-09-29-compare-mockito-bddmockito/)
- [https://cobbybb.tistory.com/16](https://cobbybb.tistory.com/16)
- [https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/test/autoconfigure/web/servlet/WebMvcTest.html](https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/test/autoconfigure/web/servlet/WebMvcTest.html)