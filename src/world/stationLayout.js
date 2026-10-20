import { emptyJourney } from '../calculator.js';

const metres = value => Math.max(0, Number(value) || 0);

// The drawing is schematic: real distances change the relative size of the
// passage, while the curved scale keeps long routes inside a usable camera.
export function getStationLayout(values = emptyJourney) {
  const walking = metres(values.walkDistance);
  const walkway = metres(values.walkwayLength);
  const escalator = metres(values.escalatorDistance);
  const stairs = metres(values.numSteps);
  const span = 7.6 + 11.4 * (1 - Math.exp(-walking / 260));
  const upperX = -span / 2 + 1;
  const lowerX = span / 2 + .5;
  const upperConnectionX = upperX + 2;
  const lowerConnectionX = lowerX + .35;
  const corridorLength = lowerConnectionX - upperConnectionX;

  return {
    span,
    upperX,
    lowerX,
    upperConnectionX,
    lowerConnectionX,
    entranceX: upperX - 3.55,
    corridorLength,
    hasWalkway: walkway > 0,
    walkwayVisualLength: walkway > 0 ? Math.min(corridorLength - 3.5, 1.4 + walkway * .1) : 0,
    stairTreads: Math.min(20, Math.max(8, Math.round(8 + stairs / 5))),
    escalatorTreads: Math.min(24, Math.max(12, Math.round(12 + escalator / 5))),
    walking,
    walkway,
    escalator,
    stairs,
  };
}
