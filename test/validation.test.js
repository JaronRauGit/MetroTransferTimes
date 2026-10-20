import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTransfer, defaultJourney, emptyJourney, speeds } from '../src/calculator.js';
import { validationSnapshot, formatClock } from '../src/validation.js';
import { createValidationPath, sampleValidationPath } from '../src/world/validationPath.js';
import { getStationLayout, getStationShape, interpolateStationShape, volumesIntersect } from '../src/world/stationLayout.js';

const nearly = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);

test('validation uses elapsed wall time and finishes once at the exact deadline, including after a hidden tab', () => {
  const run = { startedAt: 1000, duration: 120 };
  nearly(validationSnapshot(run, 31000).progress, .25);
  assert.equal(validationSnapshot(run, 120999).complete, false);
  assert.deepEqual(validationSnapshot(run, 121000), { elapsed: 120, remaining: 0, progress: 1, complete: true });
  assert.deepEqual(validationSnapshot(run, 901000), validationSnapshot(run, 121000));
  assert.equal(validationSnapshot(run, 0).elapsed, 0);
  assert.equal(formatClock(119.1), '02:00');
  assert.equal(formatClock(3601), '1:00:01');
});

test('the validation route gives each transport mode its full calculated time, without train waits or boarding', () => {
  const path = createValidationPath(getStationLayout(defaultJourney), defaultJourney);
  nearly(path.segments.reduce((sum, segment) => sum + segment.duration, 0), calculateTransfer(defaultJourney).seconds);
  for (const [mode, key] of Object.entries({ walk: 'walkDistance', escalator: 'escalatorDistance', stairs: 'numSteps', walkway: 'walkwayLength' })) {
    nearly(path.segments.filter(segment => segment.mode === mode).reduce((sum, segment) => sum + segment.duration, 0), Number(defaultJourney[key]) / speeds[key]);
  }
  assert.ok(path.segments.every(segment => segment.duration > 0 && !['wait', 'boarding'].includes(segment.mode)));
  const escalation = path.segments.find(segment => segment.mode === 'escalator');
  const halfway = sampleValidationPath(path, escalation.start + escalation.duration / 2);
  assert.equal(halfway.mode, 'escalator');
  nearly(halfway.p[1], (escalation.from[1] + escalation.to[1]) / 2);
  assert.notEqual(sampleValidationPath(path, path.duration - .01).mode, 'arrived');
  assert.deepEqual(sampleValidationPath(path, path.duration).p, path.nodes.at(-1).p);
  assert.deepEqual(sampleValidationPath(path, path.duration * 3).p, path.nodes.at(-1).p);
});

test('zero-length sections are instantaneous and all route samples stay finite', () => {
  for (const key of Object.keys(speeds)) {
    const values = { ...emptyJourney, [key]: '120' };
    const path = createValidationPath(getStationLayout(values), values);
    nearly(path.segments.reduce((sum, segment) => sum + segment.duration, 0), 120 / speeds[key]);
    for (const t of [0, .1, .5, .99, 1, 2]) assert.ok(sampleValidationPath(path, path.duration * t).p.every(Number.isFinite));
  }
  const empty = createValidationPath(getStationLayout(emptyJourney), emptyJourney);
  assert.equal(sampleValidationPath(empty, 0).mode, 'arrived');
  assert.throws(() => calculateTransfer(Object.fromEntries(Object.keys(speeds).map(key => [key, '1e308']))), RangeError);
});

test('size transitions retain clear train envelopes and connected landings at every intermediate shape', () => {
  const examples = [emptyJourney, defaultJourney, { walkDistance: '1e12', escalatorDistance: '1e12', numSteps: '1e12', walkwayLength: '1e12' }, { walkDistance: '1000', escalatorDistance: '0', numSteps: '1000', walkwayLength: '0' }];
  for (const from of examples) for (const to of examples) for (const t of [0, .1, .25, .5, .75, .9, 1]) {
    const shape = interpolateStationShape(getStationShape(from), getStationShape(to), t);
    const l = getStationLayout(to, shape);
    for (const train of l.trainEnvelopes) for (const walk of l.walkingVolumes) assert.equal(volumesIntersect(train, walk), false);
    assert.equal(l.upperDescent.bottomY, l.tunnelY);
    assert.equal(l.lowerDescent.bottomY, l.lowerY);
    assert.ok(l.corridorLength >= 14 && l.corridorLength < 29);
    if (t === .5 && from !== to) {
      const start = getStationLayout(from), end = getStationLayout(to);
      if (start.lowerX !== end.lowerX) assert.ok(l.lowerX > Math.min(start.lowerX, end.lowerX) && l.lowerX < Math.max(start.lowerX, end.lowerX));
    }
  }
});
