// 이번 방문에서 들른 섬 (왼쪽 위 플레이어 카드의 진행 표시).
// 패널을 연 프로젝트 섬을 들른 것으로 센다. 같은 탭 안에서만 유지한다(sessionStorage).
// 저장소 접근이 막히면 페이지를 새로 열 때마다 0부터 센다.

const KEY = 'djp:visited-islands';

export class VisitLog {
	#ids = $state<string[]>([]);

	constructor() {
		try {
			const saved = JSON.parse(sessionStorage.getItem(KEY) ?? '[]') as unknown;
			if (Array.isArray(saved)) this.#ids = saved.filter((v): v is string => typeof v === 'string');
		} catch {
			// 저장소를 못 쓰면 빈 기록으로 시작한다
		}
	}

	has(id: string): boolean {
		return this.#ids.includes(id);
	}

	add(id: string): void {
		if (this.has(id)) return;
		this.#ids = [...this.#ids, id];
		try {
			sessionStorage.setItem(KEY, JSON.stringify(this.#ids));
		} catch {
			// 저장하지 못해도 이번 화면에서는 센다
		}
	}

	/** 주어진 섬 가운데 들른 섬 수 */
	count(ids: readonly string[]): number {
		return ids.filter((id) => this.has(id)).length;
	}
}
