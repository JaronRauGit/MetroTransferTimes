import test from 'node:test';
import assert from 'node:assert/strict';
import { getStationLayout, stationDimensions as d, volumesIntersect } from '../src/world/stationLayout.js';
import { defaultJourney, emptyJourney } from '../src/calculator.js';
import { getStationPaths, samplePath } from '../src/world/journeyPaths.js';
import { trainBoardingEnd } from '../src/world/trainSchedule.js';

const scenarios = [];
for (const walkDistance of ['0', '200', '1000', '1000000000'])
  for (const escalatorDistance of ['0', '30', '1000', '1000000000'])
    for (const stairDistance of ['0', '12', '1000', '1000000000'])
      for (const walkwayLength of ['0', '35', '1000', '1000000000'])
        scenarios.push({ walkDistance, escalatorDistance, stairDistance, walkwayLength });

test('tunnel, escalator, and stairs grow physically and approach finite limits', () => {
  const zero = getStationLayout(emptyJourney);
  const normal = getStationLayout(defaultJourney);
  const huge = getStationLayout({ walkDistance: '1e12', escalatorDistance: '1e12', stairDistance: '1e12', walkwayLength: '1e12' });
  assert.ok(zero.corridorLength >= 14);
  assert.ok(normal.corridorLength > zero.corridorLength + 8);
  assert.ok(normal.escalatorRun > zero.escalatorRun + 1.5);
  assert.ok(normal.stairRun > zero.stairRun + 1);
  assert.ok(normal.lowerY < zero.lowerY - .8);
  assert.ok(huge.corridorLength < 29 && huge.escalatorRun < 7 && huge.stairRun < 8);
  const riseEarly = getStationLayout({ escalatorDistance: '100' }).escalatorRun - zero.escalatorRun;
  const riseLate = getStationLayout({ escalatorDistance: '200' }).escalatorRun - getStationLayout({ escalatorDistance: '100' }).escalatorRun;
  assert.ok(riseLate < riseEarly / 4);
});

test('train clearances, landings, and orthogonal track crossing survive 256 input combinations', () => {
  for (const values of scenarios) {
    const l = getStationLayout(values);
    for (const train of l.trainEnvelopes) for (const floor of l.walkingVolumes)
      assert.equal(volumesIntersect(train, floor), false, `${train.name} intersects ${floor.name}: ${JSON.stringify(values)}`);
    assert.equal(volumesIntersect(...l.trainEnvelopes), false);
    assert.ok(l.tunnelY - .32 - (l.lowerY + d.trainTop) >= 1.1);
    const lowerRailX = l.lowerX + d.trackZ;
    assert.ok(lowerRailX > l.upperX - d.trackHalfLength && lowerRailX < l.upperX + l.upperTrackEndX);
    assert.ok(d.trackZ > l.lowerZ - d.trackHalfLength && d.trackZ < l.lowerZ + d.trackHalfLength);
    assert.equal(l.upperDescent.topY, l.upperY);
    assert.equal(l.upperDescent.bottomY, l.tunnelY);
    assert.equal(l.upperDescent.bottomZ, l.tunnelNearZ);
    assert.equal(l.lowerDescent.topY, l.tunnelY);
    assert.equal(l.lowerDescent.bottomY, l.lowerY);
    assert.ok(l.lowerStairBottomZ > l.lowerZ - d.platformHalfLength + .5);
    assert.ok(l.tunnelNearZ < l.lowerZ + d.platformHalfLength - .3);
    assert.ok(l.streetY - .44 > l.upperY + d.trainTop + 2);
    assert.ok(d.portalInnerHalfWidth > d.trainHalfWidth + .2);
    assert.ok(d.portalCeiling > d.trainTop + .3);
  }
});

test('the fixed entrance lands inside the platform, clear of the rails', () => {
  const base = getStationLayout(emptyJourney);
  for (const values of scenarios) {
    const l = getStationLayout(values);
    assert.deepEqual([l.entranceTopX, l.entranceBottomX, l.entranceZ, l.streetY, l.upperY], [base.entranceTopX, base.entranceBottomX, base.entranceZ, base.streetY, base.upperY]);
    assert.ok(l.entranceBottomX + 1.3 < l.upperX + d.platformHalfLength);
    assert.ok(l.entranceZ - .85 > d.trackZ + d.trainHalfWidth + .5);
    assert.ok(l.entranceZ + .85 < d.platformHalfWidth);
  }
});

test('moving walkways are optional, fit between the landings, and accelerate commuters', () => {
  assert.equal(getStationLayout(emptyJourney).hasWalkway, false);
  for (const values of scenarios) {
    const l = getStationLayout(values), path = getStationPaths(l).transfer;
    const belt = path.segments.find(segment => segment.mode === 'walkway');
    if (!l.hasWalkway) { assert.equal(belt, undefined); continue; }
    assert.ok(l.walkwayStartX > l.escalatorX + .65);
    assert.ok(l.walkwayEndX < l.lowerX - .65);
    assert.ok(belt.duration < (belt.to[0] - belt.from[0]) / 1.75);
  }
});

test('commuter routes stay off the tracks except while boarding and reach open doors', () => {
  for (const values of scenarios) {
    const l = getStationLayout(values), paths = getStationPaths(l);
    assert.ok(paths.lowerDoorZ < l.lowerStairBottomZ - .25);
    assert.ok(paths.transfer.duration + 3.5 < trainBoardingEnd);
    assert.ok(paths.entry.duration + 2 + 6 < trainBoardingEnd);
    for (const path of [paths.transfer, paths.entry, paths.exit, paths.reverse]) {
      for (const segment of path.segments) {
        if (segment.mode === 'boarding') continue;
        for (const fraction of [.05, .3, .6, .95]) {
          const { p } = samplePath(path, segment.start + fraction * segment.duration);
          assert.ok(p.every(Number.isFinite));
          const person = { min: [p[0] - .16, p[1], p[2] - .16], max: [p[0] + .16, p[1] + .85, p[2] + .16] };
          for (const train of l.trainEnvelopes) assert.equal(volumesIntersect(person, train), false, `walking into ${train.name}: ${JSON.stringify(values)}`);
        }
      }
    }
  }
});
