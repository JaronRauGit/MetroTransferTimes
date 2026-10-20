import { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { EffectComposer, N8AO } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Block, FloorSlab, Rod, Sign, colors } from './Primitives.jsx';
import { Building, LowPolyTree, Palm, Staircase, Escalator, MovingWalkway, MetroEntrance, Bench, Lamp } from './Architecture.jsx';
import { Traveller, Planter, Turnstiles } from './Details.jsx';
import { getStationLayout } from './stationLayout.js';
import Train from './Train.jsx';

const smoothstep = (a, b, value) => {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function CameraRig({ depth, span, reducedMotion }) {
  const { camera, size } = useThree();
  const target = useRef(new THREE.Vector3());
  useFrame((_, delta) => {
    const mobile = size.width < 700;
    const aimX = mobile ? (depth - .48) * span * .72 : (depth - .47) * span * .25 + 1.2;
    const aimY = 1.72 - depth * 3.1 - (mobile ? smoothstep(0, .7, depth) * 7.1 : 0);
    const aimZ = depth * (mobile ? 4.5 : 2.1);
    const fit = mobile ? size.width / 16.7 : Math.min(size.width / (span + 22), size.height / 19.6);
    const desiredZoom = fit * (1 + depth * (mobile ? .07 : .025));
    const step = reducedMotion ? 1 : 1 - Math.exp(-delta * 4.5);
    target.current.lerp(new THREE.Vector3(aimX, aimY, aimZ), step);
    camera.position.lerp(new THREE.Vector3(aimX + 20, aimY + 17, aimZ + 21), step);
    camera.zoom += (desiredZoom - camera.zoom) * step;
    camera.lookAt(target.current);
    camera.updateProjectionMatrix();
  });
  useEffect(() => {
    const mobile = size.width < 700;
    const x = mobile ? -span * .345 : -span * .1175 + 1.2;
    target.current.set(x, 1.72, 0);
    camera.position.set(x + 20, 18.72, 21);
    camera.lookAt(target.current);
    camera.zoom = mobile ? size.width / 16.7 : Math.min(size.width / (span + 22), size.height / 19.6);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

// Keep the upper layers independent so their material opacity can follow scroll.
function FadeLayer({ opacity, children }) {
  const group = useRef();
  const materials = useRef([]);
  useLayoutEffect(() => {
    const entries = [];
    group.current.traverse(object => {
      if (!object.isMesh) return;
      const originals = Array.isArray(object.material) ? object.material : [object.material];
      const copies = originals.map(material => {
        const copy = material.clone();
        entries.push({ material: copy, originalOpacity: material.opacity });
        return copy;
      });
      object.material = Array.isArray(object.material) ? copies : copies[0];
    });
    materials.current = entries;
    return () => entries.forEach(({ material }) => material.dispose());
  }, []);
  useEffect(() => {
    if (!group.current) return;
    group.current.visible = opacity > .015;
    materials.current.forEach(({ material, originalOpacity }) => {
      const transparent = opacity < .995 || originalOpacity < .995;
      if (material.transparent !== transparent) {
        material.transparent = transparent;
        material.needsUpdate = true;
      }
      material.opacity = originalOpacity * opacity;
      material.depthWrite = opacity > .995;
    });
    group.current.traverse(object => { if (object.isMesh) object.castShadow = opacity > .75; });
  }, [opacity]);
  return <group ref={group}>{children}</group>;
}

const StreetLevel = memo(function StreetLevel({ layout, reducedMotion }) {
  const width = layout.span + 18;
  const entranceX = layout.upperX - 3.65;
  const leftWidth = entranceX + width / 2 - 1.35;
  const rightStart = entranceX + 1.35;
  const rightWidth = width / 2 - rightStart;
  return <group>
    <Block position={[0, 2.3, -4.76]} size={[width, 2.4, 2.18]} color="#bea48a" />
    <FloorSlab position={[0, 3.5, -4.54]} size={[width, 4.35, .42]} color="#ead7b5" />
    <FloorSlab position={[0, 3.5, -2.13]} size={[width, .5, .42]} color="#b7b9a6" sideColor="#a59d89" />
    <FloorSlab position={[-width / 2 + leftWidth / 2, 3.5, -1.22]} size={[leftWidth, 1.45, .42]} color="#eee0c4" />
    <FloorSlab position={[rightStart + rightWidth / 2, 3.5, -1.22]} size={[rightWidth, 1.45, .42]} color="#eee0c4" />
    <Block position={[0, 3.42, -2.12]} size={[width, .025, .06]} color="#fff6e4" castShadow={false} />
    {Array.from({ length: 18 }, (_, i) => <Block key={i} position={[-width / 2 + (i + .5) * width / 18, 3.54, -2.38]} size={[.06, .014, .32]} color="#f5e9c9" castShadow={false} />)}
    <Building position={[layout.upperX - 5.7, 3.53, -5.4]} width={2.8} depth={1.95} height={3.6} color="#e7cda9" roof="#b65e4b" flat />
    <Building position={[layout.upperX - 2.45, 3.53, -5.39]} width={2.94} depth={1.96} height={3.05} color="#f1dfbc" roof="#c9815e" flat />
    <Building position={[layout.upperX + 1.08, 3.53, -5.43]} width={3.45} depth={2} height={3.87} color="#e8d5ba" roof="#a78372" flat />
    <Building position={[layout.upperX + 4.85, 3.53, -5.42]} width={3.2} depth={2.05} height={2.9} color="#dfd7b9" roof="#7f9782" flat />
    <Building position={[layout.lowerX + 2.4, 3.53, -5.45]} width={3.1} depth={1.95} height={3.35} color="#f0d8b8" roof="#be745b" flat />
    <LowPolyTree position={[layout.upperX + 3, 3.53, -3.4]} scale={.8} />
    <LowPolyTree position={[layout.lowerX - 1.6, 3.53, -3.5]} hue="#7e9872" scale={.78} />
    <Palm position={[layout.lowerX + 4.5, 3.53, -3.35]} scale={.72} />
    <MetroEntrance position={[entranceX, 3.53, -.95]} />
    <Staircase x={entranceX} topY={3.5} bottomY={.48} topZ={-.75} bottomZ={1.04} width={1.55} steps={17} />
    <Lamp position={[layout.upperX + 4.55, 3.52, -1.08]} />
    <Lamp position={[layout.lowerX + 5.4, 3.52, -1.08]} />
    <Bench position={[layout.upperX + 3.8, 3.54, -1.55]} />
    <Traveller position={[layout.upperX - 1.1, 3.53, -2.9]} shirt="#be7056" phase={.2} walk={.25} reducedMotion={reducedMotion} />
    <Traveller position={[layout.lowerX + 1.8, 3.53, -1.47]} shirt="#7b9b85" phase={1.5} walk={.17} reducedMotion={reducedMotion} />
    <Traveller position={[layout.upperX + 4.1, 3.53, -3.6]} shirt="#dcad70" phase={2.3} walk={.21} reducedMotion={reducedMotion} />
    <Sign position={[entranceX + .45, 4.64, -.69]} size={[1.65, .29]} text="PASSEIG DE GRÀCIA" background={colors.cream} foreground={colors.tealDark} frame={colors.tealDark} />
  </group>;
});

function Tracks({ x, y, z, lineColor }) {
  return <group>
    <FloorSlab position={[x, y, z]} size={[14.65, 2.13, .29]} color="#68736f" sideColor="#74746b" />
    {Array.from({ length: 30 }, (_, i) => <Block key={i} position={[x - 7.12 + i * .49, y + .08, z]} size={[.13, .1, 1.75]} color="#505b59" />)}
    {[-.53, .53].map(shift => <Block key={shift} position={[x, y + .19, z + shift]} size={[14.8, .11, .105]} color="#c1c9bf" />)}
    <Block position={[x, y - .07, z + 1.08]} size={[14.85, .12, .13]} color={lineColor} />
  </group>;
}

const Platform = memo(function Platform({ x, y, z, line, lineColor, reducedMotion, phaseOffset }) {
  const trackZ = z - 2.1;
  return <group>
    <Block position={[x, y + .76, trackZ - 1.14]} size={[14.7, 2.55, .18]} color="#e7d8bc" />
    <Block position={[x, y + .54, trackZ - 1.036]} size={[14.64, .12, .023]} color={lineColor} castShadow={false} />
    <Block position={[x, y + 1.98, trackZ - 1.02]} size={[14.7, .18, .45]} color="#c6af93" />
    {Array.from({ length: 7 }, (_, i) => <Block key={i} position={[x - 6.3 + i * 2.1, y + .8, trackZ - 1.02]} size={[.12, 2.28, .12]} color="#f7ead2" />)}
    <Tracks x={x} y={y - .31} z={trackZ} lineColor={lineColor} />
    <FloorSlab position={[x, y, z]} size={[14.6, 2.28, .47]} color="#ebdcc1" sideColor="#bfa88c" />
    <Block position={[x, y + .08, z - 1.01]} size={[14.5, .035, .19]} color="#e8c878" castShadow={false} />
    {Array.from({ length: 30 }, (_, i) => <Block key={i} position={[x - 7.1 + i * .49, y + .105, z - 1.02]} size={[.13, .012, .06]} color="#fff3cf" castShadow={false} />)}
    <Block position={[x, y - .68, z + 1.14]} size={[14.6, 1.28, .18]} color="#c6ae91" />
    <Block position={[x, y - .57, z + 1.243]} size={[14.55, .14, .025]} color={lineColor} />
    {line === 'L3' && [-6.3, 6.3].map(offset => <Block key={offset} position={[x + offset, y - 2.18, z + 1.06]} size={[.3, 2.75, .3]} color="#bda78b" />)}
    <Sign position={[x - 3.85, y + 1.38, z + .79]} size={[2.95, .49]} text="PASSEIG DE GRÀCIA" subtext={`${line}  ·  ANDANA`} background={colors.cream} foreground={colors.tealDark} frame={lineColor} />
    <Sign position={[x + 5.5, y + 1.36, z + .78]} size={[.85, .46]} text={line} background={lineColor} foreground={colors.warmWhite} frame={lineColor} />
    <Bench position={[x + 4.65, y + .04, z + .15]} rotation={[0, Math.PI, 0]} />
    <Planter position={[x - 6.3, y + .04, z + .45]} width={.66} />
    <Traveller position={[x - 2.2, y + .04, z + .2]} shirt="#a97662" phase={1.5} walk={.2} reducedMotion={reducedMotion} />
    <Traveller position={[x + 1.25, y + .04, z + .25]} shirt="#6f978b" phase={2.6} walk={.12} reducedMotion={reducedMotion} />
    <Traveller position={[x + 5.9, y + .04, z - .1]} shirt="#d4a768" phase={.3} reducedMotion={reducedMotion} />
    <Train position={[x, y - .36, trackZ]} line={line} stripe={lineColor} phaseOffset={phaseOffset} reducedMotion={reducedMotion} />
  </group>;
});

const TransferTunnel = memo(function TransferTunnel({ layout, reducedMotion }) {
  const front = layout.upperConnectionX;
  const back = layout.lowerConnectionX;
  const upperLink = { topZ: .95, bottomZ: 2.02, topY: .49, bottomY: -1.02, x: front - .9 };
  const lowerLink = { topZ: 2.73, bottomZ: 4.22, topY: -1.02, bottomY: -2.49, x: back };
  const pillarCount = Math.max(3, Math.floor(layout.span / 2.15));
  return <group>
    <FloorSlab position={[0, -1.06, 2.33]} size={[layout.span - 1.2, 1.74, .34]} color="#f0e1c4" sideColor="#b8a187" />
    <Block position={[0, -.26, 1.47]} size={[layout.span - 1.15, 1.75, .23]} color="#dac5a8" />
    <Block position={[0, -.24, 1.61]} size={[layout.span - 1.18, .18, .02]} color="#c6d5cb" castShadow={false} />
    <Block position={[0, -.43, 1.61]} size={[layout.span - 1.18, .1, .02]} color="#ccbb97" castShadow={false} />
    <Block position={[0, -1.19, 3.19]} size={[layout.span - 1.25, .4, .1]} color="#c9b397" />
    <Block position={[0, -.92, 2.35]} size={[layout.span - 1.25, .025, .045]} color="#d9c69f" castShadow={false} />
    {Array.from({ length: pillarCount }, (_, index) => {
      const x = -layout.span / 2 + 1.7 + index * (layout.span - 3.4) / Math.max(1, pillarCount - 1);
      return <group key={index}>
        <Block position={[x, -.27, 1.6]} size={[.16, 1.55, .16]} color="#f4e6cc" />
        <Block position={[x, .55, 1.77]} size={[.22, .1, .44]} color="#e5c69e" />
        <Block position={[x, -.92, 3.05]} size={[.19, .3, .19]} color="#bca88d" />
        {index % 2 === 0 && <>
          <Block position={[x, .72, 2.32]} size={[.13, .13, 1.83]} color="#e8d7b8" />
          <Block position={[x, -.13, 3.14]} size={[.13, 1.61, .13]} color="#ddc6a5" />
          <mesh position={[x, .56, 2.3]}><sphereGeometry args={[.09, 8, 6]} /><meshStandardMaterial color="#fff0c5" emissive="#edc584" emissiveIntensity={.85} /></mesh>
        </>}
      </group>;
    })}
    <Sign position={[0, .29, 1.635]} size={[2.45, .36]} text="ENLLAÇ  ·  TRANSFER" background={colors.tealDark} foreground={colors.warmWhite} frame={colors.tealDark} />
    {layout.walking > 0 && <Sign position={[0, -.25, 1.635]} size={[1.55, .28]} text={`${layout.walking} M WALK`} background={colors.cream} foreground={colors.tealDark} frame={colors.stone} />}
    {layout.hasWalkway && <MovingWalkway position={[0, -.96, 2.35]} length={layout.walkwayVisualLength} reducedMotion={reducedMotion} />}
    <Staircase {...upperLink} steps={layout.stairTreads} />
    {layout.hasEscalator && <Escalator {...upperLink} x={front + .98} reducedMotion={reducedMotion} />}
    <Staircase {...lowerLink} steps={layout.stairTreads} />
    <Turnstiles position={[front - 2.05, .5, .55]} />
    <Traveller position={[front + .16, -1.02, 2.31]} shirt="#d3a76c" phase={1.5} walk={.15} reducedMotion={reducedMotion} />
    <Traveller position={[back - 1.1, -1.02, 2.35]} shirt="#7f9e92" phase={3.1} walk={.2} reducedMotion={reducedMotion} />
    <Block position={[0, -.61, 2.33]} size={[layout.span - 1.3, .055, .05]} color="#e8c778" castShadow={false} />
  </group>;
});

function TransferRoute({ layout, active, journeyRun, reducedMotion }) {
  const marker = useRef();
  const start = useRef(null);
  const points = [
    [layout.upperX - 3.7, .7, .35],
    [layout.upperConnectionX, .68, .93],
    [layout.upperConnectionX, -.75, 2.05],
    [layout.lowerConnectionX, -.75, 2.35],
    [layout.lowerConnectionX, -2.21, 4.24],
    [layout.lowerX + 1, -2.22, 5.12],
  ];
  useEffect(() => { start.current = null; }, [journeyRun]);
  useFrame(({ clock }) => {
    if (!active || !marker.current || reducedMotion) return;
    if (start.current === null) start.current = clock.elapsedTime;
    const t = ((clock.elapsedTime - start.current) % 6.5) / 6.5 * (points.length - 1);
    const index = Math.min(points.length - 2, Math.floor(t));
    const v = t - index;
    const a = points[index], b = points[index + 1];
    marker.current.position.set(a[0] + (b[0] - a[0]) * v, a[1] + (b[1] - a[1]) * v, a[2] + (b[2] - a[2]) * v);
  });
  if (!active) return null;
  return <group>
    {points.slice(0, -1).map((point, i) => <Rod key={i} from={point} to={points[i + 1]} radius={.048} color="#f8c96f" />)}
    <mesh ref={marker} position={points[0]}><sphereGeometry args={[.2, 12, 8]} /><meshStandardMaterial color="#fff7d5" emissive="#e4a247" emissiveIntensity={1.7} /></mesh>
  </group>;
}

export default function StationWorld({ values, journey, journeyRun, depth, reducedMotion }) {
  const { size } = useThree();
  const layout = useMemo(() => getStationLayout(values), [values]);
  const mobile = size.width < 700;
  const streetOpacity = 1 - smoothstep(.06, .5, depth);
  const upperOpacity = 1 - .94 * smoothstep(.57, .99, depth);
  return <>
    <color attach="background" args={['#dce9e3']} />
    <fog attach="fog" args={['#dce9e3', 35, 75]} />
    <ambientLight intensity={.7} />
    <hemisphereLight args={['#fff2dc', '#92a9a0', 2]} />
    <directionalLight position={[-9, 16, 12]} intensity={2.55} color="#fff3da" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-27} shadow-camera-right={27} shadow-camera-top={23} shadow-camera-bottom={-23} shadow-camera-near={1} shadow-camera-far={60} shadow-normalBias={.035} shadow-radius={3} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5.02, 0]} receiveShadow><planeGeometry args={[200, 200]} /><meshStandardMaterial color="#d8e4d9" roughness={1} /></mesh>
    <ContactShadows position={[0, -4.97, 0]} opacity={.22} scale={45} blur={2.7} far={9} resolution={512} frames={1} color="#536c65" />
    <group>
      <FloorSlab position={[0, -4.02, .25]} size={[layout.span + 18, 14.65, 1.08]} color="#b59b82" sideColor="#92765e" />
      <FadeLayer opacity={1 - .96 * smoothstep(.52, .98, depth)}>
        <Block position={[0, -1.4, -4.76]} size={[layout.span + 18, 5, 2.18]} color="#b69b81" />
        {[-3.45, -2.58, -1.57, -.72, .2].map((y, i) => <Block key={y} position={[0, y, -3.654]} size={[layout.span + 17.95, .045, .025]} color={i % 2 ? '#a88a72' : '#d2b496'} castShadow={false} />)}
      </FadeLayer>
      <Block position={[0, -3.68, 7.58]} size={[layout.span + 18, .12, .08]} color="#d3b699" />
      <Block position={[0, -4.14, 7.6]} size={[layout.span + 18, .09, .08]} color="#806955" />
      <Block position={[0, -4.53, 7.61]} size={[layout.span + 18, .08, .08]} color="#c2a183" />
      <FadeLayer opacity={streetOpacity}><StreetLevel layout={layout} reducedMotion={reducedMotion} /></FadeLayer>
      <FadeLayer opacity={upperOpacity}><Platform x={layout.upperX} y={.46} z={.24} line="L3" lineColor="#77a17b" phaseOffset={5} reducedMotion={reducedMotion} /></FadeLayer>
      <TransferTunnel layout={layout} reducedMotion={reducedMotion} />
      <Platform x={layout.lowerX} y={-2.5} z={5.02} line="L4" lineColor="#d7ad57" phaseOffset={8} reducedMotion={reducedMotion} />
      <TransferRoute key={journeyRun} layout={layout} active={Boolean(journey)} journeyRun={journeyRun} reducedMotion={reducedMotion} />
    </group>
    <CameraRig depth={depth} span={layout.span} reducedMotion={reducedMotion} />
    <EffectComposer multisampling={0}><N8AO halfRes quality={mobile ? 'performance' : 'low'} aoRadius={.66} intensity={1.35} distanceFalloff={.8} /></EffectComposer>
  </>;
}
