export const trainCycleSeconds = 48;
export const trainBoardingEnd = 38;

const smooth = value => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

export function trainExitDistance(visibleEndX) {
  return Math.max(21, visibleEndX + 7.2);
}

export function trainPosition(phase, exitDistance = 21) {
  if (phase < 4) return -21 + 21 * smooth(phase / 4);
  if (phase < 40) return 0;
  if (phase < 46) return exitDistance * smooth((phase - 40) / 6);
  return exitDistance;
}

export function doorOpening(phase) {
  if (phase < 5 || phase > trainBoardingEnd + 1) return 0;
  if (phase < 6) return smooth(phase - 5);
  if (phase < trainBoardingEnd) return 1;
  return 1 - smooth(phase - trainBoardingEnd);
}
