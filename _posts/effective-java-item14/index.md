---
title: "[이펙티브 자바] 14. Comparable을 구현할지 고려하라"  
date: 2021-12-21  
tags:
- java
- book
---

## compareTo, Comparable?

- compareTo는 단순 동치성 비교에 더해 순서까지 비교할 수 있으며, 제네릭하다.
- Comparable을 구현했다는 것은 그 클래스의 인스턴스들에는 자연적인 순서(natural order)가 있음을 뜻한다.
```java
Arrays.sort(a);
```
- Comparable을 구현한 객체들의 배열은 위처럼 손쉽게 정렬할 수 있다.
- 검색, 극단값 계산, 자동 정렬되는 컬렉션 관리도 역시 쉽게 할 수 있다.

```java
public class WordList {
    public static void main(String[] args) {
        Set<String> s = new TreeSet<>();
        Collections.addAll(s, args);
        System.out.println(s);
    }
}
```
- 위 프로그램은 명령줄 인수들을 (중복을 제거하고) 알파벳순으로 출력한다.
    - String이 Comparable을 구현한 덕분임.
    
- 사실상 자바 플랫폼 라이브러리의 모든 값 클래스와 열거 타입이 Comparable을 구현했다.
- 알파벳, 숫자, 연대 같이 순서가 명확한 값 클래스를 작성한다면 반드시 Comparable 인터페이스를 구현하자.

<br/>

## compareTo 메서드의 일반 규약

> 이 객체와 주어진 객체의 순서를 비교한다. 이 객체가 주어진 객체보다 작으면 음의 정수를, 같으면 0을, 크면 양의 정수를 반환한다.
> 이 객체와 비교할 수 없는 타입의 객체가 주어지면 ClassCastException을 던진다.
> - Comparable을 구현한 클래스는 모든 x,y에 대해 sgn(x.compareTo(y)) == -sgn(y.compareTo(x))여야 한다 (따라서 x.compareTo(y)는 y.compareTo(x)가 예외를 던질 때에 한해 예외를 던져야 한다)
> - Comparable을 구현한 클래스는 추이성을 보장해야 한다. 즉, (x.compareTo(y) > 0 && y.compareTo(z) > 0)이면 x.compareTo(z) > 0이다.
> - Comparable을 구현한 클래스는 모든 z에 대해 x.compareTo(y) == 0이면 sgn(x.compareTo(z)) == sgn(y.compareTo(z))다.
> - 이번 권고가 필수는 아니지만 꼭 지키는게 좋다. (x.compareTo(y) == 0) == (x.equals(y))여야 한다. Comparable을 구현하고 이 권고를 지키지 않는 모든 클래스는 그 사실을 명시해야 한다.  
> "주의: 이 클래스의 순서는 equals 메서드와 일관되지 않다."

- 첫 번째 규약은 두 객체 참조의 순서를 바꿔 비교해도 예상한 결과가 나와야 한다는 얘기.
  - 첫 번째 객체가 두 번째 객체보다 작으면, 두 번째가 첫 번째보다 커야 한다.
  - 첫 번째가 두 번째와 크기가 같다면, 두 번째는 첫 번째와 같아야 한다.
  - 첫 번째가 두 번째보다 크면, 두 번째는 첫 번째보다 작아야 한다.
- 두 번째 규약은 첫 번째가 두 번째보다 크고 두 번째가 세 번째보다 크면, 첫 번째는 세 번째보다 커야 한다는 뜻.
- 세 번째 규약은 크기가 같은 객체들끼리는 어떤 객체와 비교하더라도 항상 같아야 한다는 뜻.
- 마지막 규약은 필수는 아니지만 꼭 지키길 권한다.
  - compareTo 메서드로 수행한 동치성 테스트의 결과가 equals와 같아야 한다는 것.
  - compareTo의 순서와 equals의 결과가 일관되지 않은 클래스도 여전히 동작은 하지만 이 클래스의 객체를 정렬된 컬렉션애 넣으면 해당 컬렉션이 구현한 인터페이스에 정의된 동작과 엇박자를 낼 것.
  - 이 인터페이스들은 equals 메서드의 규약을 따른다고 되어 있지만, 동치성을 비교할 때 equals 대신 compareTo를 사용하기 때문.
  
<br/>

- 모든 객체에 대해 전역 동치관계를 부여하는 equals 메서드와 달리, compareTo는 타입이 다른 객체를 신경 쓰지 않아도 된다.
  - 타입이 다른 객체가 주어지면 간단히 ClassCastException을 던져도 된다.
- hashCode 규약을 지키지 못하면 해시를 사용하는 클래스와 어울리지 못하듯, compareTo 규약을 지키지 못하면 비교를 활용하는 클래스와 어울리지 못함.
  - 대표적인 예로 정렬된 컬렉션인 TreeSet, TreeMap, 검색과 정렬 알고리즘을 활용하는 유틸리티 클래스인 Collections, Arrays


<br/>

## 객체 참조 필드가 하나뿐인 비교자

- Comparable은 타입을 인수로 받는 제네릭 인터페이스이므로 compareTo 메서드의 인수 타입은 컴파일타임에 정해진다.
  - 입력 인수의 타입을 확인하거나 형변환할 필요가 없다는 뜻.
- null을 인수로 넣어 호출하면 NullPointerException을 던져야 함.

