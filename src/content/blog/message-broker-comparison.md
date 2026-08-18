---
title: "Kafka·RabbitMQ·Redis Streams는 무엇이 다를까?"
description: "Kafka, RabbitMQ, Redis Streams의 메시지 저장과 소비 모델을 비교하고 서비스 요구사항에 맞는 선택 기준을 정리한다."
pubDate: 2026-08-18
tags: ["message-broker", "kafka", "rabbitmq", "redis"]
draft: false
---

AI 이미지나 동화 생성처럼 처리 시간이 긴 작업을 HTTP 요청 안에서 모두 끝내려고 하면 문제가 생긴다.

클라이언트는 작업이 끝날 때까지 연결을 유지해야 하고, 외부 API가 느려지면 서버의 요청 처리 시간도 함께 늘어난다. 작업 도중 서버가 재시작되면 어디까지 처리했는지 추적하기도 어렵다.

이런 작업을 API Server와 Worker로 분리하려면 두 프로세스 사이에서 작업을 전달할 방법이 필요하다. 이 과정에서 Kafka, RabbitMQ, Redis Streams를 후보로 검토하게 되었다.

세 기술은 모두 생산자가 보낸 데이터를 소비자에게 전달할 수 있지만, 내부에서 데이터를 저장하고 소비 위치를 관리하는 방식은 다르다. 이번 글에서는 단순 기능 목록보다 Queue와 Log의 차이에서 출발해 세 기술을 비교해보고자 한다.

## 1. 메시지 브로커가 필요한 이유

동기 방식에서는 요청을 보낸 쪽이 작업 결과를 받을 때까지 기다린다.

```text
Client → API Server → 외부 AI API → API Server → Client
```

작업 시간이 짧다면 구조가 단순하다는 장점이 있다. 하지만 외부 API 호출과 파일 처리처럼 수십 초 이상 걸릴 수 있는 작업에는 다음 문제가 생긴다.

- HTTP timeout 안에 작업이 끝나지 않을 수 있다.
- 동시에 긴 작업이 몰리면 API Server의 자원을 오래 점유한다.
- 실패한 작업을 다시 처리하기 위한 상태 관리가 필요하다.
- API Server와 실제 작업 처리량을 독립적으로 확장하기 어렵다.

비동기 방식에서는 API Server가 작업을 브로커에 전달하고 먼저 응답한다. Worker는 자신의 처리 속도에 맞춰 작업을 가져간다.

```text
Client → API Server → Broker → Worker
              ↓          ↓
        요청 접수 응답   실제 작업 처리
```

브로커는 생산자와 소비자의 처리 시점을 분리하고, 두 시스템 사이의 일시적인 속도 차이를 흡수한다.

## 2. Queue와 Log의 차이

Kafka, RabbitMQ, Redis Streams를 비교하기 전에 먼저 Queue와 append-only log의 소비 방식을 구분해야 한다.

### 2.1. Queue

Queue에서는 메시지를 처리할 소비자에게 전달하고, 처리가 완료되면 해당 메시지를 Queue에서 제거하는 흐름이 일반적이다.

```text
Queue: [A][B][C]
          ↓
      Consumer가 A 처리 후 ACK
Queue:    [B][C]
```

RabbitMQ의 전통적인 Queue 모델이 여기에 가깝다. 소비자가 ACK를 보내면 broker는 해당 delivery에 대한 책임을 소비자에게 넘기고 Queue에서 제거할 수 있다.

이 모델은 처리해야 할 작업을 여러 Worker에 나누어 주는 작업 Queue에 자연스럽다.

### 2.2. Append-only log

Log에서는 새로운 record를 끝에 계속 추가한다. 소비자가 읽었다는 이유만으로 record가 즉시 삭제되지 않는다. 소비자는 자신이 어디까지 읽었는지를 별도의 위치 정보로 관리한다.

```text
Log: [A][B][C][D]
          ↑
      Consumer offset
```

Kafka는 topic의 partition을 append-only log로 관리한다. 소비자는 offset을 이용해 읽을 위치를 기억한다. 보관 기간 안이라면 offset을 이전으로 옮겨 과거 record를 다시 읽을 수 있다.

Redis Streams도 entry를 시간 순서의 ID와 함께 append-only 구조에 추가한다. Consumer Group을 사용하면 마지막 전달 위치와 아직 ACK하지 않은 Pending Entry를 Redis가 관리한다.

