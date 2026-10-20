import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Block, Sign, colors } from './Primitives.jsx';

const cycleSeconds = 22;
const startOffset = 5;
const smooth = value => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

function trainPosition(phase) {
  if (phase < 3) return -18 + 18 * smooth(phase / 3);
  if (phase < 17) return 0;
  if (phase < 20) return 18 * smooth((phase - 17) / 3);
  return 18;
}

function doorOpening(phase) {
  if (phase < 4 || phase > 16) return 0;
  if (phase < 5) return smooth(phase - 4);
  if (phase < 15) return 1;
  return 1 - smooth(phase - 15);
}

function DoorPair({ side, reducedMotion, phaseOffset }) {
  const left = useRef();
  const right = useRef();
  useFrame(({ clock }) => {
    if (!left.current || !right.current) return;
    const phase = (clock.elapsedTime + phaseOffset) % cycleSeconds;
    const opening = reducedMotion ? 0 : doorOpening(phase);
    left.current.position.x = -.22 - .34 * opening;
    right.current.position.x = .22 + .34 * opening;
  });
  const z = side * .785;
  return <group>
    <Block position={[0, .83, side * .742]} size={[.88, 1.18, .016]} color="#35585e" />
    <group ref={left} position={[-.22, 0, 0]}>
      <Block position={[0, .83, z]} size={[.44, 1.18, .055]} color={colors.coral} />
      <Block position={[0, 1.03, z + side * .035]} size={[.27, .53, .018]} color={colors.glass} roughness={.27} metalness={.13} />
    </group>
    <group ref={right} position={[.22, 0, 0]}>
      <Block position={[0, .83, z]} size={[.44, 1.18, .055]} color={colors.coral} />
      <Block position={[0, 1.03, z + side * .035]} size={[.27, .53, .018]} color={colors.glass} roughness={.27} metalness={.13} />
    </group>
  </group>;
}

function TrainCar({ x, index, reducedMotion, phaseOffset, line, stripe }) {
  const frontCar = index === 3;
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
        <Block position={[pos, 1.12, side * .781]} size={[.47, .46, .014]} color="#6aaeb5" roughness={.19} metalness={.21} />
        <Block position={[pos - .12, 1.27, side * .791]} size={[.18, .035, .014]} color="#a7cdd0" castShadow={false} />
      </group>)}
      <DoorPair side={side} reducedMotion={reducedMotion} phaseOffset={phaseOffset} />
    </group>)}
    {[-.99, .99].map(wheelX => [-.52, .52].map(wheelZ => <mesh key={`${wheelX}-${wheelZ}`} position={[wheelX, .16, wheelZ]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[.18, .18, .1, 10]} /><meshStandardMaterial color="#3f4d50" roughness={.85} />
    </mesh>))}
    <Block position={[-.74, 1.85, 0]} size={[.73, .08, .64]} color="#8fa29d" />
    <Block position={[.61, 1.85, 0]} size={[.42, .07, .48]} color="#8fa29d" />
    {frontCar && <>
      <Block position={[1.61, 1.05, 0]} size={[.065, .62, .96]} color={colors.tealDark} />
      <Block position={[1.655, 1.05, 0]} size={[.018, .54, .87]} color="#6aaeb5" roughness={.22} metalness={.2} />
      <Block position={[1.68, .54, -.46]} size={[.035, .14, .19]} color="#ffe9b0" roughness={.3} />
      <Block position={[1.68, .54, .46]} size={[.035, .14, .19]} color="#ffe9b0" roughness={.3} />
      <Sign position={[1.7, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} size={[.53, .19]} text={line} background={stripe} foreground={colors.warmWhite} frame={stripe} />
    </>}
  </group>;
}

export default function Train({ reducedMotion, position = [0, -1.7, 4.66], line = 'L3', stripe = colors.olive, phaseOffset = startOffset }) {
  const train = useRef();
  const planes = useMemo(() => [new THREE.Plane(), new THREE.Plane()], []);
  const origin = useMemo(() => new THREE.Vector3(), []);
  const axis = useMemo(() => new THREE.Vector3(), []);
  const oppositeAxis = useMemo(() => new THREE.Vector3(), []);
  const edge = useMemo(() => new THREE.Vector3(), []);
  useLayoutEffect(() => {
    train.current.traverse(object => {
      if (!object.isMesh) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach(material => {
        material.clippingPlanes = planes;
        material.clipShadows = true;
        material.needsUpdate = true;
      });
    });
  }, [planes]);
  useFrame(({ clock }) => {
    if (!train.current) return;
    train.current.position.x = position[0] + (reducedMotion ? 0 : trainPosition((clock.elapsedTime + phaseOffset) % cycleSeconds));
    const platform = train.current.parent;
    platform.updateWorldMatrix(true, false);
    origin.setFromMatrixPosition(platform.matrixWorld);
    axis.set(1, 0, 0).transformDirection(platform.matrixWorld);
    planes[0].setFromNormalAndCoplanarPoint(axis, edge.copy(origin).addScaledVector(axis, -7.08));
    planes[1].setFromNormalAndCoplanarPoint(oppositeAxis.copy(axis).negate(), edge.copy(origin).addScaledVector(axis, 7.08));
  });
  return <group ref={train} position={position}>
    {[-4.83, -1.61, 1.61, 4.83].map((x, index) => <TrainCar key={x} x={x} index={index} reducedMotion={reducedMotion} phaseOffset={phaseOffset} line={line} stripe={stripe} />)}
  </group>;
}