- compareTo 메서드는 각 필드가 동치인지를 비교하는 게 아니라 그 순서를 비교함.
- 객체 참조 필드를 비교하려면 compareTo 메서드를 재귀적으로 호출함.
- Comparable을 구현하지 않은 필드나 표준이 아닌 순서로 비교해야 한다면 비교자(Comparator)를 대신 사용함.
  - 비교자는 직접 만들거나 자바가 제공하는 것 중에 골라 쓰면 됨.
    ```java
    // 코드 14-1 객체 참조 필드가 하나뿐인 비교자 (90쪽)
    public final class CaseInsensitiveString
    implements Comparable<CaseInsensitiveString> {
    
        // 자바가 제공하는 비교자를 사용해 클래스를 비교한다.
        public int compareTo(CaseInsensitiveString cis) {
            return String.CASE_INSENSITIVE_ORDER.compare(s, cis.s);
        }
    }
    ```
    - CaseInsensitiveString의 참조는 CaseInsensitiveString 참조와만 비교할 수 있음.

- 정수 기본 타입 필드를 비교할 때도 박싱된 기본 타입 클래스의 정적 메서드인 compare를 이용하자.
  - compareTo 메서드에서 관계 연산자 <,>를 사용하는 이전 방식은 거추장스럽고 오류를 유발하니, 추천하지 않음.

<br/>

## 기본 타입 필드가 여럿일 때의 비교자

```java
// 코드 14-2 기본 타입 필드가 여럿일 때의 비교자 (91쪽)
public int compareTo(PhoneNumber pn) {
    int result = Short.compare(areaCode, pn.areaCode);
    if (result == 0)  {
        result = Short.compare(prefix, pn.prefix);
        if (result == 0)
            result = Short.compare(lineNum, pn.lineNum);
    }
    return result;
}
```
- 클래스에 핵심 필드가 여러 개라면 어느 것을 먼저 비교하느냐가 중요해진다.
- 가장 핵심적인 필드부터 비교해나가자.
  - 비교 결과가 0이 아니라면, 즉 순서가 결정되면 거기서 끝임.
  - 가장 핵심이 되는 필드가 똑같다면, 똑같지 않은 필드를 찾을 때까지 그 다음으로 중요한 필드를 비교해나감.

<br/>

## 비교자 생성 메서드를 활용한 비교자

```java
 // 코드 14-3 비교자 생성 메서드를 활용한 비교자 (92쪽)
private static final Comparator<PhoneNumber> COMPARATOR =
        comparingInt((PhoneNumber pn) -> pn.areaCode)
                .thenComparingInt(pn -> pn.prefix)
                .thenComparingInt(pn -> pn.lineNum);

public int compareTo(PhoneNumber pn) {
    return COMPARATOR.compare(this, pn);
}
```

- 자바 8에서는 Comparator 인터페이스가 일련의 비교자 생성 메서드와 팀을 꾸려 메서드 연쇄 방식으로 비교자를 생성할 수 있게 되었다.
  - 이 비교자들을 Comparable 인터페이스가 원하는 compareTo 메서드를 구현하는 데 멋지게 활용할 수 있다.
  - 이 방식은 간결하지만 약간의 성능 저하가 뒤따름.
- Comparator는 수많은 보조 생성 메서드들로 중무장하고 있음.
  - long과 double용으로는 comparingInt와 thenComparingInt의 변형 메서드도 준비되어 있음.
  - short처럼 더 작은 정수 타입에는 int용 버전을 사용하면 됨.
  - 이런 식으로 자바의 숫자용 기본 타입을 모두 커버함.
  
- 객체 참조용 비교자 생성 메서드도 준비되어 있음.
- comparing이라는 정적 메서드 2개가 다중정의되어 있음.
  - 첫 번째는 키 추출자를 받아서 그 키의 자연적 순서를 사용함.
  - 두 번째는 키 추출자 하나와 추출된 키를 비교할 비교자까지 총 2개의 인수를 받음.
- thenComparing이란 인스턴스 메서드 3개가 다중정의되어 있음.
  - 첫 번째는 비교자 하나만 인수로 받아 그 비교자로 부차 순서를 정함.
  - 두 번째는 키 추출자를 인수로 받아 그 키의 자연적 순서로 보조 순서를 정함.
  - 마지막 세 번째는 키 추출자 하나와 추출된 키를 비교할 비교자까지 총 2개의 인수를 받음.

<br/>

## 주의사항

- 이따금 '값의 차'를 기준으로 첫 번째 값이 두 번째 값보다 작으면 음수를, 두 값이 같으면 0을, 첫 번째 값이 크면 양수를 반환하는 compareTo나 compare 메서드와 마주할 것.
```java
static Comparator<Object> hashCodeOrder = new Comparator<>() {
    public int compare(Object o1, Object o2) {
        return o1.hashCode() - o2.hashCode();
    }
};
```
- 이 방식은 사용하면 안 됨.
  - 정수 오버플로를 일으키거나 IEEE 754 부동소수점 계산 방식에 따른 오류를 낼 수 있음.
- 대신 다음의 두 방식 중 하나를 사용하자
```java
static Comparator<Object> hashCodeOrder = new Comparator<>() {
    public int compare(Object o1, Object o2) {
        return Integer.compare(o1.hashCode(), o2.hashCode());
    }
};
```
```java
static Comparator<Object> hashCodeOrder = 
        Comparator.comparingInt(o -> o.hashCode());
};
```

<br/>

## 핵심 정리

- 순서를 고려해야 하는 값 클래스를 작성한다면 꼭 Comparable 인터페이스를 구현하여, 그 인스턴스들을 쉽게 정렬하고, 검색하고, 비교 기능을 제공하는 컬렉션과 어우러지도록 해야 함.
- compareTo 메서드에서 필드의 값을 비교할 때 <,> 연산자는 쓰지 말자.
  - 대신 박싱된 기본 타입 클래스가 제공하는 정적 compare 메서드나 Comparator 인터페이스가 제공하는 비교자 생성 메서드를 사용하자.