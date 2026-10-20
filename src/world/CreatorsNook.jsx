import { useLayoutEffect, useMemo, useRef } from 'react';
import { Matrix4, Shape } from 'three';
import { Block, FloorSlab, Rod, Sign, colors } from './Primitives.jsx';

const skin = '#d4aa83';
const terrace = { offsetX: 1, offsetY: -4, z: -10.1, width: 14.8, depth: 6.8, figureScale: 1.7 };

// Keep camera fitting in sync with the terrace, including its projecting jet.
export function creatorsNookBounds(upperX, upperY) {
  const x = upperX + terrace.offsetX, y = upperY + terrace.offsetY;
  return { min: [x - 7.6, y - 1.7, -14.8], max: [x + 8.3, y + 8.7, -6.6] };
}

function Hand({ position }) {
  return <mesh position={position} castShadow><sphereGeometry args={[.071, 8, 6]} /><meshStandardMaterial color={skin} roughness={1} flatShading /></mesh>;
}

function Head({ hair = '#5a4334', glasses = false, beard = false, longHair = false, cropped = false }) {
  return <group name="portrait-head" rotation={[-.23, 0, 0]}>
    <mesh castShadow><sphereGeometry args={[.19, 12, 9]} /><meshStandardMaterial color={skin} roughness={1} flatShading /></mesh>
    <mesh position={[0, .12, -.025]} scale={[1.05, .55, 1.07]} castShadow><sphereGeometry args={[.19, 11, 7]} /><meshStandardMaterial color={hair} roughness={1} flatShading /></mesh>
    {!longHair && <Block position={[-.05, cropped ? .15 : .18, .045]} size={[.21, cropped ? .045 : .075, .17]} rotation={[0, 0, -.15]} color={hair} />}
    {longHair && <mesh position={[0, .015, -.12]} scale={[1.05, 1.05, .5]} castShadow><sphereGeometry args={[.19, 10, 7]} /><meshStandardMaterial color={hair} roughness={1} flatShading /></mesh>}
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[side * .18, -.005, -.005]} scale={[.6, 1, .7]}><sphereGeometry args={[.055, 7, 5]} /><meshStandardMaterial color={skin} roughness={1} flatShading /></mesh>
      {longHair && <>
        <mesh position={[side * .105, .13, .065]} scale={[.75, .5, .8]} castShadow><sphereGeometry args={[.15, 8, 6]} /><meshStandardMaterial color={hair} roughness={1} flatShading /></mesh>
        <Block position={[side * .163, -.025, -.06]} size={[.075, .3, .17]} rotation={[0, 0, side * .13]} color={hair} />
      </>}
      <Block position={[side * .066, .025, .178]} size={[.025, .022, .014]} color="#413c32" castShadow={false} />
      <Block position={[side * .065, .068, .17]} size={[.057, .014, .02]} color={hair} castShadow={false} />
      {glasses && <>
        <Block position={[side * .07, .026, .195]} size={[.114, .075, .016]} color="#849b91" transparent opacity={.28} castShadow={false} />
        {[-.04, .04].map(y => <Block key={y} position={[side * .07, .026 + y, .21]} size={[.124, .014, .02]} color="#424e48" castShadow={false} />)}
        {[-.061, .061].map(x => <Block key={x} position={[side * .07 + x, .026, .21]} size={[.014, .082, .02]} color="#424e48" castShadow={false} />)}
        <Rod from={[side * .13, .05, .19]} to={[side * .18, .025, -.01]} radius={.008} color="#424e48" />
      </>}
    </group>)}
    {glasses && <Block position={[0, .028, .21]} size={[.036, .014, .018]} color="#424e48" castShadow={false} />}
    <Block position={[0, -.022, .188]} size={[.039, .055, .041]} color="#c89c77" />
    {beard && <mesh position={[0, -.105, .065]} scale={[.83, .39, .83]}><sphereGeometry args={[.19, 10, 7]} /><meshStandardMaterial color={hair} roughness={1} flatShading /></mesh>}
    <Block position={[0, -.09, .166]} size={[.052, .012, .016]} color="#9b725a" castShadow={false} />
  </group>;
}

