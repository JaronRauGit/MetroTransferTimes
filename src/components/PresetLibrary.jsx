import { useState } from 'react';
import { calculateTransfer } from '../calculator.js';
import { getStationPreset, measurementSource, stationPresets } from '../stationPresets.js';
import PlatformSelect from './PlatformSelect.jsx';

const orderedStations = [...stationPresets].sort((a, b) => a.name.localeCompare(b.name, 'ca'));

function StationCard({ station, selected, currentStation, index, onLoadStation }) {
  const current = currentStation.presetId === station.id;
  const [from, setFrom] = useState(current ? currentStation.fromPlatform : 'l3_trinitat');
  const [to, setTo] = useState(current ? currentStation.toPlatform : 'l5_cornelia');
  const route = getStationPreset(station.id, from, to);
  const active = selected === station.id && currentStation.fromPlatform === from && currentStation.toPlatform === to;
  return <article className={`preset-card${active ? ' is-selected' : ''}`}>
    <div className="preset-card-top"><span className="preset-number">0{index + 1}</span><span className="measurement-badge">ORIGINAL MEASUREMENTS</span></div>
    <h3 className="preset-name">{station.name}</h3>
    <div className="preset-platforms">
      <PlatformSelect id={`${station.id}-from`} label="Start platform" value={from} onChange={setFrom} />
      <PlatformSelect id={`${station.id}-to`} label="Destination platform" value={to} onChange={setTo} />
    </div>
    <p className="preset-distances">{route.values.walkDistance} m walking · {route.values.escalatorDistance} escalator steps · {route.values.walkwayLength} m moving walkway</p>
    <div className="preset-card-bottom"><strong>{calculateTransfer(route.values).label}</strong><button type="button" className="load-station-button" onClick={() => onLoadStation(station.id, from, to)} aria-label={`Load ${station.name} route`}>Load route <span aria-hidden="true">↗</span></button></div>
  </article>;
}

export default function PresetLibrary({ selected, station, onLoadStation }) {
  return <div className="preset-library">
    <div className="library-heading"><div><h2>Measured station routes</h2><p>Choose your start and destination platforms to load the original measurements.</p></div><span className="library-count">{stationPresets.length} STATIONS</span></div>
    <div className="preset-list" role="group" aria-label="Station presets">
      {orderedStations.map((preset, index) => <StationCard key={preset.id} station={preset} currentStation={station} selected={selected} index={index} onLoadStation={onLoadStation} />)}
    </div>
    <p className="measurement-source">Sants Estació and Diagonal are the only stations with confirmed measurements. <a href={measurementSource} target="_blank" rel="noreferrer">Original data ↗</a></p>
  </div>;
}
