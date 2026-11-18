// 전 페이지를 빌드 시점에 정적 HTML로 사전 렌더링한다 (adapter-static).
export const prerender = true;

// `/list`를 `list/index.html`로 내보내, 별도 설정 없이 어떤 정적 호스트에서도 열리게 한다.
export const trailingSlash = 'always';
