---
title: "[이펙티브 자바] 13. clone 재정의는 주의해서 진행하라"  
date: 2021-12-20 18:35  
tags:
- java
- book
---

- Cloneable은 복제해도 되는 클래스임을 명시하는 용도의 믹스인 인터페이스지만, 아쉽게도 의도한 목적을 제대로 이루지 못했음.
    - 가장 큰 문제는 clone 메서드가 선언된 곳이 Cloneable이 아닌 Object이고, 그마저도 protected라는 데 있음.
    - Cloneable을 구현하는 것만으로는 외부 객체에서 clone 메서드를 호출할 수 없음.

- Cloneable 인터페이스는 Object의 protected 메서드인 clone의 동작 방식을 결정함.
- Cloneable을 구현한 클래스의 인스턴스에서 clone을 호출하면 그 객체의 필드들을 하나하나 복사한 객체를 반환함.
    - 그렇지 않은 클래스가 호출하면 CloneNotSupportedException을 던짐.
- 인터페이스를 구현한다는 것은 일반적으로 해당 클래스가 그 인터페이스에서 정의한 기능을 제공한다고 선언하는 행위.
    - Cloneable의 경우는 상위 클래스에 정의된 protected 메서드의 동작 방식을 변경한 것.
- 실무에서는 Cloneable을 구현한 클래스는 clone 메서드를 pulbic으로 제공하며, 사용자는 당연히 복제가 제대로 이뤄지리라 기대함.

<br/>

## clone 메서드의 일반 규약

> 이 객체의 복사본을 생성해 반환한다. '복사'의 정확한 뜻은 그 객체를 구현한 클래스에 따라 다를 수 있음.
> 어떤 객체 x에 대해 다음 식은 참이다.
> x.clone() != x
> 다음 식도 참이다.
> x.clone().getClass() == x.getClass()
> 하지만 이상의 요구를 반드시 만족해야 하는 것은 아니다.
> 다음 식도 참이지만, 역시 필수는 아니다.
> x.clone().equals(x)
> 관례상, 이 메서드가 반환하는 객체는 super.clone()을 호출해 얻어야 한다.
> 관례를 따른다면 다음 식은 참이다.
> x.clone().getClass() == x.getClass()
> 관례상, 반환된 객체와 원본 객체는 독립적이어야 한다. 이를 만족하려면 super.clone으로 얻은 객체의 필드 중 하나 이상을 반환 전에 수정해야 할 수도 있다.

- 강제성이 없다는 점만 빼면 생성자 연쇄와 비슷한 메커니즘.
- clone 메서드가 super.clone이 아닌 생성자를 호출해 얻은 인스턴스를 반환해도 컴파일러는 불평하지 않을 것.
    - 하지만 이 클래스의 하위 클래스에서 super.clone을 호출한다면 잘못된 클래스의 객체가 만들어져, 결국 하위 클래스의 clone 메서드가 제대로 동작하지 않게 됨.

<br/>

## 가변 상태를 참조하지 않는 클래스용 clone 메서드
  
```java
 // 코드 13-1 가변 상태를 참조하지 않는 클래스용 clone 메서드 (79쪽)
@Override public PhoneNumber clone() {
    try {
        return (PhoneNumber) super.clone();
    } catch (CloneNotSupportedException e) {
        throw new AssertionError();  // 일어날 수 없는 일이다.
    }
}
```
- 모든 필드가 기본 타입이거나 불변 객체를 참조한다면 이 객체는 완벽히 우리가 원하는 상태라 더 손볼 것이 없음.
  - 단, 쓸데없는 복사를 지양한다는 관점에서 보면 불변 클래스는 굳이 clone 메서드를 제공하지 않는 게 좋음.
- 위와 같이 자바는 공변 반환 타이핑을 지원해 PhoneNumber의 clone 메서드는 PhoneNumber를 반환하게 했음.
  - 즉, 재정의한 메서드의 반환 타입은 상위 클래스의 메서드가 반환하는 타입의 하위 타입일 수 있음.
  - 이 방식으로 클라이언트가 형변환하지 않아도 되게끔 해주자.
- try-catch 블록으로 감싼 이유는 Object의 clone 메서드가 checked exception인 CloneNotSupportedException을 던지도록 선언되었기 때문.
  - 사실 CloneNotSupportedException은 unchecked exception이었어야 했다..

<br/>

## 가변 객체를 참조하는 클래스의 clone 메서드

