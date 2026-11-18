---
title: "Mongscape"
summary: "웹캠으로 인식한 몸동작으로 플레이하는 운동 러너 게임 (v1.0.0 정식 출시)"
period:
  start: "2026-09"
  end: "2026-11"
  note: "2026-09-18 ~ 2026-11-14"
team:
  size: 5
  type: "팀"
  note: "5인 팀"
role: "몸동작 인식, 얼굴 로그인 계정 서버, 출시 담당 (커밋 169개 중 156개)"
stack:
  - Unity 6
  - C#
  - Unity AI Inference
  - BlazePose
  - UI Toolkit
  - Python
  - OpenCV (YuNet, SFace)
  - PostgreSQL 17
  - Docker Compose
  - Caddy
  - NUnit
highlights:
  - "BlazePose를 Unity 안에서 GPU로 추론하고, 구간마다 판정 기준을 달리해 오인식을 없앴습니다"
  - "같은 판의 코인이 두 번 적립되지 않게 멱등 처리했습니다"
  - "Docker Compose로 Caddy, API, PostgreSQL을 묶어 VPS에 배포했습니다"
links:
  - type: release
    label: "v1.0.0 내려받기"
    url: "https://github.com/kihwan04/Mongscape/releases/tag/v1.0.0"
  - type: repo
    label: "GitHub 저장소"
    url: "https://github.com/kihwan04/Mongscape"
images:
  - src: "content/projects/mongscape/mongscape-play-mine.webp"
    alt: "Mongscape 광산 구간 플레이 화면"
    caption: "광산 구간, 오른쪽 아래는 웹캠 자세 인식"
    use: "대표 이미지"
    width: 1600
    height: 1000
    source: "프로젝트/무한옥/mongscape-play-mine.png"
  - src: "content/projects/mongscape/mongscape-ready-skeleton.webp"
    alt: "탈출 준비 화면: 웹캠 자세 인식 뼈대 표시"
    caption: "플레이 방식 선택과 웹캠 자세 인식"
    use: "화면 캡처"
    width: 1600
    height: 1000
    source: "프로젝트/무한옥/mongscape-ready-skeleton.png"
  - src: "content/projects/mongscape/mongscape-cart-fork.webp"
    alt: "수레 갈림길 구간"
    caption: "수레 갈림길에서 몸을 기울여 길 고르기"
    use: "화면 캡처"
    width: 1600
    height: 1000
    source: "프로젝트/무한옥/mongscape-cart-fork.png"
  - src: "content/projects/mongscape/mongscape-result.webp"
    alt: "결과 화면"
    caption: "판이 끝난 뒤 점수와 랭킹"
    use: "화면 캡처"
    width: 1600
    height: 1000
    source: "프로젝트/무한옥/mongscape-result.png"
  - src: "content/projects/mongscape/mongscape-login.webp"
    alt: "로그인 화면"
    caption: "얼굴 로그인"
    use: "화면 캡처"
    width: 1600
    height: 1000
    source: "프로젝트/무한옥/mongscape-login.png"
  - src: "content/projects/mongscape/mongscape-play-zoo.webp"
    alt: "사육장 구간 플레이 화면"
    caption: "동물원 구간, 끊긴 레일 피하기 튜토리얼"
    use: "화면 캡처"
    width: 1600
    height: 1000
    source: "프로젝트/무한옥/mongscape-play-zoo.png"
order: 5
featured: true
island:
  x: 78
  z: 0
  size: 6
unverified:
  - "mongscape-result 랭킹에 다른 회원 닉네임이 보인다. 팀원 이름을 영문 자판으로 친 것일 수 있어 본문에 쓰지 않았다. 사이트에 실을지 확인 필요"
---

![](mongscape-play-mine)

웹캠으로 인식한 몸동작으로 장애물을 피하는 3레인 러너 게임입니다. 점프하고 숙이고 무릎을 들고 몸을 기울여서 광산과 감옥, 동물원을 달려 탈출합니다. 5인 팀 프로젝트입니다.

저는 10월 전시 버전 이후의 기능 확장과 서버, 출시 작업 대부분을 맡았습니다. 커밋 169개 중 156개가 제 것입니다.

![](mongscape-ready-skeleton)

2026년 11월 14일 v1.0.0을 GitHub Releases로 출시했습니다.

<!-- more -->

![](mongscape-cart-fork)

달리는 구간은 엉덩이 위치로만, 수레 구간은 어깨선 기울기로만 좌우를 판정해서 몸이 흔들릴 때 레인이 바뀌는 문제를 없앴습니다.

![](mongscape-login)

회원은 얼굴로 로그인하고, 서버는 얼굴 사진 대신 특징값만 보관합니다. 서버를 직접 호스팅한 것은 처음이었고 요청 속도 제한, 방화벽, 매일 DB 백업을 설정했습니다. 테스트는 Unity 쪽 약 260개, 서버 쪽 30개입니다.
