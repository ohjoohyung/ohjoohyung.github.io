---
title: 우아한레디스를 보고 정리  
date: 2021-12-18  
tags:
---

### Cache 구조

### #1 - Look aside Cache

### #2 - Write Back

Redis는 Collection을 제공

## 왜 Collection이 중요한가?

### 개발의 편의성

랭킹 서버를 직접 구현한다면?

- 가장 간단한 방법
    - DB에 유저의 Score를 저장 order by로 정렬 후 읽어오기
    - 개수가 많아지면 속도에 문제가 발생
        - 디스크를 사용하므로
    - Redis의 Sorted Set을 이용하면, 랭킹을 구현할 수 있음
        - replication도 가능
        - 단, 종속적

### 개발의 난이도

- 친구 리스트를 key value 형태로 저장해야 한다면?
- 어떤 문제가 발생할 수 있을까?
    - Race Condition
    - Redis의 경우는 자료구조가 Atomic하기 때문에, 해당 Race Condition을 피할 수 있다.
- 외부의 Collection을 잘 이용하는 것으로, 여러가지 개발 시간을 단축시키고, 문제를 줄여줄 수 있다.

## Redis 사용 처

- Remote Data Store
    - A,B,C 서버에서 데이터를 공유하고 싶을 때
- 한대에서만 필요하다면, 전역 변수를 쓰면 되지 않을까?
    - Redis 자체가 Atomic을 보장해준다. (싱글 스레드라)
- 주로 많이 쓰는 곳들
    - 인증 토큰 등을 저장(Strings 또는 hash)
    - Ranking 보드로 사용(Sorted Set)
    - 유저 API Limit
    - 잡 큐(list)


## Redis Collections

- Strings
    - 단일 Key
    - 간단한 sql을 대체한다면?
- List
    - insert
        - LPUSH, RPUSH
    - pop
        - LPOP, RPOP
    - lpop, blpop, rpop, brpop
- Set
    - 데이터가 있는지 없는지만 체크하는 용도
        - 특정 유저를 follow하는 목록
- Sorted Sets
    - 랭킹에 따라서 순서가 바뀌길 바란다면
        - Sorted Sets의 score는 double 타입이기 때문에, 값이 정확하지 않을 수 있다
    - 정렬이 필요한 값이 필요하다면?
    - Score 기준으로 뽑고 싶다면?
- Hash
    - key 밑에 sub key가 존재
    - 간단한 sql을 대체한다면?


## Collection 주의 사항

- 하나의 컬렉션에 너무 많은 아이템을 담으면 좋지 않음
    - 10000개 이하 몇천개 수준으로 유지하는게 좋음
- Expire는 Collection의 item 개별로 걸리지 않고 전체 Collection에 대해서만 걸림
    - 즉 해당 10000개 아이템 가진 Collection에 expire가 걸려있다면 그 시간 후에 10000개의 아이템 모두 삭제


## Redis 운영

- 메모리 관리를 잘하자
- O(N) 관련 명령어는 주의하자.
- Replication

## 메모리 관리

- Redis는 In-Memory Data Store
- Physical Memory 이상을 사용하면 문제가 발생
    - swap이 있다면 swap 사용으로 해당 메모리 page 접근시마다 늦어짐
    - swap이 없다면?
- Maxmemory를 설정하더라도 이보다 더 사용할 가능성이 큼.
    - redis는 자신이 사용하는 메모리를 정확하게 알 수가 없다
- RSS 값을 모니터링 해야함
- 많은 업체가 현재 메모리를 사용해서 swap을 쓰고 있다는 것을 모를 때가 많음.
- 큰 메모리를 사용하는 instance 하나보다는 적은 메모리를 사용하는 instance 여러 개가 안전함
    - 관리하기 귀찮지만 운영의 안전성이 높아짐
