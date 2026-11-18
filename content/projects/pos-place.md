---
# 화면에 나오는 곳: title, summary, role, highlights, 사진 caption, 그리고 맨 아래 본문.
# 본문에서 <!-- more --> 아래는 접혀 있다가 "이어서 읽기"를 누르면 펼쳐진다.
# ![](키)는 사진 자리다. 키는 images에 적힌 파일 이름에서 확장자를 뺀 것이다.
title: "POS PLACE"
summary: "PC방 카운터에서 좌석과 주문, 매출을 관리하는 데스크톱 POS 프로그램"
period:
  start: "2025-11"
  end: "2025-12"
  # 일 단위 기간(화면에는 안 나옴): 2025-11-06 ~ 2025-12-10
team:
  size: 4
  type: "팀"
  note: "4인 팀, 객체지향언어실습 기말 과제"
role: "프로그램 전체 구조와 Gradle 빌드 설정, 로그인 화면과 메인 화면, 사이드바, 매출 관리와 게임 통계 화면을 설계하고 구현"
stack:
  - Java 17
  - Swing
  - MySQL 8.0
  - JDBC
  - Gradle
highlights:
  - "외부 라이브러리가 팀원 PC에서도 돌아가도록 프로젝트를 Gradle로 옮겼습니다"
  - "매출 관리와 직원 관리는 관리자 모드에서만 열리게 했습니다"
  - "DB 연결 하나를 같이 쓰다가 연결이 자꾸 끊겨서, 쓸 때마다 새로 열고 닫게 고쳤습니다"
links:
  - type: repo
    label: "GitHub 저장소"
    url: "https://github.com/lilohdong/POS_PLACE"
images:
  # 4장 모두 팀 결과 보고서(hwp)에 실린 실제 실행 화면. 본인이 맡은 화면만 골랐다
  - src: "content/projects/pos-place/posplace-sales-menu.webp"
    alt: "POS PLACE 매출 관리 화면 (다크 모드): 월간 메뉴 매출 목록과 기간 매출액"
    caption: "매출 관리, 다크 모드"
    use: "대표 이미지. 실행 화면"
    width: 1600
    height: 1042
    source: "프로젝트/POS PLACE/posplace-sales-menu.png"
  - src: "content/projects/pos-place/posplace-game-stats.webp"
    alt: "게임 통계 화면: 날짜별 인기 게임 점유율 순위와 오늘 게임별 이용 시간과 이용자 수"
    caption: "게임 통계"
    use: "실행 화면"
    width: 1600
    height: 1041
    source: "프로젝트/POS PLACE/posplace-game-stats.png"
  - src: "content/projects/pos-place/posplace-sales-time.webp"
    alt: "매출 관리 화면 (라이트 모드): 시간 상품 매출 목록"
    caption: "시간 충전 매출, 라이트 모드"
    use: "실행 화면"
    width: 1600
    height: 1042
    source: "프로젝트/POS PLACE/posplace-sales-time.png"
  - src: "content/projects/pos-place/posplace-login.webp"
    alt: "POS PLACE 직원 로그인 화면"
    caption: "직원 로그인"
    use: "실행 화면"
    width: 1178
    height: 888
    source: "프로젝트/POS PLACE/posplace-login.png"
order: 6
featured: true
island:
  x: -50
  z: 22
  size: 6
  landmark: "pos-counter"
unverified: []
# 담당 근거: 팀 결과 보고서 "1.4 역할분담"과 화면별 "화면 개발자 명". 재고 자동 차감·단위 변환 트리거·환불 매출 차감은 다른 팀원 담당이라 본인 기여에서 뺐다
---

![](posplace-sales-menu)

좌석, 상품과 재고, 회원, 인수인계 화면은 다른 팀원들이 맡았습니다.

![](posplace-game-stats)

<!-- more -->

매출 관리 화면은 상품 매출과 시간 충전 매출을 탭으로 나누고 일, 주, 월, 시간대별로 조회합니다. 프로그램 전체를 다크 모드와 라이트 모드로 바꿀 수 있습니다.

![](posplace-sales-time)
