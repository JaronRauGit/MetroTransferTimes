import { createContext, useContext, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const WorldNightContext = createContext(false);
export function useWorldNight() { return useContext(WorldNightContext); }

export function SceneReady({ onReady }) {
  const frames = useRef(0);
  useFrame(() => { if (++frames.current === 2) onReady(); });
  return null;
}

export function StationNightLights({ layout: l }) {
  return <group name="station-night-lights">
    <pointLight position={[l.upperX, l.upperY + 2.1, .8]} intensity={7} decay={1} distance={22} color="#ffd29a" />
    <pointLight position={[(l.tunnelStartX + l.tunnelEndX) / 2, l.tunnelY + 1.65, l.tunnelZ]} intensity={8} decay={1} distance={24} color="#ffe1ad" />
    <pointLight position={[l.lowerX + .7, l.lowerY + 2.1, 1]} intensity={7} decay={1} distance={22} color="#ffd29a" />
  </group>;
}