```java
public class Stack implements Cloneable {
  private Object[] elements;
  private int size = 0;
  private static final int DEFAULT_INITIAL_CAPACITY = 16;

  public Stack() {
    this.elements = new Object[DEFAULT_INITIAL_CAPACITY];
  }

  public void push(Object e) {
    ensureCapacity();
    elements[size++] = e;
  }

  public Object pop() {
    if (size == 0)
      throw new EmptyStackException();
    Object result = elements[--size];
    elements[size] = null; // 다 쓴 참조 해제
    return result;
  }

  // 원소를 위한 공간을 적어도 하나 이상 확보한다.
  private void ensureCapacity() {
    if (elements.length == size)
      elements = Arrays.copyOf(elements, 2 * size + 1);
  }
}
```
- 앞서 했던 구현이 클래스가 가변 객체를 참조하는 순간 재앙으로 변함.
- clone 메서드가 단순히 super.clone의 결과를 반환한다면?
  - size 필드는 올바른 값을 갖겠지만, elements 필드는 원본 Stack 인스턴스와 똑같은 배열을 참고할 것.
  - 둘 중 하나를 수정하면 다른 하나도 수정되어 불변식을 해침.
  - 따라서 프로그램이 이상하게 동작하거나 NullPointerException을 던질 것.
- clone 메서드는 사실상 생성자와 같은 효과를 낸다. 즉, clone은 원본 객체에 아무런 해를 끼치지 않는 동시에 복제된 객체의 불변식을 보장해야 함.

```java
// 코드 13-2 가변 상태를 참조하는 클래스용 clone 메서드
@Override public Stack clone() {
    try {
        Stack result = (Stack) super.clone();
        result.elements = elements.clone();
        return result;
    } catch (CloneNotSupportedException e) {
        throw new AssertionError();
    }
}
```
- elements 배열의 clone을 재귀적으로 호출해 해결 가능.
- 배열의 clone은 런타임 타입과 컴파일타임 타입 모두 원본 배열과 똑같은 배열을 반환하므로 Object[]으로 형변환할 필요는 없음.
- elements 필드가 final이었다면 위 방식은 작동하지 않음.
  - final 필드는 새로운 값을 할당할 수 없기 때문.
  - Cloneable 아키텍처는 '가변 객체를 참조하는 필드는 final로 선언하라'는 일반 용법과 충돌함. (원본과 가변 객체를 공유해도 안전하다면 괜찮음)
  - 복제할 클래스를 만들기 위해 일부 필드에서 final을 제거해야 할 수도 있음.

<br/>

## 해시테이블용 clone 메서드

- clone을 재귀적으로 호출하는 것만으로는 충분하지 않을 때도 있음.
```java
public class HashTable implements Cloneable {
    public Entry[] buckets = ...;
    
    private static class Entry {
        final Object key;
        Object value;
        Entry next;
        
        Entry(Object key, Object value, Entry next) {
            this.key = key;
            this.value = value;
            this.next = next;
        }
    }
}
```
- 해시테이블 내부는 버킷들의 배열이고 각 버킷은 키-값 쌍을 담는 연결 리스트의 첫 번째 엔트리를 참조함.

```java
@Override public HashTable clone() {
    try {
        HashTable result = (HashTable) super.clone();
        result.buckets = buckets.clone();
        return result;
    } catch (CloneNotSupportedException e) {
      throw new AssertionError();
    }
}
```
- 복제본은 자신만의 버킷 배열을 갖지만, 이 배열은 원본과 같은 연결 리스트를 참조하여 원본과 복제본 모두 예기치 않게 동작할 가능성이 생김.
  - 해결하려면 각 버킷을 구성하는 연결 리스트를 복사해야 함.
  
```java
public class HashTable implements Cloneable {
    public Entry[] buckets = ...;
    
    private static class Entry {
        final Object key;
        Object value;
        Entry next;
        
        Entry(Object key, Object value, Entry next) {
            this.key = key;
            this.value = value;
            this.next = next;
        }
        
        // 이 엔트리가 가리키는 연결 리스트를 재귀적으로 복사
        Entry deepCopy() {
            return new Entry(key, value,
                    next == null ? null : next.deepCopy());
        }
    }

    @Override public HashTable clone() {
        try {
          HashTable result = (HashTable) super.clone();
          result.buckets = new Entry[buckets.length];
          for (int i = 0; i < buckets.length; i++) {
              if (buckets[i] != null) {
                  result.buckets[i] = buckets[i].deepCopy();
              }
          }
          return result;
        } catch (CloneNotSupportedException e) {
          throw new AssertionError();
        }
    }
}
```
- private 클래스인 HashTable.Entry는 깊은복사(deep copy)를 지원하도록 보강되었음.
- clone 메서드는 적절한 크기의 새로운 버킷 배열을 할당한 다음 순회하며 깊은복사를 수행함.
  - 이때 deepCopy 메서드는 연결 리스트 전체를 복사하기 위해 재귀적으로 호출함.
- 이 방법은 리스트가 길다면 스택 오버플로를 일으킬 위험이 있어 좋지 않음.
  - 재귀 호출 대신 반복자를 써서 순회하는 방향으로 수정해야 함.
  ```java
  Entry deepCopy() {
      Entry result = new Entry(key, value, next);
      for (Entry p = result; p.next != null; p = p.next)
          p.next = new Entry(p.key, p.value, p.next);
      }
      return result;
  }
  ```

<br/>