다만 Kafka와 Redis Streams가 모두 log 형태라는 이유로 같은 확장 구조를 가지는 것은 아니다. Kafka는 partition을 분산과 병렬 처리의 기본 단위로 사용한다. Redis의 하나의 Stream key는 자동으로 여러 partition에 나뉘지 않는다.

## 3. Kafka

Kafka는 분산 event streaming platform이다. Producer가 보낸 event는 topic에 기록되고, topic은 하나 이상의 partition으로 나뉜다.

```text
Topic
├── Partition 0: [A][C][E]
├── Partition 1: [B][D][F]
└── Partition 2: [G][H][I]
```

같은 event key는 같은 partition으로 보내도록 구성할 수 있다. Kafka는 한 topic 전체가 아니라 각 partition 안에서 record가 기록된 순서를 보장한다.

Consumer Group 안에서는 하나의 partition을 한 시점에 한 consumer가 담당한다. Partition 수가 병렬 처리의 상한과 배치에 직접적인 영향을 주기 때문에 처음부터 key와 partition 전략을 함께 고민해야 한다.

Kafka의 주요 특징은 다음과 같다.

- event를 disk log에 보관하고 retention 정책에 따라 유지한다.
- consumer가 offset을 관리하므로 같은 event를 다시 읽기 쉽다.
- partition 단위로 처리량을 나누고 broker를 확장할 수 있다.
- 같은 데이터를 서로 다른 Consumer Group이 독립적으로 읽을 수 있다.
- event history, stream processing, 여러 downstream 구독에 적합하다.

반면 작은 작업 Queue 하나를 위해 도입하면 broker와 partition, replication, retention, consumer lag까지 운영해야 한다. Kafka의 기능이 나쁜 것이 아니라, 해결하려는 문제가 현재 서비스보다 클 수 있다는 뜻이다.

## 4. RabbitMQ

RabbitMQ의 AMQP 0-9-1 모델에서 Producer는 Queue에 직접 메시지를 넣는 대신 Exchange에 메시지를 발행한다. Exchange는 type과 binding 규칙에 따라 하나 이상의 Queue로 메시지를 전달한다.

```text
Producer → Exchange → Queue A → Consumer A
                    └→ Queue B → Consumer B
```

대표적인 Exchange type은 다음과 같다.

| Exchange | 라우팅 방식 |
|---|---|
| Direct | routing key가 정확히 일치하는 Queue로 전달한다. |
| Fanout | 연결된 모든 Queue에 전달한다. |
| Topic | 점으로 구분된 routing key pattern으로 전달한다. |
| Headers | header 조건을 기준으로 전달한다. |

Exchange와 Binding을 이용하면 애플리케이션 코드에 복잡한 분기문을 두지 않고도 다양한 메시지 routing을 구성할 수 있다.

RabbitMQ의 consumer acknowledgement는 메시지를 성공적으로 처리했음을 broker에 알린다. 처리 도중 consumer 연결이 끊기고 ACK하지 못했다면 메시지를 다른 consumer에게 다시 전달할 수 있다.

처리에 실패한 메시지는 reject 또는 nack 정책에 따라 다시 Queue에 넣거나 Dead Letter Exchange로 보낼 수 있다. Quorum Queue를 사용하면 Raft 기반의 복제된 Queue를 구성할 수도 있다.

RabbitMQ는 다음과 같은 상황에 잘 맞는다.

- 작업을 여러 consumer에 분배하는 Queue가 필요하다.
- routing key나 pattern에 따른 분기가 중요하다.
- request/reply, publish/subscribe 등 AMQP messaging pattern을 사용한다.
- Queue 단위의 TTL, 우선순위, dead lettering 정책이 필요하다.

## 5. Redis Streams

Redis Streams는 Redis 5.0부터 제공된 append-only 자료구조이다. `XADD`로 entry를 추가하면 Redis가 시간 순서에 기반한 ID를 생성한다.

```text
XADD image:jobs * request_id 123 stage character
```

Consumer Group을 만들고 `XREADGROUP`으로 읽으면 같은 Group의 consumer가 서로 다른 entry를 나누어 처리할 수 있다.

```text
Stream: [A][B][C][D]
          ↓  ↓  ↓  ↓
Group:   C1 C2 C1 C2
```

