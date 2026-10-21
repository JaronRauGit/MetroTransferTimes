import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Block } from './Primitives.jsx';
import { useWorldMotion } from './WorldMotion.jsx';

// One articulated miniature shared by commuters and the featured traveller.
export default function Person({ shirt = '#c47a62', skin = '#c99572', trousers = '#405b66', hair = '#49382e', variant = 0, movement, hero = false, reducedMotion }) {
  const torso = useRef(), head = useRef(), limbs = useRef([]);
  const motion = useWorldMotion();
  useFrame(() => {
    const state = movement?.current ?? { time: motion.current.time, moving: false };
    const t = (reducedMotion ? 0 : state.time) + variant * 1.7;
    const walking = state.moving && !reducedMotion;
    const stride = walking ? Math.sin(t * 11) : 0;
    if (torso.current) {
      torso.current.position.y = walking ? Math.abs(Math.sin(t * 11)) * .025 : 0;
      torso.current.rotation.z = walking ? Math.sin(t * 5.5) * .025 : Math.sin(t * .7) * .012;
    }
    if (head.current) head.current.rotation.y = walking ? Math.sin(t * 2) * .06 : Math.sin(t * .8) * .3;
    limbs.current.forEach((limb, i) => {
      if (!limb) return;
      const sign = i % 2 ? -1 : 1;
      limb.rotation.x = walking ? stride * sign * (i < 2 ? .45 : -.36) : i === 3 && variant % 3 === 1 ? -.6 + Math.sin(t) * .07 : .04;
    });
  });
  return <group ref={torso}>
    <group ref={head} position={[0, .85, 0]}>
      <mesh castShadow><sphereGeometry args={[.15, 9, 7]} /><meshStandardMaterial color={skin} roughness={1} flatShading /></mesh>
      <mesh position={[0, .085, -.025]} scale={[1.02, .55, 1.02]} castShadow><sphereGeometry args={[.154, 8, 6]} /><meshStandardMaterial color={hair} roughness={1} flatShading /></mesh>
      {[-1, 1].map(side => <Block key={side} position={[side * .052, .015, .139]} size={[.018, .018, .014]} color="#3a3531" castShadow={false} />)}
      <Block position={[0, -.025, .15]} size={[.028, .035, .032]} color={skin} />
      {variant % 4 === 2 && <Block position={[0, .14, .025]} size={[.28, .045, .32]} color={shirt} />}
      {variant % 4 === 3 && <mesh position={[0, -.045, -.12]} scale={[1, 1.35, .7]} castShadow><sphereGeometry args={[.14, 7, 5]} /><meshStandardMaterial color={hair} roughness={1} /></mesh>}
    </group>
    <mesh position={[0, .51, 0]} castShadow><cylinderGeometry args={[.16, .19, .43, 6]} /><meshStandardMaterial color={shirt} emissive={hero ? '#c05b32' : '#000000'} emissiveIntensity={.12} roughness={1} flatShading /></mesh>
    <Block position={[0, .5, .166]} size={[.018, .33, .015]} color={hero ? '#ffe6bc' : shirt} castShadow={false} />
    {[-1, 1].map((side, i) => <group key={side}>
      <group position={[side * .09, .3, 0]} ref={value => { limbs.current[i] = value; }}>
        <Block position={[0, -.12, 0]} size={[.11, .26, .13]} color={trousers} />
        <Block position={[0, -.255, .04]} size={[.135, .07, .22]} color={hero ? '#f9edd7' : '#4a5350'} />
      </group>
      <group position={[side * .2, .66, 0]} ref={value => { limbs.current[i + 2] = value; }}>
        <Block position={[0, -.1, 0]} size={[.1, .23, .13]} color={shirt} />
        <Block position={[0, -.23, .015]} size={[.08, .1, .09]} color={skin} />
        {i === 1 && variant % 3 === 1 && <Block position={[0, -.29, .055]} size={[.07, .1, .018]} color="#364b4d" />}
      </group>
    </group>)}
    {(hero || variant % 2 === 0) && <>
      <Block position={[0, .5, -.2]} size={[.25, .3, .14]} color={hero ? '#397b80' : '#9a8b69'} />
      {[-1, 1].map(side => <Block key={side} position={[side * .105, .58, .14]} size={[.025, .22, .025]} color={hero ? '#4a9290' : '#b6aa8f'} />)}
    </>}
  </group>;
}
