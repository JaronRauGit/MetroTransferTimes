import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { samplePath } from './journeyPaths.js';
import { useWorldMotion } from './WorldMotion.jsx';
import { simulationTiming } from '../simulation.js';
import { lineColor } from './lineCatalog.js';
import Train from './Train.jsx';
import Person from './Person.jsx';
import { PassengerClock } from './JourneyLabels.jsx';
import { createPreviewPath } from './previewPath.js';

export default function TransferSimulation({ layout: l, station, simulation, reducedMotion, passengerClock }) {
  const passenger = useRef(), ring = useRef(), footsteps = useRef();
  const scratch = useMemo(() => ({ matrix: new Matrix4(), position: new Vector3(), scale: new Vector3(.085, .012, .17), rotation: new Euler(), quaternion: new Quaternion(), colour: new Color(), grey: new Color('#e4ddce') }), []);
  const movement = useRef({ moving: true, time: 0 });
  const world = useWorldMotion();
  const path = useMemo(() => createPreviewPath(l), [l]);
  useLayoutEffect(() => {
    // Enable the instanced-colour shader during launch, rather than compiling
    // a different footprint program just as the passenger starts walking.
    for (let i = 0; i < 20; i++) footsteps.current.setColorAt(i, scratch.colour.set('#ed855b'));
    footsteps.current.instanceColor.needsUpdate = true;
  }, [scratch]);
  useFrame((_, delta) => {
    if (!passenger.current) return;
    if (simulation?.status !== 'running') { passenger.current.visible = false; ring.current.visible = false; footsteps.current.visible = false; return; }
    const { elapsed, active, journey } = world.current.snapshot;
    const visible = active && elapsed >= simulationTiming.introStart && elapsed <= simulationTiming.walkEnd;
    const pose = samplePath(path, journey * path.duration);
    passenger.current.visible = visible;
    passenger.current.position.set(...pose.p);
    const targetAngle = Math.atan2(pose.dx, pose.dz);
    const angleDifference = Math.atan2(Math.sin(targetAngle - passenger.current.rotation.y), Math.cos(targetAngle - passenger.current.rotation.y));
    passenger.current.rotation.y += angleDifference * (1 - Math.exp(-Math.min(delta, .1) * 18));
    ring.current.visible = visible;
    ring.current.position.set(pose.p[0], pose.p[1] + .035, pose.p[2]);
    footsteps.current.visible = visible && elapsed >= simulationTiming.walkStart;
    for (let i = 0; i < 20; i++) {
      const sample = samplePath(path, Math.max(0, journey - i * .008) * path.duration);
      const angle = Math.atan2(sample.dx, sample.dz);
      const side = i % 2 ? -.1 : .1;
      scratch.position.set(sample.p[0] + Math.cos(angle) * side, sample.p[1] + .045, sample.p[2] - Math.sin(angle) * side);
      scratch.rotation.set(0, angle, 0); scratch.quaternion.setFromEuler(scratch.rotation);
      footsteps.current.setMatrixAt(i, scratch.matrix.compose(scratch.position, scratch.quaternion, scratch.scale));
      footsteps.current.setColorAt(i, scratch.colour.set('#ed855b').lerp(scratch.grey, i / 20));
    }
    footsteps.current.instanceMatrix.needsUpdate = true;
    footsteps.current.instanceColor.needsUpdate = true;
    movement.current = { moving: pose.moving && elapsed >= simulationTiming.walkStart, time: Math.max(0, elapsed - simulationTiming.walkStart) * 2.2, celebrating: pose.mode === 'walkway' };
  }, -1);
  return <group name="transfer-simulation" visible={simulation?.status === 'running'}>
    <group position={[l.upperX, l.upperY, l.upperZ]}>
      <Train actor="source" line={station.fromLine} stripe={lineColor(station.fromLine)} visibleEndX={l.upperTrackEndX - .2} />
    </group>
    <group position={[l.lowerX, l.lowerY, l.lowerZ]} rotation={[0, Math.PI / 2, 0]}>
      <Train actor="destination" line={station.toLine} stripe={lineColor(station.toLine)} />
    </group>
    <group ref={passenger} name="featured-passenger" scale={1} visible={false}>
      <PassengerClock target={passengerClock} />
      <Person presentation={simulation?.character ?? 'man'} shirt="#ec7652" skin="#bf8863" trousers="#365b69" hair="#45382e" movement={movement} hero reducedMotion={reducedMotion} />
      <mesh position={[0, 1.45, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[.105, .2, 8]} /><meshBasicMaterial color="#f58258" /></mesh>
    </group>
    <instancedMesh ref={footsteps} args={[undefined, undefined, 20]} visible={false} frustumCulled={false}><boxGeometry /><meshBasicMaterial /></instancedMesh>
    <group ref={ring} visible={false} name="passenger-halo">
      <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.3, .39, 28]} /><meshBasicMaterial color="#ed8156" transparent opacity={.85} depthWrite={false} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.29, 24]} /><meshBasicMaterial color="#ffe2ad" transparent opacity={.25} depthWrite={false} /></mesh>
    </group>
  </group>;
}
