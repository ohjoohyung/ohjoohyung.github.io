---
title: Spring MVC 구조 파악하기  
date: 2021-12-07  
tags:
- spring
- mvc
---

Spring Framework는 자바 기반의 엔터프라이즈 애플리케이션을 위해서 여러가지 기능을 제공한다. 그 중 웹 애플리케이션 구현을 위한 모듈로 Spring Web MVC가 제공되는데 클라이언트가 요청을 하고 Spring Web MVC에 의해 응답을 반환하기 까지 어떠한 흐름으로 진행되는지 구조를 파악해보도록 하자.

기본적으로 DispatcherServlet에 대한 설명은 생략하고 @Controller, @RestController 애노테이션에 따라 흐름이 진행되는 순서를 설명할 것이니 DistpatcherServlet에 대해 알아보려면 이 [포스트](https://www.notion.so/Servlet-Dispatcher-Servlet-2f0ad465b2484bd0ae5f55b83b1a2e65) 를 참고하자.

<br/>

## @Controller

![Untitled (13)](https://user-images.githubusercontent.com/62014888/145709182-5d95c1d7-83bf-419f-ba77-d7f6d13db00b.png)

- 조금 많이 간략화했지만 @Controller 애노테이션을 사용하면서 @RequestMapping을 사용한다면 이런 흐름으로 진행된다.
- HandlerMapping의 경우 기본적으로 5개 정도 있는데 @RequestMapping을 사용할 경우 RequestMappingHandlerMapping을 사용해서 handler를 가져온다.

  ![Untitled (14)](https://user-images.githubusercontent.com/62014888/145709191-9ecac958-3f71-4387-9849-7d602efb8386.png)
  
    - 보는바와 같이 Spring에서 기본적으로 List에 5개의 HandlerMapping을 우선순위에 따라 저장시켜두는데 RequestMappingHandlerMapping이 우선순위가 제일 높은 것을 볼 수 있다.
    - Handler를 가져오면서 Interceptor가 설정되어 있으면 해당하는 url일 경우 Interceptor를 타게 된다.
- HandlerReturnValueHandlerComposite에서 selectHandler 메소드를 통해 적절한  HandlerMethodReturnValueHandler를 반환해주게 된다.
  만약 Controller에 해당하는 메소드가 ModelAndView를 반환해주게 된다면 ModelAndViewReturnValueHandler를 String이라면 ViewNameMethodReturnValueHandler를 반환해주게 된다.

  ![Untitled (15)](https://user-images.githubusercontent.com/62014888/145709203-91a724e8-e95d-4bc1-a1d6-c1c238839ded.png)

    - supportsReturnType이라는 메소드를 사용해 HandlerMethodReturnValueHandler에게 적절한 리턴 타입인지를 물어보게 되는 것이다.
    - ViewNameMethodReturnValueHandler일 경우 View Name을 저장해 DispathcerServlet의 render 메소드에서 ViewResolver를 통해 View 객체로 resolve 시켜준다.

<br/>

## @RestController

![Untitled (16)](https://user-images.githubusercontent.com/62014888/145709213-61394e37-af89-4d24-993c-6d5966d56523.png)

- @RestController도 마찬가지로 같은 흐름으로 진행되나 Return Value를 처리해주는 HandlerMethodReturnValueHandler가 다르다.
- @RestController를 열어보면 @ResponseBody가 포함되어 있는데 이 애노테이션에 의해 RequestResponseBodyMethodProcessor가 선택된다.

  ![Untitled (17)](https://user-images.githubusercontent.com/62014888/145709220-8bfb6125-3838-43a1-96e6-fe635e07ca7c.png)


- RequestResponseBodyMethodProcessor 내부에는 메시지 컨버터를 가지고 있는데 MappingJackson2HttpMessageConverter에 의해 Json으로 변환하여 클라이언트에게 반환하게 된다.
- 코드를 보다보면 HandlerAdapter의 handle 메소드는 ModelAndView를 반환해주게 되던데 RequestResponseBodyMethodProcessor의 경우 메시지 컨버터를 사용하며 ModelAndViewContatiner의 requestHandled 필드를 true로 바꿔주고 이 필드가 true일 경우 ModelAndView를 null로 리턴하게 된다.
  DispatcherServlet에서는 ModelAndView가 null일 경우 이미 렌더링 되어있다고 판단하고 넘어가게 된다.

![Untitled (18)](https://user-images.githubusercontent.com/62014888/145709229-8d7c6353-5731-43a0-b39d-57e8d7cce50c.png)

<br/>

## 마무리

- 예전에도 DispatcherServlet을 파보았지만 이번에 @Controller와 @RestController 애노테이션에 따라 어떻게 진행되는지 조금 더 깊게 파보았다.
- 한번 더 Spring을 정리하게 되는 계기가 되었다.
- 더 자세히 공부하실 분은 Spring 코드를 직접 열어보면서 공부하는 걸 추천드린다.

<br/>

## 참고

- [https://yoon0120.tistory.com/60](https://yoon0120.tistory.com/60)