import { defaultJourney } from '../calculator.js';

export const stationDimensions = Object.freeze({
  platformHalfLength: 7.3,
  platformHalfWidth: 1.18,
  platformThickness: .42,
  trackZ: -2.22,
  trackHalfLength: 9.4,
  trainHalfWidth: .84,
  trainBottom: -.42,
  trainTop: 1.55,
  portalInnerHalfWidth: 1.08,
  portalCeiling: 1.88,
});

const metres = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
const compressed = (value, scale) => -Math.expm1(-value / scale);
const box = (name, x, y, z) => ({ name, min: [x[0], y[0], z[0]], max: [x[1], y[1], z[1]] });

// Every y value is a finished walking surface, not the centre of a slab.
// Curves approach a finite limit; long inputs never create unbounded geometry.
export function getStationLayout(values = defaultJourney) {
  const walking = metres(values.walkDistance);
  const walkway = metres(values.walkwayLength);
  const escalator = metres(values.escalatorDistance);
  const stairs = metres(values.stairDistance);
  const upperX = -3.2;
  const upperY = 0;
  const upperZ = 0;
  const lowerX = 2.6 + 5.5 * compressed(walking + walkway, 260);
  const lowerZ = 1;
  const escalatorRun = 2.9 + 3.8 * compressed(escalator, 45);
  const escalatorRise = 1.65 + 1.15 * compressed(escalator, 45);
  const stairRun = 3.6 + 4 * compressed(stairs, 40);
  const stairRise = 3 + 1.65 * compressed(stairs, 40);
  const tunnelY = upperY - escalatorRise;
  const lowerY = tunnelY - stairRise;
  const upperConnectionX = upperX + 1.8;
  const stairX = upperConnectionX - .95;
  const escalatorX = upperConnectionX + .95;
  const stairTopZ = stationDimensions.platformHalfWidth;
  const tunnelNearZ = stairTopZ + escalatorRun;
  const tunnelZ = tunnelNearZ + 1.3;
  const tunnelFarZ = tunnelZ + 1.3;
  const tunnelStartX = stairX - .98;
  const tunnelEndX = lowerX + 1.18;
  const corridorLength = tunnelEndX - tunnelStartX;
  const lowerStairBottomZ = tunnelNearZ - stairRun;
  const walkwayVisualLength = walkway > 0
    ? Math.min(lowerX - escalatorX - 2, 1.2 + 5.6 * compressed(walkway, 60)) : 0;
  const walkwayX = (escalatorX + lowerX) / 2;
  const entranceX = upperX - 3.8;
  const entranceZ = .25;
  const entranceTopX = entranceX - 2.1;
  const entranceBottomX = entranceX + 2.1;
  const streetY = 4.45;
  const streetMinX = upperX - 10.3;
  const streetMaxX = lowerX + 6;
  const groundY = lowerY - 1.25;
  const upperDescent = { topY: upperY, bottomY: tunnelY, topZ: stairTopZ, bottomZ: tunnelNearZ };
  const lowerDescent = { x: lowerX, topY: tunnelY, bottomY: lowerY, topZ: tunnelNearZ, bottomZ: lowerStairBottomZ };

  const d = stationDimensions;
  const trainEnvelopes = [
    box('upper train', [upperX - d.trackHalfLength, upperX + d.trackHalfLength], [upperY + d.trainBottom, upperY + d.trainTop], [d.trackZ - d.trainHalfWidth, d.trackZ + d.trainHalfWidth]),
    box('lower train', [lowerX + d.trackZ - d.trainHalfWidth, lowerX + d.trackZ + d.trainHalfWidth], [lowerY + d.trainBottom, lowerY + d.trainTop], [lowerZ - d.trackHalfLength, lowerZ + d.trackHalfLength]),
  ];
  const walkingVolumes = [
    box('upper platform', [upperX - d.platformHalfLength, upperX + d.platformHalfLength], [upperY - d.platformThickness, upperY], [-d.platformHalfWidth, d.platformHalfWidth]),
    box('lower platform', [lowerX - d.platformHalfWidth, lowerX + d.platformHalfWidth], [lowerY - d.platformThickness, lowerY], [lowerZ - d.platformHalfLength, lowerZ + d.platformHalfLength]),
    box('transfer passage', [tunnelStartX, tunnelEndX], [tunnelY - .32, tunnelY], [tunnelNearZ, tunnelFarZ]),
    box('upper stair and escalator', [stairX - .92, escalatorX + .92], [tunnelY - .25, upperY], [stairTopZ, tunnelNearZ]),
    box('lower stairs', [lowerX - .88, lowerX + .88], [lowerY - .22, tunnelY], [lowerStairBottomZ, tunnelNearZ]),
    box('entrance stairs', [entranceTopX, entranceBottomX], [upperY - .22, streetY], [entranceZ - .85, entranceZ + .85]),
  ];

  return {
    walking, walkway, escalator, stairs,
    upperX, upperY, upperZ, lowerX, lowerY, lowerZ,
    upperConnectionX, stairX, escalatorX, escalatorRun, escalatorRise, stairRun, stairRise,
    tunnelY, tunnelZ, tunnelNearZ, tunnelFarZ, tunnelStartX, tunnelEndX, corridorLength,
    lowerStairBottomZ, upperDescent, lowerDescent,
    entranceX, entranceZ, entranceTopX, entranceBottomX, streetY, streetMinX, streetMaxX, groundY,
    hasWalkway: walkway > 0, walkwayVisualLength, walkwayX,
    walkwayStartX: walkwayX - walkwayVisualLength / 2,
    walkwayEndX: walkwayX + walkwayVisualLength / 2,
    stairTreads: Math.min(36, Math.ceil(stairRun / .22)),
    escalatorTreads: Math.min(32, Math.ceil(escalatorRun / .22)),
    trainEnvelopes, walkingVolumes,
  };
}

export function volumesIntersect(a, b, tolerance = .001) {
  return a.min.every((value, axis) => value < b.max[axis] - tolerance && a.max[axis] > b.min[axis] + tolerance);
}
