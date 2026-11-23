// 화면에 보이는 모든 문구 (한국어). 컴포넌트는 문구를 직접 쓰지 않고 이 파일의 키만 참조한다.
// 영어를 붙일 때는 같은 모양의 en.ts를 추가한다.

/** "YYYY-MM" → "2026년 3월". 형식이 다르면 그대로 돌려준다. */
function formatMonth(value: string): string {
	const match = /^(\d{4})-(\d{2})$/.exec(value);
	return match ? `${match[1]}년 ${Number(match[2])}월` : value;
}

export const ko = {
	site: {
		title: '오동준 | 신입',
		listTitle: '목록 | 오동준'
	},
	home: {
		listLink: '소개'
	},
	/** 제목 화면 (docs/ui-plan.md §3.2 표의 최종 문구) */
	titleScreen: {
		/** 말줄임표는 넣지 않는다. 화면에서 움직이는 점을 붙인다 */
		loading: '개발자 오동준의 바다로 이동 중',
		ready: '바다에 도착했습니다',
		loadFailed: '바다를 불러오지 못했습니다. 목록에서 같은 내용을 볼 수 있습니다.',
		noWebgl: '이 브라우저에서는 바다를 띄울 수 없습니다. 목록에서 같은 내용을 볼 수 있습니다.',
		start: '항해 시작',
		startLoading: '항해 시작, 불러오는 중',
		projects: '프로젝트 바로 보기',
		list: '소개',
		contact: '연락처',
		projectsHeading: '프로젝트',
		back: '뒤로',
		menuLabel: '제목 화면 메뉴',
		email: '이메일',
		github: 'GitHub'
	},
	/** 왼쪽 위 플레이어 카드 */
	nameTag: {
		toTitle: '제목 화면으로',
		progress: (visited: number, total: number) => `들른 섬 ${visited}/${total}`,
		progressLabel: (visited: number, total: number) => `들른 섬 ${total}개 중 ${visited}개`
	},
	/** 등대섬 패널과 목록 페이지의 소개 */
	profile: {
		skills: '기술',
		education: '학력',
		certifications: '자격증',
		activities: '활동',
		contact: '연락처',
		email: '이메일',
		github: 'GitHub',
		skillProjects: (skill: string) => `${skill} 관련 프로젝트`,
		formatGraduation(month: string | null, status: string | null): string | null {
			const parts = [month ? formatMonth(month) : null, status].filter(Boolean);
			return parts.length > 0 ? parts.join(' ') : null;
		}
	},
	list: {
		projectsHeading: '프로젝트',
		otherProjects: '그 밖의 프로젝트',
		toSailing: '항해 보기로 전환',
		openProject: (title: string) => `${title} 자세히 보기`
	},
	/** 프로젝트 개별 페이지 */
	projectPage: {
		title: (project: string) => `${project} | 오동준`,
		backToList: '목록으로 돌아가기',
		pageNav: '프로젝트 이동',
		prev: (project: string) => `이전 프로젝트: ${project}`,
		next: (project: string) => `다음 프로젝트: ${project}`
	},
	fallback: {
		noWebgl: '이 브라우저에서는 바다를 띄울 수 없습니다.',
		loadFailed: '바다를 불러오지 못했습니다.',
		hint: '지도에서 섬을 누르면 그 섬의 내용이 열립니다. 목록에서는 모든 프로젝트를 한 페이지로 봅니다.',
		listLink: '소개',
		/** 바다를 움직이지 않는 그림으로 둘 때 (T-029) */
		still:
			'지금은 바다를 멈춘 그림으로 보여 드립니다. 지도에서 섬을 누르면 그 섬의 내용이 열리고, 목록에서는 모든 프로젝트를 한 페이지로 봅니다.'
	},
	islands: {
		lighthouse: '등대섬',
		lighthouseRole: '소개'
	},
	lighthousePanel: {
		heading: '등대섬',
		body: '소개는 준비 중입니다.'
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
		goTo: (island: string) => `${island} 선착장으로 이동`
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
