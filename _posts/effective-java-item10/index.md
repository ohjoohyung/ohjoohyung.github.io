---
title: "[이펙티브 자바] 10. equals는 일반 규약을 지켜 재정의하라"  
date: 2021-12-19 00:40
tags:
- java
- book
---

## equals를 재정의하지 않는 상황

1. 각 인스턴스가 본질적으로 고유하다.
    - 값을 표현하는 게 아니라 동작하는 개체를 표현하는 클래스.
    - Thread가 좋은 예.
2. 인스턴스의 '논리적 동치성(logical equality)'을 검사할 일이 없다.
3. 상위 클래스에서 재정의한 equals가 하위 클래스에도 딱 들어맞는다.
    - Set 구현체는 AbstractSet이 구현한 equals를 상속받아 씀.
    - List 구현체들은 AbstractList, Map 구현체들은 AbstractMap.
4. 클래스가 private이거나 package-private이고 equals 메서드를 호출할 일이 없다.

<br/>

## 그렇다면 equals를 재정의해야 할 때는 언제일까?

- 객체 식별성(object identity; 두 객체가 물리적으로 같은가)이 아니라 논리적 동치성을 확인해야 하는데, 상위 클래스의 equals가 논리적 동치성을 비교하도록 재정의되지 않았을 때.
    - 주로 값 클래스들이 여기 해당함.
- 값 클래스란 Integer, String처럼 값을 표현하는 클래스를 뜻함.
    - 객체가 같은지가 아니라 값이 같은지를 확인
    - 재정의해두면, 인스턴스는 값을 비교하길 원하는 프로그래머의 기대에 부응함은 물론 Map의 키와 Set의 원소로 사용할 수 있게 된다.
- 값 클래스라 해도, 값이 같은 인스턴스가 둘 이상 만들어지지 않음을 보장하는 인스턴스 통제 클래스라면 equals를 재정의하지 않아도 됨.
    Enum도 마찬가지.

<br/>

## equals 메서드 재정의 시 따라야 하는 규약

- equals 메서드는 동치관계(equivalence relation)를 구현하며, 다음을 만족한다.  
    - 동치관계란 집합을 서로 같은 원소들로 이뤄진 부분집합으로 나누는 연산.  
    - 부분집합을 동치류(equivalence class; 동치 클래스)라 함.
    - equals 메서드가 쓸모 있으려면 모든 원소가 같은 동치류에 속한 어떤 원소와도 서로 교환할 수 있어야 함.
    
### 규약 다섯 가지

- 반사성(reflexivity): null이 아닌 모든 참조 값 x에 대해, x.equals(x)는 true다.
- 대칭성(symmetry): null이 아닌 모든 참조 값 x,y에 대해, x.equals(y)가 true면 y.equals(x)도 true다.
- 추이성(transitivity): null이 아닌 모든 참조 값 x,y,z에 대해, x.equals(y)가 true이고, y.equals(z)도 true면 x.equals(z)도 true다.
- 일관성(consistency): null이 아닌 모든 참조 값 x,y에 대해, x.equals(y)를 반복해서 호출하면 항상 true를 반환하거나 항상 false를 반환한다.
- null 아님: null이 아닌 모든 참조 값 x에 대해, x.equals(null)은 false다.

### 반사성

- 객체는 자기 자신과 같아야 한다는 뜻.
- 이 요건을 어긴 클래스의 인스턴스를 컬렉션에 넣은 다음 contains 메서드를 호출하면 넣은 인스턴스가 없다고 답할 것.

### 대칭성

- 두 객체는 서로에 대한 동치 여부에 똑같이 답해야 한다는 뜻.

```java
public final class CaseInsensitiveString {
    private final String s;

    public CaseInsensitiveString(String s) {
        this.s = Objects.requireNonNull(s);
    }

    // 대칭성 위배!
    @Override
    public boolean equals(Object o) {
        if (o instanceof CaseInsensitiveString)
            return s.equalsIgnoreCase(
                    ((CaseInsensitiveString) o).s);
        if (o instanceof String)  // 한 방향으로만 작동한다!
            return s.equalsIgnoreCase((String) o);
        return false;
    }
}
```
```java
CaseInsensitiveString cis = new CaseInsensitiveString("Polish");
String s = "polish";
```
- cis.equals(s)는 true를 반환.  
s.equals(cis)는 false를 반환.
    - 대칭성 위반!
