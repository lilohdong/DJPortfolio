---
# 화면에 나오는 곳: title, summary, role, highlights, 사진 caption, 그리고 맨 아래 본문.
# 본문에서 <!-- more --> 아래는 접혀 있다가 "이어서 읽기"를 누르면 펼쳐진다.
# ![](키)는 사진 자리다. 키는 images에 적힌 파일 이름에서 확장자를 뺀 것이다.
title: "NudgeUp"
summary: "팀장이 팀원에게 작업을 배정하고 푸시 알림으로 독촉하는 팀 업무 관리 안드로이드 앱"
period:
  start: "2026-05"
  end: "2026-06"
team:
  size: 2
  type: "팀"
  note: "2인 팀, 모바일 과목 프로젝트"
role: "백엔드 전체를 설계하고 구현, 앱과 서버 연결"
stack:
  - Android
  - Java 17
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
  - "요청한 작업이 그 팀의 것인지 확인해서 다른 팀 작업을 볼 수 없게 막았습니다"
  - "새 팀원은 독촉 권한이 꺼진 채로 들어오고 팀장이 켜 줘야 하며, 끝난 작업에는 독촉을 보낼 수 없습니다"
  - "완료되거나 취소된 지 3일이 지난 작업은 자동으로 지워집니다"
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
    caption: "메인 화면 디자인 시안"
    use: "대표 이미지. 실제 앱 화면이 아니라 디자인 시안"
    width: 472
    height: 1015
    source: "프로젝트/NudgeUp/nudgeup-main.png"
  - src: "content/projects/nudgeup/nudgeup-login.webp"
    alt: "로그인 화면 디자인 시안"
    caption: "로그인 디자인 시안"
    use: "디자인 시안"
    width: 438
    height: 654
    source: "프로젝트/NudgeUp/nudgeup-login.png"
  - src: "content/projects/nudgeup/nudgeup-signup.webp"
    alt: "회원가입 화면 디자인 시안"
    caption: "회원가입 디자인 시안"
    use: "디자인 시안"
    width: 383
    height: 629
    source: "프로젝트/NudgeUp/nudgeup-signup.png"
  - src: "content/projects/nudgeup/nudgeup-task-create.webp"
    alt: "작업 생성 화면 디자인 시안"
    caption: "작업 생성 디자인 시안"
    use: "디자인 시안"
    width: 649
    height: 1168
    source: "프로젝트/NudgeUp/nudgeup-task-create.png"
  - src: "content/projects/nudgeup/nudgeup-team-settings.webp"
    alt: "팀 설정 화면 디자인 시안: 팀장 지정, 팀원별 독촉 권한"
    caption: "팀 설정 디자인 시안"
    use: "디자인 시안"
    width: 535
    height: 1128
    source: "프로젝트/NudgeUp/nudgeup-team-settings.png"
  - src: "content/projects/nudgeup/nudgeup-erd.webp"
    alt: "NudgeUp 데이터베이스 ERD"
    caption: "DB 설계도"
    use: "DB 설계도"
    width: 1600
    height: 836
    source: "프로젝트/NudgeUp/nudgeup-erd.jpg"
order: 2
featured: true
island:
  x: -34
  z: -18
  size: 6
  landmark: "bell"
unverified:
  - "화면 이미지 5장은 실제 앱 화면이 아니라 디자인 시안. 나중에 실제 앱 화면 캡처로 교체 예정"
---

![](nudgeup-main)

초대 코드로 승인 없이 팀에 들어가고, 한 사람이 여러 팀에 속할 수 있습니다.

계획서에서 제 몫은 독촉 알림과 팀 설정, DB 설계였는데, 개발하면서 Spring Boot 백엔드 전체와 앱을 서버에 연결하는 일까지 맡게 됐습니다.

<!-- more -->

![](nudgeup-erd)

백엔드는 기능별로 auth, user, team, task, nudge로 나눴고, 에러가 나면 늘 같은 형식으로 답하게 했습니다. 로그인 토큰은 앱의 암호화 저장소에 둡니다. 마지막에 전체 코드를 다시 보면서 DB를 쓸데없이 여러 번 읽던 곳과 겹치는 코드를 정리했습니다.
