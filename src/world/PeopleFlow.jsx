import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Person from './Person.jsx';
import { useWorldMotion } from './WorldMotion.jsx';
import { getStationPaths, samplePath } from './journeyPaths.js';
import { trainCycleSeconds } from './trainSchedule.js';

function Commuter({ path, shirt, skin = '#c99572', startsAt = 0, size = .86, linger = false, variant = 0, reducedMotion }) {
  const group = useRef();
  const movement = useRef({ time: 0, moving: false });
  const world = useWorldMotion();
  useFrame(({ clock }) => {
    if (!group.current) return;
    const cycle = world.current.time % trainCycleSeconds;
    const time = reducedMotion ? path.duration * .45 : cycle - startsAt;
    if (!reducedMotion && (time < 0 || (!linger && time > path.duration))) {
      group.current.visible = false;
      return;
    }
    const { p, dx, dz, moving, mode } = samplePath(path, time);
    const weave = moving && mode === 'walk' ? Math.sin(time * 1.7 + variant) * .07 : 0;
    const length = Math.hypot(dx, dz) || 1;
    group.current.visible = true;
    group.current.position.set(p[0] - dz / length * weave, p[1], p[2] + dx / length * weave);
    if (Math.hypot(dx, dz) > .01) group.current.rotation.y = Math.atan2(dx, dz);
    const fade = reducedMotion ? 1 : Math.min(1, time / .3, linger ? (trainCycleSeconds - cycle) / .3 : (path.duration - time) / .3);
    group.current.scale.setScalar(Math.max(.001, fade) * size);
    movement.current = { time, moving: moving && time < path.duration };
  }, -.8);
  return <group ref={group} position={path.nodes[0].p} scale={size} userData={{ collisionRole: 'person' }}>
    <Person shirt={shirt} skin={skin} movement={movement} variant={variant} reducedMotion={reducedMotion} />
  </group>;
}

export default function PeopleFlow({ layout, reducedMotion }) {
  const paths = useMemo(() => getStationPaths(layout), [layout]);
  const profiles = [
    ['#c47a62', '#d3a37d', 'transfer', .6], ['#758fa6', '#86583e', 'entry', 2],
    ['#d5aa6c', '#c19a78', 'exit', 4], ['#73998b', '#dcb899', 'reverse', 6],
    ['#a47b9e', '#a77450', 'transfer', 3.5], ['#698687', '#724b36', 'entry', 5],
    ['#b9966d', '#e2bc99', 'exit', 7], ['#8b9b72', '#bd8a67', 'reverse', 9],
    ['#be8577', '#c69c77', 'transfer', 7], ['#7b91aa', '#9a6748', 'entry', 8],
  ];
  return <group userData={{ collisionRole: 'people' }}>
    {profiles.map(([shirt, skin, path, startsAt], i) => <Commuter key={i} shirt={shirt} skin={skin} path={paths[path]} startsAt={startsAt} size={.76 + i % 4 * .055} variant={i} linger={path === 'reverse'} reducedMotion={reducedMotion} />)}
  </group>;
}
