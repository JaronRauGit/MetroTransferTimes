import { useLayoutEffect, useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useWorldMotion } from './WorldMotion.jsx';
import { simulationTiming } from '../simulation.js';

const screenPosition = (width, height, clearance) => (object, camera, size) => {
  const point = object.getWorldPosition(new Vector3()).project(camera);
  const maxY = Math.max(height / 2, size.height - height / 2 - 12);
  const minY = Math.min(maxY, height / 2 + clearance.current);
  return [Math.max(width / 2 + 9, Math.min(size.width - width / 2 - 9, (point.x + 1) * size.width / 2)), Math.max(minY, Math.min(maxY, (1 - point.y) * size.height / 2))];
};
export function PassengerClock() {
  const bubble = useRef(), clock = useRef(), fraction = useRef();
  const clearance = useRef(88);
  const { size } = useThree();
  const clockPosition = useMemo(() => screenPosition(104, 42, clearance), []);
  useLayoutEffect(() => {
    const header = document.querySelector('.scene-header')?.getBoundingClientRect();
    const world = document.querySelector('.world-canvas')?.getBoundingClientRect();
    clearance.current = header && world ? header.bottom - world.top + 10 : 88;
  }, [size.width, size.height]);
  const motion = useWorldMotion();
  useFrame(() => {
    if (!bubble.current) return;
    const { seconds, active, elapsed } = motion.current.snapshot;
    bubble.current.style.display = active && elapsed >= simulationTiming.introStart && elapsed < simulationTiming.walkEnd ? 'block' : 'none';
    const total = Math.floor(seconds);
    clock.current.textContent = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    fraction.current.textContent = `.${String(Math.floor(seconds % 1 * 100)).padStart(2, '0')}`;
  });
  return <Html center position={[0, 1.85, 0]} calculatePosition={clockPosition} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}><div className="passenger-clock" ref={bubble} style={{ display: 'none' }} aria-hidden="true"><span>TRANSFER TIME</span><strong ref={clock}>00:00</strong><small ref={fraction}>.00</small></div></Html>;
}
