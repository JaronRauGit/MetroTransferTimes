import { useMemo, useRef } from 'react';
import { createPortal, useFrame, useThree } from '@react-three/fiber';
import { DataTexture, Object3D, RGBAFormat, Vector3 } from 'three';
import { useWorldNight } from './WorldAppearance.jsx';

let poolTexture;
function diffusePool() {
  if (poolTexture) return poolTexture;
  const size = 32, pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const index = (y * size + x) * 4, radius = Math.hypot((x + .5) / size * 2 - 1, (y + .5) / size * 2 - 1);
    pixels[index] = pixels[index + 1] = pixels[index + 2] = 255;
    pixels[index + 3] = Math.round(255 * Math.max(0, 1 - radius) ** 2);
  }
  poolTexture = new DataTexture(pixels, size, size, RGBAFormat);
  poolTexture.needsUpdate = true;
  return poolTexture;
}

// Only street lamps are real spotlights. Small vehicle spill is a quiet
// depth-tested pool on the paving, not another PBR light on every world mesh.
export default function LocalLight({ position, target = [0, -1, 0], power = 12, reach = 4, angle = .65, color = '#ffd5a0', name = 'local-light' }) {
  const real = name === 'barcelona-street-lamp';
  const anchor = useRef(), lamp = useRef(), pool = useRef();
  const night = useWorldNight(), scene = useThree(state => state.scene);
  const aim = useMemo(() => new Object3D(), []), destination = useMemo(() => new Vector3(), []);
  useFrame(() => {
    let gain = night ? 1 : 0;
    for (let node = anchor.current; node; node = node.parent) {
      if (!node.visible) { gain = 0; break; }
      gain *= node.userData.lightOpacity ?? 1;
    }
    if (!real) { if (pool.current) pool.current.material.opacity = .22 * gain; return; }
    anchor.current.updateWorldMatrix(true, false);
    lamp.current.position.setFromMatrixPosition(anchor.current.matrixWorld);
    aim.position.copy(destination.set(...target).applyMatrix4(anchor.current.matrixWorld));
    lamp.current.intensity = power * gain;
  }, -.4);
  return <group ref={anchor} position={position}>
    {real ? createPortal(<>
      <primitive object={aim} />
      <spotLight ref={lamp} name={name} target={aim} intensity={0} color={color} distance={reach} decay={2} angle={angle} penumbra={.85} castShadow={false} />
    </>, scene) : <mesh ref={pool} position={target} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <planeGeometry args={[reach * 1.1, reach * .65]} />
      <meshBasicMaterial map={diffusePool()} color={color} transparent opacity={0} depthWrite={false} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
    </mesh>}
  </group>;
}
