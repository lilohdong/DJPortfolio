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
role: "백엔드 전체를 설계하고 구현, 앱 API 연동 (커밋 104개 중 96개)"
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
  - "팀 ID와 작업 ID를 교차 검증해 다른 팀 작업에 접근하지 못하게 막았습니다"
  - "독촉 발송과 권한 확인, 이력 저장을 한 트랜잭션으로 묶었습니다"
  - "완료되거나 취소된 지 3일이 지난 작업은 스케줄러가 정리합니다"
links:
  - type: repo
    label: "GitHub 저장소"
    url: "https://github.com/lilohdong/NudgeUp"
logo:
  src: "content/projects/nudgeup/nudgeup-logo.webp"
  alt: "NudgeUp 로고"
  width: 99
  height: 100
  source: "프로젝트/NudgeUp/nudgeup-logo.png"
images:
  - src: "content/projects/nudgeup/nudgeup-main.webp"
    alt: "NudgeUp 메인 화면 디자인 시안: 팀원, 팀 할 일, 내 할 일"
    caption: "메인 화면 (디자인 시안)"
    use: "대표 이미지. 실제 앱 화면이 아니라 디자인 시안"
    width: 472
    height: 1015
    source: "프로젝트/NudgeUp/nudgeup-main.png"
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
    alt: "팀 설정 화면 디자인 시안: 팀장 지정, 팀원별 독촉 권한"
    caption: "팀 설정 (디자인 시안)"
    use: "디자인 시안"
    width: 535
    height: 1128
    source: "프로젝트/NudgeUp/nudgeup-team-settings.png"
  - src: "content/projects/nudgeup/nudgeup-erd.webp"
    alt: "NudgeUp 데이터베이스 ERD"
    caption: "DB 설계도 (ERD)"
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

![](nudgeup-main)

초대 코드로 승인 없이 팀에 들어가고, 한 사람이 여러 팀에 속할 수 있습니다.

계획서에서 제 몫은 독촉 알림과 팀 설정, DB 설계였는데, 개발하면서 Spring Boot 백엔드 전체와 앱의 API 연동까지 맡게 됐습니다.

<!-- more -->

![](nudgeup-erd)

백엔드는 auth, user, team, task, nudge 도메인으로 나누고, JWT 인증과 전역 예외 처리로 에러 응답 형식을 하나로 맞췄습니다. 앱은 MVVM 구조이고 토큰은 암호화 저장소에 둡니다. 마지막에 전체 코드 리뷰를 반영해 N+1 쿼리와 중복 코드를 정리했습니다.
