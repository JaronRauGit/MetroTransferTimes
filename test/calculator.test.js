import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateTransfer, emptyJourney, presets } from '../src/calculator.js';

test('adds all four transfer segments and formats the total', () => {
  const result = calculateTransfer({ walkDistance: '130', escalatorDistance: '10', stairDistance: '6.5', walkwayLength: '18' });
  assert.equal(result.seconds, 140);
  assert.equal(result.label, '2 min 20 sec');
});

test('blank fields count as zero, including when using a sample route', () => {
  assert.deepEqual(calculateTransfer(emptyJourney), { seconds: 0, label: '0 min 00 sec' });
  assert.equal(calculateTransfer(presets.quick).seconds.toFixed(2), '56.15');
});

test('rejects negative or non-finite distances', () => {
  assert.throws(() => calculateTransfer({ ...emptyJourney, walkDistance: '-1' }), RangeError);
  assert.throws(() => calculateTransfer({ ...emptyJourney, stairDistance: 'Infinity' }), RangeError);
});
