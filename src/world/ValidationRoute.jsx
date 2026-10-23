import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, Color, Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { Block, Rod } from './Primitives.jsx';
import { validationSnapshot } from '../validation.js';
import { createValidationPath, sampleValidationPath } from './validationPath.js';

function ArrivalBurst({ position, validation, reducedMotion }) {
  const confetti = useRef();
  const scratch = useMemo(() => ({ matrix: new Matrix4(), position: new Vector3(), scale: new Vector3(), rotation: new Euler(), quaternion: new Quaternion() }), []);
  const pieces = useMemo(() => Array.from({ length: 38 }, (_, i) => ({ angle: i * 2.39996, speed: 1.1 + (i % 5) * .22, lift: 2.8 + (i % 7) * .2 })), []);
  useLayoutEffect(() => {
    const colours = ['#cf6556', '#d7af56', '#74a291', '#749db7', '#f5e7ba'];
    pieces.forEach((_, i) => confetti.current.setColorAt(i, new Color(colours[i % colours.length])));
    confetti.current.instanceColor.needsUpdate = true;
  }, [pieces]);
  useFrame(() => {
    const time = validation.celebrationAt ? (Date.now() - validation.celebrationAt) / 1000 : -1;
    const show = !reducedMotion && time >= 0 && time < 3.8;
    confetti.current.visible = show;
    if (!show) return;
    const { matrix, position: p, scale, rotation, quaternion } = scratch;
    pieces.forEach((piece, i) => {
      p.set(Math.cos(piece.angle) * piece.speed * time, .3 + piece.lift * time - 1.5 * time * time, Math.sin(piece.angle) * piece.speed * time);
      rotation.set(time * (i % 3 + 1), piece.angle + time, time * 2);
      quaternion.setFromEuler(rotation);
      scale.set(.09, .15, .045).multiplyScalar(Math.max(0, Math.min(1, (3.8 - time) * 2)));
      confetti.current.setMatrixAt(i, matrix.compose(p, quaternion, scale));
    });
    confetti.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh name="validation-confetti" ref={confetti} position={position} args={[undefined, undefined, pieces.length]} visible={false} frustumCulled={false}><boxGeometry /><meshStandardMaterial roughness={.8} /></instancedMesh>;
}

export default function ValidationRoute({ layout, validation, reducedMotion }) {
  const marker = useRef();
  const halo = useRef();
  const path = useMemo(() => validation ? createValidationPath(layout, validation.values) : null, [layout, validation?.values]);
  useFrame(() => {
    if (!validation || !marker.current) return;
    const { elapsed, complete } = validationSnapshot(validation);
    const { p } = sampleValidationPath(path, elapsed);
    const bob = reducedMotion || complete ? 0 : Math.sin(elapsed * 3) * .025;
    marker.current.position.set(p[0], p[1] + .57 + bob, p[2]);
    halo.current.position.set(p[0], p[1] + .055, p[2]);
  });
  if (!validation) return null;
  const finish = path.nodes.at(-1).p;
  return <group name="validation-route" userData={{ collisionRole: 'route', dynamic: true }}>
    {path.nodes.slice(0, -1).map((point, index) => <Rod key={index} from={point.p.map((v, axis) => v + (axis === 1 ? .08 : 0))} to={path.nodes[index + 1].p.map((v, axis) => v + (axis === 1 ? .08 : 0))} radius={.024} color="#dca279" />)}
    <mesh ref={halo} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[.38, .027, 6, 24]} /><meshBasicMaterial color="#d66555" transparent opacity={.55} /></mesh>
    <group ref={marker} name="validation-marker" position={[...path.nodes[0].p.map((v, axis) => v + (axis === 1 ? .57 : 0))]}>
      <mesh><sphereGeometry args={[.32, 20, 14]} /><meshBasicMaterial color="#d45346" side={BackSide} /></mesh>
      <mesh castShadow><sphereGeometry args={[.237, 20, 14]} /><meshStandardMaterial color="#fff2d6" emissive="#ffe2aa" emissiveIntensity={.5} roughness={.6} /></mesh>
      <mesh position={[0, -.29, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[.105, .23, 10]} /><meshStandardMaterial color="#d45346" roughness={.8} /></mesh>
    </group>
    <group position={finish} name="validation-finish">
      <Rod from={[.36, 0, .18]} to={[.36, 1.35, .18]} radius={.025} color="#789584" />
      {[0, 1, 2, 3].flatMap(column => [0, 1, 2].map(row => <Block key={`${column}-${row}`} position={[.44 + column * .14, 1.3 - row * .14, .18]} size={[.14, .14, .035]} color={(column + row) % 2 ? '#f8efd9' : '#6d8d7b'} castShadow={false} />))}
    </group>
    <ArrivalBurst position={finish} validation={validation} reducedMotion={reducedMotion} />
  </group>;
}
