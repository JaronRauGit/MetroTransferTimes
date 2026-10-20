import { useState } from 'react';
import { calculateTransfer, emptyJourney } from '../calculator.js';
import { getStationPreset, stationPresets } from '../stationPresets.js';
import LineSelect from './LineSelect.jsx';
import PresetLibrary from './PresetLibrary.jsx';
import PlatformSelect from './PlatformSelect.jsx';
import ValidationPanel from './ValidationPanel.jsx';

const fields = [
  { id: 'walkDistance', label: 'Walking distance', unit: 'm', glyph: '→', hint: 'Exclude the moving walkway', step: 'any' },
  { id: 'escalatorDistance', label: 'Escalator', unit: 'steps', glyph: '↗', hint: 'Count the stairs next to it', step: '1' },
  { id: 'numSteps', label: 'Stairs', unit: 'steps', glyph: '▤', hint: 'Only where there is no escalator', step: '1' },
  { id: 'walkwayLength', label: 'Moving walkway', unit: 'm', glyph: '⇢', hint: 'Separate from walking distance', step: 'any' },
];

export default function CalculatorPanel({ values, station, onValuesChange, onStationChange, validation }) {
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState('');
  const [tab, setTab] = useState('calculator');
  const tabs = [{ id: 'calculator', label: 'Calculator' }, { id: 'presets', label: 'Presets' }, { id: 'validation', label: 'Validate while there' }];
  const originalRoute = station.presetId ? getStationPreset(station.presetId, station.fromPlatform, station.toPlatform) : null;
  const selectedPreset = originalRoute && Object.entries(originalRoute.values).every(([key, value]) => Number(values[key]) === Number(value)) ? originalRoute.id : '';

  function calculate(nextValues) {
    try {
      setResult(calculateTransfer(nextValues));
      setFormError('');
    } catch {
      setResult(null);
      setFormError('Please enter smaller, finite distances and step counts.');
    }
  }

  function submit(event) {
    event.preventDefault();
    if (event.currentTarget.reportValidity()) calculate(values);
  }

  function update(id, value) {
    onValuesChange(current => ({ ...current, [id]: value }));
    setResult(null);
    setFormError('');
  }

  function updateStation(id, value) {
    onStationChange(current => ({ ...current, [id]: value, presetId: null, fromPlatform: null, toPlatform: null }));
  }

  function loadStation(id, from, to, returnToCalculator = true) {
    const preset = getStationPreset(id, from, to);
    const nextValues = { ...preset.values };
    onStationChange({ ...preset.station });
    onValuesChange(nextValues);
    calculate(nextValues);
    if (returnToCalculator) {
      setTab('calculator');
      requestAnimationFrame(() => document.getElementById('dock-tab-calculator')?.focus({ preventScroll: true }));
    }
  }

  function reset() {
    onValuesChange({ ...emptyJourney });
    setResult(null);
    setFormError('');
  }

  return <section className={`calculator-dock${result ? ' has-result' : ''}`} aria-label="Metro transfer tools">
    <div className="dock-edge" aria-hidden="true" />
    <div className="dock-tabs" role="tablist" aria-label="Transfer tools">
      {tabs.map((item, index) => <button key={item.id} id={`dock-tab-${item.id}`} type="button" role="tab" aria-selected={tab === item.id} aria-controls={`dock-panel-${item.id}`} tabIndex={tab === item.id ? 0 : -1} onClick={() => setTab(item.id)} onKeyDown={event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); setTab(tabs[next].id); document.getElementById(`dock-tab-${tabs[next].id}`).focus(); }
      }}>{item.id === 'validation' && <span className={`validation-tab-dot${validation.run?.status === 'running' ? ' is-running' : ''}`} aria-hidden="true" />}{item.label}{item.id === 'presets' && <span className="tab-count">{stationPresets.length}</span>}{item.id === 'validation' && validation.run?.status === 'running' && <span className="sr-only">, running</span>}</button>)}
    </div>
    <div id={`dock-panel-${tab}`} role="tabpanel" aria-labelledby={`dock-tab-${tab}`}>
    {tab === 'presets' && <PresetLibrary selected={selectedPreset} station={station} onLoadStation={loadStation} />}
    {tab === 'validation' && <ValidationPanel values={values} station={station} validation={validation} onStart={() => { calculate(values); validation.start(values, station); }} />}
    {tab === 'calculator' && <>
    {originalRoute && <div className="loaded-route">
      <div><strong>{selectedPreset ? 'Original measurements' : 'Custom values'}</strong><small>Choose platforms to reload the measured route.</small></div>
      <PlatformSelect id="startPlatform" label="Start platform" value={station.fromPlatform} onChange={value => loadStation(station.presetId, value, station.toPlatform, false)} />
      <PlatformSelect id="destinationPlatform" label="Destination platform" value={station.toPlatform} onChange={value => loadStation(station.presetId, station.fromPlatform, value, false)} />
    </div>}
    <div className="dock-inner">
      <div className="dock-identity">
        <div className="dock-kicker"><span className="kicker-light" /> THE STATION</div>
        <label className="station-field" htmlFor="stationName"><span>Station name</span><input id="stationName" type="text" maxLength="32" value={station.name} onChange={event => updateStation('name', event.target.value)} placeholder="Custom station" /></label>
        <div className="line-selectors">
          <LineSelect id="fromLine" label="From" value={station.fromLine} onChange={value => updateStation('fromLine', value)} />
          <span className="line-arrow" aria-hidden="true">→</span>
          <LineSelect id="toLine" label="To" value={station.toLine} onChange={value => updateStation('toLine', value)} />
        </div>
      </div>
      <div className="dock-form">
        <div className="dock-kicker"><span className="kicker-light terracotta" /> <h1 id="calculator-title">Build your transfer</h1><span className="dock-subtitle">THE MINIATURE RESPONDS AS YOU TYPE</span></div>
        <form onSubmit={submit} id="transfer-form">
          <div className="fields">
            {fields.map(field => <label className="field" htmlFor={field.id} key={field.id}>
              <span className="field-name"><span className="field-glyph" aria-hidden="true">{field.glyph}</span>{field.label}</span>
              <span className="field-control"><input id={field.id} name={field.id} type="number" min="0" step={field.step} inputMode={field.step === '1' ? 'numeric' : 'decimal'} aria-describedby={`${field.id}-hint`} placeholder="0" value={values[field.id]} onChange={event => update(field.id, event.target.value)} /><span>{field.unit}</span></span>
              <small className="field-hint" id={`${field.id}-hint`}>{field.hint}</small>
            </label>)}
          </div>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <button className="calculate-button" type="submit"><span>Calculate time</span><span aria-hidden="true">→</span></button>
        </form>
      </div>
      <div className="dock-output">
        <div className="dock-kicker"><span className="kicker-light blue" /> YOUR CONNECTION</div>
        {result ? <div className="result" role="status" aria-live="polite" key={result.seconds}>
          <strong id="result-time">{result.label}</strong>
          <p><span id="result-seconds">{result.seconds.toFixed(2)} seconds</span> between platforms</p>
          <button className="reset-button" type="button" onClick={reset}>Start another route <span aria-hidden="true">↗</span></button>
        </div> : <div className="result-placeholder"><span className="placeholder-path"><i /><i /><i /></span><p>Shape the route, then see its time here.</p></div>}
        <button className="validate-link" type="button" onClick={() => setTab('validation')}>At the station? Validate this time <span aria-hidden="true">↗</span></button>
      </div>
    </div>
    <details className="method"><summary>How is the time estimated?</summary><p>Walking and moving walkways are measured in metres. Escalators are counted using the steps of the stairs beside them; stairs without an escalator are entered separately in steps. Keep moving-walkway length out of walking distance. Original model: walking 1.3 m/s · escalator 1.5 steps/s · stairs 1.9 steps/s · moving walkway 0.5 m/s. We add the four segment times. The miniature uses a compressed scale.</p></details>
    </>}
    </div>
  </section>;
}
