import { useMemo } from 'react';
import { Shape } from 'three';
import { Block, FloorSlab, Rod, Sign, colors } from './Primitives.jsx';

function Head({ hair = '#5a4334', glasses = false }) {
  return <group rotation={[-.2, 0, 0]}>
    <mesh castShadow><sphereGeometry args={[.19, 10, 8]} /><meshStandardMaterial color="#d4aa83" roughness={1} flatShading /></mesh>
    <mesh position={[0, .125, -.015]} scale={[1.03, .48, 1.03]} castShadow><sphereGeometry args={[.19, 9, 6]} /><meshStandardMaterial color={hair} roughness={1} flatShading /></mesh>
    {[-.065, .065].map(x => <Block key={x} position={[x, .025, .179]} size={glasses ? [.11, .07, .035] : [.025, .025, .018]} color={glasses ? '#435758' : '#493b32'} />)}
    {glasses && <Block position={[0, .025, .19]} size={[.05, .018, .025]} color="#435758" />}
  </group>;
}

function StandingFriend({ position, shirt, pants, hair, denim = false, scale = 1 }) {
  return <group position={position} scale={scale}>
    <Block position={[0, 1.03, 0]} size={[.48, .61, .3]} color={shirt} />
    {[-1, 1].map(side => <group key={side}>
      <Rod from={[side * .12, .78, 0]} to={[side * .14, .12, .03]} radius={.095} color={pants} />
      <Block position={[side * .14, .065, .1]} size={[.19, .13, .32]} color="#4c5148" />
      <Rod from={[side * .27, 1.26, 0]} to={[side * .36, .68, .09]} radius={.075} color={shirt} />
      <mesh position={[side * .36, .63, .09]}><sphereGeometry args={[.075, 7, 5]} /><meshStandardMaterial color="#d4aa83" roughness={1} /></mesh>
    </group>)}
    {denim && <>
      <Block position={[0, 1.02, .158]} size={[.14, .51, .022]} color="#e6dcc3" />
      {[-.15, .15].map(x => <Block key={x} position={[x, 1.13, .16]} size={[.11, .13, .025]} color="#799ca6" />)}
      <Block position={[0, 1.02, -.24]} size={[.39, .54, .19]} color="#b09564" />
      {[-.18, .18].map(x => <Block key={x} position={[x, 1.06, .175]} size={[.045, .57, .025]} color="#a88c5f" />)}
    </>}
    <group position={[0, 1.54, 0]}><Head hair={hair} /></group>
  </group>;
}

function SeatedFriend() {
  return <group position={[-1.08, 1.55, .64]}>
    <Block position={[0, .48, 0]} size={[.48, .58, .32]} color="#34444a" />
    <group position={[0, 1.02, .02]}><Head hair="#6b4f39" /></group>
    {[-1, 1].map(side => <group key={side}>
      <Rod from={[side * .12, .2, 0]} to={[side * .13, -.03, .43]} radius={.095} color="#697576" />
      <Rod from={[side * .13, -.03, .43]} to={[side * .13, -.63, .53]} radius={.085} color="#697576" />
      <Block position={[side * .13, -.65, .62]} size={[.18, .13, .31]} color="#e2decf" />
      <Rod from={[side * .27, .72, 0]} to={[side * .16, .21, .27]} radius={.07} color="#34444a" />
    </group>)}
  </group>;
}

function RecliningFriend() {
  return <group position={[.15, 1.64, .64]}>
    <Block position={[.34, .3, 0]} size={[.48, .65, .34]} rotation={[0, 0, -.65]} color="#a18d78" />
    <group position={[.65, .76, .03]} rotation={[0, 0, -.22]}><Head hair="#574437" glasses /></group>
    <Block position={[.48, .56, .16]} size={[.37, .17, .2]} color="#60766a" />
    {[-1, 1].map(side => <group key={side}>
      <Rod from={[.08, .13, side * .11]} to={[-.8, .05, .15 + side * .12]} radius={.11} color="#7f8978" />
      <Rod from={[-.8, .05, .15 + side * .12]} to={[-1.9, .02, .22 + side * .14]} radius={.095} color="#7f8978" />
      <Block position={[-2, .04, .22 + side * .14]} size={[.29, .18, .2]} color="#465a50" />
    </group>)}
    <Rod from={[.58, .51, .2]} to={[.14, .22, .27]} radius={.08} color="#a18d78" />
  </group>;
}

