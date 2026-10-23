import { createContext, useContext, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { advancePlayback, simulationSnapshot } from '../simulation.js';

const MotionContext = createContext(null);
export function WorldMotion({ simulation, reducedMotion, ready = true, children }) {
  const motion = useRef({ time: 0, snapshot: simulationSnapshot(null) });
  useFrame((_, delta) => {
    if (simulation?.status === 'running' && simulation.playback) advancePlayback(simulation.playback, delta, ready, !document.hidden);
    const snapshot = simulationSnapshot(simulation);
    motion.current.playback = simulation?.playback;
    motion.current.snapshot = snapshot;
    const speed = snapshot.active && !reducedMotion ? 1 + 19 * snapshot.desaturation : 1;
    motion.current.time += Math.min(delta, .1) * speed;
  }, -2);
  return <MotionContext.Provider value={motion}>{children}</MotionContext.Provider>;
}
export function useWorldMotion() { return useContext(MotionContext); }
