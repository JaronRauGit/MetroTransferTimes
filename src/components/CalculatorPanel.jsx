import { useState } from 'react';
import { calculateTransfer, emptyJourney, presets } from '../calculator.js';

const fields = [
  { id: 'walkDistance', label: 'Tunnel walk', unit: 'metres', glyph: '→' },
  { id: 'escalatorDistance', label: 'Escalator', unit: 'steps', glyph: '↗' },
  { id: 'numSteps', label: 'Stairs', unit: 'steps', glyph: '▤' },
  { id: 'walkwayLength', label: 'Moving walkway', unit: 'metres', glyph: '⇢' },
];

export default function CalculatorPanel({ values, onValuesChange, onJourney }) {
  const [result, setResult] = useState(null);
  const walking = Number(values.walkDistance) || 0;
  const walkway = Number(values.walkwayLength) || 0;

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

  function edit() {
    setResult(null);
    onJourney(null);
  }

  return <section className="calculator-panel" aria-labelledby="calculator-title">
    <div className="ticket-edge" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
    <div className="panel-kicker"><span className="panel-kicker-dot" /> YOUR TRANSFER <span>PASSEIG DE GRÀCIA</span></div>
    <div className="route-preview" aria-label="Line 3 to Line 4 transfer route">
      <span className="line-badge line-three">L3</span>
      <div className="route-preview-middle"><div className="route-preview-track"><i /><i /><i /></div><span>{walking ? `${walking} m tunnel` : 'YOUR TUNNEL'}{walkway > 0 ? ` · ${walkway} m walkway` : ''}</span></div>
      <span className="line-badge line-four">L4</span>
    </div>
    <div className="panel-heading"><div><h1 id="calculator-title">Make the connection.</h1><p>Shape the station as you enter your route.</p></div><span className="panel-line-symbol" aria-hidden="true">↘</span></div>
    {!result ? <>
      <form onSubmit={submit} id="transfer-form">
        <div className="fields">
          {fields.map(field => <label className="field" htmlFor={field.id} key={field.id}>
            <span className="field-name"><span className="field-glyph" aria-hidden="true">{field.glyph}</span>{field.label}</span>
            <span className="field-control"><input id={field.id} name={field.id} type="number" min="0" step="any" inputMode="decimal" placeholder="0" value={values[field.id]} onChange={event => update(field.id, event.target.value)} /><span>{field.unit}</span></span>
          </label>)}
        </div>
        <button className="calculate-button" type="submit"><span>Calculate transfer time</span><span aria-hidden="true">→</span></button>
      </form>
      <div className="example-row"><span>TRY A JOURNEY</span><button type="button" onClick={() => usePreset('quick')}>Short change</button><button type="button" onClick={() => usePreset('long')}>Long connection</button></div>
    </> : <div className="result" role="status" aria-live="polite" key={result.seconds}>
      <div className="result-eyebrow"><span className="result-dot" /> L3 TO L4 · ESTIMATED TIME</div>
      <strong id="result-time">{result.label}</strong>
      <p><span id="result-seconds">{result.seconds.toFixed(2)} seconds</span> from platform to platform.</p>
      <div className="result-actions"><button className="reset-button" type="button" onClick={edit}>Edit route</button><button className="reset-button" type="button" onClick={reset}>Start another journey <span aria-hidden="true">→</span></button></div>
    </div>}
    <details className="method"><summary>How is the time estimated?</summary><p>Walking metres ÷ 1.3 m/s, escalator steps ÷ 1.5 steps/s, stair steps ÷ 1.9 steps/s, and moving walkway metres ÷ 0.5 m/s. We add those times together.</p></details>
  </section>;
}
