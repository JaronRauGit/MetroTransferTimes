import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { stationPresets, platformOptions, getStationPreset, defaultStationPreset } from '../src/stationPresets.js';
import { calculateTransfer, defaultJourney } from '../src/calculator.js';
import { getStationLayout, volumesIntersect } from '../src/world/stationLayout.js';
import { createValidationPath, sampleValidationPath } from '../src/world/validationPath.js';

// Immutable source snapshot from Second@1a75db5. Run its actual selection and
// calculation functions to catch altered measurements, direction or units.
const originalHtml = readFileSync(new URL('./fixtures/original-calculator.html', import.meta.url), 'utf8');
const originalScript = originalHtml.match(/<script>([\s\S]*?)<\/script>/)[1];
function originalRoute(station, from, to) {
  const fields = Object.fromEntries(['walkDistance', 'escalatorDistance', 'numSteps', 'walkwayLength', 'calculatedTime'].map(key => [key, { value: '' }]));
  fields.metroStation = { value: station };
  fields.startPlatform = { value: from };
  fields.destinationPlatform = { value: to };
  runInNewContext(`${originalScript}\nconfirmSelection(); calculateTime();`, { document: { getElementById: id => fields[id] } });
  return { values: Object.fromEntries(['walkDistance', 'escalatorDistance', 'numSteps', 'walkwayLength'].map(key => [key, String(fields[key].value)])), seconds: fields.calculatedTime.innerText };
}

test('only the original Sants and Diagonal presets remain, and the default uses their measurements', () => {
  assert.deepEqual(stationPresets.map(item => item.id).sort(), ['diagonal', 'sants']);
  assert.deepEqual(defaultJourney, defaultStationPreset.values);
  assert.equal(defaultStationPreset.station.name, 'Diagonal');
  assert.throws(() => getStationPreset('verdaguer'), RangeError);
  assert.throws(() => getStationPreset('sants', 'unknown'), RangeError);
});

test('all 32 original platform pairs reproduce the original inputs, calculation and validation duration', () => {
  for (const station of stationPresets) for (const from of platformOptions) for (const to of platformOptions) {
    const route = getStationPreset(station.id, from.id, to.id);
    const original = originalRoute(station.id, from.id, to.id);
    assert.deepEqual(route.values, original.values, `${station.id}: ${from.id} → ${to.id}`);
    const result = calculateTransfer(route.values);
    assert.equal(result.seconds.toFixed(2), original.seconds);
    assert.equal(route.station.fromLine, from.line);
    assert.equal(route.station.toLine, to.line);
    if (from.id === to.id) assert.equal(result.seconds, 0);
    const layout = getStationLayout(route.values);
    for (const train of layout.trainEnvelopes) for (const floor of layout.walkingVolumes)
      assert.equal(volumesIntersect(train, floor), false, `${station.id}: ${train.name} intersects ${floor.name}`);
    const path = createValidationPath(layout, route.values);
    assert.ok(Math.abs(path.segments.reduce((sum, segment) => sum + segment.duration, 0) - result.seconds) < 1e-8);
    assert.equal(sampleValidationPath(path, result.seconds).mode, 'arrived');
  }
});

test('direction-specific differences are preserved rather than averaged', () => {
  assert.equal(getStationPreset('diagonal', 'l3_trinitat', 'l5_hebron').values.escalatorDistance, '46');
  assert.equal(getStationPreset('diagonal', 'l5_hebron', 'l3_trinitat').values.escalatorDistance, '58');
});