```java
List<CaseInsensitiveString> list = new ArrayList<>();
list.add(cis);
```
- list.contains(s)를 호출하면 현재의 OpenJDK에서는 false를 반환.
    - OpenJDK 버전이 바뀌거나 다른 JDK에서는 true를 반환하거나 런타임 예외를 던질 수도 있음.
- equals 규약을 어기면 그 객체를 사용하는 다른 객체들이 어떻게 반응할지 알 수 없다.
```java
@Override public boolean equals(Object o) {
    return o instanceof CaseInsensitiveString &&
            ((CaseInsensitiveString) o).s.equalsIgnoreCase(s);
}
```
- 수정된 equals의 모습. CaseInsensitiveString과만 연동하자.

### 추이성

- 첫 번째 객체와 두 번째 객체가 같고, 두 번째 객체와 세 번째 객체가 같다면, 첫 번째 객체와 세 번째 객체도 같아야 한다는 뜻.
- 상위 클래스에는 없는 새로운 필드를 하위 클래스에 추가하는 상황을 생각해보자.
```java
public class Point {
    private final int x;
    private final int y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Point))
            return false;
        Point p = (Point) o;
        return p.x == x && p.y == y;
    }
}
```
```java
public class ColorPoint extends Point {
    private final Color color;

    public ColorPoint(int x, int y, Color color) {
        super(x, y);
        this.color = color;
    }

    // 코드 10-2 잘못된 코드 - 대칭성 위배! (57쪽)
    @Override
    public boolean equals(Object o) {
        if (!(o instanceof ColorPoint))
            return false;
        return super.equals(o) && ((ColorPoint) o).color == color;
    }
}
```
- 일반 Point를 ColorPoint에 비교한 결과와 그 둘을 바꿔 비교한 결과가 다를 수 있음.
    - Point의 equals는 색상을 무시하고, ColorPoint의 equals는 입력 매개변수의 클래스 종류가 다르다며 매번 false만 반환할 것.
    - 즉, 대칭성을 위배함.
- ColorPoint.equals가 Point와 비교할 때는 색상을 무시하도록 변경하면?
```java
 @Override public boolean equals(Object o) {
    if (!(o instanceof Point))
        return false;

    // o가 일반 Point면 색상을 무시하고 비교한다.
    if (!(o instanceof ColorPoint))
        return o.equals(this);

    // o가 ColorPoint면 색상까지 비교한다.
    return super.equals(o) && ((ColorPoint) o).color == color;
}
```
- 대칭성을 지켜주지만, 추이성을 위배함.
```java
ColorPoint p1 = new ColorPoint(1, 2, Color.RED);
Point p2 = new Point(1, 2);
ColorPoint p3 = new ColorPoint(1, 2, Color.BLUE);
```
- p1.equals(p2), p2.equals(p3)는 true를 반환하지만 p1.equals(p3)는 false를 반환함.
    - p1과 p2, p2와 p3 비교는 색상을 무시했지만, p1과 p3 비교에서는 색상까지 고려했기 때문.
- 또한 이 방식은 무한 재귀에 빠질 위험도 있음.
- 이 현상은 모든 객체 지향 언어의 동치관계에서 나타나는 근본적인 문제.
    - 구체 클래스를 확장해 새로운 값을 추가하면서 equals 규약을 만족시킬 방법은 존재하지 않음.
```java
@Override public boolean equals(Object o) {
    if (o == null || o.getClass() != getClass())
        return false;
    Point p = (Point) o;
    return p.x == x && p.y == y;
}
```
- instanceof 검사를 getClass 검사로 바꾸게 되면?
    - 리스코프 치환 원칙에 위배된다.
        - 리스코프 치환 원칙에 따르면, 어떤 타입에 있어 중요한 속성이라면 그 하위 타입에서도 마찬가지로 중요하다. 따라서 그 타입의 모든 메서드가 하위 타입에서도 똑같이 잘 작동되어야 한다.
        - 즉, Point의 하위 클래스는 정의상 여전히 Point이므로 어디서든 Point로써 활용될 수 있어야 한다.
