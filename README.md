# DJPortfolio

배를 조작해 포트폴리오 섬을 찾아다니는 플레이어블 포트폴리오 사이트.

SvelteKit + Svelte 5 + TypeScript + Tailwind CSS + Threlte(Three.js). `adapter-static`으로 전 페이지를 정적 HTML로 빌드한다.

## 실행

```sh
npm install
npm run dev
```

## 빌드

```sh
npm run build    # 결과물: build/
npm run preview  # 빌드 결과 미리 보기 (build와 같은 BASE_PATH로 실행해야 한다)
```

하위 경로에 배포할 때(예: GitHub Pages 프로젝트 페이지)는 `BASE_PATH`를 지정해 빌드한다.

```sh
BASE_PATH=/DJPortfolio npm run build
```

Windows에서는 PowerShell로 `$env:BASE_PATH = '/DJPortfolio'; npm run build`를 쓴다. Git Bash는 `/DJPortfolio`를 Windows 경로로 바꿔 버리므로 앞에 `MSYS_NO_PATHCONV=1`을 붙여야 한다.

## 항해 보기 조작

- `W/A/S/D` 또는 방향키: 전진·후진·회전 / `E` 또는 `Enter`: 선착장 근처에서 정박 / `Esc`: 패널·지도 닫기 / `M`: 지도
- 터치 화면(포인터가 coarse인 기기)에서는 왼쪽 아래 조이스틱과 정박 버튼
- 하늘·조명은 대한민국 표준시 현재 시각을 따른다. 검수할 때는 `?t=18.5`처럼 시각(0~24)을 고정할 수 있다.

## 콘텐츠

`content/projects/*.md`는 빌드 때 `src/lib/content/projects.server.ts`가 읽는다. `"확인 필요"` 값은 화면에서 숨긴다.
현재 항해 프로토타입은 `src/routes/+page.server.ts`의 `PROTOTYPE_PROJECTS` 목록(calddy)만 섬으로 띄운다.

## 검사

```sh
npm run check   # 타입 검사
npm run lint    # Prettier + ESLint
npm run format  # 자동 포맷
```
