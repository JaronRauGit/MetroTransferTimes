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

export const presets = Object.freeze({
  quick: { walkDistance: '65', escalatorDistance: '0', numSteps: '12', walkwayLength: '0' },
  long: { walkDistance: '180', escalatorDistance: '24', numSteps: '32', walkwayLength: '45' },
});

export function calculateTransfer(values) {
  const seconds = Object.entries(speeds).reduce((total, [key, speed]) => {
    const value = values[key] === '' ? 0 : Number(values[key]);
    if (!Number.isFinite(value) || value < 0) throw new RangeError(`${key} must be a nonnegative number`);
    return total + value / speed;
  }, 0);
  const wholeSeconds = Math.round(seconds);
  return {
    seconds,
    label: `${Math.floor(wholeSeconds / 60)} min ${String(wholeSeconds % 60).padStart(2, '0')} sec`,
  };
}
