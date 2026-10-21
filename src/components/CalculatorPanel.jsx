import { useEffect, useRef, useState } from 'react';
import { getStationPreset, measurementSource, stationPresets } from '../stationPresets.js';
import MappedPlanner from './MappedPlanner.jsx';
import SimulationLoading from './SimulationLoading.jsx';
import ValidationPanel from './ValidationPanel.jsx';

const fields = [
  { id: 'walkDistance', label: 'Walking distance', unit: 'm', glyph: '→', hint: 'Exclude the moving walkway', step: 'any' },
  { id: 'escalatorDistance', label: 'Escalator', unit: 'steps', glyph: '↗', hint: 'Count the stairs beside it', step: '1' },
  { id: 'numSteps', label: 'Stairs', unit: 'steps', glyph: '▤', hint: 'Only without an escalator', step: '1' },
  { id: 'walkwayLength', label: 'Moving walkway', unit: 'm', glyph: '⇢', hint: 'Separate from walking distance', step: 'any' },
];

export default function CalculatorPanel({ mode, values, station, onModeChange, onMappedChange, onValuesChange, validation, calculation }) {
  const [formError, setFormError] = useState('');
  const [info, setInfo] = useState(null);
  const dock = useRef(), result = useRef();
  const previousMode = useRef(mode);
  useEffect(() => {
    if (previousMode.current === mode) return;
    previousMode.current = mode;
    dock.current.scrollTop = 0;
    document.getElementById('calculator-title')?.focus({ preventScroll: true });
  }, [mode]);
  useEffect(() => {
    if (calculation.running || calculation.result) dock.current.scrollTop = 0;
    if (calculation.result) result.current.focus({ preventScroll: true });
  }, [calculation.running, calculation.result]);
  function start(event) {
    event?.preventDefault();
    if (event?.currentTarget.tagName === 'FORM' && !event.currentTarget.reportValidity()) return;
    try { validation.cancel(); calculation.start(values, station); setFormError(''); }
    catch { setFormError('Please enter smaller, finite distances and step counts.'); }
  }
  function switchMode(next) { setFormError(''); onModeChange(next); }
  function update(id, value) { onValuesChange(current => ({ ...current, [id]: value })); setFormError(''); }
  return <section ref={dock} className={`calculator-dock${calculation.running ? ' is-calculating' : ''}`} aria-label="Metro transfer tools">
    <div className="dock-edge" aria-hidden="true" />
    <div className="dock-content" inert={calculation.running ? true : undefined} aria-hidden={calculation.running ? true : undefined}>
      {calculation.result && <div className="final-result-banner" ref={result} tabIndex={-1} role="status" aria-live="polite">
        <div className="result-check" aria-hidden="true">◷</div><div><span className="section-eyebrow">ESTIMATED TRANSFER TIME</span><strong id="result-time">{calculation.result.label}</strong></div><button type="button" className="replay-button" onClick={() => start()}>Replay <span aria-hidden="true">↻</span></button>
      </div>}
      <div className="planner-panel">
        {mode === 'choose' ? <div className="station-chooser">
          <div className="calculator-heading"><h1 id="calculator-title" tabIndex={-1}>Choose a mapped station</h1><p className="custom-route-note">Original measurements. Two lines. Your choice of platforms.</p></div>
          <div className="station-choices">{stationPresets.map(item => <button key={item.id} type="button" onClick={() => { onMappedChange(getStationPreset(item.id)); setFormError(''); }}><span className="station-choice-symbol" aria-hidden="true">M</span><strong>{item.name}</strong><span aria-hidden="true">→</span></button>)}</div>
          <button className="quiet-link" type="button" onClick={() => switchMode('custom')}>← Back to the calculator</button>
        </div> : <div className="calculator-workspace">
          <form onSubmit={start} id="transfer-form" className="calculator-main">
            <div className="calculator-heading"><h1 id="calculator-title" tabIndex={-1}>{mode === 'mapped' ? station.name : 'Calculate transfer time'}</h1>
              {mode === 'custom' && <p className="custom-route-note">Enter your measurements to estimate the time. Scene labels are just for your miniature.</p>}
            </div>
            {mode === 'mapped' ? <MappedPlanner station={station} values={values} onChange={next => { onMappedChange(next); setFormError(''); }} /> : <div className="fields">{fields.map(field => <label className="field" htmlFor={field.id} key={field.id}>
              <span className="field-name"><span className="field-glyph" aria-hidden="true">{field.glyph}</span>{field.label}</span>
              <span className="field-control"><input id={field.id} name={field.id} type="number" min="0" step={field.step} inputMode={field.step === '1' ? 'numeric' : 'decimal'} aria-describedby={`${field.id}-hint`} placeholder="0" value={values[field.id]} onChange={event => update(field.id, event.target.value)} /><span>{field.unit}</span></span>
              <small className="field-hint" id={`${field.id}-hint`}>{field.hint}</small>
            </label>)}</div>}
            <div className="calculation-actions"><button className="calculate-button" type="submit">Calculate transfer time <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 11 11 3M3 3h8v8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div>
          </form>
          <aside className="mapped-shortcut">{mode === 'custom' ? <><span className="section-eyebrow">ALREADY MAPPED</span><h2>Sants Estació & Diagonal</h2><p>Explore the measured transfers.</p><button type="button" onClick={() => switchMode('choose')}>Explore mapped stations <span aria-hidden="true">→</span></button></> : <><span className="section-eyebrow">EXPLORE</span><h2>Your own measurements?</h2><button type="button" onClick={() => switchMode('custom')}>Back to the calculator <span aria-hidden="true">→</span></button>{stationPresets.filter(item => item.id !== station.presetId).map(item => <button className="station-switch-link" key={item.id} type="button" onClick={() => onMappedChange(getStationPreset(item.id, station.fromPlatform, station.toPlatform))}>Switch to {item.name} <span aria-hidden="true">→</span></button>)}</>}</aside>
        </div>}
        {formError && <p className="form-error" role="alert">{formError}</p>}
      </div>
      <div className="further-information">
        <nav aria-label="Further information"><span>GOOD TO KNOW</span><button type="button" aria-expanded={info === 'method'} onClick={() => setInfo(info === 'method' ? null : 'method')}>How we calculate <span aria-hidden="true">{info === 'method' ? '−' : '+'}</span></button><button type="button" aria-expanded={info === 'validation'} onClick={() => setInfo(info === 'validation' ? null : 'validation')}>Validate at the station <span aria-hidden="true">{info === 'validation' ? '−' : '+'}</span></button></nav>
        {info === 'method' && <div className="method-panel"><h2>The original transfer model</h2><p>Walking and moving walkways are measured in metres. For escalators, count the steps of the stairs beside them. Enter stairs without an escalator separately. Keep moving-walkway length out of walking distance.</p><div className="method-speeds"><span>Walking <b>1.3 m/s</b></span><span>Escalators <b>1.5 steps/s</b></span><span>Stairs <b>1.9 steps/s</b></span><span>Moving walkways <b>0.5 m/s</b></span></div><p>We add the four segment times. The miniature and its playful loading messages illustrate the journey; they do not add time to the calculation. Mapped mode uses only the original Sants Estació and Diagonal measurements. “Towards” means the destination shown on a train using that platform. <a href={measurementSource} target="_blank" rel="noreferrer">View original data ↗</a></p></div>}
        {info === 'validation' && <ValidationPanel values={values} station={station} validation={validation} onStart={() => { calculation.cancel(); validation.start(values, station); }} />}
      </div>
    </div>
    {calculation.running && <SimulationLoading calculation={calculation} />}
  </section>;
}
