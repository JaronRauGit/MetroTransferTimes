import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Block } from './Primitives.jsx';

function Commuter({ waypoints, shirt, skin = '#c99572', phaseShift = 0, size = 1, reducedMotion }) {
  const group = useRef();
  const last = waypoints[waypoints.length - 1];
  useFrame(({ clock }) => {
    if (!group.current) return;
    if (reducedMotion) {
      group.current.visible = true;
      group.current.position.set(...waypoints[0].p);
      group.current.scale.setScalar(size);
      return;
    }
    const time = (clock.elapsedTime + phaseShift) % 22;
    if (time < waypoints[0].t || time > last.t) {
      group.current.visible = false;
      return;
    }
    group.current.visible = true;
    const index = Math.max(0, waypoints.findIndex((point, i) => i < waypoints.length - 1 && time <= waypoints[i + 1].t));
    const start = waypoints[index], end = waypoints[index + 1] ?? start;
    const fraction = end.t === start.t ? 0 : Math.max(0, Math.min(1, (time - start.t) / (end.t - start.t)));
    const dx = end.p[0] - start.p[0], dz = end.p[2] - start.p[2];
    group.current.position.set(
      start.p[0] + dx * fraction,
      start.p[1] + (end.p[1] - start.p[1]) * fraction + Math.abs(Math.sin(time * 8)) * .025,
      start.p[2] + dz * fraction,
    );
    if (Math.hypot(dx, dz) > .04) group.current.rotation.y = Math.atan2(dx, dz);
    const fade = Math.min(1, (time - waypoints[0].t) / .35, (last.t - time) / .35);
    group.current.scale.setScalar(Math.max(.001, fade) * size);
  });
  return <group ref={group} position={waypoints[0].p} scale={size}>
    <mesh position={[0, .82, 0]} castShadow><sphereGeometry args={[.14, 8, 6]} /><meshStandardMaterial color={skin} roughness={1} /></mesh>
    <mesh position={[0, .48, 0]} castShadow><cylinderGeometry args={[.17, .21, .48, 6]} /><meshStandardMaterial color={shirt} flatShading roughness={.96} /></mesh>
    {[-.1, .1].map(x => <Block key={x} position={[x, .16, 0]} size={[.11, .32, .12]} color="#506b6a" />)}
    <Block position={[.22, .49, 0]} size={[.1, .3, .1]} color={skin} />
  </group>;
}

export default function PeopleFlow({ layout, reducedMotion }) {
  const { upperX, lowerX, upperConnectionX: upper, lowerConnectionX: lower, entranceX } = layout;
  const mid = (upper + lower) / 2;
  const lowerZ = 4.65;
  return <group>
    <Commuter shirt="#c47a62" reducedMotion={reducedMotion} waypoints={[
      { t: .4, p: [upperX - 1.61, .4, -1.02] },
      { t: 2.5, p: [upperX - 1.1, .4, .35] },
      { t: 4.7, p: [upper - 1, .4, 1.18] },
      { t: 6.2, p: [upper - 1, -.58, 2.18] },
      { t: 8.7, p: [mid, -.58, 2.47] },
      { t: 10.8, p: [lower, -.58, 2.92] },
      { t: 12.2, p: [lower, -1.54, 4.15] },
      { t: 14.8, p: [lowerX - 1.15, -1.54, lowerZ + 1.61] },
    ]} />
    <Commuter shirt="#758fa6" phaseShift={.7} size={.92} reducedMotion={reducedMotion} waypoints={[
      { t: 0, p: [entranceX - 2.5, 3.58, -1.08] },
      { t: 2.0, p: [entranceX - 1.33, 3.58, -1.05] },
      { t: 5.2, p: [entranceX + 1.33, .39, -1.05] },
      { t: 6.9, p: [entranceX + 2.34, .39, .3] },
      { t: 8.0, p: [upperX + .45, .4, .2] },
      { t: 10.1, p: [upperX + 1.61, .4, -1.03] },
    ]} />
    <Commuter shirt="#d5aa6c" phaseShift={1.3} size={.86} reducedMotion={reducedMotion} waypoints={[
      { t: 1.1, p: [upperX - 1.61, .4, -1.02] },
      { t: 3.5, p: [upperX - 1.22, .4, .5] },
      { t: 5.2, p: [entranceX + 2.32, .4, .34] },
      { t: 7, p: [entranceX + 1.33, .4, -1.05] },
      { t: 10.5, p: [entranceX - 1.34, 3.58, -1.05] },
      { t: 13.2, p: [entranceX - 2.8, 3.58, -1.06] },
    ]} />
    <Commuter shirt="#73998b" phaseShift={1.4} size={.95} reducedMotion={reducedMotion} waypoints={[
      { t: 6, p: [lowerX - 1.15, -1.54, lowerZ + 1.61] },
      { t: 8.1, p: [lowerX + .2, -1.54, lowerZ + .6] },
      { t: 10.3, p: [lower, -1.54, 4.15] },
      { t: 11.8, p: [lower, -.58, 2.91] },
      { t: 14.2, p: [mid, -.58, 2.45] },
      { t: 16.2, p: [upper - 1, -.58, 2.18] },
      { t: 17.8, p: [upper - 1, .4, 1.18] },
      { t: 19.9, p: [upperX + 1.2, .4, .2] },
    ]} />
    <Commuter shirt="#a47b9e" phaseShift={2.2} size={.83} reducedMotion={reducedMotion} waypoints={[
      { t: 0, p: [lowerX + .62, -1.54, lowerZ - 1.8] },
      { t: 4.2, p: [lowerX + .62, -1.54, lowerZ - 1.8] },
      { t: 8.4, p: [lowerX - .2, -1.54, lowerZ + .2] },
      { t: 11.4, p: [lowerX - 1.15, -1.54, lowerZ + 1.61] },
    ]} />
  </group>;
}
