---
title: "여론지"
summary: "여러 언론사 기사를 이슈 단위로 요약하고 네이버 댓글 여론을 AI로 분석하는 정치 이슈 웹 서비스"
period:
  start: "2026-10"
  end: "2026-11"
  note: "2026-10-30 ~ 2026-11-15 (저장소 커밋 기준, KST)"
team:
  size: 1
  type: "개인"
role: "기획·설계·검증·배포 (구현은 Claude Code와 페어 프로그래밍)"
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
  - "언론사별 댓글 수에 비례해 표본을 나눠 뽑는 층화 무작위 추출"
  - "이슈 감지 6시간 뒤와 24시간 뒤 두 번 분석해 여론 변화 비교"
  - "LLM 하루 한도 90%에서 멈추는 사용량 가드, 실패한 배치를 반으로 나눠 재요청, 댓글을 JSON 데이터로만 넘기는 프롬프트 인젝션 방지"
  - "모든 테이블 RLS, 공개용 뷰만 읽는 전용 DB 역할, 테스트 약 190개"
  - "수집·분석은 PC에서, 결과만 무료 DB와 호스팅에 올려 운영비 0원으로 배포"
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
    use: "대표 이미지"
    width: 1280
    height: 900
    source: "프로젝트/여론지/yeoronji-list-desktop.png"
  - src: "content/projects/yeoronji/yeoronji-issue-desktop.webp"
    alt: "이슈 상세 화면: 찬반 비율과 언론사별 표 (데스크톱)"
    use: "화면 캡처"
    width: 688
    height: 1600
    source: "프로젝트/여론지/yeoronji-issue-desktop.png"
  - src: "content/projects/yeoronji/yeoronji-issue-mobile.webp"
    alt: "이슈 상세 화면 (모바일)"
    use: "화면 캡처"
    width: 128
    height: 1600
    source: "프로젝트/여론지/yeoronji-issue-mobile.png"
  - src: "content/projects/yeoronji/yeoronji-list-mobile.webp"
    alt: "이슈 목록 화면 (모바일)"
    use: "화면 캡처"
    width: 739
    height: 1600
    source: "프로젝트/여론지/yeoronji-list-mobile.png"
  - src: "content/projects/yeoronji/yeoronji-nostance-desktop.webp"
    alt: "찬반 쟁점이 없는 이슈 화면 (감정 비율만 표시)"
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
unverified: []
---

여론지는 같은 사건을 여러 언론사가 보도하면 하나의 이슈로 묶어 한 장으로 요약하고, 그 기사들의 네이버 댓글에서 표본을 뽑아 AI로 찬반과 감정 비율을 세는 정치 이슈 사이트입니다. 이슈를 감지하고 6시간 뒤와 24시간 뒤 두 번 분석해 여론이 어떻게 변했는지 비교합니다.

언론사마다 독자층이 달라 댓글을 한데 섞으면 여론이 왜곡된다고 보고, 언론사별 댓글 수에 비례해 표본 수를 나눈 뒤 그 안에서 무작위로 뽑는 층화 추출을 설계했습니다. 전체 비율은 언론사별 비율에 댓글 수 가중치를 주어 합칩니다. 표본이 30개 미만인 언론사는 화면에 "부족"이라고 표시합니다.

수집과 분석은 제 PC에서 30분마다 Python 파이프라인으로 돌리고, 결과만 Supabase에 올리면 Vercel의 Next.js 사이트가 보여 주는 구조여서 운영비가 들지 않습니다. 저는 서비스 범위와 표본 방식, 구조와 기술 선택, 검증과 배포를 맡았고, 구현은 Claude Code와 함께 했고, 설계 문서, 구현 계획, 테스트 먼저 작성, 코드 리뷰 순서로 작업했습니다.

첫 실제 수집 결과를 확인하다가 댓글 API가 페이지 번호를 무시하고 항상 최신 댓글 100개만 돌려준다는 것을 발견했습니다. 테스트는 모두 통과했지만 "무작위 표본"이 사실은 최신 댓글 100개였습니다. 응답의 다음 페이지 커서를 따라 기사마다 최대 3,000개를 읽고 그 안에서 뽑도록 고쳤고, 3,000개를 넘는 기사는 최근 댓글로 치우칠 수 있다는 한계를 사이트의 분석 방법 안내에 적었습니다.

LLM은 하루 한도의 90%에서 스스로 멈추는 사용량 가드를 두고, 응답이 비거나 JSON이 깨지면 배치를 반으로 나눠 다시 요청합니다. 댓글 원문은 JSON 데이터로 넘겨 댓글 속 문장이 분류 지시로 읽히지 않게 했습니다. 댓글 작성자 정보는 저장하지 않고, 모든 테이블에 RLS를 적용했으며, 사이트는 전용 역할로 공개용 뷰만 읽습니다.

네이버 약관상 자동 수집이 제한되어 있어 저장소는 비공개로 두고 사이트만 공개합니다. 비상업으로 운영하고, 요청 속도를 제한하며, 원문 링크를 제공합니다.
