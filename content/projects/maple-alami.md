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
  - "웹앱과 Worker가 같은 계산 코드를 써서 앱과 디스코드에 늘 같은 수치가 나옵니다"
  - "디스코드 봇에 슬래시 명령 6종, 여러 단계로 이어지는 대화형 UI, Cron 정기 알림을 넣었습니다"
  - "API 키는 AES-GCM으로 암호화해 저장하고 디스코드 요청은 Ed25519 서명을 검증합니다. 웹앱에는 CSP와 SRI를 적용했습니다"
  - "실제 API 응답에서 난이도 표기가 영문인 것을 찾아, 주간 수익이 0으로 나오던 버그를 고쳤습니다"
  - "서버 없이 Cloudflare 무료 플랜만으로 운영해 운영비가 0원입니다"
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
images:
  - src: "content/projects/maple-alami/maple-desktop.webp"
    alt: "메이플 할일 알리미 대시보드 (데스크톱)"
    use: "대표 이미지"
    width: 1280
    height: 1000
    source: "프로젝트/메이플 할일 알리미/maple-desktop.png"
  - src: "content/projects/maple-alami/maple-mobile.webp"
    alt: "대시보드 (모바일)"
    use: "화면 캡처"
    width: 500
    height: 1250
    source: "프로젝트/메이플 할일 알리미/maple-mobile.png"
  - src: "content/projects/maple-alami/maple-notify.webp"
    alt: "디스코드 알림 설정 화면"
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

메이플 할일 알리미는 메이플스토리 캐릭터들의 주간 보스, 일일 숙제, 주간 숙제 현황과 주간 결정석 수익을 보여 주는 웹앱입니다. 리셋 전에 숙제가 남아 있으면 디스코드 봇이 멘션으로 알려 줍니다. 친구들과 주간 숙제를 자주 놓쳐서 직접 만들었고, 친구들과 쓰는 디스코드 서버에서 사용합니다.

서버를 따로 운영할 환경이 없어서 Cloudflare 무료 플랜의 Pages, Workers, KV, Cron만으로 구성했습니다. 웹앱은 PWA로 설치할 수 있습니다. 봇은 상시 실행 프로세스 없이 디스코드 HTTP Interactions 방식으로 Worker 요청 단위로 동작합니다. 정기 알림은 수요일 18시와 매일 22시에, 남은 항목이 있을 때만 보냅니다.

기획과 요구사항 정의, 실사용 테스트, 배포 계정 설정은 제가 했습니다. 구현은 Claude Code와 페어 프로그래밍으로 했고 설계 결정과 우선순위는 직접 정했습니다. 넥슨 API 클라이언트, 진행도와 수익 계산, 가격표는 외부 의존성 없이 작성해서 웹앱과 Worker가 같은 파일을 씁니다.

실제로 써 보니 주간 수익이 0으로 표시됐습니다. 브라우저 콘솔에서 실제 API 응답을 표로 뽑아 보니, 가격표는 한글 난이도로 만들었는데 API는 영문으로 응답하고 있었습니다. 난이도 표기를 하나로 맞추고, 이미 저장된 사용자 설정도 새 형식으로 옮겼습니다.

예상 수익이 실제보다 크게 나오는 문제도 있었습니다. 주 12회 처치 한도 안에서 이미 잡은 보스가 횟수를 차지한다는 점을 반영해 계산을 다시 짰습니다.

API 키는 브라우저에만 저장합니다. 알림을 켤 때만 Worker KV에 AES-GCM으로 암호화해 저장하고, 해제하면 바로 지웁니다. 디스코드 요청은 모두 Ed25519 서명을 검증하고, 웹앱에는 CSP와 SRI를 적용했습니다.
