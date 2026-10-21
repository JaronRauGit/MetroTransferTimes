import { useEffect, useRef, useState } from 'react';
import { measurementSource } from '../stationPresets.js';
import LineSelect from './LineSelect.jsx';
import MappedPlanner from './MappedPlanner.jsx';
import SimulationLoading from './SimulationLoading.jsx';
import ValidationPanel from './ValidationPanel.jsx';

const fields = [
  { id: 'walkDistance', label: 'Walking distance', unit: 'm', glyph: '→', hint: 'Exclude the moving walkway', step: 'any' },
  { id: 'escalatorDistance', label: 'Escalator', unit: 'steps', glyph: '↗', hint: 'Count the stairs beside it', step: '1' },
  { id: 'numSteps', label: 'Stairs', unit: 'steps', glyph: '▤', hint: 'Only without an escalator', step: '1' },
  { id: 'walkwayLength', label: 'Moving walkway', unit: 'm', glyph: '⇢', hint: 'Separate from walking distance', step: 'any' },
];

export default function CalculatorPanel({ mode, values, station, onModeChange, onMappedChange, onValuesChange, onStationChange, validation, calculation }) {
  const [formError, setFormError] = useState('');
  const [info, setInfo] = useState(null);
  const dock = useRef(), result = useRef();
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
  const tabs = [{ id: 'mapped', label: 'Mapped stations', note: 'Measured routes' }, { id: 'custom', label: 'Custom calculator', note: 'Your own measurements' }];
  return <section ref={dock} className={`calculator-dock${calculation.running ? ' is-calculating' : ''}`} aria-label="Metro transfer tools">
    <div className="dock-edge" aria-hidden="true" />
    <div className="dock-content" inert={calculation.running ? true : undefined} aria-hidden={calculation.running ? true : undefined}>
      <div className="planner-tabs" role="tablist" aria-label="Choose transfer tool">
        {tabs.map((tab, i) => <button key={tab.id} type="button" role="tab" id={`tab-${tab.id}`} aria-selected={mode === tab.id} aria-controls={`panel-${tab.id}`} tabIndex={mode === tab.id ? 0 : -1} onClick={() => switchMode(tab.id)} onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault(); const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[1] : tabs[1 - i]; switchMode(next.id); document.getElementById(`tab-${next.id}`)?.focus();
        }}><strong>{tab.label}</strong><small>{tab.note}</small></button>)}
      </div>
      {calculation.result && <div className="final-result-banner" ref={result} tabIndex={-1} role="status" aria-live="polite">
        <div className="result-check" aria-hidden="true">✓</div><div><span className="section-eyebrow">YOUR TRANSFER TAKES</span><strong id="result-time">{calculation.result.label}</strong><small><span id="result-seconds">{calculation.result.seconds.toFixed(2)} seconds</span> · {station.name.trim() || 'Your station'}</small></div><button type="button" className="replay-button" onClick={() => start()}>Replay journey <span aria-hidden="true">↻</span></button>
      </div>}
      <div role="tabpanel" id={`panel-${mode}`} aria-labelledby={`tab-${mode}`} className="planner-panel">
        {mode === 'mapped' ? <div className="mapped-workspace">
          <MappedPlanner station={station} values={values} onChange={next => { onMappedChange(next); setFormError(''); }} />
          <div className="mapped-action"><button className="calculate-button" type="button" onClick={() => start()}>See my transfer <span aria-hidden="true">↗</span></button><p>Original measurements.<br />Pick any two platforms—even on the same line.</p></div>
        </div> : <div className="calculator-workspace">
          <div className="calculator-main">
            <div className="calculator-heading"><span className="section-eyebrow">YOUR MEASUREMENTS. YOUR MINIATURE.</span>
              <h1 id="calculator-title">Calculate the transfer from <LineSelect inline id="fromLine" label="From line" value={station.fromLine} onChange={value => onStationChange(current => ({ ...current, fromLine: value }))} /> to <LineSelect inline id="toLine" label="To line" value={station.toLine} onChange={value => onStationChange(current => ({ ...current, toLine: value }))} /> at <input className="inline-station-input" id="stationName" aria-label="Station name" maxLength="32" size={Math.max(8, station.name.length)} value={station.name} placeholder="Your station" onChange={event => onStationChange(current => ({ ...current, name: event.target.value }))} />.</h1>
              <p className="custom-route-note">Click the name or lines to label your scene. Your measurements determine the time.</p>
            </div>
            <form onSubmit={start} id="transfer-form">
              <div className="fields">{fields.map(field => <label className="field" htmlFor={field.id} key={field.id}>
                <span className="field-name"><span className="field-glyph" aria-hidden="true">{field.glyph}</span>{field.label}</span>
                <span className="field-control"><input id={field.id} name={field.id} type="number" min="0" step={field.step} inputMode={field.step === '1' ? 'numeric' : 'decimal'} aria-describedby={`${field.id}-hint`} placeholder="0" value={values[field.id]} onChange={event => update(field.id, event.target.value)} /><span>{field.unit}</span></span>
                <small className="field-hint" id={`${field.id}-hint`}>{field.hint}</small>
              </label>)}</div>
              <div className="calculation-actions"><button className="calculate-button" type="submit">Calculate transfer time <span aria-hidden="true">↗</span></button><p className="calculation-prompt">Watch the journey. Get your estimate.</p></div>
            </form>
          </div>
          <aside className="mapped-shortcut"><span className="section-eyebrow">ALREADY MAPPED</span><h2>Sants Estació & Diagonal</h2><p>Choose a station and connect its platforms. No measuring needed.</p><button type="button" onClick={() => switchMode('mapped')}>Explore mapped stations <span aria-hidden="true">→</span></button></aside>
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