function Trainer({ position, color = '#4c5148' }) {
  return <group position={position}>
    <Block size={[.19, .12, .32]} color={color} />
    <Block position={[0, -.045, .015]} size={[.205, .035, .34]} color="#d9d5c3" />
    {[-.025, .025].map(z => <Block key={z} position={[0, .065, z + .035]} size={[.105, .009, .014]} color="#c5c7b8" castShadow={false} />)}
  </group>;
}

function StandingFriend({ position, shirt, pants, hair, denim = false, coat = false, scale = 1 }) {
  return <group name={denim ? 'creator-denim' : 'creator-coat'} position={position} scale={scale}>
    <Block position={[0, 1.03, 0]} size={[.48, .61, .3]} color={shirt} />
    <Block position={[0, .75, 0]} size={[.47, .065, .31]} color={denim ? '#4d7382' : '#444c45'} />
    <Block position={[0, 1.02, .158]} size={[denim ? .14 : .075, .51, .024]} color={denim ? '#e6dcc3' : '#85877a'} />
    {[-1, 1].map(side => <group key={side}>
      <Rod from={[side * .12, .78, 0]} to={[side * .14, .12, .03]} radius={.095} color={pants} />
      <Block position={[side * .15, .41, .095]} size={[.019, .43, .012]} color={denim ? '#b4aa8e' : '#424c44'} castShadow={false} />
      <Trainer position={[side * .14, .065, .1]} />
      <Block position={[side * .105, 1.29, .17]} size={[.15, .13, .04]} rotation={[0, 0, side * -.35]} color={denim ? '#85a2a8' : '#5e6053'} />
      {coat ? <>
        <Rod from={[side * .27, 1.26, 0]} to={[side * .29, .96, .18]} radius={.083} color={shirt} />
        <Rod from={[side * .29, .96, .18]} to={[-side * .14, 1.01 + side * .025, .24]} radius={.077} color={shirt} />
        <Hand position={[-side * .14, 1.01 + side * .025, .24]} />
      </> : <>
        <Rod from={[side * .27, 1.26, 0]} to={[side * .36, .79, .055]} radius={.083} color={shirt} />
        <Rod from={[side * .36, .79, .055]} to={[side * .35, .66, .1]} radius={.065} color={skin} />
        <Block position={[side * .35, .82, .05]} size={[.16, .08, .18]} color="#7f9da4" />
        <Hand position={[side * .35, .63, .1]} />
      </>}
    </group>)}
    {denim && <>
      {[-.15, .15].map(x => <group key={x}>
        <Block position={[x, 1.13, .17]} size={[.11, .13, .025]} color="#799ca6" />
        <Block position={[x, 1.18, .188]} size={[.12, .026, .02]} color="#9ab0ae" />
        <Block position={[x, 1.15, .204]} size={[.018, .018, .012]} color="#c3b68b" castShadow={false} />
      </group>)}
      {[.85, .96, 1.07, 1.18].map(y => <Block key={y} position={[.075, y, .183]} size={[.017, .017, .012]} color="#c3b68b" castShadow={false} />)}
      <Block position={[0, 1.02, -.24]} size={[.39, .54, .19]} color="#ad936a" />
      <Block position={[0, .91, -.345]} size={[.28, .22, .035]} color="#baa47d" />
      {[-.18, .18].map(x => <Block key={x} position={[x, 1.06, .19]} size={[.045, .57, .03]} color="#b29970" />)}
    </>}
    <group position={[0, 1.54, 0]}><Head hair={hair} longHair={coat} cropped={denim} /></group>
  </group>;
}

