import { useMemo, useRef } from 'react';
import { createPortal, useFrame, useThree } from '@react-three/fiber';
import { Color, Object3D, Vector3 } from 'three';
import { useWorldCompact, useWorldNight } from './WorldAppearance.jsx';

// Keep light objects outside animated visibility groups. A disappearing vehicle
// dims its lamp instead of changing light counts and recompiling every material.
export default function LocalLight({ position, target = [0, -1, 0], power = 12, reach = 4, angle = .65, color = '#ffd5a0', point = false, shadow = false, name = 'local-light' }) {
  const anchor = useRef(), lamp = useRef();
  const night = useWorldNight(), compact = useWorldCompact();
  const scene = useThree(state => state.scene);
  const aim = useMemo(() => new Object3D(), []);
  const destination = useMemo(() => new Vector3(), []);
  useFrame(() => {
    if (!anchor.current || !lamp.current) return;
    anchor.current.updateWorldMatrix(true, false);
    lamp.current.position.setFromMatrixPosition(anchor.current.matrixWorld);
    aim.position.copy(destination.set(...target).applyMatrix4(anchor.current.matrixWorld));
    let gain = 1;
    for (let node = anchor.current; node; node = node.parent) {
      if (!node.visible) { gain = 0; break; }
      gain *= node.userData.lightOpacity ?? 1;
    }
    lamp.current.intensity = night ? power * gain : 0;
  }, -.4);
  return <>
    <object3D ref={anchor} position={position} />
    {createPortal(<>
      <primitive object={aim} />
      {point ? <pointLight ref={lamp} name={name} intensity={0} color={color} distance={reach} decay={2} /> :
        <spotLight ref={lamp} name={name} target={aim} intensity={0} color={color} distance={reach} decay={2} angle={angle} penumbra={.85} castShadow={shadow && !compact && night} shadow-mapSize={[512, 512]} shadow-camera-near={.1} shadow-camera-far={reach} shadow-normalBias={.018} shadow-bias={-.0001} />}
    </>, scene)}
  </>;
}

// Tiny, depth-tested envelopes sit on the actual bulb, never on a camera-facing
// overlay. Bloom handles the bright core; this is only a trace of local haze.
export function LightHaze({ position, radius = .26, color = '#ffd29a' }) {
  const night = useWorldNight(), compact = useWorldCompact();
  const uniforms = useMemo(() => ({ tint: { value: new Color(color) } }), [color]);
  if (!night || compact) return null;
  return <mesh position={position} renderOrder={2}>
    <sphereGeometry args={[radius, 10, 8]} />
    <shaderMaterial transparent depthWrite={false} uniforms={uniforms}
      vertexShader={'varying float facing; void main() { facing = max(0.0, normalize(normalMatrix * normal).z); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'}
      fragmentShader={'uniform vec3 tint; varying float facing; void main() { gl_FragColor = vec4(tint, pow(facing, 3.0) * 0.065);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'} />
  </mesh>;
}
