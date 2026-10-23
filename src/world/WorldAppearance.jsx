import { createContext, useContext, useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export const WorldNightContext = createContext(false);
export function useWorldNight() { return useContext(WorldNightContext); }
export const WorldCompactContext = createContext(false);
export function useWorldCompact() { return useContext(WorldCompactContext); }

export function SceneReady({ onReady }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let cancelled = false;
    // Includes the pre-mounted, hidden featured train and passenger materials.
    gl.compileAsync(scene, camera).then(() => { if (!cancelled) onReady(); });
    return () => { cancelled = true; };
  }, [gl, scene, camera, onReady]);
  return null;
}
