---
# 화면에 나오는 곳: title, summary, role, highlights, 사진 caption, 그리고 맨 아래 본문.
# 본문에서 <!-- more --> 아래는 접혀 있다가 "이어서 읽기"를 누르면 펼쳐진다.
# ![](키)는 사진 자리다. 키는 images에 적힌 파일 이름에서 확장자를 뺀 것이다.
# 근거: 비공개 저장소 lilohdong/cpbs (docs/superpowers/specs, docs/deploy.md, src/app/features.ts,
#       src/app/site.ts, data/sources/*/README.md, 커밋 이력 2026-11-13 ~ 2026-11-16). 포트폴리오 볼트에는 노트가 없다.
title: "CPBS"
summary: "컴투스프로야구 V26 유저가 타격을 연습하고 강화 확률을 미리 돌려 보는 비공식 팬 사이트"
period:
  start: "2026-11"
  end: "2026-11"
  # 일 단위 기간(화면에는 안 나옴): 2026-11-13 ~ 2026-11-16 (저장소 커밋 기준, KST)
team:
  size: 1
  type: "개인"
role: "기획, 설계, 검증, 배포. 설계 문서와 구현 계획을 먼저 쓰고 구현은 Claude Code와 함께"
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
  - "코드를 올릴 때마다 GitHub Actions가 검사와 테스트, 빌드를 자동으로 돌립니다"
links:
  - type: deploy
    label: "서비스 바로가기"
    url: "https://cpbs.pages.dev"
  - type: repo
    label: "비공개 저장소"
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
    caption: "모바일 타격 트레이닝 화면"
    use: "대표 이미지"
    width: 739
    height: 1600
    source: "프로젝트/cpbs/cpbs-batting.png"
  - src: "content/projects/cpbs/cpbs-home.webp"
    alt: "CPBS 첫 화면: 투구 배치 그림과 기능 목록 (모바일)"
    caption: "모바일 첫 화면"
    use: "화면 캡처"
    width: 739
    height: 1600
    source: "프로젝트/cpbs/cpbs-home.png"
  - src: "content/projects/cpbs/cpbs-skill-change.webp"
    alt: "스킬 변경 시뮬레이터 입력 화면: 카드, 포지션, 변경권, 목표 선택 (모바일)"
    caption: "모바일 스킬 변경 시뮬레이터"
    use: "화면 캡처"
    width: 739
    height: 1600
    source: "프로젝트/cpbs/cpbs-skill-change.png"
order: 7
featured: false
island:
  x: 88
  z: -6
  size: 4.5
  landmark: "batter"
unverified:
  - "투구 측정(영상 125구)을 누가 했는지 — 커밋 메시지에는 측정 결과만 있음"
---

![](cpbs-batting)

게임에는 투수를 골라 반복해서 타격을 연습할 방법이 없어서 만들었습니다.

서버 없이 만들어 Cloudflare Pages에 올렸고, 4일 동안 새 버전을 11번 냈습니다.

<!-- more -->

![](cpbs-skill-change)

시뮬레이터는 목표까지 10회, 50회, 100회 안에 도달할 확률을 보여 줍니다. 게임 수치는 빌드할 때 형식을 검사해서 잘못된 값이 걸러집니다. 타격 트레이닝에는 투수 유형 다섯 가지와 모드 세 가지가 있습니다.
