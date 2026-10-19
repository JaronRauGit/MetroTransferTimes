import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { EffectComposer, N8AO } from '@react-three/postprocessing';
import { Block, FloorSlab, Sign, colors } from './Primitives.jsx';
import { Building, LowPolyTree, Palm, Staircase, Escalator, MovingWalkway, MetroEntrance, Bench, Lamp } from './Architecture.jsx';
import { Traveller, Planter, Turnstiles, PlatformSign, RouteMarker } from './Details.jsx';
import Train from './Train.jsx';

function CameraFit() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.zoom = size.width < 700
      ? Math.min(size.width / 14.5, size.height / 14)
      : Math.min(size.width / 25, size.height / 18);
    camera.position.y = size.width < 700 ? 11.5 : 14;
    camera.lookAt(0, size.width < 700 ? -2.25 : .25, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

function StreetLevel({ reducedMotion }) {
  return <group>
    <FloorSlab position={[0, 2.28, -4.5]} size={[17, 3, .38]} color="#e8d4b1" />
    <FloorSlab position={[-7, 2.28, -2.25]} size={[3, 1.5, .38]} color="#e8d4b1" />
    <FloorSlab position={[2.5, 2.28, -2.25]} size={[11.5, 1.5, .38]} color="#e8d4b1" />
    <Block position={[0, 1.4, -3.03]} size={[17, 1.8, .33]} color="#c3a88a" />
    <Block position={[-7, 1.36, -1.48]} size={[3, 1.83, .3]} color="#c3a88a" />
    <Block position={[2.5, 1.36, -1.48]} size={[11.5, 1.83, .3]} color="#c3a88a" />
    <Block position={[0, 2.35, -3.07]} size={[17, .04, .08]} color="#f9e6c5" castShadow={false} />
    <Block position={[2.5, 2.35, -1.47]} size={[11.5, .045, .09]} color="#f9e6c5" castShadow={false} />
    {[-6.1, -3.3, -.5, 2.3, 5.1].map(x => <Block key={x} position={[x, 2.335, -3.38]} size={[.025, .012, 2.25]} color="#d5b994" castShadow={false} />)}
    <Building position={[-6.42, 2.34, -4.7]} width={2.8} depth={2.0} height={2.53} color="#ead8ba" roof="#c8815d" />
    <Building position={[.15, 2.34, -4.92]} width={2.2} depth={1.7} height={1.73} color="#f3e6cf" roof="#ba7055" />
    <Building position={[5.65, 2.34, -4.72]} width={3.15} depth={2.14} height={2.18} color="#d6d3b9" roof="#859075" flat />
    <LowPolyTree position={[-3.15, 2.35, -4.7]} hue="#7e986d" scale={.86} />
    <LowPolyTree position={[2.65, 2.35, -4.66]} hue="#8c9a65" scale={.78} />
    <Palm position={[3.5, 2.34, -2.56]} scale={.76} />
    <MetroEntrance position={[-4.4, 2.32, -2.2]} />
    <Staircase x={-4.4} topY={2.29} bottomY={.57} topZ={-1.7} bottomZ={-.03} width={1.58} />
    <Lamp position={[-7.96, 2.33, -2.28]} />
    <Lamp position={[7.47, 2.33, -2.26]} />
    <Bench position={[.65, 2.34, -2.15]} />
    <Traveller position={[-2.03, 2.33, -2.05]} shirt="#b75f4e" phase={.5} walk={.24} reducedMotion={reducedMotion} scale={.87} />
    <Traveller position={[6.42, 2.33, -2.43]} shirt="#668d77" phase={1.2} reducedMotion={reducedMotion} scale={.91} />
    <Traveller position={[.33, 2.33, -3.4]} shirt="#ddad65" phase={2.4} walk={.18} reducedMotion={reducedMotion} scale={.84} />
  </group>;
}

function Concourse({ reducedMotion }) {
  return <group>
    <FloorSlab position={[0, .53, -.45]} size={[17, 4.78, .48]} color="#ead6ba" />
    {[-6.24, -3.12, 0, 3.12, 6.24].map(x => <Block key={x} position={[x, .59, -.45]} size={[.025, .018, 4.55]} color="#d7be9f" castShadow={false} />)}
    <Block position={[0, .59, -2.78]} size={[17, .035, .09]} color="#f8e4c2" castShadow={false} />
    <Block position={[0, .59, 1.83]} size={[17, .035, .11]} color="#fff2d4" castShadow={false} />
    {[
      [-6.26, 4.48], [-.35, 3.61], [5.95, 5.12],
    ].map(([x, width]) => <Block key={x} position={[x, -.42, 1.85]} size={[width, 1.88, .28]} color="#c7ae91" />)}
    {[-7.95, -3.88, -2.2, 1.48, 3.58, 7.94].map(x => <Block key={x} position={[x, -.42, 2.02]} size={[.16, 1.88, .14]} color="#d8bf9e" />)}
    {[[-7.13, 1.75], [-1.0, 2.04], [5.52, 3.75]].map(([x, width]) => <Block key={x} position={[x, -.08, 2.011]} size={[width, .035, .025]} color="#efdcc0" castShadow={false} />)}
    <MovingWalkway position={[.2, .67, -.48]} length={4.67} reducedMotion={reducedMotion} />
    <Turnstiles position={[-5.9, .59, .58]} />
    <Sign position={[-4.92, 1.73, -2.64]} size={[2.15, .48]} text="CATALUNYA" subtext="L1  /  L3" background={colors.cream} foreground={colors.tealDark} frame={colors.tealDark} />
    <Sign position={[5.45, .02, 2.08]} size={[2.6, .45]} text="L3  ·  ANDANA 2" background={colors.cream} foreground={colors.tealDark} frame={colors.tealDark} />
    <Planter position={[-7.49, .59, -1.95]} />
    <Planter position={[7.48, .59, -.8]} />
    <Bench position={[6.18, .58, .47]} rotation={[0, Math.PI, 0]} />
    <Block position={[6.85, .9, -1.79]} size={[1.45, .61, .72]} color="#dbab86" />
    <Block position={[6.85, 1.25, -1.79]} size={[1.57, .12, .83]} color={colors.terracotta} />
    <Sign position={[6.85, 1.74, -1.36]} size={[1.32, .33]} text="CAFÈ" background={colors.terracotta} foreground={colors.warmWhite} frame={colors.terracotta} />
    <Traveller position={[-6.8, .59, -.32]} shirt="#e5b56d" phase={1.4} walk={.12} reducedMotion={reducedMotion} />
    <Traveller position={[-3.5, .59, -1.15]} shirt="#768c9d" phase={.7} walk={.28} reducedMotion={reducedMotion} />
    <Traveller position={[-1.7, .59, .8]} shirt="#cb7b5d" phase={2.1} reducedMotion={reducedMotion} />
    <Traveller position={[3.3, .59, -.6]} shirt="#718e6c" phase={3.2} walk={.2} reducedMotion={reducedMotion} />
    <Traveller position={[5.52, .59, .83]} shirt="#d8a767" phase={.2} reducedMotion={reducedMotion} />
    <Staircase x={-3.0} topY={.58} bottomY={-1.42} topZ={1.37} bottomZ={3.08} width={1.55} steps={13} />
    <Escalator x={2.55} topY={.58} bottomY={-1.42} topZ={1.38} bottomZ={3.05} reducedMotion={reducedMotion} />
  </group>;
}

function LowerPlatform({ reducedMotion }) {
  return <group>
    <FloorSlab position={[0, -1.42, 2.76]} size={[17, 2.28, .52]} color="#e3ceb0" />
    <FloorSlab position={[0, -1.68, 4.99]} size={[17, 2.18, .31]} color="#767e77" sideColor="#9a927c" />
    <Block position={[0, -1.355, 3.72]} size={[17, .035, .21]} color="#eacb77" castShadow={false} />
    {Array.from({ length: 42 }, (_, i) => <Block key={i} position={[-8.2 + i * .4, -1.329, 3.72]} size={[.12, .016, .085]} color="#f8e9b8" castShadow={false} />)}
    {Array.from({ length: 27 }, (_, i) => <Block key={i} position={[-8.1 + i * .62, -1.55, 4.98]} size={[.16, .1, 1.63]} color="#585f5c" castShadow={false} />)}
    {[4.34, 5.54].map(z => <Block key={z} position={[0, -1.43, z]} size={[17.12, .11, .1]} color="#c3c4b5" />)}
    <Block position={[0, -1.3, 1.69]} size={[17, .06, .13]} color="#fff0d1" castShadow={false} />
    <PlatformSign position={[-5.45, -.52, 2.22]} />
    <Bench position={[-6.7, -1.39, 3.06]} />
    <Bench position={[5.74, -1.39, 2.18]} rotation={[0, Math.PI, 0]} />
    <Planter position={[7.5, -1.4, 2.16]} width={.65} />
    <Traveller position={[-4.53, -1.39, 3.08]} shirt="#719d90" phase={1.3} walk={.19} reducedMotion={reducedMotion} />
    <Traveller position={[-1.5, -1.39, 2.55]} shirt="#e6ad65" phase={2.7} reducedMotion={reducedMotion} />
    <Traveller position={[.9, -1.39, 3.13]} shirt="#c98074" phase={.4} walk={.24} reducedMotion={reducedMotion} />
    <Traveller position={[4.37, -1.39, 2.7]} shirt="#647e9c" phase={1.9} reducedMotion={reducedMotion} />
    <Train reducedMotion={reducedMotion} />
  </group>;
}

export default function StationWorld({ journey, journeyRun, reducedMotion }) {
  const { size } = useThree();
  const mobile = size.width < 700;
  return <>
    <color attach="background" args={['#dce9e3']} />
    <fog attach="fog" args={['#dce9e3', 29, 62]} />
    <ambientLight intensity={.55} />
    <hemisphereLight args={['#fff2dc', '#8b9e94', 1.9]} />
    <directionalLight position={[-8, 15, 10]} intensity={2.7} color="#fff4dc" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={18} shadow-camera-bottom={-18} shadow-camera-near={1} shadow-camera-far={45} shadow-normalBias={.035} shadow-radius={3} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.75, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} /><meshStandardMaterial color="#d7e2d7" roughness={1} />
    </mesh>
    <ContactShadows position={[0, -3.71, 0]} opacity={.24} scale={28} blur={2.7} far={7} resolution={512} frames={1} color="#536c65" />
    <group>
      <FloorSlab position={[0, -2.55, 0]} size={[17.55, 12.2, .88]} color="#c9b99d" sideColor="#a88d72" />
      <Block position={[0, -2.16, -4.25]} size={[16.95, .75, 3.4]} color="#bea68d" />
      <StreetLevel reducedMotion={reducedMotion} />
      <Concourse reducedMotion={reducedMotion} />
      <LowerPlatform reducedMotion={reducedMotion} />
      <RouteMarker key={journeyRun} active={Boolean(journey)} reducedMotion={reducedMotion} />
    </group>
    <CameraFit />
    <EffectComposer multisampling={0}>
      <N8AO halfRes quality={mobile ? 'performance' : 'low'} aoRadius={.72} intensity={1.45} distanceFalloff={.75} />
    </EffectComposer>
    <OrbitControls target={[0, mobile ? -2.25 : .25, 0]} enablePan={false} enableDamping dampingFactor={.08} minPolarAngle={.55} maxPolarAngle={1.32} minAzimuthAngle={-.35} maxAzimuthAngle={1.7} minZoom={20} maxZoom={95} rotateSpeed={.47} zoomSpeed={.65} />
  </>;
}