Consumer에게 전달됐지만 아직 `XACK`되지 않은 entry는 Pending Entries List에 남는다. `XPENDING`으로 상태를 확인하고, 오래 처리되지 않은 entry는 `XCLAIM`이나 `XAUTOCLAIM`으로 다른 consumer가 넘겨받을 수 있다.

Redis Streams의 특징은 다음과 같다.

- Redis 자료구조이므로 기존 Redis 환경에서 사용할 수 있다.
- Stream entry는 명시적으로 trim하거나 삭제하기 전까지 남는다.
- Consumer Group별 전달 위치와 Pending Entry를 관리한다.
- 하나의 Stream에 여러 Consumer Group을 둘 수 있다.
- 처리되지 않은 Pending Entry를 확인하고 다시 소유할 수 있다.

하지만 Redis Streams가 완성된 작업 Queue 운영 정책을 모두 대신 만들어 주는 것은 아니다.

애플리케이션은 다음 항목을 직접 결정해야 한다.

- 언제 `XACK`할 것인가?
- 오래 Pending 상태인 entry를 누가 회수할 것인가?
- 몇 번 실패한 작업을 DLQ로 보낼 것인가?
- Stream 크기를 언제, 어떤 기준으로 trim할 것인가?
- 중복 처리되어도 결과가 깨지지 않도록 어떻게 멱등성을 보장할 것인가?

## 6. 세 기술 비교

| 기준 | Kafka | RabbitMQ | Redis Streams |
|---|---|---|---|
| 중심 모델 | partitioned event log | exchange와 queue | append-only stream |
| 소비 위치 | consumer offset | delivery와 ACK | entry ID와 Pending Entries List |
| 기본 보관 관점 | retention 동안 event 유지 | ACK된 메시지는 Queue에서 제거 가능 | trim 또는 삭제 전까지 entry 유지 |
| 순서 기준 | partition 내부 | Queue의 전달 순서, 병렬 소비·재전달 시 주의 | Stream ID 순서, 병렬 처리 완료 순서는 별도 |
| 재처리 | offset을 이동해 다시 읽음 | requeue, nack, DLX 정책 | Pending 조회·claim 또는 ID 기준 재조회 |
| 라우팅 | topic과 partition | Exchange와 Binding | Stream key와 Group을 애플리케이션이 설계 |
| 수평 확장 단위 | partition | Queue와 consumer | consumer는 늘릴 수 있지만 한 Stream은 자동 partition되지 않음 |
| 여러 구독자 | Consumer Group마다 독립 소비 | Queue를 여러 개 binding | Consumer Group마다 독립 소비 |
| 운영 초점 | broker·partition·replication·retention | topology·Queue·Exchange·ack 정책 | Redis 내구성·메모리·pending·trim 정책 |

이 표에서 중요한 것은 어느 기술이 절대적으로 우수한가가 아니다. 같은 “메시지를 전달한다”는 기능 아래에서 무엇을 기본 모델로 삼고 있는지가 다르다.

## 7. ACK가 있으면 한 번만 처리되는가?

메시지 시스템을 설명할 때 자주 등장하는 용어가 at-most-once, at-least-once, exactly-once이다.

### 7.1. At-most-once

메시지가 최대 한 번 전달된다. 재전달하지 않으므로 중복 가능성은 낮지만 장애 시 메시지가 사라질 수 있다.

### 7.2. At-least-once

메시지가 최소 한 번 전달된다. ACK 전에 consumer가 실패하면 다시 전달하므로 유실 가능성을 줄일 수 있지만, 같은 메시지가 두 번 이상 처리될 수 있다.

예를 들어 consumer가 DB 저장을 완료한 직후 ACK를 보내기 전에 종료됐다고 가정해보자.

```text
1. 메시지 수신
2. DB 저장 완료
3. consumer 종료
4. ACK 전송 실패
5. 메시지 재전달
```

Broker 입장에서는 처리가 끝났는지 알 수 없으므로 메시지를 다시 전달한다. 이미 DB에는 결과가 저장되었기 때문에 consumer가 같은 작업을 다시 수행할 수 있다.

따라서 ACK를 사용한다고 자동으로 exactly-once가 되는 것은 아니다. At-least-once 소비에서는 message ID나 업무 식별자를 이용해 중복 요청에도 같은 결과를 반환하는 멱등 처리가 필요하다.

### 7.3. Exactly-once

