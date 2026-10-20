export function validationSnapshot(run, now = Date.now()) {
  if (!run) return { elapsed: 0, remaining: 0, progress: 0, complete: false };
  const elapsed = Math.min(run.duration, Math.max(0, (now - run.startedAt) / 1000));
  return { elapsed, remaining: Math.max(0, run.duration - elapsed), progress: run.duration > 0 ? elapsed / run.duration : 1, complete: elapsed >= run.duration };
}

export function formatClock(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const tail = `${String(minutes).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  return hours ? `${hours}:${tail}` : tail;
}
