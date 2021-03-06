---
title: "[운영체제와 정보기술의 원리] 8. 가상메모리"  
date: 2021-10-17  
tags:
- os
- book
- os-it-principle
---

'운영체제와 정보기술의 원리' 스터디를 진행하며 정리한 내용이다.

---

- 시분할 환경에서는 한정된 메모리 공간을 여러 프로그램이 조금씩 나누어서 사용하다보니 운영체제는 어떤 프로그램에게 어느 정도의 메모리를 할당할 것인가 하는 문제에 당면하게 됨.
- 운영체제는 모든 프로그램들에게 공평하게 메모리를 할당하기보다는 몇몇 프로그램에게 집중적으로 할당한 후, 시간이 지나면 메모리를 회수해서 다른 프로그램들에게 다시 할당하는 방식을 채택.
    - 프로세스의 빠른 수행을 위해 프로그램마다 최소한 확보해야 하는 메모리의 크기가 존재하기 때문
- 메모리의 연장 공간으로 디스크의 스왑 영역이 사용될 수 있기 때문에 프로그램 입장에서는 물리적 메모리 크기에 대한 제약을 생각할 필요가 없어지고 나아가 운영체제는 자기 자신만이 메모리를 사용하는 것처럼 가정해 프로그램하는 것을 지원.
    - 프로그램은 0번지부터 시작하는 자기 자신만의 메모리 주소 공간을 가정할 수 있는데, 이를 가상메모리(virtual memory)라고 부름.
    - 이 공간 중 일부는 물리적 메모리에 적재되고 일부는 디스크 스왑 영역에 존재하게 됨.
- 프로세스 주소 공간을 메모리로 적재하는 단위에 따라 가상메모리 기법은 요구 페이징(demand paging) 방식과 요구 세그먼테이션(demanding segmentation) 방식으로 구현될 수 있음.
    - 대부분의 경우 요구 페이징 방식을 사용, 요구 세그먼테이션의 경우 대개 페이지드 세그먼테이션 기법을 사용하다보니 세부적인 구현은 요구 페이징 기법만이 사용됨.

## 1. 요구 페이징

- 요구 페이징이란 프로그램 실행 시 프로세스를 구성하는 모든 페이지를 한꺼번에 메모리에 올리는 것이 아니라 당장 사용될 페이지만을 올리는 방식.
    - 특정 페이지에 대해 CPU의 요청이 들어온 후에야 해당 페이지를 메모리에 적재함.
    - 메모리 사용량이 감소하고, 프로세스 전체를 메모리에 올리는데 소요되는 입출력 오버헤드도 줄어든다.
    - 응답시간을 단축시킬 수 있으며, 시스템이 더 많은 프로세스를 수용할 수 있게 해준다.
    - 프로그램이 물리적 메모리의 용량 제약을 벗어날 수 있도록 한다.
