import { useCallback, useEffect, useRef, useState } from 'react';
import { calculateTransfer } from './calculator.js';
import { createPlayback, simulationTiming } from './simulation.js';

export default function useCalculation(reducedMotion) {
  const [run, setRun] = useState(null);
  const [result, setResult] = useState(null);
  const sequence = useRef(0);
  const current = useRef(null);
  const cancel = useCallback(() => { current.current = null; setRun(null); setResult(null); }, []);
  const finish = useCallback(() => {
    if (!run || run.status !== 'running' || current.current?.id !== run.id) return;
    current.current = { ...run, status: 'complete' };
    setResult(run.result);
    setRun(current => current?.id === run.id ? { ...current, status: 'complete' } : current);
  }, [run]);
  useEffect(() => {
    if (run?.status !== 'running') return;
    if (reducedMotion) { finish(); return; }
    const tick = () => { if (run.playback.elapsed >= simulationTiming.duration) finish(); };
    const timer = window.setInterval(tick, 100);
    document.addEventListener('visibilitychange', tick);
    tick();
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, [run, finish, reducedMotion]);
  function start(values, station) {
    const next = calculateTransfer(values);
    if (reducedMotion || next.seconds === 0) { current.current = null; setRun(null); setResult(next); return; }
    setResult(null);
    const nextRun = { id: ++sequence.current, startedAt: Date.now(), playback: createPlayback(), status: 'running', character: Math.random() < .5 ? 'man' : 'woman', values: { ...values }, station: { ...station }, result: next };
    current.current = nextRun;
    setRun(nextRun);
  }
  return { run, result, start, cancel, finish, running: run?.status === 'running' };
}
