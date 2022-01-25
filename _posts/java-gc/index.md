---
title: "[Java] Garbage Collection이란?"  
date: 2022-01-24  
tags:
---

## Garbage Collection이 무엇일까?

Garbage Collection(이하, GC)은 메모리 관리 기법 중의 하나로, 프로그램이 동적으로 할당했던 
메모리 영역 중에서 필요없게 된 영역을 해제하는 기능이다.   
많은 현대 언어들이 GC 기법을 사용한다고 하는데 C와 C++은 수동 메모리 관리를 가정하고 설계되었기에 기본으로 제공해주지는 않지만 라이브러리를 통해 사용할 수 있다고 한다. (필자는 C 언어를 접해본 적이 단한번도 없다..ㅎㅎ)  
Java, Javascript, Python 등의 언어에서는 GC가 내장되어 있어 자동으로 메모리 관리를 해주고 있으며 이 글에서는 Java, 즉 JVM이 제공해주는 GC에 대해 알아보도록 한다.

<br/>

## Garbage Collection 알고리즘

<p align="center"><img width="80%" src="https://user-images.githubusercontent.com/62014888/150967773-c935c36c-e561-4716-a5e7-27cb7b16dc9a.png">https://asfirstalways.tistory.com/159</p>

먼저 GC에서 사용되는 알고리즘을 먼저 알아보도록 하자.  
그 전에 Garbage Collector(GC를 하는 주체)에서는 Heap 영역에 있는 어떤 객체를 Garbage로 보고 메모리를 해제하는 걸까?  
기본적으로 객체를 Reachable과 Unreachable의 상태로 구분하는데 구분 방법으로 Root Set과의 관계로 판단한다.  
Root Set과 관계가 있어 유효한 참조가 있다면 Reachable 객체, 그렇지 않다면 Unreachable 객체가 되는 것이다.  
여기서 말한 Root Set이란   
  - Stack (Java 메서드 실행 시에 사용하는 지역변수와 파라미터들에 의한 참조),   
  - Native Stack (JNI, Java Native Interface에 의해 생성된 객체에 대한 참조),   
  - Method 영역의 정적 변수에 의한 참조. 


