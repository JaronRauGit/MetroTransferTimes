import { useEffect, useRef, useState } from 'react';
import { simulationSnapshot } from '../simulation.js';

const messages = [
  'Coordinating two very punctual trains…',
  'Making room for the cyclist…',
  'Simulating slow pedestrians checking their phones…',
  'Finding the least crowded staircase…',
  'Stopping for the station musician…',
  'Leaving 50 cents for the musician…',
  'Catching the next train. Perfect timing.',
];
export default function SimulationLoading({ calculation }) {
  const [now, setNow] = useState(Date.now);
  const panel = useRef();
  useEffect(() => {
    panel.current.focus({ preventScroll: true });
    const tick = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(tick);
  }, []);
  const state = simulationSnapshot(calculation.run, now);
  const message = messages[Math.min(messages.length - 1, Math.floor(state.progress * messages.length))];
  return <div className="simulation-loading" ref={panel} tabIndex={-1} aria-label="Simulation in progress">
    <h2>Simulating your connection</h2>
    <p className="loading-message" key={message} role="status" aria-live="off">{message}</p>
    <div className="loading-progress" role="progressbar" aria-label="Simulation progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(state.progress * 100)}><span style={{ width: `${state.progress * 100}%` }} /></div>
  </div>;
}