function SeatedFriend() {
  return <group name="creator-seated" position={[-1.17, 1.55, .57]}>
    <Block position={[0, .48, 0]} size={[.48, .58, .32]} color="#2d3e46" />
    <Block position={[0, .22, .015]} size={[.47, .06, .34]} color="#24353d" />
    <Block position={[0, .75, .14]} size={[.16, .045, .025]} color="#617070" />
    <Block position={[.11, .59, .17]} size={[.065, .043, .012]} color="#b5b9a7" castShadow={false} />
    <group position={[0, 1.02, .02]} rotation={[0, -.12, 0]}><Head hair="#66503d" beard /></group>
    {[-1, 1].map(side => <group key={side}>
      <Rod from={[side * .12, .2, 0]} to={[side * .13, -.03, .43]} radius={.095} color="#788180" />
      <Rod from={[side * .13, -.03, .43]} to={[side * .13, -.63, .53]} radius={.085} color="#788180" />
      <Trainer position={[side * .13, -.65, .62]} color="#b7bbaf" />
      <Rod from={[side * .27, .72, 0]} to={[side * .3, .36, .13]} radius={.077} color="#2d3e46" />
      <Rod from={[side * .3, .36, .13]} to={[side * .16, .21, .27]} radius={.067} color="#2d3e46" />
      <Hand position={[side * .16, .21, .29]} />
    </group>)}
  </group>;
}

function RecliningFriend() {
  return <group name="creator-scarf" position={[.15, 1.64, .72]}>
    <group position={[.34, .3, 0]} rotation={[0, 0, -.65]}>
      <Block size={[.48, .65, .34]} color="#a18d78" />
      <Block position={[0, .02, .18]} size={[.14, .55, .025]} color="#626c60" />
      {[-.13, .13].map(x => <Block key={x} position={[x, .13, .18]} size={[.16, .2, .045]} rotation={[0, 0, x > 0 ? -.16 : .16]} color="#b7a28a" />)}
      <Block position={[.15, -.14, .19]} size={[.13, .1, .04]} color="#8d7c69" />
    </group>
    <group position={[.65, .76, .03]} rotation={[0, 0, -.22]}><Head hair="#574437" glasses /></group>
    <Block position={[.48, .56, .17]} size={[.37, .17, .2]} color="#60766a" />
    <Block position={[.32, .39, .22]} size={[.13, .27, .06]} rotation={[0, 0, -.5]} color="#6f8473" />
    {[-1, 1].map(side => <group key={side}>
      <Rod from={[.08, .13, side * .11]} to={[-.8, .05, .15 + side * .12]} radius={.11} color="#7f8978" />
      <Rod from={[-.8, .05, .15 + side * .12]} to={[-1.9, .02, .22 + side * .14]} radius={.095} color="#7f8978" />
      <Block position={[-.45, .15, .15 + side * .12]} size={[.24, .04, .15]} color="#929b86" />
      <group position={[-2, .04, .22 + side * .14]} rotation={[0, 0, Math.PI / 2]}><Trainer position={[0, 0, 0]} color="#465a50" /></group>
    </group>)}
    <Rod from={[.58, .51, .2]} to={[.37, .22, .26]} radius={.08} color="#a18d78" />
    <Rod from={[.37, .22, .26]} to={[.08, .27, .29]} radius={.065} color="#a18d78" />
    <Hand position={[.08, .27, .29]} />
  </group>;
}

