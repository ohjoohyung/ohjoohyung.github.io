---
title: "[성공과 실패를 결정하는 1%의 네트워크 원리] 1장"  
date: 2021-09-25  
tags:
- network
- book
---

## 01 HTTP 리퀘스트 메시지를 작성한다.

1. 탐험의 여행은 URL 입력부터 시작한다.
    - URL은 http: 뿐만 아니라 ftp:, file:, mailto: 로 시작하는 것 등 여러 가지가 있다.
    - 브라우저는 몇 개의 클라이언트 기능을 겸비한 복합적인 클라이언트 소프트웨어.
    - 그렇기 때문에 몇 개가 있는 기능 중의 어느 것을 사용하여 데이터에 엑세스하면 좋을 것인지를 판단하는 재료가 필요하다. 그래서 웹 서버에 액세스할 때는 http:, FTP 서버라면 ftp: 라는 식으로 여러 종류의 URL이 준비되어 있는 것.
    - 웹 서버나 FTP 서버에 액세스하는 경우에는 서버의 도메인명이나 액세스하는 파일의 경로명 등을 URL에 포함, 메일의 경우에는 보내는 상대의 메일 주소를 URL에 포함시킴.
    - 필요에 따라 사용자명이나 패스워드, 서버측 포트 번호 등을 쓸 수도 있다.
    - 액세스 대상이 웹 서버라면 HTTP라는 프로토콜, FTP 서버라면 FTP라는 프로토콜을 사용함. 그러므로 여기에는 액세스할 때의 프로토콜 종류가 쓰여있다고 생각하면 됨.
    - 단, file: 로 시작하는 URL과 같이 액세스할 때 네트워크를 사용하지 않는 것도 있으므로 프로토콜을 나타낸다고 단언할 수는 없음. 액세스 방법이라는 식으로 생각하는 것이 좋다.

<br/>

2. 브라우저는 먼저 URL을 해독한다.
    - URL의 요소
        - http: (URL의 맨 앞에는 데이터 출처에 액세스하는 방법, 즉 프로토콜을 기록) + // (//는 나중에 이어지는 무자열이 서버의 이름임을 나타냄) + 웹 서버 명 + / + 디렉토리명 + / + ..... + 파일명 (데이터 출처의 경로명을 나타냄, 생략 가능)

<br/>

3. 파일명을 생략한 경우
    - URL 규칙에는 파일명을 생략해도 좋음
    - 하지만 파일명을 쓰지 않으면 어느 파일에 액세스해야 할지 모른다.
    - 파일명을 생략할 때를 대비해 미리 서버측에서 설정을 해둔다.
        - 대부분은 index.html, default.htm
    - http://www.oz.kr/
        - 도메인명만 쓴 URL을 볼 수 있는데 이것도 파일명을 생략한 것.
        - 끝에 /가 있으므로 /라는 디렉토리 (루트 디렉토리)가 지정되고 파일명은 생략된 것.
    - http://www.oz.kr
        - 디렉토리명까지 생략.
        - 이렇게 쓰는 방법도 인정되고 있다.
        - 경로명이 아무 것도 없는 경우에는 루트 디렉토리의 아래에 있는 미리 설정된 파일명의 파일, 즉 /index.html 또는 /default.htm 이라는 파일에 액세스하면 혼란이 없기 때문.
    - http://www.oz.kr/whatisthis
        - 맨 끝이 /가 없으므로 whatisthis를 파일명으로 보는 것이 맞을 것 같다.
        - 하지만 실제로는 파일명을 생략하는 규칙을 정확히 이해하지 못하고 디렉토리의 끝에 있는 /까지 생략해 버리는 경우가 있다.
        - 그래서 이 경우는 다음과 같이 취급하는 것이 통례.
        - 웹 서버에 whatisthis라는 파일이 있으면 whatisthis를 파일명으로 보고 whatisthis 디렉토리가 있으면 whatisthis를 디렉토리명으로 본다는 것.

<br/>