를 뜻한다.  
참고로 사용자 코드에서 객체의 rechability를 조절하여 GC에 관여할 수 있도록 다양한 Reference 객체를 제공해주는데 이는 [네이버 아티클](https://d2.naver.com/helloworld/329631) 을 참고하도록 하자.
(아직까진 이해 안가는 부분이 있지만 GC, 특히 Reference에 대해 다룬 좋은 글이다)

아무튼 GC 알고리즘은 기본적으로 Garbage를 식별하고 이를 메모리에서 해제하는 흐름으로 진행된다.  
알고리즘 종류로 여러 종류가 있는데 대표적인 두 가지 알고리즘으로 Reference Counting과 Mark And Sweep이 있다.  

<br/>

### Reference Counting

<p align="center"><img width="80%" src="https://user-images.githubusercontent.com/62014888/150968257-01bf673b-9200-4d19-8001-20959a441122.png
">https://rebelsky.cs.grinnell.edu/Courses/CS302/99S/Presentations/GC/</p>


Reference Counting은 힙 영역에 생성된 객체마다 Reference Count라는 별도의 숫자를 가지고 있다고 생각하면 된다.  
Reference Count는 몇 가지 방법으로 해당 객체에 접근할 수 있는지(참조 되고 있는 갯수)를 뜻하는데 해당 객체에 접근할 수 있는 방법이 하나도 없다면 즉, Reference Count가 0이 되면 GC를 수행한다.
Reference Count가 0이 되면 즉시 메모리에서 해제된다는 장점이 있지만 객체 간의 순환 참조가 존재하고 있는 상태에서 Root Set으로부터 참조가 끊겨도 
Reference Count는 0이 되지 않으므로 사용하지 않는 메모리 영역이 해제되지 못해 Memory Leak이 발생하는 단점이 있다.


<br/>

### Mark And Sweep

<p align="center"><img width="60%" src="https://user-images.githubusercontent.com/62014888/150968428-fffb706e-96a7-4e69-a079-77f14e12e86d.png
">https://rebelsky.cs.grinnell.edu/Courses/CS302/99S/Presentations/GC/</p>

Reference Counting의 단점을 해결하기 위해 나온 알고리즘으로 Root Set을 통해 참조 관계를 추적하는 매우 기본적인 알고리즘이다.  
원래는 조금 더 복잡하겠지만 기본적인 흐름만 살펴보자면 이러하다.  
우선 Mark 단계와 Sweep 단계로 나뉜다.  
Mark에서 Root Set으로부터 그래프 순회를 통해 연결된 객체를 찾아내어 Garbage 대상이 아닌 객체에 Marking을 진행하게 된다.  
이 작업이 끝나면 바로 Garbage 대상들을 지우는 작업인 Sweep이 진행되고 이후 Marking 되었던 정보를 초기화한다.  

이렇게 Mark And Sweep만 진행된 상태에서는 메모리 파편화 현상이 발생하는데 이로 인해 메모리 공간이 낭비되어 OutOfMemory가 발생할 수 있다.  
이를 위해 공간을 정리하고 살아남은 객체들을 연속된 메모리 공간에 적재하는 Compact 과정이 거쳐질 수도 있는데 이러한 알고리즘을 Mark Sweep Compact 알고리즘이라고 한다. 
Java는 기본적으로 Mark And Sweep (선택적으로 Compact) 알고리즘을 사용한다.  
참고로 위 사진은 Mark Sweep Compact 알고리즘이다.


<br/>

## Garbage Collection 동작 방식

사용되는 알고리즘을 알아봤으니 동작 방식을 알아보자.  
GC가 진행되는 곳은 Heap 영역인데 Heap을 자세하게 보면 다음과 같이 나누어져있다.  

<p align="center"><img width="100%" src="https://user-images.githubusercontent.com/62014888/150970181-0fd5b3af-179d-4d60-9343-091066f80f90.png
">https://code-factory.tistory.com/48</p>

위와 같이 Heap은 Young Generation과 Old Generation으로 나뉜다.  
이때 Young Generation은 Eden과 두 개의 Survivor 영역(Survivor0,1)로 나뉜다.  

1. 새로 객체가 생성되면 Young Generation의 Eden에 위치하게 된다.
2. Eden 영역이 꽉 차면 Minor GC가 발생하게 되어 참조되지 않은 객체는 메모리에서 해제되고, 살아남은 객체는 Survivor 영역 중 한 군데로 이동하게 된다. 
   이때 살아남은 객체는 age bit가 1 증가하게 된다.
3. 이후 Eden 영역이 꽉 차서 Minor GC가 발동할 때마다 Survivor 영역에 있던 객체들은 다른 Survivor 영역으로 이동한다.
4. age bit가 일정 수준을 넘어가게 되면 오랫동안 참조될 객체라고 판단하여 Old Generation으로 넘겨주고 이를 Promotion이라고 부른다.
5. Old Generation도 꽉 차게 되면 Major GC가 발생하게 된다.

<br/>

### 왜 Young Generation과 Old Generation으로 나누었을까?

그 이유는 다음과 같다.
1. 대부분의 할당된 객체는 오랫동안 참조되지 않으며 금방 Garbage 대상이 된다.
2. 오래된 객체에서 젊은 객체로의 참조는 거의 없다.

이러한 이유를 바탕으로 Young과 Old Generation 두 영역으로 나누어 효율적으로 처리하도록 만든 것이다.
(아무래도 GC도 하나의 비용이다 보니..ㅎㅎ)


<br/>

## Garbage Collector 종류

JVM은 다양한 Garbage Collector를 제공한다. 
Java 7, 8은 Parallel GC가 default고 9, 10, 11은 G1 GC가 default다.  
Java 11부터는 실험적으로 Z GC를 사용할 수 있다고 한다.  
종류에 대한 특징은 간단하게 살펴보도록 하자.

<br/>

### Stop The World?
종류를 알아보기 앞서 Stop The World라는 용어를 알고 가야한다.  
Stop The World는 GC를 수행하기 위해 JVM이 애플리케이션 실행을 멈추는 것을 의미한다.  
애플리케이션 실행을 멈추는 것이다보니 당연히 이 시간이 길어지면 성능이 떨어지게 된다.     
GC는 계속해서 이 Stop The World 시간을 최소화하기 위해 발전해왔다.

<br/>

### Serial Garbage Collector
- 하나의 스레드로 GC를 실행한다. (Mark Sweep Compaction)
- Stop The World 시간이 길다.
- 싱글 스레드 환경 및 Heap이 매우 작을 때 사용한다.

<br/>

### Parallel Garbage Collector
- 여러 개의 스레드로 GC를 실행한다. (Mark Sweep Compaction)
- Serial GC보다 Stop The World 시간이 줄어들게 된다.
- 멀티 코어 환경에서 사용한다.

<br/>

### CMS(Concurrent Mark Sweep) Garbage Collector
- Stop The World 시간을 최소화하기 위해 고안되었다.
- GC 작업을 애플리케이션과 동시에 실행한다.
- 메모리와 CPU를 많이 사용하고 Compaction이 기본적으로 제공되지 않음.
- G1 GC 등장에 따라 Deprecated 되었다.

<br/>

### G1(Garbage First) Garbage Collector 
- 큰 Heap 메모리에서 짧은 GC 시간을 보장하는데 목적을 둔다.
- Heap을 특정한 크기의 Region으로 나누어서 사용한다.
    - 각 Region의 상태에 따라 역할(Eden, Survivor, Old)이 동적으로 부여된다.
- 런타임에 G1 GC가 필요에 따라 영역별 Region 개수를 튜닝하여 Stop The World 시간을 최소화한다.

<br/>

### Z Garbage Collector

- 확장 가능하고 낮은 지연율을 가진 GC이다.
- 아래의 목표를 충족하기 위해 나오게 되었다.
    - 정지 시간이 최대 10ms를 초과하지 않음
    - Heap의 크기가 증가하더라도 정지 시간이 증가하지 않음
    - 8MB ~ 16TB에 이르는 다양한 범위의 Heap 처리 가능
- ZPages라는 Region으로 나누어 사용한다.

Z GC의 작동 원리는 찾아보아도 아직까진 잘 이해가 가지 않기에 추후에 더 많이 찾아보아야 할 것 같다..ㅠㅠ  
벤치마킹 결과 큰 메모리에서 G1 GC 보다 훨씬 좋은 성능을 보였는데 아직까진 JVM default GC가 아니기에 이런 GC가 있다 정도로 알고 넘어가야겠다.

<br/>

## 번외 - Permanent Generation, Metaspace

<p align="center"><img width="100%" src="https://user-images.githubusercontent.com/62014888/150970442-846c1e57-2869-4f1d-80a1-8c0780c69e88.png
">https://m.blog.naver.com/PostView.naver?isHttpsRedirect=true&blogId=kbh3983&logNo=220967456151</p>

GC에 대해 공부하다 보니 JVM의 Method 영역에 대해 헷갈리는 부분이 생기게 되었다.  
동작 방식을 설명하면서 Heap을 나누게 되는데 여러 사진에서 Permanent Generation이 등장하게 된다.  
이는 Java 7까지 존재하던 영역으로서 Heap 영역의 일부라고 하는데 Method 영역이 이 Perm Gen에 속해있다고 한다.  
엥..? 그렇다면 Method 영역이 Heap 영역에 속한다는건가?  
실제로도 Perm Gen에 있는 정보를 보면 class, method meta 정보, constant pool이 존재한다고 적혀있었다. 
이를 보고 여태 내가 잘못 알고 있었나 하는 생각을 들게 하였다.    
하지만 찾아보니 이러한 [StackOverFlow 글](https://stackoverflow.com/questions/41358895/permgen-is-part-of-heap-or-not) 을 있었고 읽어보니 Perm Gen은 Heap 영역으로 인용하고 있지만 (Generations 설명을 위해) Heap 영역이 아니라는 답변이 있어 넘어가기로 했다.  
게다가 Java 8버전부터 Perm Gen이 사라지고 Metaspace가 추가되면서 (Metaspace는 확실하게 Heap 영역이 아니다) 더이상 찾아볼 필요는 없다고 생각했다.  

여기서 흥미로운 점은 Perm Gen에 존재했던 string, static object의 위치인데 7 버전까지 Perm Gen에 존재하면서 GC의 관리 대상에 속하지 않았다고 한다.  
기본적으로 Perm Gen은 고정된 메모리 용량을 사용하고 있는데다 속해있던 string object, static object가 GC에 의해 해제되지 않다보니 OOM이 발생하는 문제가 생겼다고 한다.  
이를 해결하기 위해 8부터는 Perm Gen이 삭제되고 Metaspace가 추가되면서 class, method meta 정보들은 Metaspace에 저장되고 string, static object는 Heap 영역에 저장되면서 GC의 대상이 되었다고 한다.
참고로 object만 Heap 영역으로 이동되었고 reference는 여전히 Metatspace에 관리되기에 참조를 잃은 object만 GC의 대상이 되는 것이다.

<br/>

## 마무리
GC와 더불어 JVM에 대해서도 다시 한번 공부하게 된 좋은 시간이었다고 생각한다.  
과연 언젠가는 GC를 튜닝해보는 날도 오지 않을까..?  
물론 그 전에 코드 단에서 성능을 해결하도록 노력해야겠지만..ㅎㅎ

<br/>

## 참고
- https://ko.wikipedia.org/wiki/%EC%93%B0%EB%A0%88%EA%B8%B0_%EC%88%98%EC%A7%91_(%EC%BB%B4%ED%93%A8%ED%84%B0_%EA%B3%BC%ED%95%99)
- https://d2.naver.com/helloworld/329631
- https://youtu.be/FMUpVA0Vvjw
- https://lob-dev.tistory.com/entry/Presentation-JVM-GC-%EA%B8%B0%EB%B3%B8-%EA%B0%9C%EB%85%90%EA%B3%BC-%EA%B8%B0%EB%B3%B8-GC-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98
- https://velog.io/@hygoogi/%EC%9E%90%EB%B0%94-GC%EC%97%90-%EB%8C%80%ED%95%B4%EC%84%9C
- https://medium.com/@joongwon/jvm-garbage-collection-algorithms-3869b7b0aa6f
- https://8iggy.tistory.com/229
- https://sarc.io/index.php/java/2098-zgc-z-garbage-collectors