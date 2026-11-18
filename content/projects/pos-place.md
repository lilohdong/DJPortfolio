---
title: "POS PLACE"
summary: "PC방 카운터에서 좌석, 주문, 재고, 회원, 직원, 매출, 인수인계를 관리하는 데스크톱 POS 프로그램"
period:
  start: "2025-11"
  end: "2025-12"
  note: "2025-11-06 ~ 2025-12-10"
team:
  size: 4
  type: "팀"
  note: "4인 팀, 객체지향언어실습 기말 팀 프로젝트"
role: "프로그램 전체 구조와 Gradle 빌드 설정, 로그인 화면과 메인 프레임, 사이드바, 매출 관리와 게임 통계 화면을 설계하고 구현 (팀 내 커밋 최다)"
stack:
  - Java 17
  - Swing
  - MySQL 8.0
  - JDBC
  - Gradle
highlights:
  - "프로젝트를 Gradle 빌드로 옮기고 의존성을 관리해 팀원 모두 같은 환경에서 빌드하게 했습니다"
  - "매출 관리와 직원 관리는 관리자 모드에서만 열리도록 사이드바를 만들고, 다크 모드와 라이트 모드 전환을 넣었습니다"
  - "매출 관리 화면에서 상품 매출과 시간 충전 매출을 나눠 일, 주, 월, 시간대별로 조회하게 했습니다"
  - "게임 이용 기록을 날짜별로 집계해 인기 게임 점유율과 당일 이용 현황을 보여 줍니다"
  - "직원 로그인은 5회 실패하면 프로그램을 종료합니다. 게임 테이블과 시간 결제 로그 테이블을 설계하고 더미 데이터를 넣었습니다"
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
  x: 78
  z: 28
  size: 6
unverified: []
# 담당 근거: 팀 결과 보고서 "1.4 역할분담"과 화면별 "화면 개발자 명". 재고 자동 차감·단위 변환 트리거·환불 매출 차감은 다른 팀원 담당이라 본인 기여에서 뺐다
---

POS PLACE는 PC방 카운터에서 쓰는 POS 프로그램입니다. 좌석 상태, 상품 주문, 재고, 회원, 직원, 매출, 교대 인수인계를 한 프로그램에서 관리합니다. Java Swing과 MySQL로 만든 데스크톱 앱이고, 2학년 2학기 객체지향언어실습 기말 팀 프로젝트입니다.

팀에서 커밋은 제가 가장 많았고, 프로그램 전체 구조와 메인 프레임, 사이드바 네비게이션을 만들었습니다. 캘린더 같은 외부 라이브러리를 제 PC에만 넣으면 팀원 PC에서는 돌아가지 않아서, 프로젝트를 Gradle 빌드로 옮기고 의존성 설정을 관리했습니다.

사이드바는 관리자 모드에 들어가야만 매출 관리와 직원 관리 메뉴가 열려서, 일반 직원은 민감한 정보를 볼 수 없습니다. 프로그램 전체를 다크 모드와 라이트 모드로 바꾸는 기능도 넣었습니다. 직원은 이름과 각자 정한 비밀번호로 로그인하고, 5회를 넘게 실패하면 프로그램이 종료됩니다.

매출 관리 화면은 상품 매출과 시간 충전 내역을 탭으로 나눠, 매출이 어느 쪽에서 더 나오는지 보이게 했습니다. 일, 주, 월 단위로 조회하고 일간 조회에서는 시간대까지 좁힐 수 있으며, 조회한 기간의 매출 합계도 함께 나옵니다.

게임 통계 화면은 게임 이용 기록을 날짜별로 집계해 인기 게임 점유율 순위와 그날 게임별 이용 시간, 이용자 수를 보여 줍니다.

DB에서는 게임 테이블과 시간 결제 로그 테이블을 설계하고 더미 데이터를 넣었습니다. DB 연결을 싱글톤으로 두었다가 연결이 계속 닫히는 문제가 생겨, 매번 만들고 해제하는 방식으로 바꿨습니다.

좌석 관리, 상품 판매와 재고 관리, 회원 관리와 인수인계는 다른 팀원들이 맡았습니다. 프로그램 전체로 보면 정전에 대비해 좌석 상태를 주기적으로 저장하고, 레시피대로 재료를 자동 차감합니다. 취소나 환불이 들어오면 매출에서 자동으로 빼고, 교대할 때는 금고 차액을 계산합니다.
