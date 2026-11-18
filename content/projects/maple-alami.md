---
# 화면에 나오는 곳: title, summary, role, highlights, 사진 caption, 그리고 맨 아래 본문.
# 본문에서 <!-- more --> 아래는 접혀 있다가 "이어서 읽기"를 누르면 펼쳐진다.
# ![](키)는 사진 자리다. 키는 images에 적힌 파일 이름에서 확장자를 뺀 것이다.
title: "메이플 할일 알리미"
summary: "메이플스토리 숙제와 주간 수익을 보여 주는 PWA, 남은 숙제를 알려 주는 디스코드 봇"
period:
  start: "2026-10"
  end: "2026-10"
  # 일 단위 기간(화면에는 안 나옴): 2026-10-23 ~ 2026-10-26
team:
  size: 1
  type: "개인"
role: "기획, 요구사항 정리, 직접 써 보며 테스트, 배포. 구현은 Claude Code와 함께"
stack:
  - React 18
  - TypeScript
  - Vite
  - PWA
  - Cloudflare Pages
  - Cloudflare Workers
  - Workers KV
  - Cron Triggers
  - NEXON Open API
  - Discord Interactions API
  - WebCrypto
highlights:
  - "웹앱과 디스코드 봇이 같은 계산 코드를 써서 어디서 봐도 수치가 같습니다"
  - "API 키는 암호화해서 저장하고, 디스코드에서 온 요청인지 서명으로 확인합니다"
  - "서버 없이 Cloudflare 무료 플랜만으로 운영합니다"
links:
  - type: deploy
    label: "서비스 바로가기"
    url: "https://maple-alami.pages.dev"
  - type: demo
    label: "API 키 없이 데모 보기"
    url: "https://maple-alami.pages.dev/?demo"
  - type: repo
    label: "GitHub 저장소"
    url: "https://github.com/lilohdong/maple_alami"
logo:
  # 원본 512x512 PNG, 같은 폴더에 SVG도 있다
  src: "content/projects/maple-alami/maple-alami-logo.webp"
  alt: "메이플 할일 알리미 로고"
  source: "프로젝트/메이플 할일 알리미/maple-alami-logo.png"
  width: 256
  height: 256
images:
  - src: "content/projects/maple-alami/maple-desktop.webp"
    alt: "메이플 할일 알리미 대시보드 (데스크톱)"
    caption: "데모 데이터로 본 캐릭터별 숙제와 주간 결정석 수익"
    use: "대표 이미지"
    width: 1280
    height: 1000
    source: "프로젝트/메이플 할일 알리미/maple-desktop.png"
  - src: "content/projects/maple-alami/maple-mobile.webp"
    alt: "대시보드 (모바일)"
    caption: "모바일 대시보드"
    use: "화면 캡처"
    width: 500
    height: 1250
    source: "프로젝트/메이플 할일 알리미/maple-mobile.png"
  - src: "content/projects/maple-alami/maple-notify.webp"
    alt: "디스코드 알림 설정 화면"
    caption: "디스코드 알림 설정"
    use: "화면 캡처"
    width: 1280
    height: 760
    source: "프로젝트/메이플 할일 알리미/maple-notify.png"
order: 4
featured: true
island:
  x: 78
  z: -28
  size: 6
unverified: []
---

![](maple-desktop)

친구들과 주간 숙제를 자주 놓쳐서 4일 동안 만들었고, 친구들과 쓰는 디스코드 서버에서 사용합니다.

써 보니 주간 수익이 0으로 나왔습니다. 실제 API 응답을 보니 난이도 표기가 영문이라 한글로 만든 가격표와 맞지 않았습니다. 표기를 하나로 맞추고 저장된 설정도 새 형식으로 옮겼습니다.

<!-- more -->

![](maple-notify)

정기 알림은 수요일 18시와 매일 22시에, 남은 항목이 있을 때만 보냅니다. 봇은 늘 켜 두는 서버 없이, 디스코드에서 요청이 올 때만 Cloudflare Worker에서 돌아갑니다.
