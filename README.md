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

`content/`에 적힌 이미지와 로고(`logo`, 긴 변 256px)를 원본 볼트에서 읽어 WebP로 변환해 `static/content/`에 저장하고, 콘텐츠 파일의 `src`·`width`·`height`를 채운다. 자세한 규칙은 `docs/planning.md` §4.1, §5.

```sh
npm run images:import -- --vault "<볼트 경로>"   # 또는 PORTFOLIO_VAULT 환경 변수, --dry-run, --force
```

## 항해 보기 조작

- `W/A/S/D` 또는 방향키: 전진·후진·회전 / `E` 또는 `Enter`: 선착장 근처에서 정박 / `Esc`: 패널·지도 닫기 / `M`: 지도
- 터치 화면(포인터가 coarse인 기기)에서는 왼쪽 아래 조이스틱과 정박 버튼
- 하늘·조명은 대한민국 표준시 현재 시각을 따른다. 검수할 때는 `?t=18.5`처럼 시각(0~24)을 고정할 수 있다.
- 화면 스타일: 기본은 도트처럼 보이는 픽셀 렌더다. `?px=6`처럼 픽셀 크기(2~12, 기본 4)를 바꿀 수 있다. 이전 로우폴리 화면은 `?style=lowpoly`로 볼 수 있다. 모두 `?t=`와 함께 쓸 수 있다.
- 화면 품질: 기본은 자동이다. 프레임 시간을 재서 느리면 그림자, 깃발 선명 패스, 픽셀 크기, 프레임 상한 순으로 한 단계씩 낮추고, 그래픽 가속이 없으면 가장 낮은 단계로 시작한다. 검수할 때는 `?quality=low`, `mid`, `high`로 고정할 수 있다.
  - 픽셀 렌더의 수면(`src/lib/scene/PixelWater.svelte`)은 조명 음영 없는 바탕색에 물결 무늬·섬 둘레 거품·항적을 그린다. 물결 무늬는 거리별로 크기 단계를 바꿔 수평선까지 이어진다.

## 콘텐츠

`content/projects/*.md`는 빌드 때 `src/lib/content/projects.server.ts`가 읽는다. `"확인 필요"` 값은 화면에서 숨긴다.
현재 항해 프로토타입은 `src/routes/+page.server.ts`의 `PROTOTYPE_PROJECTS` 목록(calddy)만 섬으로 띄운다.

## 검사

```sh
npm run check   # 타입 검사
npm run lint    # Prettier + ESLint
npm run format  # 자동 포맷
```

## 화면 모양 (테마)

색, 글꼴, 글자 크기, 테두리와 그림자는 `src/routes/layout.css`의 `@theme` 블록과 `:root` 변수에 모여 있다. 컴포넌트는 `bg-panel`, `text-ink`, `font-display` 같은 토큰 이름과 `ui-panel`, `ui-btn`, `ui-chip` 유틸리티만 쓴다. 공통 부품은 `src/lib/ui/kit/`에 있다. 기획은 `docs/ui-plan.md`.

## 글꼴 출처

글꼴 파일은 `static/fonts/`에 넣어 사이트와 함께 배포한다. 외부 CDN을 쓰지 않는다.

| 글꼴                                                                    | 쓰는 곳             | 버전   | 라이선스                                           |
| ----------------------------------------------------------------------- | ------------------- | ------ | -------------------------------------------------- |
| [Galmuri11 Bold](https://github.com/quiple/galmuri) (Lee Minseo)        | 제목, 버튼, 섬 이름 | 2.40.3 | SIL OFL 1.1, `static/fonts/galmuri/LICENSE.txt`    |
| [Pretendard](https://github.com/orioncactus/pretendard) (Kil Hyung-jin) | 본문                | 1.3.9  | SIL OFL 1.1, `static/fonts/pretendard/LICENSE.txt` |

두 글꼴 모두 배포처의 파일을 고치지 않고 그대로 넣었다. Pretendard는 배포처가 만든 woff2 동적 서브셋 중 Regular(400)와 SemiBold(600)만 넣었고, 브라우저는 화면에 나온 글자가 든 조각만 내려받는다. `@font-face` 선언은 `static/fonts/fonts.css`에 있다.
