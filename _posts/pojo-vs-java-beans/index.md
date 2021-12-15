---
title: POJO vs Java Beans  
date: 2021-06-13  
tags:
- java
- spring
---

## POJO (Plain Old Java Object)

POJO는 Plain Old Java Object의 준말로 말 그대로 오래된 방식의 간단한 자바 오브젝트라는 뜻이다.  
Java EE 등의 중량 프레임워크들을 사용하게 되면서 해당 프레임워크에 종속된 "무거운" 객체를 만들게 된 것에 반발해서 사용하게 된 용어로서 2000년 9월 마틴 파울러, 레베카 파슨, 조쉬 맥킨지 등이 처음 사용하기 시작했다.  
과거 EJB, Strust같은 프레임워크는 비즈니스 로직을 구현하기 위한 클래스를 코딩할 때 프레임워크의 특정 인터페이스 등의 상속을 강요하였고, 그 결과 비즈니스 로직을 코딩해야할 시간에 상속을 구현하기 위한 관용적인 코딩 작업을 불필요하게 해야 했었다.  
객체지향의 가장 중요한 개념 중 하나인 느슨한 의존관계를 역행하는 이런 침투적인 프레임워크의 문제점을 강조하기 위해 이 말을 처음 사용하기 시작하였다.  
이 후 POJO는 주로 특정 자바 모델이나 기능, 프레임워크 등을 따르지 않은 자바 오브젝트를 지칭하는 말로 사용되었다. 스프링 프레임워크는 POJO 방식의 프레임워크라고 한다.

<br/>

## Java Beans

Java Beans는 데이터를 표현하기 위한 Java 클래스를 만들 때의 규약이다.  
아래의 규칙을 지킨 Java 클래스는 Java Beans라고 부른다.  
- 모든 클래스의 프로퍼티는 private이며 getter, setter 메서드로 제어한다.
- 인자가 없는 public 생성자가 있어야 한다.
- Serializable 인터페이스를 구현해야 한다.  

Java Beans 규약은 Java EE 프레임워크에서 데이터를 저장할 Java 클래스를 만들 때 제안하는 일종의 규약이다.

<br/>

## POJO == Java Beans?

NO!  
Java Beans는 POJO이다.  
그러나 POJO는 Java Beans가 아니다.  
POJO가 Java Beans보다 더 넓은 개념이다.

<br/>

## Spring에서 사용하는 Bean은?

스프링 빈이란 자바 객체를 뜻한다.  
스프링 컨테이너에서 자바 객체가 만들어 지게 되면 이 객체를 스프링 빈이라고 부르는 것이다.  
스프링 빈과 자바 일반 객체와의 차이점은 없다. 다만 스프링 컨테이너에서 만들어지는 객체를 스프링 빈이라고 부를 뿐이다.  
스프링 빈은 설정 메타데이터(xml, 애노테이션)에 의해 생성이 된다.

<br/>

## 아무 객체나 Bean 등록을 해도 될까?

NO!  
스프링 빈은 근본적으로 쓰레드 세이프하지 않다.  
왜?  
일단 그렇게 만들어져있지도 않을 뿐더러 빈 등록을 한다는 것은 싱글톤으로 관리를 한다는 뜻이다.  
객체 인스턴스를 하나만 생성해서 공유하는  싱글톤 방식은 여러 클라이언트가 하나의 같은 객체 인스턴스를 공유하기 때문에 싱글톤 객체는 상태를 유지(stateful)하게 설계하면 안된다.  
즉, 무상태(stateless)로 설계해야 한다.
- 특정 클라이언트에 의존적인 필드가 있으면 안된다.
- 특정 클라이언트가 값은 변경할 수 있는 필드가 있으면 안된다.
- 가급적 읽기만 가능해야 한다.
- 필드 대신에 자바에서 공유되지 않는 지역변수, 파라미터, ThreadLocal 등을 사용해야 한다.

스프링 필드에 공유 값을 설정하면 정말 큰 장애가 발생할 수 있다.

<br/>

## 참고

- [https://www.hanumoka.net/2019/01/06/java-20190106-java-pojo-vs-bean/](https://www.hanumoka.net/2019/01/06/java-20190106-java-pojo-vs-bean/)
- [https://ko.wikipedia.org/wiki/Plain_Old_Java_Object](https://ko.wikipedia.org/wiki/Plain_Old_Java_Object)
- [https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-introduction](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-introduction)
- [https://endorphin0710.tistory.com/93](https://endorphin0710.tistory.com/93)
- 김영한님 스프링 core 수업