import { memo, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { EffectComposer, N8AO } from '@react-three/postprocessing';
import { Block, FloorSlab, Rod, Sign, colors } from './Primitives.jsx';
import { Staircase, Escalator, MovingWalkway, Bench } from './Architecture.jsx';
import { Traveller, Planter } from './Details.jsx';
import BarcelonaStreet from './Surface.jsx';
import PeopleFlow from './PeopleFlow.jsx';
import Train from './Train.jsx';
import { getStationLayout } from './stationLayout.js';
import { lineColor, stationLabel } from './lineCatalog.js';

const cameraTarget = [3, 1.96, 1.85];

function CameraFit({ span }) {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.position.set(23, 18.96, 22.85);
    camera.lookAt(...cameraTarget);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  useEffect(() => {
    camera.zoom = Math.min(size.width / (span + (size.width < 700 ? 21 : 22)), size.height / (size.width < 700 ? 22 : 29));
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, span]);
  return null;
}

function Tracks({ color }) {
  return <group>
    <FloorSlab position={[0, -.31, -2.12]} size={[15.6, 2.18, .28]} color="#65706c" sideColor="#77786d" />
    {Array.from({ length: 33 }, (_, i) => <Block key={i} position={[-7.55 + i * .47, -.23, -2.12]} size={[.13, .09, 1.7]} color="#505b58" />)}
    {[-.52, .52].map(offset => <Block key={offset} position={[0, -.11, -2.12 + offset]} size={[15.7, .11, .11]} color="#c1c8c0" />)}
    <Block position={[0, -.39, -1.01]} size={[15.72, .1, .13]} color={color} />
  </group>;
}

function TrackPortal({ side }) {
  const x = side * 7.07;
  return <group>
    <Block position={[x, 1.93, -2.12]} size={[.77, .31, 2.65]} color="#a88f76" />
    {[-3.31, -.93].map(z => <Block key={z} position={[x, .94, z]} size={[.79, 1.95, .28]} color="#a88f76" />)}
    <Block position={[x, 2.18, -2.12]} size={[.86, .18, 2.83]} color="#c7b093" />
    <Block position={[x, .13, -3.42]} size={[.86, .34, .2]} color="#baa187" />
  </group>;
}

const Platform = memo(function Platform({ position, rotation = 0, line, stationName, reducedMotion, phaseOffset }) {
  const color = lineColor(line);
  return <group position={position} rotation={[0, rotation, 0]}>
    <Block position={[0, .77, -3.28]} size={[14.9, 2.48, .2]} color="#e9dcc3" />
    <Block position={[0, .53, -3.16]} size={[14.86, .13, .025]} color={color} castShadow={false} />
    <Block position={[0, 2.06, -3.08]} size={[14.95, .18, .55]} color="#c6ae90" />
    {Array.from({ length: 7 }, (_, i) => <Block key={i} position={[-6.32 + i * 2.1, .79, -3.15]} size={[.13, 2.3, .14]} color="#f8ead0" />)}
    <Tracks color={color} />
    <FloorSlab position={[0, 0, 0]} size={[14.6, 2.35, .48]} color="#f0e0c1" sideColor="#bca58b" />
    <Block position={[0, .08, -1.04]} size={[14.55, .035, .21]} color="#edc978" castShadow={false} />
    {Array.from({ length: 30 }, (_, i) => <Block key={i} position={[-7.1 + i * .49, .105, -1.04]} size={[.12, .012, .07]} color="#fff2ca" castShadow={false} />)}
    <Block position={[0, -.67, 1.2]} size={[14.6, 1.3, .2]} color="#c4ab8e" />
    <Block position={[0, -.58, 1.316]} size={[14.55, .14, .026]} color={color} />
    <Sign position={[-3.82, 1.39, .86]} size={[2.8, .49]} text={stationName} subtext={`${line}  ·  ANDANA`} background={colors.cream} foreground={colors.tealDark} frame={color} />
    <Sign position={[5.55, 1.39, .85]} size={[.84, .45]} text={line} background={color} foreground={colors.warmWhite} frame={color} />
    <Bench position={[4.67, .03, .18]} rotation={[0, Math.PI, 0]} />
    <Planter position={[-6.25, .03, .45]} width={.66} />
    <Traveller position={[-3.2, .03, .26]} shirt="#b57664" phase={1.1} reducedMotion={reducedMotion} />
    <Traveller position={[3.15, .03, .46]} shirt="#7b998a" phase={2.6} reducedMotion={reducedMotion} />
    <TrackPortal side={-1} />
    <TrackPortal side={1} />
    <Train position={[0, -.36, -2.12]} line={line} stripe={color} phaseOffset={phaseOffset} reducedMotion={reducedMotion} />
  </group>;
});

const TransferTunnel = memo(function TransferTunnel({ layout, fromLine, toLine, reducedMotion }) {
  const start = layout.upperConnectionX;
  const end = layout.lowerConnectionX;
  const mid = (start + end) / 2;
  const width = layout.corridorLength + 3.6;
  const hallX = mid - .35;
  const rise = { topY: .39, bottomY: -.61, topZ: 1.3, bottomZ: 2.2 };
  const lowerLink = { x: end, topY: -.61, bottomY: -1.54, topZ: 2.94, bottomZ: 4.16 };
  const supports = Math.max(3, Math.round(layout.corridorLength / 2.4));
  return <group>
    <FloorSlab position={[hallX, -.63, 2.52]} size={[width, 1.98, .39]} color="#f0dfc0" sideColor="#b6a087" />
    <Block position={[hallX, -.11, 1.5]} size={[width, 1.1, .2]} color="#e2cdb0" />
    <Block position={[hallX, -.03, 1.612]} size={[width, .12, .025]} color="#96afa2" castShadow={false} />
    <Block position={[hallX, -.76, 3.52]} size={[width, .26, .13]} color="#c7af93" />
    {Array.from({ length: supports }, (_, i) => {
      const x = start - 1.75 + i * width / Math.max(1, supports - 1);
      return <group key={i}>
        <Block position={[x, -.05, 1.64]} size={[.15, 1.1, .16]} color="#f4e6ca" />
        {i % 2 === 0 && <>
          <Block position={[x, .52, 2.48]} size={[.15, .12, 1.93]} color="#e5d2af" />
          <Block position={[x, -.14, 3.39]} size={[.15, 1.1, .15]} color="#ddc6a5" />
          <mesh position={[x, .39, 2.47]}><sphereGeometry args={[.08, 8, 6]} /><meshStandardMaterial color="#fff0c5" emissive="#edc584" emissiveIntensity={.8} /></mesh>
        </>}
      </group>;
    })}
    <Sign position={[mid, .26, 1.63]} size={[2.7, .37]} text={`${fromLine}  →  ${toLine}  ·  ENLLAÇ`} background={colors.tealDark} foreground={colors.warmWhite} frame={colors.tealDark} />
    {layout.walking > 0 && <Sign position={[mid, -.27, 1.63]} size={[1.48, .26]} text={`${layout.walking} M WALK`} background={colors.cream} foreground={colors.tealDark} frame={colors.stone} />}
    {layout.hasWalkway && <MovingWalkway position={[mid, -.53, 2.54]} length={layout.walkwayVisualLength} reducedMotion={reducedMotion} />}
    <Staircase x={start - 1.0} {...rise} width={1.45} steps={layout.stairTreads} />
    <Escalator x={start + .88} {...rise} treadCount={layout.escalatorTreads} reducedMotion={reducedMotion} />
    <Staircase {...lowerLink} width={1.48} steps={layout.stairTreads} />
    <Block position={[mid, -.52, 2.5]} size={[layout.corridorLength - 1.9, .02, .055]} color="#edcb78" castShadow={false} />
  </group>;
});

function TransferRoute({ layout, active, journeyRun, reducedMotion }) {
  const marker = useRef();
  const started = useRef(null);
  const points = [
    [layout.upperX - 1.6, .55, -1.0],
    [layout.upperConnectionX - 1, .55, 1.28],
    [layout.upperConnectionX - 1, -.43, 2.18],
    [(layout.upperConnectionX + layout.lowerConnectionX) / 2, -.43, 2.48],
    [layout.lowerConnectionX, -.43, 2.94],
    [layout.lowerConnectionX, -1.36, 4.16],
    [layout.lowerX - 1.08, -1.36, 4.7],
  ];
  useEffect(() => { started.current = null; }, [journeyRun]);
  useFrame(({ clock }) => {
    if (!active || !marker.current || reducedMotion) return;
    if (started.current === null) started.current = clock.elapsedTime;
    const t = ((clock.elapsedTime - started.current) % 6.3) / 6.3 * (points.length - 1);
    const index = Math.min(points.length - 2, Math.floor(t));
    const fraction = t - index;
    const a = points[index], b = points[index + 1];
    marker.current.position.set(a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction, a[2] + (b[2] - a[2]) * fraction);
  });
  if (!active) return null;
  return <group>
    {points.slice(0, -1).map((point, index) => <Rod key={index} from={point} to={points[index + 1]} radius={.047} color="#f5c777" />)}
    <mesh ref={marker} position={points[0]}><sphereGeometry args={[.18, 12, 8]} /><meshStandardMaterial color="#fff6cf" emissive="#e4a247" emissiveIntensity={1.6} /></mesh>
  </group>;
}

export default function StationWorld({ values, station, journey, journeyRun, reducedMotion }) {
  const { size } = useThree();
  const layout = useMemo(() => getStationLayout(values), [values]);
  const stationName = stationLabel(station.name);
  const mobile = size.width < 700;
  const fit = Math.min(size.width / (layout.span + (mobile ? 21 : 22)), size.height / (mobile ? 22 : 29));
  return <>
    <color attach="background" args={['#dce9e3']} />
    <fog attach="fog" args={['#dce9e3', 39, 86]} />
    <ambientLight intensity={.68} />
    <hemisphereLight args={['#fff3df', '#91a49b', 2]} />
    <directionalLight position={[-10, 18, 13]} intensity={2.5} color="#fff3dc" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-29} shadow-camera-right={29} shadow-camera-top={27} shadow-camera-bottom={-27} shadow-camera-near={1} shadow-camera-far={68} shadow-normalBias={.038} shadow-radius={3} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.23, 0]} receiveShadow><planeGeometry args={[200, 200]} /><meshStandardMaterial color="#d8e4d9" roughness={1} /></mesh>
    <ContactShadows position={[0, -4.19, 0]} opacity={.22} scale={52} blur={2.9} far={9} resolution={512} frames={1} color="#51675f" />
    <group>
      <FloorSlab position={[layout.upperX, -3.28, -1.33]} size={[16.7, 11.25, .91]} color="#b9a087" sideColor="#947a65" />
      <FloorSlab position={[layout.lowerX, -3.3, 4.66]} size={[7.3, 16.1, .9]} color="#b9a087" sideColor="#947a65" />
      <Block position={[layout.upperX, -1.12, -4.78]} size={[16.6, 4.26, 2.24]} color="#b69c82" />
      {[-2.83, -1.91, -.96, -.08].map((y, i) => <Block key={y} position={[layout.upperX, y, -3.647]} size={[16.52, .04, .026]} color={i % 2 ? '#d2b596' : '#a98a71'} castShadow={false} />)}
      <BarcelonaStreet layout={layout} stationName={stationName} reducedMotion={reducedMotion} />
      <Platform position={[layout.upperX, .36, .2]} line={station.fromLine} stationName={stationName} reducedMotion={reducedMotion} phaseOffset={5} />
      <TransferTunnel layout={layout} fromLine={station.fromLine} toLine={station.toLine} reducedMotion={reducedMotion} />
      <Platform position={[layout.lowerX, -1.55, 4.65]} rotation={Math.PI / 2} line={station.toLine} stationName={stationName} reducedMotion={reducedMotion} phaseOffset={0} />
      <PeopleFlow layout={layout} reducedMotion={reducedMotion} />
      <TransferRoute key={journeyRun} layout={layout} active={Boolean(journey)} journeyRun={journeyRun} reducedMotion={reducedMotion} />
    </group>
    <CameraFit span={layout.span} />
    <OrbitControls target={cameraTarget} enablePan={false} enableDamping dampingFactor={.085} minPolarAngle={.51} maxPolarAngle={1.36} minAzimuthAngle={-.12} maxAzimuthAngle={1.72} minZoom={fit * .7} maxZoom={fit * 2.4} rotateSpeed={.48} zoomSpeed={.7} />
    <EffectComposer multisampling={0}><N8AO halfRes quality={mobile ? 'performance' : 'low'} aoRadius={.66} intensity={1.35} distanceFalloff={.8} /></EffectComposer>
  </>;
}
