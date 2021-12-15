---
title: Cross Join 살펴보기
date: 2021-09-30  
tags:
- database
- join
---

## Cross Join?

- JPA 빌더인 QueryDSL을 사용하다보면 Join 쿼리 작성할 때 주의하지 않으면 Cross Join이 발생한다고 한다.
- 예전에 이동욱님 글에서 한번 본 적이 있었는데 당시에는 QueryDSL을 사용하고 있지 않던 터라 그냥 넘어갔던 기억이 있다.
- 이번에 이렇게 Cross Join 문제를 겪고 나서야 해결한 뒤 정신차리고 글을 작성한다.

Cross Join (교차 조인) 은 카디션 곱이라고도 하며 조인되는 두 테이블에서 곱집합을 반환한다.

이 말은 집합에서 나올 수 있는 모든 경우를 이야기 한다.

예로 들면 A 집합 {a, b, c}, B 집합 {1, 2, 3, 4} 가 있고 두 집합이 Cross Join이 된다면 A x B로 다음과 같이 총 12개의 집합이 나오게 된다.
{a, 1}, {a, 2}, {a, 3}, {a, 4}, {b, 1} .... {c, 4}

그러다보니 일반적인 Join 보다 성능상 이슈가 발생하게 된다.

<br/>

## 문제 상황

- 그렇다면 우리 프로젝트에서는 어떤 상황에서 발생했을까?

- 기존의 검색 기능은 문제집을 검색했을 때 문제집 이름에 포함이 되는 결과를 보여주었다.
- 그런데 태그 이름이 일치하는 문제집도 보여주자는 의견이 나왔고 현재 프로젝트 특성 상 그게 논리적으로도 맞다고 봐 이에 맞춰 기능을 추가하기로 했다.

- 검색에 쓰이는 동적 쿼리는 QueryDSL을 통해 만들어주고 있었고 기존의 코드는 다음과 같다.

```java
public Page<Workbook> searchAll(WorkbookSearchParameter parameter, List<Long> tags,
                                    List<Long> users, Pageable pageable) {
        QueryResults<Workbook> results = jpaQueryFactory.selectFrom(workbook)
                .innerJoin(workbook.user, user).fetchJoin()
                .innerJoin(workbook.cards.cards, card)
                .leftJoin(workbook.workbookTags, workbookTag)
                .leftJoin(workbook.hearts.hearts, heart)
                .where(containKeyword(parameter.getSearchKeyword()),
                        containTags(tags),
                        containUsers(users),
                        openedTrue())
                .groupBy(workbook.id)
                .orderBy(findCriteria(parameter.getSearchCriteria()), workbook.id.asc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetchResults();
        return new PageImpl<>(results.getResults(), pageable, results.getTotal());
 }

private BooleanExpression containKeyword(SearchKeyword searchKeyword) {
        if (searchKeyword == null) {
            return null;
        }
        String keyword = searchKeyword.getValue();
        return workbook
									.name
									.lower()
									.contains(keyword);
 }
```

- containKeyword 부분이 현재 문제집 이름에 포함이 되는 값만 조회하도록 되어있었고 여기에 태그 이름이 일치하는 경우도 추가하기로 했다.

```java
 private BooleanExpression containKeyword(SearchKeyword searchKeyword) {
        if (searchKeyword == null) {
            return null;
        }
        String keyword = searchKeyword.getValue();
        return containsKeywordInWorkbookName(keyword)
                .or(containsKeywordInWorkbookTag(keyword));
    }

    private BooleanExpression containsKeywordInWorkbookName(String keyword) {
        return workbook.name.lower().contains(keyword);
    }

    private BooleanExpression containsKeywordInWorkbookTag(String keyword) {
        StringPath tagName = workbookTag.tag.tagName.value;
        return tagName.eq(keyword);
    }
}
```

- 지금보니 메서드 이름을 수정하거나 코드 포맷팅을 해줘야 할거같다..
- 아무튼 이런 식으로 or을 사용해서 가져오도록 했고