- 요구 페이징에서는 유효-무효 비트(valid-invalid bit)를 두어 각 페이지가 메모리에 존재하는지 표시하게 된다.
    - 이 비트는 각 프로세스를 구성하는 모든 페이지에 대해 존재해야 하므로 페이지 테이블의 각 항목별로 저장됨.
    - CPU가 참조하려는 페이지가 현재 메모리에 올라와 있지 않아 유효-무효 비트가 무효로 세팅되어 있는 경우를 '페이지 부재(page fault)'가 일어났다고 함.

    1. 요구 페이징의 페이지 부재 처리

        ![Untitled (82)](https://user-images.githubusercontent.com/62014888/146327963-09bb65dc-c7be-4c3c-8846-0f1bdba13039.png)

        - CPU가 무효 페이지에 접근하면 주소 변환을 담당하는 하드웨어인 MMU가 페이지 부재 트랩(page fault trap)을 발생시키게 됨.
            - CPU 제어권이 커널모드로 전환되고, 운영체제의 페이지 부재 처리루틴(page fault handler)이 호출되어 페이지 부재를 처리하게 됨.
        - 운영체제는 해당 페이지에 대한 접근이 적법한지를 먼저 체크하여 주소 영역에 속한 페이지 접근이 아니거나 접근 권한을 위반했을 경우 프로세스를 종료시킴.
        - 적법한 것으로 판명된 경우 비어 있는 프레임을 할당받아 그 공간에 해당 페이지를 읽어온다.
            - 비어 있는 프레임이 없다면 기존에 메모리에 있던 페이지 중 하나를 디스크로 쫓아내는데 이를 스왑 아웃이라고 한다.
        - 요청된 페이지를 디스크로부터 메모리로 적재하기까지는 오랜 시간이 소요되므로 페이지 부재를 발생시킨 프로세스는 CPU를 빼앗기고 봉쇄 상태가 됨.
            - CPU 레지스터 상태 및 프로그램 카운터값은 프로세스 제어블록에 저장해둠.
        - 디스크 입출력이 끝나 인터럽트가 발생하면 페이지 테이블에서 해당 페이지를 유효 비트로 설정하고, 봉쇄되었던 프로세스를 준비 큐로 이동시킨다.
        - 다시 CPU를 할당받으면 PCB에 저장한 값을 복원시켜 중단되었던 명령부터 실행을 재개함.

    2. 요구 페이지의 성능
        - 요구 페이징 기법의 성능에 가장 큰 영향을 미치는 요소는 페이지 부재의 발생 빈도임.
            - 페이지 부재가 일어나면 디스크로부터 메모리로 읽어오는 막대한 오버헤드가 발생하기 때문.
            - 페이지 부재가 적게 발생할수록 요구 페이징의 성능이 향상될 수 있음.
        - 유효 접근시간(effective access time)
          = (1-P) * 메모리 접근시간 + P * (페이지 부재 발생 처리 오버헤드 + 메모리에 빈 프레임이 없는 경우 스왑 아웃 오버헤드 + 요청된 페이지의 스왑 인 오버헤드 + 프로세스의 재시작 오버헤드)           
            - 페이지 부재 발생비율 (page fault rate) 0 ≤ P ≤ 1  
              P = 0: 페이지 부재가 한 번도 일어나지 않은 경우  
              P = 1: 모든 참조 요청에서 페이지 부재가 발생한 경우


## 2. 페이지 교체

- 물리적 메모리에 빈 프레임이 존재하지 않아 메모리에 올라와 있는 페이지 중 하나를 디스크로 쫓아내 메모리에 빈 공간을 확보하는 작업이 필요한데 이것을 페이지 교체(page replacement)라고 함.
- 페이지 교체를 할 때에 어떤 프레임에 있는 페이지를 쫓아낼 것인지 결정하는 알고리즘을 교체 알고리즘(replacement algorithm)이라고 하는데, 이 알고리즘의 목표는 페이지 부재율을 최소화하는 것이다.
    - 그러므로 가까운 미래에 참조될 가능성이 가장 적은 페이지를 선택해서 내쫓는 것이 성능을 향상시킬 수 있는 방안임.
- 페이지 교체 알고리즘의 성능은 주어진 페이지 참조열(page reference string)에 대해 페이지 부재율을 계산함으로써 평가할 수 있음.
    - 페이지 참조열은 참조되는 페이지들의 번호를 시간 순서에 따라 나열한 것.

1. 최적 페이지 교체
    - 페이지 부재율을 최소화하기 위해서는 페이지 교체 시 물리적 메모리에 존재하는 페이지 중 가장 먼 미래에 참조될 페이지를 쫓아내면 됨.
        - 이러한 최적의 알고리즘을 빌레디의 최적 알고리즘(Belady's optimal algorithm) 또는 MIN, OPT 등의 이름으로 부름.

        ![Untitled (83)](https://user-images.githubusercontent.com/62014888/146327971-6d37c6f3-5348-453d-83b0-228ce144b60d.png)

    - 페이지 5를 참조하려고 할 때에 페이지 부재가 발생하는데 이때 빌레디의 최적 알고리즘은 가장 먼 미래에 참조될 페이지를 선정하게 됨.
    - 페이지 1, 2, 3, 4 중 가장 먼 미래에 참조되는 페이지가 4번 페이지이므로 이 알고리즘은 4를 내쫓고 그 자리에 페이지 5를 적재함.
    - 이 알고리즘은 미래에 어떤 페이지가 어떠한 순서로 참조될지 미리 알고 있다는 전제하에 알고리즘을 운영하므로 실제 시스템에서 온라인으로 사용할 수 있는 알고리즘이 아님.
        - 오프라인 알고리즘이라고 부른다.
        - 이 알고리즘은 어떠한 알고리즘보다도 가장 적은 페이지 부재율을 보장하므로 다른 알고리즘의 성능에 대한 상한선을 제공함.
        - 빌레디의 최적 알고리즘과 유사했다고 한다면, 이는 더 이상 그 시스템을 위한 교체 알고리즘의 연구가 필요하지 않음을 시사함.

2. 선입선출 알고리즘
    - 선입선출 알고리즘은 페이지 교체 시 물리적 메모리에 가장 먼저 올라온 페이지를 우선적으로 내쫓음.

        ![Untitled (84)](https://user-images.githubusercontent.com/62014888/146327979-098e8811-525e-45d8-a102-b19cd008344b.png)

    - 페이지의 향후 참조 가능성을 고려하지 않고, 물리적 메모리에 들어온 순서대로 내쫓을 대상을 선정하기 때문에 비효율적인 상황이 발생할 수 있음.
        - 가장 먼저 물리적 메모리에 들어온 페이지가 계속해서 많은 참조가 이루어진다 하더라도 FIFO 알고리즘은 이 페이지를 내쫓게 되는 것.
    - 메모리를 증가시켰음에도 불구하고 페이지 부재가 오히려 늘어나는 상황을 FIFO의 이상 현상(FIFO anomaly)이라고 부름.

3. LRU 알고리즘
    - 메모리 페이지의 참조 성향 중 중요한 한 가지 성질로 시간지역성(temporal locality)이라는 것이 있는데 이 성질은 최근에 참조된 페이지가 가까운 미래에 다시 참조될 가능성이 높은 성질을 뜻함.
    - LRU(Least Recently Used) 알고리즘은 페이지 교체 시 가장 오래전에 참조가 이루어진 페이지를 쫓아낸다.
      즉, 마지막 참조 시점이 가장 오래된 페이지를 교체하게 되는 것.

        ![Untitled (85)](https://user-images.githubusercontent.com/62014888/146327981-eaf3732a-da52-4c6e-876b-852993629974.png)

    - 페이지 5가 참조될 때 페이지 부재가 발생하고 페이지 3과 교체되는데, 이는 페이지 3이 가장 오래전에 참조된 페이지이기 때문.

4. LFU 알고리즘
    - LFU(Least Frequently Used) 알고리즘은 페이지의 참조 횟수로 교체시킬 페이지를 결정함.
        - 즉 물리적 메모리 내에 존재하는 페이지 중에서 과거에 참조 횟수가 가장 적었던 페이지를 쫓아내고 그 자리에 새로 참조될 페이지를 적재한다.
        - 최저 참조 횟수를 가진 페이지가 여러 개 존재하는 경우네는 임의로 하나를 선정해 그 페이지를 쫓아냄.
        - 성능 향상을 위해서는 최저 참조 횟수를 가진 페이지들 중에서 상대적으로 더 오래전에 참조된 페이지를 쫓아내도록 구현하는 것이 효율적.
    - LFU는 페이지의 참조 횟수를 계산하는 방식에 따라 Incache-LFU와 Perfect-LFU로 나뉨.
        - Incache-LFU
            - 페이지가 물리적 메모리에 올라온 후부터의 참조 횟수를 카운트하는 방식.
            - 페이지가 메모리에서 쫓겨났다가 다시 들어온 경우 참조 횟수는 1부터 새롭게 시작.
        - Perfect-LFU
            - 메모리에 올라와있는지의 여부와 상관없이 그 페이지의 과거 총 참조 횟수를 카운트함.
            - 페이지의 참조 횟수를 정확히 반영할 수 있다는 장점이 있지만, 메모리에 쫓겨난 페이지의 참조 기록까지 모두 보관하고 있어야 하므로 그 오버헤드가 상대적으로 더 크다고 할 수 있음.
    - LFU 알고리즘은 LRU 알고리즘보다 오랜 시간 동안의 참조 기록을 반영할 수 있다는 장점이 있음.
        - LRU는 직전에 참조된 시점만을 반영, LFU는 장기적인 시간 규모에서의 참조 성향을 고려하기 때문.
    - LFU는 시간에 따른 페이지 참조 변화를 반영하지 못하고, LRU보다 구현이 복잡하다는 단점이 있음.

    ![Untitled (86)](https://user-images.githubusercontent.com/62014888/146327986-0195ad12-cf48-4eba-bb40-816de47ad954.png)

    - LRU 알고리즘은 1번 페이지가 참조 횟수가 가장 많았지만 그걸 인지하지 못한다.
    - LFU 알고리즘은 4번 페이지가 지금부터 인기를 얻기 시작하는 페이지일 수도 있는데 그걸 인지하지 못한다.

5. 클럭 알고리즘
    - LRU, LFU 알고리즘은 페이지의 참조 시각 및 참조 횟수를 소프트웨어적으로 유지하고 비교해야 하므로 알고리즘의 운영에 시간적인 오버헤드가 발생함.
    - 클럭 알고리즘(clock algorithm)은 하드웨어적인 지원을 통해 이와 같은 알고리즘의 운영 오버헤드를 줄인 방식.
        - LRU를 근사시킨 알고리즘으로 NUR(Not Used Recently) 또는 NRU(Not Recently Used) 알고리즘으로도 불린다.
    - 클럭 알고리즘은 오랫동안 참조되지 않은 페이지 중 하나를 교체함.
        - 즉, 최근에 참조되지 않은 페이지를 교체 대상으로 선정한다는 측면에서 LRU와 유사하지만 교체되는 페이지의 참조 시점이 가장 오래되었다는 것을 보장하지는 못한다는 점에서 LRU를 근사시킨 알고리즘으로 볼 수 있다.
    - 하드웨어적인 지원으로 동작하기 때문에 LRU에 비해 페이지 관리가 훨씬 빠르고 효율적이기에 대부분의 시스템에서 클럭 알고리즘을 채택함.

    ![Untitled (87)](https://user-images.githubusercontent.com/62014888/146327990-e537f022-67d6-4a46-8252-cdec48519c13.png)

    - 클럭 알고리즘은 교체할 페이지를 선정하기 위해 페이지 프레임들의 참조비트를 순차적으로 조사함.
    - 프레임 내의 페이지가 참조될 때 하드웨어에 의해 1로 자동 세팅됨.
    - 참조비트가 1인 페이지는 0으로 바꾼 후 그냥 지나가고 참조비트가 0인 페이지는 교체함.
    - 모든 페이지 프레임을 다 조사한 경우 첫 번째 페이지 프레임부터 조사 작업을 반복한다.
        - 즉 시곗바늘이 한 바퀴 도는 동안 다시 참조되지 않은 페이지를 교체하는 것임.
    - 적어도 시곗바늘이 한 바퀴 도는데 소요되는 시간만큼 페이지를 메모리에 유지시켜둠으로써 페이지 부재율을 줄이도록 설계되었기 때문에 이 알고리즘을 2차 기회 알고리즘(second chance algorithm)이라고도 부름

## 3. 페이지 프레임의 할당

- 프로세스가 여러 개가 동시에 수행되는 상황에서는 각 프로세스에 얼마만큼의 메모리 공간을 할당할 것인지 결정해야 함.
- 기본적인 할당 알고리즘(allocation algorithm)은 세 가지로 나누어볼 수 있음.
    1. 균등할당(equal allocation) 방식
        - 모든 프로세스에게 페이지 프레임을 균일하게 할당하는 방식
    2. 비례할당(proportional allocation) 방식
        - 프로세스의 크기에 비례해 페이지 프레임을 할당하는 방식
        - 프로세스의 크기를 고려한 균등할당 방식으로 볼 수 있다
    3. 우선순위 할당(priority allocation) 방식
        - 프로세스의 우선순위에 따라 페이지 프레임을 다르게 할당하는 방식
        - 프로세스 중 당장 CPU에서 실행될 프로세스와 그렇지 않은 프로세스를 구분하여 전자 쪽에 더 많은 페이지 프레임을 할당하는 방식.
- 이와 같은 할당 알고리즘만으로는 프로세스 페이지 참조 특성을 제대로 반영하지 못할 우려가 있음
    - 수행 중인 프로세스 수가 지나치게 많아 프로세스당 할당되는 메모리 양이 과도하게 적어질 수 있음.
- 프로세스를 정상적으로 수행하기 위해서는 적어도 일정 수준 이상의 페이지 프레임을 각 프로세스에 할당해야 함.
- 반복문을 실행 중인 프로세스의 경우 반복문을 구성하는 페이지들을 한꺼번에 메모리에 올려놓는 것이 유리함.
    - 적게 할당하면 매 반복마다 적어도 한 번 이상의 페이지 부재가 발생하기 때문
- 또한 프로세스에게 최소한으로 필요한 메모리 양은 시간에 따라 달라질 수 있음.
- 종합적인 상황을 고려해 할당 페이지 프레임 수를 결정할 필요가 있으며, 경우에 따라 일부 프로세스에게 메모리를 할당하지 않는 방식으로 나머지 프로세스들에게 최소한의 메모리 요구량을 충족시킬 수 있어야 함.

## 4. 전역교체와 지역교체

- 교체할 페이지를 선정할 때, 교체 대상이 될 프레임의 범위를 어떻게 할지에 따라 교체 방법을 전역교체(global replacement)와 지역교체(local replacement)로 구분할 수 있음.
- 전역교체 방법은 모든 페이지 프레임이 교체 대상이 될 수 있는 방법.
    - 프로세스마다 메모리를 할당하는 것이 아니라 전체 메모리를 각 프로세스가 공유해서 사용하고 교체 알고리즘에 근거해서 할당되는 메모리 양이 가변적으로 변하는 방법.
    - 페이지 교체 시 다른 프로세스에 할당된 프레임을 빼앗아올 수 있는 방식.
    - 프로세스별 프레임 할당량을 조절하는 또 다른 방법이 될 수 있음.
    - LRU, LFU, 클럭 등의 알고리즘을 물리적 메모리 내에 존재하는 전체 페이지 프레임들을 대상으로 적용하는 경우가 이러한 전역교체 방법이 됨.
    - 워킹셋 알고리즘, PFF 알고리즘도 전역교체 방법으로 사용될 수 있음.
- 지역교체 방법은 현재 수행 중인 프로세스에게 할당된 프레임 내에서만 교체 대상을 선정할 수 있는 방법
    - 프로세스마다 페이지 프레임을 미리 할당하는 것을 전제로 한다.
    - 프로세스별로 페이지 프레임을 할당하고, 교체할 페이지도 그 프로세스에게 할당된 프레임 내에서 선정하게 되는 것.
    - LRU, LFU 등의 알고리즘을 프로세스별로 독자적으로 운영할 때에는 지역교체 방법이 됨.

## 5. 스레싱

- 프로세스가 최소한의 페이지 프레임을 할당받지 못할 경우 성능상의 심각한 문제가 발생할 수 있음.
- 집중적으로 참조되는 페이지들의 집합을 메모리에 한꺼번에 적재하지 못하면 페이지 부재율이 크게 상승해 CPU 이용률이 급격히 떨어질 수 있기 때문이다.
  이와 같은 현상을 스레싱(thrashing)이라고 부른다.
- CPU 이용률이 낮다는 것은 준비 큐가 비는 경우가 발생한다는 뜻이여서 운영체제는 메모리에 올라가는 프로세스의 수를 늘리게 된다.
- 메모리에 동시에 올라가 있는 프로세스의 수를 다중 프로그래밍의 정도(Multi-Programming Degree: MPD)라고 부르는데 CPU 이용률이 낮을 경우 운영체제는 MPD를 높이게 된다.
- MPD가 과도하게 높아지면 각 프로세스에게 할당하는 메모리의 양이 지나치게 감소하게 된다.
- 프로세스는 최소한의 페이지 프레임도 할당받지 못하는 상태가 되어 페이지 부재가 빈번히 발생하게 된다. 페이지 부재는 디스크 I/O 작업을 수반하므로 문맥교환을 통해 다른 프로세스에게 CPU가 이양된다.
- 다른 프로세스 역시 페이지 부재가 발생할 수밖에 없고 또 다른 프로세스에게 CPU가 할당된다.
- 모든 프로세스에게 다 페이지 부재를 발생시켜 시스템은 페이지 부재를 처리하느라 매우 분주해지고 CPU 이용률은 급격히 떨어지게 된다.
- 이 상황에서 운영체제는 프로세스 수가 적다고 판단해 MPD를 높이기 위해 또 다른 프로세스를 메모리에 추가하게 된다.
- 결과적으로 프로세스당 할당된 프레임 수는 더욱 감소하여 페이지 부재는 더욱 빈번히 발생하게 되고 CPU는 대부분의 시간에 일을 하지 않게되는데 이를 스레싱이라고 한다.
- MPD를 적절히 조절해 CPU 이용률을 높이는 동시에 스레싱 발생을 방지하는 방법에는 워킹셋 알고리즘과 페이지 부재 빈도 알고리즘이 있음.
1. 워킹셋 알고리즘(working-set algorithm)

    ![Untitled (88)](https://user-images.githubusercontent.com/62014888/146328019-dc0c4b94-2d64-40c5-b1c2-75247c248eb4.png)
    1. 프로세스는 일정 시간 동안 특정 주소 영역을 집중적으로 참조하는 경향이 있는데 이렇게 집중적으로 참조되는 페이지들의 집합을 지역성 집합(locality set)이라고 한다.
    2. 워킹셋 알고리즘은 이러한 지역성 집합이 메모리에 동시에 올라갈 수 있도록 보장하는 메모리 관리 알고리즘을 뜻함.
        - 프로세스가 원활히 수행되기 위해 한꺼번에 올라와 있어야 하는 페이지들의 집합을 워킹셋이라고 정의하고, 워킹셋 페이지들이 한꺼번에 메모리에 올라갈 수 있는 경우에만 할당한다.
        - 그렇지 않을 경우 페이지 프레임들을 모두 반납시키고 디스크로 스왑 아웃시킨다.
        - 이를 통해 MPD를 조절하고 스레싱을 방지하게 됨.
    3. 한꺼번에 메모리에 올라가야 할 페이지들의 집합을 결정하기 위해 워킹셋 알고리즘은 워킹셋 윈도우를 사용한다.
        - 페이지가 참조된 시점부터 워킹셋 윈도우 시간 동안은 메모리에 유지하고, 그 시점이 지나면 메모리에서 지워버리게 되는 것.
    4. 워킹셋 알고리즘은 메모리에 올라와 있는 프로세스들의 워킹셋 크기의 합이 프레임 수보다 클 경우 일부 프로세스를 스왑 아웃시켜서 남은 프로세스의 워킹셋이 메모리에 모두 올라가는 것을 보장함.
        - MPD를 줄이는 효과를 발생
    5. 워킹셋을 모두 할당한 후에도 프레임이 남을 경우, 스왑 아웃되었던 프로세스를 다시 메모리에 올려서 워킹셋을 할당함으로써 MPD를 증가시킴.
    6. 윈도우의 크기가 너무 낮으면 지역성 집합을 모두 수용하지 못할 우려가 있고, 반대로 윈도우의 크기가 너무 크면 여러 규모의 지역성 집합을 수용할 수 있는 반면 MPD가 감소해 CPU 이용률이 낮아질 우려가 있다.
    7. 워킹셋의 크기는 시간이 흐름에 따라 변하기도 하므로 일종의 동적인 프레임 할당 기능까지 수행한다고 할 수 있다.
2. 페이지 부재 빈도 알고리즘(Page Fault Frequency: PFF)
    1. 프로세스의 페이지 부재율을 주기적으로 조사하고 이 값에 근거해서 각 프로세스에 할당할 메모리 양을 동적으로 조절한다.
    2. 페이지 부재율이 상한값을 넘게 되면 프로세스에게 프레임을 추가로 더 할당한다.
        - 빈 프레임이 없다면 일부 프로세스를 스왑 아웃시켜 프로세스 수를 조절함.
    3. 페이지 부재율이 하한값 이하로 떨어지면 필요 이상으로 많은 프레임이 할당된 것으로 간주해 할당된 프레임의 수를 줄인다.
        - 메모리 내에 존재하는 모든 프로세스에 필요한 프레임을 다 할당한 후에도 프레임이 남는 경우 스왑 아웃되었던 프로세스에게 프레임을 할당함으로써 MPD를 높인다.