4. HTTP의 기본 개념
    - HTTP 프로토콜은 클라이언트와 서버가 주고받는 메시지의 내용이나 순서를 정한 것.
    - 클라이언트에서 서버를 향해 리퀘스트 메시지를 보낸다. 리퀘스트 메시지 안에는 무엇을, 어떻게 해서 하겠다는 내용이 쓰여있음.
    - '무엇을'에 해당하는 것이 URI. 보통 페이지 데이터를 저장한 파일의 이름이나 CGI 프로그램의 파일명을 URI로 쓴다.
        - URI는 여기에 http:로 시작하는 URL을 그대로 쓸 수도 있다.
        - 즉 여기에는 다양한 액세스 대상을 쓸 수 있으며, 이러한 액세스 대상을 통칭하는 말이 URI이다.
    - '어떻게 해서'에 해당하는 것은 메소드.
        - 이 메소드에 의해 웹 서버에 어떤 동작을 하고 싶은지를 전달한다.
    - HTTP 메시지에는 보충 정보를 나타내는 헤더 파일도 있음.
    - 리퀘스트 메시지가 웹 서버에 도착하면 웹 서버는 그 속에 쓰여있는 내용을 해독한다.
    - 그리고 URI와 메시지를 조사하여 '무엇을', '어떻게 하는지' 판단한 후 요구에 따라 동작하고, 결과 데이터를 응답 메시지에 저장한다.
    - 응답 메시지의 맨 앞부분에는 실행 결과가 정상 종료되었는지 또는 이상이 발생했는지를 나타내는 스테이터스 코드가 있음.
    - 헤더 파일과 페이지의 데이터가 이어지고 이 응답 메시지를 클라이언트에 반송한다.
    - 그러면 이것이 클라이언트에 도착하여 브라우저가 메시지 안에서 데이터를 추출하여 화면에 표시하면서 HTTP의 동작은 끝난다.
    - 보통 웹 서버에 액세스하여 페이지의 데이터를 읽을 때 사용하는 것이 GET 메소드.
        - 메소드에 'GET'이라 쓰고 URI에 '/dir1/file1.html'과 같이 쓰이면 '/dir1/file1.html' 이라는 파일의 데이터를 읽으라는 의미.
    - POST는 폼에 데이터를 사용해서 웹 서버에 송신하는 경우에 사용.
    - GET과 POST만 있다면 페이지 데이터를 웹 서버에서 읽거나 페이지에 있는 필드에 입력한 데이터를 웹 서버에 보내는 사용법만 가능함. 하지만 PUT이나 DELETE를 사용하면 클라이언트에서 웹 서버의 파일을 바꿔쓰거나 삭제하는 것도 가능함.
    - 이 기능을 잘 사용하면 웹 서버를 파일 서버 대신 사용할 수도 있다.

<br/>

5. HTTP 리퀘스트 메시지를 만든다.
    - URL을 해독하고 웹 서버와 파일명을 판단하면 브라우저는 이것을 바탕으로 HTTP의 리퀘스트 메시지를 만듦.
    - 실제 HTTP 메시지를 쓰는 방법, 즉 포맷이 결정되어 있으므로 브라우저는 이 포맷에 맞게 리퀘스트 메시지를 만든다.
    - 리퀘스트 메시지의 첫 번째 행에 있는 리퀘스트 라인을 쓴다.
    - 이 행에서 중요한 것은 맨 앞에 있는 메소드.
    - 응답 메시지의 메시지 본문의 내용은 서버에서 클라이언트에 송신하는 데이터.
    - 파일에서 읽은 데이터나 CGI 애플리케이션이 출력한 데이터가 들어간다. 메시지 본문은 바이너리 데이터로 취급함.
    - 브라우저가 웹 서버에 리퀘스트 메시지를 보내는 장면은 이것만이 아님.
        - 하이퍼링크를 클릭하거나 폼에 데이터 기입하여 '송신' 버튼을 누를 떄와 같은 몇 가지 장면도 있음.
    - 부가적인 자세한 정보가 필요한 경우도 있는데, 이것을 써 두는 것이 메시지 헤더의 역할.
    - 날짜, 클라이언트측이 취급하는 데이터 종류, 언어, 압축 형식, 클라이언트나 서버의 소프트웨어 명칭과 버전, 데이터의 유효 기간이나 최종 변경 일시 등
    - 메시지 헤더를 쓰면 그 뒤에 아무 것도 쓰지 않은 하나의 공백 행을 넣고 그 뒤에 송신할 데이터를 쓴다. 이 부분이 메시지 본문.

