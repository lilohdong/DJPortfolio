---
title: "Calddy"
summary: "캘린더에 일기와 친구 피드를 붙인 앱 (캡스톤디자인)"
period:
  start: "2026-03"
  end: "2026-06"
team:
  size: 4
  type: "팀"
  note: "4인 팀, 캡스톤디자인"
role: "백엔드 57개 기능 중 30개를 설계하고 구현 (인증, 캘린더, 약속 조율, 지도, 알림)"
stack:
  - Flutter
  - Riverpod
  - Supabase
  - PostgreSQL
  - Supabase Edge Functions (Deno)
  - FCM
  - Naver Map
  - ODsay
  - Kakao Local API
  - Gemini API
highlights:
  - "별도 서버 없이 Supabase RLS로 권한과 규칙을 DB에서 처리했습니다"
  - "DB 트리거가 알림을 만들면 Edge Function이 FCM으로 푸시를 보내게 했습니다"
  - "UseCase와 Repository 구현에 단위 테스트를 붙였습니다"
links:
  - type: repo
    label: "GitHub 저장소"
    url: "https://github.com/lilohdong/Calddy"
logo:
  src: "content/projects/calddy/calddy-logo.webp"
  alt: "Calddy 로고"
  width: 256
  height: 210
  source: "프로젝트/Calddy/Calddy_logo.png"
images:
  # 앱 화면 4장은 Calddy_포스터_KMAIA.pptx 안의 이미지(ppt/media/image3~6)를 볼트에 저장한 것. 각 이미지는 휴대폰 화면 4개를 가로로 이은 것
  - src: "content/projects/calddy/calddy-calendar.webp"
    alt: "Calddy 캘린더 화면: 월 보기, 날짜별 일정 목록, 새 일정 종류 선택, 구간 일정 추가"
    caption: "캘린더와 일정 등록"
    use: "대표 이미지"
    width: 1279
    height: 647
    source: "프로젝트/Calddy/calddy-calendar.png"
  - src: "content/projects/calddy/calddy-calendar-overlay.webp"
    alt: "친구 캘린더 겹쳐 보기 화면: 빈 시간이 겹치는 친구 목록, 함께 비어 있는 날 표시, 약속 만들기"
    caption: "친구 캘린더 겹쳐 보기와 약속 만들기"
    use: "화면 캡처"
    width: 1341
    height: 679
    source: "프로젝트/Calddy/calddy-calendar-overlay.png"
  - src: "content/projects/calddy/calddy-midpoint.webp"
    alt: "중간 지점 찾기 화면: 친구 태그, 출발 장소 입력, 대중교통 기준 추천 중간 지점"
    caption: "대중교통 기준 중간 지점 추천"
    use: "화면 캡처"
    width: 1468
    height: 742
    source: "프로젝트/Calddy/calddy-midpoint.png"
  - src: "content/projects/calddy/calddy-diary.webp"
    alt: "기록하기 화면: 일정 완료 후 사진과 글로 하루를 기록하고 피드에 공유"
    caption: "일정 완료 후 기록하기"
    use: "화면 캡처"
    width: 1342
    height: 679
    source: "프로젝트/Calddy/calddy-diary.png"
  - src: "프로젝트/Calddy/Calddy_포스터_KMAIA.pdf"
    alt: "KMAIA 학술대회 포스터"
    use: "학술대회 포스터 (PDF, 이미지로 변환 필요)"
order: 1
featured: true
island:
  x: 50
  z: -28
  size: 6
unverified: []
---

![](calddy-calendar)

일정 관리와 일상 기록, 친구와 약속 잡기를 한 앱에서 하려고 만든 캘린더 앱입니다. 2026년 1학기 캡스톤디자인 4인 팀 프로젝트입니다.

저는 백엔드 57개 기능 중 30개를 맡아 모두 끝냈습니다. 인증, 캘린더, 약속 조율, 지도, 알림 도메인이 제 담당이었습니다.

이 프로젝트로 2026 KMAIA 하계학술대회에 논문을 투고했습니다.

<!-- more -->

![](calddy-midpoint)

약속 장소는 대중교통 이동 시간 기준으로 중간 지점을 계산합니다. 처음 계획한 Google Maps 대신 Kakao Local API, ODsay, Naver Map을 조합해 다시 설계했습니다.

![](calddy-calendar-overlay)

친구 캘린더를 겹쳐 모두 비어 있는 시간을 찾고, 일정이 끝나면 사진과 글로 일기를 남깁니다.

![](calddy-diary)
