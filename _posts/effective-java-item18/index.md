---
title: "[이펙티브 자바] 18. 상속보다는 컴포지션을 사용하라"  
date: 2022-01-09  
tags:
- java
- book
---

## 상속

상속은 코드를 재사용하는 강력한 수단이지만, 항상 최선은 아니다.

일반적인 구체 클래스를 패키지 경계를 넘어, 즉 다른 패키지의 구체 클래스를 상속하는 일은 위험하다.  
여기서의 '상속'은 (클래스가 다른 클래스를 확장하는) 구현 상속을 말한다.  
(클래스가 인터페이스를 구현하거나 인터페이스가 다른 인터페이스를 확장하는) 인터페이스 상속과는 무관하다.

메서드 호출과 달리 상속은 캡슐화를 깨뜨린다.
즉, 상위 클래스가 어떻게 구현되느냐에 따라 하위 클래스의 동작에 이상이 생길 수 있다.
이러한 이유로 상위 클래스 설계자가 확장을 충분히 고려하고 문서화도 제대로 해두지 않으면 하위 클래스는 상위 클래스 변화에 발맞춰 수정돼야만 한다.

<br/>

## 상속 예시

```java
// 코드 18-1 잘못된 예 - 상속을 잘못 사용했다! (114쪽)
public class InstrumentedHashSet<E> extends HashSet<E> {
    // 추가된 원소의 수
    private int addCount = 0;

    public InstrumentedHashSet() {
    }

    public InstrumentedHashSet(int initCap, float loadFactor) {
        super(initCap, loadFactor);
    }

    @Override public boolean add(E e) {
        addCount++;
        return super.add(e);
    }

    @Override public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return super.addAll(c);
    }

    public int getAddCount() {
        return addCount;
    }

    public static void main(String[] args) {
        InstrumentedHashSet<String> s = new InstrumentedHashSet<>();
        s.addAll(List.of("틱", "탁탁", "펑"));
        System.out.println(s.getAddCount());
    }
}
```
구체적인 예로 위와 같은 HashSet을 사용하는 프로그램이 있다.
main 메서드에서와 같이 원소 3개를 더하고 getAddCount 메서드를 호출하면 3이 아닌 6을 반환한다.  
그 이유는 HashSet의 addAll은 각 원소를 add 메서드를 호출해 추가하는데, 이때 불리는 add는 InstrumentedHashSet에서 재정의 한 메서드다.
따라서 addCount에 값이 중복해서 더해져, 최종값이 6으로 늘어난 것이다.

<br/>

### 해결 방법은?

1 - 재정의하지 않기

이 경우 하위 클래스에서 addAll 메서드를 재정의하지 않으면 문제를 고칠 수 있다. 하지만 당장은 제대로 동작할지 모르나, 
HashSet의 addAll이 add 메서드를 이용해 구현했음을 가정한 해법이라는 한계를 지닌다. 이처럼 자신의 다른 부분을 사용하는 
'자기사용(self-use)' 여부는 해당 클래스의 내부 구현 방식에 해당하며, 자바 플랫폼 전반적인 정책인지, 그래서 다음 릴리스에서도 유지될지는 알 수 없다. 따라서 이런 가정에 기댄
InstrumentHashSet도 깨지기 쉽다.

2 - 다른 방법으로 재정의

addAll 메서드를 주어진 컬렉션을 순회하여 원소 하나당 add 메서드를 한 번만 호출하도록 재정의할 수도 있다.
하지만 상위 클래스의 메서드 동작을 다시 구현하는 것이 어렵고, 시간도 더 들고, 자칫 오류를 내거나 성능을 떨어뜨릴 수도 있다.
또한 하위 클래스에서는 접근할 수 없는 private 필드를 써야 하는 상황이라면 이 방식으로는 구현 자체가 불가능하다.

하위 클래스가 깨지기 쉬운 이유는 더 있다.
다음 릴리스에서 상위 클래스에 새로운 메서드를 추가한다면 어떨까? 보안 때문에 컬렉션에 추가된 모든 원소가
특정 조건을 만족해야만 하는 프로그램을 생각해보자. 컬렉션을 상속하여 원소를 추가하는 모든 메서드를 재정의해 필요한 조건을 먼저 검사하게끔 하면 될 것 같다. 
하지만 이 방식이 통하는 것은 상위 클래스에 또 다른 원소 추가 메서드가 만들어지기 전까지다. 다음 릴리스에서 우려한 일이 생기면 하위 클래스에서 재정의하지 못한 그 새로운 메서드를 사용해
'허용되지 않은' 원소를 추가할 수 있게 된다. 실제로 Hashtable, Vector를 컬렉션 프레임워크에 포함시키자 관련 보안 구멍들을 수정해야 하는 사태가 벌어졌다.