function ConcreteArch() {
  const shape = useMemo(() => {
    const arch = new Shape().moveTo(-1.8, 0).lineTo(-.75, 0).lineTo(-.75, .65);
    arch.absarc(-.05, .65, .7, Math.PI, 0, true);
    return arch.lineTo(.65, 0).lineTo(1.45, 0).lineTo(1.45, 1.55).lineTo(-1.8, 1.55).closePath();
  }, []);
  const aggregate = useRef();
  const flecks = useMemo(() => {
    const pieces = [];
    for (let i = 0; i < 125; i++) {
      const x = -1.77 + ((i * .6180339) % 1) * 3.18;
      const y = .04 + ((i * .4142136) % 1) * 1.47;
      const opening = Math.abs(x + .05) < .72 && y < .68 + Math.sqrt(Math.max(0, .72 ** 2 - (x + .05) ** 2));
      if (!opening) pieces.push([x, y, .522, .009 + (i % 3) * .005]);
    }
    return pieces;
  }, []);
  useLayoutEffect(() => {
    const matrix = new Matrix4();
    flecks.forEach(([x, y, z, size], i) => aggregate.current.setMatrixAt(i, matrix.makeScale(size, size * .65, .006).setPosition(x, y, z)));
    aggregate.current.instanceMatrix.needsUpdate = true;
  }, [flecks]);
  return <group>
    <mesh position={[0, 0, -.5]} castShadow receiveShadow><extrudeGeometry args={[shape, { depth: 1, steps: 1, curveSegments: 18, bevelEnabled: true, bevelSize: .018, bevelThickness: .018, bevelSegments: 1 }]} /><meshStandardMaterial color="#c2bfae" roughness={1} /></mesh>
    <Block position={[-.175, 1.53, 0]} size={[3.27, .045, 1.035]} color="#cbc8b8" />
    <instancedMesh ref={aggregate} args={[undefined, undefined, flecks.length]}><boxGeometry /><meshStandardMaterial color="#a4a591" roughness={1} /></instancedMesh>
  </group>;
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

function LandingGear({ x, z, nose = false }) {
  return <group position={[x, -.17, z]}>
    <Rod from={[0, 0, 0]} to={[0, -.41, .02]} radius={.024} color="#8d9c95" />
    <Rod from={[0, -.12, -.14]} to={[0, -.35, .02]} radius={.017} color="#8d9c95" />
    {[-1, 1].map(side => <mesh key={side} position={[side * .07, -.42, .02]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[nose ? .078 : .1, nose ? .078 : .1, .055, 10]} /><meshStandardMaterial color="#465550" roughness={1} /></mesh>)}
  </group>;
}

function ModelPlane() {
  return <group name="creators-jet" position={[-1.5, 4.22, .5]} rotation={[.06, -.12, -.11]}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><capsuleGeometry args={[.18, 3.5, 5, 12]} /><meshStandardMaterial color="#e7e5d7" roughness={.8} /></mesh>
    <Block position={[0, .11, 1.55]} size={[.25, .08, .24]} color="#45676e" />
    <Block position={[0, .32, -1.65]} size={[.075, .73, .5]} rotation={[-.25, 0, 0]} color="#527b83" />
    <Block position={[.043, .39, -1.67]} size={[.008, .1, .39]} rotation={[-.25, 0, 0]} color="#d7b858" castShadow={false} />
    {[-1, 1].map(side => <group key={side}>
      <Wing side={side} /><Wing side={side} tail />
      <mesh position={[side * .96, -.25, .04]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.15, .13, .55, 12]} /><meshStandardMaterial color="#d5b754" roughness={.8} /></mesh>
      <mesh position={[side * .96, -.25, .325]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.108, .108, .015, 12]} /><meshStandardMaterial color="#465a59" roughness={1} /></mesh>
      <Block position={[side * 2.5, .045, -.46]} size={[.1, .25, .3]} color="#527b83" />
      <Block position={[side * 2.56, .1, -.46]} size={[.022, .035, .045]} color={side < 0 ? '#c87764' : '#82a684'} />
      <LandingGear x={side * .37} z={-.36} />
      {Array.from({ length: 9 }, (_, i) => <Block key={i} position={[side * .18, .025, -.85 + i * .23]} size={[.015, .04, .06]} color="#577d82" castShadow={false} />)}
      <Block position={[side * .18, -.006, 1.32]} size={[.018, .16, .1]} color="#a5b7ad" />
    </group>)}
    <LandingGear x={0} z={1.1} nose />
  </group>;
}

function TerracePlanter({ x }) {
  return <group position={[x, 0, .5]}>
    <Block position={[0, .29, 0]} size={[1.12, .58, 1.4]} color={colors.terracotta} />
    <Block position={[0, .6, 0]} size={[1.2, .1, 1.48]} color="#af765b" />
    <Block position={[0, .66, 0]} size={[.97, .025, 1.24]} color="#716c50" />
    {[-.36, 0, .36].map((z, i) => <group key={z}>
      <mesh position={[(i % 2 ? .14 : -.12), .96, z]} scale={[.7, 1, .8]} castShadow><icosahedronGeometry args={[.45, 0]} /><meshStandardMaterial color={i % 2 ? '#7d9875' : '#92a581'} roughness={1} flatShading /></mesh>
      <mesh position={[.1, 1.25, z]}><icosahedronGeometry args={[.11, 0]} /><meshStandardMaterial color={i % 2 ? '#d7b06e' : '#c98569'} roughness={1} /></mesh>
    </group>)}
  </group>;
}