<br/>

6. 리퀘스트 메시지를 보내면 응답이 되돌아온다.
    - 응답의 경우는 정상 종료했는지, 아니면 오류가 발생했는지, 즉 리퀘스트의 실행 결과를 나타내는 스테이터스 코드와 응답 문구를 첫 번째 행에 써야한다.
    - 응답 문구 쪽은 문장으로 쓰여있으며 사람에게 실행 결과를 알리는 것이 목적.
    - 영상 등을 포함한 경우에는 문장 안에 영상 파일을 나타내는 태그라는 제어 정보가 포함되어 있음.
    - 브라우저는 태그를 탐색하고 영상을 포함하고 있는 의미의 태그를 만나면 영상용 공백을 비워두고 문장을 표시함. 이 후 다시 한 번 웹 서버에 액세스하여 태그에 쓰여있는 영상 파일을 웹 서버에서 읽어와서 방금 전에 비워둔 공백에 표시함. 이 경우 문장 파일을 읽을 때와 마찬가지로 URI 부분에 영상 파일의 이름을 쓴 리퀘스트 메시지를 만들어 보낸다.
    - 리퀘스트 메시지에 쓰는 URI는 한 개만으로 결정되어 있으므로 파일을 한 번에 한 개씩만 읽을 수 있기 때문에 파일을 따로따로 읽어야 한다.
    - 한 문장에 3개의 영상이 포함되어 있다 → 4회 리퀘스트 메시지를 보낸다.
    - 필요한 파일을 판단하고 이것을 읽은 후 레이아웃을 정하여 화면에 표시하는 상태로 전체의 동작을 조정하는 것도 브라우저의 역할.

<br/>

## 02 웹 서버의 IP 주소를 DNS 서버에 조회한다.

1. IP 주소의 기본
    - HTTP의 메시지를 만들면 다음에는 이것을 OS에 의뢰하여 액세스 대상의 웹 서버에게 송신한다. 
    - 브라우저는 URL을 해독하거나 HTTP 메시지를 만들지만, 메시지를 네트워크에 송출하는 기능은 없으므로 OS에 의뢰하여 송신하는 것.
        - 이때 URL 안에 쓰여있는 서버의 도메인명에서 IP 주소를 조사해야 함.
    - TCP/IP는 서브넷이라는 작은 네트워크를 라우터로 접속하여 전체 네트워크가 만들어진다고 생각할 수 있다.
        - 서브넷이란 허브에 몇 대의 PC가 접속된 것.
        - 한 개의 단위로 생각하여 '서브넷'이라고 부르는데 라우터에서 연결하면 네트워크 전체가 완성된다.
    - 동에 해당하는 번호를 서브넷에 할당, 번지에 해당하는 번호를 컴퓨터에 할당하는 것이 네트워크의 주소이다.
        - 이 동에 해당하는 번호를 **네트워크 번호**라 하고, 번지에 해당하는 번호를 **호스트 번호**라 하며, 이 두 주소를 합쳐서 **IP 주소**라고 한다.
    - 같은 IP 주소를 복수의 기기에 할당할 수 있는데, 이런 경우에는 네트워크가 올바르게 작동하지 않고 문제를 일으킨다.
    - 송신측이 메시지를 보내면 서브넷 안에 잇는 허브가 운반하고 (패킷 형태로 운반), 송신측에서 가장 가까운 라우터까지 도착한다. 그리고 라우터가 메시지를 보낸 상대를 확인하여 다음 라우터를 판단한고, 거기에 보내도록 지시하여 송신 동작을 실행한 후 다시 서브넷의 허브가 라우터까지 메시지를 보낸다. 이런 동작을 반복하여 최종적으로 상대의 데이터가 도착한다는 원리. 이것이 TCP/IP와 IP 주소의 기본적인 개념.
    - 실제 IP 주소는 32비트의 디지털 데이터.
    - 네트워크를 구축할 때 사용자가 직접 내역을 결정할 수 있다.
    - 이 내역을 나타내는 정보가 필요에 따라 IP 주소에 덧붙이는데, 이 정보를 '넷마스크'라고 한다.
        - 넷마스크는 IP 주소에서 32비트 부분의 디지털 데이터이며, 왼쪽에 1이 나열되고 오른쪽에 0이 나열된 값이 된다.
        - 넷마스크가 1인 부분은 네트워크 번호를 나타내고, 넷마스크가 0인 부분은 호스트 번호를 나타낸다.
        - 호스트 번호 부분의 비트 값이 모두 0 또는 1인 경우는 특별한 의미를 가진다.
        - 호스트 번호 부분이 모두 0인 IP 주소는 각각의 기기를 나타내는 것이 아니라 서브넷 자체를 나타낸다.
        - 호스트 번호 부분이 모두 1이면 서브넷에 있는 기기 전체에 패킷을 보내는 브로드캐스트를 나타낸다.

