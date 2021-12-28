---
title: IntelliJ Custom File Template 만들기  
date: 2021-12-28  
tags:
- intellij
---

현재 깃헙 블로그 템플릿으로 [Borderless](https://github.com/junhobaik/junhobaik.github.io) 를 사용하고 있다.  
인텔리제이로 마크다운을 작성하고 있는데 이때 매번 특정 형식에 맞게 마크다운을 작성해야 했다.
```markdown
---
title:  
date:   
tags:
---
```
그러다보니 글을 작성하기 위해 마크다운 파일을 만들때 항상 파일 이름은 index로 설정하고 위 항목들도 다 작성해줘야 했는데
한 두번은 괜찮은데 이걸 계속한다고 생각하니 너무 귀찮아질거 같았다.

인텔리제이에 메서드 템플릿 만드는게 있는데 파일 템플릿 만드는거도 있지 않을까? 싶었는데 진짜 있었다.  
그래서 방법을 공유하려고 한다.

<br/>

1. File -> Settings -> File and Code Templates 로 이동한다.

<p align="center"><img width="80%" src="https://user-images.githubusercontent.com/62014888/147543151-1022d658-e5b4-4bc3-9277-ed4905f92e8d.jpg"></p>

<br/>

2. Markdown 파일 템플릿을 설정하므로 Markdown을 새롭게 추가하고 원하는 형식을 작성한다.  
    Name은 Markdown, Extension은 md로 설정한다.  
   ${}는 새롭게 마크다운을 작성할 때 받는 파라미터가 들어가게 된다.
   
<p align="center"><img width="80%" src="https://user-images.githubusercontent.com/62014888/147543297-66d01480-b62f-499f-8faf-2702456ff016.png"></p>

<br/>

3. 새롭게 마크다운을 작성할 때 그림과 같이 설정한 값을 입력할 수 있게 된다.
<p align="center"><img width="80%" src="https://user-images.githubusercontent.com/62014888/147543840-87a07484-16a1-4e2a-a713-8854c5193261.png"></p>

<br/>

4. 입력 값과 함께 설정한 템플릿에 맞게 글이 작성된 것을 볼 수 있다. 
<p align="center"><img width="80%" src="https://user-images.githubusercontent.com/62014888/147543911-d75a295c-9fe3-438f-aa90-eca3b64a42c4.png"></p>

<br/>

## 참고
- https://jojoldu.tistory.com/128