Exactly-once는 단순히 broker 설정 하나로 얻는 속성이 아니다. 메시지 소비와 외부 DB 저장, 외부 API 호출까지 포함하면 각 시스템 사이의 transaction 경계를 함께 설계해야 한다.

Kafka는 transaction과 idempotent producer를 이용해 Kafka 안의 consume-process-produce 흐름에 exactly-once semantics를 제공할 수 있다. 그러나 Kafka 밖의 DB나 외부 API까지 자동으로 하나의 transaction이 되는 것은 아니다.

RabbitMQ와 Redis Streams에서도 ACK 시점과 업무 저장의 순서를 정하고, 중복 delivery를 견딜 수 있도록 consumer를 설계해야 한다.

## 8. Bookkiki는 왜 Redis Streams를 선택했는가?

Bookkiki에는 AI 이미지와 동화 생성처럼 API 요청보다 오래 걸리는 작업이 있다. API Server는 요청과 핵심 상태를 PostgreSQL에 저장하고, Worker는 외부 AI API와 파일 작업을 담당한다.

이 구조에서 필요한 messaging 기능은 다음과 같았다.

- API Server가 생성 작업을 Worker에 전달할 수 있어야 한다.
- 여러 Worker가 같은 작업을 동시에 가져가지 않아야 한다.
- 처리 중 Worker가 종료되면 작업을 다시 확인할 수 있어야 한다.
- 작업 결과가 중복 전달되어도 상태가 깨지지 않아야 한다.
- 진행률 같은 임시 상태도 빠르게 조회할 수 있어야 한다.

Kafka의 장기 event history와 대규모 partition 처리는 현재 작업 전달 요구보다 범위가 넓었다. RabbitMQ의 Exchange 기반 routing도 강력하지만, 현재 작업 종류는 Stream key로 구분할 수 있을 만큼 단순했다.

반면 Redis는 작업 진행률 같은 임시 상태를 저장하는 용도로도 사용할 계획이었다. Redis Streams를 선택하면 새로운 종류의 broker를 하나 더 운영하지 않고 작업 전달과 임시 상태를 같은 Redis 환경에서 다룰 수 있다.

선택 이유를 정리하면 다음과 같다.

1. 현재 routing 구조가 단순하다.
2. 작업 이력의 장기 분석보다 Worker 전달이 우선이다.
3. Consumer Group과 Pending Entry가 필요한 소비 모델을 제공한다.
4. 진행률 저장을 위해 사용할 Redis와 인프라를 공유할 수 있다.
5. 서비스 규모에서 운영 요소의 종류를 줄이는 편이 중요했다.

다만 “이미 Redis를 사용하니 Streams는 공짜”라는 뜻은 아니다. AOF·RDB와 복제 정책, Stream trim, Pending 회수, ACK, retry, DLQ, 모니터링을 별도로 설계해야 한다.

Redis Streams를 선택한 것은 신뢰성 설계가 필요 없어서가 아니라, 현재 요구에 필요한 기능과 운영 복잡도의 균형이 맞았기 때문이다.

## 9. 정리

Kafka, RabbitMQ, Redis Streams는 모두 비동기 메시지를 전달할 수 있지만 중심 모델이 다르다.

Kafka는 partitioned log를 기반으로 event를 보관하고 다시 읽는 데 강점이 있다. RabbitMQ는 Exchange와 Queue를 이용한 routing과 작업 분배에 강점이 있다. Redis Streams는 Redis 안의 append-only log와 Consumer Group을 이용해 비교적 단순한 작업 전달 구조를 만들 수 있다.

기술을 선택할 때는 제품 이름보다 다음 질문을 먼저 확인해야 한다.

1. 메시지를 처리한 뒤 지울 것인가, 일정 기간 보관할 것인가?
2. 과거 메시지를 얼마나 자주 다시 읽어야 하는가?
3. 순서를 어디까지 보장해야 하는가?
4. routing 규칙은 얼마나 복잡한가?
5. 어느 정도의 처리량과 수평 확장이 필요한가?
6. 팀이 운영해야 할 broker와 장애 복구 범위는 어디까지인가?

Bookkiki의 현재 답은 “단순한 작업 전달, Consumer Group, 임시 상태 저장, 적은 인프라 종류”였다. 이 조건에서는 Redis Streams가 적합했지만, event history와 다수의 독립 구독자가 핵심이 되거나 routing 요구가 복잡해진다면 선택을 다시 검토해야 한다.
