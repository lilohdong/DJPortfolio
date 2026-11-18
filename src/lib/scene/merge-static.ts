import {
	BufferAttribute,
	BufferGeometry,
	FrontSide,
	Matrix4,
	Mesh,
	MeshStandardMaterial,
	type Object3D
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useTask } from '@threlte/core';
import { onDestroy } from 'svelte';

// 섬 하나를 이루는 수십 개의 작은 메시(모래, 풀밭, 나무, 바위, 선착장, 조형물)를
// 색을 꼭짓점 색으로 옮겨 메시 한두 개로 합친다. 장면 모습은 같고 draw call만 줄어든다.
// 합치는 것은 "단색, 텍스처 없음, 발광 없음, 기본 거칠기·금속성, 앞면만" 재질뿐이다.
// 밤에 빛나는 등대 등불, POS 화면, 금속 종, 양면 돛, 깃발 천은 그대로 둔다.

function mergeable(mesh: Mesh): mesh is Mesh<BufferGeometry, MeshStandardMaterial> {
	const m = mesh.material;
	return (
		!Array.isArray(m) &&
		m instanceof MeshStandardMaterial &&
		m.map === null &&
		m.emissive.getHex() === 0 &&
		m.metalness === 0 &&
		m.roughness === 1 &&
		m.side === FrontSide &&
		!m.transparent &&
		mesh.visible &&
		mesh.layers.mask === 1
	);
}

/**
 * root 아래 합칠 수 있는 메시를 그림자 드리우기 여부별로 하나씩 합쳐 root에 붙이고, 원래 메시는 숨긴다.
 * root의 matrixWorld가 갱신된 뒤(첫 프레임 이후)에 부른다. 합친 메시를 돌려준다.
 */
export function mergeStatic(root: Object3D): Mesh[] {
	root.updateMatrixWorld(true);
	const toLocal = new Matrix4().copy(root.matrixWorld).invert();
	const groups = new Map<boolean, BufferGeometry[]>([
		[true, []],
		[false, []]
	]);
	const merged: Mesh[] = [];
	const sources: Mesh[] = [];
	const local = new Matrix4();

	root.traverse((object) => {
		if (!(object instanceof Mesh) || !mergeable(object)) return;
		let geometry = object.geometry.clone();
		if (geometry.index) geometry = geometry.toNonIndexed();
		local.multiplyMatrices(toLocal, object.matrixWorld);
		geometry.applyMatrix4(local);
		for (const name of Object.keys(geometry.attributes)) {
			if (name !== 'position' && name !== 'normal') geometry.deleteAttribute(name);
		}
		if (!geometry.attributes.normal) geometry.computeVertexNormals();
		// 재질 색(선형 공간)을 꼭짓점 색으로
		const color = object.material.color;
		const count = geometry.attributes.position.count;
		const colors = new Float32Array(count * 3);
		for (let i = 0; i < count; i++) colors.set([color.r, color.g, color.b], i * 3);
		geometry.setAttribute('color', new BufferAttribute(colors, 3));
		groups.get(object.castShadow)!.push(geometry);
		sources.push(object);
	});

	for (const [castShadow, geometries] of groups) {
		if (geometries.length === 0) continue;
		const geometry = mergeGeometries(geometries, false);
		geometries.forEach((g) => g.dispose());
		if (!geometry) continue;
		const mesh = new Mesh(
			geometry,
			new MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 })
		);
		mesh.castShadow = castShadow;
		mesh.receiveShadow = true;
		mesh.name = 'merged-static';
		root.add(mesh);
		merged.push(mesh);
	}
	// 원래 메시는 남겨 두되 그리지 않는다 (Threlte가 관리하는 객체라 지우지 않는다)
	for (const mesh of sources) mesh.visible = false;
	return merged;
}

/**
 * 컴포넌트 안에서 부른다. 자식 메시가 다 만들어진 뒤(두 번째 프레임) 한 번 합치고,
 * 컴포넌트가 사라질 때 합친 메시를 정리한다.
 */
export function useMergeStatic(getRoot: () => Object3D | undefined): void {
	let frames = 0;
	let done = false;
	let merged: Mesh[] = [];
	let root: Object3D | undefined;
	useTask(
		() => {
			if (done) return;
			frames += 1;
			root = getRoot();
			if (frames < 2 || !root) return;
			merged = mergeStatic(root);
			done = true;
		},
		{ autoInvalidate: false }
	);
	onDestroy(() => {
		for (const mesh of merged) {
			root?.remove(mesh);
			mesh.geometry.dispose();
			(mesh.material as MeshStandardMaterial).dispose();
		}
	});
}
