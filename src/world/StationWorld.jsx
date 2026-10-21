import { memo, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { EffectComposer, N8AO } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Block, FloorSlab, Sign, colors } from './Primitives.jsx';
import { Staircase, Escalator, MovingWalkway, Bench } from './Architecture.jsx';
import { Traveller, Planter } from './Details.jsx';
import BarcelonaStreet from './Surface.jsx';
import PeopleFlow from './PeopleFlow.jsx';
import ValidationRoute from './ValidationRoute.jsx';
import useStationLayout from './useStationLayout.js';
import Train from './Train.jsx';
import CreatorsNook from './CreatorsNook.jsx';
import { WorldMotion } from './WorldMotion.jsx';
import MonochromeWorld from './MonochromeWorld.jsx';
import TransferSimulation from './TransferSimulation.jsx';
import { creatorsNookBounds } from './creatorsLayout.js';
import { getStationLayout, getStationShape, stationDimensions as d } from './stationLayout.js';
import { lineColor, stationLabel } from './lineCatalog.js';

function baseOutline(layout) {
  const left = layout.upperX - 10.3, neck = layout.lowerX - 3.85, right = layout.lowerX + 1.9;
  const front = layout.tunnelFarZ + .55;
  return [[left, -6.85], [neck, -6.85], [neck, -8.7], [right, -8.7], [right, -6.85], [layout.streetMaxX, -6.85], [layout.streetMaxX, -3.6], [right, -3.6], [right, 11.1], [neck, 11.1], [neck, front], [layout.tunnelStartX, front], [layout.tunnelStartX, 2.05], [left, 2.05]];
}

function framingPoints(layout) {
  const points = baseOutline(layout).map(([x, z]) => new THREE.Vector3(x, layout.groundY - .85, z));
  const addBox = (min, max) => { for (const x of [min[0], max[0]]) for (const y of [min[1], max[1]]) for (const z of [min[2], max[2]]) points.push(new THREE.Vector3(x, y, z)); };
  addBox([layout.streetMinX, layout.streetY, -6.8], [layout.streetMaxX, layout.streetY, 1.4]);
  const creatorsBounds = creatorsNookBounds(layout);
  addBox(creatorsBounds.min, creatorsBounds.max);
  [[layout.upperX - 5.95, 2.9, 3.7], [layout.upperX - 1.82, 3.9, 4.7], [layout.upperX + 2.85, 3.3, 3.95], [layout.lowerX + 2.08, 3.5, 3.6]].forEach(([x, width, height]) => addBox([x - width / 2, layout.streetY, -6.55], [x + width / 2, layout.streetY + height, -4.1]));
  return points;
}

