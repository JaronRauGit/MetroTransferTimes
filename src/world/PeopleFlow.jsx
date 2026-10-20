import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Block, Rod } from './Primitives.jsx';
import { getStationPaths, samplePath } from './journeyPaths.js';
import { trainCycleSeconds } from './trainSchedule.js';

function Commuter({ path, shirt, skin = '#c99572', startsAt = 0, size = .86, linger = false, reducedMotion }) {
  const group = useRef();
  const legs = useRef([]);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const cycle = clock.elapsedTime % trainCycleSeconds;
    const time = reducedMotion ? path.duration * .45 : cycle - startsAt;
    if (!reducedMotion && (time < 0 || (!linger && time > path.duration))) {
      group.current.visible = false;
      return;
    }
    const { p, dx, dz, moving } = samplePath(path, time);
    group.current.visible = true;
    group.current.position.set(...p);
    if (Math.hypot(dx, dz) > .01) group.current.rotation.y = Math.atan2(dx, dz);
    const fade = reducedMotion ? 1 : Math.min(1, time / .3, linger ? (trainCycleSeconds - cycle) / .3 : (path.duration - time) / .3);
    group.current.scale.setScalar(Math.max(.001, fade) * size);
    legs.current.forEach((leg, i) => {
      if (leg) leg.rotation.x = moving && !reducedMotion && time < path.duration ? Math.sin(time * 9 + i * Math.PI) * .28 : 0;
    });
  });
  return <group ref={group} position={path.nodes[0].p} scale={size} userData={{ collisionRole: 'person' }}>
    <mesh position={[0, .82, 0]} castShadow><sphereGeometry args={[.14, 8, 6]} /><meshStandardMaterial color={skin} roughness={1} /></mesh>
    <mesh position={[0, .48, 0]} castShadow><cylinderGeometry args={[.17, .21, .48, 6]} /><meshStandardMaterial color={shirt} flatShading roughness={.96} /></mesh>
    {[-.09, .09].map((x, i) => <group key={x} position={[x, .3, 0]} ref={value => { legs.current[i] = value; }}>
      <Block position={[0, -.14, 0]} size={[.105, .3, .12]} color="#506b6a" />
    </group>)}
    <Block position={[.22, .49, 0]} size={[.1, .3, .1]} color={skin} />
  </group>;
}

export default function PeopleFlow({ layout, reducedMotion }) {
  const paths = useMemo(() => getStationPaths(layout), [layout]);
  return <group userData={{ collisionRole: 'people' }}>
    <Commuter shirt="#c47a62" path={paths.transfer} startsAt={.6} reducedMotion={reducedMotion} />
    <Commuter shirt="#758fa6" path={paths.entry} startsAt={2} size={.8} reducedMotion={reducedMotion} />
    <Commuter shirt="#d5aa6c" path={paths.exit} startsAt={4} size={.8} reducedMotion={reducedMotion} />
    <Commuter shirt="#73998b" path={paths.reverse} startsAt={6} size={.84} linger reducedMotion={reducedMotion} />
    <Commuter shirt="#a47b9e" path={paths.transfer} startsAt={3.5} size={.8} reducedMotion={reducedMotion} />
  </group>;
}

export function TransferRoute({ layout, active, reducedMotion }) {
  const marker = useRef();
  const started = useRef(null);
  const path = useMemo(() => getStationPaths(layout).transfer, [layout]);
  useFrame(({ clock }) => {
    if (!active || !marker.current || reducedMotion) return;
    if (started.current === null) started.current = clock.elapsedTime;
    const sample = samplePath(path, ((clock.elapsedTime - started.current) * 1.6) % path.duration);
    marker.current.position.set(sample.p[0], sample.p[1] + .2, sample.p[2]);
  });
  if (!active) return null;
  return <group userData={{ collisionRole: 'route' }}>
    {path.nodes.slice(0, -1).map((point, index) => <Rod key={index} from={point.p.map((v, axis) => v + (axis === 1 ? .12 : 0))} to={path.nodes[index + 1].p.map((v, axis) => v + (axis === 1 ? .12 : 0))} radius={.037} color="#f5c777" />)}
    <mesh ref={marker} position={path.nodes[0].p.map((v, axis) => v + (axis === 1 ? .2 : 0))}><sphereGeometry args={[.17, 12, 8]} /><meshStandardMaterial color="#fff6cf" emissive="#e4a247" emissiveIntensity={1.6} /></mesh>
  </group>;
}
