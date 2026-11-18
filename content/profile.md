---
# 소개·기술·경력/학력·연락 섬에 쓰는 내용 (초안)
# 원본: 포트폴리오 볼트의 "프로젝트 목록.md", "사람인 포트폴리오.md", "사람인 자기소개서.md", 각 프로젝트 노트
# 노트에 없는 값은 "확인 필요"로 둔다.

name: "오동준"
name_en: "확인 필요"
headline: "직접 돌려 보고 확인하는 백엔드 개발자"
photo:
  src: "확인 필요"
  alt: "오동준 프로필 사진"
status: "확인 필요"   # 예: 구직 중 — 노트에 명시 없음
location: "확인 필요"  # 공개 가능하다고 결정됐으나 노트에 값 없음
resume:
  src: "확인 필요"     # 공개용 이력서 PDF 파일이 볼트에 없음

intro: |
  기능이 동작하는 데서 멈추지 않고, 권한과 데이터가 믿을 만한지 끝까지 확인하는 백엔드 개발자입니다.
  팀 프로젝트에서는 주로 백엔드를 맡아 Spring Boot와 Supabase로 인증, 권한, 알림을 구현했고,
  만든 서비스는 직접 배포하고 운영합니다. AI 도구로 구현 속도를 높이되, 결과 검수는 직접 책임집니다.

intro_points:
  - "권한은 '로그인했는가'가 아니라 '이 데이터의 주인인가'까지 확인합니다 — NudgeUp, Calddy"
  - "테스트가 통과해도 실제 데이터가 맞는지 따로 확인합니다 — 여론지, 메이플 할일 알리미"
  - "만든 서비스는 배포와 운영까지 책임집니다 — Mongscape v1.0.0 출시, VPS 운영"

skills:
  # 숙련도 표시는 하지 않고, 각 기술을 쓴 프로젝트(slug)로 연결한다.
  - group: "백엔드"
    items:
      - { name: "Spring Boot", projects: [nudgeup] }
      - { name: "Supabase (RLS, 트리거, Edge Functions)", projects: [calddy, yeoronji] }
      - { name: "PostgreSQL", projects: [calddy, nudgeup, yeoronji, mongscape] }
      - { name: "MySQL", projects: [pos-place, quiz] }
      - { name: "Python", projects: [yeoronji, mongscape] }
      - { name: "JWT 인증", projects: [nudgeup] }
      - { name: "FCM 푸시 알림", projects: [calddy, nudgeup] }
  - group: "프론트엔드·앱"
    items:
      - { name: "React / Next.js", projects: [yeoronji, maple-alami] }
      - { name: "TypeScript", projects: [yeoronji, maple-alami] }
      - { name: "Flutter", projects: [calddy] }
      - { name: "Android (Java)", projects: [nudgeup] }
      - { name: "Java Swing", projects: [pos-place] }
      - { name: "PHP", projects: [quiz] }
  - group: "인프라·배포"
    items:
      - { name: "Docker Compose", projects: [nudgeup, mongscape] }
      - { name: "Caddy, Ubuntu VPS 운영", projects: [mongscape] }
      - { name: "Cloudflare Pages / Workers / KV", projects: [maple-alami] }
      - { name: "Vercel", projects: [yeoronji] }
  - group: "게임"
    items:
      - { name: "Unity (C#)", projects: [mongscape, shivival, tank-attack] }
      - { name: "Photon PUN 2", projects: [tank-attack] }
      - { name: "BlazePose / Unity AI Inference", projects: [mongscape] }
  - group: "테스트·도구"
    items:
      - { name: "pytest, Vitest, Playwright", projects: [yeoronji] }
      - { name: "NUnit (Unity Test Framework)", projects: [mongscape] }
      - { name: "Git / GitHub", projects: [calddy, nudgeup, pos-place, mongscape, shivival] }
      - { name: "Claude Code (AI 페어 프로그래밍)", projects: [yeoronji, maple-alami, mongscape] }

education:
  - school: "명지전문대학"
    major: "컴퓨터공학과"
    period: "확인 필요"
    status: "확인 필요"   # 재학/졸업(예정) — 노트상 2026년 기준 3학년 과목 이력이 있음

experience: []   # 회사 경력 — 노트에 없음. 없으면 항로섬은 학력·활동·성과로 구성
activities:
  - title: "2026 KMAIA 하계학술대회 논문·포스터 발표"
    detail: "SNS와 캘린더의 결합, 'Calddy'"
    date: "2026"
    project: calddy
  - title: "Mongscape v1.0.0 정식 출시"
    detail: "GitHub Releases"
    date: "2026-11-14"
    project: mongscape
certifications: "확인 필요"   # 자격증·수상 — 노트에 없음

contact:
  email: "확인 필요"   # 공개용 이메일 — 노트에 없음
  github: "https://github.com/lilohdong"
  links: []           # 블로그 등 — 노트에 없음
---

<!--
본문은 비워 둔다. 화면 문구(버튼, 안내)는 이 파일이 아니라 문구 파일(ko)에 둔다.
intro는 사람인 자기소개서 v1 콘셉트와 링커리어 자기소개를 사이트용으로 줄인 것이다.
-->
