---
title: "[이펙티브 자바] 1. 생성자 대신 정적 팩터리 메서드를 고려하라"  
date: 2021-12-13 20:00:00 
tags:
- java
- book
---

- 클라이언트가 클래스의 인스턴스를 얻는 전통적인 수단은 public 생성자다.
- 클래스는 생성자와 별도로 정적 팩터리 메서드를 제공할 수 있다.
    - 정적 팩터리 메서드는 클래스의 인스턴스를 반환하는 단순한 정적 메서드를 뜻한다.
    - 정적 팩터리 메서드는 디자인 패턴에서의 팩터리 메서드와 다르다.

## 정적 메서드의 장점 5가지

1. 이름을 가질 수 있다.
    - 생성자에 넘기는 매개변수, 생성자 자체 만으로는 반환될 객체의 특성을 제대로 설명하지 못한다.
      반면, 정적 팩터리는 이름만 잘 지으면 반환될 객체의 특성을 쉽게 묘사할 수 있다.
        - BigInteger(int, int ,Random)과 BigInteger.probablaPrime 중 어느 쪽이
          '값이 소수인 BigInteger를 반환한다'는 의미를 더 잘 설명할 것 같은지 생각해보라.
    - 한 클래스에 시그니처가 같은 생성자가 여러 개 필요할 것 같으면, 생성자를 정적 팩터리 메서드로 바꾸고 각각의 차이를 잘 드러내는 이름을 지어주자.
