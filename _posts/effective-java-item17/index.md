---
title: "[이펙티브 자바] 17. 변경 가능성을 최소화하라"  
date: 2021-12-30  
tags:
- java
- book
---

불변 클래스란 간단히 말해 그 인스턴스의 내부 값을 수정할 수 없는 클래스다.  
불변 인스턴스에 간직된 정보는 고정되어 객체가 파괴되는 순간까지 절대 달라지지 않는다.

자바 플랫폼 라이브러리에도 다양한 불변 클래스가 있다.  
String, 기본 타입의 박싱된 클래스들, BigInteger, BigDecimal이 여기 속한다.

불변 클래스는 가변 클래스보다 설계하고 구현하고 사용하기 쉬우며, 오류가 생길 여지도 적고 훨씬 안전하다.  
클래스를 불변으로 만들려면 다음 다섯 가지 규칙을 따르면 된다.

- 객체의 상태를 변경하는 메서드(변경자)를 제공하지 않는다.
- 클래스를 확장할 수 없도록 한다.
- 모든 필드를 final로 선언한다.
- 모든 필드는 private으로 선언한다.
- 자신 외에는 내부의 가변 컴포넌트에 접근할 수 없도록 한다.

```java
public final class Complex {
    private final double re;
    private final double im;

    public static final Complex ZERO = new Complex(0, 0);
    public static final Complex ONE  = new Complex(1, 0);
    public static final Complex I    = new Complex(0, 1);

    public Complex(double re, double im) {
        this.re = re;
        this.im = im;
    }

    public double realPart()      { return re; }
    public double imaginaryPart() { return im; }

    public Complex plus(Complex c) {
        return new Complex(re + c.re, im + c.im);
    }

    public Complex minus(Complex c) {
        return new Complex(re - c.re, im - c.im);
    }

    public Complex times(Complex c) {
        return new Complex(re * c.re - im * c.im,
                re * c.im + im * c.re);
    }

    public Complex dividedBy(Complex c) {
        double tmp = c.re * c.re + c.im * c.im;
        return new Complex((re * c.re + im * c.im) / tmp,
                (im * c.re - re * c.im) / tmp);
    }

    @Override public boolean equals(Object o) {
        if (o == this)
            return true;
        if (!(o instanceof Complex))
            return false;
        Complex c = (Complex) o;

        // == 대신 compare를 사용하는 이유는 63쪽을 확인하라.
        return Double.compare(c.re, re) == 0
                && Double.compare(c.im, im) == 0;
    }
    @Override public int hashCode() {
        return 31 * Double.hashCode(re) + Double.hashCode(im);
    }

    @Override public String toString() {
        return "(" + re + " + " + im + "i)";
    }
}
```
이 사칙연산 메서드들이 인스턴스 자신은 수정하지 않고 새로운 Complex 인스턴스를 만들어 반환하는 모습에 주목하자.  
이처럼 피연산자에 함수를 적용해 그 결과를 반환하지만, 피연산자 자체는 그대로인 프로그래밍 패턴을 함수형 프로그래밍이라 한다.

이와 달리, 절차적 혹은 명령형 프로그래밍에서는 메서드에서 피연산자인 자신을 수정해 자신의 상태가 변하게 된다.

함수형 프로그래밍에 익숙하지 않다면 조금 부자연스러워 보일 수도 있지만, 이 방식으로 프로그래밍하면 코드에서 불변이 되는 영역의 비율이 높아지는 장점을 누릴 수 있다.  
불변 객체는 단순하다. 불변 객체는 생성된 시점의 상태를 파괴될 때까지 그대로 간직한다.

모든 생성자가 클래스 불변식(class invariant)을 보장한다면 그 클래스를 사용하는 프로그래머가 다른 노력을 들이지 않더라도 영원히 불변으로 남는다.  
반면 가변 객체는 임의의 복잡한 상태에 놓일 수 있다. 변경자 메서드가 일으키는 상태 전이를 정밀하게 문서로 남겨놓지 않은 가변 클래스는 믿고 사용하기 어려울 수도 있다.

<br/>

## 불변 객체 장점

불변 객체는 근본적으로 스레드 안전하여 따로 동기화할 필요 없다.  
불변 객체에 대해서는 그 어떤 스레드도 다른 스레드에 영향을 줄 수 없으니 불변 객체는 안심하고 공유할 수 있다.  
따라서 불변 클래스라면 한번 만든 인스턴스를 최대한 재활용하기를 권한다.
가장 쉬운 재활용 방법은 자주 쓰이는 값들을 상수(public static final)로 제공하는 것이다.

불변 클래스는 자주 사용되는 인스턴스를 캐싱하여 같은 인스턴스를 중복 생성하지 않게 해주는 정적 팩터리를 제공할 수 있다. 박싱된 기본 타입 클래스 전부와 BigInteger가 여기 속한다.  
이런 정적 팩터리를 사용하면 여러 클라이언트가 인스턴스를 공유하여 메모리 사용량과 가비지 컬렉션 비용이 줄어든다.  
새로운 클래스를 설계할 때 public 생성자 대신 정적 팩터리르 만들어두면, 클라이언트를 수정하지 않고도 필요에 따라 캐시 기능을 덧붙일 수 있다.

불변 객체를 자유롭게 공유할 수 있다는 점은 방어적 복사도 필요 없다는 결론으로 자연스럽게 이어진다.
아무리 복사해봐야 원본과 똑같으니 복사 자체가 의미 없다. 그러니 불변 클래스는 clone 메서드나 복사 생성자를 제공하지 않는 게 좋다.

