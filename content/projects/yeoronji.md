---
title: "여론지"
summary: "여러 언론사 기사를 이슈로 묶어 요약하고 네이버 댓글 여론을 AI로 세는 정치 이슈 사이트"
period:
  start: "2026-10"
  end: "2026-11"
  note: "2026-10-30 ~ 2026-11-15 (저장소 커밋 기준, KST)"
team:
  size: 1
  type: "개인"
role: "기획, 설계, 검증, 배포 (구현은 Claude Code와 페어 프로그래밍)"
stack:
  - Python
  - Next.js 15
  - React 19
  - TypeScript
  - Supabase (PostgreSQL)
  - Vercel
  - Gemini API
  - pytest
  - Vitest
  - Playwright
highlights:
  - "언론사별 댓글 수에 비례해 표본을 나눈 뒤 그 안에서 무작위로 뽑았습니다"
  - "LLM이 하루 한도의 90%에서 멈추게 하고, 댓글은 JSON 데이터로만 넘겨 프롬프트 인젝션을 막았습니다"
  - "모든 테이블에 RLS를 걸고 테스트를 약 190개 작성했습니다"
links:
  - type: deploy
    label: "서비스 바로가기"
    url: "https://pnva.vercel.app"
  - type: repo
    label: "GitHub 저장소 (비공개)"
    url: null
images:
  - src: "content/projects/yeoronji/yeoronji-list-desktop.webp"
    alt: "여론지 이슈 목록 화면 (데스크톱)"
    caption: "최신 정치 이슈 목록"
    use: "대표 이미지"
    width: 1280
    height: 900
    source: "프로젝트/여론지/yeoronji-list-desktop.png"
  - src: "content/projects/yeoronji/yeoronji-issue-desktop.webp"
    alt: "이슈 상세 화면: 찬반 비율과 언론사별 표 (데스크톱)"
    caption: "이슈 상세 화면의 찬반 비율과 언론사별 여론 표"
    use: "화면 캡처"
    width: 688
    height: 1600
    source: "프로젝트/여론지/yeoronji-issue-desktop.png"
  - src: "content/projects/yeoronji/yeoronji-issue-mobile.webp"
    alt: "이슈 상세 화면 (모바일)"
    caption: "이슈 상세 화면 (모바일)"
    use: "화면 캡처"
    width: 128
    height: 1600
    source: "프로젝트/여론지/yeoronji-issue-mobile.png"
  - src: "content/projects/yeoronji/yeoronji-list-mobile.webp"
    alt: "이슈 목록 화면 (모바일)"
    caption: "이슈 목록 (모바일)"
    use: "화면 캡처"
    width: 739
    height: 1600
    source: "프로젝트/여론지/yeoronji-list-mobile.png"
  - src: "content/projects/yeoronji/yeoronji-nostance-desktop.webp"
    alt: "찬반 쟁점이 없는 이슈 화면 (감정 비율만 표시)"
    caption: "찬반 쟁점이 없어 감정 비율만 보여 주는 이슈"
    use: "화면 캡처"
    width: 1230
    height: 1600
    source: "프로젝트/여론지/yeoronji-nostance-desktop.png"
order: 3
featured: true
island:
  x: 50
  z: 28
  size: 6
unverified:
  - "yeoronji-issue-mobile은 원본이 780x9748 세로 전체 캡처라 변환 후 128x1600이 됐다. 본문에 쓰지 않음. 위쪽만 자른 캡처로 바꾸면 쓸 수 있다"
---

![](yeoronji-list-desktop)

같은 사건을 여러 언론사가 보도하면 한 이슈로 묶어 요약하고, 그 기사들의 네이버 댓글에서 표본을 뽑아 찬반과 감정 비율을 셉니다. 이슈를 감지하고 6시간 뒤와 24시간 뒤에 두 번 분석합니다.

혼자 기획하고 설계했고, 구현은 Claude Code와 함께 했습니다. 수집과 분석은 제 PC에서 돌리고 결과만 Supabase와 Vercel에 올려 운영비 없이 배포했습니다.

![](yeoronji-issue-desktop)

첫 실제 수집에서 댓글 API가 항상 최신 댓글 100개만 돌려준다는 것을 찾았습니다. 테스트는 모두 통과한 상태였습니다. 다음 페이지 커서를 따라 기사마다 최대 3,000개를 읽도록 고쳤습니다.

<!-- more -->

![](yeoronji-nostance-desktop)

찬반으로 나눌 쟁점이 없는 이슈는 감정 비율만 보여 줍니다. 네이버 약관상 자동 수집이 제한돼 있어 저장소는 비공개로 두고, 비상업으로 운영하며 요청 속도를 제한합니다.
