import test from 'node:test';
import assert from 'node:assert/strict';
import { simulationSnapshot, simulationTiming, simulationTrainState, ambientTrainOpacity } from '../src/simulation.js';
import { getStationPreset, stationPresets, platformOptions } from '../src/stationPresets.js';
import { getStationLayout, volumesIntersect } from '../src/world/stationLayout.js';
import { samplePath } from '../src/world/journeyPaths.js';
import { createPreviewPath } from '../src/world/previewPath.js';

const run = { status: 'running', startedAt: 1000, result: { seconds: 205.12 } };
const snapshot = seconds => simulationSnapshot(run, 1000 + seconds * 1000);

test('the preview counts the full estimate during a five-second walk, then restores the world', () => {
  assert.equal(snapshot(0).seconds, 0);
  assert.ok(Math.abs(simulationTiming.walkStart - simulationTiming.introStart - .5) < 1e-8);
  assert.equal(simulationTrainState('source', simulationTiming.introStart).door, 1);
  assert.equal(snapshot(simulationTiming.introStart + .25).seconds, 0);
  assert.equal(simulationTiming.walkEnd - simulationTiming.walkStart, 5);
  assert.equal(snapshot(simulationTiming.walkStart).seconds, 0);
  assert.ok(Math.abs(snapshot((simulationTiming.walkStart + simulationTiming.walkEnd) / 2).seconds - 102.56) < 1e-8);
  assert.equal(snapshot(simulationTiming.walkEnd).seconds, 205.12);
  assert.equal(snapshot(3).desaturation, 1);
  assert.ok(snapshot(9.3).desaturation < 1 && snapshot(9.3).desaturation > 0);
  assert.equal(snapshot(simulationTiming.duration).active, false);
  assert.equal(snapshot(simulationTiming.duration).desaturation, 0);
  assert.equal(snapshot(100).seconds, 205.12);
  assert.equal(simulationSnapshot({ ...run, status: 'complete' }, 2000).active, false);
});

test('featured trains stop to open their doors and conceal their departure inside the portals', () => {
  for (const role of ['source', 'destination']) {
    let previous = -21;
    for (let t = 0; t < simulationTiming.duration; t += .005) {
      const train = simulationTrainState(role, t, 34);
      assert.ok(train.x >= previous && train.x - previous < .3);
      if (Math.abs(train.x) > .001) assert.equal(train.door, 0);
      previous = train.x;
    }
    assert.ok(simulationTrainState(role, simulationTiming.duration, 34).x - 6.6 > 26.28);
  }
  assert.equal(simulationTrainState('source', simulationTiming.walkStart).door, 1);
  assert.equal(simulationTrainState('destination', simulationTiming.walkEnd).door, 1);
  assert.equal(ambientTrainOpacity('source', snapshot(2)), 0);
  assert.equal(ambientTrainOpacity('destination', snapshot(7.3)), 0);
  assert.equal(ambientTrainOpacity('source', snapshot(5)), .5);
});

test('the preview traverses every physical stair and stays off the tracks across all original routes', () => {
  for (const station of stationPresets) for (const from of platformOptions) for (const to of platformOptions) {
    const { values } = getStationPreset(station.id, from.id, to.id);
    const layout = getStationLayout(values), path = createPreviewPath(layout);
    assert.ok(path.segments.some(segment => segment.mode === 'stairs'));
    for (const segment of path.segments) for (const fraction of [.1, .5, .9]) {
      const pose = samplePath(path, segment.start + segment.duration * fraction);
      assert.ok(pose.p.every(Number.isFinite));
      if (segment.mode === 'boarding') continue;
      const person = { min: [pose.p[0] - .25, pose.p[1], pose.p[2] - .25], max: [pose.p[0] + .25, pose.p[1] + 1.4, pose.p[2] + .25] };
      for (const train of layout.trainEnvelopes) assert.equal(volumesIntersect(person, train), false);
    }
    assert.ok(samplePath(path, path.duration).p.every((value, axis) => Math.abs(value - path.nodes.at(-1).p[axis]) < 1e-8));
  }
});
