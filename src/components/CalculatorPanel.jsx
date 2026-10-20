import { useState } from 'react';
import { calculateTransfer, emptyJourney, presets } from '../calculator.js';
import { lineColor, lineOptions } from '../world/lineCatalog.js';

const fields = [
  { id: 'walkDistance', label: 'Tunnel walk', unit: 'm', glyph: '→' },
  { id: 'escalatorDistance', label: 'Escalator', unit: 'm', glyph: '↗' },
  { id: 'stairDistance', label: 'Stairs', unit: 'm', glyph: '▤' },
  { id: 'walkwayLength', label: 'Moving walkway', unit: 'm', glyph: '⇢' },
];

export default function CalculatorPanel({ values, station, onValuesChange, onStationChange, onJourney }) {
  const [result, setResult] = useState(null);

  function calculate(nextValues) {
    const nextResult = calculateTransfer(nextValues);
    setResult(nextResult);
    onJourney(nextResult);
  }

  function submit(event) {
    event.preventDefault();
    if (event.currentTarget.reportValidity()) calculate(values);
  }

  function update(id, value) {
    onValuesChange(current => ({ ...current, [id]: value }));
    setResult(null);
    onJourney(null);
  }

  function updateStation(id, value) {
    onStationChange(current => ({ ...current, [id]: value }));
  }

  function usePreset(name) {
    const nextValues = { ...presets[name] };
    onValuesChange(nextValues);
    calculate(nextValues);
  }

  function reset() {
    onValuesChange({ ...emptyJourney });
    setResult(null);
    onJourney(null);
  }

  return <section className={`calculator-dock${result ? ' has-result' : ''}`} aria-labelledby="calculator-title">
    <div className="dock-edge" aria-hidden="true" />
    <div className="dock-inner">
      <div className="dock-identity">
        <div className="dock-kicker"><span className="kicker-light" /> THE STATION</div>
        <label className="station-field" htmlFor="stationName"><span>Station name</span><input id="stationName" type="text" maxLength="32" value={station.name} onChange={event => updateStation('name', event.target.value)} placeholder="Verdaguer" /></label>
        <div className="line-selectors">
          <label htmlFor="fromLine" style={{ '--line-color': lineColor(station.fromLine) }}><span>FROM</span><select id="fromLine" value={station.fromLine} onChange={event => updateStation('fromLine', event.target.value)}>{lineOptions.map(line => <option key={line} value={line}>{line}</option>)}</select></label>
          <span className="line-arrow" aria-hidden="true">→</span>
          <label htmlFor="toLine" style={{ '--line-color': lineColor(station.toLine) }}><span>TO</span><select id="toLine" value={station.toLine} onChange={event => updateStation('toLine', event.target.value)}>{lineOptions.map(line => <option key={line} value={line}>{line}</option>)}</select></label>
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
        <div className="example-row"><span>TRY</span><button type="button" onClick={() => usePreset('quick')}>Short change</button><button type="button" onClick={() => usePreset('long')}>Long connection</button></div>
      </div>
    </div>
    <details className="method"><summary>How is the time estimated?</summary><p>All lengths are in metres. Walking: 1.3 m/s · standing on an escalator: 0.5 m/s · stairs: 0.65 m/s · walking on a moving walkway: 1.8 m/s (1.3 walking + 0.5 belt). We add the four segment times. The miniature uses a compressed scale.</p></details>
  </section>;
}
