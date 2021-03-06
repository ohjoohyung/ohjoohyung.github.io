---
title: 프로젝트에서 발견한 N+1 문제 해결하기  
date: 2021-08-24  
tags:
- jpa
---

## 어떤 상황이었나?

현재 프로젝트 내에서 존재하는 Workbook이라는 엔티티에 card, workbookTag, heart와 같은 엔티티들이 1:N 관계로 구성되어 있고 글로벌 페치 전략은 Lazy로 설정되어있다.  
전부 Lazy로 설정되어있다보니 Workbook List를 조회할 때 Workbook 조회 쿼리가 나가고 해당 List에 존재하는 Workbook의 card, workbookTag, heart의 method를 사용하게 될 때 각각을 조회하는 쿼리가 나가다보니 조회된 데이터 갯수(n) 만큼 연관관계의 조회 쿼리가 추가로 발생하여 데이터를 읽어오게 되는 N+1 문제가 발생하였다.  

검색 기능에서 이 Workbook List를 조회하기 위해 Pagable과 Specification을 사용하고 있는데 앞서 말한 N+1 문제를 해결하기 위해 fetch join을 사용해보았다.  
하지만 1:N 관계를 2개 이상 fetch join을 하게 되면 MultipleBagFetchException이 발생한다.   
그 이유는 일대다 엔티티 2개 이상과 fetch join을 해서 쿼리를 보내게 되면 중복된 값이 많이 발생하는데 
jpa에서 이 데이터들을 이용해 객체로 매핑할 때 어떤 데이터를 선택해야할지 판단할 수가 없어서 MultipleBagException이 발생하게 된다고 한다.

또한 만약에라도 1개를 fetch join을 성공했다하더라도 이러한 경고문이 뜨고 페이징 쿼리문 또한 제대로 나가고 있지 않았다.

![Untitled - 2022-01-02T193412 000](https://user-images.githubusercontent.com/62014888/147873117-5163053f-456c-4a7b-a956-93b31b9b8731.png)

이는 Pagination API와 fetch join을 동시에 사용할 때 발생하는 에러로 fetch join을 하게 되면 불러오는 데이터의 수가 변경되어 단순하게 limit 구문을 사용하는 쿼리로 페이지네이션을 적용하기 어려워 조회한 결과를 모두 메모리로 가져와서 JPA가 페이지네이션 계산을 진행하기 때문에 발생하는 에러다.

<br/>

## 어떻게 해결하였나?

이러한 모든 문제를 해결하기 위한 방법으로 hibernate.default\_batch\_fetch\_size 옵션을 줄 수 있다.  
사실 N+1 문제란 결국 부모 엔티티와 연관 관계가 있는 자식 엔티티들의 조회 쿼리가 문제이다. 부모 엔티티의 Key 하나 하나를 자식 엔티티 조회로 사용하기 때문이다.    
즉, 1개씩 사용되는 조건문을 in 절로 묶어서 조회하면 되는 것이고 hibernate.default\_batch\_fetch\_size를 지정하고 지정된 수만큼 in절에 부모 Key를 사용하게 해준다.   
예를 들어 1000개를 옵션 값으로 지정하면 1000개 단위로 in절에 부모 Key가 넘어가서 자식 엔티티들이 조회되는 것이다.  
전체 옵션을 주기 위해 application.yml 파일에 명시해두었고 실제 쿼리도 줄어든 모습을 볼 수 있었다.  
실제 프로젝트에서는 batch\_fetch\_size를 100으로 설정하였다.

![Untitled - 2022-01-02T193700 908](https://user-images.githubusercontent.com/62014888/147873161-6bf1fc90-8a52-4231-8761-80cf2956d7dc.png)
![Untitled - 2022-01-02T193705 602](https://user-images.githubusercontent.com/62014888/147873162-162f0a95-2794-4cb1-abed-7ee8735ca433.png)

<br/>

## 마무리
- 어쩐지 쿼리가 많이 발생하여 콘솔 로그를 꽉 채워 앞에 로그가 짤릴 정도였는데 다 이유가 있었다..
- 항상 쿼리가 너무 많이 발생하지는 않는지 만약 그렇다면 N+1 문제 때문인지를 체크하면서 JPA를 사용해야 할 것 같다.
- batch\_fetch\_size를 설정하는 것이 최선인건가? 조금 더 공부를 해봐야겠다.


<br/>

## 참고

- [https://jojoldu.tistory.com/457](https://jojoldu.tistory.com/457)
- [https://woowacourse.github.io/tecoble/post/2021-07-26-jpa-pageable/](https://woowacourse.github.io/tecoble/post/2021-07-26-jpa-pageable/)
- https://cobbybb.tistory.com/10 