## 복잡한 가변 객체를 복제하는 마지막 방법

- super.clone을 호출하여 얻은 객체의 모든 필드를 초기 상태로 설정한 다음, 원본 객체의 상태를 다시 생성하는 고수준 메서드들을 호출함.
- 고수준 API를 활용해 복제하면 보통은 간단하고 제법 우아한 코드를 얻게 되지만, 아무래도 저수준에서 바로 처리할 때보다는 느리다.
- Cloneable 아키텍처의 기초가 되는 필드 단위 객체 복사를 우회하기 때문에 전체 Cloneable 아키텍처와는 어울리지 않는 방식이기도 함.
- clone이 하위 클래스에서 재정의한 메서드를 호출하면, 하위 클래스는 복제 과정에서 자신의 상태를 교정할 기회를 잃게 되어 원본과 복제본의 상태가 달라질 가능성이 큼.
  - clone에서 사용되는 메서드는 final이거나 private이어야 함.

<br/>

## 주의사항

- Object의 clone 메서드는 CloneNotSupportedException을 던진다고 선언했지만 재정의한 메서드는 그렇지 않음.
  - public인 clone 메서드에서는 throws 절을 없애야 함.
- 상속용 클래스는 Cloneable을 구현해서는 안 된다.
- Object의 방식을 모방해서 사용할 수도 있음.
  - 제대로 작동하는 clone 메서드를 구현해 protected로 두고 ClassNotSupportedException도 던질 수 있다고 선언하는 것.
    - Cloneable 구현 여부를 하위 클래스에서 선택하도록 해줌.
  - clone을 동작하지 않게 구현해놓고 하위 클래스에서 재정의하지 못하게 할 수도 있음.
  
- Cloneable을 구현한 스레드 안전 클래스를 작성할 때는 clone 메서드 역시 적절히 동기화해줘야 함.
  - Object의 clone 메서드는 동기화를 신경 쓰지 않았음.
- Cloneable을 구현하는 모든 클래스는 clone을 재정의해야 함.
  - 접근 제한자는 public, 반환 타입은 클래스 자신으로 변경.
  - super.clone을 호출한 후 필요한 필드를 전부 적절히 수정함.
    - 깊은 구조에 숨어 있는 모든 가변 객체를 복사하고, 복사본이 가진 객체 참조 모두가 복사된 객체들을 가리키게 함.
    - 기본 타입, 불변 객체 참조만 갖는 클래스는 아무 필드도 수정할 필요 없음.
    - 일련번호, 고유 ID는 비록 기본 타입이나 불변일지라도 수정해줘야 함.

<br/>

## 복사 생성자, 복사 팩터리

- 그런데 이 모든 작업이 꼭 필요한 걸까?
- 복사 생성자와 복사 팩터리라는 더 나은 객체 복사 방식을 제공할 수 있음.

<br/>

### 복사 생성자
- 복사 생성자란 단순히 자신과 같은 클래스의 인스턴스를 인수로 받는 생성자를 말함.
```java
public Yum(Yum yum) {...};
```

<br/>

### 복사 팩터리
- 복사 생성자를 모방한 정적 팩터리

```java
public statci Yum newInstance(Yum yum) {...};
```

<br/>

- 복사 생성자와 복사 팩터리는 Cloneable/clone 방식보다 나은 면이 많음.
  1. 언어 모순적이고 위험천만한 객체 생성 메커니즘(생성자를 쓰지 않는 방식)을 사용하지 않음 
  2. 엉성하게 문서화된 규약에 기대지 않음
  3. 정상적인 final 필드 용법과도 충돌하지 않음
  4. 불필요한 검사 예외를 던지지 않음
  5. 형변환도 필요치 않음

- 복사 생성자와 복사 팩터리는 해당 클래스가 구현한 인터페이스 타입의 인스턴스를 인수로 받을 수 있음.
  - 예컨대 관례상 모든 범용 컬렉션 구현체는 Collection이나 Map 타입을 받는 생성자를 제공함.
  - 인터페이스 기반 복사 생성자와 복사 팩터리의 더 정확한 이름은 '변환 생성자'와 '변환 팩터리'다.
  - 클라이언트의 원본 구현 타입에 얽매이지 않고 복제본의 타입을 직접 선택할 수 있음.
  - ex) HashSet 객체 s를 TreeSet 타입으로 복제 -> new TreeSet<>(s);

<br/>

## 핵심 정리
- 새로운 인터페이스를 만들 때, 새로운 클래스를 만들 때 Cloneable을 확장하지도 구현하지도 말자.
- final 클래스라면 위험이 크지 않지만, 성능 최적화 관점에서 검토한 후 별다른 문제가 없을 때만 드물게 허용해야 한다.
- 기본 원칙은 '복제 기능은 생성자와 팩터리를 이용하는 게 최고'라는 것.
- 단, 배열만은 clone 메서드 방식이 가장 깔끔한, 이 규칙의 합당한 예외라 할 수 있음.