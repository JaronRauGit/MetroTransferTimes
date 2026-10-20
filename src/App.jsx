import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import StationWorld from './world/StationWorld.jsx';
import CalculatorPanel from './components/CalculatorPanel.jsx';
import { emptyJourney } from './calculator.js';

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

function scrollToDepth(depth, reducedMotion) {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: distance * depth, behavior: reducedMotion ? 'auto' : 'smooth' });
}

export default function App() {
  const [values, setValues] = useState({ ...emptyJourney });
  const [journey, setJourney] = useState(null);
  const [journeyRun, setJourneyRun] = useState(0);
  const [depth, setDepth] = useState(0);
  const [sceneFailed, setSceneFailed] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const update = () => {
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      setDepth(distance > 0 ? Math.max(0, Math.min(1, window.scrollY / distance)) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  function handleJourney(next) {
    setJourney(next);
    if (next) {
      setJourneyRun(previous => previous + 1);
      scrollToDepth(.76, reducedMotion);
    }
  }

  const level = depth < .26 ? 'THE STREET' : depth < .68 ? 'THE TRANSFER' : 'LINE 4 PLATFORM';
  return <>
    <main className="experience">
      <div className="world-canvas" aria-label="Scroll through a three-dimensional cutaway of a Barcelona metro transfer">
        {!sceneFailed && <Canvas shadows="percentage" dpr={[1, 1.6]} gl={{ antialias: true, powerPreference: 'high-performance' }} orthographic camera={{ position: [20, 18, 21], zoom: 46, near: .1, far: 120 }} onCreated={({ gl }) => { gl.toneMappingExposure = 1.08; }} onError={() => setSceneFailed(true)}>
          <StationWorld values={values} journey={journey} journeyRun={journeyRun} depth={depth} reducedMotion={reducedMotion} />
        </Canvas>}
        {sceneFailed && <p className="scene-fallback">The 3D station could not start in this browser. The calculator is still available.</p>}
      </div>
      <div className="interface-layer">
        <header className="scene-header">
          <div className="wordmark"><span className="wordmark-symbol">M</span><div><strong>between<span>/</span>the lines</strong><small>AN INTERACTIVE METRO CUTAWAY</small></div></div>
          <div className="station-status"><span className="status-light" /><span>PASSEIG DE GRÀCIA</span><b>L3 <i>→</i> L4</b></div>
        </header>
        <CalculatorPanel values={values} onValuesChange={setValues} onJourney={handleJourney} />
        <nav className="depth-nav" aria-label="Station levels">
          {[['Street', 0], ['Transfer', .49], ['Platform', 1]].map(([name, position], index) => <button key={name} type="button" className={Math.abs(depth - position) < .21 ? 'active' : ''} onClick={() => scrollToDepth(position, reducedMotion)} aria-label={`View ${name.toLowerCase()} level`} aria-current={Math.abs(depth - position) < .21 ? 'step' : undefined}><span className="depth-dot" /><span className="depth-number">0{index + 1}</span><span className="depth-name">{name}</span></button>)}
        </nav>
        <div className="world-caption"><span className="caption-line" /><div><strong>{level}</strong><span>{depth > .84 ? 'THE CITY IS ABOVE YOU' : 'SCROLL TO SEE THROUGH THE CITY'}</span></div></div>
        <div className="scroll-hint"><span aria-hidden="true">{depth > .84 ? '↑' : '↓'}</span> {depth > .84 ? 'SCROLL BACK TO THE STREET' : 'SCROLL THROUGH THE STATION'}</div>
      </div>
    </main>
    <div className="scroll-track" aria-hidden="true" />
  </>;
}
