import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Block, Sign, WindowPane, colors } from './Primitives.jsx';
import { useWorldNight } from './WorldAppearance.jsx';
import { useWorldMotion } from './WorldMotion.jsx';
import { ambientTrainOpacity, simulationTrainState } from '../simulation.js';
import { trainCycleSeconds as cycleSeconds, trainPosition, trainExitDistance, doorOpening } from './trainSchedule.js';

function DoorPair({ side, motion }) {
  const left = useRef();
  const right = useRef();
  useFrame(({ clock }) => {
    if (!left.current || !right.current) return;
    const opening = motion.current.door;
    left.current.position.x = -.22 - .34 * opening;
    right.current.position.x = .22 + .34 * opening;
  });
  const z = side * .785;
  return <group>
    <Block position={[0, .83, side * .742]} size={[.88, 1.18, .016]} color="#35585e" />
    <group ref={left} position={[-.22, 0, 0]}>
      <Block position={[0, .83, z]} size={[.44, 1.18, .055]} color={colors.coral} />
      <WindowPane position={[0, 1.03, z + side * .035]} size={[.27, .53, .018]} color={colors.glass} />
    </group>
    <group ref={right} position={[.22, 0, 0]}>
      <Block position={[0, .83, z]} size={[.44, 1.18, .055]} color={colors.coral} />
      <WindowPane position={[0, 1.03, z + side * .035]} size={[.27, .53, .018]} color={colors.glass} />
    </group>
  </group>;
}

