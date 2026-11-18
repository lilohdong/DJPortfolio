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

## 콘텐츠 이미지 가져오기

`content/`에 적힌 이미지를 원본 볼트에서 읽어 WebP로 변환해 `static/content/`에 저장하고, 콘텐츠 파일의 `src`·`width`·`height`를 채운다. 자세한 규칙은 `docs/planning.md` §4.1, §5.

```sh
npm run images:import -- --vault "<볼트 경로>"   # 또는 PORTFOLIO_VAULT 환경 변수, --dry-run, --force
```

## 검사

```sh
npm run check   # 타입 검사
npm run lint    # Prettier + ESLint
npm run format  # 자동 포맷
```
