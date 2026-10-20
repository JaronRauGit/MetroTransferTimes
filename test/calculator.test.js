import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateTransfer, emptyJourney } from '../src/calculator.js';

test('uses the original metre/step units and the original four speeds', () => {
  const result = calculateTransfer({ walkDistance: '130', escalatorDistance: '15', numSteps: '19', walkwayLength: '10' });
  assert.equal(result.seconds, 140);
  assert.equal(result.label, '2 min 20 sec');
});

test('blank fields count as zero', () => {
  assert.deepEqual(calculateTransfer(emptyJourney), { seconds: 0, label: '0 min 00 sec' });
});

test('rejects negative or non-finite distances and step counts', () => {
  assert.throws(() => calculateTransfer({ ...emptyJourney, walkDistance: '-1' }), RangeError);
  assert.throws(() => calculateTransfer({ ...emptyJourney, numSteps: 'Infinity' }), RangeError);
});
