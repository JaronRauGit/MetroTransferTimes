import { useEffect, useState } from 'react';
import { simulationSnapshot } from '../simulation.js';

function stopwatch(seconds) {
  const total = Math.floor(seconds);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
export default function SimulationOverlay({ run, onFinish }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (run?.status !== 'running') return;
    let frame, last = 0;
    const tick = time => { if (time - last > 33) { setNow(Date.now()); last = time; } frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run]);
  if (run?.status !== 'running') return null;
  const state = simulationSnapshot(run, now);
  return <div className="journey-stopwatch" aria-label="Transfer calculation preview">
    <div className="stopwatch-top"><span className="live-dot" /> YOUR CONNECTION, IN MOTION <span className="speed-label">FAST FORWARD</span></div>
    <div className="stopwatch-face">
      <svg className="stopwatch-icon" viewBox="0 0 64 72" aria-hidden="true"><path d="M26 3h12M32 3v8M49 14l5-5" /><circle cx="32" cy="41" r="26" /><path d="M32 21v20l10 8" style={{ transform: `rotate(${state.journey * 1440}deg)`, transformOrigin: '32px 41px' }} /></svg>
      <span id="simulation-seconds" role="timer" aria-live="off">{stopwatch(state.seconds)}<small>.{String(Math.floor(state.seconds % 1 * 100)).padStart(2, '0')}</small></span>
    </div>
    <p>{state.stage}</p>
    <div className="simulation-track"><span style={{ width: `${state.progress * 100}%` }} /></div>
    <div className="stopwatch-bottom"><span>A little journey. Your full estimate.</span><button type="button" onClick={onFinish}>Show result ↗</button></div>
  </div>;
}
