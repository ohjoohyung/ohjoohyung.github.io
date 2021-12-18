---
title: "[이펙티브 자바] 7. 다 쓴 객체 참조를 해제하라"  
date: 2021-12-16 20:00:00  
tags:
- java
- book
---

- 자바와 같이 가비지 컬렉터를 갖춘 언어를 사용하기에 자칫 메모리 관리에 더 이상 신경 쓰지 않아도 된다고 오해할 수 있는데, 절대 사실이 아니다.

```java
public class Stack {
    private Object[] elements;
    private int size = 0;
    private static final int DEFAULT_INITIAL_CAPACITY = 16;

    public Stack() {
        elements = new Object[DEFAULT_INITIAL_CAPACITY];
    }

    public void push(Object e) {
        ensureCapacity();
        elements[size++] = e;
    }

    public Object pop() {
        if (size == 0)
            throw new EmptyStackException();
        return elements[--size];
    }

    /**
     * 원소를 위한 공간을 적어도 하나 이상 확보한다.
     * 배열 크기를 늘려야 할 때마다 대략 두 배씩 늘린다.
     */
    private void ensureCapacity() {
        if (elements.length == size)
            elements = Arrays.copyOf(elements, 2 * size + 1);
    }
}
```

- 이 스택을 사용하는 프로그램을 오래 실행하다 보면 '메모리 누수'로 점차 가비지 컬렉션 활동과 메모리 사용량이 늘어나 결국 성능이 저하될 것이다.
- 상대적으로 드문 경우긴 하지만 심할 때는 디스크 페이징이나 OutOfMemoryError를 일으켜 프로그램이 예기치 않게 종료되기도 한다.
- 그렇다면 어디서 메모리 누수가 일어날까?
    - 이 코드에서는 스택이 커졌다가 줄어들었을 때 스택에서 꺼내진 객체들을 가비지 컬렉터로 회수하지 않는다. (프로그램에서 그 객체들을 더 이상 사용하지 않더라도)
    - 다 쓴 참조(obsolete reference)를 여전히 가지고 있기 때문이다.
        - 다 쓴 참조란 문자 그대로 앞으로 다시 쓰지 않을 참조를 뜻한다.
        - elements 배열의 '활성 영역' 밖의 참조들이 모두 여기에 해당됨.
        - 활성 영역은 인덱스가 size보다 작은 원소들로 구성.
- 객체 참조 하나를 살려두면 가비지 컬렉터는 그 객체뿐 아니라 그 객체가 참조하는 모든 객체를 회수해가지 못함.
    - 단 몇 개의 객체가 매우 많은 객체를 회수되지 못하게 할 수 있고 잠재적으로 성능에 악영향을 줄 수 있음.
- 해당 참조를 다 썼을 때 null 처리(참조 해제)하면 해결될 수 있다.

    ```java
    public Object pop() {
          if (size == 0)
              throw new EmptyStackException();
          Object result = elements[--size];
          elements[size] = null; // 다 쓴 참조 해제
          return result;
    }
    ```

    - null 처리를 통해 실수로 사용할 때 NullPointerException을 던지며 종료되는 이점을 가질 수 있음.
    - 단, 객체 참조를 null 처리하는 일은 예외적인 경우여야 함.
        - 다 쓴 참조를 해제하는 가장 좋은 방법은 그 참조를 담은 변수를 유효 범위(scope) 밖으로 밀어내는 것임.
            - 메서드, for문에서만 사용하는 지역변수 등 변수의 범위를 최소가 되게 정의하면 됨.
        - 참고로 ArrayList의 remove도 null 처리를 해준다.

            ![Untitled (91)](https://user-images.githubusercontent.com/62014888/146503206-2dabd7a6-4e1e-41a5-9e95-639de4dbd096.png)

- 그렇다면 null 처리는 언제?
    - 자기 메모리를 직접 관리할 때!
    - 이 스택의 경우 객체 참조를 담는 elements 배열로 저장소 풀을 만들어 원소들을 관리함.
    - 가비지 컬렉터가 보기에는 비활성 영역에서 참조하는 객체도 똑같이 유효한 객체이므로 프로그래머는 비활성 영역이 되는 순간 null 처리해서 해당 객체를 더는 쓰지 않을 것임을 가비지 컬렉터에 알려야 함.
    - 자기 메모리를 직접 관리하는 클래스라면 프로그래머는 항시 메모리 누수에 주의해야 함.

- 캐시 역시 메모리 누수를 일으키는 주범임.
    - 캐시 외부에서 key를 참조하는 동안만 엔트리가 살아 있는 캐시가 필요한 상황이라면 WeakHashMap을 사용해 캐시를 만들자.
    - 다 쓴 엔트리는 그 즉시 자동으로 제거될 것임.
    - 단, WeakHashMap은 이러한 상황에서만 유용하다는 사실을 기억하자.
    - WeakHashMap의 간단한 캐시 예시는 [블로그](http://blog.breakingthat.com/2018/08/26/java-collection-map-weakhashmap/) 참고.
    - 캐시 엔트리의 유효 기간을 정확히 정의하기 어려울 때는 쓰지 않는 엔트리를 이따금 청소해줘야 함.
        - (ScheduledThreadPoolExecutor 같은) 백그라운드 스레드를 활용
        - 캐시에 새 엔트리를 추가할 때 부수 작업으로 수행하는 방법이 있음.
            - LinkedHashMap은 removeEldestEntry 메서드를 써서 후자의 방식으로 처리
            - 간단하게 얘기하면 removeEldestEntry를 오버라이딩하고 직접 구현하여 엔트리 개수에 따라 추가할 때 오래된 엔트리를 삭제하는 방식으로 만들 수도 있다. 예시는 [블로그](https://javafactory.tistory.com/735) 참고
        - 더 복잡한 캐시를 만들고 싶다면 java.lang.ref 패키지를 직접 활용해야 할 것이다.
            - Reference 클래스 관련 내용으로 필요한 경우 더 공부해야 할 듯하다.
            - [GC, Reference 클래스 관련된 글](https://d2.naver.com/helloworld/329631) 참고

- 메모리 누수의 세 번째 주범은 바로 리스너(listener) 혹은 콜백(callback)이라 부르는 것이다.
    - 클라이언트가 콜백을 등록만 하고 명확히 해지하지 않는다면, 뭔가 조치해주지 않는 한 콜백은 계속 쌓여갈 것.
    - 콜백을 약한 참조(weak reference)로 저장하면 가비지 컬렉터가 즉시 수거해간다.
        - 예를 들어 WeakHahMap에 키로 저장.


## 핵심 정리

- 메모리 누수는 겉으로 잘 드러나지 않아 시스템에 수년간 잠복하는 사례도 있다.
- 이런 누수는 철저한 코드 리뷰나 힙 프로파일러 같은 디버깅 도구를 동원해야만 발견되기도 한다.
- 그래서 이런 종류의 문제는 예방법을 익혀두는 것이 중요하다!