![Untitled (19)](https://user-images.githubusercontent.com/62014888/145753361-17a52122-7dd3-452e-86d3-09c1afaf4145.png)



- 실제로도 원하는 위치에 or가 있어서 잘 가져오는 줄 알았는데 테스트 코드에서 실패했다.

```java
@Test
@DisplayName("검색어를 입력하고 좋아요순으로 정렬한다. 좋아요가 같다면 id순으로 정렬한다.")
void searchAllFromKeywordAndHeartDesc() {
    // given
    WorkbookSearchParameter parameter = WorkbookSearchParameter.builder()
            .searchKeyword("문제")
            .searchCriteria("heart")
            .build();

    // when
    Page<Workbook> workbooks = workbookSearchRepository.searchAll(parameter, null, null, parameter.toPageRequest());
    List<Workbook> workbookList = workbooks.toList();
    
    // then
    assertThat(workbookList).hasSize(7);
    assertThat(workbookList).extracting(Workbook::getName)
            .containsExactly("좋아요가 많아 문제다.",
                    "Java 문제집0",
                    "Javascript 문제집0",
                    "Java 문제집1",
                    "Javascript 문제집1",
                    "Java 문제집2",
                    "Javascript 문제집2");
}
```

![Untitled (20)](https://user-images.githubusercontent.com/62014888/145753391-420df9f4-5d75-4f91-a11b-2c30e5f86d46.png)

- 7개를 가져와야 하는데 6개 밖에 가져오지 못했고 이것저것 실험해보니 태그가 포함되지 않은 문제집이 조회가 되지 않는다는 것을 알게 되었다.

![Untitled (21)](https://user-images.githubusercontent.com/62014888/145753398-c02cc4e8-5111-4618-acb9-70c64e12b5ad.png)

- 또한 그 위를 보니 이런식으로 tag가 Cross Join이 되어있는 것을 발견했다.
- 현재 Workbook과 Tag 사이의 중간 테이블인 WorkbookTag는 Left Outer Join이 되어있는데 Tag는 아무런 Join이 되어있지 않았다.
- 즉, 연관관계를 맺고 있지만 Join이 되어있지 않은 상태에서 접근하려고 하니 JPA가 자동으로 Cross Join을 해주었고 이런 결과를 보여주게 된 것이다.

<br/>


## 해결

- 이동욱님의 글에서 적혀있듯이 암묵적으로 Join이 된 것을 명시적으로 해주면 된다.

```java
public Page<Workbook> searchAll(WorkbookSearchParameter parameter, List<Long> tags,
                                    List<Long> users, Pageable pageable) {
        QueryResults<Workbook> results = jpaQueryFactory.selectFrom(workbook)
                .innerJoin(workbook.user, user).fetchJoin()
                .innerJoin(workbook.cards.cards, card)
                .leftJoin(workbook.workbookTags, workbookTag)
                .leftJoin(workbookTag.tag, tag) // leftJoin을 추가했다.
                .leftJoin(workbook.hearts.hearts, heart)
                .where(containKeyword(parameter.getSearchKeyword()),
                        containTags(tags),
                        containUsers(users),
                        openedTrue())
                .groupBy(workbook.id)
                .orderBy(findCriteria(parameter.getSearchCriteria()), workbook.id.asc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetchResults();
        return new PageImpl<>(results.getResults(), pageable, results.getTotal());
    }
```

- 참고로 Inner Join으로 하여도 Cross Join과 같은 결과를 받았다.
- 그럼 왜 Inner Join, Cross Join을 사용하면 태그가 없는 문제집을 들고오질 않을까?
- 간단하게 그림으로 보자.

    ![Untitled (22)](https://user-images.githubusercontent.com/62014888/145753448-87e9b1e8-b999-4ead-9720-498000750d83.png)

- 발그림이긴 한데 간단하게 요약하면 Workbook과 WorkbookTag가 이미 Left Outer Join이 되어있는 시점에서 WorkbookTag와 Tag를 Inner Join이나 Cross Join을 하려고 하니 태그가 존재하지 않는 문제집은 아예 가져오질 못하는 것이다.
- 나는 Workbook과 WorkbookTag가 이미 Left Outer Join이 되어있는 시점에서 WorkbookTag와 Tag가 Inner Join이 되어도 괜찮지 않을까 생각했는데 잘못되었다는 것을 그림을 통해 알 수 있었다.

![Untitled (23)](https://user-images.githubusercontent.com/62014888/145753556-587f276a-8f8d-4cca-b584-ef8536420a71.png)

![Untitled (24)](https://user-images.githubusercontent.com/62014888/145753559-df10dbb0-9abd-449f-aa54-173d4383c1ca.png)

- 결과적으로 원하는 쿼리문이 나왔고 테스트를 통과하는 모습을 볼 수 있었다.

<br/>


## 마무리

- JPA를 사용하는데 특히 QueryDSL을 사용한다면 Cross Join을 조심하자.
    - 모든 집합을 가져오다보니 원하지 않는 값까지 들고 올 수도 있다.
- 의도하여 Cross Join을 하지 않는 이상 암묵적 Join은 모두 명시적 Join으로 바꾸도록 하자!

<br/>

## 참고


- [https://jojoldu.tistory.com/533](https://jojoldu.tistory.com/533)
- [https://clairdelunes.tistory.com/22](https://clairdelunes.tistory.com/22)