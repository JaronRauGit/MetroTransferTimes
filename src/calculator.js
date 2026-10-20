import { defaultStationPreset } from './stationPresets.js';

export const speeds = Object.freeze({
  walkDistance: 1.3,
  escalatorDistance: 1.5,
  numSteps: 1.9,
  walkwayLength: 0.5,
});

export const emptyJourney = Object.freeze({
  walkDistance: '',
  escalatorDistance: '',
  numSteps: '',
  walkwayLength: '',
});

export const defaultJourney = Object.freeze({ ...defaultStationPreset.values });

export function calculateTransfer(values) {
  const seconds = Object.entries(speeds).reduce((total, [key, speed]) => {
    const value = values[key] === '' ? 0 : Number(values[key]);
    if (!Number.isFinite(value) || value < 0) throw new RangeError(`${key} must be a nonnegative number`);
    return total + value / speed;
  }, 0);
  if (!Number.isFinite(seconds)) throw new RangeError('The total transfer time must be finite');
  const wholeSeconds = Math.round(seconds);
  return {
    seconds,
    label: `${Math.floor(wholeSeconds / 60)} min ${String(wholeSeconds % 60).padStart(2, '0')} sec`,
  };
}