function SceneCamera({ layout, reducedMotion, simulation }) {
  const controls = useRef();
  const goal = useRef(null);
  const savedView = useRef(null);
  const active = simulation?.status === 'running';
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    if (!controls.current) return;
    const orbit = controls.current;
    if (active && !savedView.current) savedView.current = { center: orbit.target.clone(), zoom: camera.zoom, direction: camera.position.clone().sub(orbit.target).normalize() };
    const restore = !active ? savedView.current : null;
    const direction = active ? new THREE.Vector3(1, .66, 1).normalize() : restore?.direction ?? camera.position.clone().sub(orbit.target).normalize();
    const points = active ? layout.walkingVolumes.flatMap(volume => [new THREE.Vector3(...volume.min), new THREE.Vector3(...volume.max)]).concat([new THREE.Vector3(layout.upperX - 8, layout.upperY + 2, -4), new THREE.Vector3(layout.lowerX + 1, layout.lowerY, 9)]) : framingPoints(layout);
    const center = new THREE.Box3().setFromPoints(points).getCenter(new THREE.Vector3());
    const probe = camera.clone();
    probe.position.copy(center).addScaledVector(direction, 48);
    probe.lookAt(center);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(probe.quaternion);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(probe.quaternion);
    const xs = points.map(point => point.clone().sub(center).dot(right));
    const ys = points.map(point => point.clone().sub(center).dot(up));
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const mobile = size.width < 700;
    const side = mobile ? 12 : 32, top = mobile ? 67 : 72, bottom = mobile ? 42 : 30;
    const fit = Math.min((size.width - side * 2) / (maxX - minX), (size.height - top - bottom) / (maxY - minY));
    center.addScaledVector(right, (minX + maxX) / 2).addScaledVector(up, (minY + maxY) / 2 + (top - bottom) / (2 * fit));
    if (!goal.current || reducedMotion) {
      camera.position.copy(center).addScaledVector(direction, 48);
      camera.lookAt(center);
      camera.zoom = Math.max(1, fit);
      camera.updateProjectionMatrix();
      orbit.target.copy(center);
      orbit.update();
    }
    orbit.minZoom = fit * .65;
    orbit.maxZoom = fit * 4;
    goal.current = { center: restore?.center ?? center, direction, zoom: restore?.zoom ?? Math.max(1, fit), active: !reducedMotion };
    if (restore) savedView.current = null;
  }, [camera, layout, size.width, size.height, reducedMotion, active]);
  useFrame((_, delta) => {
    const target = goal.current, orbit = controls.current;
    if (!target?.active || !orbit) return;
    const step = 1 - Math.exp(-Math.min(delta, .1) * 9);
    const offset = camera.position.clone().sub(orbit.target).lerp(target.direction.clone().multiplyScalar(48), step);
    orbit.target.lerp(target.center, step);
    camera.position.copy(orbit.target).add(offset);
    camera.zoom = THREE.MathUtils.lerp(camera.zoom, target.zoom, step);
    if (orbit.target.distanceTo(target.center) < .002 && Math.abs(camera.zoom - target.zoom) < .002) {
      orbit.target.copy(target.center);
      camera.position.copy(target.center).add(offset);
      camera.zoom = target.zoom;
      if (offset.clone().normalize().distanceTo(target.direction) < .002) target.active = false;
    }
    camera.updateProjectionMatrix();
    orbit.update();
  });
  return <OrbitControls ref={controls} makeDefault onStart={() => { if (goal.current) goal.current.active = false; }} enablePan={false} zoomToCursor enableDamping dampingFactor={.085} minPolarAngle={.48} maxPolarAngle={1.5} rotateSpeed={.48} zoomSpeed={.7} />;
}

function Tracks({ endX }) {
  const startX = -d.trackHalfLength;
  const length = endX - startX;
  const mid = (startX + endX) / 2;
  const sleepers = Math.ceil(length / .47);
  return <group userData={{ collisionRole: 'track' }}>
    <FloorSlab position={[mid, -.56, d.trackZ]} size={[length, 2.4, .3]} color="#65706c" sideColor="#77786d" />
    {Array.from({ length: sleepers }, (_, i) => <Block key={i} position={[startX + (i + .5) * length / sleepers, -.51, d.trackZ]} size={[.13, .09, 1.7]} color="#505b58" />)}
    {[-.52, .52].map(offset => <Block key={offset} position={[mid, -.43, d.trackZ + offset]} size={[length, .1, .11]} color="#bac4bc" />)}
  </group>;
}

function RailTunnel({ side, endX = d.trackHalfLength, startX = 7.6 }) {
  const length = endX - startX;
  const center = side * (startX + length / 2);
  return <group>
    {/* A hollow sleeve hides the clipping boundary deep inside the opening. */}
    {[-1, 1].map(edge => <Block key={edge} position={[center, (d.portalCeiling - .5) / 2, d.trackZ + edge * (d.portalInnerHalfWidth + .12)]} size={[length, d.portalCeiling + .5, .24]} color="#ab947c" />)}
    <Block position={[center, d.portalCeiling + .14, d.trackZ]} size={[length, .28, 2.64]} color="#bfa78a" />
    <Block position={[side * (startX + .02), 2.06, d.trackZ]} size={[.19, .36, 2.8]} color="#d0b99a" />
  </group>;
}

