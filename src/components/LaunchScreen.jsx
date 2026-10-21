import { useEffect, useState } from 'react';

export function useLaunchScreen(ready, reducedMotion) {
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [deadlineReached, setDeadlineReached] = useState(false);
  const [phase, setPhase] = useState('opening');
  useEffect(() => {
    const minimum = window.setTimeout(() => setMinimumElapsed(true), reducedMotion ? 350 : 1500);
    const deadline = window.setTimeout(() => setDeadlineReached(true), 3600);
    return () => { window.clearTimeout(minimum); window.clearTimeout(deadline); };
  }, [reducedMotion]);
  useEffect(() => {
    if (phase === 'opening' && ((minimumElapsed && ready) || deadlineReached)) setPhase('leaving');
  }, [minimumElapsed, ready, deadlineReached, phase]);
  useEffect(() => {
    if (phase !== 'leaving') return;
    const fade = window.setTimeout(() => setPhase('finished'), reducedMotion ? 0 : 450);
    return () => window.clearTimeout(fade);
  }, [phase, reducedMotion]);
  return phase;
}

export default function LaunchScreen({ phase }) {
  return <div className={`launch-screen is-${phase}`} role="status" aria-live="polite" aria-label="Opening Between the Lines">
    <div className="launch-copy"><span className="launch-kicker">A LITTLE BARCELONA. A BETTER CONNECTION.</span>
      <h1><span className="launch-metro" aria-hidden="true">M</span>between<span className="launch-slash">/</span>the lines</h1>
      <div className="launch-track" aria-hidden="true"><span /><i /><span /></div>
      <p>Opening the station<span className="launch-dots" aria-hidden="true">…</span></p>
    </div>
  </div>;
}
