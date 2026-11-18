---
title: "Mongscape"
summary: "웹캠으로 인식한 몸동작으로 플레이하는 운동 러너 게임 (v1.0.0 정식 출시)"
period:
  start: "2026-09"
  end: "2026-11"
  note: "2026-09-18 ~ 2026-11-14"
team:
  size: "확인 필요"
  type: "팀"
  note: "노트에는 '2인 이상'으로만 적혀 있음"
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
  - "BlazePose를 Unity 안에서 GPU로 직접 추론하고, 구간별 판정으로 오인식 제거"
  - "얼굴 사진 대신 특징값만 저장하는 로그인 서버와 코인·상점·통합 랭킹"
  - "Docker, Caddy, PostgreSQL로 VPS에 배포하고 속도 제한·백업 등 보안 운영"
  - "씨드 기반 장애물 배치, 난이도 곡선, 튜토리얼, 테스트 약 290개"
  - "전시용 데모를 일반 배포용으로 정리해 GitHub Releases로 v1.0.0 출시"
links:
  - type: release
    label: "v1.0.0 내려받기"
    url: "https://github.com/kihwan04/Mongscape/releases/tag/v1.0.0"
  - type: repo
    label: "GitHub 저장소"
    url: "https://github.com/kihwan04/Mongscape"
images:
  - src: "프로젝트/무한옥/mongscape-play-mine.png"
    alt: "Mongscape 광산 구간 플레이 화면"
    use: "대표 이미지"
  - src: "프로젝트/무한옥/mongscape-ready-skeleton.png"
    alt: "탈출 준비 화면 — 웹캠 자세 인식 뼈대 표시"
    use: "화면 캡처"
  - src: "프로젝트/무한옥/mongscape-cart-fork.png"
    alt: "수레 갈림길 구간"
    use: "화면 캡처"
  - src: "프로젝트/무한옥/mongscape-result.png"
    alt: "결과 화면"
    use: "화면 캡처"
  - src: "프로젝트/무한옥/mongscape-login.png"
    alt: "로그인 화면"
    use: "화면 캡처"
  - src: "프로젝트/무한옥/mongscape-play-zoo.png"
    alt: "사육장 구간 플레이 화면"
    use: "화면 캡처"
order: 5
featured: true
island:
  x: 78
  z: 0
  size: 6
unverified:
  - "최종 팀 인원 (노트에 '2인 이상, 최종 인원 확인'으로 표시)"
  - "저장소·릴리스 주소에 팀원의 GitHub 계정 이름이 들어 있음 — 링크 게재에 문제가 없는지"
---

Mongscape(몽스케이프)는 광산, 수레 갈림길, 감옥, 동물원을 달려 탈출하는 3레인 러너 게임입니다. 웹캠으로 인식한 실제 몸동작으로 장애물을 피합니다. 바리케이드는 점프, 철창은 숙이기, 계단은 무릎 번갈아 들기, 수레는 몸을 기울여 레일을 고르는 식으로 장애물마다 요구하는 동작이 다릅니다. 전신, 상체, 키보드 세 가지 방식으로 플레이할 수 있고, 2026년 11월 14일 v1.0.0을 GitHub Releases로 출시했습니다.

저는 10월 전시 버전 이후의 기능 확장과 서버, 출시 작업 대부분을 맡았습니다. 몸동작 인식은 별도 Python 서버 없이 Unity 안에서 BlazePose를 GPU로 추론합니다. 달리는 구간은 엉덩이 위치로만, 수레 구간은 어깨선 기울기로만 좌우를 판정해 흔들림이나 기울임으로 레인이 바뀌는 오인식을 없앴습니다. 무릎 들기는 "든 상태 유지"가 아니라 반대쪽 무릎이 기준을 넘는 순간을 한 걸음으로 세어, 한쪽만 들고 버티는 방법을 막았습니다.

회원은 얼굴로 로그인합니다. 서버는 얼굴 사진을 저장하지 않고 특징값만 보관하며, 코인 적립은 같은 판이 두 번 적립되지 않도록 멱등 처리했습니다. 처음으로 직접 서버를 호스팅하면서 Docker Compose로 Caddy, API, PostgreSQL을 묶어 VPS에 배포했고, 요청 속도 제한, SSH 키 전용 로그인, 방화벽, 매일 DB 백업을 갖췄습니다.

게임 쪽에서는 판마다 배치가 바뀌되 항상 지나갈 차선이 남는 씨드 기반 장애물 배치, 거리에 따른 난이도 곡선, 방식별 7단계 튜토리얼, 아이템과 상점, 랭킹을 만들었습니다. 게임 규칙은 Unity에 의존하지 않는 계층으로 분리해 단위 테스트를 붙였고, Unity 테스트 약 260개와 서버 테스트 30개가 있습니다.

출시를 위해 개발자용 기능을 Release 빌드의 컴파일 단계에서 제외하고, 개인정보와 얼굴 특징값 동의를 항목별로 나눴으며, 개인정보 처리방침을 작성했습니다. 동의를 거부해도 게스트로 플레이할 수 있습니다.
