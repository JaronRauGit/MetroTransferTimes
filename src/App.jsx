import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import StationWorld from './world/StationWorld.jsx';
import CalculatorPanel from './components/CalculatorPanel.jsx';
import { defaultJourney } from './calculator.js';
import { defaultStationPreset } from './stationPresets.js';
import useValidation from './useValidation.js';
import useCalculation from './useCalculation.js';

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
  const [mode, setMode] = useState('mapped');
  const [mappedRoute, setMappedRoute] = useState(defaultStationPreset);
  const [customValues, setCustomValues] = useState({ ...defaultJourney });
  const [customStation, setCustomStation] = useState({ name: 'My station', fromLine: 'L3', toLine: 'L5' });
  const values = mode === 'mapped' ? mappedRoute.values : customValues;
  const station = mode === 'mapped' ? mappedRoute.station : customStation;
  const validation = useValidation();
  const [sceneFailed, setSceneFailed] = useState(false);
  const reducedMotion = useReducedMotion();

  const calculation = useCalculation(reducedMotion);

  function resetWork() { validation.cancel(); calculation.cancel(); }

  return <main className="experience">
    <div className="world-canvas" aria-label="Three-dimensional Barcelona metro cutaway with street and two crossing underground platforms">
      {!sceneFailed && <Canvas shadows="percentage" dpr={[1, 1.6]} gl={{ antialias: true, powerPreference: 'high-performance' }} orthographic camera={{ position: [23, 18.96, 22.85], zoom: 40, near: .1, far: 130 }} onCreated={({ gl }) => { gl.toneMappingExposure = 1.08; gl.localClippingEnabled = true; }} onError={() => setSceneFailed(true)}>
        <StationWorld values={values} station={station} validation={validation.run} simulation={calculation.run} result={calculation.result} reducedMotion={reducedMotion} />
      </Canvas>}
      {sceneFailed && <p className="scene-fallback">The 3D station could not start in this browser. The calculator is still available below.</p>}
      <header className="scene-header">
        <div className="wordmark"><span className="wordmark-symbol">M</span><div><strong>between<span>/</span>the lines</strong><small>BARCELONA METRO MINIATURE</small></div></div>
        <div className="station-status"><span className="status-light" /><span>{station.name.trim() || 'Custom station'}</span><b>{station.fromLine} <i>→</i> {station.toLine}</b></div>
      </header>
      <div className="scene-instruction"><span aria-hidden="true">✦</span> DRAG TO TURN <i>·</i> SCROLL TO ZOOM</div>
    </div>
    <CalculatorPanel mode={mode} values={values} station={station}
      onModeChange={next => { resetWork(); setMode(next); }}
      onMappedChange={next => { resetWork(); setMappedRoute(next); }}
      onValuesChange={next => { resetWork(); setCustomValues(next); }}
      onStationChange={next => { resetWork(); setCustomStation(next); }}
      validation={validation} calculation={calculation} />
  </main>;
}