function CreatorsTerrace() {
  return <group>
    <FloorSlab position={[0, 0, 0]} size={[terrace.width, terrace.depth, .38]} color="#e3deca" sideColor="#b3ab92" />
    <Block position={[0, -.16, 3.43]} size={[14.8, .33, .13]} color="#c6b898" />
    <Block position={[0, 3.97, -3.29]} size={[14.2, 7.75, .14]} color="#ded9c3" />
    <Block position={[0, 7.89, -3.19]} size={[14.45, .16, .25]} color="#bda682" />
    {[-7.13, 7.13].map(x => <Block key={x} position={[x, 3.88, -3.18]} size={[.22, 7.9, .29]} color="#c39478" />)}
    <Block position={[0, .56, -3.18]} size={[14.2, .1, .055]} color="#729586" />
    {[-6, 0, 6].map(x => <Rod key={x} from={[x, -1.5, -3.22]} to={[x, -.39, 2.9]} radius={.085} color="#899480" />)}
    {Array.from({ length: 15 }, (_, i) => <Block key={i} position={[-7 + i, .008, 0]} size={[.018, .012, 6.58]} color="#ccc8b1" castShadow={false} />)}
    {[-2.2, -1.1, 0, 1.1, 2.2].map(z => <Block key={z} position={[0, .008, z]} size={[14.5, .012, .018]} color="#ccc8b1" castShadow={false} />)}
    {[-7.05, 7.05].map(x => <group key={x}>
      {[.12, 1.1].map(y => <Rod key={y} from={[x, y, -2.8]} to={[x, y, 3.15]} radius={.04} color={colors.tealDark} />)}
      {[-2.8, -.85, 1.15, 3.15].map(z => <Rod key={z} from={[x, 0, z]} to={[x, 1.1, z]} radius={.04} color={colors.tealDark} />)}
    </group>)}
    <TerracePlanter x={-6.25} /><TerracePlanter x={6.25} />
    <Sign position={[0, -.16, 3.51]} size={[5.3, .32]} text="THE PEOPLE BETWEEN THE LINES" background={colors.tealDark} foreground={colors.cream} frame={colors.tealDark} />
    <Sign position={[4.8, 5.95, -3.15]} size={[3.6, 1.02]} text="MADE BY FRIENDS" subtext="BARCELONA  ·  EL PRAT" background={colors.cream} foreground={colors.tealDark} frame="#ae9571" />
    {[-6.55, 6.55].map(x => <group key={x} position={[x, 5.3, -2.98]}>
      <Block size={[.22, .58, .18]} color={colors.tealDark} />
      <Block position={[0, 0, .11]} size={[.15, .38, .09]} color="#f3d9a4" />
    </group>)}
    <pointLight position={[0, 5.7, 2.9]} color="#ffedce" intensity={12} distance={15} decay={2} />
  </group>;
}

// A generous sculptural recreation of the airport photo, tucked into the back
// of the cutaway. All four friends remain posed together beneath the jet.
export default function CreatorsNook({ upperX, upperY }) {
  return <group name="creators-nook" position={[upperX + terrace.offsetX, upperY + terrace.offsetY, terrace.z]} rotation={[0, Math.PI, 0]}>
    <CreatorsTerrace />
    <group name="creators-portrait" position={[-.8, 0, .25]} scale={terrace.figureScale}>
      <ConcreteArch />
      <StandingFriend position={[-.25, 1.55, -.34]} scale={.87} shirt="#514f43" pants="#48504a" hair="#796447" coat />
      <SeatedFriend /><RecliningFriend />
      {/* The foreground friend's larger scale echoes the photo's perspective. */}
      <StandingFriend position={[2.45, 0, .5]} scale={1.65} shirt="#5c8495" pants="#c7bda0" hair="#44372f" denim />
      <ModelPlane />
    </group>
    {[-4.68, -.48].map(x => <Rod key={x} from={[x, 8, -3.15]} to={[x - .55, 7.2, .95]} radius={.016} color="#89978b" />)}
  </group>;
}
