import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Block, Rod, Sign, colors } from './Primitives.jsx';

export function Building({ position, width, depth, height, color = colors.cream, roof = colors.terracotta, flat = false }) {
  const [x, ground, z] = position;
  const front = z + depth / 2;
  return <group>
    <Block position={[x, ground + height / 2, z]} size={[width, height, depth]} color={color} />
    <Block position={[x, ground + height + .07, z]} size={[width + .16, .14, depth + .16]} color={flat ? colors.stone : roof} />
    {flat ? <>
      <Block position={[x, ground + height + .26, z - depth / 2]} size={[width + .12, .38, .15]} color={roof} />
      <Block position={[x, ground + height + .26, z + depth / 2]} size={[width + .12, .38, .15]} color={roof} />
      <Block position={[x - width / 2, ground + height + .26, z]} size={[.15, .38, depth]} color={roof} />
      <Block position={[x + width / 2, ground + height + .26, z]} size={[.15, .38, depth]} color={roof} />
    </> : <mesh position={[x, ground + height + .48, z]} rotation={[0, Math.PI / 4, 0]} scale={[width * .72, .78, depth * .72]} castShadow receiveShadow>
      <coneGeometry args={[1, 1, 4]} /><meshStandardMaterial color={roof} flatShading roughness={.9} />
    </mesh>}
    {[-.28, .28].map((offset, index) => <group key={index}>
      {[.36, .7].map((level, levelIndex) => <group key={levelIndex}>
        <Block position={[x + offset * width, ground + height * level, front + .035]} size={[.37, .49, .075]} color={colors.tealDark} />
        <Block position={[x + offset * width, ground + height * level + .015, front + .083]} size={[.27, .39, .025]} color={colors.glass} roughness={.26} />
        <Block position={[x + offset * width, ground + height * level - .3, front + .2]} size={[.65, .065, .42]} color={colors.stone} />
        <Rod from={[x + offset * width - .28, ground + height * level - .05, front + .39]} to={[x + offset * width + .28, ground + height * level - .05, front + .39]} radius={.022} color={colors.rail} />
      </group>)}
    </group>)}
    <Block position={[x + width / 2 + .025, ground + height * .49, z]} size={[.075, .49, .53]} color={colors.tealDark} />
    <Block position={[x + width / 2 + .065, ground + height * .49, z]} size={[.025, .38, .42]} color={colors.glass} roughness={.28} />
  </group>;
}

export function LowPolyTree({ position, hue = colors.olive, scale = 1 }) {
  const [x, y, z] = position;
  return <group position={[x, y, z]} scale={scale}>
    <mesh position={[0, .53, 0]} castShadow><cylinderGeometry args={[.09, .15, 1.05, 6]} /><meshStandardMaterial color="#7e654c" roughness={1} /></mesh>
    <mesh position={[0, 1.38, 0]} castShadow><dodecahedronGeometry args={[.65, 0]} /><meshStandardMaterial color={hue} flatShading roughness={1} /></mesh>
    <mesh position={[.3, 1.1, -.2]} castShadow><dodecahedronGeometry args={[.46, 0]} /><meshStandardMaterial color={colors.mint} flatShading roughness={1} /></mesh>
  </group>;
}

export function Palm({ position, scale = 1 }) {
  return <group position={position} scale={scale}>
    <mesh position={[0, 1.05, 0]} rotation={[0, 0, -.1]} castShadow><cylinderGeometry args={[.075, .13, 2.1, 7]} /><meshStandardMaterial color="#9a7357" roughness={1} /></mesh>
    {[0, 1, 2, 3, 4, 5].map(index => {
      const angle = index * Math.PI / 3;
      return <mesh key={index} position={[Math.cos(angle) * .55, 2.05, Math.sin(angle) * .55]} rotation={[Math.sin(angle) * .68, 0, -Math.cos(angle) * .68]} castShadow>
        <coneGeometry args={[.34, 1.35, 4]} /><meshStandardMaterial color={index % 2 ? '#6e966c' : '#4e8267'} flatShading side={2} roughness={1} />
      </mesh>;
    })}
  </group>;
}

