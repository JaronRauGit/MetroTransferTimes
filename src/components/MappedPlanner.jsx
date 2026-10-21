import { useId, useRef, useState } from 'react';
import { getStationPreset, platformOptions, stationPresets } from '../stationPresets.js';
import { LineBadge } from './LineSelect.jsx';

// Two directions per line. Positions match the two-column button layout.
const positions = { l3_trinitat: [250, 40], l3_zona: [250, 140], l5_cornelia: [750, 40], l5_hebron: [750, 140] };
function connectionPath(from, to) {
  const [x1, y1] = positions[from], [x2, y2] = positions[to];
  if (from === to) return `M ${x1 - 190} ${y1} C ${x1 - 260} ${y1 - 50}, ${x1 - 260} ${y1 + 50}, ${x1 - 190} ${y1}`;
  if (x1 === x2) { const edge = x1 < 500 ? 22 : 978; return `M ${x1} ${y1} C ${edge} ${y1}, ${edge} ${y2}, ${x2} ${y2}`; }
  return `M ${x1} ${y1} C 500 ${y1}, 500 ${y2}, ${x2} ${y2}`;
}

export default function MappedPlanner({ station, values, onChange }) {
  const [endpoint, setEndpoint] = useState('from');
  const nodes = useRef({});
  const arrowId = useId().replaceAll(':', '');
  const from = platformOptions.find(item => item.id === station.fromPlatform);
  const to = platformOptions.find(item => item.id === station.toPlatform);
  function load(id = station.presetId, start = station.fromPlatform, finish = station.toPlatform) { onChange(getStationPreset(id, start, finish)); }
  function choose(id) {
    if (endpoint === 'from') { load(station.presetId, id, station.toPlatform); setEndpoint('to'); }
    else { load(station.presetId, station.fromPlatform, id); setEndpoint('from'); }
  }
  function navigate(event, id) {
    const [x, y] = positions[id];
    const next = { ArrowRight: [750, y], ArrowLeft: [250, y], ArrowUp: [x, 40], ArrowDown: [x, 140] }[event.key];
    if (!next) return;
    event.preventDefault();
    const match = platformOptions.find(item => positions[item.id][0] === next[0] && positions[item.id][1] === next[1]);
    nodes.current[match.id]?.focus();
  }
  return <div className="mapped-planner">
    <div className="calculator-heading"><span className="section-eyebrow">REAL STATIONS. YOUR CHOICE OF PLATFORMS.</span>
      <h1 id="calculator-title">Your transfer at <select className="inline-station-select" id="mappedStation" aria-label="Mapped station" value={station.presetId} onChange={event => load(event.target.value)}>{stationPresets.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></h1>
    </div>
    <div className="platform-picker-heading">
      <div className="endpoint-switch" role="group" aria-label="Choose which end of the transfer to edit">
        <button id="choose-arrival" type="button" aria-pressed={endpoint === 'from'} onClick={() => setEndpoint('from')}><b className="endpoint-number start">1</b> Arriving platform <LineBadge line={station.fromLine} /></button>
        <button id="choose-departure" type="button" aria-pressed={endpoint === 'to'} onClick={() => setEndpoint('to')}><b className="endpoint-number finish">2</b> Departing platform <LineBadge line={station.toLine} /></button>
      </div>
      <button className="swap-platforms" type="button" onClick={() => load(station.presetId, station.toPlatform, station.fromPlatform)} aria-label="Swap arriving and departing platforms">⇄ <span>Swap</span></button>
    </div>
    <p className="platform-instruction" id="platform-instruction" aria-live="polite">Choose the platform you {endpoint === 'from' ? 'arrive on' : 'leave from'}. <span>“Towards” is the destination shown on your train.</span></p>
    <div className="platform-map" role="group" aria-label="Four station platforms" aria-describedby="platform-instruction">
      <svg className="platform-connections" viewBox="0 0 1000 180" preserveAspectRatio="none" aria-hidden="true"><defs><marker id={arrowId} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 8 4 0 8Z" fill="#c98b66" /></marker></defs><path className="platform-rail l3-rail" d="M250 40V140" /><path className="platform-rail l5-rail" d="M750 40V140" /><path className="selected-connection" d={connectionPath(from.id, to.id)} markerEnd={`url(#${arrowId})`} /></svg>
      {platformOptions.map(option => {
        const start = option.id === from.id, finish = option.id === to.id;
        return <button ref={node => { nodes.current[option.id] = node; }} key={option.id} id={`platform-${option.id}`} type="button" className={`platform-node ${option.line.toLowerCase()}${start ? ' is-start' : ''}${finish ? ' is-finish' : ''}`} style={{ gridColumn: option.line === 'L3' ? 1 : 2, gridRow: option.id === 'l3_trinitat' || option.id === 'l5_cornelia' ? 1 : 2 }} aria-label={`${option.line} platform towards ${option.direction}`} aria-pressed={start || finish} onKeyDown={event => navigate(event, option.id)} onClick={() => choose(option.id)}>
          <LineBadge line={option.line} /><span className="platform-direction"><small>Towards</small><strong>{option.direction}</strong></span><span className="platform-endpoints">{start && <b className="endpoint-number start" title="Arriving platform">1</b>}{finish && <b className="endpoint-number finish" title="Departing platform">2</b>}</span>
        </button>;
      })}
    </div>
    <div className="chosen-transfer"><span><b>1</b> {from.line} towards {from.direction}</span><span aria-hidden="true">→</span><span><b>2</b> {to.line} towards {to.direction}</span></div>
    <dl className="measured-values" aria-label="Original measured transfer values">
      <div><dt>Walking</dt><dd><span id="measured-walkDistance">{values.walkDistance}</span> <small>m</small></dd></div>
      <div><dt>Escalator</dt><dd><span id="measured-escalatorDistance">{values.escalatorDistance}</span> <small>steps</small></dd></div>
      <div><dt>Stairs</dt><dd><span id="measured-numSteps">{values.numSteps}</span> <small>steps</small></dd></div>
      <div><dt>Moving walkway</dt><dd><span id="measured-walkwayLength">{values.walkwayLength}</span> <small>m</small></dd></div>
    </dl>
  </div>;
}
