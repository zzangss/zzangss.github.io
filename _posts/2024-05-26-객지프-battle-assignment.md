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



## 나의 마음가짐

이전 과제로 Hunter&Animal 프로그램을 만들때 갈수록 욕심이 생겨 원래의 요구사항을 중간에 수정하고 이를 반영하는 과정에 어려움이 생겼었다. 따라서 요구사항 분석과 설계 과정을 꼼꼼히 수행하여 이후 구현을 쉽게 하는 것이 목표이다.



# 요구사항 분석

## Player

- 이름, hp, power, mp, 무기
- 공격
  - 일반 공격과 기술 공격으로 나뉜다.
  - 일반 공격은 mp가 소모되지 않는다. 기술은 mp를 소모한다.
  - (일반) 공격 하기 : 타겟의 hp - 공격자의 hp
  - (일반) 공격 받기 : 공격자의 hp - 타겟의 hp
  - 기술 공격은 각 player에 설명한다.
- mp는 모두 30을 가진다.
- 몬스터는 속성값을 가진다. 상성이 맞지 않는 몬스터가 서로 싸울 경우, 불리한 속성을 가지는 몬스터의 power가 약해진다.



### 피카츄

<img src="https://i.namu.wiki/i/xwQbg0NjlN4bkskppVxpMIMruQaKVVU0X2J5-TFC3i6J5nA803zigFvfCXpoy34hQrFi80YIDJfWMu44XDolYZuEzKmyDXoZLe8QP57r2c31AA2hx6kIBwdDT0aKYhywyZzv2IO3eiZXAnYOKRyWRg.webp" alt="025 피카츄" style="zoom:50%;" />

1. 전기 속성 몬스터. 땅 속성 몬스터에게 약하다.
   1. 공격력이 30% 감소
2. hp : 100 / power : 40 / mp : 30



### 이브이

![133 이브이](https://i.namu.wiki/i/cbnKZOJUy8cvdgL1eGcEqxhsuiwC_OBNk-eaIAQnrtCVnaaHBnbBQfvCz7vrg-eI4pI61A61wzmr6a7lSVoTjOKmNfABMjTS_Nnnkz4SkI6B2Zcfw8WjjKU-4zYC9tX8Drxb5fm1XsIZDLvXMMzNgA.webp)

1. 일반 속성 몬스터. 불 속성 몬스터에 약하다.
2. hp : 120 / power : 30 / mp : 30



### 수댕이 

![501 수댕이](https://i.namu.wiki/i/IQSbPuxLK3n5k0aKJtbfW-VAvxXboC7Mmuqil8KkrH1NxdZsFJVRSyYOEQsmuH4yiqLfRxMxANPubmhOsOmE9pB0OZlrNNW0jtnsZAZTW-VhSmX12JzeQzpofCMseaBmJt7FGMh9HEq4rMotyYT4eA.webp)

1. 물 속성 몬스터. 전기 속성 몬스터에게 약하다.
2. hp : 120 / power : 30 / mp : 30



### 디그다

![050 디그다](https://i.namu.wiki/i/8BMmWEtFWGt683FyHOMye0nljo5d1OOftbcTZuZb4NvaoI6dW3nRp5fj_h5zqrH0T2EUwGIHl4XOsOwLrXA-YlUatXPs2hDOLtnZfgbOIg1VkmKhm4OpTBj8xxErYmIrhP8SaorP8l010AfvU1h_nA.webp)

1. 땅 속성 몬스터. 일반 속성 몬스터에게 약하다.

2. hp : 100 / power : 30 / mp : 30

### 파이리

![004 파이리](https://i.namu.wiki/i/qHxI_43t1FLdca3vUWC3IdgysV8aHECtT25imrS-fFkR5lKH8HMpXbPi1PNOztO74BRQVZuY99lwKpJt-NWrmSMM4tGHairaXfe4ve5aWG2Wl7IiN0pEmjleeF0B_VRucIyk1HSOBeoqycCz64O9AA.webp)

1. 불 속성 몬스터. 물 속성 몬스터에게 약하다.
2. hp : 100 / power : 40 / mp : 30



## Weapon

- 무기에 붙은 기능은 기술로 사용할 수 있다. 
- 일반적으로 기술은 mp 10을 소모한다.

### 제우스의 번개

- 피카츄의 무기
- <정전기 : 공격> 접촉한 상대를 30% 확률로 마비시킨다. 상대가 마비되면 공격을 한 번 더 할 수 있다.
- <피뢰침 : 공격> 50% 확률로 2배 강하게 공격할 수 있다.

### 헤라클레스의 검

- 이브이의 무기
- <돌진 : 공격> hp를 20 소모하고 1.5배 위력의 공격을 수행한다.
- <도주 : 방어> 무조건 도망 가능

### 포세이돈의 삼지창

- 수댕이의 무기
- <급류 : 공격> HP가 1/3 이하가 되면 공격의 위력이 1.5배 상승한다.
- <조가비 갑옷 : 방어> 상대의 공격 위력이 80% 감소한다.

### 하데스의 낫

- 디그다의 무기
- <개미지옥 : 공격>  일반 공격과 똑같지만, 일정 확률로 상대의 공격력을 10 하락시킨다.
- <모래숨기 : 방어> 땅 속에 숨어 공격을 피한다. (mp소모 5)

### 아폴론의 활

- 파이리의 무기
- <맹화 : 공격> hp가 1/3 이하일 때 공격력 1.5배 상승.
- <선파워 : 버프> 특수공격이 1.5배 상승. 하지만 매 턴 hp 1/3씩 줄어든다. 



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

![image-20240526204106371](/images/2024-05-26-객지프-battle-assignment/image-20240526204106371.png)