export function Staircase({ x, topY, bottomY, topZ, bottomZ, width = 1.55, steps = 12, color = colors.limestone }) {
  const rise = topY - bottomY;
  const run = bottomZ - topZ;
  const length = Math.hypot(rise, run);
  return <group>
    <Block position={[x, (topY + bottomY) / 2 - .13, (topZ + bottomZ) / 2]} size={[width + .06, .18, length]} rotation={[Math.atan2(rise, run), 0, 0]} color="#b7aa96" />
    {Array.from({ length: steps }, (_, i) => {
      const t = (i + .5) / steps;
      return <Block key={i} position={[x, topY - (i + 1) * rise / steps + .035, topZ + t * run]} size={[width, .1, run / steps + .025]} color={i % 2 ? color : '#e4cfb0'} />;
    })}
    {[-1, 1].map(side => {
      const edge = x + side * (width / 2 + .09);
      return <group key={side}>
        <Rod from={[edge, topY + .68, topZ]} to={[edge, bottomY + .68, bottomZ]} radius={.037} color={colors.tealDark} />
        <Rod from={[edge, topY + .07, topZ]} to={[edge, bottomY + .07, bottomZ]} radius={.025} color={colors.metal} />
        {[0, .5, 1].map(t => <Rod key={t} from={[edge, topY - t * rise + .07, topZ + t * run]} to={[edge, topY - t * rise + .68, topZ + t * run]} radius={.026} color={colors.metal} />)}
      </group>;
    })}
  </group>;
}

export function StaircaseAlongX({ topX, bottomX, yTop, yBottom, z, width = 1.52, steps = 18 }) {
  const run = bottomX - topX;
  const rise = yTop - yBottom;
  return <group>
    <Block position={[(topX + bottomX) / 2, (yTop + yBottom) / 2 - .13, z]} size={[Math.hypot(run, rise), .2, width + .06]} rotation={[0, 0, -Math.atan2(rise, run)]} color="#b7a891" />
    {Array.from({ length: steps }, (_, index) => {
      const t = (index + .5) / steps;
      return <Block key={index} position={[topX + t * run, yTop - (index + 1) * rise / steps + .04, z]} size={[run / steps + .02, .11, width]} color={index % 2 ? '#f0dec1' : '#e2caa8'} />;
    })}
    {[-1, 1].map(side => {
      const edgeZ = z + side * (width / 2 + .1);
      return <group key={side}>
        <Rod from={[topX, yTop + .65, edgeZ]} to={[bottomX, yBottom + .65, edgeZ]} radius={.044} color={colors.tealDark} />
        {[0, .5, 1].map(t => <Rod key={t} from={[topX + t * run, yTop - t * rise + .1, edgeZ]} to={[topX + t * run, yTop - t * rise + .65, edgeZ]} radius={.032} color={colors.metal} />)}
      </group>;
    })}
  </group>;
}

function MovingTreads({ x, topY, bottomY, topZ, bottomZ, count, reducedMotion }) {
  const treads = useRef([]);
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const flow = clock.getElapsedTime() * .15;
    treads.current.forEach((mesh, i) => {
      if (!mesh) return;
      const t = ((i / count + flow) % 1);
      mesh.position.set(x, topY + (bottomY - topY) * t + .055, topZ + (bottomZ - topZ) * t);
    });
  });
  return <>{Array.from({ length: count }, (_, i) => {
    const t = i / count;
    return <Block key={i} ref={node => { treads.current[i] = node; }} position={[x, topY + (bottomY - topY) * t + .055, topZ + (bottomZ - topZ) * t]} size={[1.28, .055, .14]} color={i % 2 ? '#b5c8bd' : '#809f9a'} castShadow={false} />;
  })}</>;
}

export function Escalator({ x = 2.55, topY = .58, bottomY = -1.42, topZ = 1.38, bottomZ = 3.05, treadCount = 16, reducedMotion }) {
  const rise = topY - bottomY;
  const run = bottomZ - topZ;
  const length = Math.hypot(rise, run);
  const angle = Math.atan2(rise, run);
  return <group>
    <Block position={[x, (topY + bottomY) / 2 - .06, (topZ + bottomZ) / 2]} size={[1.75, .22, length]} rotation={[angle, 0, 0]} color={colors.tealDark} />
    <MovingTreads x={x} topY={topY} bottomY={bottomY} topZ={topZ} bottomZ={bottomZ} count={treadCount} reducedMotion={reducedMotion} />
    {[-1, 1].map(side => {
      const edge = x + side * .87;
      return <group key={side}>
        <Rod from={[edge, topY + .58, topZ]} to={[edge, bottomY + .58, bottomZ]} radius={.055} color={colors.metal} />
        <Rod from={[edge, topY + .11, topZ]} to={[edge, bottomY + .11, bottomZ]} radius={.038} color={colors.teal} />
        {[0, .5, 1].map(t => <Rod key={t} from={[edge, topY - t * rise + .1, topZ + t * run]} to={[edge, topY - t * rise + .58, topZ + t * run]} radius={.034} color={colors.metal} />)}
      </group>;
    })}
  </group>;
}

