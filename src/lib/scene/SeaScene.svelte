<script lang="ts">
	import { T, useTask } from '@threlte/core';

	// 3D 동작 확인용 자리 표시 장면. 실제 배와 섬은 T-006에서 만든다.
	let rotation = $state(0);

	useTask((delta) => {
		rotation += delta * 0.5;
	});
</script>

<T.PerspectiveCamera
	makeDefault
	position={[6, 5, 8]}
	fov={45}
	oncreate={(ref) => {
		ref.lookAt(0, 0.5, 0);
	}}
/>

<T.AmbientLight intensity={0.8} />
<T.DirectionalLight position={[5, 10, 5]} intensity={2} />

<!-- 수면 -->
<T.Mesh rotation.x={-Math.PI / 2}>
	<T.PlaneGeometry args={[60, 60]} />
	<T.MeshStandardMaterial color="#2a7fb8" flatShading />
</T.Mesh>

<!-- 상자 -->
<T.Mesh position.y={0.75} rotation.y={rotation}>
	<T.BoxGeometry args={[1.5, 1.5, 1.5]} />
	<T.MeshStandardMaterial color="#e8b04a" flatShading />
</T.Mesh>
