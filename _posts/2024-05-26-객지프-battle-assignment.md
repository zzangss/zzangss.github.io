---
layout: single
title: "객체지향프로그래밍 battle"
categories: 
tag: [oop, java]
toc: true
typora-root-url: ../
---

# Battle 소개

## Battle의 목적

나만의 배틀 프로그램을 만들어봄으로써 요구사항 분석, 설계, 구현의 과정을 연습한다. 3가지 단계의 중요성 인식을 목표로 하여, UI는 기능이 드러나는 선에서 최소한의 작업을 수행한다.



## 마음가짐

이전 과제로 Hunter&Animal 프로그램을 만들때 갈수록 욕심이 생겨 원래의 요구사항을 중간에 수정하고 이를 반영하는 과정에 어려움이 생겼었다. 따라서 요구사항 분석과 설계 과정을 꼼꼼히 수행하여 이후 구현을 쉽게 하는 것이 목표이다.



# 요구사항 분석

## Player

- 이름, hp, power, mp, 무기
- 공격
  - 일반 공격과 기술 공격으로 나뉜다.
  - 일반 공격은 mp가 소모되지 않는다. 기술은 mp를 소모한다.
  - (일반) 공격 하기 : 타겟의 hp - 공격자의 hp
- mp는 모두 30을 가진다.
- 몬스터는 속성값을 가진다. 상성이 맞지 않는 몬스터가 서로 싸울 경우, 불리한 속성을 가지는 몬스터의 power가 약해진다.



### 피카츄

<img src="https://i.namu.wiki/i/5EG5bcAVn87M6SB0MDncqGzjGMSrR1NxRKp4_1njrg6uLx-fwt8LvjP-ikOkUXCy4rb1LmwklXNq8hAlTsdEn7dPKdKm_tw0iARzVOez8vzXdKOdiPNw5pz5_Fjrl6BuUD4IZ3hXY1pIxTwKnhERNA.webp" alt="025 피카츄" style="zoom:33%;" />

1. 전기 속성 몬스터. 땅 속성 몬스터에게 약하다.
2. hp : 100 / power : 40 / mp : 30
3. <정전기 : 공격> 접촉한 상대를 30% 확률로 마비시킨다. 상대가 마비되면 공격을 한 번 더 할 수 있다.
4. <피뢰침 : 공격> 50% 확률로 2배 강하게 공격할 수 있다.



### 이브이

<img src="https://i.namu.wiki/i/TTaLf--Gq9-eyV1lpI_wqQXoSxl8riDD_KMaxroAft9yN1qXCa-NqWXj4tOY1qm_U0qEALYpJ3xklzyXWWcnF__Dk8XtluaCDdwhepQrx5ThrLjBQtSQKURKFz7d8YKsKOejQsWi7J6TlPxckLQpKg.webp" alt="133 이브이" style="zoom: 67%;" />

1. 일반 속성 몬스터. 불 속성 몬스터에 약하다.
2. hp : 120 / power : 30 / mp : 30
3. <돌진 : 공격> hp를 20 소모하고 1.5배 위력의 공격을 수행한다.
4. <도주 : 방어> 무조건 도망 가능



### 수댕이 

<img src="https://i.namu.wiki/i/24ojtW6AssHDlLyjvyr6WAufMa8kTpbPTNCUDD8haXzzkm4AK_RQJt9gmox6Cjsoh2F-DqdxCvAfeshy1hvjjH0DdTQ6RUk3K3QdevtoAbwK0SUDS6-zD0QridJee_emDDskSARdC2RbBCoo0Kd2Lg.webp" alt="501 수댕이" style="zoom: 50%;" />

1. 물 속성 몬스터. 전기 속성 몬스터에게 약하다.
2. hp : 120 / power : 30 / mp : 30
3. <급류 : 공격> HP가 1/3 이하가 되면 공격의 위력이 1.5배 상승한다.
4. <조가비 갑옷 : 방어> 상대의 공격 위력이 80% 감소한다.



### 디그다

<img src="https://i.namu.wiki/i/b2RO_3M_IosWOQY0kTW9QIrpxvvZcYKjnXgaSbmi0MD_VfLJG1pDfjXaJqRQPkTlX2LMF8f17QsSuWpv82_H_N4UKnF3gZrJKBwaZimxklFrjgk9VomYRge6bifNW8LbYsR6O89UHtRziEPri73Jtw.webp" alt="050 디그다" style="zoom:67%;" />

1. 땅 속성 몬스터. 일반 속성 몬스터에게 약하다.

2. hp : 100 / power : 30 / mp : 30

3. <개미지옥 : 공격> 일반 공격과 똑같지만, 일정 확률로 상대의 공격력을 10 하락시킨다.

4. <모래숨기 : 방어> 땅 속에 숨어 공격을 피한다. (mp소모 5)

   

### 파이리

<img src="https://i.namu.wiki/i/KxEOBevADw8vCgVtfuLESHpdaqEco6xG630Qzndjuba46wgnHKCE4pogtQlV0dXymoCwa5nmSG2-Z1khPaQpfolAuxDctfeSdVv0dioUD6Yzayioqck0d92v0GwX0lz2Vuj0IzHlnp4_rWId_faT-g.webp" alt="004 파이리" style="zoom:50%;" />

1. 불 속성 몬스터. 물 속성 몬스터에게 약하다.
2. hp : 100 / power : 40 / mp : 30
3. <맹화 : 공격> hp가 1/3 이하일 때 공격력 1.5배 상승.
4. <선파워 : 버프> 특수공격이 1.5배 상승. 하지만 매 턴 hp 1/3씩 줄어든다.



## 상황설정 

### 결투 방식 결정

- 1:1 or 3:3 결정한다.

### player 결정

- 플레이어를 선택한다.

### 결투

- 1:1의 경우
  - 첫 공격권은 랜덤으로 주어진다. 
  - 나의 차례에 (일반공격/기술1/기술2) 중 하나를 택한다.
  - 매 턴마다 나와 상대의 상태창을 보여준다. 
  - 어느 한 쪽 플레이어의 hp가 0이 되면 배틀을 종료한다.
- 3:3의 경우
  - 첫 공격권은 랜덤으로 주어진다. 
  - 공격 순서는 랜덤이다.
  - 나의 차례에 (일반공격/기술1/기술2) 중 하나를 택한다.
  - 매 턴마다 나와 상대의 상태창을 보여준다. 
  - 포켓몬이 한 마리가 남으면 배틀을 종료한다.



# 설계

## 클래스 다이어그램

![image-20240531191131050](/images/2024-05-26-객지프-battle-assignment/image-20240531191131050.png)