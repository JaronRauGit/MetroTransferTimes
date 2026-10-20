export const trainCycleSeconds = 40;

const smooth = value => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

export function trainPosition(phase) {
  if (phase < 4) return -21 + 21 * smooth(phase / 4);
  if (phase < 32) return 0;
  if (phase < 36) return 21 * smooth((phase - 32) / 4);
  return 21;
}

export function doorOpening(phase) {
  if (phase < 5 || phase > 31) return 0;
  if (phase < 6) return smooth(phase - 5);
  if (phase < 30) return 1;
  return 1 - smooth(phase - 30);
}
