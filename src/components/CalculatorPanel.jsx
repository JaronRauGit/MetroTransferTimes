import { useState } from 'react';
import { calculateTransfer, emptyJourney, presets } from '../calculator.js';
import { stationPresets } from '../stationPresets.js';
import LineSelect from './LineSelect.jsx';
import PresetLibrary from './PresetLibrary.jsx';
import ValidationPanel from './ValidationPanel.jsx';

const fields = [
  { id: 'walkDistance', label: 'Tunnel walk', unit: 'm', glyph: '→' },
  { id: 'escalatorDistance', label: 'Escalator', unit: 'm', glyph: '↗' },
  { id: 'stairDistance', label: 'Stairs', unit: 'm', glyph: '▤' },
  { id: 'walkwayLength', label: 'Moving walkway', unit: 'm', glyph: '⇢' },
];

export default function CalculatorPanel({ values, station, onValuesChange, onStationChange, validation }) {
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState('');
  const [tab, setTab] = useState('calculator');
  const tabs = [{ id: 'calculator', label: 'Calculator' }, { id: 'presets', label: 'Presets' }, { id: 'validation', label: 'Validate while there' }];
  const selectedPreset = stationPresets.find(preset =>
    Object.entries(preset.station).every(([key, value]) => station[key] === value)
    && Object.entries(preset.values).every(([key, value]) => Number(values[key]) === Number(value)),
  )?.id ?? '';

  function calculate(nextValues) {
    try {
      setResult(calculateTransfer(nextValues));
      setFormError('');
    } catch {
      setResult(null);
      setFormError('Please enter smaller, finite distances.');
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
    onStationChange(current => ({ ...current, [id]: value }));
  }

  function usePreset(name) {
    const nextValues = { ...presets[name] };
    onValuesChange(nextValues);
    calculate(nextValues);
    setTab('calculator');
    requestAnimationFrame(() => document.getElementById('dock-tab-calculator')?.focus({ preventScroll: true }));
  }

  function loadStation(id) {
    const preset = stationPresets.find(item => item.id === id);
    if (!preset) return;
    const nextValues = { ...preset.values };
    onStationChange({ ...preset.station });
    onValuesChange(nextValues);
    calculate(nextValues);
    setTab('calculator');
    requestAnimationFrame(() => document.getElementById('dock-tab-calculator')?.focus({ preventScroll: true }));
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
      }}>{item.id === 'validation' && <span className={`validation-tab-dot${validation.run?.status === 'running' ? ' is-running' : ''}`} aria-hidden="true" />}{item.label}{item.id === 'presets' && <span className="tab-count">4</span>}{item.id === 'validation' && validation.run?.status === 'running' && <span className="sr-only">, running</span>}</button>)}
    </div>
    <div id={`dock-panel-${tab}`} role="tabpanel" aria-labelledby={`dock-tab-${tab}`}>
    {tab === 'presets' && <PresetLibrary selected={selectedPreset} onLoadStation={loadStation} onLoadTemplate={usePreset} />}
    {tab === 'validation' && <ValidationPanel values={values} station={station} validation={validation} onStart={() => { calculate(values); validation.start(values, station); }} />}
    {tab === 'calculator' && <>
    <div className="dock-inner">
      <div className="dock-identity">
        <div className="dock-kicker"><span className="kicker-light" /> THE STATION</div>
        <label className="station-field" htmlFor="stationName"><span>Station name</span><input id="stationName" type="text" maxLength="32" value={station.name} onChange={event => updateStation('name', event.target.value)} placeholder="Verdaguer" /></label>
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
              <span className="field-control"><input id={field.id} name={field.id} type="number" min="0" step="any" inputMode="decimal" placeholder="0" value={values[field.id]} onChange={event => update(field.id, event.target.value)} /><span>{field.unit}</span></span>
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
    <details className="method"><summary>How is the time estimated?</summary><p>All lengths are in metres. Walking: 1.3 m/s · standing on an escalator: 0.5 m/s · stairs: 0.65 m/s · walking on a moving walkway: 1.8 m/s (1.3 walking + 0.5 belt). We add the four segment times. The miniature uses a compressed scale.</p></details>
    </>}
    </div>
  </section>;
}
