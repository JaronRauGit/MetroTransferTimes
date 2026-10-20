import assert from 'node:assert/strict';
import test from 'node:test';
import { doorOpening, trainPosition, trainCycleSeconds } from '../src/world/trainSchedule.js';

test('trains move continuously through the portals with doors closed during motion', () => {
  let previous = trainPosition(0);
  for (let time = .01; time < trainCycleSeconds; time += .01) {
    const position = trainPosition(time);
    assert.ok(position >= previous && position - previous < .1);
    if (Math.abs(position) > .001) assert.equal(doorOpening(time), 0);
    previous = position;
  }
  assert.ok(trainPosition(0) + 6.6 < -9.2);
  assert.ok(trainPosition(trainCycleSeconds - .1) - 6.6 > 9.2);
  assert.equal(trainPosition(16), 0);
  assert.equal(doorOpening(16), 1);
});
