---
title: System.out.println() vs Logger  
date: 2021-12-01  
tags:
- java
- logger
---

보통 로깅을 위해서 System.out.println() 보다는 logback 이나 log4j 같은 로깅 프레임워크를 사용하는 것이 좋다고 한다.

로깅 프레임워크를 사용하면 로깅 레벨을 설정할 수 있다는 점이 좋다고는 알고 있지만 성능상으로도 더 좋다고 하는데 그게 진짜일까?

둘 다 입출력을 위해 i/o 작업이 발생하는데 왜 System.out.println()이 성능상 떨어진다고 할까? 한번 알아보도록 하자.

---

## System.out.println()

- System.out.println 은 정확히 코드를 열어보게 되면
  System이라는 final 클래스에 있는 out이라는 변수명을 가진 PrintStream 객체의 println 이라는 메소드를 뜻한다.

- println이라는 메소드는 오버로딩이 많이 되어있는 메소드인데 보는바와 같이 동기화를 위해 synchronized 키워드를 많이 사용을 하고 라인 단위로 flush를 한다.

![Untitled (25)](https://user-images.githubusercontent.com/62014888/145754156-4426b0ec-dbb9-4acf-a5f5-8d28afa567ef.png)

![Untitled (26)](https://user-images.githubusercontent.com/62014888/145754160-44600f2a-2b96-4a21-ada3-90c3fa2843c6.png)

- 이는 곧 동기화를 위해 오버헤드가 많이 발생한다는 뜻이다.
  즉 작업이 순차적으로 진행되어야 하기에 콘솔에 출력을 완료할 때까지 다음 작업은 block된 상태로 대기하고 있어야한다.

<br/>

## Logger

- logger로 사용되는 다양한 로깅 프레임워크가 존재한다. 기본적으로 SLF4J라는 다양한 로깅 프레임워크들에 대한 공용 인터페이스(Facade)가 존재하고 이들의 구현체인 log4j, logback, log4j2 등의 로깅 프레임워크가 존재한다.
- 예시로 들 것은 logback이며 logger를 사용하여 콘솔에 로그를 출력하기로 했다.
- logback에서는 콘솔에 출력하기 위해 ConsoleAppender를 사용하게 되는데 해당 클래스의 모습이다.

![Untitled (27)](https://user-images.githubusercontent.com/62014888/145754208-5d07a394-f1a4-4aa7-bea1-7dc71fd8aa14.png)

- 근데 뭔가 이상하지 않은가? 해당 클래스의 주석에도 그렇고 공식 문서에도 그렇고 콘솔에 출력하기 위해 기본적으로 System.out을 사용한다고 적혀있다.

![Untitled (28)](https://user-images.githubusercontent.com/62014888/145754215-83bd9002-a633-4b34-bab1-0ccffccb7f1e.png)

- 실제로 ConsoleTarget이라는 enum도 살펴보면 System.out.write를 사용하는 모습을 볼 수 있다.
- 이걸로 보았을 때 ConsoleAppender를 사용하여 콘솔에 로그를 출력한다면 System.out.write를 사용해 똑같이 i/o 작업이 발생한다. 그렇지만 System.out.println() 보다 synchronized 블록을 덜 사용하기에 성능이 좋지 않을까라는 생각이 든다.   
- 다만 직접 Logger를 생성하여 사용하여 출력 코드를 보게되면 synchronized 블록을 여러번 사용하는 코드가 없기에 확실히 성능이 좋을 것으로 추측한다. 그리고 출력해주는 곳에 lock을 쓰고 있기에 thread safe 한 것 같다ㅎㅎ  
  (그런데 테스트를 잘못 한건지 실제로 for문으로 출력 테스트를 해보았을 때 System.out.println() 보다 Logger를 사용한 출력 시간이 더 오래걸렸는데 왜 그런지 의문이다..)
- 또한 Logger를 사용할 때 비동기 로깅을 사용하면 성능이 더 향상된다.
- 특히 파일로 로그를 남길 때 비동기 로깅을 적용시킬 수가 있는데 적용하게 되면 로그 발생과 로그 쓰기를 분리시키기에 로깅 메소드를 호출하는 시점에 i/o 작업이 바로 수행되지 않아 성능이 향상된다.

<br/>

## 그렇다면 언제 무엇을 쓸까?

- 당연히 프로젝트를 진행하는 상황이라면 디버깅을 위해서 또는 로그를 남기기 위해서 logger를 사용해야한다.
- System.out.println()은 사용하긴 편하나 콘솔에만 출력이 가능하고 날짜, 시간을 출력하지 않아 기록을 위한 로그용으로 불편하다.
  또한 출력되는 메시지를 제어할 수 없다.
- logger는 로깅 레벨을 설정하여 필요한 로그만 출력할 수 있다.
  또한 로그 내역을 별도의 파일에 저장할 수 있다. 파일로 저장할 경우 프레임워크에 의해 파일 유지 기간, 용량 등도 설정이 가능하여 자동화된 관리가 가능하다.
  원하는 패턴으로 출력이 되도록 설정할 수도 있다.
- System.out.println()을 사용하여 디버깅하는 습관을 들이게 되면 프로젝트를 진행하다 깜빡하고 코드를 삭제하지 못한 채로 운영 서버 코드로 반영되는 경우도 있고하니 logger를 사용하여 디버깅하는 습관을 들이도록 하자!

<br/>


## 참고

- [https://lob-dev.tistory.com/entry/Logging-slf4j-Logback-Framework](https://lob-dev.tistory.com/entry/Logging-slf4j-Logback-Framework)
- [https://ckddn9496.tistory.com/81?category=428336](https://ckddn9496.tistory.com/81?category=428336)
- [https://stackoverflow.com/questions/31869391/what-is-the-difference-between-java-logger-and-system-out-println](https://stackoverflow.com/questions/31869391/what-is-the-difference-between-java-logger-and-system-out-println)
- [https://www.baeldung.com/java-system-out-println-vs-loggers](https://www.baeldung.com/java-system-out-println-vs-loggers)
- [https://xlffm3.github.io/spring & spring boot/async-logger-performance/](https://xlffm3.github.io/spring%20&%20spring%20boot/async-logger-performance/)