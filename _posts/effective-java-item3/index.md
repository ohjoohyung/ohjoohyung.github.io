---
title: "[이펙티브 자바] 3. private 생성자나 열거 타입으로 싱글턴임을 보증하라"  
date: 2021-12-14 20:00:00  
tags:
- java
- book
---

- 싱글턴이란 인스턴스를 오직 하나만 생성할 수 있는 클래스를 말한다.
    - 전형적인 예 - 함수와 같은 무상태 객체나 설계상 유일하게 하는 시스템 컴포넌트
- 클래스를 싱글턴으로 만들면 이를 사용하는 클라이언트를 테스트하기가 어려워질 수 있다.
    - 인터페이스를 구현해서 만든 싱글턴이 아니라면 싱글턴 인스턴스를 mocking으로 대체할 수 없기 때문!
- 싱글턴을 만드는 방식은 보통 둘 중 하나.
    - 두 방식 모두 생성자는 private으로 감춰두고, 유일한 인스턴스에 접근할 수 있는 수단으로 public static 멤버를 하나 마련해 둠.
    1. public static 멤버가 final 필드인 방식

        ```java
        public class Elvis {
            public static final Elvis INSTANCE = new Elvis();
        
            private Elvis() { }
        
            public void leaveTheBuilding() {
            }
        }
        ```

        - private 생성자는 Elvis.INSTANCE를 초기화할 때 딱 한 번만 호출됨.
        - 단, 리플렉션 API의 AccessibleObject.setAccessible을 사용하면 private 생성자를 호출할 수 있음.
            - 이를 방어하려면 두 번째 객체가 생성되려 할 때 생성자에서 예외를 던지게 하면 됨.
        - 장점
            - 해당 클래스가 싱글턴임이 API에 명백히 드러남.
            - 간결함.

    2. 정적 팩터리 메서드를 public static 멤버로 제공

        ```java
        public class Elvis {
            private static final Elvis INSTANCE = new Elvis();
            private Elvis() { }
            public static Elvis getInstance() { return INSTANCE; }
        
            public void leaveTheBuilding() {
            }
        }
        ```

        - Elvis.getInstance는 항상 같은 객체의 참조를 반환. (리플렉션을 통한 예외는 똑같이 적용됨)
        - 장점
            - (마음이 바뀌면) API를 바꾸지 않고도 싱글턴이 아니게 변경할 수 있음.
            - 원한다면 정적 팩터리를 제너릭 싱글턴 팩터리로 만들 수 있음.
            - 정적 팩터리의 메서드 참조를 공급자(supplier)로 사용할 수 있음.

    - 둘 중 하나의 방식으로 만든 싱글턴 클래스를 직렬화하려면 단순히 Serializable을 구현한다고 선언하는 것만으로는 부족하다.
        - 모든 인스턴스 필드를 일시적(transient)이라고 선언하고 readResolve 메서드를 제공해야 함.

            ```java
            // 싱글턴임을 보장해주는 readResolve 메서드
            private Obejct readResolve() {
            	// '진짜' Elvis를 반환하고, 가짜 Elvis는 가비지 컬렉터에 맡긴다.
            	return INSTANCE;
            }
            ```

            - 이렇게 하지 않으면 직렬화된 인스턴스를 역직렬화할 때마다 새로운 인스턴스가 만들어짐.

    3. 원소가 하나인 열거 타입을 선언하는 것.

        ```java
        public enum Elvis {
            INSTANCE;
        
            public void leaveTheBuilding() {
            }
        }
        ```

        - public 필드 방식과 비슷하지만, 더 간결하고, 추가 노력 없이 직렬화할 수 있고, 심지어 아주 복잡한 직렬화 상황이나 리플렉션 공격에서도 제2의 인스턴스가 생기는 일을 완벽히 막아준다.
        - 대부분 상황에서는 원소가 하나뿐인 열거 타입이 싱글턴을 만드는 가장 좋은 방법임.
            - 단, 만들려는 싱글턴이 Enum 외의 클래스를 상속해야 한다면 이 방법은 사용할 수 없다. (열거 타입이 다른 인터페이스를 구현하도록 선언할 수는 있음)
    

## 느낀 점

- 싱글턴으로 클래스를 만들면 직렬화하고 역직렬화할때마다 새로운 인스턴스가 만들어지는 줄은 몰랐는데 흥미로웠다. 제네릭 싱글턴 팩터리나 supplier에 대한 내용 때문에 빨리 뒷부분 아이템을 읽고 싶어졌다.