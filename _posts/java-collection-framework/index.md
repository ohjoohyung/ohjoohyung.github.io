---
title: "[Java] Java Collection Framework를 알아보자 - 1. Collection Interface"  
date: 2021-12-30  
tags:
- java
---

Java를 사용하면 짱짱 많이 쓰게 되는 List, Set, Map.

List는 순서를 보장하고 Set은 순서는 보장하지 않지만 중복을 허용하지 않고 Map은 key, value 쌍으로 이루어져 있고...

요런 기본적인 부분은 알고 있지만 Collection Framework에 대해 조금 더 구체적으로 공부하고 싶어서 찾아서 정리해보았다.

---

# JCF(Java Collections Framework)란?

자료구조(data structure)란 컴퓨터 과학에서 효율적인 접근 및 수정을 가능케 하는 자료의 조직, 관리, 저장을 의미한다. 즉, 데이터 값의 모임, 또는 데이터 간의 관계, 그리고 데이터에 적용할 수 있는 함수나 명령을 의미한다.
프로그래밍 언어는 이러한 자료구조를 제공해주는데 Java에서 제공해주는 자료구조가 바로 JCF(Java Collections Freamework)인 것이다.

JCF를 더 알아보기 전에 도입이 되었던 배경에 대해 이야기 해보자.

JCF는 JDK 1.2버전에 도입되었는데 그 이전에도 물론 Vector, HashTable, Properties와 같은 클래스들이 존재했다. 문제는 이러한 클래스들에는 공통 인터페이스가 없었다. 그래서 모든 클래스들의 주요 목적은 동일하지만 구현은 독립적으로 정의되었으며 서로 상관 관계가 없었다. 즉, 추가, 삭제하는 메서드들 등이 동일한 목적으로 사용되더라도 이름이 다 달랐다. 그러다보니 사용자 입장에서 모든 클래스들에 있는 다양한 메서드, 구문 및 생성자를 모두 기억하는 것은 매우 어려웠다.

그래서 Java 개발자는 이러한 문제를 처리하기 위해 공통 인터페이스를 마련하기로 결정하고 JDK 1.2에서 Collections Framework를 도입된 것이다!

지금의 Vector와 HashTable은 모두 Collections Framework를 준수하도록 수정되었기에 버전을 돌리지 않는 이상 옛날 코드는 볼 수 없다ㅎㅎ;

<br/>

## JCF의 장점

JCF로 인한 장점은 무엇일까?

