---
title: "[이펙티브 자바] 2. 생성자에 매개변수가 많다면 빌더를 고려하라"  
date: 2021-12-13 22:00:00
tags:
- java
- book
---

- 정적 팩터리와 생성자에는 똑같은 제약이 있다.
    - 선택적 매개변수가 많을때 적절히 대응하기 어렵다는 점!
- 필드에 변수가 많이 있을 때 이런 클래스용 생성자 혹은 정적 팩터리는 어떤 모습일까?
- 3가지 방법을 사용한 모습이 있겠다.

1. 점층적 생성자 패턴(telescoping constructor pattern)
    - 필수 매개변수 하나만 받는 생성자, 필수 매개변수와 선택 매개변수 1개를 받는 생성자, 2개까지 받는 생성자 .... 이런 식으로 선택 매개변수를 전부 다 받는 생성자까지 늘려가는 방식이다.

    ```java
    public class NutritionFacts {
        private final int servingSize;  // (mL, 1회 제공량)     필수
        private final int servings;     // (회, 총 n회 제공량)  필수
        private final int calories;     // (1회 제공량당)       선택
        private final int fat;          // (g/1회 제공량)       선택
        private final int sodium;       // (mg/1회 제공량)      선택
        private final int carbohydrate; // (g/1회 제공량)       선택
    
        public NutritionFacts(int servingSize, int servings) {
            this(servingSize, servings, 0);
        }
    
        public NutritionFacts(int servingSize, int servings,
                              int calories) {
            this(servingSize, servings, calories, 0);
        }
    
        public NutritionFacts(int servingSize, int servings,
                              int calories, int fat) {
            this(servingSize, servings, calories, fat, 0);
        }
    
        public NutritionFacts(int servingSize, int servings,
                              int calories, int fat, int sodium) {
            this(servingSize, servings, calories, fat, sodium, 0);
        }
        public NutritionFacts(int servingSize, int servings,
                              int calories, int fat, int sodium, int carbohydrate) {
            this.servingSize  = servingSize;
            this.servings     = servings;
            this.calories     = calories;
            this.fat          = fat;
            this.sodium       = sodium;
            this.carbohydrate = carbohydrate;
        }
    }
    ```

    - 매개변수가 많아지면 클라이언트 코드를 작성하거나 읽기 어렵다는 단점이 있다.

1. 자바빈즈 패턴(JavaBeans pattern)
    - JavaBeans란 데이터를 표현하기 위한 Java 클래스를 만들 때의 규약으로 아래의 규약을 지킨 Java 클래스를 JavaBeans라고 부른다.
        - 모든 클래스의 프로퍼티는 private이며 getter, setter 메서드로 제어한다.
        - 인자가 없는 public 생성자가 있어야 한다.
        - Serializable 인터페이스를 구현해야 한다.
    - 즉, 매개변수가 없는 생성자로 객체를 만든 후, 세터(setter) 메서드들을 호출해 원하는 매개변수의 값을 설정하는 방식이다.
    - 점층적 생성자 패턴에 비해 코드가 길어지긴 했지만, 인스턴스를 만들기 쉽고 그 결과 더 읽기 쉬운 코드가 되었다.

    ```java
    public class NutritionFacts {
        // 매개변수들은 (기본값이 있다면) 기본값으로 초기화된다.
        private int servingSize  = -1; // 필수; 기본값 없음
        private int servings     = -1; // 필수; 기본값 없음
        private int calories     = 0;
        private int fat          = 0;
        private int sodium       = 0;
        private int carbohydrate = 0;
    
        public NutritionFacts() { }
        // Setters
        public void setServingSize(int val)  { servingSize = val; }
        public void setServings(int val)     { servings = val; }
        public void setCalories(int val)     { calories = val; }
        public void setFat(int val)          { fat = val; }
        public void setSodium(int val)       { sodium = val; }
        public void setCarbohydrate(int val) { carbohydrate = val; }
    
        public static void main(String[] args) {
            NutritionFacts cocaCola = new NutritionFacts();
            cocaCola.setServingSize(240);
            cocaCola.setServings(8);
            cocaCola.setCalories(100);
            cocaCola.setSodium(35);
            cocaCola.setCarbohydrate(27);
        }
    }
    ```

    - 하지만 심각한 단점이 있다.
      자바빈즈 패턴에서는 객체 하나를 만들려면 메서드를 여러 개 호출해야 하고, 객체가 완전히 생성되기 전까지 일관성(consistency)이 무너진 상태에 놓이게 된다.
      따라서 클래스를 불변으로 만들수 없으며 스레드 안전성을 얻으려면 프로그래머가 추가 작업을 해줘야만 한다.

1. 빌더 패턴(Builder pattern)
    - 점층적 생성자 패턴의 안전성과 자바빈드 패턴의 가독성을 겸비했다.
    - 클라이언트는 필요한 객체를 직접 만드는 대신, 필수 매개변수만으로 생성자(혹은 정적 팩터리)를 호출해 빌더 객체를 얻는다.
      그런 다음 빌더 객체가 제공하는 일종의 세터 메서드들로 원하는 선택 매개변수들을 설정한다.
      마지막으로 매개변수가 없는 build 메서드를 호출해 드디어 우리에게 필요한 (보통은 불변인) 객체를 얻는다.

    ```java
    public class NutritionFacts {
        private final int servingSize;
        private final int servings;
        private final int calories;
        private final int fat;
        private final int sodium;
        private final int carbohydrate;
    
        public static class Builder {
            // 필수 매개변수
            private final int servingSize;
            private final int servings;
    
            // 선택 매개변수 - 기본값으로 초기화한다.
            private int calories      = 0;
            private int fat           = 0;
            private int sodium        = 0;
            private int carbohydrate  = 0;
    
            public Builder(int servingSize, int servings) {
                this.servingSize = servingSize;
                this.servings    = servings;
            }
    
            public Builder calories(int val)
            { calories = val;      return this; }
            public Builder fat(int val)
            { fat = val;           return this; }
            public Builder sodium(int val)
            { sodium = val;        return this; }
            public Builder carbohydrate(int val)
            { carbohydrate = val;  return this; }
    
            public NutritionFacts build() {
                return new NutritionFacts(this);
            }
        }
    
        private NutritionFacts(Builder builder) {
            servingSize  = builder.servingSize;
            servings     = builder.servings;
            calories     = builder.calories;
            fat          = builder.fat;
            sodium       = builder.sodium;
            carbohydrate = builder.carbohydrate;
        }
    
        public static void main(String[] args) {
            NutritionFacts cocaCola = new NutritionFacts.Builder(240, 8)
                    .calories(100).sodium(35).carbohydrate(27).build();
        }
    }
    ```


