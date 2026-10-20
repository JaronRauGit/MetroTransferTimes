import { useLayoutEffect, useMemo, useRef } from 'react';
import { Matrix4, Shape } from 'three';
import { Block, FloorSlab, Rod, Sign, colors } from './Primitives.jsx';
import CreatorsPlane from './CreatorsPlane.jsx';
import SunsetBackdrop from './SunsetBackdrop.jsx';
import { creatorsDimensions as terrace, getCreatorsLayout } from './creatorsLayout.js';

const skin = '#d4aa83';

function Hand({ position }) {
  return <mesh position={position} castShadow><sphereGeometry args={[.071, 8, 6]} /><meshStandardMaterial color={skin} roughness={1} flatShading /></mesh>;
}

function Head({ hair = '#5a4334', glasses = false, beard = false, longHair = false, cropped = false, yaw = 0 }) {
  return <group name="portrait-head" rotation={[-.42, yaw, 0, 'YXZ']}>
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
    {beard && <mesh name="short-stubble">
      <sphereGeometry args={[.1918, 12, 5, .35, Math.PI - .7, 1.8, .8]} />
      <meshStandardMaterial color="#897968" transparent opacity={.48} depthWrite={false} roughness={1} flatShading />
    </mesh>}
    <Block position={[0, -.09, .166]} size={[.052, .012, .016]} color="#9b725a" castShadow={false} />
  </group>;
}

function Trainer({ position, color = '#4c5148' }) {
  return <group name="trainer" position={position}>
    <Block size={[.19, .12, .32]} color={color} />
    <Block position={[0, -.045, .015]} size={[.205, .035, .34]} color="#d9d5c3" />
    {[-.025, .025].map(z => <Block key={z} position={[0, .065, z + .035]} size={[.105, .009, .014]} color="#c5c7b8" castShadow={false} />)}
  </group>;
}

function Backpack({ grey = false }) {
  const strap = grey ? '#939e9c' : '#b09973';
  return <group name="backpack">
    <Block position={[0, 1.02, -.21]} size={[.39, .54, .14]} color={grey ? '#56615d' : '#ad936a'} />
    <Block position={[0, .91, -.3]} size={[.28, .22, .035]} color={grey ? '#6e7872' : '#baa47d'} />
    {[-1, 1].map(side => <group key={side} name="backpack-shoulder-strap">
      <Rod from={[side * .18, 1.28, -.23]} to={[side * .21, 1.37, .02]} radius={.025} color={strap} />
      <Rod from={[side * .21, 1.37, .02]} to={[side * .205, 1.17, .177]} radius={.025} color={strap} />
      <Rod from={[side * .205, 1.17, .177]} to={[side * .26, .97, .12]} radius={.025} color={strap} />
      <Rod from={[side * .26, .97, .12]} to={[side * .23, .89, -.18]} radius={.025} color={strap} />
    </group>)}
  </group>;
}

