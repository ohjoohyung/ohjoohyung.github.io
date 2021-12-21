---
title: "[이펙티브 자바] 9. try-finally보다는 try-with-resources를 사용하라"  
date: 2021-12-17  
tags:
- java
- book
---
- 자바 라이브러리에는 close 메서드를 호출해 직접 닫아줘야 하는 자원이 많다.
    - InputStream, OutputStream, java.sql.Connection 등이 좋은 예.
    - 자원 닫기는 클라이언트가 놓치기 쉬워서 예측할 수 없는 성능 문제로 이어지기도 함.
    - finalizer를 안전망으로 활용해도 믿을만하지 못함.

<br/>

## try-finally

- 전통적으로 닫힘을 보장하는 수단으로 try-finally가 쓰였다.

    ```java
    static String firstLineOfFile(String path) throws IOException {
        BufferedReader br = new BufferedReader(new FileReader(path));
        try {
            return br.readLine();
        } finally {
            br.close();
        }
    }
    ```

- 자원을 하나 더 사용하면 이러하다.

    ```java
    static void copy(String src, String dst) throws IOException {
        InputStream in = new FileInputStream(src);
        try {
            OutputStream out = new FileOutputStream(dst);
            try {
                byte[] buf = new byte[BUFFER_SIZE];
                int n;
                while ((n = in.read(buf)) >= 0)
                    out.write(buf, 0, n);
            } finally {
                out.close();
            }
        } finally {
            in.close();
        }
    }
    ```

- try-finally 문은 미묘한 결점이 있다.
    - 기기에 물리적인 문제가 생긴다면 firstLineOfFile 메서드 안의 readLine 메서드가 예외를 던지고, 같은 이유로 close 메서드도 실패할 것임.
    - 이 상황이라면 두 번째 예외가 첫 번째 예외를 완전히 집어삼켜 버린다.
        - 스택 추적 내역에 첫 번째 예외에 관한 정보는 남지 않게 되어, 실제 시스템에서의 디버깅을 몹시 어렵게 함.

<br/>

## try-with-resources

- 위 문제들은 try-with-resources 덕에 모두 해결되었음.
- 이 구조를 사용하려면 해당 자원이 AutoCloseable 인터페이스를 구현해야 함.

    ```java
    static String firstLineOfFile(String path) throws IOException {
        try (BufferedReader br = new BufferedReader(
                new FileReader(path))) {
            return br.readLine();
        }
    }
    ```

    ```java
    static void copy(String src, String dst) throws IOException {
        try (InputStream   in = new FileInputStream(src);
             OutputStream out = new FileOutputStream(dst)) {
            byte[] buf = new byte[BUFFER_SIZE];
            int n;
            while ((n = in.read(buf)) >= 0)
                out.write(buf, 0, n);
        }
    }
    ```

- try-with-resources 버전이 짧고 읽기 수월할 뿐 아니라 문제를 진단하기도 훨씬 좋음.
    - firstLineOfFile 메서드를 보면 readLine과 close 호출 양쪽에서 예외가 발생하면, close에서 발생한 예외는 숨겨지고 readLine에서 발생한 예외가 기록됨.
    - 프로그래머에게 보여줄 예외 하나만 보존되고 여러 개의 다른 예외가 숨겨질 수도 있음.
    - 숨겨진 예외들은 그냥 버려지지 않고, 스택 추적 내역에 ‘숨겨졌다(suppressed)’는 꼬리표를 달고 출력됨.
- try-finally 처럼 catch 절을 쓸 수 있음.
    - catch 덕분에 try 문을 더 중첩하지 않고도 다수의 예외를 처리할 수 있음

        ```java
        static String firstLineOfFile(String path, String defaultVal) {
            try (BufferedReader br = new BufferedReader(
                    new FileReader(path))) {
                return br.readLine();
            } catch (IOException e) {
                return defaultVal;
            }
        }
        ```

<br/>

## 핵심 정리

- 꼭 회수해야 하는 자원을 다룰 때는 try-finally 말고, try-with-resources를 사용하자.
- 코드는 더 짧고 분명해지고, 만들어지는 예외 정보도 훨씬 유용하다.
- try-finally로 작성하면 실용적이지 못할 만큼 코드가 지저분해지는 경우라도, try-with-resources로는 정확하고 쉽게 자원을 회수할 수 있다.