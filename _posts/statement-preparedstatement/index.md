---
title: Statement와 PreparedStatement  
date: 2022-03-04  
tags:
- database
- java
---

## Statement
일반적인 쿼리(Statement)를 만들어 실행하면 쿼리 분석, 컴파일, 실행 단계를 거치게 된다.  
그러다보니 매번 쿼리를 실행할 때마다 반복적으로 단계를 거치게 되어 성능이 떨어질 수 있다.  
뿐만 아니라 애플리케이션에서 제공해주는 라이브러리(java는 jdbc)에서 Statement를 사용해서 쿼리를 작성할 경우 
파라미터로 들어가는 곳에 "or 1 = 1" 과 같은 것을 삽입하여 모든 정보를 가져오거나 테이블을 통째로 날려버리는 등의 
SQL Injection 공격에 취약해지게 된다.

<br/> 

## PreparedStatement
이를 위해 데이터베이스에서 PreparedStatement를 제공해준다.  
앞서 말한 쿼리 분석, 컴파일 과정을 거쳐 실행 계획을 미리 만들어두고 세션 내에서 같은 쿼리를 사용할 때마다 
동일한 실행 계획을 이용할 수 있게 해준다.  
또한 placeholder(? 문자)가 포함되어 있는 쿼리를 이용하면 placeholder에 값을 넣어줄 수 있는데 
이렇게 되면 미리 실행 계획이 만들어져 있어 잘못된 값이 오면 무시되므로 SQL Injection을 예방할 수 있다.

```sql
prepare stmt1 from 'select * from test where id = ?';
set @a = '1';
execute stmt1 using @a;
```

그렇다면 MySQL에서 PreparedStatement는 어떨까?    
특히 MySQL에서 jdbc 드라이버로 제공해주는 PreparedStatement 구현체를 보니까 재밌는 사실을 알 수 있었다.

<br/>

### Client PreparedStatement
MySQL은 4.1 버전부터 완전한 PreparedStatement를 지원하였기 때문에 그 전에는 Jdbc 드라이버를 통해 
ClientPreparedStatement만 지원했다고 한다. 그렇기 때문에 PreparedStatement 흉내만 냈을 뿐이지 
실제 MySQL에서 제공하는 PreparedStatement를 사용하는 것이 아니기에 매번 쿼리 분석, 컴파일, 실행 단계가 발생한다고 한다.  
오잉? 그렇다면 SQL Injection은 어떻게 막지?  
이는 따로 파라미터로 들어온 값에 특정 특수문자 같은게 존재하면 \를 추가해 escape 시켜서 보내준다.  
그렇기에 SQL Injection을 막을 수 있다고 한다.

<br/>

### Server PreparedStatement
추가된 ServerPreparedStatement 객체는 실제 MySQL에서 제공하는 PreparedStatement를 사용할 수 있도록 해준다.  
아래 메서드는 ServerPreparedStatement 생성자에 존재하는 serverPrepare라는 메서드인데 ServerPreparedQuery의 serverPrepare를 보면 Prepare 구문으로 만들도록 MySQL에 요청하는 걸 볼 수 있다.
![image](https://user-images.githubusercontent.com/62014888/156883610-75b7b0ba-4d30-4e1e-be67-8b1a5ea87c91.png)

그래서 실제 흐름은 Connection으로부터 PreparedStatement가 만들어질 때 MySQL에서 해당 쿼리를 이용해서 Prepare 구문을 만들고 이를 계속 사용하게 된다.  
이러한 설정은 useServerPrepStmts 값에 따라 바꿀 수 있다고 한다.  
userServerPrepStmts=false이면 ClientPreparedStatement, true이면 SeverPreparedStatement를 사용할 수 있다고 하는데 
기존 코드와의 호환성을 위해 false가 default라고 한다.

실제로 userServerPrepStmts=false로 하면 ClientPreparedStatement를 사용해 MySQL에서 show global status; 를 입력해 보았을 때 Prepared\_stmt\_count(세션 상관없이 지금 운영중인 PreparedStatement 수)가 올라가있지 않은 반면 
userServerPrepStmts=true로 하면 ServerPreparedStatement를 사용해 올라간 모습을 볼 수 있다.

<br/>

## 그렇다면 우리 플젝에서도?
[보고 또 보고](https://github.com/woowacourse-teams/2021-botobo) 플젝에서는 jpa를 쓰는데 결국 jpa도 jdbc를 쓰기 때문에 
혹시 MariaDB에서 제공해주는 PreparedStatement를 사용하지 않고 있는건가 라는 합리적 의심이 들기 시작했다.
테스트해본 결과 정말 사용하고 있지 않았고 userServerPrepStmts=true를 추가하니 사용된 모습을 볼 수 있었다.  
그렇다면 앞으로 userServerPrepStmts=true를 추가하여 ServerPreparedStatement를 사용해야 할까?  
그건 경우에 따라 다를 것 같다. 어차피 이 PreparedStatement라는게 해당 세션 내에서만 사용할 수 있고 같은 쿼리를 반복해서 사용하는 경우에 효과가 있는거라 
([심지어 테스트해보니 더 느리다는 글도 있다](https://kwonnam.pe.kr/wiki/database/mysql/jdbc)) 적절하게 상황에 따라 테스트해보면서 사용하면 될 것 같다.

<br/>

## 참고

- https://dev.mysql.com/doc/refman/8.0/en/sql-prepared-statements.html
- https://www.facebook.com/cookilab/posts/544029815653831/
- https://kwonnam.pe.kr/wiki/database/mysql/jdbc
- https://2ssue.github.io/programming/HikariCP-MySQL/