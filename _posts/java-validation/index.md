---
title: Java Validation 파헤치기 
date: 2021-06-10  
tags:
- java
- spring
---

## Validation이란?

- Validation이란 유효성 검증을 의미한다.
- 대표적인 예로 String의 값이 null이 되면 안된다던가 Integer의 값이 0보다 커야한다던가 즉, 우테코에서 미션을 진행해오면서 보통 도메인에서 처리했었던 검증을 말한다.
- 그렇다면 왜 Validation이라는 기능이 나오게 되었을까?
- 이 [hibernate validator docs](https://docs.jboss.org/hibernate/validator/5.4/reference/en-US/html_single/#preface) 를 참고하자면

  > 데이터 검증은 애플리케이션의 여러 계층에 전반에 걸쳐 발생하는 흔한 작업이다. 종종 동일한 데이터 검증 로직이 각 계층에 구현되는데 이는 오류를 일으키기 쉽고 시간을 낭비하는 일이다. 이에 개발자는 이러한 중복을 피하기 위해 유효성 검사를 도메인 모델에 직접 번들로 묶어 실제 클레스 자체에 대한 메타 데이터 (데이터를 위한 데이터) 인 유효성 검사 코드로 복잡하게 만든다.
  >

  라고 적혀있다. 즉, 도메인 모델에 유효성 검증 코드가 추가되어 복잡해지다 보니 이를 없애주기 위해 Validation이 나오게 되었다고 할 수 있다.


![Untitled (29)](https://user-images.githubusercontent.com/62014888/145755472-54f036d2-a3a2-4ebf-a349-61266c6d2cb0.png)

![Untitled (30)](https://user-images.githubusercontent.com/62014888/145755474-12a7bec5-370c-4c0e-bdbd-453da2ad765f.png)

<br/>

## Validation 파헤치기

- 자, 그럼 Validation을 사용해보자.
- gradle dependencies에 (maven은 검색으로 해결..ㅎㅎ)

```java
implementation 'org.springframework.boot:spring-boot-starter-validation'
```

이거 하나만 추가하면 validation을 사용할 수 있다.
참고로 spring boot 2.3.0 버전부터 spring-boot-starter-web에 validation이 포함되어 있지 않아 의존성을 따로 추가해주는 것이다.

- 그런데 의문이 들었다.

    ![Untitled (31)](https://user-images.githubusercontent.com/62014888/145755502-7613d8b7-d8a3-493e-af70-99134d0cf814.png)

    분명 spring-boot-starter-validation이라고 적혀있는 것을 추가했는데 왜 import 해오는 것은 javax의 validation인 걸까?

    spring과 관련이 없는 다른 것을 들고 오는걸까?

    그래서 이를 까보기로 했다.

    ![Untitled (32)](https://user-images.githubusercontent.com/62014888/145755503-a11e5b0e-403e-4f29-baf5-bdb5dc5b6b7c.png)

    보니까 hibernate validator가 있는 것이 보인다.

    이게 아마 validation과 관련이 있는 거라고 생각이 들었다.

    그리고 다시 hibernate validator를 찾아보았다.

    > This transitively pulls in the dependency to the Bean Validation API (javax.validation:validation-api:1.1.0.Final).
    >

    위는 공식문서에 적혀있는 내용인데 hibernate validator를 의존성으로 추가하면 Bean Validation API (javax validation)을 전이적으로 가져오게 된다고 적혀있다.

    그렇다면 결국 spring-boot-starter-validation이라는 의존성을 추가하게 되면
    hibernate validator와 bean validation이 추가가 된다는 것이다!

<br/>

## Bean Validation, Hibernate Validator

- 여기서 또 의문이 발생할 것이다.
- 그럼 hibernate validator와 bean validation이 도대체 뭘까?
- 우선 bean validation에 대해 먼저 말해보겠다.

  ![Untitled (33)](https://user-images.githubusercontent.com/62014888/145755544-c3c1be3b-d331-4c01-aeee-99aa46dfed29.png)

  참고로 추가된 라이브러리를 보게되면 jakarta validation이라고 적혀있지만 안에 패키지를 보면 javax라고 되어 있는 것을 알 수 있는데 jakarta는 자바 플랫폼, 자바 EE 등 확장 사양의 집합이다. 그래서 그냥 java라고 생각하면 될 것 같다.
  즉, java에서 만든 bean validation인 것이다.

- bean validation은 Java Bean 유효성 검증을 위한 메타데이터 모델과 api에 대한 정의라고 한다.
  무슨 뜻인지 감이 잘 잡히지 않는다. 하나 하나 살펴보도록 하자.
- 메타데이터는 데이터에 대한 데이터, 즉 어떤 목적을 가지고 만들어진 데이터를 뜻한다.
- 우리가 데이터를 각 계층으로 전달할 때 Java Bean 형태로 보내게 되는데 이 때 데이터 유효성 검증을 위해 사용하게 되는 것이 이 메타데이터를 말하는 것이다. 그렇다면 Java에서 메타데이터를 표현할 수 있는 대표적인 방법은? 바로 애노테이션이다.
- 정리하자면 이렇다.
  Bean Validation은 애노테이션을 이용하여 메타데이터를 정의하고 이를 통해 Java Bean의 유효성을 검증하는 것에 대한 명세인 것이다.
  즉, Bean Validation은 명세일 뿐 동작하는 코드가 아니다. 실제로 라이브러리를 열어보면 인터페이스, 애노테이션 등만 포함되면 구현 코드는 없다.
  그렇다면 이를 동작하도록 만드는 구현 코드가 필요하다.
- 그게 바로 hibernate validator인 것이다!
  hibernate validator는 참조 구현이며 현재 JSR-380의 유일한 인증 구현이라고 한다.
  참고로 지금까지 명세서(Specification)은 발전해서 2.0까지 나왔고 Bean Validation 2.0을 JSR 380이라고 부른다.
  여기서 hibernate를 우리가 ORM으로 알고 있는 hibernate와 헷갈려 하지말자 (아 물론 같은 회사다)

<br/>

## Validation 예외처리

- 계속해서 Validation을 보다보니 궁금해졌다.
- 우리가 직접 Validation Annotation과 validator를 만들어 사용하거나 또는 기존에 있던 annotation의 validator를 사용해 검증을 할 것인데 이 때 어디서 validate를 할까?
- validation을 사용하는 법은 다들 알 것이다.
- validation을 원하는 DTO(Java Bean)의 필드 or 클래스에 @NotNull, @Positive 등의 annotation을 명시 해주고 이 DTO를 바인딩 해주는 컨트롤러의 메서드 인자 앞에 @Valid라는 annotation을 걸어주기만 하면 된다.
- 어떨까? 뭔가 DTO를 바인딩 해줄 때 validate를 해줄 것 같지 않은가?
  결론부터 이야기하자면 맞다. DTO를 바인딩할 때 validate를 해준다.
- 그렇다면 DTO를 바인딩해주는 녀석들부터 이야기해보자.
- 이번에 찾아보면서 알게된게 @RequestParam, @PathVariable, @RequestBody, @ModelAttribute 등의 컨트롤러에서 인자를 바인딩해줄 때 사용하는 애들은 전부 HandlerMethodArgumentResolver을 상속받은 클래스에서 처리를 해준다는 것이다.
    - 즉, 리졸버를 사용해서 컨트롤러 메서드의 인자를 바인딩 해주는 것이다!
- 그렇다면 DTO를 바인딩해주는 annotation은?
  @ModelAttribute와 @RequestBody가 있다.
1. @ModelAttribute는 Form data를 바인딩해줄 때 사용하는 것으로 ModelAttributeProcessor에서 이를 바인딩해주고 validate도 해준다.
    - 이 때 예외는 BindException으로 처리를 해준다.
2. 다음으로 @RequestBody인데 주로 json을 바인딩 하다보니 이번에 Rest api를 구현하며 많이 사용을 하였기에 이녀석을 조금 더 자세히 살펴보도록 하자.
    - @RequestBody는 RequestResponseBodyMethodProcessor에서 바인딩을 해주고 validate를 해주는데 이곳에서 WebDataBinder를 만들고 validateIfApplicable 이라는 메서드를 이용해 validate를 해준다.

  ![Untitled (34)](https://user-images.githubusercontent.com/62014888/145755588-c8dff529-21ab-4474-8df6-ab640c28a76f.png)

 validateIfApplicable을 보면 이런 모습.
 참고로 validateIfApplicable 구현 메서드는 AbstractMessageConverterMethodArgumentResolver에 있다. 이를 상속하는 것이 RequestResponseBodyMethodProcessor다.


![Untitled (35)](https://user-images.githubusercontent.com/62014888/145755591-8bb7059e-7bae-4eac-b9e6-d441459dc616.png)

다음으로 binder.validate(validationHints);를 살펴보면 이렇다.



![Untitled (36)](https://user-images.githubusercontent.com/62014888/145755594-04f1b754-6e0b-48e4-be56-87a742674ba7.png)

DataBinder 내부를 보면 validator를 가지고 있고 이 validator의 validate를 실행해주는 모습을 볼 수 있다. 그 후 validate를 더 파고 들어가보았는데 실제로는 SmartValidator, javax.validation.Validator를 구현하고 있는 SpringValidatorAdapter라는 곳의 validate 였다.

이 메서드 안에 있는 processConstraintViolations라는 메서드의 인자를 보면 우리가 만든 validator 또는 기존 validator를 이용해 validate를 해주는 모습이 보인다.

그리고 그 밑에 processConstraintViolations의 인자를 보니 Set<ConstratintViolation<Object>> violations라고 적혀있다.

즉, validator를 이용해 validate를 하고 난 결과, violation(위반)이 있을 때 이를 BindingResult에 추가한다.

![Untitled (37)](https://user-images.githubusercontent.com/62014888/145755660-330102a9-62e1-46c6-b971-4950a3123dfe.png)

![Untitled (38)](https://user-images.githubusercontent.com/62014888/145755667-74bfd7fd-7a86-4634-88fa-010b2e4b15c1.png)

그래서 결국 validation이 모두 진행된 BindingResult가 생길 것이고 이를 다시 한번 MethodArgumentNotValidException으로 감싸서 던져주는 것이다.

참고로 저 this.targetValidator.validate를 끝까지 가본 결과 a single constraint annotation의 경우 ConstraintTree 라는 클래스에서 validator의 isValid라는 메서드를 사용하고 있었다.

![Untitled (39)](https://user-images.githubusercontent.com/62014888/145755671-99d99b4f-ef51-4081-9f77-8c3626c70ca5.png)

그리고 이 validateSingleConstraint라는 메서드를 사용하는 곳이 이를 상속하고 있는 SimpleConstraintTree라는 클래스인데 이곳에서 isPresent()를 통해 검증에서 실패했을 경우 위반과 관련된 내용이 담긴 violatedConstraintValidatorContexts에 추가가 되는 것 같다.

![Untitled (40)](https://user-images.githubusercontent.com/62014888/145755674-c4f0cc60-7a91-4740-99f6-5299169036bc.png)

정리해보자면 RequestResponseBodyMethodProcessor에서 WebDataBinder를 만들고 validateIfApplicable 메서드를 이용해 @Valid가 있을 경우 validate를 해주는데 이때 유효성 검증 실패 즉, 검증에 위반되는 결과가 있을 경우 WebDataBinder에 error가 추가되고 이 binder의 결과를 MethodArgumentNotValidException로 감싸져서 예외가 던져지는 것이다.

많이 복잡하다보니 정확하게 이해하지 못하거나 잘못된 내용이 있을 수도 있다..ㅜ.ㅜ
더 궁금하다면 직접 파고 들어가보는 것도 좋을 것 같다..!!

<br/>

## 그렇다면 왜 @Valid는 Controller에서만 보일까?

- 이는 validation에 대해 계속 찾아보다가 느낀 점 + 스택오버플로우의 글을 통해서 정리할 수가 있는데 위에서 적혀있듯이 @Valid라는 annotation은 @RequestBody나 @ModelAttribute와 같은 annotation이 리졸버를 이용해 DTO를 바인딩해줄 때 사용이 된다.
- 그러다보니 단순하게 다른 계층에서 @Valid를 명시하게 되면 이를 보고 작동을 시켜줄 객체가 없는 것이다.
- 그래서 만약 service에서 사용하고 싶다? 그러면 직접 aop를 이용해 동작시키던가(스택오버플로우 답변) 아니면 다른 예제를 보니 validator를 호출하여 직접 validate를 해야한다고 한다.
- 근데 이 작업은 굳이..? 라는 생각이 드니 입력을 했을 때의 유효성 검증은 controller에서 validation을 이용해 처리해주고 중복 체크와 같은 유효성 검증은 service에서 처리해주면 좋지 않을까 싶다.


<br/>

##참고

- [https://www.popit.kr/javabean-validation과-hibernate-validator-그리고-spring-boot/](https://www.popit.kr/javabean-validation%EA%B3%BC-hibernate-validator-%EA%B7%B8%EB%A6%AC%EA%B3%A0-spring-boot/)
- [https://jcp.org/en/jsr/detail?id=303](https://jcp.org/en/jsr/detail?id=303)
- [https://meetup.toast.com/posts/223](https://meetup.toast.com/posts/223)
- [https://kapentaz.github.io/java/Java-Bean-Validation-제대로-알고-쓰자/#](https://kapentaz.github.io/java/Java-Bean-Validation-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EC%95%8C%EA%B3%A0-%EC%93%B0%EC%9E%90/#)
- [https://docs.jboss.org/hibernate/stable/validator/reference/en-US/html_single/](https://docs.jboss.org/hibernate/stable/validator/reference/en-US/html_single/)
- [https://stackoverflow.com/questions/19425221/spring-validated-in-service-layer](https://stackoverflow.com/questions/19425221/spring-validated-in-service-layer)