- Redis는 메모리 파편화가 발생할 수 있음. 4.x대부터 메모리 파편화를 줄이도록 jemalloc에 힌트를 주는 기능이 들어갔으나, jemalloc 버전에 따라서 다르게 동작할 수 있음.
- 3.x대 버전의 경우
    - 실제 used memory는 2gb로 보고되지만 11gm의 rss를 사용하는 경우가 자주 발생
- 다양한 사이즈를 가지는 데이터보다는 유사한 크기의 데이터를 가지는 경우가 유리

## 메모리가 부족할 때는?

- Cache is Cash
    - 좀 더 메모리 많은 장비로 마이그레이션
    - 메모리 빡빡하면 마이그레이션 중에 문제가 발생할 수도
- 있는 데이터 줄이기

## 메모리를 줄이기 위한 설정

- 기본적으로 Collection들은 다음과 같은 자료구조를 사용
    - Hash → HashTable을 하나 더 사용
    - Sorted Set → Skiplist와 HashTable을 이용
    - Set → HashTable 사용
    - 해당 자료구조들은 메모리를 많이 사용함
- Ziplist를 이용하자

## Ziplist 구조

- In-Memory 특성 상, 적은 개수라면 선형 탐색을 하더라도 빠르다.
- List, hash, sorted set 등을 ziplist로 대체해서 처리를 하는 설정이 존재

## O(N) 관련 명령어는 주의하자

- Redis는 Single Threaded
    - Redis가 동시에 여러 개의 명령을 처리할 수 있을까?
    - 참고로 단순한 get/set의 경우 초당 10만 TPS 이상 가능(CPU 속도에 영향을 받는다)
    - Packet으로 하나의 Command가 완성되면 processCommand에서 실제로 실행됨


## Single Threaded의 의미

- 한번에 하나의 명령만 수행 가능
    - 그럼 긴 시간이 필요한 명령을 수행하면?
    - 망합니다


## 대표적인 O(N) 명령들

- KEYS
- FLUSHALL, FLUSHDB
- Delete Collections
- Get All Collections

## 대표적인 실수 사례

- Key가 백만개 이상인데 확인을 위해 KEYS 명령을 사용하는 경우
    - 모니터링 스크립트가 1초에 한번씩 KEYS를 호출하는 경우도..
- 아이템이 몇만개든 hash, sorted set, set에서 모든 데이터를 가져오는 경우
- 예전에 Spring security oauth RedisTokenStore

## KEYS는 어떻게 대체할 것인가?

- scan 명령을 사용하는 것으로 하나의 긴 명령을 짧은 여러번의 명령으로 바꿀 수 있다

## Collection의 모든 item을 가져와야 할 때?

- Collection의 일부만 가져오거나..
    - Sorted Set
- 큰 Collection을 작은 여러개의 Collection으로 나눠서 저장
    - Userranks → Userrank1, 2, 3
    - 하나당 몇너개 안쪽으로 저장하는게 좋음


## Spring security oauth RedisTokenStore 이슈

- Access Token의 저장을 List(O(N)) 자료구조를 통해서 이루어짐
    - 검색, 삭제시에 모든 item을 매번 찾아봐야 함
        - 100만개 쯤 되면 전체 성능에 영향을 줌
    - 현재는 Set(O(1))을 이용해서 검색, 삭제를 하도록 수정되어 있음


## Redis Replication

- Async Replication
    - Replication Lag 발생할 수 있다
        - 틈 사이에 데이터가 다를 수 있다
- Replicaof (≥5.0.0) or slaveof 명령으로 설정 가능
    - Replicaof hostname port
- DBMS로 보면 statement replication가 유사
- Replication 설정 과정
    - Secondary에 replicaof or slaveof 명령을 전달
    - Secondary는 Primary에 sync 명령 전달
    - Primary는 현재 메모리 상태를 저장하기 위해
        - Fork
    - Fork한 프로세서는 현재 메모리 정보를 disk에 dump
    - 해당 정보를 secondary에 전달
    - Fork 이후의 데이터를 secondary에 계속 전달


## Redis Replication 시 주의할 점

