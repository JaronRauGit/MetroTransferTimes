import test from 'node:test';
import assert from 'node:assert/strict';
import { stationPresets } from '../src/stationPresets.js';
import { calculateTransfer, speeds } from '../src/calculator.js';
import { lineOptions } from '../src/world/lineCatalog.js';
import { getStationLayout, volumesIntersect } from '../src/world/stationLayout.js';

test('station examples load a complete, calculable route with supported lines and clear geometry', () => {
  for (const preset of stationPresets) {
    assert.ok(preset.station.name);
    assert.ok(lineOptions.includes(preset.station.fromLine));
    assert.ok(lineOptions.includes(preset.station.toLine));
    assert.notEqual(preset.station.fromLine, preset.station.toLine);
    assert.deepEqual(Object.keys(preset.values).sort(), Object.keys(speeds).sort());
    assert.ok(calculateTransfer(preset.values).seconds > 0);
    const layout = getStationLayout(preset.values);
    for (const train of layout.trainEnvelopes) for (const floor of layout.walkingVolumes)
      assert.equal(volumesIntersect(train, floor), false, `${preset.id}: ${train.name} intersects ${floor.name}`);
  }
});