function Hoodie() {
  return <group name="zip-hoodie">
    <mesh position={[0, 1.27, -.145]} scale={[1.1, .9, .5]} castShadow>
      <sphereGeometry args={[.21, 10, 7]} /><meshStandardMaterial color="#253746" roughness={1} flatShading />
    </mesh>
    <mesh position={[0, 1.32, -.06]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <torusGeometry args={[.16, .045, 5, 12]} /><meshStandardMaterial color="#364b59" roughness={1} />
    </mesh>
    <Block position={[0, 1.02, .163]} size={[.014, .52, .016]} color="#91a2a5" />
    <Block position={[.012, 1.17, .18]} size={[.025, .045, .018]} color="#b4bdb4" />
    {[-1, 1].map(side => <group key={side}>
      <Rod from={[side * .1, 1.31, .165]} to={[side * .08, 1.1, .18]} radius={.009} color="#a4b1ad" />
      <Rod from={[side * .06, .86, .16]} to={[side * .19, .94, .16]} radius={.009} color="#203341" />
    </group>)}
  </group>;
}

function StandingFriend({ name, position, shirt, pants, hair, denim = false, coat = false, navy = false, scale = 1 }) {
  return <group name={name} position={position} scale={scale}>
    <Block position={[0, 1.03, 0]} size={[.48, .61, .3]} color={shirt} />
    <Block position={[0, .75, 0]} size={[.47, .065, .31]} color={navy ? '#25353d' : denim ? '#4d7382' : '#444c45'} />
    {!navy && <Block position={[0, 1.02, .158]} size={[.055, .51, .024]} color={denim ? '#6e909b' : '#616054'} />}
    {coat && <Block position={[0, 1.02, .177]} size={[.012, .52, .012]} color="#949b8f" />}
    {[-1, 1].map(side => <group key={side}>
      <Rod from={[side * .12, .78, 0]} to={[side * .14, .12, .03]} radius={.095} color={pants} />
      <Block position={[side * .15, .41, .095]} size={[.019, .43, .012]} color={denim ? '#b4aa8e' : '#424c44'} castShadow={false} />
      <Trainer position={[side * .14, .065, .1]} />
      {!navy && <Block position={[side * (coat ? .055 : .105), 1.29, .17]} size={[coat ? .105 : .15, .13, .04]} rotation={[0, 0, coat ? 0 : side * -.35]} color={denim ? '#85a2a8' : '#5e6053'} />}
      {coat ? <>
        <Rod from={[side * .27, 1.26, 0]} to={[side * .29, .96, .15]} radius={.083} color={shirt} />
        <Rod from={[side * .29, .96, .15]} to={[-side * .14, 1.01 + side * .025, .18]} radius={.077} color={shirt} />
        <Hand position={[-side * .14, 1.01 + side * .025, .19]} />
      </> : <>
        <Rod from={[side * .27, 1.26, 0]} to={[side * .36, .79, .055]} radius={.083} color={shirt} />
        <Rod from={[side * .36, .79, .055]} to={[side * .35, .66, .1]} radius={.065} color={skin} />
        <Block position={[side * .35, .82, .05]} size={[.16, .08, .18]} color={navy ? '#25353d' : '#7f9da4'} />
        <Hand position={[side * .35, .63, .1]} />
      </>}
    </group>)}
    {denim && <>
      {[-.15, .15].map(x => <group key={x}>
        <Block position={[x, 1.13, .17]} size={[.11, .13, .025]} color="#799ca6" />
        <Block position={[x, 1.18, .188]} size={[.12, .026, .02]} color="#9ab0ae" />
        <Block position={[x, 1.15, .204]} size={[.018, .018, .012]} color="#c3b68b" castShadow={false} />
      </group>)}
      {[.85, .96, 1.07, 1.18].map(y => <Block key={y} position={[.013, y, .183]} size={[.017, .017, .012]} color="#c3b68b" castShadow={false} />)}
    </>}
    {navy && <>
      <Hoodie />
      <Block position={[.115, 1.17, .16]} size={[.065, .043, .012]} color="#b5b9a7" castShadow={false} />
    </>}
    {(coat || denim) && <Backpack grey={coat} />}
    <group position={[0, 1.54, 0]}><Head hair={hair} longHair={coat} cropped={denim} beard={navy} /></group>
  </group>;
}

function ChairFriend() {
  // Match the standing friends' proportions, bending the knees to keep both
  // feet on the compact seat rather than shrinking the whole person to fit.
  return <group name="creator-scarf" position={[0, .7475, .4]} scale={1.3}>
    <group position={[.34, .3, 0]} rotation={[0, 0, -.65]}>
      <Block size={[.48, .61, .34]} color="#8f6d4f" />
      {[-.2, -.15, -.1, -.05, 0, .05, .1, .15, .2].map(x => <Block key={x} position={[x, 0, .174]} size={[.007, .54, .008]} color="#a18462" castShadow={false} />)}
      <Block position={[0, .02, .18]} size={[.07, .55, .025]} color="#795c44" />
      {[-.13, .13].map(x => <Block key={x} position={[x, .13, .18]} size={[.16, .2, .045]} rotation={[0, 0, x > 0 ? -.16 : .16]} color="#a18462" />)}
      <Block position={[.15, -.14, .19]} size={[.13, .1, .04]} color="#9d7c58" />
    </group>
    <group position={[.65, .76, .03]} rotation={[0, 0, -.22]}><Head hair="#574437" glasses yaw={-Math.PI / 2} /></group>
    <Block position={[.48, .56, .17]} size={[.37, .17, .2]} color="#60766a" />
    <Block position={[.32, .39, .22]} size={[.13, .27, .06]} rotation={[0, 0, -.5]} color="#6f8473" />
    {[-1, 1].map(side => <group key={side}>
      <Rod from={[.08, .13, side * .11]} to={[-.35, .25, .15 + side * .12]} radius={.11} color="#7f8978" />
      <Rod from={[-.35, .25, .15 + side * .12]} to={[-.7, .02, .22 + side * .14]} radius={.095} color="#7f8978" />
      <Block position={[-.27, .34, .15 + side * .12]} size={[.2, .04, .15]} color="#929b86" />
      <group position={[-.76, 0, .22 + side * .14]} rotation={[0, -Math.PI / 2, 0]}><Trainer position={[0, 0, 0]} color="#465a50" /></group>
    </group>)}
    {[-1, 1].map(side => <group key={side} name={side < 0 ? 'seated-left-arm' : 'seated-right-arm'}>
      <Rod from={[.58, .51, side * .2]} to={[.37, .22, side * .26]} radius={.08} color="#8f6d4f" />
      <Rod from={[.37, .22, side * .26]} to={[.02, .27, side * .29]} radius={.065} color="#8f6d4f" />
      <Block position={[.07, .263, side * .286]} size={[.065, .14, .14]} color="#795c44" />
      <Hand position={[.02, .27, side * .29]} />
    </group>)}
  </group>;
}

function StoneChair() {
  const seat = useMemo(() => {
    const shape = new Shape().moveTo(-1.35, 0).lineTo(-.75, 0).lineTo(-.75, .08);
    shape.absarc(-.35, .08, .4, Math.PI, 0, true);
    return shape.lineTo(.05, 0).lineTo(1.45, 0).lineTo(1.45, .65).lineTo(-1.35, .65).closePath();
  }, []);
  const back = useMemo(() => new Shape().moveTo(.5, .65).lineTo(1.12, 1.47).lineTo(1.43, 1.33).lineTo(.84, .65).closePath(), []);
  const aggregate = useRef();
  const flecks = useMemo(() => {
    const pieces = [];
    for (let i = 0; i < 150; i++) {
      const x = -1.31 + ((i * .6180339) % 1) * 2.72;
      const y = .035 + ((i * .4142136) % 1) * .58;
      const opening = Math.abs(x + .35) < .42 && y < .1 + Math.sqrt(Math.max(0, .42 ** 2 - (x + .35) ** 2));
      if (!opening) pieces.push([x, y, 1.172, .009 + (i % 3) * .005]);
    }
    return pieces;
  }, []);
  useLayoutEffect(() => {
    const matrix = new Matrix4();
    flecks.forEach(([x, y, z, size], i) => aggregate.current.setMatrixAt(i, matrix.makeScale(size, size * .65, .006).setPosition(x, y, z)));
    aggregate.current.instanceMatrix.needsUpdate = true;
  }, [flecks]);
  return <group name="stone-chair">
    {[seat, back].map((shape, i) => <mesh key={i} position={[0, 0, -.5]} castShadow receiveShadow>
      <extrudeGeometry args={[shape, { depth: 1.65, steps: 1, curveSegments: 18, bevelEnabled: true, bevelSize: .016, bevelThickness: .016, bevelSegments: 1 }]} />
      <meshStandardMaterial color={i ? '#bcbcae' : '#c2bfae'} roughness={1} />
    </mesh>)}
    <instancedMesh ref={aggregate} args={[undefined, undefined, flecks.length]}><boxGeometry /><meshStandardMaterial color="#a4a591" roughness={1} /></instancedMesh>
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
    <Block position={[0, -.16, 4.13]} size={[14.8, .33, .13]} color="#c6b898" />
    <SunsetBackdrop />
    {[-6, 0, 6].map(x => <Rod key={x} from={[x, -1.5, -3.92]} to={[x, -.39, 3.6]} radius={.085} color="#899480" />)}
    {Array.from({ length: 15 }, (_, i) => <Block key={i} position={[-7 + i, .008, 0]} size={[.018, .012, 7.98]} color="#ccc8b1" castShadow={false} />)}
    {[-3.3, -2.2, -1.1, 0, 1.1, 2.2, 3.3].map(z => <Block key={z} position={[0, .008, z]} size={[14.5, .012, .018]} color="#ccc8b1" castShadow={false} />)}
    {[-7.05, 7.05].map(x => <group key={x}>
      {[.12, 1.1].map(y => <Rod key={y} from={[x, y, -3.5]} to={[x, y, 3.85]} radius={.04} color={colors.tealDark} />)}
      {[-3.5, -1.05, 1.4, 3.85].map(z => <Rod key={z} from={[x, 0, z]} to={[x, 1.1, z]} radius={.04} color={colors.tealDark} />)}
    </group>)}
    <TerracePlanter x={-6.25} /><TerracePlanter x={6.25} />
    <group name="creators-caption">
      <Block position={[0, -.2, 4.19]} size={[9.1, .73, .14]} color="#c6b898" />
      <Sign position={[0, -.2, 4.29]} size={[8.8, .58]} text="PLANESPOTTING WITH THE BEST" background={colors.tealDark} foreground={colors.cream} frame={colors.tealDark} />
    </group>
    <Sign position={[4.8, 6.95, -3.7]} size={[3.6, .75]} text="MADE BY FRIENDS" subtext="BARCELONA  ·  EL PRAT" background={colors.cream} foreground={colors.tealDark} frame="#ae9571" />
    {[-6.55, 6.55].map(x => <group key={x} position={[x, 5.3, -3.62]}>
      <Block size={[.22, .58, .18]} color={colors.tealDark} />
      <Block position={[0, 0, .11]} size={[.15, .38, .09]} color="#f3d9a4" />
    </group>)}
    <pointLight position={[0, 5.7, 2.9]} color="#ffedce" intensity={12} distance={15} decay={2} />
  </group>;
}

// The original was shot from below: one friend reclines on the chair and the
// other three stand behind it, with an oversized aircraft passing overhead.
export default function CreatorsNook({ layout }) {
  const l = getCreatorsLayout(layout);
  return <group name="creators-nook" position={[l.x, l.y, l.z]} rotation={[0, Math.PI, 0]}>
    <CreatorsTerrace />
    <group name="creators-portrait" position={[.35, 0, -.1]} scale={l.figureScale}>
      {/* Local +X is the backrest; this turn points it toward the rear wall. */}
      <group name="creators-chair-group" position={[-.5, 0, .6]} rotation={[0, Math.PI / 2, 0]}>
        <StoneChair /><ChairFriend />
      </group>
      <StandingFriend name="creator-navy" position={[-1.35, 0, -.9]} scale={1.22} shirt="#2b3d50" pants="#788180" hair="#66503d" navy />
      <StandingFriend name="creator-coat" position={[-.45, 0, -1.25]} scale={1.3} shirt="#514f43" pants="#48504a" hair="#796447" coat />
      <StandingFriend name="creator-denim" position={[1.15, 0, -1.05]} scale={1.5} shirt="#5c8495" pants="#c7bda0" hair="#44372f" denim />
    </group>
    <CreatorsPlane position={l.aircraftPosition} rotation={l.aircraftRotation} scale={l.aircraftScale} />
  </group>;
}
