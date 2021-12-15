---
title: DB Join 종류 알아보기  
date: 2021-09-12  
tags:
- database
---

## ANSI SQL

DBMS(Oracle, MySQL 등등)들에서 각기 다른 SQL을 사용하므로 미국 표준 협회(American National Standards Institute)에서 이를 표준화하여 표준 SQL문을 정립시켜 놓은 것.

ANSI SQL 문법의 Join을 익혀두는 것이 좋을듯 싶다.

### 특징

1. 표준 SQL문이기 때문에 DBMS의 종류에 제약을 받지 않는다. 즉, 특정 벤더에 종속적이지 않아 다른 벤더의 DBMS올 교체하더라도 빠르게 다른 벤더사를 이용할 수 있다.
   특정 DBMS의 이탈이 가속되는 것도 ANSI SQL의 영향이 크다고 할 수 있다
2. 테이블 간의 Join 관계가 FROM에서 명시되기 때문에 WHERE 문에서 조건만 확인하면 된다. 즉, 가독성이 일반 Query문보다 좋다

<br/>

## Join

테이블별로 분리되어 있는 데이터를 연결하여 하나의 결과 데이터 셋으로 출력해야 할 때가 반드시 존재한다. 이럴 때 사용하는 것이 Join이다.

두 개의 테이블이 있다고 가정.

컬럼은 1개이고 데이터는 아래와 같다.

```
A    B
-    -
1    3
2    4
3    5
4    6
```

<br/>

### Inner Join

Inner Join을 수행하면 두 집합에 모두 있는 열만 남게 된다.

```sql
ANSI SQL
SELECT * FROM A INNER JOIN B ON A.A = B.B;

ORACLE
SELECT A.*,B* FROM A,B WHERE A.A = B.B;

A    B
-    -
3    3
4    4
```

<br/>

### Left Outer Join

Left Outer Join을 하면 A의 모든 열 더하기 B에 있는 공통부분을 얻게 됩니다.

```sql
ANSI SQL
SELECT * FROM A LEFT OUTER JOIN B ON A.A = B.B;

ORACLE 
SELECT A.*,B.* FROM A,B WHERE A.A = B.B(+);

A       B
-       -
1    null
2    null 
3       3
4       4
```

<br/>

### Right Outer Join

Right Outer Join을 하면 B의 모든 열 더하기 A에 있는 공통부분을 얻게 된다.

```sql
ANSI SQL
SELECT * FROM A RIGHT OUTER JOIN B ON A.A = B.B;

ORACLE 
SELECT A.*,B.* FROM A,B WHERE A.A(+) = B.B;

A       B
-       -
3       3
4       4 
null    5
null    6
```

<br/>

### Full Outer Join

Full Outer Join을 하면 A와 B의 합집합을 얻게 된다.

B에 있는데 A에 없는 5, 6은 A에서 해당 부분이 null이 되고, A에 있는데 B에 없는 1, 2는 B에서는 해당 부분이 null이 된다.

```sql
SELECT * FROM A FULL OUTER JOIN B ON A.A = B.B;

A       B
-       -
1    null
2    null
3       3
4       4 
null    5
null    6
```

<br/>

### Cross Join
Cross Join은 이 포스트를 참고하자.


<br/>

## 참고

- [https://stanleykou.tistory.com/entry/SQL-INNER-조인과-OUTER조인이-무엇인가요](https://stanleykou.tistory.com/entry/SQL-INNER-%EC%A1%B0%EC%9D%B8%EA%B3%BC-OUTER%EC%A1%B0%EC%9D%B8%EC%9D%B4-%EB%AC%B4%EC%97%87%EC%9D%B8%EA%B0%80%EC%9A%94)