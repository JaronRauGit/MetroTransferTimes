import assert from 'node:assert/strict';
import test from 'node:test';
import { doorOpening, trainPosition, trainExitDistance, trainCycleSeconds } from '../src/world/trainSchedule.js';

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

test('even the longest exposed upper track clears the complete train before the loop resets', () => {
  for (const end of [9.2, 12.28, 20.5, 26.28]) {
    const exitDistance = trainExitDistance(end);
    assert.ok(trainPosition(trainCycleSeconds - .01, exitDistance) - 6.6 > end);
    assert.ok(trainPosition(43, exitDistance) > 0);
    assert.equal(doorOpening(43), 0);
  }
});
