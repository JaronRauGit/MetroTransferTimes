import { compilePath, getStationPaths } from './journeyPaths.js';

// This is a visual preview: include every stair and boarding section even if
// its input time is zero. Real-time validation uses its separate timed path.
export function createPreviewPath(layout) {
  const nodes = getStationPaths(layout).transfer.nodes.map(({ p, mode, steps }) => ({ p, mode, steps }));
  return compilePath(nodes);
}
