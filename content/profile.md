---
# 소개·기술·경력/학력·연락 섬에 쓰는 내용
# 원본: 포트폴리오 볼트의 "프로젝트 목록.md", "사람인 포트폴리오.md", "사람인 자기소개서.md", 각 프로젝트 노트,
#       2026-11-18 사용자 답변(이메일, 사진, 학력, 자격증, 거주 지역, 영문 이름, 현재 상태)
# 노트와 답변에 없는 값은 "확인 필요"로 둔다.

name: "오동준"
name_en: "Dongjun Oh"
headline: "직접 배포하고 써 보며 고치는 개발자"
photo:
  # src는 static/ 기준 경로(npm run images:import가 변환해 채움). source는 원본 위치로 볼트 루트 기준 상대 경로이며,
  # 원본이 볼트 바깥("바탕 화면\포폴" 폴더 바로 아래)이라 ../로 시작한다
  src: "content/profile/photo.webp"
  alt: "오동준 정장 차림 프로필 사진"
  width: 480
  height: 640
  source: "../동준_정장.png"
status: "구직 중"
location: "경기도 고양시"

# intro 근거: 개인 프로젝트 3개(여론지, 메이플 할일 알리미, CPBS)는 기획·배포를 혼자 함.
#   팀 프로젝트 4개 중 NudgeUp(96/104), Mongscape(156/169), POS PLACE(팀 내 최다)에서 커밋 최다. Calddy는 커밋 비율 미확인.
intro: |
  여론지, 메이플 할일 알리미, CPBS는 혼자 기획하고 Claude Code와 함께 만들었습니다.
  팀 프로젝트 네 개 중 세 개에서는 커밋을 가장 많이 했습니다.

intro_points:
  - "NudgeUp과 Calddy에서는 다른 팀이나 다른 사람의 데이터에 접근하지 못하게 권한 검사를 넣었습니다."
  - "여론지와 메이플 할일 알리미는 테스트가 통과한 뒤 실제 데이터를 보다가 버그를 찾아 고쳤습니다."
  - "Mongscape는 v1.0.0으로 출시했고, CPBS는 4일 동안 11번 릴리스했습니다."

skills:
  # 숙련도 표시는 하지 않고, 각 기술을 쓴 프로젝트(slug)로 연결한다.
  - group: "백엔드"
    items:
      - { name: "Spring Boot", projects: [nudgeup] }
      - { name: "Supabase (RLS, 트리거, Edge Functions)", projects: [calddy, yeoronji] }
      - { name: "PostgreSQL", projects: [calddy, nudgeup, yeoronji, mongscape] }
      - { name: "MySQL", projects: [pos-place] }
      - { name: "Python", projects: [yeoronji, mongscape] }
      - { name: "JWT 인증", projects: [nudgeup] }
      - { name: "FCM 푸시 알림", projects: [calddy, nudgeup] }
  - group: "프론트엔드와 앱"
    items:
      - { name: "React / Next.js", projects: [yeoronji, maple-alami, cpbs] }
      - { name: "TypeScript", projects: [yeoronji, maple-alami, cpbs] }
      - { name: "Three.js", projects: [cpbs] }
      - { name: "Flutter", projects: [calddy] }
      - { name: "Android (Java)", projects: [nudgeup] }
      - { name: "Java Swing", projects: [pos-place] }
  - group: "인프라와 배포"
    items:
      - { name: "Docker Compose", projects: [nudgeup, mongscape] }
      - { name: "Caddy, Ubuntu VPS 운영", projects: [mongscape] }
      - { name: "Cloudflare Pages / Workers / KV", projects: [maple-alami, cpbs] }
      - { name: "GitHub Actions CI", projects: [cpbs] }
      - { name: "Vercel", projects: [yeoronji] }
  - group: "게임"
    items:
      - { name: "Unity (C#)", projects: [mongscape] }
      - { name: "BlazePose / Unity AI Inference", projects: [mongscape] }
  - group: "테스트와 도구"
    items:
      - { name: "pytest, Vitest, Playwright", projects: [yeoronji, cpbs] }
      - { name: "NUnit (Unity Test Framework)", projects: [mongscape] }
      - { name: "Git / GitHub", projects: [calddy, nudgeup, pos-place, mongscape, cpbs] }
      - { name: "Claude Code (AI 페어 프로그래밍)", projects: [yeoronji, maple-alami, mongscape, cpbs] }

education:
  - school: "명지전문대학"
    major: "컴퓨터공학과"
    degree: "전문학사"
    graduation: "2027-02"
    status: "졸업 예정"

# 회사 경력은 볼트에 근거가 없어 항목을 두지 않는다.

activities:
  - title: "2026 KMAIA 하계학술대회 논문 투고"
    detail: "SNS와 캘린더의 결합, 'Calddy'"
    date: "2026"
    project: calddy
  - title: "Mongscape v1.0.0 정식 출시"
    detail: "GitHub Releases"
    date: "2026-11-14"
    project: mongscape

certifications:
  - "네트워크관리사 2급"
  - "SQLD"
  - "정보처리산업기사"
  - "운전면허 1종 보통"

contact:
  email: "rhkdrh102010@gmail.com"
  github: "https://github.com/lilohdong"
  links: []

unverified:
  - "headline, intro 문구 승인 (2026-11-18 AI 슬롭 기준으로 다시 쓴 초안, 직무 이름은 쓰지 않음)"
  - "자격증 취득일 (답변에 이름만 있음)"
---

<!--
본문은 비워 둔다. 화면 문구(버튼, 안내)는 이 파일이 아니라 문구 파일(ko)에 둔다.
-->
