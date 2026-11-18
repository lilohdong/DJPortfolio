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
  - "Kakao Local API, ODsay, Naver Map으로 대중교통 이동 시간 기준 중간 지점을 계산했습니다"
  - "도메인마다 Clean Architecture 레이어를 나누고 UseCase와 Repository에 단위 테스트를 붙였습니다"
  - "2026 KMAIA 하계학술대회에 논문을 투고했습니다"
links:
  - type: repo
    label: "GitHub 저장소"
    url: "https://github.com/lilohdong/Calddy"
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
  - src: "content/projects/calddy/calddy-logo.webp"
    alt: "Calddy 로고"
    use: "로고 (섬 표지, 패널 머리)"
    width: 492
    height: 404
    source: "프로젝트/Calddy/Calddy_logo.png"
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

Calddy는 캘린더에 일기와 친구 피드를 붙인 앱입니다. 기록이 여러 앱에 흩어지고, 약속을 잡을 때마다 일정을 맞추느라 번거로운 점을 줄이려고 만들었습니다. 2026년 1학기 캡스톤디자인 프로젝트이고, 2026 KMAIA 하계학술대회에 논문을 투고했습니다.

일정이 끝난 날짜에는 사진, 동영상, 글로 일기를 남깁니다. 친구 캘린더를 겹쳐 보면 모두 비어 있는 시간이 보입니다. 약속 장소는 대중교통과 도로 기준 이동 시간으로 중간 지점을 계산하고, Gemini API가 만남 목적에 맞는 장소를 추천합니다.

저는 백엔드 57개 기능 중 30개를 맡아 모두 끝냈습니다.

맡은 도메인은 인증, 캘린더, 약속 조율, 지도, 알림입니다. 인증은 이메일, OTP, Google OAuth를 지원하고, 캘린더에는 일정과 반복 습관, 구간 일정, 드로잉, 공휴일이 들어갑니다. 약속 조율에서는 초대를 수락하거나 거절하고 다른 날짜를 제안합니다.

서버는 따로 두지 않았습니다. Supabase의 RLS, 트리거, Edge Function으로 권한과 규칙을 DB에서 처리했습니다. 약속 조율은 캘린더, 친구, 지도, 알림 네 도메인에 걸쳐 있어서 독립 도메인으로 떼어 내고, DB 트리거로 알림 도메인과 주고받게 했습니다. 알림은 트리거가 만들고 Edge Function이 FCM으로 푸시를 보냅니다.

앱 코드는 도메인마다 Entity, Repository, UseCase, DataSource, Riverpod Provider 순으로 레이어를 나눴고, UseCase와 Repository 구현, 모델 직렬화에 단위 테스트를 작성했습니다. 지도는 처음에 Google Maps로 계획했다가 Kakao Local API, ODsay, Naver Map 조합으로 바꿔 다시 설계했습니다.