```java
// 단위 원 안의 모든 점을 포함하도록 unitCircle을 초기화한다. (58쪽)
private static final Set<Point> unitCircle = Set.of(
        new Point( 1,  0), new Point( 0,  1),
        new Point(-1,  0), new Point( 0, -1));  
public static boolean onUnitCircle(Point p) {
    return unitCircle.contains(p);
}
```

```java
public class CounterPoint extends Point {
    private static final AtomicInteger counter =
            new AtomicInteger();

    public CounterPoint(int x, int y) {
        super(x, y);
        counter.incrementAndGet();
    }
    public static int numberCreated() { return counter.get(); }
}
```
- 위와 같은 예시에서 CounterPoint의 인스턴스를 onUnitCircle 메서드에 넘기면 false를 반환할 것.
- Set을 포함하여 대부분의 컬렉션은 주어진 원소를 담고 있는지를 확인하는 작업에 eqauls를 이용함.
    - CounterPoint의 인스턴스는 어떤 Point와도 같을 수 없음.
    - instanceof 기반으로 올바로 구현했다면 CounterPoint 인스턴스를 건네줘도 onUnitCircle 메서드가 제대로 동작할 것.
    
```java
public class ColorPoint {
    private final Point point;
    private final Color color;

    public ColorPoint(int x, int y, Color color) {
        point = new Point(x, y);
        this.color = Objects.requireNonNull(color);
    }

    /**
     * 이 ColorPoint의 Point 뷰를 반환한다.
     */
    public Point asPoint() {
        return point;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof ColorPoint))
            return false;
        ColorPoint cp = (ColorPoint) o;
        return cp.point.equals(point) && cp.color.equals(color);
    }
}
```
- 괜찮은 우회 방법으로 컴포지션을 사용하면 됨.
- 자바 라이브러리에도 구체 클래스를 확장해 값을 추가한 클래스가 종종 있음
    - 대표적인 예로 java.sql.Timestamp.
    - java.sql.Timestamp는 java.util.Date를 확장해서 사용.
    - 따라서 섞어 사용하면 엉뚱하게 동작할 수 있으니 주의하자.
- 참고로 추상 클래스의 하위 클래스라면 equals 규약을 지키면서도 값을 추가할 수 있음.

### 일관성

- 두 객체가 같다면 (어느 하나 혹은 두 객체 모두가 수정되지 않는 한) 앞으로도 영원히 같아야 한다는 뜻.
- 클래스가 불변이든 가변이든 equals의 판단에 신뢰할 수 없는 자원이 끼어들게 해서는 안 됨.
    - 대표적인 예로 java.net.URL의 equals는 주어진 URL과 매핑된 호스트의 IP 주소를 이용해 비교함.
    - 호스트 이름을 IP 주소로 바꾸려면 네트워크를 통해야 하는데, 그 결과가 항상 같다고 보장할 수 없음.
    - 이렇게 구현한 것은 커다란 실수였으니 절대 따라 해서는 안 된다.
    - equals는 항시 메모리에 존재하는 객체만을 사용한 결정적 계산만 수행하자.

### null-아님

- 모든 객체가 null과 같지 않아야 한다는 뜻.
- 입력이 null인지를 확인해 자신을 보호해야 함.
```java
// 명시적 null 검사 - 필요 없다!
@Override
public boolean equals(Object o) {
    if (o == null) {
        return false;
    }
}
```
- 이런 검사는 필요치 않다.
```java
// 묵시적 null 검사 - 이쪽이 낫다!
@Override
public boolean equals(Object o) {
    if (!(o instanceof MyType)) {
        return false;
    }
    MyType mt = (MyType) o;
}
```
- equals는 건네받은 객체를 적절히 형변환한 후 필수 필드들의 값을 알아내야 하므로 형변환에 앞서 instanceof 연산자로 입력 매개변수가 올바른 타입인지 검사해야 한다.

<br/>

## equals 메서드 구현 방법 단계별 정리

1. == 연산자를 사용해 입력이 자기 자신의 참조인지 확인한다.
    - 자기 자신이면 true를 반환
