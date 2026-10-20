import { useEffect, useRef, useState } from 'react';
import { calculateTransfer } from './calculator.js';
import { validationSnapshot } from './validation.js';

export default function useValidation() {
  const [run, setRun] = useState(null);
  const [now, setNow] = useState(Date.now);
  const sequence = useRef(0);
  useEffect(() => {
    if (run?.status !== 'running') return;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      if (validationSnapshot(run, time).complete) setRun(current => current?.id === run.id ? { ...current, status: 'arrived', celebrationAt: time } : current);
    };
    const interval = window.setInterval(tick, 250);
    window.addEventListener('focus', tick);
    document.addEventListener('visibilitychange', tick);
    tick();
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', tick);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [run]);

  function start(values, station) {
    const { seconds } = calculateTransfer(values);
    if (seconds <= 0) return;
    const startedAt = Date.now();
    setNow(startedAt);
    setRun({ id: ++sequence.current, startedAt, duration: seconds, values: { ...values }, station: { ...station }, status: 'running' });
  }
  return { run, snapshot: validationSnapshot(run, now), start, cancel: () => setRun(null) };
}
