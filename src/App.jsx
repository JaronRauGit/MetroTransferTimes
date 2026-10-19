import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import StationWorld from './world/StationWorld.jsx';
import CalculatorPanel from './components/CalculatorPanel.jsx';

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
  const [journey, setJourney] = useState(null);
  const [journeyRun, setJourneyRun] = useState(0);
  const [sceneFailed, setSceneFailed] = useState(false);
  const reducedMotion = useReducedMotion();

  function handleJourney(next) {
    setJourney(next);
    if (next) setJourneyRun(previous => previous + 1);
  }

  return <main className="experience">
    <div className="world-canvas" aria-label="Interactive three-dimensional miniature of a Barcelona metro station">
      {!sceneFailed && <Canvas shadows="percentage" dpr={[1, 1.6]} gl={{ antialias: true, powerPreference: 'high-performance' }} orthographic camera={{ position: [18, 14, 20], zoom: 55, near: 0.1, far: 100 }} onCreated={({ gl }) => { gl.toneMappingExposure = 1.08; }} onError={() => setSceneFailed(true)}>
        <StationWorld journey={journey} journeyRun={journeyRun} reducedMotion={reducedMotion} />
      </Canvas>}
      {sceneFailed && <p className="scene-fallback">The 3D station could not start in this browser. The calculator is still available.</p>}
    </div>
    <div className="interface-layer">
      <header className="scene-header"><div className="wordmark"><span className="wordmark-symbol">M</span><div><strong>between<span>/</span>the lines</strong><small>BARCELONA METRO MINIATURE</small></div></div><div className="station-status"><span className="status-light" /><span>CATALUNYA <b>·</b> INTERCHANGE</span><span className="status-time">A LITTLE WORLD IN MOTION</span></div></header>
      <CalculatorPanel onJourney={handleJourney} />
      <div className="world-caption"><span className="caption-line" /><div><strong>CATALUNYA</strong><span>STREET → CONCOURSE → PLATFORM</span></div></div>
      <div className="scene-controls"><span aria-hidden="true">✧</span> DRAG TO LOOK AROUND <span className="zoom-hint">· SCROLL TO ZOOM</span></div>
    </div>
  </main>;
}
