---
title: "[이펙티브 자바] 8. finalizer와 cleaner 사용을 피하라"  
date: 2021-12-16 22:00:00  
tags:
- java
- book
---

- 자바는 두 가지 객체 소멸자를 제공함.
- finalizer는 예측할 수 없고, 상황에 따라 위험할 수 있어 일반적으로 불필요하다.
    - 오동작, 낮은 성능, 이식성 문제의 원인이 되기도 함.
    - 자바 9에서는 deprecated API로 지정하고 cleaner를 대안으로 소개함.
- cleaner는 finalizer보다는 덜 위험하지만, 여전히 예측할 수 없고, 느리고, 일반적으로 불필요하다.
- finalizer와 cleaner는 즉시 수행된다는 보장이 없음.
    - 객체에 접근할 수 없게 된 후 finalizer나 cleaner가 실행되기까지 얼마나 걸릴지 알 수 없음.
    - 즉, finalizer와 cleaner로는 제때 실행되어야 하는 작업은 절대 할 수 없음.
        - 예를 들어 시스템이 동시에 열 수 있는 파일 개수에 한계가 있기에 파일 닫기 작업을 맡기면 중대한 오류를 일으킬 수 있음.
    - 얼마나 신속히 수행할지는 전적으로 가비지 컬렉터 알고리즘에 달렸음.
- 클래스에 finalizer를 달아두면 그 인스턴스의 자원 회수가 제멋대로 지연될 수 있음
    - cleaner는 자신을 수행할 스레드를 제어할 수 있다는 면에서 조금 낫다.
    - 하지만 여전히 백그라운드에서 수행되며 gc의 통제하에 있으니 즉각 수행되리라는 보장이 없음.
- finalizer나 cleaner의 수행 여부조차 보장하지 않음.
    - 상태를 영구적으로 수정하는 작업에서는 절대 finalizer나 cleaner에 의존해서는 안 됨.
    - 예를 들어 DB와 같은 공유 자원의 영구 lock 해제를 finalizer나 cleaner에 맡겨 놓으면 분산 시스템 전체가 서서히 멈출 것이다.
    - System.gc나 System.runFinalization 메서드도 실행될 가능성을 높여줄 수 있으나, 보장해주진 않음.
- finalizer 동작 중 발생한 예외는 무시되며 처리할 작업이 남았더라도 그 순간 종료됨.
    - 경고조차 출력하지 않음.
    - cleaner를 사용하는 라이브러리는 자신의 스레드를 통제하기 때문에 이러한 문제가 발생하지는 않음.
- finalizer와 cleaner는 심각한 성능 문제도 동반함.
    - 객체를 생성하고 가비지 컬렉터가 수거하기까지 걸린 시간
    - AutoCloseable - 12ns
    - finalizer - 550ns, cleaner - 500ns
