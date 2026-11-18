<script lang="ts">
	import { ko } from '../i18n/ko';
	import type { Sailing } from '../sailing/sailing.svelte';

	// 터치용 가상 조이스틱: 위/아래 = 전진/후진, 왼쪽/오른쪽 = 회전.
	let { game }: { game: Sailing } = $props();

	const RADIUS = 48;
	const DEADZONE = 0.15;

	let pointerId: number | null = null;
	let center = { x: 0, y: 0 };
	let knob = $state({ x: 0, y: 0 });

	function update(clientX: number, clientY: number) {
		let dx = clientX - center.x;
		let dy = clientY - center.y;
		const len = Math.hypot(dx, dy);
		if (len > RADIUS) {
			dx = (dx / len) * RADIUS;
			dy = (dy / len) * RADIUS;
		}
		knob = { x: dx, y: dy };
		const nx = dx / RADIUS;
		const ny = dy / RADIUS;
		game.joystick.turn = Math.abs(nx) < DEADZONE ? 0 : -nx;
		game.joystick.forward = Math.abs(ny) < DEADZONE ? 0 : -ny;
	}

	function release() {
		pointerId = null;
		knob = { x: 0, y: 0 };
		game.joystick.turn = 0;
		game.joystick.forward = 0;
	}

	function onpointerdown(e: PointerEvent) {
		const el = e.currentTarget as HTMLElement;
		const rect = el.getBoundingClientRect();
		center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
		pointerId = e.pointerId;
		el.setPointerCapture(e.pointerId);
		update(e.clientX, e.clientY);
	}

	function onpointermove(e: PointerEvent) {
		if (e.pointerId === pointerId) update(e.clientX, e.clientY);
	}

	function onpointerup(e: PointerEvent) {
		if (e.pointerId === pointerId) release();
	}
</script>

<div
	class="pointer-events-auto absolute bottom-6 left-6 flex size-32 touch-none items-center justify-center border-(length:--ui-border-width) border-line/70 bg-panel/40 select-none"
	role="img"
	aria-label={ko.controls.joystick}
	{onpointerdown}
	{onpointermove}
	{onpointerup}
	onpointercancel={onpointerup}
	onlostpointercapture={onpointerup}
>
	<span
		class="block size-14 border-(length:--ui-border-width) border-line bg-panel-raised shadow-pixel"
		style:translate="{knob.x}px {knob.y}px"
	></span>
</div>
