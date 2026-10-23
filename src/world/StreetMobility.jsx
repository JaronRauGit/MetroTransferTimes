import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { Block, Rod } from './Primitives.jsx';
import { useWorldCompact, useWorldNight } from './WorldAppearance.jsx';
import LocalLight from './LocalLight.jsx';
import { lightingQuality, surfaceResponse } from './lighting.js';
import Person from './Person.jsx';
import { useWorldMotion } from './WorldMotion.jsx';
import { getStreetVehiclePath, getStreetWalkingPath, sampleStreetTrip } from './streetPaths.js';

function StreetTrip({ path, offset = 0, rest = 3, reducedMotion, bicycle = false, car = false, children }) {
  const root = useRef(), materials = useRef([]);
  const motion = useWorldMotion();
  useLayoutEffect(() => {
    materials.current = [];
    root.current.traverse(object => {
      if (!object.isMesh) return;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        materials.current.push([material, material.opacity]); material.transparent = true;
      }
    });
  }, []);
  useFrame(() => {
    const sample = sampleStreetTrip(path, reducedMotion ? path.duration * .4 : motion.current.time, offset, rest);
    root.current.visible = reducedMotion || sample.visible;
    root.current.position.set(...sample.p);
    root.current.rotation.y = bicycle || car ? sample.dx < 0 ? Math.PI : 0 : Math.atan2(sample.dx, sample.dz);
    const opacity = reducedMotion ? 1 : sample.opacity;
    for (const [material, base] of materials.current) material.opacity = base * opacity;
    root.current.userData.tripTime = sample.time;
    root.current.userData.moving = sample.moving && sample.visible;
    root.current.userData.lightOpacity = opacity;
  }, -.9);
  return <group ref={root} name={bicycle ? 'street-cyclist' : car ? 'street-car' : 'street-pedestrian'}>{children}</group>;
}

function StreetWalker({ layout, variant, reverse, lane, offset, reducedMotion }) {
  const path = useMemo(() => getStreetWalkingPath(layout, { reverse, lane, pause: variant === 1 }), [layout, reverse, lane, variant]);
  const movement = useRef({ time: 0, moving: true });
  const clock = useWorldMotion();
  useFrame(() => {
    const sample = sampleStreetTrip(path, reducedMotion ? path.duration * .4 : clock.current.time, offset);
    movement.current = { time: sample.time, moving: sample.moving && sample.visible };
  }, -.8);
  const shirts = ['#b67b65', '#6f9690', '#b5a273', '#7d93a6', '#9a889c'];
  const skins = ['#c6926c', '#d7af89', '#80543c', '#ad7857', '#d3a17c'];
  return <StreetTrip path={path} offset={offset} reducedMotion={reducedMotion}><group scale={.85 + variant % 3 * .035}><Person shirt={shirts[variant]} skin={skins[variant]} variant={variant} movement={movement} reducedMotion={reducedMotion} /></group></StreetTrip>;
}

function BicycleWheel({ x, spin }) {
  return <group ref={spin} position={[x, .23, 0]}>
    <mesh castShadow><torusGeometry args={[.215, .026, 5, 14]} /><meshStandardMaterial color="#52615b" roughness={1} /></mesh>
    <Rod from={[-.19, 0, 0]} to={[.19, 0, 0]} radius={.012} color="#b7bcb0" />
    <Rod from={[0, -.19, 0]} to={[0, .19, 0]} radius={.012} color="#b7bcb0" />
  </group>;
}

