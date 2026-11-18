---
title: "NudgeUp"
summary: "팀장이 팀원에게 작업을 배정하고 푸시 알림으로 독촉하는 팀 업무 관리 안드로이드 앱"
period:
  start: "2026-05"
  end: "2026-06"
team:
  size: 2
  type: "팀"
  note: "2인 팀, 모바일 과목 프로젝트"
role: "백엔드 전체 설계·구현과 앱 API 연동 (커밋 104개 중 96개)"
stack:
  - Android (Java 17)
  - MVVM
  - Retrofit
  - Spring Boot 3
  - Spring Security
  - JPA
  - PostgreSQL 16
  - JWT
  - FCM
  - Docker Compose
highlights:
  - "Spring Boot 도메인별 패키지 구조, JWT 인증, 전역 예외 처리 구현"
  - "독촉 기능을 상태·권한 검증, FCM 발송, 이력 저장까지 하나의 트랜잭션으로 처리"
  - "팀 ID와 작업 ID 교차 검증으로 다른 팀 데이터 접근 차단"
  - "안드로이드 앱 MVVM 구조, 토큰 암호화 저장, 전체 화면을 실제 API에 연결"
  - "완료·취소 후 3일이 지난 작업을 자동 정리하는 스케줄러"
links:
  - type: repo
    label: "GitHub 저장소"
    url: "https://github.com/lilohdong/NudgeUp"
images:
  - src: "content/projects/nudgeup/nudgeup-main.webp"
    alt: "NudgeUp 메인 화면 디자인 시안 — 팀원, 팀 할 일, 내 할 일"
    caption: "메인 화면 (디자인 시안)"
    use: "대표 이미지. 실제 앱 화면이 아니라 디자인 시안"
    width: 472
    height: 1015
    source: "프로젝트/NudgeUp/nudgeup-main.png"
  - src: "content/projects/nudgeup/nudgeup-logo.webp"
    alt: "NudgeUp 로고"
    use: "로고"
    width: 99
    height: 100
    source: "프로젝트/NudgeUp/nudgeup-logo.png"
  - src: "content/projects/nudgeup/nudgeup-login.webp"
    alt: "로그인 화면 디자인 시안"
    caption: "로그인 (디자인 시안)"
    use: "디자인 시안"
    width: 438
    height: 654
    source: "프로젝트/NudgeUp/nudgeup-login.png"
  - src: "content/projects/nudgeup/nudgeup-signup.webp"
    alt: "회원가입 화면 디자인 시안"
    caption: "회원가입 (디자인 시안)"
    use: "디자인 시안"
    width: 383
    height: 629
    source: "프로젝트/NudgeUp/nudgeup-signup.png"
  - src: "content/projects/nudgeup/nudgeup-task-create.webp"
    alt: "작업 생성 화면 디자인 시안"
    caption: "작업 생성 (디자인 시안)"
    use: "디자인 시안"
    width: 649
    height: 1168
    source: "프로젝트/NudgeUp/nudgeup-task-create.png"
  - src: "content/projects/nudgeup/nudgeup-team-settings.webp"
    alt: "팀 설정 화면 디자인 시안 — 팀장 지정, 팀원별 독촉 권한"
    caption: "팀 설정 (디자인 시안)"
    use: "디자인 시안"
    width: 535
    height: 1128
    source: "프로젝트/NudgeUp/nudgeup-team-settings.png"
  - src: "content/projects/nudgeup/nudgeup-erd.webp"
    alt: "NudgeUp 데이터베이스 ERD"
    use: "DB 설계도"
    width: 1600
    height: 836
    source: "프로젝트/NudgeUp/nudgeup-erd.jpg"
order: 2
featured: true
island:
  x: 50
  z: 0
  size: 6
unverified:
  - "화면 이미지 5장은 실제 앱 화면이 아니라 디자인 시안. 나중에 실제 앱 화면 캡처로 교체 예정"
---

NudgeUp은 팀 단위로 일할 때 팀장이 팀원에게 작업을 맡기고, 진행이 느린 팀원에게 푸시 알림으로 바로 독촉할 수 있는 안드로이드 팀 업무 관리 앱입니다. 초대 코드로 승인 절차 없이 팀에 참가하고, 한 사람이 여러 팀에 동시에 소속될 수 있습니다.

계획서에서는 독촉 알림, 팀 생성·설정, DB 설계를 맡았지만, 개발이 진행되면서 Spring Boot 백엔드 전체와 앱의 API 연동까지 담당했습니다. 백엔드는 auth, user, team, task, nudge 도메인과 JWT·보안·FCM·예외 처리를 모은 공통 레이어로 나누었고, 공통 응답 래퍼와 에러 코드, 전역 예외 처리기로 에러 응답 형식을 통일했습니다.

개발 중 작업 API가 로그인 여부만 확인하고 요청한 작업이 그 팀의 것인지는 확인하지 않는 문제를 찾았습니다. 팀 ID와 작업 ID를 교차 검증하도록 바꾸어 다른 팀 작업에 접근하지 못하게 막았습니다. 독촉 발송은 작업 상태 검증, 독촉 권한 검증, FCM 발송, 이력 저장을 하나의 트랜잭션으로 묶었습니다.

앱은 Activity, ViewModel, Repository, Retrofit으로 이어지는 MVVM 구조입니다. 인터셉터로 모든 요청에 토큰을 자동으로 붙이고, 토큰은 암호화 저장소에 보관합니다. 목업 화면을 걷어내고 전체 화면을 실제 API에 연결했으며, 독촉 수신함과 받은 독촉 수 표시, 작업 폐기와 자동 만료, 팀 탈퇴·추방 기능을 추가했습니다.

작업 전에 설계 문서와 브랜치별 구현 계획을 먼저 쓰고 PR 단위로 병합했습니다. 마지막에는 전체 코드 리뷰를 반영해 N+1 쿼리와 중복 코드를 정리했습니다.
