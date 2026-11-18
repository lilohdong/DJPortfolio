// 화면에 보이는 모든 문구 (한국어). 컴포넌트는 문구를 직접 쓰지 않고 이 파일의 키만 참조한다.
// 영어를 붙일 때는 같은 모양의 en.ts를 추가한다.

/** "YYYY-MM" → "2026년 3월". 형식이 다르면 그대로 돌려준다. */
function formatMonth(value: string): string {
	const match = /^(\d{4})-(\d{2})$/.exec(value);
	return match ? `${match[1]}년 ${Number(match[2])}월` : value;
}

export const ko = {
	site: {
		title: 'DJ Portfolio',
		listTitle: '목록 보기 | DJ Portfolio'
	},
	home: {
		heading: 'DJ Portfolio',
		tagline: '배를 몰아 섬을 찾아가는 포트폴리오입니다.',
		listLink: '목록으로 보기',
		loading: '바다를 불러오는 중…'
	},
	list: {
		heading: '목록 보기',
		body: '포트폴리오를 목록으로 보는 페이지입니다. 아직 준비 중입니다.',
		backToSailing: '항해 보기로 돌아가기'
	},
	fallback: {
		noWebgl: '이 브라우저에서는 3D 항해 화면을 띄울 수 없습니다.',
		loadFailed: '3D 항해 화면을 불러오지 못했습니다.',
		hint: '지도에서 섬을 눌러 내용을 보거나, 목록 보기로 한 번에 볼 수 있습니다.',
		listLink: '목록으로 보기'
	},
	islands: {
		lighthouse: '등대섬',
		lighthouseRole: '소개'
	},
	lighthousePanel: {
		heading: '등대섬',
		body: '소개 섬입니다. 이름, 자기소개, 주요 링크가 이 자리에 들어갈 예정입니다.'
	},
	controls: {
		hint: 'W A S D 또는 방향키로 배를 움직이고, 섬 선착장 근처에서 E로 정박합니다. M으로 지도를 엽니다.',
		hintTouch: '왼쪽 아래 조이스틱으로 배를 움직이고, 섬 근처에서 정박 버튼을 누릅니다.',
		joystick: '배 조종 조이스틱',
		helpButton: '?',
		helpShow: '조작 안내 보기',
		helpHide: '조작 안내 닫기'
	},
	dock: {
		prompt: (island: string) => `${island} 선착장`,
		action: '정박하기',
		key: 'E'
	},
	map: {
		open: '지도',
		openWithKey: '지도 열기 (M)',
		key: 'M',
		title: '지도',
		close: '지도 닫기',
		closeWithKey: '지도 닫기 (Esc)',
		closeKey: 'Esc',
		islandList: '섬 목록',
		here: '지금 있는 섬',
		boat: '내 배',
		goTo: (island: string) => `${island}(으)로 이동`
	},
	panel: {
		close: '닫기',
		closeWithKey: '패널 닫기 (Esc)',
		closeKey: 'Esc',
		readMore: '이어서 읽기',
		readLess: '접기',
		morePhotos: '사진 더 보기',
		enlarge: (alt: string) => `크게 보기: ${alt}`,
		zoomClose: '닫기',
		zoomCloseWithKey: '크게 보기 닫기 (Esc)',
		islandNav: '섬 이동',
		prevIsland: (island: string) => `이전 섬: ${island}`,
		nextIsland: (island: string) => `다음 섬: ${island}`,
		period: '기간',
		team: '팀',
		role: '역할',
		highlights: '한 일',
		stack: '사용 기술',
		links: '링크',
		about: '소개',
		linkPrivate: '(비공개)',
		formatPeriod(start: string | null, end: string | null): string | null {
			if (start && end) return `${formatMonth(start)} ~ ${formatMonth(end)}`;
			if (start) return `${formatMonth(start)} ~`;
			return end ? `~ ${formatMonth(end)}` : null;
		},
		/** 기간 메모는 괄호로 붙인다 (가운뎃점을 쓰지 않는다) */
		formatPeriodNote(note: string): string {
			return `(${note})`;
		},
		formatTeam(size: number | null, type: string | null): string | null {
			if (type === '개인' || size === 1) return '개인 프로젝트';
			if (size !== null) return `${size}인 팀`;
			return type;
		}
	}
} as const;

export type Messages = typeof ko;
