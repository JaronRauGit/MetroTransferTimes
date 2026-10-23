import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, DataTexture, EquirectangularReflectionMapping, FloatType, LinearSRGBColorSpace, NeutralToneMapping, Object3D, PMREMGenerator, RGBAFormat } from 'three';
import { worldPalettes } from '../appearance.js';
import { lightingProfiles, lightingQuality } from './lighting.js';
import { useWorldMotion } from './WorldMotion.jsx';

// The same low-contrast reflection is shared by both moods. Switching the sun
// updates uniforms, rather than rebuilding dozens of cubemap render passes.
function SkyReflection() {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const profile = lightingProfiles.light;
    const top = new Color(profile.skyTop), horizon = new Color(profile.horizon), ground = new Color(profile.skyGround);
    const width = 64, height = 32, pixels = new Float32Array(width * height * 4), colour = new Color();
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
    const generator = new PMREMGenerator(gl), reflection = generator.fromEquirectangular(texture);
    const previous = scene.environment;
    scene.environment = reflection.texture;
    texture.dispose(); generator.dispose();
    return () => { scene.environment = previous; reflection.dispose(); };
  }, [gl, scene]);
  return null;
}

function PassengerLight() {
  const lamp = useRef(), passenger = useRef();
  const scene = useThree(state => state.scene), motion = useWorldMotion();
  useFrame(() => {
    passenger.current ??= scene.getObjectByName('featured-passenger');
    const object = passenger.current;
    lamp.current.intensity = motion.current.snapshot.active && object?.visible ? 1.2 : 0;
    if (lamp.current.intensity) {
      object.updateWorldMatrix(true, false);
      lamp.current.position.set(0, 1, 0).applyMatrix4(object.matrixWorld);
    }
  }, -.3);
  return <pointLight ref={lamp} name="passenger-fill" intensity={0} color="#ffcd91" distance={2.5} decay={2} />;
}

export default function WorldLighting({ layout: l, theme, compact }) {
  const { gl, scene } = useThree();
  const profile = lightingProfiles[theme], palette = worldPalettes[theme], quality = lightingQuality(compact);
  useLayoutEffect(() => {
    gl.toneMapping = NeutralToneMapping;
    gl.toneMappingExposure = profile.exposure;
    scene.environmentIntensity = profile.environment;
  }, [gl, scene, profile]);
  const target = useMemo(() => new Object3D(), []);
  const center = (l.streetMinX + l.streetMaxX) / 2;
  return <group name="world-lighting">
    <SkyReflection />
    <PassengerLight />
    <ambientLight intensity={profile.ambient} color={palette.sky} />
    <hemisphereLight args={[palette.sky, palette.bounce, profile.sky]} />
    <primitive object={target} position={[center, -1, 0]} />
    <directionalLight name="sun-or-moon" target={target} position={[center - 22, 27, 16]} intensity={profile.sun} color={palette.sunlight} castShadow shadow-mapSize={[quality.sunShadowSize, quality.sunShadowSize]} shadow-camera-left={-36} shadow-camera-right={36} shadow-camera-top={30} shadow-camera-bottom={-30} shadow-camera-near={1} shadow-camera-far={95} shadow-bias={-.00015} shadow-normalBias={.04} shadow-radius={3} />
  </group>;
}
