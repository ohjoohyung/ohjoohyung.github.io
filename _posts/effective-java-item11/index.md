---
title: "[이펙티브 자바] 11. equals를 재정의하려거든 hashCode도 재정의하라"  
date: 2021-12-19 23:07
tags:
- java
- book
---

## hashCode 재정의

- equals를 재정의한 클래스 모두에서 hashCode도 재정의해야 한다.
    - 그렇지 않으면 hashCode 일반 규약을 어기게 되어 해당 클래스의 인스턴스를 HashMap이나 HashSet 같은 컬렉션의 원소로 사용할 때 문제를 일으킬 것.
- Object 명세에서 발췌한 규약이다.
  > - equals 비교에 사용되는 정보가 변경되지 않았다면, 애플리케이션이 실행되는 동안 그 객체의 hashCode 메서드는 몇 번을 호출해도 일관되게 항상 같은 값을 반환해야 한다. 단, 애플리케이션을 다시 실행한다면 이 값이 달라져도 상관없다.
  > - equals(Object)가 두 객체를 같다고 판단했다면, 두 객체의 hashCode는 똑같은 값을 반환해야 한다.
  > - equals(Object)가 두 객체를 다르다고 판단했더라도, 두 객체의 hashCode가 서로 다른 값을 반환할 필요는 없다. 단, 다른 객체에 대해서는 다른 값을 반환해야 해시테이블의 성능이 좋아진다.
  
- hashCode 재정의를 잘못했을 때 크게 문제가 되는 조항은 두 번째.
  - 논리적으로 같은 객체는 같은 해시코드를 반환해야 한다.

<br/>

## 예시
```java
public final class PhoneNumber {
    private final short areaCode, prefix, lineNum;

    public PhoneNumber(int areaCode, int prefix, int lineNum) {
        this.areaCode = rangeCheck(areaCode, 999, "지역코드");
        this.prefix   = rangeCheck(prefix,   999, "프리픽스");
        this.lineNum  = rangeCheck(lineNum, 9999, "가입자 번호");
    }

    private static short rangeCheck(int val, int max, String arg) {
        if (val < 0 || val > max)
            throw new IllegalArgumentException(arg + ": " + val);
        return (short) val;
    }

    @Override public boolean equals(Object o) {
        if (o == this)
            return true;
        if (!(o instanceof PhoneNumber))
            return false;
        PhoneNumber pn = (PhoneNumber)o;
        return pn.lineNum == lineNum && pn.prefix == prefix
                && pn.areaCode == areaCode;
    }
}
```
```java
Map<PhoneNumber, String> m = new HashMap<>();
m.put(new PhoneNumber(707, 867, 5309), "제니");
```

- m.get(new PhoneNumber(707, 867, 5309))를 실행하면 "제니"가 나와야 할 것 같지만, 실제로는 null을 반환함.
- PhoneNumber 클래스는 hashCode를 재정의하지 않았기 때문에 논리적 동치인 두 객체가 서로 다른 해시코드를 반환하여 두 번째 규약을 지키지 못함.
  - HashMap은 해시코드가 다른 엔트리끼리는 동치성 비교를 시도조차 하지 않도록 최적화되어 있음
  
- 좋은 해시 함수라면 서로 다른 인스턴스에 다른 해시코드를 반환한다.
  - hashCode의 세 번째 규약이 요구하는 속성.
- 이상적인 해시 함수는 주어진 (서로 다른) 인스턴스들을 32비트 정수 범위에 균일하게 분배해야 함.  

<br/>

### 좋은 hashCode를 작성하는 요령

1. int 변수 result를 선언한 후 값 c로 초기화한다. 이때 c는 해당 객체의 첫 번째 핵심 필드를 단계 2.a 방식으로 계산한 해시코드다

2. 해당 객체의 나머지 핵심 필드 f 각각에 대해 다음 작업을 수행한다.
    1. 해당 필드의 해시코드 c를 계산한다.
        1. 기본 타입 필드라면, Type.hashCode(f)를 수행한다. Type은 박싱 클래스.
        2. 참조 타입 필드면서 이 클래스의 equals 메서드가 이 필드의 equals를 재귀적으로 호출해 비교한다면, 이 필드의 hashCode를 재귀적으로 호출한다. 계산이 복잡해질 것 같으면 표준형을 만들어 그 표준형의 hashCode를 호출한다. 필드의 값이 null이면 0을 사용.
        3. 필드가 배열이라면, 핵심 원소 각각을 별도 필드처럼 다룬다. 이상의 규칙을 재귀적으로 적용해 각 핵심 원소의 해시코드를 계산한 다음, 단계 2.b 방식으로 갱신한다. 배열에 핵심 원소가 하나도 없다면 단순히 상수(0을 추천)를 사용한다. 모든 원소가 핵심 원소라면 Arrays.hashCode를 사용.
    2. 단계 2.a에서 계산한 해시코드 c로 result를 갱신함.  
    result = 31 * result + c;
