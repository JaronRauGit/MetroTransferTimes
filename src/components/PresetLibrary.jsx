import { stationPresets } from '../stationPresets.js';
import { LineBadge } from './LineSelect.jsx';

export default function PresetLibrary({ selected, station, onLoadStation }) {
  return <aside className="preset-library" aria-labelledby="presets-title">
    <span className="section-eyebrow">A MEASURED STARTING POINT</span>
    <h2 id="presets-title">Station presets</h2>
    <p className="preset-intro">Load a station, then choose your platforms.</p>
    <div className="preset-list" role="group" aria-label="Station presets">
      {stationPresets.map(preset => <button key={preset.id} type="button" className={`preset-card${station.presetId === preset.id ? ' is-selected' : ''}`} aria-pressed={station.presetId === preset.id} onClick={() => onLoadStation(preset.id)}>
        <span className="preset-name">{preset.name}</span><span className="preset-lines"><LineBadge line="L3" /><LineBadge line="L5" /></span><span className="preset-arrow" aria-hidden="true">↗</span>
      </button>)}
    </div>
    <small className="preset-note">{selected ? 'Original measurements loaded.' : station.presetId ? 'You’ve edited the measured values.' : 'Or enter your own route in the calculator.'}</small>
  </aside>;
}
