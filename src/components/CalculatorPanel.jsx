import { useState } from 'react';
import { calculateTransfer, emptyJourney, presets } from '../calculator.js';

const fields = [
  { id: 'walkDistance', label: 'Walking', unit: 'metres', glyph: '→' },
  { id: 'escalatorDistance', label: 'Escalator', unit: 'steps', glyph: '⇧' },
  { id: 'numSteps', label: 'Stairs', unit: 'steps', glyph: '▤' },
  { id: 'walkwayLength', label: 'Moving walkway', unit: 'metres', glyph: '⇢' },
];

export default function CalculatorPanel({ onJourney }) {
  const [values, setValues] = useState({ ...emptyJourney });
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
    setValues(current => ({ ...current, [id]: value }));
    setResult(null);
    onJourney(null);
  }

  function usePreset(name) {
    const nextValues = { ...presets[name] };
    setValues(nextValues);
    calculate(nextValues);
  }

  function reset() {
    setValues({ ...emptyJourney });
    setResult(null);
    onJourney(null);
  }

  function edit() {
    setResult(null);
    onJourney(null);
  }

  return (
    <section className="calculator-panel" aria-labelledby="calculator-title">
      <div className="panel-kicker"><span className="panel-kicker-dot" /> THE TRANSFER DESK <span>01 / BARCELONA</span></div>
      <div className="panel-heading"><div><h1 id="calculator-title">Find your way through.</h1><p>Estimate the time between metro lines.</p></div><span className="panel-line-symbol" aria-hidden="true">M</span></div>
      {!result && <><form onSubmit={submit} id="transfer-form">
        <div className="fields">
          {fields.map(field => (
            <label className="field" htmlFor={field.id} key={field.id}>
              <span className="field-name"><span className="field-glyph" aria-hidden="true">{field.glyph}</span>{field.label}</span>
              <span className="field-control"><input id={field.id} name={field.id} type="number" min="0" step="any" inputMode="decimal" placeholder="0" value={values[field.id]} onChange={event => update(field.id, event.target.value)} /><span>{field.unit}</span></span>
            </label>
          ))}
        </div>
        <button className="calculate-button" type="submit"><span>Calculate transfer</span><span aria-hidden="true">→</span></button>
      </form>
      <div className="example-row"><span>TRY A ROUTE</span><button type="button" onClick={() => usePreset('quick')}>Quick hop</button><button type="button" onClick={() => usePreset('long')}>Long transfer</button></div>
      </>}
      {result && <div className="result" role="status" aria-live="polite" key={result.seconds}>
        <div className="result-eyebrow"><span className="result-dot" /> YOUR ESTIMATED TRANSFER</div>
        <strong id="result-time">{result.label}</strong>
        <p><span id="result-seconds">{result.seconds.toFixed(2)} seconds</span> through the station.</p>
        <div className="result-actions"><button className="reset-button" type="button" onClick={edit}>Edit route</button><button className="reset-button" type="button" onClick={reset}>Start another journey <span aria-hidden="true">→</span></button></div>
      </div>}
      <details className="method"><summary>How is the time estimated?</summary><p>Walking metres ÷ 1.3 m/s, escalator steps ÷ 1.5 steps/s, stair steps ÷ 1.9 steps/s, and moving walkway metres ÷ 0.5 m/s. We add those times together.</p></details>
    </section>
  );
}