<br/>    

2. 도메인명과 IP 주소를 구분하여 사용하는 이유
    - IP 주소는 기억하기 어렵다.
    - 그렇다면 IP 주소 대신에 이름으로 상대를 지정하여 통신한다면?
    - 실행 효율이라는 관점에서 좋은 방법이라고 할 수 없다.
    - IP 주소는 32비트, 즉 4바이트에 해당하는데 도메인명은 적어도 수십 바이트부터 최대 255바이트나 있다.
    - 라우터가 부하되어 데이터를 운반하는 동작에 더 많은 시간이 걸리면서 네트워크 속도가 느려진다.
    - 사람은 이름을 사용하고, 라우터는 IP 주소를 사용한다는 방법이 고안되었고, 현재 이 방법이 정착되어 있다.
    - 이름을 알면 IP 주소를 알 수 있다거나 IP 주소를 알면 이름을 알 수 있다는 원리를 사용하여 양쪽의 차이를 해소하면 모두 좋아지는데, 그 원리가 DNS(Domain Name System)이다.

<br/>

3. Socket 라이브러리가 IP 주소를 찾는 기능을 제공한다.
    - IP 주소를 조사하는 방법은 간단하다.
    - 가장 가까운 DNS 서버에 'www.oz.kr'이라는 서버의 IP 주소를 가르쳐 주세요라고 질문하는 것.
    - DNS 서버에 조회한다는 것은 DNS 서버에 조회 메시지를 보내고, 거기에서 반송되는 응답 메시지를 받는다는 것. 이것은 DNS 서버에 대해 클라이언트로 동작한다고도 말할 수 있다.
    - DNS 클라이언트에 해당하는 것을 DNS 리졸버 또는 단순히 리졸버라고 부른다.
    - DNS의 원리를 사용하여 IP 주소를 조사하는 것을 네임 리졸루션(이름 확인)이라고 하는데, 이 리졸루션을 실행하는 것이 리졸버이다.
    - 리졸버의 실체는 Socket 라이브러리에 들어있는 부품화한 프로그램이다.
    - 라이브러리는 다양한 애플리케이션에서 이용할 수 있도록 부품화한 여러 개의 프로그램을 모아놓은 것으로 프로그램의 부품집이라고 생각하면 된다.
    - Socket 라이브러리는 OS에 포함되어 있는 네트워크 기능을 애플리케이션에서 호출하기 위한 부품을 모아놓은 것.
    - 리졸버는 그 속에 들어있는 프로그램 부품의 하나이다.

<br/>

4. 리졸버를 이용하여 DNS 서버를 조회한다.
    - 브라우저 등의 애플리케이션 프로그램을 만들 때 리졸버의 프로그램명(gethostbyname)과 웹 서버의 이름(www.oz.kr)을 쓰기만 하면 리졸버를 호출할 수 있다.
    - 리졸버를 호출하면 리졸버가 DNS 서버에 조회 메시지를 보내고, DNS 서버에서 응답 메시지가 돌아온다.

<br/>