- 빌더 패턴은 (파이썬과 스칼라에 있는) 명명된 선택적 매개변수를 흉내 낸 것이다.
- 잘못된 매개변수를 일찍 발견하려면 빌더의 생성자와 메서드에서 입력 매개변수를 검사하고, build 메서드가 호출하는 생성자에서 여러 매개변수에 걸친 불변식을 검사하자.
    - 불변(immutable 혹은 immutability) - 어떠한 변경도 허용하지 않는다는 뜻. 주로 변경을 허용하는 가변 객체와 구분하는 용도로 쓰임.
    - 불변식(invariant) - 프로그램이 실행되는 동안, 혹은 정해진 기간 동안 반드시 만족해야 하는 조건을 말함. 즉, 변경을 허용할 수 있으나 주어진 조건 내에서만 허용한다는 뜻.
    - 가변 객체에도 불변식은 존재할 수 있으며, 넓게 보면 불변은 불변식의 극단적인 예라 할 수 있음.
- 그리고 빌더 패턴은 계층적으로 설계된 클래스와 함께 쓰기 좋다.

    ```java
    // 참고: 여기서 사용한 '시뮬레이트한 셀프 타입(simulated self-type)' 관용구는
    // 빌더뿐 아니라 임의의 유동적인 계층구조를 허용한다.
    
    public abstract class Pizza {
        public enum Topping { HAM, MUSHROOM, ONION, PEPPER, SAUSAGE }
        final Set<Topping> toppings;
    
        abstract static class Builder<T extends Builder<T>> {
            EnumSet<Topping> toppings = EnumSet.noneOf(Topping.class);
            public T addTopping(Topping topping) {
                toppings.add(Objects.requireNonNull(topping));
                return self();
            }
    
            abstract Pizza build();
    
            // 하위 클래스는 이 메서드를 재정의(overriding)하여
            // "this"를 반환하도록 해야 한다.
    				// 하위 클래스에서는 형변환하지 않고도 메서드 연쇄를 지원할 수 있음.
            protected abstract T self();
        }
        
        Pizza(Builder<?> builder) {
            toppings = builder.toppings.clone(); // 아이템 50 참조
        }
    }
    
    public class NyPizza extends Pizza {
        public enum Size { SMALL, MEDIUM, LARGE }
        private final Size size;
    
        public static class Builder extends Pizza.Builder<Builder> {
            private final Size size;
    
            public Builder(Size size) {
                this.size = Objects.requireNonNull(size);
            }
    
            @Override public NyPizza build() {
                return new NyPizza(this);
            }
    
            @Override protected Builder self() { return this; }
        }
    
        private NyPizza(Builder builder) {
            super(builder);
            size = builder.size;
        }
    }
    
    public class Calzone extends Pizza {
        private final boolean sauceInside;
    
        public static class Builder extends Pizza.Builder<Builder> {
            private boolean sauceInside = false; // 기본값
    
            public Builder sauceInside() {
                sauceInside = true;
                return this;
            }
    
            @Override public Calzone build() {
                return new Calzone(this);
            }
    
            @Override protected Builder self() { return this; }
        }
    
        private Calzone(Builder builder) {
            super(builder);
            sauceInside = builder.sauceInside;
        }
    }
    ```


- 빌더 패턴은 상당히 유연하다.
    - 빌더 하나로 여러 객체를 순회하면서 만들 수 있고, 빌더에 넘기는 매개변수에 따라 다른 객체를 만들 수도 있다.
    - 객체에게 부여되는 일련번호와 같은 특정 필드는 빌더가 알아서 채우도록 할 수도 있다.
- 단, 장점만 있는 것은 아니다.
    - 객체를 만들려면, 그에 앞서 빌더부터 만들어야한다.
    - 빌더 생성 비용이 크지는 않지만 성능에 민감한 상황에서는 문제가 될 수 있다.
    - 매개변수가 4개 이상은 되어야 값어치를 한다.
    - 하지만 api는 시간이 지날수록 매개변수가 많아지는 경향이 있음을 명시하자!

## 핵심정리

- 생성자나 정적 팩터리가 처리해야 할 매개변수가 많다면 빌더 패턴을 선택하는게 더 낫다!

## 느낀 점

- 짱 긴 생성자나 setter 범벅인 코드에 비해서 빌더는 깔끔하고 편하다.
  특히 롬복을 더한다면..ㅋㅋ;;
  그렇다면 무조건적인 빌더 사용이 좋을까? 책에서는 매개변수가 많아지는 경향이 있기에
  애초에 빌더 사용하는 거도 좋은 방법이라곤 하지만 직접 빌더를 만들어서 사용하려면
  그거도 비용이기 때문에 고민해봐야 할 것 같다.