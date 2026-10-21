import { useId, useRef } from 'react';
import { getStationPreset, platformOptions } from '../stationPresets.js';
import { LineBadge } from './LineSelect.jsx';

export default function MappedPlanner({ station, values, onChange }) {
  const nodes = useRef({});
  const arrowId = useId().replaceAll(':', '');
  const columns = [station.fromLine, station.toLine].map(line => platformOptions.filter(item => item.line === line));
  const fromRow = columns[0].findIndex(item => item.id === station.fromPlatform);
  const toRow = columns[1].findIndex(item => item.id === station.toPlatform);
  function choose(option, column) {
    onChange(getStationPreset(station.presetId, column === 0 ? option.id : station.fromPlatform, column === 1 ? option.id : station.toPlatform));
  }
  function navigate(event, column, row) {
    const next = { ArrowRight: [1, row], ArrowLeft: [0, row], ArrowUp: [column, 0], ArrowDown: [column, 1] }[event.key];
    if (!next) return;
    event.preventDefault(); nodes.current[columns[next[0]][next[1]].id]?.focus();
  }
  return <div className="mapped-planner">
    <div className="platform-column-headings"><span>Arriving</span><button className="swap-platforms" type="button" onClick={() => onChange(getStationPreset(station.presetId, station.toPlatform, station.fromPlatform))} aria-label="Swap arriving and departing platforms">⇄ <span>Swap</span></button><span>Departing</span></div>
    <div className="platform-map" role="group" aria-label="Choose an arriving and departing platform">
      <svg className="platform-connections" viewBox="0 0 1000 180" preserveAspectRatio="none" aria-hidden="true"><defs><marker id={arrowId} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 8 4 0 8Z" fill="#c98b66" /></marker></defs><path className={`platform-rail ${station.fromLine.toLowerCase()}-rail`} d="M250 40V140" /><path className={`platform-rail ${station.toLine.toLowerCase()}-rail`} d="M750 40V140" /><path className="selected-connection" d={`M250 ${40 + fromRow * 100} C500 ${40 + fromRow * 100},500 ${40 + toRow * 100},750 ${40 + toRow * 100}`} markerEnd={`url(#${arrowId})`} /></svg>
      {columns.flatMap((options, column) => options.map((option, row) => {
        const selected = option.id === (column === 0 ? station.fromPlatform : station.toPlatform);
        return <button ref={node => { nodes.current[option.id] = node; }} key={option.id} id={`platform-${option.id}`} type="button" className={`platform-node ${option.line.toLowerCase()}${selected ? column === 0 ? ' is-start' : ' is-finish' : ''}`} style={{ gridColumn: column + 1, gridRow: row + 1 }} aria-label={`${column === 0 ? 'Arriving' : 'Departing'}: ${option.line} towards ${option.direction}`} aria-pressed={selected} onKeyDown={event => navigate(event, column, row)} onClick={() => choose(option, column)}>
          <LineBadge line={option.line} /><span className="platform-direction"><small>Towards</small><strong>{option.direction}</strong></span>{selected && <span className="platform-selected" aria-hidden="true">✓</span>}
        </button>;
      }))}
    </div>
    <dl className="measured-values" aria-label="Original measured transfer values">
      <div><dt>Walking</dt><dd><span id="measured-walkDistance">{values.walkDistance}</span> <small>m</small></dd></div>
      <div><dt>Escalator</dt><dd><span id="measured-escalatorDistance">{values.escalatorDistance}</span> <small>steps</small></dd></div>
      <div><dt>Stairs</dt><dd><span id="measured-numSteps">{values.numSteps}</span> <small>steps</small></dd></div>
      <div><dt>Moving walkway</dt><dd><span id="measured-walkwayLength">{values.walkwayLength}</span> <small>m</small></dd></div>
    </dl>
  </div>;
}
