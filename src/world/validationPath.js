import { calculateTransfer, speeds } from '../calculator.js';
import { getStationPaths, compilePath, samplePath } from './journeyPaths.js';

const inputForMode = { walk: 'walkDistance', escalator: 'escalatorDistance', stairs: 'stairDistance', walkway: 'walkwayLength' };
export const validationStageNames = { walk: 'Tunnel & platform walk', escalator: 'Escalator', stairs: 'Stairs', walkway: 'Moving walkway' };

// Include the whole platform-to-platform route, without train boarding or
// decorative commuter waits. Each mode receives its exact calculated time.
export function createValidationPath(layout, values) {
  const nodes = getStationPaths(layout).transfer.nodes.slice(1, -1).map(({ p, mode, steps }) => ({ p, mode: mode === 'boarding' ? 'walk' : mode, steps }));
  const visual = compilePath(nodes);
  const length = segment => Math.hypot(...segment.to.map((value, axis) => value - segment.from[axis]));
  const totals = {};
  visual.segments.forEach(segment => { totals[segment.mode] = (totals[segment.mode] ?? 0) + length(segment); });
  let start = 0;
  const segments = visual.segments.map(segment => {
    const key = inputForMode[segment.mode];
    const seconds = (Number(values[key]) || 0) / speeds[key];
    const duration = seconds * length(segment) / totals[segment.mode];
    const next = { ...segment, start, duration };
    start += duration;
    return next;
  }).filter(segment => segment.duration > 0);
  return { nodes, segments, duration: calculateTransfer(values).seconds };
}

export function sampleValidationPath(path, elapsed) {
  if (path.duration <= 0 || elapsed >= path.duration) return { p: path.nodes.at(-1).p, mode: 'arrived', moving: false };
  return samplePath(path, Math.max(0, elapsed));
}
