export const trainCycleSeconds = 48;
export const trainBoardingEnd = 38;

const smooth = value => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

export function trainPosition(phase) {
  if (phase < 4) return -21 + 21 * smooth(phase / 4);
  if (phase < 40) return 0;
  if (phase < 44) return 21 * smooth((phase - 40) / 4);
  return 21;
}

export function doorOpening(phase) {
  if (phase < 5 || phase > trainBoardingEnd + 1) return 0;
  if (phase < 6) return smooth(phase - 5);
  if (phase < trainBoardingEnd) return 1;
  return 1 - smooth(phase - trainBoardingEnd);
}
