import { emptyJourney } from '../calculator.js';

const metres = value => Math.max(0, Number(value) || 0);

// The drawing is schematic: real distances change the relative size of the
// passage, while the curved scale keeps long routes inside a usable camera.
export function getStationLayout(values = emptyJourney) {
  const walking = metres(values.walkDistance);
  const walkway = metres(values.walkwayLength);
  const escalator = metres(values.escalatorDistance);
  const stairs = metres(values.numSteps);
  const span = 8 + 12 * (1 - Math.exp(-walking / 250));
  const corridorLength = span - 3.6;

  return {
    span,
    upperX: -span / 2,
    lowerX: span / 2,
    upperConnectionX: -span / 2 + 1.8,
    lowerConnectionX: span / 2 - 1.8,
    corridorLength,
    hasWalkway: walkway > 0,
    walkwayVisualLength: walkway > 0 ? Math.min(corridorLength - .65, 1.5 + walkway * .1) : 0,
    hasEscalator: escalator > 0,
    hasStairs: stairs > 0,
    stairTreads: Math.min(20, Math.max(8, Math.round(8 + stairs / 5))),
    walking,
    walkway,
    escalator,
    stairs,
  };
}
