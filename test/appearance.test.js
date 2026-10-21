import test from 'node:test';
import assert from 'node:assert/strict';
import { themeAtTime, worldPalettes } from '../src/appearance.js';

test('automatic appearance uses local hours with night from 19:00 until 07:00', () => {
  for (const [hour, minute, expected] of [[0, 0, 'dark'], [6, 59, 'dark'], [7, 0, 'light'], [12, 0, 'light'], [18, 59, 'light'], [19, 0, 'dark'], [23, 59, 'dark']]) {
    assert.equal(themeAtTime(new Date(2026, 9, 21, hour, minute)), expected);
  }
  assert.notEqual(worldPalettes.dark.background, worldPalettes.light.background);
  assert.notEqual(worldPalettes.dark.monochrome, worldPalettes.light.monochrome);
});
