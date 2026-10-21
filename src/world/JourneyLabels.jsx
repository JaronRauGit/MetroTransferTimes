import { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useWorldMotion } from './WorldMotion.jsx';
import { simulationTiming } from '../simulation.js';

const screenPosition = (width, height) => (object, camera, size) => {
  const point = object.getWorldPosition(new Vector3()).project(camera);
  return [Math.max(width / 2 + 9, Math.min(size.width - width / 2 - 9, (point.x + 1) * size.width / 2)), Math.max(height / 2 + 55, Math.min(size.height - height / 2 - 12, (1 - point.y) * size.height / 2))];
};
const clockPosition = screenPosition(104, 42);

export function PassengerClock() {
  const bubble = useRef(), clock = useRef(), fraction = useRef();
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
