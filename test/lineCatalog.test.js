import test from 'node:test';
import assert from 'node:assert/strict';
import { lineColor, lineOptions, stationLabel } from '../src/world/lineCatalog.js';

test('Barcelona lines have stable distinct colours', () => {
  assert.ok(lineOptions.includes('L4'));
  assert.ok(lineOptions.includes('L5'));
  assert.notEqual(lineColor('L4'), lineColor('L5'));
  assert.equal(lineColor('unknown'), lineColor('L4'));
});

test('station names update signs with a safe compact label', () => {
  assert.equal(stationLabel('  verdaguer  '), 'VERDAGUER');
  assert.equal(stationLabel(' '), 'CUSTOM STATION');
  assert.ok(stationLabel('x'.repeat(100)).length <= 32);
});
