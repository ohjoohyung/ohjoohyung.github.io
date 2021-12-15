---
title: "@Profile, @ActiveProfiles 란?"  
date: 2021-08-24  
tags:
- spring
---

## @Profile, @ActiveProfiles

- 이 두 애노테이션을 알아보기 전에 Profile이란 무엇인지에 대해 알아보자.
- 미니 프로젝트가 아닌 대부분의 기업용 서비스는 보통 개발(dev), 테스트(test), 운영(prod) 등으로 구동 환경을 세분화하여 서비스를 관리한다. 이런 식별 키워드를 Profile이라고 부른다. Profile을 지정함으로써 DB 접속 계정 및 옵션, 리소스, 로그 관리 정책 등을 Profile 단위로 구분하여 효과적으로 관리할 수 있다.
- 보통 yml이나 properties 파일로 환경을 구분하여 사용하는데 스프링에서는 @Profile 또는 @ActiveProfiles와 같은 애노테이션도 제공해준다.

<br/>

### @Profile
- @Profile을 사용하고 그 안에 환경을 명시해주게 되면 해당 환경에서 이 애노테이션이 붙은 설정이나 빈을 등록하여 사용할 수 있게 된다.

![Untitled (53)](https://user-images.githubusercontent.com/62014888/145994809-b547deb7-6b30-4e1f-88c6-4d849d5e0502.png)

- 위와 같이 명시하면 test 환경에서 해당 빈을 등록하여 사용하겠다는 뜻이고 만약 test 환경에서만 사용하기 싫다고 하면 !test를 명시하면 된다.

<br/>


### @ActiveProfiles
- @ActiveProfiles는 테스트할 때 유용힌 애노테이션으로 테스트에서 Profile을 지정할 수 있는데 그 때 사용하는 애노테이션이다.

![Untitled (54)](https://user-images.githubusercontent.com/62014888/145994816-cb947c00-1658-4c45-ba84-d61c537f7254.png)

- 이렇게 명시하여 test 환경으로 테스트를 실행시킬 수 있도록 하였다.

<br/>


## 참고
- [http://wonwoo.ml/index.php/post/1933](http://wonwoo.ml/index.php/post/1933)
- [https://jsonobject.tistory.com/220](https://jsonobject.tistory.com/220)