import { useEffect, useMemo } from 'react';
import { Color, Float32BufferAttribute, PlaneGeometry } from 'three';
import { Block } from './Primitives.jsx';

const stops = [[0, '#e5b06d'], [.2, '#efc78e'], [.42, '#d8ab97'], [.65, '#96b5c2'], [1, '#648da9']];

function skyColour(t) {
  t = Math.min(1, Math.max(0, t));
  const index = stops.findIndex(stop => stop[0] >= t);
  const high = Math.max(1, index), a = stops[high - 1], b = stops[high];
  return new Color(a[1]).lerp(new Color(b[1]), (t - a[0]) / (b[0] - a[0]));
}

function Cloud({ position, width, tint, seed = 0 }) {
  return <group position={position}>
    {Array.from({ length: 7 }, (_, i) => {
      const lump = Math.sin(i * 2.7 + seed);
      return <mesh key={i} position={[(i / 6 - .5) * width, lump * .09, (i % 2) * .025]} scale={[width / 4, .09 + (lump + 1) * .05, .11]}>
        <icosahedronGeometry args={[1, 1]} /><meshStandardMaterial color={tint} roughness={1} flatShading />
      </mesh>;
    })}
  </group>;
}

// A framed sky relief: vertex-colour sky, a solid sun, and sculpted cloud banks.
export default function SunsetBackdrop() {
  const geometry = useMemo(() => {
    const sky = new PlaneGeometry(14.08, 7.61, 1, 32);
    const positions = sky.attributes.position;
    const colours = new Float32Array(positions.count * 3);
    for (let i = 0; i < positions.count; i++) skyColour((positions.getY(i) + 7.61 / 2) / 7.61).toArray(colours, i * 3);
    sky.setAttribute('color', new Float32BufferAttribute(colours, 3));
    return sky;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <group name="sunset-backdrop" position={[0, 3.97, -3.98]}>
    <Block position={[0, 0, -.15]} size={[14.55, 8.07, .23]} color="#a98a65" />
    <mesh geometry={geometry}><meshBasicMaterial vertexColors toneMapped={false} /></mesh>
    {[-7.16, 7.16].map(x => <Block key={x} position={[x, 0, .06]} size={[.16, 7.98, .18]} color="#d9c5a0" />)}
    {[-3.94, 3.94].map(y => <Block key={y} position={[0, y, .06]} size={[14.46, .16, .18]} color="#d9c5a0" />)}
    <mesh position={[4.65, -2.15, .045]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.03, 1.03, .035, 40]} /><meshBasicMaterial color="#f4ce84" toneMapped={false} /></mesh>
    <mesh position={[4.65, -2.15, .075]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.78, .78, .04, 40]} /><meshBasicMaterial color="#ffe1a0" toneMapped={false} /></mesh>
    <Cloud position={[-4.8, 2.35, .16]} width={3.6} tint="#b7c4c6" seed={1} />
    <Cloud position={[2.8, 2.75, .16]} width={4.5} tint="#c2c8c5" seed={3} />
    <Cloud position={[-1.7, .75, .17]} width={4.8} tint="#d7c3b7" seed={2} />
    <Cloud position={[4.3, -.55, .17]} width={3.9} tint="#e5c3a0" seed={4} />
    <Cloud position={[-4.25, -1.9, .17]} width={4.6} tint="#dfb596" seed={5} />
    <Cloud position={[1.7, -2.85, .17]} width={5.7} tint="#edc28d" seed={2} />
    <Block position={[0, -3.57, .025]} size={[14.04, .035, .025]} color="#c5a77e" castShadow={false} />
  </group>;
}