export function MovingWalkway({ position = [.15, .65, -.4], length = 4.7, reducedMotion }) {
  const slats = useRef([]);
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const advance = clock.getElapsedTime() * .68;
    slats.current.forEach((mesh, i) => {
      if (mesh) mesh.position.x = -length / 2 + ((i / 18 * length + advance) % length);
    });
  });
  return <group position={position}>
    <Block position={[0, -.09, 0]} size={[length + .38, .16, 1.25]} color={colors.tealDark} />
    <Block position={[0, .005, 0]} size={[length, .07, 1.03]} color="#698d90" roughness={.5} />
    {Array.from({ length: 18 }, (_, i) => <Block key={i} ref={node => { slats.current[i] = node; }} position={[-length / 2 + i / 18 * length, .05, 0]} size={[.075, .015, .9]} color="#bfd2c4" castShadow={false} />)}
    {[-.68, .68].map(z => <group key={z}>
      <Block position={[0, .31, z]} size={[length + .3, .44, .045]} color="#b1d0c8" transparent opacity={.42} castShadow={false} />
      <Block position={[0, .55, z]} size={[length + .35, .07, .095]} color={colors.metal} />
      {[-length / 2, 0, length / 2].map(x => <Rod key={x} from={[x, .04, z]} to={[x, .55, z]} radius={.025} color={colors.metal} />)}
    </group>)}
    <Block position={[-length / 2 - .16, .035, 0]} size={[.28, .08, 1.3]} color={colors.stone} />
    <Block position={[length / 2 + .16, .035, 0]} size={[.28, .08, 1.3]} color={colors.stone} />
  </group>;
}

export function MetroEntrance({ position = [-4.4, 2.32, -1.8] }) {
  const [x, y, z] = position;
  return <group>
    <Block position={[x - 1.05, y + .36, z]} size={[.15, .72, 1.8]} color={colors.stone} />
    <Block position={[x + 1.05, y + .36, z]} size={[.15, .72, 1.8]} color={colors.stone} />
    <Rod from={[x - 1.05, y + .8, z - .85]} to={[x - 1.05, y + .8, z + .85]} radius={.04} color={colors.tealDark} />
    <Rod from={[x + 1.05, y + .8, z - .85]} to={[x + 1.05, y + .8, z + .85]} radius={.04} color={colors.tealDark} />
    <Block position={[x - 1.25, y + .95, z - .75]} size={[.09, 1.9, .09]} color={colors.metal} />
    <Sign position={[x - 1.25, y + 2.03, z - .7]} size={[.64, .64]} text="M" background={colors.coral} foreground={colors.warmWhite} frame={colors.coral} />
  </group>;
}

export function Bench({ position, rotation = [0, 0, 0] }) {
  return <group position={position} rotation={rotation}>
    <Block position={[0, .44, 0]} size={[1.25, .12, .48]} color={colors.terracotta} />
    <Block position={[0, .75, -.2]} size={[1.25, .52, .1]} color={colors.terracotta} />
    {[-.47, .47].map(x => <Block key={x} position={[x, .2, 0]} size={[.09, .4, .35]} color={colors.metal} />)}
  </group>;
}

export function Lamp({ position }) {
  return <group position={position}>
    <mesh position={[0, 1.48, 0]} castShadow><cylinderGeometry args={[.045, .065, 2.96, 7]} /><meshStandardMaterial color={colors.metal} roughness={.75} /></mesh>
    <mesh position={[0, 3.06, 0]}><sphereGeometry args={[.18, 8, 6]} /><meshStandardMaterial color="#fff2cb" emissive="#e8c482" emissiveIntensity={.6} /></mesh>
    <mesh position={[0, 3.23, 0]} castShadow><coneGeometry args={[.31, .18, 8]} /><meshStandardMaterial color={colors.tealDark} /></mesh>
  </group>;
}