const Platform = memo(function Platform({ position, rotation = 0, line, reducedMotion, phaseOffset, upper = false, trackEndX = d.trackHalfLength }) {
  const color = lineColor(line);
  return <group name={upper ? 'upper-platform' : 'lower-platform'} position={position} rotation={[0, rotation, 0]}>
    <Block position={[0, .95, -3.48]} size={[15.3, 3.0, .2]} color="#e9dcc3" />
    <Block position={[0, .55, -3.369]} size={[15.2, .12, .022]} color={color} castShadow={false} />
    <Block position={[0, 2.46, -3.43]} size={[15.5, .16, .36]} color="#c6ae90" />
    {[-4.5, 4.5].map(x => <Sign key={x} position={[x, 1.99, -3.335]} size={[1.04, .5]} text={line} background={color} foreground={colors.warmWhite} frame={color} />)}
    <Tracks endX={trackEndX} />
    <FloorSlab position={[0, 0, 0]} size={[14.6, 2.36, d.platformThickness]} color="#f0e0c1" sideColor="#bca58b" />
    <Block position={[0, .012, -1.03]} size={[14.55, .024, .19]} color="#edc978" castShadow={false} />
    {Array.from({ length: 30 }, (_, i) => <Block key={i} position={[-7.1 + i * .49, .029, -1.03]} size={[.12, .01, .07]} color="#fff2ca" castShadow={false} />)}
    {(upper ? [[-7.3, -.02], [3.76, 7.3]] : [[-7.3, 7.3]]).map(([start, end]) => <group key={start}>
      <Block position={[(start + end) / 2, -.31, 1.19]} size={[end - start, .62, .16]} color="#c4ab8e" />
      <Block position={[(start + end) / 2, -.26, 1.28]} size={[end - start, .12, .02]} color={color} castShadow={false} />
    </group>)}
    <Bench position={[upper ? 4.9 : -5.2, .01, .48]} rotation={[0, Math.PI, 0]} />
    <Planter position={[upper ? 6.45 : -6.4, .01, .55]} width={.64} />
    <Traveller position={[upper ? 3.3 : -6.7, .01, -.45]} shirt="#b57664" phase={1.1} reducedMotion={reducedMotion} />
    <Traveller position={[upper ? 5.8 : 5.6, .01, -.25]} shirt="#7b998a" phase={2.6} reducedMotion={reducedMotion} />
    <RailTunnel side={-1} /><RailTunnel side={1} endX={trackEndX} startX={upper ? trackEndX - 2.6 : 7.6} />
    <Train platformRole={upper ? 'source' : 'destination'} position={[0, -.36, d.trackZ]} visibleEndX={trackEndX - .2} line={line} stripe={color} phaseOffset={phaseOffset} reducedMotion={reducedMotion} />
  </group>;
});

function wallIntervals(layout) {
  let cursor = layout.tunnelStartX;
  const sections = [];
  [[layout.stairX - .9, layout.stairX + .9], [layout.escalatorX - .99, layout.escalatorX + .99], [layout.lowerX - .94, layout.lowerX + .94]].forEach(([start, end]) => {
    if (start > cursor + .05) sections.push([cursor, start]);
    cursor = Math.max(cursor, end);
  });
  if (layout.tunnelEndX > cursor + .05) sections.push([cursor, layout.tunnelEndX]);
  return sections;
}

