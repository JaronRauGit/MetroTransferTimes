import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useWorldMotion } from './WorldMotion.jsx';
import { simulationTiming } from '../simulation.js';

// Project into the existing HTML tree. No nested React roots, DOM mounts, or
// React state updates are needed when a simulation starts or a frame advances.
export function PassengerClock({ target }) {
  const anchor = useRef(), clearance = useRef(88);
  const point = useMemo(() => new Vector3(), []);
  const { size, camera } = useThree(), motion = useWorldMotion();
  useLayoutEffect(() => {
    const header = document.querySelector('.scene-header')?.getBoundingClientRect();
    const world = document.querySelector('.world-canvas')?.getBoundingClientRect();
    clearance.current = header && world ? header.bottom - world.top + 10 : 88;
  }, [size.width, size.height]);
  useFrame(() => {
    const bubble = target?.current;
    if (!bubble) return;
    const { seconds, active, elapsed } = motion.current.snapshot;
    if (!active || elapsed < simulationTiming.introStart || elapsed >= simulationTiming.walkEnd) {
      bubble.style.display = 'none'; return;
    }
    anchor.current.getWorldPosition(point).project(camera);
    const maxY = Math.max(21, size.height - 33), minY = Math.min(maxY, 21 + clearance.current);
    const x = Math.max(61, Math.min(size.width - 61, (point.x + 1) * size.width / 2));
    const y = Math.max(minY, Math.min(maxY, (1 - point.y) * size.height / 2));
    bubble.style.display = 'block';
    bubble.style.transform = `translate(${x - 52}px, ${y - 21}px)`;
    const total = Math.floor(seconds);
    bubble.children[1].textContent = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    bubble.children[2].textContent = `.${String(Math.floor(seconds % 1 * 100)).padStart(2, '0')}`;
  });
  return <object3D ref={anchor} position={[0, 1.85, 0]} />;
}