- finalizer 사용한 클래스는 finalizer 공격에 노출되어 심각한 보안 문제를 일으킬 수도 있음.
    - 생성자나 직렬화 과정에서 예외가 발생하면, 생성되다 만 객체에서 악의적인 하위 클래스의 finalizer가 수행될 수 있게 됨.
    - 이 finalizer는 정적 필드에 자신의 참조를 할당하여 gc가 수집하지 못하게 막을 수 있음.
    - 일그러진 객체가 만들어지고 나면, 이 객체의 메서드를 호출해 애초에는 허용되지 않았을 작업을 수행하는 건 일도 아님.
    - 위 예시가 있는 [블로그](https://yangbongsoo.tistory.com/8?category=919799) 를 참고하자.
    - 객체 생성을 막으려면 생성자에서 예외를 던지는 것만으로 충분하지만, finalizer가 있다면 그렇지도 않음.
    - final 클래스들은 하위 클래스를 만들 수 없으니 이 공격에서 안전하다.
    - final이 아닌 클래스를 finalizer 공격으로부터 방어하려면 아무 일도 하지 않는 finalize 메서드를 만들고 final을 선언하자.

- 그렇다면 파일이나 스레드 등 종료해야 할 자원을 담고 있는 객체의 클래스에서 finalizer나 cleaner를 대신해줄 묘안은 무엇인가?
    - AutoCloseable을 구현해주고, 클라이언트에서 인스턴스를 다 쓰고 나면 close 메서드를 호출하면 된다. (일반적으로 try-with-resourses를 사용)

- finalizer와 cleaner의 적절한 쓰임새가 두 가지 정도 있다.
    1. 자원의 소유자가 close 메서드를 호출하지 않는 것에 대비한 안전망 역할.
        - 늦게라도 해주는 것이 아예 안 하는 것보다는 나으니 작성한다.
        - FileInputStream, FileOutputStream, ThreadPoolExecutor가 대표적
    2. 네이티브 피어(native peer)와 연결된 객체
        - 네이티브 피어란 일반 자바 객체가 네이티브 메서드를 통해 기능을 위임한 네이티브 객체를 말함.
        - gc가 네이티브 객체까지 회수하지 못하니 cleaner나 finalizer를 사용하기 적당한 작업임.
        - 단, 성능 저하를 감당할 수 있고 네이티브 피어가 심각한 자원을 가지고 있지 않을 때에만 해당됨.

- cleaner를 안전망으로 사용하기 조금 까다롭다.

    ```java
    public class Room implements AutoCloseable {
        private static final Cleaner cleaner = Cleaner.create();
    
        // 청소가 필요한 자원. 절대 Room을 참조해서는 안 된다!
        private static class State implements Runnable {
            int numJunkPiles; // Number of junk piles in this room
    
            State(int numJunkPiles) {
                this.numJunkPiles = numJunkPiles;
            }
    
            // close 메서드나 cleaner가 호출한다.
            @Override public void run() {
                System.out.println("Cleaning room");
                numJunkPiles = 0;
            }
        }
    
        // 방의 상태. cleanable과 공유한다.
        private final State state;
    
        // cleanable 객체. 수거 대상이 되면 방을 청소한다.
        private final Cleaner.Cleanable cleanable;
    
        public Room(int numJunkPiles) {
            state = new State(numJunkPiles);
            cleanable = cleaner.register(this, state);
        }
    
        @Override public void close() {
            cleanable.clean();
        }
    }
    ```

    - State의 run 메서드는 cleanable에 의해 딱 한 번만 호출될 것임.
    - run 메서드가 호출되는 상황은 둘 중 하나.
        - 보통은 Room의 close 메서드를 호출할 때.
            - close 메서드에서 Cleanable의 clean을 호출하면 이 메서드 안에서 run을 호출한다.
        - gc가 Room을 회수할 때까지 클라이언트가 close를 호출하지 않는다면, cleaner가 State의 run 메서드를 호출해줄 것.
    - State 인스턴스는 '절대로' Room 인스턴스를 참조해서는 안 된다.
        - 참조하면 순환참조가 생겨 gc가 Room 인스턴스를 회수해갈 기회가 오지 않음.
        - 정적 중첩 클래스로 구성한 이유도 여기에 있음.
        - 정적이 아닌 중첩 클래스는 자동으로 바깥 객체의 참조를 갖게 됨.
            - 람다 역시 바깥 객체의 참조를 갖기 쉬우니 사용하지 말자.

- Room 생성을 try-with-resources 블록으로 감쌌다면 자동 청소는 전혀 필요하지 않음.

    ```java
    public class Adult {
        public static void main(String[] args) {
            try (Room myRoom = new Room(7)) {
                System.out.println("안녕~");
            }
        }
    }
    ```

    - "안녕~"을 출력한 후, 이어서 "방 청소"를 출력한다.

- 아래의 경우는 "방 청소"가 출력되는 것을 예측할 수 없음.

    ```java
    public class Teenager {
        public static void main(String[] args) {
            new Room(99);
            System.out.println("Peace out");
    
            // 다음 줄의 주석을 해제한 후 동작을 다시 확인해보자.
            // 단, 가비지 컬렉러를 강제로 호출하는 이런 방식에 의존해서는 절대 안 된다!
    //      System.gc();
        }
    }
    ```

    - cleaner 명세는 이렇게 적혀 있음.

      > System.exit을 호출할 때의 cleaner 동작은 구현하기 나름이다. 청소가 이뤄질지는 보장하지 않는다.
    >
    - System.gc()를 추가하는 것으로 종료 전에 "방 청소"를 출력할 수 있었지만, 보장할 수 없다.


## 핵심 정리

- cleaner(자바 8까지는 finalizer)는 안전망 역할이나 중요하지 않은 네이티브 자원 회수용으로만 사용하자.
- 이런 경우라도 불확실성과 성능 저하에 주의해야 한다.