---
title: 교착상태(Deadlock)란?  
date: 2021-10-23  
tags:
- os
---

## 1. 교착상태 특징

- 멀티 프로그래밍 환경에서는 여러 프로세스들이 한정된 자원을 사용하기 위해 경쟁하고 있으며, 한 프로세스가 자원을 요청했을 때 해당 자원이 사용 불가능한 상태라면 교착상태(Deadlock)가 발생하게 된다.
  즉, 요청한 자원을 다른 프로세스가 점유하고 있고, 점유하고 있는 프로세스도 다른 자원에 대해 대기 상태에 있기 때문에 두 프로세스가 대기 상태에서 벗어날 수 없는 상황을 교착상태라고 한다.

![Untitled (95)](https://user-images.githubusercontent.com/62014888/146518312-d72c8294-b6eb-4d37-8714-e99488ca800c.png)

### 교착상태 발생 조건

- 교착상태는 다음과 같은 네 가지 조건을 모두 성립해야 발생한다.
  (하나라도 성립하지 않으면 교착상태 문제 해결 가능)
1. 상호 배제(Mutual Exclusion)
    - 한 번에 프로세스 하나만 해당 자원을 사용할 수 있다. 사용 중인 자원을 다른 프로세스가 사용하려면 요청한 자원이 해제될 때까지 기다려야 한다.
2. 점유 대기(Hold-and-wait)
    - 자원을 최소한 하나 보유하고, 다른 프로세스에 할당된 자원을 점유하기 위해 대기하는 프로세스가 존재해야 한다.
3. 비선점(No preemption)
    - 이미 할당된 자원을 강제로 빼앗을 수 없다.
4. 순환 대기(Circular wait)
    - 대기 프로세스의 집합이 순환 형태로 자원을 대기하고 있어야 한다.


### 자원 할당 그래프

![Untitled (96)](https://user-images.githubusercontent.com/62014888/146518397-28c949b5-7080-43af-9357-3440ab419c44.png)

- Vertex
    - 동그라미로 그려진 P1, P2, P3는 프로세스를 의미함.
    - 사각형으로 그려진 R1, R2, R3, R4는 자원을 의미함.
    - 각 사각형 안의 점들은 할당 가능한 자원 개수를 의미함.
- Edge
    - 자원 → 프로세스 (이 프로세스가 해당 자원에게 할당되었다.)
    - 프로세스 → 자원 (프로세스가 자원을 요청하고 있으며 아직  획득하진 못하였다)

- 그래프에서 사이클이 없으면 교착상태가 아니다.
- 그래프에서 사이클이 있으면
    - 자원당 개수가 하나라면 교착상태
    - 자원당 개수가 여러 개라면 교착상태 가능성이 있음

- 사이클이 있고 교착상태인 경우

    ![Untitled (97)](https://user-images.githubusercontent.com/62014888/146518402-4a2d487d-9f10-4db3-a93b-e94073c40d83.png)

- 사이클이 있지만 교착상태가 아닌 경우

    ![Untitled (98)](https://user-images.githubusercontent.com/62014888/146518405-a64eed6a-a336-476b-81aa-fb22ab1d6b2c.png)

<br/>

## 2. 교착상태 처리 방법

### 교착상태 예방

- 교착상태 예방은 교착상태가 되지 않도록 교착상태 발생 조건 네 가지 중 하나라도 발생하지 않게 방지하는 방법이다.
1. 상호 배제(Mutual Exclusion) 조건 방지
    1. 상호 배제가 일어나는 경우는 공유가 불가능한 자원에 의해서임.
    2. 여러 프로세스가 자원에 대한 동시 접근을 보장받으면 상호 배제가 깨어지게 되어 교착상태를 예방할 수 있음.
    3. 어떤 자원들은 근본적으로 공유가 불가능하기 때문에 교착상태를 예방하기 어렵다고 할 수 있음.
2. 점유 대기(Hold-and-wait) 조건 방지
    1. 점유 대기 조건을 부정하기 위해서는 프로세스가 작업을 수행하기 전에 필요한 자원들을 모두 요청하고 획득해야함.
    2. 프로세스 하나를 실행하는데 필요한 모든 자원을 먼저 다 할당하고 끝나면 다른 프로세스에 자원을 할당하는 것.
    3. 프로세스가 자원을 전혀 갖고 있지 않을 때만 자원 요청을 허용해주는 방법도 있다.
    4. 자원의 이용률이 낮아지고 기아 상태가 발생할 수 있다.
3. 비선점(No preemption) 조건 방지
    1. 모든 자원에 대한 선점을 허용한다.
    2. 프로세스가 할당받을 수 없는 자원을 요청하는 경우, 기존에 가지고 있던 자원을 모두 반납하고 새 자원과 이전 자원을 얻기 위해 대기하도록 한다.
4. 순환 대기(Circular wait) 조건 방지
    1. 자원에 고유한 번호를 할당하고 번호 순서대로 자원을 요구하도록 한다.


### 교착상태 회피

- 교착상태 회피는 자원이 어떻게 요청될지에 대한 정보를 미리 파악하고 회피 알고리즘을 통해 교착상태가 일어나지 않도록 자원을 할당하는 방식.
    - 조건을 차단하는 것이 아니라, 정보를 미리 파악하고 일어나지 않는 방향으로 자원을 할당하는 것.
- 프로세스 수, 자원 종류 수가 고정되어 있어야 하고 프로세스가 요구하는 자원 및 최대 자원의 수를 알아야 하며 반드시 자원을 사용 후 반납해야 한다는 가정들이 필요하기 때문에 현실성이 부족함.
- 자원 요청이 있을 때마다 교착상태 회피 알고리즘을 사용한다는 것은 상당한 오버헤드임.

1. 안정 상태(Safe State)

    ![Untitled (99)](https://user-images.githubusercontent.com/62014888/146518410-e6a24d09-bae2-4c5d-a429-96cb9054517a.png)
    
    1. 안정 순서(Safe Sequence)를 찾을 수 있는 경우.
        - 안정 순서란 프로세스들이 요청한 모든 자원들을 교착상태 발생 없이 할당할 수 있는 순서를 의미함.
    2. 즉 프로세스가 순서만 잘 조정해주면 교착상태가 일어나지 않는 상태를 의미함.
    3. 불안정 상태(Unsafe State)
        - 안정 순서를 찾을 수 없는 경우이며 불안정 상태라고 무조건 교착 상태가 발생하는 것은 아니다.

        ![Untitled (100)](https://user-images.githubusercontent.com/62014888/146518416-238d2d2c-a380-4cc5-aa95-e624250f5191.png)
    
        - 할당 가능한 자원 수가 12개일 때 안정 순서는 P0 → P1 → P2 → P1 → P2 → P0가 된다.

        ![Untitled - 2021-12-17T180447 364](https://user-images.githubusercontent.com/62014888/146518422-902435e2-12c1-4a53-b133-c592d1fb3591.png)
    
        - P1이 작업을 끝마친 후 4개의 자원을 P0, P2 어느쪽으로도 할당하든 작업을 마칠 수 없다.
        - 어느 한 쪽이 자원을 선점하지 않는 한 무한히 대기하게 되므로 교착상태가 발생하게 된다.
        - 즉, 처음 세 개의 프로세스에게 5, 2, 3개의 자원을 할당하는 순간 불안정 상태가 됨.

2. 자원 할당 그래프 알고리즘(Resource-Allocation Graph Algorithm)

    ![Untitled - 2021-12-17T180517 190](https://user-images.githubusercontent.com/62014888/146518475-e2474de6-ffaf-4e7a-85c6-fbdf04860910.png)

    ![Untitled - 2021-12-17T180519 016](https://user-images.githubusercontent.com/62014888/146518486-4359524f-d294-4098-84e0-4eeccae31d2a.png)

    1. 자원이 하나일 때 사용하는 방법으로 자원 할당 그래프를 이용해 교착상태를 회피하는 것.
    2. 자원 할당 그래프에 예약 간선(claim edge)를 추가한다.
        - 예약 간선이란 향후 요청할 수 있는 자원을 가리키는 점선으로 표시된 간선을 뜻함.
    3. 프로세스 시작 전에 모든 예약 간선들을 자원 할당 그래프에 표시한다.
    4. 예약 간선으로 설정한 자원에 대해서만 요청할 수 있고 사이클이 형성되지 않을 때만 자원을 할당 받는다.
    5. 사이클 생성 여부를 조사할 때 O(n^2) 시간이 걸린다.

3. 은행원 알고리즘(Banker's Algorithm)
    1. 자원이 여러 개일 때 은행원 알고리즘으로 교착상태를 회피할 수 있음.
    2. 프로세스 시작 시 자신이 필요한 각 자원의 최대(Max) 개수를 미리 선언한다.
    3. 각 프로세스에서 자원 요청이 있을 때 요청을 승인하면 시스템이 안정 상태로 유지되는 경우에만 자원을 할당함.
    4. 불안정 상태가 예상되면 다른 프로세스가 끝날 때까지 대기를 한다.

<br/>

## 3. 교착상태 탐지 & 회복

- 교착상태 예방이나 회피 알고리즘을 사용하지 않는 시스템, 교착상태가 발생할 수 있는 환경이라면 두 알고리즘을 지원해야 한다.
    - 교착상태가 발생했는지 결정하기 위해 시스템 상태를 검사하는 알고리즘
    - 교착상태로부터 회복하는 알고리즘
- 탐지와 회복 알고리즘 방법은 필요한 정보를 유지하고 탐지 알고리즘을 실행시키기 위한 실행 시간, 비용, 교착상태로부터 회복할 때 내재하는 가능한 손실을 포함하는 오버헤드가 필요함.

### 교착상태 탐지

- 자원이 하나일 때는 자원 할당 그래프를 변형하여 대기 그래프를 그린다.
    - 대기 그래프에서 사이클을 감지하면, 시스템의 교착상태 가능성을 보고하게 된다.
- 자원이 여러 개라면 은행원 알고리즘처럼 시시각각 내용이 달라지는 자료구조를 사용한다.
- 탐지 알고리즘은 다음과 같을 때 사용한다.
    - 자원을 요청했는데 즉시 할당되지 못하고 있는 경우
    - 일반적으로 CPU 사용률이 40% 이하로 떨어지는 경우


### 교착상태 회복

- 교착상태 일으킨 프로세스를 종료하거나 할당된 자원을 해제시켜 회복시키는 방법이 있다.
- 프로세스 종료 방법
    - 교착상태의 프로세스를 모두 중지한다.
    - 교착상태가 제거될 때까지 하나씩 프로세스를 중지한다.
- 자원 선점 방법
    - 교착상태의 프로세스가 점유하고 있는 자원을 선점해 다른 프로세스에게 할당한다(해당 프로세스를 일시정지 시킨다)
    - 우선 순위가 낮은 프로세스나 수행 횟수가 적은 프로세스 위주로 프로세스 자원을 선점한다.

<br/>

## 4. 교착상태 무시

- Unix와 Windows를 포함한 대부분의 운영체제가 이 방법을 사용한다.
- 교착상태 무시란 말 그대로 교착상태에 대해 아무런 대응도 하지 않는 것.
- 교착상태는 자주 일어나지 않는데다가 예방 및 처리 비용이 많이 들기 때문에 이 방법은 꽤나 경제적일 수 있다.
    - 발생하면 재부팅하면 된다.