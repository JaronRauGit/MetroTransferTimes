import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, DataTexture, EquirectangularReflectionMapping, FloatType, LinearSRGBColorSpace, Object3D, PMREMGenerator, RGBAFormat, Vector3 } from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { worldPalettes } from '../appearance.js';
import { lightingProfiles, lightingQuality } from './lighting.js';
import LocalLight from './LocalLight.jsx';
import { useWorldMotion } from './WorldMotion.jsx';

// Shared sources follow the visible trains and passenger. Previews reuse the
// same light budget instead of recompiling the whole world's lighting shaders.
function MovingLights({ night }) {
  const lamps = useRef([]), trains = useRef({ active: null });
  const passengerLamp = useRef();
  const scene = useThree(state => state.scene);
  const motion = useWorldMotion();
  useFrame(() => {
    const active = motion.current.snapshot.active;
    if (trains.current.active !== active) {
      trains.current = {
        active,
        source: [scene.getObjectByName('featured-source-train'), scene.getObjectByName('ambient-source-train')],
        destination: [scene.getObjectByName('featured-destination-train'), scene.getObjectByName('ambient-destination-train')],
        passenger: scene.getObjectByName('featured-passenger'),
      };
    }
    ['source', 'destination'].forEach((role, index) => {
      const lamp = lamps.current[index];
      if (!lamp) return;
      const train = trains.current[role].find(object => object?.visible && object.parent);
      lamp.intensity = 0;
      if (!night || !train) return;
      const [start, end] = train.userData.lightBounds;
      const x = train.position.x + 1.61;
      if (x < start || x > end) return;
      train.updateWorldMatrix(true, false);
      lamp.position.set(1.61, 1.1, 1.02).applyMatrix4(train.matrixWorld);
      const edgeFade = Math.min(1, (x - start) / .8, (end - x) / .8);
      lamp.intensity = 3.2 * (train.userData.lightOpacity ?? 1) * edgeFade;
    });
    if (passengerLamp.current) {
      const passenger = trains.current.passenger;
      passengerLamp.current.intensity = active && passenger?.visible ? 1.2 : 0;
      if (passenger?.visible) {
        passenger.updateWorldMatrix(true, false);
        passengerLamp.current.position.set(0, 1, 0).applyMatrix4(passenger.matrixWorld);
      }
    }
  }, -.3);
  return <group name="train-window-lighting">
    {[0, 1].map(index => <pointLight key={index} ref={node => { lamps.current[index] = node; }} name={`train-window-spill-${index}`} intensity={0} color="#ffda9f" distance={2.4} decay={2} />)}
    <pointLight ref={passengerLamp} name="passenger-fill" intensity={0} color="#ffcd91" distance={2.5} decay={2} />
  </group>;
}

RectAreaLightUniformsLib.init();

// A blurred, low-contrast sky reflection, generated once per mood. No remote HDRI,
// screen-space mirrors, animated reflection probes, or sharp artificial hotspots.
function SkyReflection({ theme }) {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const profile = lightingProfiles[theme];
    const top = new Color(profile.skyTop), horizon = new Color(profile.horizon), ground = new Color(profile.skyGround);
    const width = 128, height = 64, pixels = new Float32Array(width * height * 4);
    const colour = new Color();
    for (let y = 0; y < height; y++) {
      const elevation = Math.cos(Math.PI * (y + .5) / height);
      colour.copy(horizon).lerp(elevation > 0 ? top : ground, Math.pow(Math.abs(elevation), .6));
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        pixels[index] = colour.r; pixels[index + 1] = colour.g; pixels[index + 2] = colour.b; pixels[index + 3] = 1;
      }
    }
    const texture = new DataTexture(pixels, width, height, RGBAFormat, FloatType);
    texture.mapping = EquirectangularReflectionMapping;
    texture.colorSpace = LinearSRGBColorSpace;
    texture.needsUpdate = true;
    const generator = new PMREMGenerator(gl);
    const reflection = generator.fromEquirectangular(texture);
    const previous = scene.environment, previousIntensity = scene.environmentIntensity;
    scene.environment = reflection.texture;
    scene.environmentIntensity = profile.environment;
    texture.dispose(); generator.dispose();
    return () => {
      scene.environment = previous;
      scene.environmentIntensity = previousIntensity;
      reflection.dispose();
    };
  }, [gl, scene, theme]);
  return null;
}

export default function WorldLighting({ layout: l, theme, compact }) {
  const gl = useThree(state => state.gl);
  const profile = lightingProfiles[theme], palette = worldPalettes[theme];
  useLayoutEffect(() => { gl.toneMappingExposure = profile.exposure; }, [gl, profile.exposure]);
  const quality = lightingQuality(compact);
  const sunTarget = useMemo(() => new Vector3((l.streetMinX + l.streetMaxX) / 2, -1, 0), [l.streetMinX, l.streetMaxX]);
  const target = useMemo(() => new Object3D(), []);
  return <group name="world-lighting">
    <SkyReflection theme={theme} />
    <MovingLights night={theme === 'dark'} />
    <ambientLight intensity={profile.ambient} color={palette.sky} />
    <hemisphereLight args={[palette.sky, palette.bounce, profile.sky]} />
    <primitive object={target} position={sunTarget} />
    <directionalLight name="sun-or-moon" target={target} position={[sunTarget.x - 22, 27, 16]} intensity={profile.sun} color={palette.sunlight} castShadow shadow-mapSize={[quality.sunShadowSize, quality.sunShadowSize]} shadow-camera-left={-36} shadow-camera-right={36} shadow-camera-top={30} shadow-camera-bottom={-30} shadow-camera-near={1} shadow-camera-far={95} shadow-bias={-.00015} shadow-normalBias={compact ? .025 : .04} shadow-radius={compact ? 2.5 : 5} />
    {/* Long ceiling luminaires face down, rather than washing every level with
        omnidirectional lights. Their actual emitting areas light the platforms. */}
    <group name="station-lighting">
      <rectAreaLight name="upper-ceiling-light" position={[l.upperX, l.upperY + 1.98, -.3]} rotation={[-Math.PI / 2, 0, 0]} width={13.5} height={1.2} intensity={profile.station} color="#ffe0ad" />
      <rectAreaLight name="transfer-ceiling-light" position={[(l.tunnelStartX + l.tunnelEndX) / 2, l.tunnelY + 1.92, l.tunnelZ]} rotation={[-Math.PI / 2, 0, 0]} width={l.corridorLength - .2} height={1.15} intensity={profile.station} color="#ffe5bc" />
      <rectAreaLight name="lower-ceiling-light" position={[l.lowerX + .3, l.lowerY + 1.98, l.lowerZ]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} width={13.5} height={1.2} intensity={profile.station} color="#ffe0ad" />
    </group>
    <LocalLight name="casa-window-spill" position={[l.upperX - 1.82, l.streetY + 1.03, -4.1]} target={[0, -1, 1.05]} reach={1.9} power={10} angle={.6} color="#ffd5a0" />
    {quality.windowSpills > 1 && <LocalLight name="corner-window-spill" position={[l.lowerX + 2.08, l.streetY + 1.12, -4.22]} target={[0, -1.08, 1.05]} reach={2} power={10} angle={.6} color="#ffe2b0" />}
  </group>;
}