2. instanceof 연산자로 입력이 올바른 타입인지 확인한다.
    - 올바른 타입은 equals가 정의된 클래스인 것이 보통이지만, 가끔은 그 클래스가 구현한 특정 인터페이스가 될 수도 있다.
3. 입력을 올바른 타입으로 형변환한다.
4. 입력 객체와 자기 자신의 대응되는 '핵심' 필드들이 모두 일치하는지 하나씩 검사한다.
    - float, double을 제외한 기본 타입 필드는 == 연산자로 비교하고, 참조 타입 필드는 각각의 eqauls 메서드로, float과 double은 Float.compare(float, float), Double.compare(double, double)로 비교한다.
        - Float.NAN, -0.0f, 특수한 부동소수 값을 다뤄야 하기 때문.
        - Float.equals와 Double.equals는 오토박싱을 수반할 수 있어 성능상 좋지 않다.
    - 배열 필드는 원소 각각을 비교하고 배열의 모든 원소가 핵심 필드라면 Arrays.equals 메서드들 중 하나를 사용하자.
    - null도 정상 값으로 취급하는 참조 타입 필드라면 Objects.equals(Object, Object)로 비교해 NullPointerException 발생을 예방하자.
    - 복잡한 필드를 가진 클래스는 필드의 표준형을 저장해두고 표준형끼리 비교하면 훨씬 경제적이다.
    - 어떤 필드를 먼저 비교하느냐가 equals의 성능을 좌우하기도 하므로 최상의 성능을 바란다면 다를 가능성이 더 크거나 비교하는 비용이 싼 필드를 먼저 비교하자.
    - 동기화용 lock 필드 같이 객체의 논리적 상태와 관련 없는 필드는 비교하면 안 된다.
    - 파생 필드는 굳이 비교할 필요는 없지만 비교하는 쪽이 더 빠를 때도 있다.
        - 파생 필드가 객체 전체의 상태를 대표하는 상황 (자신의 영역을 캐시해두는 클래스)
    
- equals를 다 구현했다면 세 가지만 자문해보자. 대칭적인가? 추이성이 있는가? 일관적인가?
    - 자문에서 끝내지 말고 단위 테스트를 작성해 돌려보자.
    - 나머지 요건도 만족해야 하지만, 이 둘이 문제되는 경우는 별로 없다.
    
```java
// 전형적인 equals 메서드의 예
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

    // 나머지 코드는 생략 - hashCode 메서드는 꼭 필요하다(아이템 11)!
}
```

<br/>

## 주의사항
- equals를 재정의할 땐 hashcode도 반드시 재정의하자.
- 너무 복잡하게 해결하려 들지 말자.
    - 필드들의 동치성만 검사해도 equals 규약을 어렵지 않게 지킬 수 있음.
    - 일반적으로 별칭은 비교하지 않는게 좋다.
- Object 외의 타입을 매개변수로 받는 equals 메서드는 선언하지 말자.
    ```java
    // 잘못된 예 - 입력 타입은 반드시 Object여야 한다!
    public boolean equals(MyClass o) {
    }
    ```
    - 재정의가 아니라 다중정의한 것.
    - 기본 equals를 그대로 둔 채로 추가한 것일지라도, 타입을 구체적으로 명시한 equals는 오히려 해가 됨.
    - @Override 애너테이션을 일관되게 사용하면 이러한 실수를 예방할 수 있다.
    
<br/>

## 매번 직접 equals를 작성해야할까?

- equals(hashCode도 마찬가지)를 작성하고 테스트하는 일은 지루하고 이를 테스트하는 코드도 항상 뻔함.
- 이 작업을 대신해줄 구글이 만든 AutoValue라는 프레임워크가 있음.
- 또한 대다수의 IDE도 같은 기능을 제공하므로 직접 작성하는 것보다는 IDE에 맡기자. (특별한 경우를 제외하고)

<br/>

## 핵심 정리

- 꼭 필요한 경우가 아니면 equals를 재정의하지 말자.
- 많은 경우에 Object의 equals가 원하는 비교를 정확히 수행해준다.
- 재정의해야 할 때는 그 클래스의 핵심 필드 모두를 빠짐없이, 다섯 가지 규약을 지켜가며 비교해야 한다.