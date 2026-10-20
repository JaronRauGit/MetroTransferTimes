import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import StationWorld from './world/StationWorld.jsx';
import CalculatorPanel from './components/CalculatorPanel.jsx';
import { defaultJourney } from './calculator.js';

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

export default function App() {
  const [values, setValues] = useState({ ...defaultJourney });
  const [station, setStation] = useState({ name: 'Verdaguer', fromLine: 'L4', toLine: 'L5' });
  const [journey, setJourney] = useState(null);
  const [journeyRun, setJourneyRun] = useState(0);
  const [sceneFailed, setSceneFailed] = useState(false);
  const reducedMotion = useReducedMotion();

  function handleJourney(next) {
    setJourney(next);
    if (next) setJourneyRun(previous => previous + 1);
  }

  return <main className="experience">
    <div className="world-canvas" aria-label="Three-dimensional Barcelona metro cutaway with street and two crossing underground platforms">
      {!sceneFailed && <Canvas shadows="percentage" dpr={[1, 1.6]} gl={{ antialias: true, powerPreference: 'high-performance' }} orthographic camera={{ position: [23, 18.96, 22.85], zoom: 40, near: .1, far: 130 }} onCreated={({ gl }) => { gl.toneMappingExposure = 1.08; gl.localClippingEnabled = true; }} onError={() => setSceneFailed(true)}>
        <StationWorld values={values} station={station} journey={journey} journeyRun={journeyRun} reducedMotion={reducedMotion} />
      </Canvas>}
      {sceneFailed && <p className="scene-fallback">The 3D station could not start in this browser. The calculator is still available below.</p>}
      <header className="scene-header">
        <div className="wordmark"><span className="wordmark-symbol">M</span><div><strong>between<span>/</span>the lines</strong><small>BARCELONA METRO MINIATURE</small></div></div>
        <div className="station-status"><span className="status-light" /><span>{station.name.trim() || 'Verdaguer'}</span><b>{station.fromLine} <i>→</i> {station.toLine}</b></div>
      </header>
      <div className="scene-instruction"><span aria-hidden="true">✦</span> DRAG TO TURN <i>·</i> SCROLL TO ZOOM</div>
    </div>
    <CalculatorPanel values={values} station={station} onValuesChange={setValues} onStationChange={setStation} onJourney={handleJourney} />
  </main>;
}
