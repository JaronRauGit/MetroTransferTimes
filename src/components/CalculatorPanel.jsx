import { useEffect, useState } from 'react';
import { getStationPreset, measurementSource } from '../stationPresets.js';
import LineSelect, { LineBadge } from './LineSelect.jsx';
import PresetLibrary from './PresetLibrary.jsx';
import PlatformSelect from './PlatformSelect.jsx';
import ValidationPanel from './ValidationPanel.jsx';

const fields = [
  { id: 'walkDistance', label: 'Walking distance', unit: 'm', glyph: '→', hint: 'Exclude the moving walkway', step: 'any' },
  { id: 'escalatorDistance', label: 'Escalator', unit: 'steps', glyph: '↗', hint: 'Count the stairs beside it', step: '1' },
  { id: 'numSteps', label: 'Stairs', unit: 'steps', glyph: '▤', hint: 'Only without an escalator', step: '1' },
  { id: 'walkwayLength', label: 'Moving walkway', unit: 'm', glyph: '⇢', hint: 'Separate from walking distance', step: 'any' },
];

export default function CalculatorPanel({ values, station, onValuesChange, onStationChange, validation, calculation }) {
  const [formError, setFormError] = useState('');
  const [info, setInfo] = useState(null);
  useEffect(() => {
    if (calculation.result) document.getElementById('result-time')?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [calculation.result]);
  const originalRoute = station.presetId ? getStationPreset(station.presetId, station.fromPlatform, station.toPlatform) : null;
  const selected = originalRoute && Object.entries(originalRoute.values).every(([key, value]) => Number(values[key]) === Number(value));
  function submit(event) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    try { validation.cancel(); calculation.start(values, station); setFormError(''); }
    catch { setFormError('Please enter smaller, finite distances and step counts.'); }
  }
  function update(id, value) { onValuesChange(current => ({ ...current, [id]: value })); setFormError(''); }
  function updateStation(id, value) { onStationChange(current => ({ ...current, [id]: value, presetId: null, fromPlatform: null, toPlatform: null })); }
  function loadStation(id, from = station.fromPlatform ?? 'l3_trinitat', to = station.toPlatform ?? 'l5_cornelia') {
    const preset = getStationPreset(id, from, to);
    onStationChange({ ...preset.station }); onValuesChange({ ...preset.values }); setFormError('');
    document.querySelector('.calculator-dock')?.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const editor = <div className="route-editor">
    <label className="station-field" htmlFor="stationName"><span>Station name</span><input id="stationName" type="text" maxLength="32" value={station.name} onChange={event => updateStation('name', event.target.value)} placeholder="Custom station" /></label>
    <LineSelect id="fromLine" label="From line" value={station.fromLine} onChange={value => updateStation('fromLine', value)} />
    <span className="line-arrow" aria-hidden="true">→</span>
    <LineSelect id="toLine" label="To line" value={station.toLine} onChange={value => updateStation('toLine', value)} />
  </div>;
  return <section className={`calculator-dock${calculation.running ? ' is-calculating' : ''}`} aria-label="Metro transfer calculator">
    <div className="dock-edge" aria-hidden="true" />
    <div className="calculator-workspace">
      <div className="calculator-main">
        <div className="calculator-heading"><div className="calculator-eyebrow"><span className="section-eyebrow">A LITTLE LESS GUESSWORK BETWEEN TRAINS</span><button className="presets-shortcut" type="button" onClick={() => document.getElementById('presets-title')?.scrollIntoView({ block: 'start', behavior: 'smooth' })}>Station presets <span aria-hidden="true">↓</span></button></div>
          <h1 id="calculator-title">Calculate the transfer from <LineBadge line={station.fromLine} /> to <LineBadge line={station.toLine} /> at <span>{station.name.trim() || 'your station'}</span>.</h1>
        </div>
        <div className={`route-selection${originalRoute ? '' : ' is-custom'}`}>
          {originalRoute && <>
          <PlatformSelect id="startPlatform" label="Start platform" value={station.fromPlatform} onChange={value => loadStation(station.presetId, value, station.toPlatform)} />
          <span className="route-arrow" aria-hidden="true">→</span>
          <PlatformSelect id="destinationPlatform" label="Destination platform" value={station.toPlatform} onChange={value => loadStation(station.presetId, station.fromPlatform, value)} />
          </>}
          <details className="custom-route" open={originalRoute ? undefined : true}><summary>Edit station & lines</summary>{editor}</details>
        </div>
        <form onSubmit={submit} id="transfer-form">
          <div className="fields">{fields.map(field => <label className="field" htmlFor={field.id} key={field.id}>
            <span className="field-name"><span className="field-glyph" aria-hidden="true">{field.glyph}</span>{field.label}</span>
            <span className="field-control"><input id={field.id} name={field.id} type="number" min="0" step={field.step} inputMode={field.step === '1' ? 'numeric' : 'decimal'} aria-describedby={`${field.id}-hint`} placeholder="0" value={values[field.id]} onChange={event => update(field.id, event.target.value)} /><span>{field.unit}</span></span>
            <small className="field-hint" id={`${field.id}-hint`}>{field.hint}</small>
          </label>)}</div>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="calculation-actions">
            <button className="calculate-button" type="submit" disabled={calculation.running}><span>{calculation.running ? 'Following your connection…' : calculation.result ? 'Calculate again' : 'Calculate transfer time'}</span><span aria-hidden="true">{calculation.running ? '◌' : '↗'}</span></button>
            {calculation.result ? <div className="calculation-result" role="status" aria-live="polite"><strong id="result-time">{calculation.result.label}</strong><span><span id="result-seconds">{calculation.result.seconds.toFixed(2)} seconds</span> between platforms</span></div> : <p className="calculation-prompt">{calculation.running ? 'Watch one passenger make your transfer.' : 'Your route is ready. Let’s see how long it takes.'}</p>}
          </div>
        </form>
      </div>
      <PresetLibrary selected={selected} station={station} onLoadStation={loadStation} />
    </div>
    <div className="further-information">
      <nav aria-label="Further information"><span>GOOD TO KNOW</span><button type="button" aria-expanded={info === 'method'} onClick={() => setInfo(info === 'method' ? null : 'method')}>How we calculate <span aria-hidden="true">{info === 'method' ? '−' : '+'}</span></button><button type="button" aria-expanded={info === 'validation'} onClick={() => setInfo(info === 'validation' ? null : 'validation')}>Validate at the station <span aria-hidden="true">{info === 'validation' ? '−' : '+'}</span></button></nav>
      {info === 'method' && <div className="method-panel"><h2>The original transfer model</h2><p>Walking and moving walkways are measured in metres. For escalators, count the steps of the stairs beside them. Enter stairs without an escalator separately. Keep moving-walkway length out of walking distance.</p><div className="method-speeds"><span>Walking <b>1.3 m/s</b></span><span>Escalators <b>1.5 steps/s</b></span><span>Stairs <b>1.9 steps/s</b></span><span>Moving walkways <b>0.5 m/s</b></span></div><p>We add the four segment times. The miniature is schematic, and the calculation preview compresses the journey into a few seconds. Sants Estació and Diagonal use the original confirmed measurements. <a href={measurementSource} target="_blank" rel="noreferrer">View original data ↗</a></p></div>}
      {info === 'validation' && <ValidationPanel values={values} station={station} validation={validation} onStart={() => { calculation.cancel(); validation.start(values, station); }} />}
    </div>
  </section>;
}
