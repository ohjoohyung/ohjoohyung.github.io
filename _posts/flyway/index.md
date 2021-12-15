---
title: "[프로젝트] Flyway 도입기"
date: 2021-08-25  
tags:
- flyway
- database
---

## Flyway란?

- Flyway란 DataBase Migration Tool로 DataBase Migration을 손쉽게 해결해주는 도구 중 하나이다.    
  그렇다면 DataBase Migration은 무엇일까?
  
    ### DataBase Migration

    - 마이그레이션(migration)이란 한 운영환경으로부터 다른 운영환경으로 옮기는 작업을 뜻하며, 하드웨어, 소프트웨어, 네트워크 등 넓은 범위에서 마이그레이션의 개념이 사용되고 있다.
    - 데이터베이스에서 데이터 마이그레이션이란 데이터베이스 스키마의 버전을 관리하기 위한 하나의 방법이다.  
        예를 들어 dev 환경에서 데이터베이스 스키마가 변경되었지만, prod 환경에서 데이터베이스 스키마가 변경되지 않았을 경우 마이그레이션을 수행한다.
    - 데이터베이스 마이그레이션은 개별 sql 파일을 데이터베이스 콘솔에서 직접 실행하지 않고 프레임워크의 특정 명령어를 통해 실행하고 이 결과를 별도의 테이블에 버전 관리를 하는 기법이다.

    <br/>

    ![Untitled](https://user-images.githubusercontent.com/62014888/130363401-1cbf726d-2220-43c5-b211-d2a182780696.png)

- Flyway를 통해 손쉽게 각각의 dev, prod 환경에 동일한 데이터베이스 스키마를 적용시킬 수 있었고 변경 이력 또한 남아 관리하기 편하다는 장점이 있었다.

<br/>

## Flyway를 왜 적용시켰는가?

- 사실 처음부터 Flyway를 찾아보고 적용시킨 것이 아니다.  
  (초반에 스키마가 변경되고 조앤이 코기 블로그 글을 보내줬을 때나 심지어 코기가 flyway 테코톡을 했을 때도 별 생각 없었다..)
- 그러던 중 스프린트가 진행됨에 따라 데이터베이스 스키마가 변경되고 dev, prod 환경에서 ddl-auto가 update로 설정되어 있다보니 DB가 꼬이는 현상이 발생하였다.   
  게다가 4차 데모데이 요구사항 중 하나가 prod 환경에 DB를 drop 하지말라는 것이 있었기에 이참에 flyway를 적용시켜보자 해서 진행하게 되었다.  
  조금 더 빨리 적용시켰으면 dev 환경에 DB 또한 drop 하지 않았을텐데.. 아쉽다..

<br/>

## 간단한 사용법

flyway를 적용시켜보자.  
당시 상황은 이러하다.
1. User라는 테이블에 github_id라는 컬럼의 이름이 social_id로, 타입이 varchar(255)로 바뀌어야한다.  
   social_type이라는 컬럼이 추가되어야 한다.
2. Heart라는 테이블이 추가되어야 한다.

지금 방법은 이미 DB에 데이터가 있을 때 적용시킨거라 처음부터 적용시킨 것과 조금은 다를 수도 있다는 것에 주의하자.

1. dependency를 build.gradle에 추가한다. maven은 maven repository를 찾아보자!

    ```java
    implementation('org.flywaydb:flyway-core:6.4.2')
    ```  
    <br/>

2. application.yml 또는 application.properties에 다음과 같은 옵션을 추가한다. (yml 기준)

    ```java
    spring:
        flyway:
    	    enabled: true // true면 flyway를 활성화시킨다.
    	    baseline-on-migrate: true 
           // default는 false로 true로 설정하면 히스토리 테이블이 없으면 새로 만든다.
    ```
    <br/>

3. resources 디렉터리 밑에 db/migration 디렉터리를 만들고 적용할 스크립트를 작성해야 한다.   
   V1__init.sql 안에 테이블 스키마를 작성해두면 스크립트가 적용이 되어 테이블이 생성될 것이다.  
   하지만 이미 우리 프로젝트 DB에는 테이블이 만들어져있다.    
   그렇다면 V1__init.sql이 적용이 되는것인가?   
   이미 테이블이 있는 상태에서 스크립트가 적용이 된다면 에러가 발생하지 않을까라는 생각을 했다.  
   결론부터 말하면 baseline-on-migrate: true 설정에 의해서 이미 DB가 존재하고 V1__init.sql을 작성하였다면 V1__init.sql의 설정은 무시하고 기존의 DB 스키마를 baseline으로 잡게 된다.  
   그래서 사실 V1__init.sql의 내용을 비워놔도 무방하지만 스키마가 변경되기 전의 DDL로 작성해도 괜찮을 것 같다고 생각을 하여 작성해놓았다.

    <br/>

   ![Untitled](https://user-images.githubusercontent.com/62014888/130363455-6b482405-32d6-4ef3-a95a-15913e259698.png)

    <br/>

    ```sql
    CREATE TABLE user(
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         github_id BIGINT NOT NULL,
                         user_name VARCHAR(255) NOT NULL,
                         profile_url VARCHAR(255) NOT NULL,
                         role VARCHAR(255) NOT NULL,
                         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE workbook(
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             name VARCHAR(30) NOT NULL,
                             opened TINYINT(1) NOT NULL,
                             deleted TINYINT(1) NOT NULL,
                             user_id BIGINT not null,
                             created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                             FOREIGN KEY(user_id) REFERENCES user(id) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE TABLE card(
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         question BLOB NOT NULL,
                         answer BLOB NOT NULL,
                         encounter_count INT NOT NULL,
                         bookmark TINYINT(1) not null,
                         next_quiz TINYINT(1) not null,
                         workbook_id BIGINT not null,
                         deleted TINYINT(1) not null,
                         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         FOREIGN KEY(workbook_id) REFERENCES workbook(id) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE TABLE tag(
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(30) UNIQUE NOT NULL,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE workbook_tag(
                                 id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                 workbook_id BIGINT not null,
                                 tag_id BIGINT not null,
                                 deleted TINYINT(1) not null,
                                 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                 FOREIGN KEY(workbook_id) REFERENCES workbook(id) ON UPDATE CASCADE ON DELETE RESTRICT,
                                 FOREIGN KEY(tag_id) REFERENCES tag(id) ON UPDATE CASCADE ON DELETE RESTRICT
    );
    ```

   <br/>

4. User 테이블 변경 내용을 V2__change_user_column.sql, Heart 테이블 추가 내용을 V3__add_heart_table.sql 라는 적당한 이름의 파일로 만들어 작성한다.  
   순서대로 적용시키기 위해 숫자를 1씩 증가시켜야 한다.  
   사실 이미 변경이 되었기에 V2를 작성할 때 한꺼번에 DDL을 작성해도 되지만 분리해서 히스토리로 남기기 위해 이렇게 작성하였다.   
   V2, V3를 한꺼번에 만들어도 V2와 V3가 순서대로 적용이 되었다!

    <br/>

   ![Untitled](https://user-images.githubusercontent.com/62014888/130363480-ae8782fc-5fdd-4d6d-9b57-478b176a9d7d.png)

    <br/>

    ```sql
    alter table user change github_id social_id varchar(255) not null;
    alter table user add column bio varchar(255) not null default '';
    alter table user add column social_type varchar(255);
    ```

    ```sql
    CREATE TABLE heart(
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          workbook_id BIGINT not null,
                          user_id BIGINT not null,
                          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          FOREIGN KEY(workbook_id) REFERENCES workbook(id) ON UPDATE CASCADE ON DELETE RESTRICT
    );
    ```
   <br/>

5. 결과적으로 기존의 prod 환경의 DB 데이터는 유지한 채로 User 테이블의 기존 컬럼명 및 타입을 수정, 새로운 컬럼을 추가할 수 있었다!
6. 이 후에 스키마가 변경이 되면 V4부터 스크립트를 작성해서 추가하면 된다.

<br/>

## 주의할 점

적용하면서 애먹었던 부분을 공유한다.

1. local 환경에서 H2 DB를 사용하게 되는 경우가 많을텐데 mariadb의 쿼리문을 이용한 스크립트와 같은 스크립트를 적용하다 syntax 에러가 많이 발생하였다. 이를 주의하도록 하자.  
   혹시나 DB마다 다른 스크립트를 적용하려면 flyway에서 벤더사마다 다른 스크립트를 적용하는 방법도 존재하니 그걸 찾아보도록 하자!  
   우리는 팀원들끼리 이야기한 결과 굳이 local에선 flyway를 사용할 필요가 있을까하여 flyway.enabled를 false로 설정하여 사용했다.

2. 최신 버전의 flyway를 적용하면서 mariadb를 사용한다면 꼭 10.2 버전 이상의 mariadb를 사용하자.   
   10.1 버전의 mariadb를 사용하다 이런 에러를 맞이하게 되어 기존 mariadb를 10.4로 upgrade하는 상황이 발생하게 되었다.   
   조앤이 upgrade 하는 방법을 금방 찾아서 다행이었지만 생각보다 할게 많아 까다로웠다..  
   아니면 에러에 적힌대로 flyway pro edition을 사용하면 괜찮을지도..?

    <br/>

   ![Untitled](https://user-images.githubusercontent.com/62014888/130363889-def26e90-88e8-48cd-b7a8-ef2717193fab.png)