불변 객체는 자유롭게 공유할 수 있음은 물론, 불변 객체끼리는 내부 데이터를 공유할 수 있다.  
ex) BigInteger 클래스 내부에는 부호인 int 변수, 크기인 int 배열이 있다. negate 메서드는 크기가 같고 부호만 반대인 새로운 BigInteger를 생성하는데, 
이때 배열은 비록 가변이지만 복사하지 않고 원본 인스턴스와 공유해도 된다. 그 결과 새로 만든 BigInteger 인스턴스도 원본 인스턴스가 가리키는 내부 배열을 그대로 가리킨다.

객체를 만들 때 다른 불변 객체들을 구성요소로 사용하면 이점이 많다.
값이 바꾸지 않는 구성요소들로 이뤄진 객체라면 그 구조가 아무리 복잡하더라도 불변식을 유지하기 훨씬 수월하기 때문이다.

불변 객체는 그 자체로 실패 원자성을 제공한다.

<br/>

## 불변 객체 단점

불변 클래스에도 단점은 있다. 값이 다르면 반드시 독립된 객체로 만들어야 한다는 것이다.  
값의 가짓수가 많다면 이들을 모두 만드는 데 큰 비용을 처리해야 한다.  
원하는 객체를 완성하기까지의 단계가 많고, 그 중간 단계에서 만들어진 객체들이 모두 버려진다면 성능 문제가 더 불거진다.  
이 문제에 대처하는 방법은 두 가지다.

흔히 쓰일 다단계 연산들을 예측하여 기본 기능으로 제공하는 방법.
- 다단계 연산을 기본으로 제공한다면 더 이상 각 단계마다 객체를 생성하지 않아도 된다.  
   - ex) BigInteger는 모듈러 지수 같은 다단계 연산 속도를 높여주는 가변 동반 클래스를 package-private으로 두고 있다.
  
클라이언트들이 원하는 복잡한 연산들을 정확히 예측할 수 있다면 package-private의 가변 동반 클래스만으로 충분하다. 그렇지 않다면 이 클래스를 public으로 제공하는게 최선이다.
    ex) String 클래스. String의 가변 동반 클래스는 StringBuilder(와 StringBuffer)

<br/>

## 불변 클래스를 만드는 또 다른 설계 방법

클래스가 불변임을 보장하려면 자신을 상속하지 못하게 해야 함.  
자신을 상속하지 못하게 하는 가장 쉬운 방법은 final 클래스로 선언하는 것이지만, 더 유연한 방법이 있다.  
모든 생성자를 private 혹은 package-private으로 만들고 public 정적 팩터리를 제공하는 방법이다.
  
```java
public class Complex {
    private final double re;
    private final double im;

    private Complex(double re, double im) {
        this.re = re;
        this.im = im;
    }

    // 코드 17-2 정적 팩터리(private 생성자와 함께 사용해야 한다.) (110-111쪽)
    public static Complex valueOf(double re, double im) {
        return new Complex(re, im);
    }
}
```
외부에서 볼 수 없는 package-private 구현 클래스를 원하는 만큼 만들어 활용할 수 있으니 이 방식이 훨씬 유연하다.  
패키지 바깥의 클라이언트에서 바라본 이 불변 객체는 사실상 final이다.  
public이나 protected 생성자가 없으니 다른 패키지에서는 이 클래스를 확장하는 게 불가능하기 때문이다.  
정적 팩터리 방식은 다수의 구현 클래스를 활용한 유연성을 제공하고, 이에 더해 다음 릴리스에서 객체 캐싱 기능을 추가해 성능을 끌어올릴 수도 있다.

불변 클래스의 규칙 목록에 따르면 모든 필드가 final이고 어떤 메서드도 그 객체를 수정할 수 없어야 한다.
사실 이 규칙은 조금 과한 감이 있어서, 성능을 위해 다음처럼 살짝 완화할 수 있다.  
"어떤 메서드도 객체의 상태 중 외부에 비치는 값을 변경할 수 없다"  
어떤 불변 클래스는 계산 비용이 큰 값을 나중에 계산하여 final이 아닌 필드에 캐시해놓기도 한다.

<br/>

## 정리
- getter가 있다고 해서 무조건 setter를 만들지는 말자.  
    - 클래스는 꼭 필요한 경우가 아니라면 불변이어야 한다.  
    - 불변 클래스는 장점이 많으며, 단점이라곤 특정 상황에서의 잠재적 성능 저하뿐이다.

- PhoneNumber와 Complex 같은 단순한 값 객체는 항상 불변으로 만들자.  
    - String과 BigInteger처럼 무거운 값 객체도 불변으로 만들 수 있는지 고심해야 한다.  
    - 성능 때문에 어쩔 수 없다면 불변 클래스와 쌍을 이루는 가변 동반 클래스를 public 클래스로 제공하도록 하자.

- 불변으로 만들 수 없는 클래스라도 변경할 수 있는 부분을 최소한으로 줄이자.  
    - 다른 합당한 이유가 없다면 모든 필드는 private final이어야 한다.

- 생성자는 불변식 설정이 모두 완료된, 초기화가 완벽히 끝난 상태의 객체를 생성해야 한다.  
    - 이유가 없다면 생성자와 정적 팩터리 외에는 그 어떤 초기화 메서드도 public으로 제공해서는 안 된다.  
    - 객체를 재활용할 목적으로 상태를 다시 초기화하는 메서드도 안 된다. 복잡성만 커지고 성능 이점은 거의 없다.