function TrainCar({ x, index, motion, line, stripe }) {
  const frontCar = index === 3;
  const night = useWorldNight();
  return <group position={[x, 0, 0]}>
    <Block position={[0, .34, 0]} size={[3.1, .28, 1.36]} color="#4e5b5d" />
    <RoundedBox args={[3.13, 1.4, 1.44]} radius={.16} smoothness={3} position={[0, .95, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#eee9dc" roughness={.68} metalness={.12} />
    </RoundedBox>
    <RoundedBox args={[3.01, .23, 1.3]} radius={.1} smoothness={3} position={[0, 1.72, 0]} castShadow>
      <meshStandardMaterial color="#b4bcb5" roughness={.72} metalness={.1} />
    </RoundedBox>
    <Block position={[0, .39, .735]} size={[3.02, .2, .025]} color={colors.tealDark} />
    <Block position={[0, 1.51, .738]} size={[3.01, .07, .025]} color={stripe} />
    <Block position={[0, .39, -.735]} size={[3.02, .2, .025]} color={colors.tealDark} />
    <Block position={[0, 1.51, -.738]} size={[3.01, .07, .025]} color={stripe} />
    {[-1, 1].map(side => <group key={side}>
      {[-1.13, .98].map(pos => <group key={pos}>
        <Block position={[pos, 1.12, side * .754]} size={[.56, .55, .038]} color={colors.tealDark} />
        <WindowPane position={[pos, 1.12, side * .781]} size={[.47, .46, .014]} color="#6aaeb5" />
        <Block position={[pos - .12, 1.27, side * .791]} size={[.18, .035, .014]} color={night ? '#ecd5a9' : '#91babc'} castShadow={false} />
      </group>)}
      <DoorPair side={side} motion={motion} />
    </group>)}
    {[-.99, .99].map(wheelX => [-.52, .52].map(wheelZ => <mesh key={`${wheelX}-${wheelZ}`} position={[wheelX, .16, wheelZ]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[.18, .18, .1, 10]} /><meshStandardMaterial color="#3f4d50" roughness={.85} />
    </mesh>))}
    <Block position={[-.74, 1.85, 0]} size={[.73, .08, .64]} color="#8fa29d" />
    <Block position={[.61, 1.85, 0]} size={[.42, .07, .48]} color="#8fa29d" />
    {frontCar && <>
      <Block position={[1.61, 1.05, 0]} size={[.065, .62, .96]} color={colors.tealDark} />
      <WindowPane lit={false} position={[1.655, 1.05, 0]} size={[.018, .54, .87]} color="#6aaeb5" />
      <Block position={[1.68, .54, -.46]} size={[.035, .14, .19]} color="#ffe9b0" emissive="#ffdb9e" emissiveIntensity={night ? 2 : .05} roughness={.4} />
      <Block position={[1.68, .54, .46]} size={[.035, .14, .19]} color="#ffe9b0" emissive="#ffdb9e" emissiveIntensity={night ? 2 : .05} roughness={.4} />
      <Sign position={[1.7, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} size={[.53, .19]} text={line} background={stripe} foreground={colors.warmWhite} frame={stripe} />
    </>}
  </group>;
}

export default function Train({ reducedMotion, position = [0, -.36, -2.22], visibleEndX = 9.2, line = 'L3', stripe = colors.olive, phaseOffset = 6, actor = 'ambient', platformRole = 'source' }) {
  const train = useRef();
  const world = useWorldMotion();
  const motion = useRef({ door: 0 });
  const phaseState = useRef({ time: world.current.time, phase: phaseOffset, opacity: 1 });
  const materials = useRef([]);
  const planes = useMemo(() => [new THREE.Plane(), new THREE.Plane()], []);
  const origin = useMemo(() => new THREE.Vector3(), []);
  const axis = useMemo(() => new THREE.Vector3(), []);
  const oppositeAxis = useMemo(() => new THREE.Vector3(), []);
  const edge = useMemo(() => new THREE.Vector3(), []);
  useLayoutEffect(() => {
    materials.current = [];
    train.current.traverse(object => {
      if (!object.isMesh) return;
      const meshMaterials = Array.isArray(object.material) ? object.material : [object.material];
      meshMaterials.forEach(material => {
        materials.current.push({ material, opacity: material.opacity });
        material.transparent = true;
        material.clippingPlanes = planes;
        material.clipShadows = true;
        material.needsUpdate = true;
      });
    });
  }, [planes]);
  useFrame(({ clock }) => {
    if (!train.current) return;
    const snapshot = world.current.snapshot;
    phaseState.current.phase += world.current.time - phaseState.current.time;
    phaseState.current.time = world.current.time;
    const featured = actor !== 'ambient';
    const state = featured ? simulationTrainState(actor, snapshot.elapsed, trainExitDistance(visibleEndX)) : null;
    const opacity = featured ? 1 : ambientTrainOpacity(platformRole, snapshot);
    if (!featured && snapshot.active && opacity > 0 && phaseState.current.opacity <= .001) phaseState.current.phase = 0;
    phaseState.current.opacity = opacity;
    const phase = phaseState.current.phase % cycleSeconds;
    train.current.visible = featured ? snapshot.active && state.visible : opacity > .001;
    train.current.userData.lightOpacity = opacity;
    train.current.userData.lightBounds = [-9.2, visibleEndX];
    train.current.position.x = position[0] + (featured ? state.x : reducedMotion ? 0 : trainPosition(phase, trainExitDistance(visibleEndX)));
    motion.current.door = featured ? state.door : reducedMotion ? 0 : doorOpening(phase);
    materials.current.forEach(({ material, opacity: base }) => { material.opacity = base * opacity; });
    const platform = train.current.parent;
    platform.updateWorldMatrix(true, false);
    origin.setFromMatrixPosition(platform.matrixWorld);
    axis.set(1, 0, 0).transformDirection(platform.matrixWorld);
    planes[0].setFromNormalAndCoplanarPoint(axis, edge.copy(origin).addScaledVector(axis, -9.2));
    planes[1].setFromNormalAndCoplanarPoint(oppositeAxis.copy(axis).negate(), edge.copy(origin).addScaledVector(axis, visibleEndX));
  }, -1);
  return <group ref={train} position={position} name={actor === 'ambient' ? `ambient-${platformRole}-train` : `featured-${actor}-train`} userData={{ collisionRole: 'train' }}>
    {[-4.83, -1.61, 1.61, 4.83].map((x, index) => <TrainCar key={x} x={x} index={index} motion={motion} line={line} stripe={stripe} />)}
  </group>;
}