5. 리졸버 내부의 작동
    - 네트워크 애플리케이션이 리졸버를 호출하면 제어가 리졸버의 내부로 넘어간다.
    - 별도의 프로그램을 호출하여 호출처의 프로그램이 쉬고 있는 상태가 되면, 호출한 대상 프로그램이 움직이기 시작하는 것을 '제어가 넘어간다'고 한다.
    - 리졸버에 제어가 넘어가면 여기서에 DNS 서버에 문의하기 위한 메시지를 만든다. 브라우저가 리퀘스트 메시지를 만드는 것과 유사함.
    - 메시지 송신 동작은 리졸버가 스스로 실행하는 것이 아니라 OS의 내부에 포함된 프로토콜 스택 (OS 내부에 내장된 네트워크 제어용 소프트웨어) 을 호출하여 실행을 의뢰한다.
    - 리졸버가 프로토콜 스택을 호출하면 제어가 리졸버에게 넘어가고 여기에서 메시지를 보내는 동작을 실행하여 LAN 어댑터를 통해 메시지가 DNS 서버를 항해 송신하게 된다.
    - 조회 메시지가 DNS 서버에 도착하고 DNS 서버는 메시지를 토대로 조사하여 답을 찾는다.
    - 액세스 대상의 웹 서버가 DNS 서버에 등록되어 있으면 답을 응답 메시지에 써서 클라이언트에게 반송한다.
    - 메시지는 네트워크를 통해 클라이언트측에 도착하고, 프로토콜 스택을 경유하여 리졸버에 건네져서 리졸버가 내용을 해독한 후 여기에서 IP 주소를 추출하여 애플리케이션에 IP 주소를 건네준다.
    - 실제로는 리졸버를 호출할 때 지정한 메모리 영역에 IP 주소를 저장한다.
    - 컴퓨터의 내부는 다층 구조로 되어있다.
    - 층을 이루도록 다수의 프로그램이 존재하고, 서로 역할을 분담하고 있다.
    - 상위 계층에서 무엇인가 일을 의뢰했을 때 그 일을 스스로 전부 실행하지 않고 하위 계층에 실행을 의뢰하면서 처리를 진행한다.
    - DNS 서버의 IP 주소는 TCP/IP 설정 항목의 하나하나로 컴퓨터에 미리 설정되어 있다.

<br/>

## 03. 전 세계의 DNS 서버가 연대한다

1. DNS 서버의 기본 동작
    - 클라이언트에서 보내는 조회 메시지 (요청 메시지라고 생각하면 될 듯)
        - 이름 - 서버나 메일 배송 목적지와 같은 이름
        - 클래스 - 인터넷 이외에도 네트워크에서의 이용까지 검토하여 식별용으로 클래스라는 정보를 준비했지만 현재는 인터넷 이외의 네트워크는 소멸되었으므로 항상 'IN'이라는 값이 됨.
        - 타입 - 이름에 어떤 타입(종류)의 정보가 지원되는지를 나타냄.
            - A - 이름에 IP 주소가 지원되는 것을 나타냄.
            - MX - 이름에 메일 배송 목적지가 지원되는 것을 나타냄.
                - 타입이 MX인 경우에는 메일 서버의 우선 순위와 메일 서버의 이름을 회답함. 메일 서버의 등록된 주소 또한 같이 반환.

<br/>

2. 도메인의 계층
    - DNS 서버는 정보를 분산시켜서 다수의 DNS 서버에 등록하고, 다수의 DNS 서버가 연대하여 어디에 정보가 등록되어 있는지를 찾아내는 구조.
    - DNS 서버에 등록한 정보에는 모두 도메인명이라는 계층적 구조를 가진 이름이 붙여져 있다.
        - 계층적 구조는 간단하게 회사 부서와 같이 생각하면 됨. 하나의 부서에 해당하는 것을 도메인이라고 함.
        - 한 대의 DNS 서버에 도메인 한 대를 등록한다고 생각하자. (실제로 한 대의 DNS 서버에 복수의 도메인 등록 가능)
        - 도메인 아래에 하위 도메인을 만들 수 있다. (서브 도메인)

<br/>