function Bicycle({ colour, variant = 0, reducedMotion }) {
  const night = useWorldNight(), compact = useWorldCompact();
  const wheels = useRef([]), legs = useRef([]);
  const motion = useWorldMotion();
  useFrame(() => {
    const time = reducedMotion ? 0 : motion.current.time;
    wheels.current.forEach(wheel => { if (wheel) wheel.rotation.z = -time * 7; });
    legs.current.forEach((leg, i) => { if (leg) leg.rotation.z = Math.sin(time * 7 + i * Math.PI) * .24; });
  });
  return <group>
    {[-.43, .43].map((x, i) => <BicycleWheel key={x} x={x} spin={node => { wheels.current[i] = node; }} />)}
    <Rod from={[-.43, .23, 0]} to={[-.13, .61, 0]} radius={.025} color={colour} />
    <Rod from={[-.13, .61, 0]} to={[-.02, .27, 0]} radius={.025} color={colour} />
    <Rod from={[-.02, .27, 0]} to={[-.43, .23, 0]} radius={.025} color={colour} />
    <Rod from={[-.13, .61, 0]} to={[.31, .6, 0]} radius={.025} color={colour} />
    <Rod from={[.31, .6, 0]} to={[-.02, .27, 0]} radius={.025} color={colour} />
    <Rod from={[.43, .23, 0]} to={[.3, .76, 0]} radius={.023} color="#647f76" />
    <Rod from={[.3, .76, -.18]} to={[.3, .76, .18]} radius={.023} color="#526e64" />
    <Block position={[-.15, .65, 0]} size={[.22, .055, .14]} color="#5a6c60" />
    <Block position={[.35, .72, 0]} size={[.065, .055, .075]} color="#f3e6cc" emissive="#fff0c4" emissiveIntensity={night ? 2.3 : .05} castShadow={false} />
    <Block position={[-.44, .57, 0]} size={[.035, .045, .055]} color="#c07562" emissive="#f55c38" emissiveIntensity={night ? 1.2 : 0} castShadow={false} />
    {lightingQuality(compact).bicycleSpills && <LocalLight name="bicycle-headlight" position={[.39, .72, 0]} target={[1.15, -.72, 0]} reach={1.9} power={1.6} angle={.43} color="#ffe9bc" />}
    <group position={[-.11, .85, 0]} rotation={[0, 0, -.36]}><mesh castShadow><cylinderGeometry args={[.12, .14, .34, 6]} /><meshStandardMaterial color={variant ? '#d0ad6f' : '#6b9991'} roughness={1} flatShading /></mesh></group>
    <mesh position={[.08, 1.12, 0]} castShadow><sphereGeometry args={[.13, 9, 6]} /><meshStandardMaterial color={variant ? '#8d5f45' : '#c99974'} roughness={1} flatShading /></mesh>
    <mesh position={[.07, 1.2, 0]} scale={[1.1, .65, 1.1]} castShadow><sphereGeometry args={[.137, 8, 6]} /><meshStandardMaterial color={variant ? '#6e9697' : '#e3d1a5'} roughness={1} flatShading /></mesh>
    {[-1, 1].map((side, i) => <group key={side}>
      <Rod from={[-.03, .98, side * .12]} to={[.31, .77, side * .16]} radius={.043} color={variant ? '#d0ad6f' : '#6b9991'} />
      <Block position={[.31, .77, side * .16]} size={[.075, .065, .075]} color="#c99974" />
      <group position={[-.13, .67, side * .075]} ref={node => { legs.current[i] = node; }}>
        <Rod from={[0, 0, 0]} to={[.19, -.24, 0]} radius={.05} color="#596c70" />
        <Rod from={[.19, -.24, 0]} to={[-.04, -.4, 0]} radius={.042} color="#596c70" />
        <Block position={[-.01, -.4, 0]} size={[.15, .055, .09]} color="#ece5d0" />
      </group>
    </group>)}
    {variant === 1 && <><Block position={[.46, .71, 0]} size={[.28, .2, .31]} color="#b7aa80" /><Block position={[.46, .82, 0]} size={[.29, .025, .32]} color="#d5cba9" /></>}
  </group>;
}

function MicroCar() {
  const night = useWorldNight();
  return <group>
    <RoundedBox args={[1.2, .24, .55]} radius={.06} smoothness={2} position={[0, .24, 0]} castShadow><meshStandardMaterial color="#aebdb1" roughness={.75} /></RoundedBox>
    <RoundedBox args={[.64, .31, .47]} radius={.06} smoothness={2} position={[-.07, .48, 0]} castShadow><meshStandardMaterial color="#c9d0bc" roughness={.8} /></RoundedBox>
    {[-1, 1].map(side => <group key={side}>
      <Block position={[-.07, .49, side * .239]} size={[.44, .17, .014]} color="#6d908e" {...surfaceResponse.glass} />
      {[-.37, .38].map(x => <mesh key={x} position={[x, .14, side * .275]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.112, .112, .065, 10]} /><meshStandardMaterial color="#5f6961" roughness={1} /></mesh>)}
      <Block position={[.6, .29, side * .18]} size={[.02, .075, .13]} color="#f6e3a6" emissive="#ffe2a1" emissiveIntensity={night ? 2.4 : .04} />
      <Block position={[-.6, .29, side * .18]} size={[.02, .07, .1]} color="#b77c67" emissive="#e85231" emissiveIntensity={night ? 1.1 : 0} />
    </group>)}
    <Block position={[.26, .48, 0]} size={[.015, .17, .35]} color="#6d908e" {...surfaceResponse.glass} />
    <LocalLight name="car-headlights" position={[.64, .29, 0]} target={[1.6, -.29, 0]} reach={2.6} power={2.8} angle={.48} color="#ffe5b3" />
  </group>;
}

export default function StreetMobility({ layout, reducedMotion }) {
  const bikes = useMemo(() => [getStreetVehiclePath(layout, { bicycle: true }), getStreetVehiclePath(layout, { bicycle: true, reverse: true })], [layout]);
  const car = useMemo(() => getStreetVehiclePath(layout, { bicycle: false }), [layout]);
  const width = layout.streetMaxX - layout.streetMinX, center = (layout.streetMaxX + layout.streetMinX) / 2;
  return <group name="street-mobility">
    <Block position={[center, 3.566, -3.12]} size={[width, .012, .88]} color="#afc0a0" castShadow={false} />
    {Array.from({ length: Math.ceil(width / 3) }, (_, i) => <Block key={i} position={[layout.streetMinX + .7 + i * 3, 3.575, -3.12]} size={[.5, .012, .025]} color="#e6ead1" castShadow={false} />)}
    {[0, 1, 2, 3, 4].map(i => <StreetWalker key={i} layout={layout} variant={i} reverse={i % 2 === 1} lane={i % 2} offset={i * 7.3} reducedMotion={reducedMotion} />)}
    {bikes.map((path, i) => <StreetTrip key={i} path={path} offset={i * 11 + 4} rest={5} bicycle reducedMotion={reducedMotion}><Bicycle colour={i ? '#7f9f8d' : '#c87961'} variant={i} reducedMotion={reducedMotion} /></StreetTrip>)}
    <StreetTrip path={car} offset={17} rest={55} car reducedMotion={reducedMotion}><MicroCar /></StreetTrip>
  </group>;
}
