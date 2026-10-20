import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { CanvasTexture, Color, Matrix4, Shape, SRGBColorSpace, Vector3 } from 'three';
import { Block, Rod } from './Primitives.jsx';

const yellow = '#d9b638';
const slate = '#626d70';

function useVuelingWordmark() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 192;
    const context = canvas.getContext('2d');
    context.font = 'italic 700 124px Arial, sans-serif';
    context.textBaseline = 'middle';
    context.fillStyle = slate;
    context.fillText('vueling', 24, 97);
    const wordWidth = context.measureText('vueling').width;
    context.fillStyle = yellow;
    context.fillText('.com', 24 + wordWidth, 97);
    const image = new CanvasTexture(canvas);
    image.colorSpace = SRGBColorSpace;
    image.anisotropy = 4;
    return image;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function Wing({ side, tail = false }) {
  const shape = useMemo(() => {
    const points = tail
      ? [[0, -1.25], [.88 * side, -1.9], [.88 * side, -2.11], [0, -1.8]]
      : [[0, .52], [2.3 * side, -.38], [2.36 * side, -.72], [0, -.28]];
    const wing = new Shape();
    points.forEach(([x, z], i) => i ? wing.lineTo(x, -z) : wing.moveTo(x, -z));
    return wing.closePath();
  }, [side, tail]);
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.06, 0]} castShadow>
    <extrudeGeometry args={[shape, { depth: .055, bevelEnabled: false }]} />
    <meshStandardMaterial color={tail ? '#c7cbc4' : '#d9dcd4'} roughness={.75} />
  </mesh>;
}

function LiveryDots() {
  const ref = useRef();
  const dots = useMemo(() => {
    const result = [];
    for (const side of [-1, 1]) {
      for (let row = 0; row < 6; row++) for (let column = 0; column < 5; column++) {
        const y = .17 + row * .145, z = -2.12 + column * .145;
        const leadingEdge = -1.3 - (y - .09) * .57 / .93;
        if (z + .058 < leadingEdge) result.push({ x: side * .045, y, z, radius: .046 + row * .002, gold: row === 3 && column === 1 });
      }
      for (let column = 0; column < 5; column++) for (let row = 0; row < 3; row++) {
        result.push({ x: side * (.207 - column * .008), y: -.12 + row * .103, z: -.95 - column * .19, radius: .021 + column * .004 });
      }
    }
    return result;
  }, []);
  useLayoutEffect(() => {
    const matrix = new Matrix4();
    dots.forEach((dot, i) => {
      matrix.makeRotationZ(Math.PI / 2).scale(new Vector3(dot.radius, 1, dot.radius)).setPosition(dot.x, dot.y, dot.z);
      ref.current.setMatrixAt(i, matrix);
      ref.current.setColorAt(i, new Color(dot.gold ? yellow : slate));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.instanceColor.needsUpdate = true;
  }, [dots]);
  return <instancedMesh ref={ref} args={[undefined, undefined, dots.length]}><cylinderGeometry args={[1, 1, .009, 12]} /><meshStandardMaterial roughness={.9} /></instancedMesh>;
}

function TailFin() {
  const shape = useMemo(() => new Shape().moveTo(-1.3, .09).lineTo(-1.87, 1.02).lineTo(-2.2, 1.07).lineTo(-2.2, .04).closePath(), []);
  return <mesh position={[.025, 0, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow>
    <extrudeGeometry args={[shape, { depth: .05, bevelEnabled: false }]} />
    <meshStandardMaterial color="#e1e2d6" roughness={.85} />
  </mesh>;
}

function LandingGear({ x, z, nose = false }) {
  return <group position={[x, -.2, z]}>
    <Rod from={[0, 0, 0]} to={[0, -.39, .02]} radius={.025} color="#8d9c95" />
    <Rod from={[0, -.12, -.14]} to={[0, -.34, .02]} radius={.018} color="#8d9c95" />
    {[-1, 1].map(side => <mesh key={side} position={[side * .07, -.4, .02]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[nose ? .078 : .1, nose ? .078 : .1, .055, 10]} /><meshStandardMaterial color="#465550" roughness={1} />
    </mesh>)}
  </group>;
}

// Nose is local +Z. The gallery rotates it to face away from the friends.
export default function CreatorsPlane({ position, rotation, scale }) {
  const wordmark = useVuelingWordmark();
  return <group name="creators-jet" position={position} rotation={rotation} scale={scale}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><capsuleGeometry args={[.21, 4.1, 6, 14]} /><meshStandardMaterial color="#e9e9df" roughness={.65} metalness={.08} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -.055, -.1]} scale={[.94, 1, .9]}><capsuleGeometry args={[.21, 3.75, 5, 12]} /><meshStandardMaterial color="#c6cdca" roughness={.8} /></mesh>
    <TailFin /><LiveryDots />
    {[-1, 1].map(side => <group key={side}>
      <Wing side={side} /><Wing side={side} tail />
      <mesh position={[side * .219, .055, .47]} rotation={[0, side * Math.PI / 2, 0]}>
        <planeGeometry args={[1.64, .31]} /><meshBasicMaterial map={wordmark} transparent alphaTest={.1} toneMapped={false} />
      </mesh>
      <Block position={[side * .16, .085, 1.94]} size={[.11, .13, .25]} rotation={[0, side * .3, -.15]} color="#46616b" />
      <Block position={[side * .22, -.02, 1.63]} size={[.014, .19, .11]} color="#a7b4b0" />
      {Array.from({ length: 14 }, (_, i) => <Block key={i} position={[side * .21, -.055, -1.25 + i * .2]} size={[.012, .062, .041]} color="#536d74" castShadow={false} />)}
      <mesh position={[side * .94, -.27, .08]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.18, .15, .65, 14]} /><meshStandardMaterial color={yellow} roughness={.67} /></mesh>
      <mesh position={[side * .94, -.27, .413]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.143, .143, .019, 14]} /><meshStandardMaterial color="#aab3ab" roughness={.6} /></mesh>
      <mesh position={[side * .94, -.27, .426]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.113, .113, .012, 12]} /><meshStandardMaterial color="#465450" roughness={1} /></mesh>
      <mesh position={[side * .94, -.27, -.253]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.104, .104, .018, 12]} /><meshStandardMaterial color="#59605a" roughness={1} /></mesh>
      <Block position={[side * 2.31, .06, -.56]} size={[.08, .28, .29]} rotation={[0, 0, side * -.15]} color={yellow} />
      <Block position={[side * 2.36, .13, -.56]} size={[.022, .04, .045]} color={side < 0 ? '#c87764' : '#82a684'} />
      <Rod from={[side * .3, .008, -.26]} to={[side * 2.24, .008, -.69]} radius={.008} color="#adb6b0" />
      <LandingGear x={side * .38} z={-.48} />
    </group>)}
    <LandingGear x={0} z={1.48} nose />
  </group>;
}
