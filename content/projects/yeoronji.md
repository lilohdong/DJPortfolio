---
# 화면에 나오는 곳: title, summary, role, highlights, 사진 caption, 그리고 맨 아래 본문.
# 본문에서 <!-- more --> 아래는 접혀 있다가 "이어서 읽기"를 누르면 펼쳐진다.
# ![](키)는 사진 자리다. 키는 images에 적힌 파일 이름에서 확장자를 뺀 것이다.
title: "여론지"
summary: "여러 언론사 기사를 이슈로 묶어 요약하고 네이버 댓글 여론을 AI로 세는 정치 이슈 사이트"
period:
  start: "2026-10"
  end: "2026-11"
  # 일 단위 기간(화면에는 안 나옴): 2026-10-30 ~ 2026-11-15 (저장소 커밋 기준, KST)
team:
  size: 1
  type: "개인"
role: "기획, 설계, 검증, 배포. 구현은 Claude Code와 함께"
stack:
  - Python
  - Next.js 15
  - React 19
  - TypeScript
  - Supabase
  - PostgreSQL
  - Vercel
  - Gemini API
  - pytest
  - Vitest
  - Playwright
highlights:
  - "언론사마다 댓글 수에 맞춰 뽑을 개수를 나누고, 그 안에서 무작위로 골랐습니다"
  - "AI 사용량이 하루 한도의 90%에 닿으면 멈추게 했고, 댓글 속 문장이 AI에게 명령으로 읽히지 않게 막았습니다"
  - "사이트는 공개용 데이터만 읽을 수 있게 DB 권한을 나눴습니다"
links:
  - type: deploy
    label: "서비스 바로가기"
    url: "https://pnva.vercel.app"
  - type: repo
    label: "비공개 저장소"
    url: null
images:
  - src: "content/projects/yeoronji/yeoronji-list-desktop.webp"
    alt: "데스크톱 여론지 이슈 목록 화면"
    caption: "최신 정치 이슈 목록"
    use: "대표 이미지"
    width: 1280
    height: 900
    source: "프로젝트/여론지/yeoronji-list-desktop.png"
  - src: "content/projects/yeoronji/yeoronji-issue-desktop.webp"
    alt: "데스크톱 이슈 상세 화면: 찬반 비율과 언론사별 표"
    caption: "이슈 상세 화면의 찬반 비율과 언론사별 여론 표"
    use: "화면 캡처"
    width: 688
    height: 1600
    source: "프로젝트/여론지/yeoronji-issue-desktop.png"
  - src: "content/projects/yeoronji/yeoronji-issue-mobile.webp"
    alt: "모바일 이슈 상세 화면"
    caption: "모바일 이슈 상세 화면"
    use: "화면 캡처"
    width: 128
    height: 1600
    source: "프로젝트/여론지/yeoronji-issue-mobile.png"
  - src: "content/projects/yeoronji/yeoronji-list-mobile.webp"
    alt: "모바일 이슈 목록 화면"
    caption: "모바일 이슈 목록"
    use: "화면 캡처"
    width: 739
    height: 1600
    source: "프로젝트/여론지/yeoronji-list-mobile.png"
  - src: "content/projects/yeoronji/yeoronji-nostance-desktop.webp"
    alt: "찬반 쟁점이 없어 감정 비율만 표시한 이슈 화면"
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

이슈가 생기면 6시간 뒤와 24시간 뒤에 두 번 분석해 여론이 어떻게 바뀌는지 비교합니다. 수집과 분석은 제 PC에서 돌리고 결과만 Supabase와 Vercel에 올려서 운영비가 들지 않습니다.

![](yeoronji-issue-desktop)

첫 실제 수집에서 댓글 API가 항상 최신 댓글 100개만 돌려준다는 것을 찾았습니다. 테스트는 모두 통과한 상태였습니다. 다음 페이지를 이어서 읽어 기사마다 최대 3,000개까지 보도록 고쳤습니다.

<!-- more -->

![](yeoronji-nostance-desktop)

찬반으로 나눌 쟁점이 없는 이슈는 감정 비율만 보여 줍니다. 네이버 약관상 자동 수집이 제한돼 있어 저장소는 비공개로 두고, 돈을 받지 않고 운영하며 요청을 천천히 보냅니다.
