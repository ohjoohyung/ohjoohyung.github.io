---
title: "[이펙티브 자바] 5. 자원을 직접 명시하지 말고 의존 객체 주입을 사용하라"  
date: 2021-12-15 20:00:00
tags:
- java
- book
---
- 사용하는 자원에 따라 동작이 달라지는 클래스에는 정적 유틸리티 클래스나 싱글턴 방식이 적합하지 않다.
- 대신 클래스가 여러 자원 인스턴스를 지원해야 하며, 클라이언트가 원하는 자원을 사용해야 한다.
    - 이 조건을 만족하는 간단한 패턴이 있으니, 바로 인스턴스를 생성할 때 생성자에 필요한 자원을 넘겨주는 방식이다.
    - 의존 객체 주입의 한 형태로, 맞춤법 검사기를 생성할 때 의존 객체인 사전을 주입해주면 된다.

    ```java
    public class SpellChecker {
    	private final Lexicon dictionary;
    
    	public SpellChecker(Lexicon dictionary) {
    		this.dictionary = Objects.requireNonNull(dictionary);
    	}
    
    	public boolean isValid(String word) {}
    	public List<String> suggestions(String typo) {}
    }
    ```

    - 불변을 보장하여 여러 클라이언트가 의존 객체들을 안심하고 공유할 수 있다.
    - 의존 객체 주입은 생성자, 정적 팩터리, 빌더 모두에 똑같이 응용할 수 있다.
- 이러한 패턴의 쓸만한 변형으로, 생성자에 자원 팩터리를 넘겨주는 방식이 있다.
    - 팩터리란 호출할 때마다 특정 타입의 인스턴스를 반복해서 만들어주는 객체를 말한다. 즉, 팩터리 메서드 패턴을 구현한 것이다.
    - 자바 8에서 소개한 Supplier<T> 인터페이스가 팩터리를 표현한 완벽한 예.
        - 클라이언트는 자신이 명시한 타입의 하위 타입이라면 무엇이든 생성할 수 있는 팩터리를 넘길 수 있음.

        ```java
        Mosaic create(Supplier<? extends Tile> tileFactory) {...}
        ```

        - 클라이언트가 제공한 팩터리가 생성한 Tile들로 구성된 Mosaic을 만드는 메서드
- 의존 객체 주입이 유연성과 테스트 용이성을 개선해주긴 하지만, 의존성이 수 천개나 되는 큰 프로젝트에서는 코드를 어지럽게 만들기도 한다.
    - Dagger, Guice, Spring 같은 의존 객체 주입 프레임워크를 사용하면 이런 어질러짐을 해소할 수 있다.
    - 이들 프레임워크는 의존 객체를 직접 주입하도록 설계된 API를 알맞게 응용해 사용하고 있음.

## 핵심 정리

- 클래스가 내부적으로 하나 이상의 자원에 의존하고, 그 자원이 클래스 동작에 영향을 준다면 싱글턴과 정적 유틸리티 클래스는 사용하지 않는 것이 좋다.
- 이 자원들을 클래스가 직접 만들게 해서도 안된다. 대신 필요한 자원을 (혹은 그 자원을 만들어주는 팩터리를) 생성자에 (혹은 정적 팩터리나 빌더에) 넘겨주자.
- 의존 객체 주입이라 하는 이 기법은 클래스의 유연성, 재사용성, 테스트 용이성을 기막히게 개선해준다.