const TransferTunnel = memo(function TransferTunnel({ layout: l, fromLine, toLine, reducedMotion }) {
  const mid = (l.tunnelStartX + l.tunnelEndX) / 2;
  const walls = wallIntervals(l);
  const signWall = walls.reduce((longest, wall) => wall[1] - wall[0] > longest[1] - longest[0] ? wall : longest, [0, 0]);
  const count = Math.max(3, Math.ceil(l.corridorLength / 2.9));
  return <group>
    <FloorSlab position={[mid, l.tunnelY, l.tunnelZ]} size={[l.corridorLength, 2.6, .32]} color="#f0dfc0" sideColor="#b6a087" />
    {walls.map(([start, end]) => <group key={start}>
      <Block position={[(start + end) / 2, l.tunnelY + 1, l.tunnelNearZ - .1]} size={[end - start, 2, .18]} color="#e3cfb1" />
      <Block position={[(start + end) / 2, l.tunnelY + .63, l.tunnelNearZ + .002]} size={[end - start, .11, .022]} color="#89a59a" castShadow={false} />
    </group>)}
    <Block position={[mid, l.tunnelY + .18, l.tunnelFarZ + .06]} size={[l.corridorLength, .36, .13]} color="#ccb596" />
    <Block position={[mid, l.tunnelY + 2.1, l.tunnelNearZ + .23]} size={[l.corridorLength + .16, .17, .68]} color="#d5c09e" />
    {Array.from({ length: count }, (_, i) => {
      const x = l.tunnelStartX + .12 + i * (l.corridorLength - .24) / (count - 1);
      return <group key={i}>
        <Block position={[x, l.tunnelY + 2.05, l.tunnelZ]} size={[.14, .14, 2.76]} color="#d8c3a0" />
        <Block position={[x, l.tunnelY + 1.03, l.tunnelFarZ + .06]} size={[.14, 2.06, .14]} color="#d8c3a0" />
        <Block position={[x, l.tunnelY + 1.94, l.tunnelZ]} size={[.22, .07, .47]} color="#fff0cb" castShadow={false} />
      </group>;
    })}
    {signWall[1] - signWall[0] > 1 && <Sign position={[(signWall[0] + signWall[1]) / 2, l.tunnelY + 1.29, l.tunnelNearZ + .035]} size={[Math.min(2.5, signWall[1] - signWall[0] - .16), .43]} text={`${fromLine}  →  ${toLine}`} background={colors.tealDark} foreground={colors.warmWhite} frame={colors.tealDark} />}
    {l.hasWalkway && <group position={[l.walkwayX, l.tunnelY, l.tunnelZ]} scale={[Math.min(1, l.walkwayVisualLength / 1.2), 1, 1]}><MovingWalkway position={[0, 0, 0]} length={Math.max(1.2, l.walkwayVisualLength)} reducedMotion={reducedMotion} /></group>}
    <Staircase x={l.stairX} {...l.upperDescent} width={1.4} steps={Math.ceil(l.escalatorRun / .24)} />
    <Escalator x={l.escalatorX} {...l.upperDescent} treadCount={l.escalatorTreads} reducedMotion={reducedMotion} />
    <Staircase {...l.lowerDescent} width={1.45} steps={l.stairTreads} bottomOnFloor />
  </group>;
});

function EarthPiece({ x0, x1, y0, y1 }) {
  if (x1 - x0 < .02) return null;
  return <group>
    <Block position={[(x0 + x1) / 2, (y0 + y1) / 2, -5.2]} size={[x1 - x0, y1 - y0, 3.1]} color="#bda38a" />
    {Array.from({ length: Math.floor((y1 - y0) / .85) }, (_, i) => <Block key={i} position={[(x0 + x1) / 2, y0 + .45 + i * .85, -3.642]} size={[x1 - x0, .035, .02]} color={i % 2 ? '#d2b596' : '#aa8c74'} castShadow={false} />)}
  </group>;
}

