export const metroLines = Object.freeze({
  L1: { name: 'L1', color: '#c96d60' },
  L2: { name: 'L2', color: '#927ba8' },
  L3: { name: 'L3', color: '#79a27c' },
  L4: { name: 'L4', color: '#d0aa55' },
  L5: { name: 'L5', color: '#628bb6' },
  L9: { name: 'L9', color: '#c48c66' },
  L10: { name: 'L10', color: '#79abb1' },
  L11: { name: 'L11', color: '#9aaa72' },
});

export const lineOptions = Object.keys(metroLines);

export function lineColor(line) {
  return metroLines[line]?.color ?? metroLines.L4.color;
}

export function stationLabel(name) {
  return (name.trim() || 'Verdaguer').slice(0, 32).toLocaleUpperCase('ca-ES');
}