function ConcreteArch() {
  const shape = useMemo(() => {
    const arch = new Shape().moveTo(-1.8, 0).lineTo(-.75, 0).lineTo(-.75, .65);
    arch.absarc(-.05, .65, .7, Math.PI, 0, true);
    return arch.lineTo(.65, 0).lineTo(1.45, 0).lineTo(1.45, 1.55).lineTo(-1.8, 1.55).closePath();
  }, []);
  return <mesh position={[0, 0, -.5]} castShadow receiveShadow><extrudeGeometry args={[shape, { depth: 1, steps: 1, curveSegments: 12, bevelEnabled: false }]} /><meshStandardMaterial color="#bdbaa9" roughness={1} /></mesh>;
}

function Wing({ side, tail = false }) {
  const shape = useMemo(() => {
    const points = tail ? [[0, -.9], [.9 * side, -1.55], [.9 * side, -1.8], [0, -1.55]] : [[0, .6], [2.5 * side, -.25], [2.56 * side, -.6], [0, -.25]];
    const wing = new Shape();
    points.forEach(([x, z], i) => i ? wing.lineTo(x, -z) : wing.moveTo(x, -z));
    return wing.closePath();
  }, [side, tail]);
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.06, 0]} castShadow><extrudeGeometry args={[shape, { depth: .065, bevelEnabled: false }]} /><meshStandardMaterial color={tail ? '#567d83' : '#deded0'} roughness={.8} /></mesh>;
}

function ModelPlane() {
  return <group position={[-.35, 3.4, -.02]} rotation={[.06, -.12, -.11]}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><capsuleGeometry args={[.18, 3.5, 4, 10]} /><meshStandardMaterial color="#e7e5d7" roughness={.8} /></mesh>
    <Block position={[0, .11, 1.55]} size={[.25, .08, .24]} color="#45676e" />
    <Block position={[0, .32, -1.65]} size={[.075, .73, .5]} rotation={[-.25, 0, 0]} color="#527b83" />
    {[-1, 1].map(side => <group key={side}>
      <Wing side={side} /><Wing side={side} tail />
      <mesh position={[side * .96, -.25, .04]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.15, .13, .55, 10]} /><meshStandardMaterial color="#d5b754" roughness={.8} /></mesh>
      <mesh position={[side * .96, -.25, .325]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.108, .108, .015, 10]} /><meshStandardMaterial color="#465a59" roughness={1} /></mesh>
      <Block position={[side * 2.5, .045, -.46]} size={[.1, .25, .3]} color="#527b83" />
      {Array.from({ length: 9 }, (_, i) => <Block key={i} position={[side * .18, .025, -.85 + i * .23]} size={[.015, .04, .06]} color="#577d82" castShadow={false} />)}
    </group>)}
  </group>;
}

// A miniature homage to the creators' airport photo, hidden on the rear of the
// cutaway. It uses the same geometry and materials as the station itself.
export default function CreatorsNook({ upperX, upperY }) {
  return <group name="creators-nook" position={[upperX - 2, upperY + .15, -8.3]} rotation={[0, Math.PI, 0]}>
    <FloorSlab position={[0, 0, 0]} size={[6.8, 3.8, .28]} color="#d9d4bf" sideColor="#a9a38e" />
    <Block position={[0, -.13, 1.93]} size={[6.8, .27, .12]} color="#b8ae94" />
    {[-2.8, 2.8].map(x => <Rod key={x} from={[x, -1.6, -1.6]} to={[x, -.29, 1.45]} radius={.065} color="#8d9786" />)}
    {[-3.16, 3.16].map(x => <group key={x}>
      <Rod from={[x, .08, -.3]} to={[x, .08, 1.65]} radius={.035} color={colors.tealDark} />
      <Rod from={[x, .72, -.3]} to={[x, .72, 1.65]} radius={.035} color={colors.tealDark} />
      {[-.3, 1.65].map(z => <Rod key={z} from={[x, 0, z]} to={[x, .72, z]} radius={.03} color={colors.tealDark} />)}
    </group>)}
    <ConcreteArch />
    <StandingFriend position={[-.35, 1.55, -.36]} scale={.82} shirt="#52615b" pants="#4c5550" hair="#927457" />
    <SeatedFriend /><RecliningFriend />
    <StandingFriend position={[2.2, 0, .38]} shirt="#5c8495" pants="#c7bda0" hair="#44372f" denim />
    <ModelPlane />
    {[-1.25, 1.25].map(x => <Rod key={x} from={[x, 3.95, -1.55]} to={[x - .35, 3.4, -.02]} radius={.012} color="#8c978c" />)}
    <Sign position={[2.12, 3.35, -1.5]} size={[2.35, .69]} text="MADE BY FRIENDS" subtext="THE PEOPLE BETWEEN THE LINES" background={colors.cream} foreground={colors.tealDark} frame="#a8936e" />
    <Sign position={[0, -.12, 2.01]} size={[1.72, .21]} text="THE CREW  ·  BCN" background={colors.tealDark} foreground={colors.cream} frame={colors.tealDark} />
  </group>;
}
