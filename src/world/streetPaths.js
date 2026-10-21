import { compilePath, samplePath } from './journeyPaths.js';

// Local streetscape coordinates. Two walking lanes bend behind the stairwell;
// bicycle and occasional car trips use their own continuous surface lanes.
export function getStreetWalkingPath(layout, { reverse = false, lane = 0, pause = false } = {}) {
  const z = lane === 0 ? .16 : -.38;
  const behind = lane === 0 ? -1.16 : -1.66;
  const top = layout.entranceTopX - .55, bottom = layout.entranceBottomX + .55;
  const points = [
    [layout.streetMinX + .45, 3.58, z], [top, 3.58, z],
    [top, 3.58, behind], [bottom, 3.58, behind], [bottom, 3.58, z],
    [layout.upperX + 4, 3.58, z], [layout.streetMaxX - .45, 3.58, z],
  ];
  const nodes = (reverse ? points.reverse() : points).map((p, i) => ({ p, ...(pause && i === 5 ? { wait: 2.5 } : {}) }));
  return compilePath(nodes, .95);
}

export function getStreetVehiclePath(layout, { reverse = false, bicycle = true } = {}) {
  const margin = bicycle ? .75 : .8;
  const z = bicycle ? -3.12 + (reverse ? -.21 : .21) : -2.37;
  const nodes = [[layout.streetMinX + margin, 3.58, z], [layout.streetMaxX - margin, 3.58, z]].map(p => ({ p }));
  return compilePath(reverse ? nodes.reverse() : nodes, bicycle ? 1.75 : 1.5);
}

export function sampleStreetTrip(path, time, offset = 0, rest = 3) {
  const cycle = path.duration + rest;
  const phase = ((time + offset) % cycle + cycle) % cycle;
  return { ...samplePath(path, Math.min(phase, path.duration)), visible: phase <= path.duration, opacity: Math.max(0, Math.min(1, phase / .65, (path.duration - phase) / .65)), time: phase };
}
