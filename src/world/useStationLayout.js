import { useEffect, useMemo, useRef, useState } from 'react';
import { getStationLayout, getStationShape, interpolateStationShape } from './stationLayout.js';

export default function useStationLayout(values, reducedMotion) {
  const target = useMemo(() => getStationShape(values), [values]);
  const current = useRef(target);
  const [shape, setShape] = useState(target);
  const [transitioning, setTransitioning] = useState(false);
  useEffect(() => {
    if (reducedMotion || Object.keys(target).every(key => current.current[key] === target[key])) {
      current.current = target; setShape(target); setTransitioning(false); return;
    }
    const from = current.current;
    const started = performance.now();
    let frame, last = -Infinity;
    setTransitioning(true);
    const advance = time => {
      const progress = Math.min(1, (time - started) / 800);
      if (time - last >= 1000 / 30 || progress === 1) {
        current.current = interpolateStationShape(from, target, progress);
        setShape(current.current);
        last = time;
      }
      if (progress < 1) frame = requestAnimationFrame(advance);
      else setTransitioning(false);
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [target, reducedMotion]);
  return { layout: useMemo(() => getStationLayout(values, shape), [values, shape]), transitioning };
}
