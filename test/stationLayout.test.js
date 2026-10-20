import test from 'node:test';
import assert from 'node:assert/strict';
import { getStationLayout } from '../src/world/stationLayout.js';

test('a longer walking distance stretches the connecting passage', () => {
  const short = getStationLayout({ walkDistance: '100' });
  const long = getStationLayout({ walkDistance: '500' });
  assert.ok(long.span > short.span + 5);
  assert.ok(long.corridorLength > short.corridorLength);
});

test('a moving walkway only appears when its length is entered', () => {
  const absent = getStationLayout({ walkwayLength: '0' });
  const present = getStationLayout({ walkwayLength: '45', walkDistance: '180' });
  assert.equal(absent.hasWalkway, false);
  assert.equal(absent.walkwayVisualLength, 0);
  assert.equal(present.hasWalkway, true);
  assert.ok(present.walkwayVisualLength > 5);
});

test('the station always has stairs and an escalator, with input affecting detail', () => {
  const base = getStationLayout();
  const route = getStationLayout({ numSteps: '45', escalatorDistance: '24' });
  assert.ok(base.stairTreads > 0);
  assert.ok(base.escalatorTreads > 0);
  assert.ok(route.stairTreads > base.stairTreads);
  assert.ok(route.escalatorTreads > base.escalatorTreads);
});
