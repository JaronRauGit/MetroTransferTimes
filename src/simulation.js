export const simulationTiming = Object.freeze({ duration: 9.7, introStart: 1.85, walkStart: 2.35, walkEnd: 7.35, restoreStart: 9.05 });
export const clamp = value => Math.max(0, Math.min(1, value));
export const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

// Decorative playback uses presented frames, unlike the real-time validator.
// Two warm-up frames let mounting/resizing finish before the train arrives.
export function createPlayback() { return { elapsed: 0, frames: 0 }; }
export function advancePlayback(playback, delta, ready = true, visible = true) {
  if (!ready || !visible) return playback.elapsed;
  if (playback.frames++ < 2) return playback.elapsed;
  const step = Number.isFinite(delta) ? Math.max(0, Math.min(delta, .05)) : 0;
  playback.elapsed = Math.min(simulationTiming.duration, playback.elapsed + step);
  return playback.elapsed;
}

export function simulationSnapshot(run, now = Date.now()) {
  if (!run) return { elapsed: 0, progress: 0, journey: 0, seconds: 0, desaturation: 0, active: false, stage: 'Ready' };
  const elapsed = run.playback?.elapsed ?? Math.max(0, (now - run.startedAt) / 1000);
  const active = run.status === 'running' && elapsed < simulationTiming.duration;
  const journey = clamp((elapsed - simulationTiming.walkStart) / (simulationTiming.walkEnd - simulationTiming.walkStart));
  const desaturation = active ? smooth(elapsed / .45) * (1 - smooth((elapsed - simulationTiming.restoreStart) / .65)) : 0;
  const stage = elapsed < simulationTiming.introStart ? 'Train arriving' : elapsed < simulationTiming.walkStart ? 'Ready to walk' : elapsed < simulationTiming.walkEnd ? 'Simulating transfer' : 'Completing simulation';
  return { elapsed, progress: clamp(elapsed / simulationTiming.duration), journey, seconds: run.result.seconds * journey, desaturation, active, stage };
}

export function simulationTrainState(role, elapsed, exitDistance = 21) {
  const source = role === 'source';
  const arriveStart = source ? .45 : 5.75, arriveEnd = source ? 1.45 : 6.95;
  const openStart = source ? 1.5 : 6.95, closeStart = source ? 2.95 : 7.55;
  const leaveStart = source ? 3.15 : 7.85, leaveEnd = source ? 4.35 : 9.05;
  const x = elapsed < arriveEnd ? -21 * (1 - smooth((elapsed - arriveStart) / (arriveEnd - arriveStart))) : exitDistance * smooth((elapsed - leaveStart) / (leaveEnd - leaveStart));
  const door = smooth((elapsed - openStart) / .2) * (1 - smooth((elapsed - closeStart) / .2));
  return { x, door, visible: elapsed >= arriveStart && elapsed <= leaveEnd };
}

export function ambientTrainOpacity(role, snapshot) {
  if (!snapshot.active) return 1;
  const t = snapshot.elapsed;
  if (t < .45) return 1 - smooth(t / .45);
  if (t < .65) return 0;
  const occupied = role === 'source' ? t < 4.45 : t > 5.6 && t < 9.05;
  if (occupied) return 0;
  const fade = role === 'destination' && t < 5.6 ? smooth((5.6 - t) / .3) : 1;
  return (.5 + .5 * (1 - snapshot.desaturation)) * fade;
}
