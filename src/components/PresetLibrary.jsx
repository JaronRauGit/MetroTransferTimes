import { calculateTransfer, presets } from '../calculator.js';
import { stationPresets } from '../stationPresets.js';
import { LineBadge } from './LineSelect.jsx';

const orderedStations = [...stationPresets].sort((a, b) => a.station.name.localeCompare(b.station.name, 'ca'));

export default function PresetLibrary({ selected, onLoadStation, onLoadTemplate }) {
  return <div className="preset-library">
    <div className="library-heading"><div><h2>Start with a station</h2><p>Illustrative lengths. Load an example, then make it your own.</p></div><span className="library-count">04 STATIONS</span></div>
    <div className="preset-list" role="group" aria-label="Station presets">
      {orderedStations.map((preset, index) => <button key={preset.id} type="button" className={`preset-card${selected === preset.id ? ' is-selected' : ''}`} aria-label={`Load ${preset.station.name}, ${preset.station.fromLine} to ${preset.station.toLine}`} aria-pressed={selected === preset.id} onClick={() => onLoadStation(preset.id)}>
        <span className="preset-card-top"><span className="preset-number">0{index + 1}</span><span className="preset-lines"><LineBadge line={preset.station.fromLine} /><span aria-hidden="true">→</span><LineBadge line={preset.station.toLine} /></span></span>
        <span className="preset-name">{preset.station.name}</span>
        <span className="preset-distances">{preset.values.walkDistance} m tunnel · {preset.values.escalatorDistance} m escalator</span>
        <span className="preset-card-bottom"><strong>{calculateTransfer(preset.values).label}</strong><span>Load route <span aria-hidden="true">↗</span></span></span>
      </button>)}
    </div>
    <div className="route-templates"><div><h3>Route templates</h3><p>Keep your current station and lines.</p></div><div className="template-buttons">
      <button type="button" onClick={() => onLoadTemplate('quick')}><span>Short change</span><small>{calculateTransfer(presets.quick).label}</small><span aria-hidden="true">↗</span></button>
      <button type="button" onClick={() => onLoadTemplate('long')}><span>Long connection</span><small>{calculateTransfer(presets.long).label}</small><span aria-hidden="true">↗</span></button>
    </div></div>
  </div>;
}