3. result를 반환한다.

<br/>

- 파생 필드는 해시코드 계산에서 제외해도 됨.
- equals 비교에 사용되지 않은 필드는 '반드시' 제외해야 함.
    - hashCode 두 번째 규약을 어기게 될 위험이 있음.
- 2.b의 곱셈 31 * result는 필드를 곱하는 순서에 따라 result 값이 달라지게 함.
    - 클래스에 비슷한 필드가 여러 개일 때 해시 효과를 크게 높여줌.
    - 31로 정한 이유는 홀수이면서 소수이기 때문.
        - 짝수이고 오버플로가 발생한다면 정보를 잃게 됨.
        - 2를 곱하는 것은 시프트 연산과 같은 결과.
    
<br/>

### 예시에 요령 적용해보기

```java
 코드 11-2 전형적인 hashCode 메서드 (70쪽)
@Override public int hashCode() {
    int result = Short.hashCode(areaCode);
    result = 31 * result + Short.hashCode(prefix);
    result = 31 * result + Short.hashCode(lineNum);
    return result;
}
```
- 핵심 필드 3개만을 사용해 간단한 계산만 수행함.
- 비결정적 요소는 전혀 없으므로 동치인 PhoneNumber 인스턴스들은 같은 해시코드를 가질 것.
- 단순하고, 충분히 빠르고, 서로 다른 전화번호들은 다른 해시 버킷들로 제법 훌륭히 분배해줌.
    - 단, 해시 충돌이 더욱 적은 방법을 꼭 써야 한다면 구아바의 com.google.common.hash.Hashing을 참고.

```java
 코드 11-3 한 줄짜리 hashCode 메서드 - 성능이 살짝 아쉽다. (71쪽)
@Override public int hashCode() {
    return Objects.hash(lineNum, prefix, areaCode);
}
```
- Objects 클래스는 임의의 개수만큼 객체를 받아 해시코드를 계산해주는 정적 메서드인 hash를 제공함.
- 단 한줄로 작성할 수 있으나 아쉽게도 속도는 더 느림.
    - 입력 인수를 담기 위한 배열이 만들어지고, 입력 중 기본 타입이 있다면 박싱, 언박싱도 거쳐야 하기 때문.
- hash 메서드는 성능에 민감하지 않은 상황에서만 사용하자.

```java
 해시코드를 지연 초기화하는 hashCode 메서드 - 스레드 안정성까지 고려해야 한다. (71쪽)
private int hashCode; // 자동으로 0으로 초기화된다.

@Override public int hashCode() {
    int result = hashCode;
    if (result == 0) {
        result = Short.hashCode(areaCode);
        result = 31 * result + Short.hashCode(prefix);
        result = 31 * result + Short.hashCode(lineNum);
        hashCode = result;
    }
    return result;
}
```
- 클래스가 불변이고 해시코드를 계산하는 비용이 크다면, 매번 새로 계산하기 보다는 캐싱하는 방식을 고려해야 함.
- 이 타입의 객체가 주로 해시의 키로 사용될 것 같다면 인스턴스가 만들어질 때 해시코드를 계산해둬야 하지만 그렇지 않은 경우는 hashCode가 처음 불릴 때 계산하는 지연 초기화 전략을 사용할 수 있음.
    - 필드를 지연 초기화하려면 그 클래스를 스레드 안전하게 만들도록 신경 써야 함.
    
<br/>

## 주의 사항

- 성능을 높인답시고 해시코드를 계산할 때 핵심 필드를 생략해서는 안 됨.
    - 속도야 빨라지겠지만, 해시 품질이 나빠져 해시테이블의 성능을 심각하게 떨어뜨릴 수 있음.
    - 어떤 필드는 특정 영역에 몰린 인스턴스들의 해시코드를 넓은 범위로 고르게 퍼트려주는 효과가 있을지도 모르는데 이를 생략한다면 해시테이블의 속도가 선형으로 느려질 것임.
    - 실제 자바 2 전의 String은 최대 16개의 문자만으로 해시코드를 계산했음.
- hashCode가 반환하는 값의 생성 규칙을 API 사용자에게 자세히 공표하지 말자.
    - 그래야 클라이언트가 이 값에 의지하지 않게 되고, 추후에 계산 방식을 바꿀 수 있음.
    
<br/>

## 핵심 정리

- equals를 재정의할 때는 hashCode도 반드시 재정의해야 함.
- 재정의한 hashCode는 Object의 API 문서에 기술된 일반 규약을 따라야 하며, 서로 다른 인스턴스라면 되도록 해시코드도 서로 다르게 구현해야 함.
- 이는 조금 따분한 일이지만 AutoValue 프레임워크나 IDE의 힘을 빌리면 된다.