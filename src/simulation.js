export const simulationTiming = Object.freeze({ duration: 9.2, walkStart: 1.85, walkEnd: 6.85, restoreStart: 8.55 });
export const clamp = value => Math.max(0, Math.min(1, value));
export const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

export function simulationSnapshot(run, now = Date.now()) {
  if (!run) return { elapsed: 0, progress: 0, journey: 0, seconds: 0, desaturation: 0, active: false, stage: 'Ready' };
  const elapsed = Math.max(0, (now - run.startedAt) / 1000);
  const active = run.status === 'running' && elapsed < simulationTiming.duration;
  const journey = clamp((elapsed - simulationTiming.walkStart) / (simulationTiming.walkEnd - simulationTiming.walkStart));
  const desaturation = active ? smooth(elapsed / .45) * (1 - smooth((elapsed - simulationTiming.restoreStart) / .65)) : 0;
  const stage = elapsed < 1.85 ? 'Your train is arriving' : elapsed < 6.45 ? 'Follow your connection' : elapsed < 7.35 ? 'Just in time for the next train' : 'And you’re on your way';
  return { elapsed, progress: clamp(elapsed / simulationTiming.duration), journey, seconds: run.result.seconds * journey, desaturation, active, stage };
}

export function simulationTrainState(role, elapsed, exitDistance = 21) {
  const source = role === 'source';
  const arriveStart = source ? .45 : 5.25, arriveEnd = source ? 1.45 : 6.45;
  const openStart = source ? 1.5 : 6.45, closeStart = source ? 2.45 : 7.05;
  const leaveStart = source ? 2.65 : 7.35, leaveEnd = source ? 3.85 : 8.55;
  const x = elapsed < arriveEnd ? -21 * (1 - smooth((elapsed - arriveStart) / (arriveEnd - arriveStart))) : exitDistance * smooth((elapsed - leaveStart) / (leaveEnd - leaveStart));
  const door = smooth((elapsed - openStart) / .2) * (1 - smooth((elapsed - closeStart) / .2));
  return { x, door, visible: elapsed >= arriveStart && elapsed <= leaveEnd };
}

export function ambientTrainOpacity(role, snapshot) {
  if (!snapshot.active) return 1;
  const t = snapshot.elapsed;
  if (t < .45) return 1 - smooth(t / .45);
  if (t < .65) return 0;
  const occupied = role === 'source' ? t < 3.95 : t > 5.1 && t < 8.55;
  if (occupied) return 0;
  const fade = role === 'destination' && t < 5.1 ? smooth((5.1 - t) / .3) : 1;
  return (.5 + .5 * (1 - snapshot.desaturation)) * fade;
}
