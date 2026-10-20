import { useMemo } from 'react';
import { calculateTransfer } from '../calculator.js';
import { formatClock } from '../validation.js';
import { getStationLayout } from '../world/stationLayout.js';
import { createValidationPath, sampleValidationPath, validationStageNames } from '../world/validationPath.js';
import { LineBadge } from './LineSelect.jsx';

export default function ValidationPanel({ values, station, validation, onStart }) {
  const { run, snapshot, cancel } = validation;
  let estimate = null;
  try { estimate = calculateTransfer(values); } catch { /* Invalid form values keep Start disabled. */ }
  const path = useMemo(() => run ? createValidationPath(getStationLayout(run.values), run.values) : null, [run?.values]);
  const stage = path ? sampleValidationPath(path, snapshot.elapsed).mode : null;
  const running = run?.status === 'running';
  const arrived = run?.status === 'arrived';
  const colours = ['#cf6556', '#d7af56', '#74a291', '#749db7'];
  return <div className="validation-panel">
    <div className="validation-intro">
      <span className="section-eyebrow">TAKE THE MINIATURE WITH YOU</span>
      <h2>Validate while there</h2>
      <p>Press Start when you begin your transfer. The red marker follows the full estimate, second for second.</p>
      <div className="validation-route"><LineBadge line={station.fromLine} /><span aria-hidden="true">→</span><LineBadge line={station.toLine} /><strong>{station.name.trim() || 'Custom station'}</strong></div>
      <small>Changing a distance or station resets the run.</small>
    </div>
    <div className={`validation-clock${arrived ? ' is-arrived' : ''}`}>
      {arrived && <div className="finish-confetti" aria-hidden="true" key={run.id}>{Array.from({ length: 16 }, (_, i) => <i key={i} style={{ '--i': i, '--confetti-color': colours[i % colours.length] }} />)}</div>}
      <div className="validation-clock-top"><span className="validation-label">{arrived ? 'FINISH LINE' : running ? 'ESTIMATED ARRIVAL IN' : 'YOUR FULL TRANSFER'}</span><span className="finish-checker" aria-hidden="true" /></div>
      <strong id="validation-remaining" className="validation-time" role="timer" aria-live="off">{arrived ? 'Arrived!' : formatClock(running ? snapshot.remaining : estimate?.seconds ?? 0)}</strong>
      <p className="validation-status" role="status">{arrived ? 'That’s the full estimated transfer time.' : running ? validationStageNames[stage] ?? 'Walking to the next platform' : 'A real-time run, ready when you are.'}</p>
      <div className="validation-progress" role="progressbar" aria-label="Transfer progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(snapshot.progress * 100)}><span style={{ width: `${snapshot.progress * 100}%` }} /></div>
      <div className="validation-clock-meta"><span>{run ? `${formatClock(Math.floor(snapshot.elapsed))} elapsed` : 'Start at the first platform'}</span><span>{run ? `${formatClock(run.duration)} total` : 'Finish at the second'}</span></div>
      <div className="validation-actions">{running ? <button className="validation-stop" type="button" onClick={cancel}>Stop validation <span aria-hidden="true">×</span></button> : <button id="validation-start" className="validation-start" type="button" disabled={!estimate || estimate.seconds <= 0} onClick={onStart}>{arrived ? 'Run again' : 'Start validation'} <span aria-hidden="true">→</span></button>}
        {arrived && <button className="validation-dismiss" type="button" onClick={cancel}>Clear run</button>}
      </div>
      {(!estimate || estimate.seconds <= 0) && <small className="validation-help">Add valid, positive lengths in the calculator to start.</small>}
    </div>
  </div>;
}
