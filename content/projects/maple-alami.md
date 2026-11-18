---
title: "메이플 할일 알리미"
summary: "메이플스토리 숙제와 주간 수익을 보여 주는 PWA, 남은 숙제를 알려 주는 디스코드 봇"
period:
  start: "2026-10"
  end: "2026-10"
  note: "2026-10-23 ~ 2026-10-26"
team:
  size: 1
  type: "개인"
role: "기획, 요구사항 정의, 실사용 테스트, 배포 (구현은 Claude Code와 페어 프로그래밍)"
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
  - "웹앱과 Worker가 같은 계산 코드를 써서 앱과 디스코드에 같은 수치가 나옵니다"
  - "API 키는 AES-GCM으로 암호화해 저장하고, 디스코드 요청은 Ed25519 서명을 검증합니다"
  - "서버 없이 Cloudflare 무료 플랜만으로 운영합니다"
links:
  - type: deploy
    label: "서비스 바로가기"
    url: "https://maple-alami.pages.dev"
  - type: demo
    label: "데모 (API 키 없이 보기)"
    url: "https://maple-alami.pages.dev/?demo"
  - type: repo
    label: "GitHub 저장소"
    url: "https://github.com/lilohdong/maple_alami"
logo:
  # 원본 512x512 PNG, 같은 폴더에 SVG도 있다
  # 아직 변환 전이라 src에 원본 경로를 두고 width, height가 없다. 변환은 U4(import 스크립트의 logo 지원) 뒤에 한다
  src: "content/projects/maple-alami/maple-alami-logo.webp"
  alt: "메이플 할일 알리미 로고"
  source: "프로젝트/메이플 할일 알리미/maple-alami-logo.png"
  width: 256
  height: 256
images:
  - src: "content/projects/maple-alami/maple-desktop.webp"
    alt: "메이플 할일 알리미 대시보드 (데스크톱)"
    caption: "캐릭터별 숙제와 주간 결정석 수익 (데모 데이터)"
    use: "대표 이미지"
    width: 1280
    height: 1000
    source: "프로젝트/메이플 할일 알리미/maple-desktop.png"
  - src: "content/projects/maple-alami/maple-mobile.webp"
    alt: "대시보드 (모바일)"
    caption: "대시보드 (모바일)"
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

친구들과 메이플스토리 주간 숙제를 자주 놓쳐서 만들었습니다. 캐릭터별 숙제 현황과 주간 결정석 수익을 보여 주고, 리셋 전에 남은 숙제가 있으면 디스코드 봇이 알려 줍니다.

기획과 요구사항 정의, 실사용 테스트, 배포를 맡았고 구현은 Claude Code와 페어 프로그래밍으로 했습니다. 4일 동안 만들어 친구들과 쓰는 디스코드 서버에서 사용합니다.

써 보니 주간 수익이 0으로 나왔습니다. 실제 API 응답을 보니 난이도 표기가 영문이라 한글로 만든 가격표와 맞지 않았습니다. 표기를 하나로 맞추고 저장된 설정도 새 형식으로 옮겼습니다.

<!-- more -->

![](maple-notify)

정기 알림은 수요일 18시와 매일 22시에, 남은 항목이 있을 때만 보냅니다. 봇은 상시 실행 프로세스 없이 디스코드 HTTP Interactions로 Worker 요청마다 동작합니다.