[Oracle 문서](https://docs.oracle.com/javase/8/docs/technotes/guides/collections/overview.html) 를 보면 다음과 같은 내용이 적혀있다.

- 자료구조와 알고리즘을 제공하여 프로그래밍 노력을 줄여주므로 직접 작성할 필요가 없다.
- 자료구조와 알고리즘의 고성능 구현을 제공하여 성능을 향상시킨다.
- 컬렉션을 주고받는 공통 언어를 설정하여 관련 없는 api간의 상호 운용성을 제공한다.
- api를 배우는데 필요한 노력을 줄여준다.
- api를 디자인하고 구현하는데 필요한 노력을 줄여준다.
- 소프트웨어 재사용을 촉진한다.

상호 운용성, 재사용.. 객체지향의 특징을 최대한 살리려고 한게 느껴진다..

특히 공식 문서에 “Design Goals” 항목을 보게되면 어떤 목표를 가지고 설계했는지를 알 수 있는데 ‘핵심 인터페이스의 메서드 수를 작게 유지하기 위해’라는 문장이 적혀있다. 이는 SOLID 중 ISP를 지켜 만들었다고 해석될 수 있을 것 같다.

<br/>

## 왜 Library가 아니고 Framework일까..?

Framework과 Library의 차이점을 알고 나서부터 Java Collections Framework는 왜 Framework라고 부를까? 에 대한 의문이 있었다.

제어를 개발자가 해주고 원하는 시점에 가져다 쓰는 것이면 라이브러리, 제어가 역전되어 전체적인 흐름을 스스로 가지고 있으면 프레임워크로 알고 있는데 그렇다면 JCF는 개발자가 필요에 따라 가져다 쓰는 것이니 라이브러리가 아닌가? 라고 생각했다.

검색을 해보니 실제로 이렇게 [생각한 글](https://www.quora.com/Why-is-Collection-in-Java-called-a-framework-but-not-a-library-It-seems-counter-intuitive-to-the-definition-of-a-framework-which-follows-the-Dont-call-us-well-call-you-principle) 이 몇 개 있었다. 이 글에서는 기술적으로 말하면 JCF는 라이브러리처럼 작동하지만 공통 통합 아키텍처, 다른 API와의 통합 및 재사용성과 같은 프레임워크의 특징으로 인해 프레임워크라 부른다고 적혀있다. 라이브러리라기에는 규모가 방대하며 특정한 뼈대에 맞게 사용을 해야한다는 특징때문에 프레임워크라 부르는건가 생각하고 넘어가기로 했다.

<br/>

# Collection Interface

![img (1)](https://user-images.githubusercontent.com/62014888/148177929-fa6e7413-a8f7-49d6-822a-7b5fa6ee21c3.png)

<br/>

## List

List Interface는 선형 자료구조로 순서가 있는 데이터 목록을 이용할 수 있도록 만든 인터페이스이다. 이 인터페이스의 사용자는 목록에서 각 요소가 삽입되는 위치를 정밀하게 제어할 수 있다. 즉, 배열에서 사용하듯 인덱스를 이용해 데이터의 접근이 가능하다는 뜻이다. 또한 데이터의 중복을 허용한다.

List Interface의 구현체는 다음과 있다.

1) ArrayList
    - 특징
  
      ArrayList의 내부를 살펴보게 되면 Object[] 라는 배열로 이루어져 있다.
    
        ![Untitled - 2022-01-05T163312 342](https://user-images.githubusercontent.com/62014888/148178040-826e7117-27fc-4c6a-8032-2186af99b5b0.png)
      배열의 크기는 default가 10이고 add 메서드를 통해 데이터가 삽입될 때 배열이 꽉 차면 Arrays.copyOf를 통해 새롭게 배열을 생성하게 된다.
      이때 배열의 증가되는 크기는 기존 용량 + 기존 용량/ 2 (우측 쉬프트 연산자) 가 된다.
    
        ![Untitled - 2022-01-05T163314 629](https://user-images.githubusercontent.com/62014888/148178049-77f77124-714c-43c6-b05f-5539ef96fb1d.png)
  
    - 시간 복잡도
    
      ArrayList는 중간 인덱스에서 삽입, 삭제가 일어난다면 뒤에 있는 요소들을 전부 옮겨주는 작업을 해주어야 한다. 그러다보니 최악의 경우 시간 복잡도는 O(N)이다.
    
      조회의 경우 인덱스를 알고 있어 이를 통해 데이터 주소를 구할 수 있으므로 O(1)이 된다.

<br/>

2) LinkedList

    - 특징
    
      LinkedList는 데이터(item)와 주소(prev, next)로 이루어진 클래스를 만들어 서로 연결하는 방식이다. 이 클래스를 Node라고 하는데 각 노드에는 이전 노드, 다음 노드 객체를 필드로 가지고 있다.
    
        ![Untitled - 2022-01-05T163317 163](https://user-images.githubusercontent.com/62014888/148178062-2dff36e8-9651-4f9c-b1f4-d6eaf1686632.png)
    - 시간 복잡도
    
      LinkedList의 삽입, 삭제는 각 노드의 참조만 변경시켜주면 되므로 O(1)이다. 여담이지만 중간에 삽입이나 삭제하면 데이터를 찾기까지 O(N)이 걸리므로 삽입, 삭제도 최악에는 O(N) 아냐? 라고 생각했는데 [조회하는 건 별도의 작업으로 간주한단다](https://stackoverflow.com/questions/840648/why-is-inserting-in-the-middle-of-a-linked-list-o1) ㅎㅎ
    
      조회는 위에서 말한 것처럼 해당 데이터를 찾기위해 연결된 노드를 계속 방문해야 하므로 O(N)이다.

<br/>

3) Vector (+ Vector를 상속받은 Stack)

    - Vector 특징
    
      Vector는 1.2 버전 이전의 컬렉션 클래스다. 간단하게 말하면 1.2 이전의 ArrayList라고 할 수 있겠다. JCF가 도입되면서 기존의 호환성을 위해 남겨두었고 List Interface를 구현하도록 되어있다. 그렇다면 지금도 쓸 수 있다는 뜻인데 왜 Vector를 거의 본 적이 없는걸까?
    
      그 이유는 동기화 보장에 있다. Vector를 보게되면 멀티 스레드 환경에서 동기화를 보장하기 위해 synchronized 키워드가 메서드 이곳저곳 있는 것을 볼 수 있다. 이는 멀티 스레드에서는 안전할 지라도 싱글 스레드 환경에서는 성능이 떨어지기 때문에 ArrayList를 많이 사용하는 것이다.
    
      그렇다면 멀티 스레드 환경에서는 정말 Vector를 쓸까..? 그건 또 아닌 것 같다. 앞서 말했듯 Vector는 메서드 이곳저곳에 synchronized가 있는데 거의 모든 메서드라고 봐도 무방할 정도로 많이 있다. 그래서 오버헤드도 많이 발생하기 때문에 Collections.synchronizedList()를 사용해 동기화 보장을 해주는 것이 좋다.
    
        ```java
        List<String> list = Collections.synchronizedList(new ArrayList<>());
        ```
    
      조금 더 자세히 살펴보자면 Vector의 메서드는 메서드 레벨에 synchronized 키워드가 있고 SynchronizedList에는 메서드 안에 synchronized 블록이 있는 것을 볼 수 있다. 무슨 차이가 있는지 후에 멀티 스레드를 좀 더 공부하면서 정리해봐야겠다.
    
    
    - Stack 특징
    
      Stack은 흔히 알고 있는 LIFO 특징을 가진 자료구조다. 문제는 Vector를 상속해서 구현했기에 Vector의 단점을 모두 가지고 있다. 그래서 자바에서 친절하게 Stack이 아닌 Deque를 사용해라고 문서에 적혀있다.
    
        ![Untitled - 2022-01-05T163320 407](https://user-images.githubusercontent.com/62014888/148178069-b3de709e-2fed-421d-b632-57e3fd4dc2dd.png)

<br/>

## Set

<br/>

## Queue