- Replication 과정에서 fork가 발생하므로 메모리 부족이 발생할 수 있음
- Redis-cli —rdb 명령은 현재 상태의 메모리 스냅샷을 가져오므로 같은 문제를 발생시킴
- AWS나 클라우드의 Redis는 좀 다르게 구현되어서 좀 더 해당 부분이 안정적
- 많은 대수의 Redis 서버가 Replica를 두고 있다면
    - 네트웍 이슈나, 사람의 작업으로 동시에 replication이 재시도 되도록 하면 문제가 발생할 수 있음
    - ex) 같은 네트웍 안에서 30GB를 쓰면 Redis Master 100대 정도가 리플리케이션을 동시에 재시작하면 어떤 일이 벌어질 수 있을까?


## redis.conf 권장 설정 Tip

- Maxclient 설정 50000
- RDB/AOF 설정 off
- 특정 commands disable
    - Keys
    - AWS의 ElasticCache는 이미 하고 있음
- 전체 장애의 90% 이상이 KEYS와 SAVE 설정을 사용해서 발생
- 적절한 ziplist 설정

## Redis 데이터 분산

- 데이터의 특성에 따라서 선택할 수 있는 방법이 달라진다
    - Cache 일때는 우아한 Reids
    - Persistent 해야하면 안 우아한 Reids
        - Open the hellgate


## 데이터 분산 방법

- Application
    - Consistent Hashing
        - twemproxy를 사용하는 방법으로 쉽게 사용 가능
    - Sharding
- Redis Cluster

## Sharding

- 데이터를 어떻게 나눌것인가?
- 데이터를 어떻게 찾을것인가?
- 하나의 데이터를 모든 서버에서 찾아야 하면?
- 상황마다 샤딩 전략이 달라짐

## Range

- 그냥 특정 Range를 정의하고 해당 Range에 속하면 거기에 저장

## Indexed

- 해당 Key가 어디에 저장되어야 할 관리 서버가 따로 존재

## Monitoring Factor

- Reids Info를 통한 정보
    - RSS
    - Used Memory
    - Connection 수
    - 초당 처리 요청 수
- System
    - CPU
    - Disk
    - Network rx/tx


## CPU가 100%를 칠 경우

- 처리량이 매우 많다면?
    - 좀 더 CPU 성능이 좋은 서버로 이전
    - 실제 CPU 성능에 영향을 받음
        - 그러나 단순 get/set은 초당 10만 이상 처리가능
- O(N) 계열의 특정 명령이 많은 경우
    - Monitor 명령을 통해 특정 패턴을 파악하는 것이 필요
    - Monitor 잘못쓰면 부하로 해당 서버에 더 큰 문제를 일으킬 수도 있음(짧게 쓰는게 좋음)


## 결론

- 기본적으로 Redis는 매우 좋은 툴
- 그러나 메모리를 빡빡하게 쓸 경우, 관리하기가 어려움
    - 32기가 장비라면 24기가 이상 사용하면 장비 증설을 고려하는 것이 좋음
    - write가 heavy할 때는 migration도 매우 주의해야함
- Client-output-buffer-limit 설정이 필요

## Redis as Cache

- Cahce일 경우는 문제가 적게 발생
    - Redis가 문제가 있을 때 DB등의 부하가 어느정도 증가하는 지 확인 필요
    - Consistent Hashing도 실제 부하를 아주 균등하게 나누지는 않음. Adaptive Consistent Hashing을 이용해 볼 수도 있음.

## Redis as Persistent Store

- Persistent Store의 경우
    - 무조건 Primary/Secondary 구조로 구성이 필요함
    - 메모리를 절대로 빡빡하게 사용하면 안됨.
        - 정기적인 migration이 필요
        - 가능하면 자동화 툴을 만들어서 이용
    - RDB/AOF가 필요하다면 Secondary에서만 구동
- 답이 별로 없다.
    - 최대한 돈을 많이 투자.
    - 메모리 덜 쓰고
    - 자주 체크해주고