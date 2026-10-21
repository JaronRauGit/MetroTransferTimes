import { createContext, useContext, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { simulationSnapshot } from '../simulation.js';

const MotionContext = createContext(null);
export function WorldMotion({ simulation, reducedMotion, children }) {
  const motion = useRef({ time: 0, snapshot: simulationSnapshot(null) });
  useFrame((_, delta) => {
    const snapshot = simulationSnapshot(simulation);
    motion.current.snapshot = snapshot;
    const speed = snapshot.active && !reducedMotion ? 1 + 19 * snapshot.desaturation : 1;
    motion.current.time += Math.min(delta, .1) * speed;
  }, -2);
  return <MotionContext.Provider value={motion}>{children}</MotionContext.Provider>;
}
export function useWorldMotion() { return useContext(MotionContext); }
