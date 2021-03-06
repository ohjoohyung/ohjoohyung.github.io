---
title: "[이펙티브 자바] 12. toString을 항상 재정의하라"  
date: 2021-12-19 23:40  
tags:
- java
- book
---

## toString을 재정의하자.

- Object의 기본 toString 메서드는 PhoneNumber@abddb처럼 단순히 **클래스\_이름@16진수로\_표시한\_해시코드**를 반환할 뿐임.
- toString의 일반 규약에 따르면 '간결하면서 사람이 읽기 쉬운 형태의 유익한 정보'를 반환해야 함.
    - 규약은 "모든 하위 클래스에서 이 메서드를 재정의하라"고 함.
- toString을 잘 구현한 클래스는 사용하기에 훨씬 즐겁고, 그 클래스를 사용한 시스템은 디버깅이 쉬움.
    - toString을 제대로 재정의하지 않는다면 쓸모없는 메시지만 로그에 남을 것.
- 좋은 toString은 (특히 컬렉션처럼) 이 인스턴스를 포함하는 객체에서 유용하게 쓰인다.
- 실전에서 toString은 그 객체가 가진 주요 정보 모두를 반환하는게 좋음.
    - 단, 객체가 거대하거나 객체의 상태가 문자열로 표현하기에 적합하지 않다면 무리가 있음.
        - 이럴 땐 요약 정보를 담자.

<br/>

## toString 포맷 문서화

- toString을 구현할 때면 반환값의 포맷을 문서화할지 정해야 함.
    - 전화번호나 행렬 같은 값 클래스라면 문서화하기를 권함.
    
### 장점

- 포맷을 명시하면 그 객체는 표준적이고, 명확하고, 사람이 읽을 수 있게 됨.
    - 따라서 그 값 그대로 입출력에 사용하거나 CSV 파일처럼 사람이 읽을 수 있는 데이터 객체로 저장할 수도 있음.
- 포맷을 명시하기로 했다면, 명시한 포맷에 맞는 문자열과 객체를 상호 전환할 수 있는 정적 팩터리나 생성자를 함께 제공하는 것이 좋다.
    - BigInteger, BigDecimal 등이 예
    
### 단점

- 포맷을 한번 명시하면 평생 그 포맷에 얽매이게 됨.
- 포맷을 바꾼다면 이를 사용하던 코드들과 데이터들은 엉망이 될 것.
- 포맷을 명시하지 않는다면 향후 릴리스에서 정보를 더 넣거나 포맷을 개선할 수 있는 유연성을 얻게 됨.

<br/>

- 포맷을 명시하든 아니든 의도는 명확히 밝혀야 함.
- 포맷 명시 여부와 상관없이 toString이 반환하는 값에 포함된 정보를 얻어올 수 있는 API를 제공하자.
  - 그렇지 않으면 이 정보가 필요한 프로그래머는 toString의 반환값을 파싱할 수 밖에 없음.
  - 성능이 나빠지고 필요하지도 않은 작업.
  
<br/>

## 자동 생성 toString

- AutoValue 프레임워크, IDE는 toString을 생성해줌.
- 자동 생성된 toString은 필드의 내용은 나타내어 주지만 클래스의 '의미'까지 파악하지는 못함.
  - 비록 자동 생성에 적합하지는 않더라도 객체의 값에 관해 아무것도 알려주지 않는 Object의 toString보다는 자동 생성된 toString이 훨씬 유용함.

<br/>

## 핵심 정리

- 모든 구체 클래스에서 Object의 toString을 재정의하자.
  - 상위 클래스에서 이미 알맞게 재정의한 경우는 예외.
- toString을 재정의한 클래스는 사용하기도 즐겁고 그 클래스를 사용한 시스템을 디버깅하기 쉽게 해준다.
- toString은 해당 객체에 관한 명확하고 유용한 정보를 읽기 좋은 형태로 반환해야 한다.