3 - 새로운 메서드 추가하기

메서드를 재정의하는 대신 새로운 메서드를 추가하면?  
다음 릴리스에서 상위 클래스에 새 메서드가 추가됐는데, 운 없게도 하필 하위 클래스에 추가한 메서드와 
시그니처가 같고 반환 타입은 다르다면 컴파일조차 되지 않는다. 반환 타입마저 같다면 재정의한 꼴이니 앞의 문제와 똑같은 상황에 부닥친다. 
또한 상위 클래스 메서드가 요구하는 규약을 만족하지 못할 가능성이 크다.

<br/>

## 더 좋은 방법은 없을까..? - 컴포지션

다행히 이상의 문제를 모두 피해 가는 묘안이 있다. 기존 클래스를 확장하는 대신, 새로운 클래스를 만들고 private 필드로 기존 클래스의 인스턴스를 참조하게 하자. 
기존 클래스가 새로운 클래스의 구성요소로 쓰인다는 뜻에서 이러한 설계를 컴포지션(구성)이라 한다.  
새 클래스의 인스턴스 메서드들은 기존 클래스의 대응하는 메서드를 호출해 그 결과를 반환한다. 이 방식을 전달(forwarding)이라 하며, 
새 클래스의 메서드들을 전달 메서드(forwarding method)라 부른다. 그 결과 새로운 클래스는 기존 클래스의 내부 구현 방식의 영향에 벗어나며, 
심지어 기존 클래스에 새로운 메서드가 추가되더라도 전혀 영향을 받지 않는다.

<br/>

### 컴포지션 예시

```java
// 코드 18-2 래퍼 클래스 - 상속 대신 컴포지션을 사용했다. (117-118쪽)
public class InstrumentedSet<E> extends ForwardingSet<E> {
    private int addCount = 0;

    public InstrumentedSet(Set<E> s) {
        super(s);
    }

    @Override public boolean add(E e) {
        addCount++;
        return super.add(e);
    }
    @Override public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return super.addAll(c);
    }
    public int getAddCount() {
        return addCount;
    }

    public static void main(String[] args) {
        InstrumentedSet<String> s = new InstrumentedSet<>(new HashSet<>());
        s.addAll(List.of("틱", "탁탁", "펑"));
        System.out.println(s.getAddCount());
    }
}
```

```java
// 코드 18-3 재사용할 수 있는 전달 클래스 (118쪽)
public class ForwardingSet<E> implements Set<E> {
    private final Set<E> s;
    public ForwardingSet(Set<E> s) { this.s = s; }

    public void clear()               { s.clear();            }
    public boolean contains(Object o) { return s.contains(o); }
    public boolean isEmpty()          { return s.isEmpty();   }
    public int size()                 { return s.size();      }
    public Iterator<E> iterator()     { return s.iterator();  }
    public boolean add(E e)           { return s.add(e);      }
    public boolean remove(Object o)   { return s.remove(o);   }
    public boolean containsAll(Collection<?> c)
                                   { return s.containsAll(c); }
    public boolean addAll(Collection<? extends E> c)
                                   { return s.addAll(c);      }
    public boolean removeAll(Collection<?> c)
                                   { return s.removeAll(c);   }
    public boolean retainAll(Collection<?> c)
                                   { return s.retainAll(c);   }
    public Object[] toArray()          { return s.toArray();  }
    public <T> T[] toArray(T[] a)      { return s.toArray(a); }
    @Override public boolean equals(Object o)
                                       { return s.equals(o);  }
    @Override public int hashCode()    { return s.hashCode(); }
    @Override public String toString() { return s.toString(); }
}
```

InstrumentedSet은 HashSet의 모든 기능을 정의한 Set 인터페이스를 활용해 설계되어 견고하고 아주 유연하다.
구체적으로 Set 인터페이스를 구현했고, Set의 인스턴스를 인수로 받는 생성자를 하나 제공한다.
위와 같은 컴포지션 방식은 한 번만 구현해두면 어떠한 Set 구현체라도 계측할 수 있으며, 기존 생성자들과도 함께 사용할 수 있다.

