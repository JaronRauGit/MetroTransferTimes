import { createContext, useContext, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const WorldNightContext = createContext(false);
export function useWorldNight() { return useContext(WorldNightContext); }
export const WorldCompactContext = createContext(false);
export function useWorldCompact() { return useContext(WorldCompactContext); }

export function SceneReady({ onReady }) {
  const frames = useRef(0);
  useFrame(() => { if (++frames.current === 2) onReady(); });
  return null;
}
