---
title: "Calddy"
summary: "캘린더와 SNS를 결합한 관계 중심 다이어리 앱 (캡스톤디자인)"
period:
  start: "2026-03"
  end: "2026-06"
team:
  size: 4
  type: "팀"
  note: "4인 팀, 캡스톤디자인"
role: "백엔드 담당 — 백엔드 57개 기능 중 30개 설계·구현 (인증, 캘린더, 약속 조율, 지도, 알림)"
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
  - "Supabase RLS로 권한과 비즈니스 규칙을 DB 레벨에서 적용"
  - "DB 트리거 → Edge Function → FCM으로 이어지는 이벤트 기반 알림 파이프라인 구축"
  - "대중교통 이동 시간 기준 중간 지점 계산 기능 구현 (Kakao Local API + ODsay + Naver Map)"
  - "Clean Architecture 레이어 분리와 백엔드 단위 테스트 작성"
  - "2026 KMAIA 하계학술대회 논문 투고"
links:
  - type: repo
    label: "GitHub 저장소"
    url: "https://github.com/lilohdong/Calddy"
images:
  - src: "프로젝트/Calddy/Calddy_logo.png"
    alt: "Calddy 로고"
    use: "로고 (섬 표지, 패널 머리)"
  - src: "프로젝트/Calddy/Calddy_포스터_KMAIA.pdf"
    alt: "KMAIA 학술대회 포스터"
    use: "학술대회 포스터 (PDF, 이미지로 변환 필요)"
  - src: "확인 필요"
    alt: "확인 필요"
    use: "대표 이미지 — 앱 화면 캡처가 원본 폴더에 없음"
order: 1
featured: true
island:
  x: 50
  z: -28
  size: 6
unverified:
  - "앱 화면 캡처(대표 이미지)가 원본 폴더에 없음"
---

Calddy는 일정 관리와 일상 기록, 친구와의 공유를 한 앱에 담은 캘린더 기반 다이어리 SNS입니다. 일상 기록이 여러 플랫폼에 흩어지는 문제, 보여 주기 위주가 된 SNS, 약속마다 반복되는 일정 조율의 피로를 줄이는 것을 목표로 했습니다. 2026년 1학기 캡스톤디자인 프로젝트로 진행했고, 2026 KMAIA 하계학술대회에 논문을 투고했습니다.

일정이 끝난 날짜는 사진·동영상·글로 남기는 다이어리로 이어지고, 친구의 캘린더를 겹쳐 보며 모두 가능한 시간대를 찾을 수 있습니다. 약속 장소는 직선거리가 아니라 대중교통과 도로 기준 이동 시간으로 중간 지점을 계산하고, Gemini API로 만남의 목적에 맞는 장소를 추천합니다.

저는 백엔드 57개 기능 중 30개를 맡아 모두 완료했습니다. 담당 도메인은 인증(이메일·OTP·Google OAuth), 캘린더(일정·반복 습관·구간 일정·드로잉·공휴일), 약속 조율(초대·수락·거절·다른 날짜 제안), 지도(중간 지점 계산), 알림입니다.

별도 서버 없이 Supabase의 RLS, 트리거, Edge Function으로 권한과 비즈니스 규칙을 DB 레벨에서 처리했습니다. 약속 조율은 캘린더·친구·지도·알림 네 도메인에 걸치는 기능이어서 독립 도메인으로 분리하고, DB 트리거로 알림 도메인과 통신하게 했습니다. 알림은 트리거가 알림을 만들고 Edge Function이 FCM으로 푸시를 보내는 구조입니다.

앱 코드는 Entity, Repository, UseCase, DataSource, Riverpod Provider로 이어지는 Clean Architecture로 도메인마다 레이어를 나누고, UseCase와 Repository 구현, 모델 직렬화에 단위 테스트를 작성했습니다. 지도 기능은 처음 계획한 Google Maps에서 Kakao Local API, ODsay, Naver Map 조합으로 바꾸어 다시 설계했습니다.
