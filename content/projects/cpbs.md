---
# 근거: 비공개 저장소 lilohdong/cpbs (docs/superpowers/specs, docs/deploy.md, src/app/features.ts,
#       src/app/site.ts, data/sources/*/README.md, 커밋 이력 2026-11-13 ~ 2026-11-16). 포트폴리오 볼트에는 노트가 없다.
title: "CPBS"
summary: "컴투스프로야구 V26 유저를 위한 비공식 팬 도구 사이트 (타격 트레이닝, 강화 시뮬레이터, 스킬 변경 시뮬레이터, 스킬 점수 계산기)"
period:
  start: "2026-11"
  end: "2026-11"
  note: "2026-11-13 ~ 2026-11-16 (저장소 커밋 기준, KST)"
team:
  size: 1
  type: "개인"
role: "기획, 설계 결정, 검증, 배포 (설계 문서와 구현 계획을 먼저 쓰고 구현은 Claude Code와 함께)"
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
  - "컴투스가 공개한 확률표로 강화와 스킬 변경 결과를 미리 돌려 봅니다"
  - "게임 영상에서 투구 125개를 재서 공의 속도감을 게임에 맞췄습니다"
  - "PR마다 GitHub Actions가 린트, 타입 검사, 테스트, 빌드를 돌립니다"
links:
  - type: deploy
    label: "서비스 바로가기"
    url: "https://cpbs.pages.dev"
  - type: repo
    label: "GitHub 저장소 (비공개)"
    url: null
logo:
  # 원본 180x180 PNG, 같은 폴더에 SVG도 있다
  src: "content/projects/cpbs/cpbs-logo.webp"
  alt: "CPBS 로고"
  source: "프로젝트/cpbs/cpbs-logo.png"
  width: 180
  height: 180
images:
  - src: "content/projects/cpbs/cpbs-batting.webp"
    alt: "타격 트레이닝 화면: 3D 타석 시점, 스코어보드와 스트라이크 존 (모바일)"
    caption: "타격 트레이닝 (모바일)"
    use: "대표 이미지"
    width: 739
    height: 1600
    source: "프로젝트/cpbs/cpbs-batting.png"
  - src: "content/projects/cpbs/cpbs-home.webp"
    alt: "CPBS 첫 화면: 투구 배치 그림과 기능 목록 (모바일)"
    caption: "첫 화면 (모바일)"
    use: "화면 캡처"
    width: 739
    height: 1600
    source: "프로젝트/cpbs/cpbs-home.png"
  - src: "content/projects/cpbs/cpbs-skill-change.webp"
    alt: "스킬 변경 시뮬레이터 입력 화면: 카드, 포지션, 변경권, 목표 선택 (모바일)"
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

![](cpbs-batting)

게임에는 투수를 골라 반복해서 타격을 연습할 방법이 없어서 만들었습니다.

서버 없이 정적 사이트로 만들어 Cloudflare Pages에 배포했고, 4일 동안 v0.1.0부터 v0.5.1까지 11번 릴리스했습니다.

<!-- more -->

![](cpbs-skill-change)

시뮬레이터는 목표까지 10회, 50회, 100회 안에 도달할 확률을 보여 줍니다. 확률 로직은 seed 난수를 주입받아 같은 입력이면 같은 결과가 나오고, 게임 데이터는 zod 스키마로 검증합니다. 타격 트레이닝에는 투수 유형 다섯 가지와 모드 세 가지가 있습니다.