다른 Set 인스턴스를 감싸고(wrap) 있다는 뜻에서 InstrumentSet 같은 클래스를 래퍼 클래스라 하며, 다른 Set에 계측 기능을 덧씌운다는 뜻에서 
데코레이터 패턴(Decorator patten)이라고 한다. 컴포지션과 전달의 조합은 넓은 의미로 위임(delegation)이라고 부른다. 단, 엄밀히 따지면
래퍼 객체가 내부 객체에 자기 자신의 참조를 넘기는 경우만 위임에 해당한다.

래퍼 클래스는 단점이 거의 없다. 한 가지, 래퍼 클래스가 콜백(callback) 프레임워크와는 어울리지 않는다는 점만 주의하면 된다. 
콜백 프레임워크에서는 자기 자신의 참조를 다른 객체에 넘겨서 다음 호출(콜백) 때 사용하도록 한다. 
내부 객체는 자신을 감싸고 있는 래퍼의 존재를 모르니 대신 자신(this)의 참조를 넘기고, 콜백 때는 래퍼가 아닌 내부 객체를 호출하게 된다. 이를 SELF 문제라고 한다.

<br/>

## 그렇다면 상속은 언제..?

상속은 반드시 하위 클래스가 상위 클래스의 '진짜' 하위 타입인 상황에서만 쓰여야 한다.
즉, 클래스 B가 클래스 A와 is-a 관계일 때만 클래스 A를 상속해야 한다.

<br/>

### 자바에서 상속을 잘못 사용한 예시

자바 플랫폼 라이브러리에서도 이 원칙을 명백히 위반한 클래스들을 찾아볼 수 있다. 
예를 들어, 스택은 벡터가 아니므로 Stack은 Vector를 확장해서는 안 됐다. 마찬가지로, 속성 목록도 해시테이블이 아니므로
Properties도 Hashtable을 확장해서는 안 됐다. 두 사례 모두 컴포지션을 사용했다면 더 좋았을 것이다.

컴포지션을 써야 할 상황에서 상속을 사용하는 건 내부 구현을 불필요하게 노출하는 꼴이다. 
그 결과 API가 내부 구현에 묶이고 그 클래스의 성능도 영원히 제한된다. 더 심각한 문제는 클라이언트가 노출된 내부에 직접 접근할 수 있다는 점이다.
예컨대 Properties의 인스턴인 p가 있을 때, p.getProperty(key)와 p.get(key)는 결과가 다를 수 있다.
전자가 Properties의 기본 동작인 데 반해, 후자는 Hashtable로부터 물려받은 메서드이기 때문이다. 

가장 심각한 문제는 클라이언트에서 상위 클래스를 직접 수정하여 하위 클래스의 불변식을 해칠 수 있다는 사실이다.
예컨대 Properties는 키와 값으로 문자열만 허용하도록 설계하려 했으나, 상위 클래스인 Hashtable의 메서드를 직접 호출하면 이 불변식을 깨버릴 수 있다.
불변식이 한번 깨지면 다른 Properties API는 더 이상 사용할 수 없다.


컴포지션 대신 상속을 사용하기로 결정하기 전에 마지막으로 자문해야 할 질문을 소개한다.  
확장하려는 클래스의 API에 아무런 결함이 없는가?  
결함이 있다면, 이 결함이 여러분 클래스의 API까지 전파돼도 괜찮은가?  
컴포지션으로는 이런 결함을 숨기는 새로운 API를 설계할 수 있지만, 상속은 상위 클래스의 API를 '그 결함까지도' 그대로 승계한다.

<br/>

## 핵심 정리

- 상속은 강력하지만 캡슐화를 해친다는 문제가 있다.
- 상속은 상위 클래스와 하위 클래스가 순수한 is-a 관계일 때만 써야 한다.
    - 하위 클래스의 패키지가 상위 클래스와 다르고, 확장을 고려해 설계되지 않았다면 여전히 문제될 수 있다.
- 상속의 취약점을 피하려면 상속 대신 컴포지션과 전달을 사용하자.
    - 특히 래퍼 클래스로 구현할 적당한 인터페이스 가있다면 더욱 그렇다. 래퍼 클래스는 하위클래스보다 견고하고 강력하다.
    