3. 담당 DNS 서버를 찾아 IP 주소를 가져온다.
    - 하위의 도메인을 담당하는 DNS 서버의 IP 주소를 그 상위의 DNS 서버에 등록하는 방식으로 차례대로 등록함.
        - 상위가 하위 DNS 서버 IP 주소를 알 수 있고, 거기에서 조회 메시지를 보낼 수 있다.
        - com이나 kr 같은 최상위 도메인 상위에 루트 도메인이 존재.
        - 루트 도메인의 DNS 서버를 인터넷에 존재하는 DNS 서버에 전부 등록함. 전부 루트 도메인에 액세스 가능.
            - DNS 서버 소프트웨어를 설치하면 자동으로 등록이 완료됨.
    - 원하는 DNS 서버를 찾는 순서
        1. 클라이언트의 가장 가까이에 있는 서버 (TCP/IP 설정 항목에 등록이 되어 있는 서버) 에 [www.lab.glasscom.com](http://www.lab.glasscom.com) 이라는 웹 서버에 관한 정보를 조회하기로 함.
        2. 가장 가까운 DNS 서버에 없다면 루트 도메인으로 조회 메시지를 전송.
        3. 루트 도메인에 없지만 com 도메인이 등록되어 있으므로 이 DNS 서버 IP를 가장 가까운 DNS 서버로 반송.
        4. 가장 가까운 DNS 서버는 com 도메인의 DNS 서버에 조회 메시지를 전송.
        5. 여기에도 등록되어 있지 않으므로 [glasscom.com](http://glasscom.com) 도메인의 DNS 서버 IP 주소를 반송.
        6. 2~4 반복
        7. www.lab.glasscom.com의 IP 주소를 조사해 이를 클라이언트에 회답.
        8. 클라이언트는 이 IP 주소를 알고 거기에 액세스할 수 있게 됨.

<br/>

4. DNS 서버는 캐시 기능으로 빠르게 회답할 수 있다.
    - 현실의 인터넷에서는 한 대의 DNS 서버에 복수의 도메인의 정보를 등록할 수 있음.
        - 최상위 루트 도메인에서 차례대로 따라간다는 원칙대로 움직이지 않을 수도 있다.
    - DNS 서버는 한 번 조사한 이름을 캐시에 기록할 수 있다.
        - 조회한 이름에 해당하는 정보가 있으면 그 정보를 회답함.
        - 조회한 이름이 도메인에 등록되어 있지 않은 경우조차 캐시에 보존할 수 있다.
        - 단, 저장된 정보가 올바르다고 단언할 수는 없다.
            - DNS 서버에 등록하는 정보에는 유효 기간을 설정하고 기간이 지나면 삭제한다. 또한 조회에 회답할 때 정보가 캐시에 저장된 것인지 아닌지를 알려준다.

<br/>

## 04. 프로토콜 스택에 메시지 송신을 의뢰한다.

1. 데이터 송, 수신 동작의 개요
    - 액세스 대상 웹 서버에 메시지를 송신하도록 OS의 내부에 있는 프로토콜 스택에 의뢰한다.
        - Socket 라이브러리 프로그램 부품을 결정된 순번대로 호출함.
            - 데이터를 송, 수신하는 컴퓨터 사이에 데이터의 통로 같은 것이 있고, 이것을 통해 데이터가 흐르면서 상대측에 도착. 통로는 파이프와 같은 것이라고 생각.
        - 데이터 송, 수신 동작 4단계
            1. 소켓을 만든다 (소켓 작성 단계)
            2. 서버측의 소켓에 파이프를 연결한다 (접속 단계)
            3. 데이터를 송, 수신한다 (송, 수신 단계)
            4. 파이프를 분리하고 소켓을 말소한다 (연결 끊기 단계)
            - 이 네 가지 동작을 실행하는 것이 OS 내부의 프로토콜 스택.

<br/>

2. 소켓의 작성 단계
    - Socket 라이브러리의 socket이라는 프로그램 부품 호출.
    - 소켓이 생기면 디스크립터라는 것이 돌아오는데 이것을 메모리에 기록함.
        - 디스크립터는 소켓을 식별하기 위해 사용함.
        - 복수의 소켓이 한 대의 컴퓨터에 존재할 때 (브라우저 2개의 창을 열어 웹 서버에 액세스할 때) 소켓을 하나하나 식별해야 하는데 이때 사용되는 것이 디스크립터.
        - 호텔에서 가방 맡길 때 받는 번호표를 연상하자.

<br/>

3. 파이프를 연결하는 접속 단계
    - 만든 소켓을 서버측의 소켓에 접속하도록 프로토콜 스택에 의뢰하기 위해 Socket 라이브러리의 connect라는 프로그램 부품 호출.
        - 디스크립터, 서버 IP 주소, 포트 번호를 지정함
        - 디스크립터 - 프로토콜이 통지받은 디스크립터를 보고 어느 소켓을 서버 측의 소켓에 접속할지 판단하여 접속 동작을 실행함.
        - 서버 IP 주소 - IP 주소는 각 컴퓨터를 식별하기 위해 각각에 서로 다른 값을 할당한 것. 즉, IP 주소로 지정할 수 있는 것은 네트워크의 어느 컴퓨터인가 하는 것 까지다.
        - 포트 번호 - 소켓까지 지정하기 위해 필요한 것이 포트 번호. 접속 상대측에 소켓을 식별하기 위해 사용됨.
            - 서버 측의 포트 번호는 애플리케이션의 종류에 따라 미리 결정된 값을 사용한다는 규칙이 있음.

              웹은 80번, 메일은 25번

            - 클라이언트 측의 포트 번호는 소켓을 만들 때 프로토콜 스택이 적당한 값을 골라서 할당하고 이 값을 프로토콜 스택이 접속 동작을 실행할 때 서버 측에 통지함.

<br/>

4. 메시지를 주고받는 송, 수신 단계
    - 소켓에 데이터를 쏟아부으면 상대 측의 소켓에 데이터가 도착함.
    - 송신을 위해서는 write라는 프로그램 부품을 사용함.
        1. URL을 바탕으로 만든 HTTP 리퀘스트 메시지 (송신 데이터) 와 디스크립터를 지정해 write를 호출함.
        2. 프로토콜 스택이 송신 데이터를 서버에게 송신함.
            - 소켓에는 연결된 상대가 기록되어 있으므로 디스크립터로 소켓을 지정하면 연결된 상대가 판명되어 그곳을 향해 데이터를 송신함.
            - 송신 데이터는 네트워크를 통해 전부 그대로 액세스 대상의 서버에 도착함.
        3. 서버는 수신 동작을 실행하여 받은 데이터의 내용을 조사하고 적절한 처리를 실행하여 응답 메시지를 반송함.
    - 수신을 위해서는 read라는 프로그램 부품을 사용함.
        - 수신 버퍼 - 수신한 응답 메시지를 저장하기 위해 지정한 메모리 영역.
            - 응답 메시지가 돌아올 때 read가 받아서 수신 버퍼에 저장함.
            - 수신 버퍼에 메시지를 저장한 시점에서 메시지를 애플리케이션(브라우저)에 건네준다.

<br/>

5. 연결 끊기 단계에서 송, 수신이 종료된다.
    - 브라우저가 데이터 수신을 완료하면 송, 수신 동작은 끝난다.
    - Socket 라이브러리의 close라는 프로그램 부품을 호출한다.
        - 소켓 사이를 연결한 파이프와 같은 것이 분리되고 소켓도 말소됨.
    - 동작은 다음과 같다.
        1. 웹 서버측에서 close를 호출하여 연결을 끊는다.
        2. 클라이언트 측에 전달되어 클라이언트의 소켓은 연결 끊기 단계로 들어간다.
            - 브라우저가 read로 수신 동작을 의뢰했을 때 read는 수신한 데이터를 건네주는 대신 송, 수신 동작이 완료되어 연결이 끊겼다는 사실을 브라우저에 통지한다.
            - 브라우저도 close를 호출하여 연결 끊기 단계로 들어간다.
    - 같은 서버에서 복수의 데이터를 읽을 때 접속과 연결 끊기 동작이 계속 반복되면 비효율적이다.
        - 이를 위해 HTTP 1.1 버전부터 한 번 접속 후 연결을 끊지 않고도 복수의 리퀘스트와 응답 주고받기를 실행하는 방법이 마련되었다.