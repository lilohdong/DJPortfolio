---
# 근거: 비공개 저장소 lilohdong/cpbs (docs/superpowers/specs, docs/deploy.md, src/app/features.ts,
#       src/app/site.ts, data/sources/*/README.md, 커밋 이력 2026-11-13 ~ 2026-11-16). 포트폴리오 볼트에는 노트가 없다.
title: "CPBS"
summary: "컴투스프로야구 V26 유저를 위한 비공식 팬 도구 — 타격 트레이닝, 강화·스킬 변경 시뮬레이터, 스킬 점수 계산기"
period:
  start: "2026-11"
  end: "2026-11"
  note: "2026-11-13 ~ 2026-11-16 (저장소 커밋 기준, KST)"
team:
  size: 1
  type: "개인"
role: "기획·설계 결정·검증·배포 (구현은 설계 문서와 구현 계획을 바탕으로 Claude Code와 함께 진행)"
stack:
  - React 19
  - TypeScript
  - Vite
  - React Router
  - Three.js
  - Tailwind CSS
  - zod
  - Vitest
  - Testing Library
  - GitHub Actions
  - Cloudflare Pages
highlights:
  - "컴투스 공식 확률 공개표로 강화·스킬 변경을 미리 돌려 보고, 목표까지 10·50·100회 안에 도달할 확률을 보여 주는 시뮬레이터"
  - "Three.js 타격 트레이닝: 투수 유형 5종, 구종별 궤적, 이닝·한 타석·홈런 레이스 3가지 모드, 게임과 같은 카메라 시점"
  - "게임 영상에서 잰 투구 125개로 구속과 비행 시간의 관계를 다시 맞춘 투구 타이밍 보정"
  - "화면과 분리한 결정적 코어 로직(seed 난수), zod 데이터 스키마 검증, 테스트 파일 22개"
  - "PR마다 린트·타입·포맷·테스트·빌드를 도는 CI와 Cloudflare Pages 배포, 4일 동안 v0.1.0~v0.5.1 릴리스 11회"
links:
  - type: deploy
    label: "서비스 바로가기"
    url: "https://cpbs.pages.dev"
  - type: repo
    label: "GitHub 저장소 (비공개)"
    url: null
images:
  - src: "content/projects/cpbs/cpbs-batting.webp"
    alt: "타격 트레이닝 화면 — 3D 타석 시점, 스코어보드와 스트라이크 존 (모바일)"
    caption: "타격 트레이닝 (모바일)"
    use: "대표 이미지"
    width: 739
    height: 1600
    source: "프로젝트/cpbs/cpbs-batting.png"
  - src: "content/projects/cpbs/cpbs-home.webp"
    alt: "CPBS 첫 화면 — 투구 배치 그림과 기능 목록 (모바일)"
    caption: "첫 화면 (모바일)"
    use: "화면 캡처"
    width: 739
    height: 1600
    source: "프로젝트/cpbs/cpbs-home.png"
  - src: "content/projects/cpbs/cpbs-skill-change.webp"
    alt: "스킬 변경 시뮬레이터 입력 화면 — 카드, 포지션, 변경권, 목표 선택 (모바일)"
    caption: "스킬 변경 시뮬레이터 (모바일)"
    use: "화면 캡처"
    width: 739
    height: 1600
    source: "프로젝트/cpbs/cpbs-skill-change.png"
order: 7
featured: false
island:
  x: 106
  z: -28
  size: 4.5
unverified:
  - "투구 측정(영상 125구)을 누가 했는지 — 커밋 메시지에는 측정 결과만 있음"
---

CPBS(Com2uS Pro Baseball Simulator)는 모바일 야구 게임 컴투스프로야구 V26 유저가 게임을 더 잘하기 위해 쓰는 비공식 팬 도구 사이트입니다. 게임에는 투수를 골라 반복해서 연습할 방법이 없어서, 그 빈자리를 웹에서 채우는 것을 목표로 했습니다. 기준은 실제 야구가 아니라 게임 속 동작이며, 성공 기준은 "이 사이트에서 연습한 타격 감각이 실제 게임에서도 통하는가"로 잡았습니다.

지금 공개된 기능은 네 가지입니다. 타격 트레이닝은 투수를 골라 게임과 같은 궤적과 타이밍으로 오는 공을 칩니다. 강화 시뮬레이터와 스킬 변경 시뮬레이터는 컴투스가 공개한 확률표로 결과를 미리 돌려 보고, 목표까지 10·50·100회 안에 도달할 확률을 보여 줍니다. 스킬 점수 계산기는 스킬 세 개의 점수 합계를 카드별 사용 기준과 비교합니다. 팀 빌딩은 계획 단계입니다.

서버와 DB 없이 정적 사이트로 만들었습니다. 각 기능은 화면과 분리된 TypeScript 코어 로직과 React 화면 두 층으로 나누고, 확률 로직은 seed를 받는 난수 생성기를 주입받아 같은 입력이면 같은 결과가 나오게 했습니다. 게임 데이터는 저장소 안의 JSON으로 두고 zod 스키마로 검증해, 잘못된 수치가 빌드 단계에서 걸리게 했습니다. Three.js는 타격 트레이닝에 들어갈 때만 불러옵니다.

타격 트레이닝은 우완·좌완 오버핸드, 사이드암, 언더핸드 다섯 가지 투수 유형과 구종별 궤적, 늦게 꺾이는 공을 지원하고, 이닝·한 타석 연습·홈런 레이스 세 가지 모드가 있습니다. 게임 영상에서 잰 투구 125개로 구속과 비행 시간의 관계를 다시 맞춰, 공이 게임과 같은 속도감으로 오도록 보정했습니다. 수치는 튜닝 패널에서 조정하며 확인한 뒤 데이터 파일에 반영하는 구조입니다.

비공식 팬사이트라는 점을 모든 페이지에 밝히고, 게임의 그림·UI·사운드는 쓰지 않고 직접 만들며, 수익화하지 않는다는 원칙을 설계 단계에서 정했습니다. 수치는 공개된 영상과 플레이에서 관찰할 수 있는 정보, 체감 조정으로 재현했습니다.

GitHub Actions로 PR마다 린트, 타입 검사, 포맷, 테스트, 빌드를 돌리고, Cloudflare Pages에 배포합니다. Git Flow로 4일 동안 v0.1.0부터 v0.5.1까지 11번 릴리스했습니다.
