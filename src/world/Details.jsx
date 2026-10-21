import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Person from './Person.jsx';
import { useWorldMotion } from './WorldMotion.jsx';
import { Block, Rod, Sign, colors } from './Primitives.jsx';

export function Traveller({ position, shirt = colors.coral, skin = '#c99572', trousers = '#475f61', phase = 0, walk = 0, reducedMotion = false, scale = 1 }) {
  const group = useRef();
  const motion = useWorldMotion();
  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return;
    const time = motion.current.time * 1.7 + phase;
    group.current.position.y = position[1] + Math.abs(Math.sin(time)) * .045;
    group.current.position.x = position[0] + Math.sin(time * .42) * walk;
  });
  return <group ref={group} position={position} scale={scale} userData={{ collisionRole: 'person' }}>
    <Person shirt={shirt} skin={skin} trousers={trousers} variant={Math.round(phase * 2)} reducedMotion={reducedMotion} />
  </group>;
}

export function Planter({ position, width = .8 }) {
  return <group position={position}>
    <Block position={[0, .22, 0]} size={[width, .45, .52]} color={colors.terracotta} />
    <Block position={[0, .47, 0]} size={[width + .06, .08, .57]} color={colors.terracottaDark} />
    {[-.22, .18].map((x, i) => <mesh key={x} position={[x * width, .76 + i * .06, 0]} castShadow><icosahedronGeometry args={[.34, 0]} /><meshStandardMaterial color={i ? '#729367' : '#87a779'} flatShading roughness={1} /></mesh>)}
  </group>;
}

export function Turnstiles({ position, rotation = [0, 0, 0] }) {
  return <group position={position} rotation={rotation}>
    {[0, 1, 2].map(index => <group key={index} position={[(index - 1) * .72, 0, 0]}>
      <Block position={[0, .45, 0]} size={[.24, .9, .72]} color={colors.tealDark} />
      <Block position={[0, .91, 0]} size={[.27, .08, .76]} color={colors.metal} />
      <Block position={[0, .96, .18]} size={[.13, .02, .16]} color={index === 1 ? '#e7b471' : '#a3cfb0'} castShadow={false} />
      {index < 2 && <Block position={[.13, .55, 0]} size={[.02, .38, .34]} color="#a9c7be" transparent opacity={.6} castShadow={false} />}
    </group>)}
  </group>;
}

export function PlatformSign({ position }) {
  const [x, y, z] = position;
  return <group>
    <Block position={[x - 1.03, y - .42, z]} size={[.07, .86, .07]} color={colors.metal} />
    <Block position={[x + 1.03, y - .42, z]} size={[.07, .86, .07]} color={colors.metal} />
    <Sign position={[x, y, z + .035]} size={[2.2, .5]} text="CATALUNYA" subtext="L1  ·  L3  /  ANDANA 2" background={colors.cream} foreground={colors.tealDark} frame={colors.tealDark} />
  </group>;
}

export function RouteMarker({ active, reducedMotion }) {
  const dot = useRef();
  const startTime = useRef(null);
  const route = [
    [-4.4, 2.42, -1.52], [-4.4, 1.35, -.75], [-4.4, .68, -.05],
    [-2.25, .72, -.38], [0, .78, -.4], [2.25, .78, -.4],
    [2.55, .75, 1.38], [2.55, -.35, 2.17], [2.55, -1.31, 3.04],
    [3.52, -1.3, 3.28],
  ];
  useFrame(({ clock }) => {
    if (!dot.current || !active || reducedMotion) return;
    if (startTime.current === null) startTime.current = clock.elapsedTime;
    const t = ((clock.elapsedTime - startTime.current) % 5.2) / 5.2 * (route.length - 1);
    const index = Math.min(route.length - 2, Math.floor(t));
    const part = t - index;
    const start = route[index], end = route[index + 1];
    dot.current.position.set(start[0] + (end[0] - start[0]) * part, start[1] + (end[1] - start[1]) * part + .17, start[2] + (end[2] - start[2]) * part);
  });
  if (!active) return null;
  return <group>
    {route.slice(0, -1).map((point, index) => {
      const next = route[index + 1];
      const mid = point.map((v, axis) => (v + next[axis]) / 2);
      const dx = next[0] - point[0], dy = next[1] - point[1], dz = next[2] - point[2];
      const length = Math.hypot(dx, dy, dz);
      const angleY = Math.atan2(-dz, dx);
      return <group key={index} position={mid} rotation={[0, angleY, Math.atan2(dy, Math.hypot(dx, dz))]}>
        <Block size={[length, .045, .045]} color="#f5c978" castShadow={false} />
      </group>;
    })}
    <mesh ref={dot} position={route[0]}>
      <sphereGeometry args={[.16, 12, 8]} />
      <meshStandardMaterial color="#fff1c7" emissive="#e9a24c" emissiveIntensity={1.5} roughness={.5} />
    </mesh>
  </group>;
}