2. 호출될 때마다 인스턴스를 새로 생성하지는 않아도 된다.
    - 불변 클래스는 인스턴스를 미리 만들어 놓거나 새로 생성한 인스턴스를 캐싱하여 재활용하는 식으로 불필요한 객체 생성을 피할 수 있다.
        - 대표적인 예로 Boolean.valueOf(boolean), 플라이웨이트 패턴
        - 플라이웨이트 패턴은 동일하거나 유사한 객체들 사이에 가능한 많은 데이터를 공유하여 메모리 사용을 최소화하는 디자인 패턴

            ![Untitled (64)](https://user-images.githubusercontent.com/62014888/146127817-4b75b2b3-9e47-4a6f-87ee-38629537abd7.png)
    
    - 정적 팩터리 방식의 클래스는 언제 어느 인스턴스를 살아 있게 할지를 철저히 통제할 수 있다.
        - 클래스를 통제하는 이유는?
          클래스를 싱글턴으로 만들 수도, 인스턴스화 불가로 만들 수도 있음.
          불변 값 클래스에서 동치인 인스턴스가 단 하나뿐임을 보장할 수 있음.
3. 반환 타입의 하위 타입 객체를 반환할 수 있는 능력이 있다.
    - 반환할 객체의 클래스를 자유롭게 선택할 수 있게 하는 '엄청난 유연성'을 선물한다!
    - 자바 8 전에는 인터페이스 정적 메서드를 선언할 수 없었다.
        - 그래서 자바 컬렉션 프레임워크는 Collections라는 인스턴스화 불가 클래스에서 정적 팩터리 메서드를 통해 구현체를 얻도록 했음.
    - 자바 8 후에는 인터페이스가 정적 메서드를 가질 수 있어졌기에 인스턴스화 불가 동반 클래스를 둘 이유가 별로 없어짐.
        - 그래서 이러한 List 인터페이스에 List.of()와 같은 정적 팩터리 메서드가 생김.

        ![Untitled (65)](https://user-images.githubusercontent.com/62014888/146127819-698c8dac-3c7a-4ea7-9fab-126a262cf05a.png)


1. 입력 매개변수에 따라 매번 다른 클래스의 객체를 반환할 수 있다.
    - EnumSet 클래스는 원소가 64개 이하면 RegularEnumSet 인스턴스를, 65개 이상이면 JumboEnumSet 인스턴스를 반환한다.
        - 클라이언트는 이 두 클래스의 존재를 모른다. 더 나아가 알 필요도 없다. EnumSet의 하위 클래스이기만 하면 되는 것이다.

2. 정적 팩터리 메서드를 작성하는 시점에는 반환할 객체의 클래스가 존재하지 않아도 된다.
    - 나중에 만들 클래스가 기존의 인터페이스나 클래스를 상속 받는 상황이라면 언제든지 의존성 주입 받아서 사용이 가능하다.
      반환값이 인터페이스여도 되며, 정적 팩터리 메서드의 변경 없이 구현체를 바꿔 끼울 수 있다.
    - 이러한 유연함은 서비스 제공자 프레임워크를 만드는 근간이 된다.
        - 서비스 제공자 프레임워크에서의 제공자는 서비스의 구현체로 3개의 핵심 컴포넌트로 이뤄짐.
            - 구현체의 동작을 정의하는 서비스 인터페이스
            - 제공자가 구현체를 등록할 때 사용하는 제공자 등록 API
            - 클라이언트가 서비스의 인스턴스를 얻을 때 사용하는 서비스 접근 API
        - 대표적인 예로 JDBC가 있다.
            - Connection이 서비스 인터페이스 역할
            - DriverManager.registerDriver가 제공자 등록 API 역할
            - DriverManager.getConnection이 서비스 접근 API 역할
            - Driver가 서비스 제공자 인터페이스 역할
        - 자바 6부터는 ServiceLoader라는 범용 서비스 제공자 프레임워크가 제공됨.

## 정적 메서드의 단점 2가지

1. 상속을 하려면 public이나 protected 생성자가 필요하니 정적 팩터리 메서드만 제공하면 하위 클래스를 만들 수 없다.
    - 우테코 레벨 1 로또 미션에서 사용했던 코드를 예로 들 수 있다.

        ```java
        public class LottoTicket {
            private static final int VALID_LOTTO_NUMBER_COUNTS = 6;
            private static final String INVALID_LOTTO_NUMBER_COUNTS = "로또 티켓은 중복되지 않은 6자리의 숫자로 구성되어야 합니다.";
            
            private final Set<LottoNumber> lottoNumbers;
        
            private LottoTicket(Set<LottoNumber> lottoNumbers) {
                validateNumberCounts(lottoNumbers.size());
                this.lottoNumbers = lottoNumbers;
            }
        
            public static LottoTicket generateTicket(List<LottoNumber> numbers) {
                return numbers.stream()
                        .collect(Collectors.collectingAndThen(Collectors.toSet(), LottoTicket::new));
            }
        }
        
        public class WinningLottoTicket {
            private static final String DUPLICATION_NUMBER = "보너스 볼 번호는 당첨 번호와 중복될 수 없습니다.";
        
            private final LottoTicket lottoTicket;
            private final LottoNumber bonusBallNumber;
        
            private WinningLottoTicket(LottoTicket lottoTicket, LottoNumber bonusBallNumber) {
                validateDuplicateNumbers(lottoTicket, bonusBallNumber);
                this.lottoTicket = lottoTicket;
                this.bonusBallNumber = bonusBallNumber;
            }
        }
        ```

        - LottoTicket 클래스 내부에는 private 생성자와 LottoTicket 클래스를 반환하는 정적 팩터리 메서드가 있었다.
        - WinningLottoTicket 이라는 클래스를 만들기 위해 LottoTicket 클래스를 상속받았는데 그러다보니 상위 클래스의 생성자를 public이나 protected로 바꾸지 않는 이상 상속받을 수가 없었다.
        - 그래서 상속보다는 컴포지션(조합)을 사용하라는 조언을 통해 문제를 해결했다.
        - 이는 어떻게 보면 상속보다는 컴포지션을 사용하도록 유도하고 불변 타입으로 만들려면 이 제약을 지켜야 한다는 점에서 오히려 장점으로 받아들일 수도 있다!
2. 정적 팩터리 메서드는 프로그래머가 찾기 어렵다.
    - 생성자처럼 API 설명에 명확히 드러나지 않으니 사용자는 정적 팩터리 메서드 방식 클래스를 인스턴스화할 방법을 알아내야 한다.
      이러한 어려움을 해결하기 위해 API 문서를 잘 써놓고 메서드 이름도 널리 알려진 규약을 따라 짓는 식으로 문제를 완화해줘야 한다.
    - 흔히 사용하는 정적 팩터리 메서드 명명 방식들
        - from: 매개변수를 하나 받아서 해당 타입의 인스턴스를 반환하는 형변환 메서드
        - of: 여러 매개변수를 받아 적합한 타입의 인스턴스를 반환하는 집계 메서드
        - valueOf: from과 of의 더 자세한 버전
        - instance or getInstance: (매개변수를 받는다면) 매개변수로 명시한 인스턴스를 반환하지만, 같은인스턴스임을 보장하지는 않는다.
        - create or newInstance: instance 혹은 getInstance와 같지만, 매번 새로운 인스턴스를 생성해 반환함을 보장한다.
        - getType: getInstance와 같으나, 생성할 클래스가 아닌 다른 클래스에 팩터리 메서드를 정의할 때 쓴다. "Type"은 팩터리 메서드가 반환할 객체의 타입이다.
        - newType: newInstance와 같으나, 생성할 클래스가 아닌 다른 클래스에 팩터리 메서드를 정의할 때 쓴다. "Type"은 팩터리 메서드가 반환할 객체의 타입이다.
        - type: getType과 newType의 간결한 버전

## 핵심정리

- 정적 팩터리 메서드와 public 생성자는 각자의 쓰임새가 있으니 상대적인 장단점을 이해하고 사용하는 것이 좋다.
  그렇다 하더라도 정적 팩터리를 사용하는 게 유리한 경우가 더 많으므로 무작정 public 생성자를 제공하던 습관이 있으면 고치자!
  

## 느낀 점

- Collections가 인터페이스에 정적 메서드를 선언하지 못해서 만든 클래스고
  List.of()와 같은 메서드가 선언할 수 있게 되어서 생긴 메서드라니 흥미로웠다.
  그리고 솔직히 흔히 사용되는 명명 방식의 기준은 잘 모르겠다.. 중요한건 그것보다
  정적 팩터리 메서드를 사용할 때 메서드 명에 대한 팀 컨벤션을 만들어 혼용해서 쓰지 않도록 하는 것이 좋을 것 같다.