function CutawayEarth({ layout: l }) {
  const outline = useMemo(() => {
    const shape = new THREE.Shape();
    baseOutline(l).forEach(([x, z], index) => index ? shape.lineTo(x, -z) : shape.moveTo(x, -z));
    shape.closePath();
    return shape;
  }, [l]);
  const openingLeft = l.lowerX - 3.78, openingRight = l.lowerX + 1.42;
  const openingTop = l.lowerY + 2.7;
  return <group>
    <mesh position={[0, l.groundY - .8, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <extrudeGeometry args={[outline, { depth: .8, bevelEnabled: false }]} />
      <meshStandardMaterial color="#b49a7e" roughness={1} />
    </mesh>
    <EarthPiece x0={l.streetMinX} x1={openingLeft} y0={l.groundY} y1={l.streetY - .12} />
    <EarthPiece x0={openingRight} x1={l.streetMaxX} y0={l.groundY} y1={l.streetY - .12} />
    <EarthPiece x0={openingLeft} x1={openingRight} y0={openingTop} y1={l.streetY - .12} />
    <Block position={[(openingLeft + openingRight) / 2, openingTop + .01, -3.57]} size={[openingRight - openingLeft + .26, .22, .25]} color="#d5bda0" />
    {[openingLeft, openingRight].map(x => <Block key={x} position={[x, (l.groundY + openingTop) / 2, -3.57]} size={[.22, openingTop - l.groundY, .25]} color="#cbb396" />)}
    {[l.upperX - 6.5, l.upperX + .5, l.upperX + 6.5].filter(x => x < openingLeft - .3 || x > openingRight + .3).map(x => <Block key={x} position={[x, (l.groundY + l.upperY - .42) / 2, .65]} size={[.32, l.upperY - .42 - l.groundY, .38]} color="#b9a88e" />)}
  </group>;
}

function StationWorld({ values, station, validation, simulation, reducedMotion }) {
  const { size } = useThree();
  const targetLayout = useMemo(() => getStationLayout(values, getStationShape(values, station.presetId)), [values, station.presetId]);
  const { layout, transitioning } = useStationLayout(values, reducedMotion, station.presetId);
  const mobile = size.width < 700;
  return <WorldMotion simulation={simulation} reducedMotion={reducedMotion}>
    <color attach="background" args={['#dce9e3']} />
    <fog attach="fog" args={['#dce9e3', 75, 130]} />
    <ambientLight intensity={.68} />
    <hemisphereLight args={['#fff3df', '#91a49b', 2]} />
    <directionalLight position={[-10, 22, 13]} intensity={2.5} color="#fff3dc" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-32} shadow-camera-right={32} shadow-camera-top={32} shadow-camera-bottom={-32} shadow-camera-near={1} shadow-camera-far={78} shadow-normalBias={.035} shadow-radius={3} />
    <MonochromeWorld>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, layout.groundY - .85, 0]} receiveShadow><planeGeometry args={[200, 200]} /><meshStandardMaterial color="#d8e4d9" roughness={1} /></mesh>
    <ContactShadows key={transitioning ? 'resizing' : layout.groundY} position={[0, layout.groundY - .83, 0]} opacity={.2} scale={58} blur={2.9} far={10} resolution={512} frames={transitioning ? Infinity : 1} color="#51675f" />
    <group>
      <CutawayEarth layout={layout} />
      <CreatorsNook layout={layout} />
      <BarcelonaStreet layout={layout} stationName={stationLabel(station.name)} reducedMotion={reducedMotion} />
      <Platform position={[layout.upperX, layout.upperY, layout.upperZ]} line={station.fromLine} reducedMotion={reducedMotion} phaseOffset={6} trackEndX={layout.upperTrackEndX} upper />
      <TransferTunnel layout={layout} fromLine={station.fromLine} toLine={station.toLine} reducedMotion={reducedMotion} />
      <Platform position={[layout.lowerX, layout.lowerY, layout.lowerZ]} rotation={Math.PI / 2} line={station.toLine} reducedMotion={reducedMotion} phaseOffset={0} />
      <PeopleFlow layout={layout} reducedMotion={reducedMotion} />
      <ValidationRoute key={validation?.id ?? 'idle'} layout={layout} validation={validation} reducedMotion={reducedMotion} />
    </group>
    </MonochromeWorld>
    <TransferSimulation layout={layout} station={station} simulation={simulation} reducedMotion={reducedMotion} />
    <SceneCamera layout={targetLayout} reducedMotion={reducedMotion} simulation={simulation} />
    <EffectComposer multisampling={0}><N8AO halfRes quality={mobile ? 'performance' : 'low'} aoRadius={.66} intensity={1.35} distanceFalloff={.8} /></EffectComposer>
  </WorldMotion>;
}

export default memo(StationWorld);
