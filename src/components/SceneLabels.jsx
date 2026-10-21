import LineSelect, { LineBadge } from './LineSelect.jsx';

export default function SceneLabels({ station, editable, disabled, onChange }) {
  return <div className={`station-status${editable ? ' is-editable' : ''}`} inert={disabled ? true : undefined}>
    {editable ? <input id="stationName" aria-label="Station name for the miniature" aria-describedby="scene-label-help" title="Name your miniature" maxLength="32" size={Math.max(8, Math.min(22, station.name.length))} value={station.name} placeholder="My station" onChange={event => onChange(current => ({ ...current, name: event.target.value }))} /> : <span className="scene-station-name">{station.name.trim() || 'My station'}</span>}
    <span className="scene-lines">
      {editable ? <LineSelect inline id="fromLine" label="Arriving line for the miniature" value={station.fromLine} onChange={value => onChange(current => ({ ...current, fromLine: value }))} /> : <LineBadge line={station.fromLine} />}
      <span className="scene-line-arrow" aria-hidden="true">→</span>
      {editable ? <LineSelect inline id="toLine" label="Departing line for the miniature" value={station.toLine} onChange={value => onChange(current => ({ ...current, toLine: value }))} /> : <LineBadge line={station.toLine} />}
    </span>
    <span id="scene-label-help" className="sr-only">These labels customise the miniature. Enter your measurements below to calculate a time.</span>
  </div>;
}
