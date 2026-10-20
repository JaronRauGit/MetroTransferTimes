import { platformOptions } from '../stationPresets.js';
import { LineBadge } from './LineSelect.jsx';

export default function PlatformSelect({ id, label, value, onChange }) {
  const platform = platformOptions.find(item => item.id === value);
  return <label className="platform-select" htmlFor={id}>
    <span>{label}</span>
    <span className="platform-select-control">
      <LineBadge line={platform.line} />
      <select id={id} value={value} onChange={event => onChange(event.target.value)}>
        {platformOptions.map(option => <option key={option.id} value={option.id}>{option.line} · {option.direction}</option>)}
      </select>
    </span>
  </label>;
}
