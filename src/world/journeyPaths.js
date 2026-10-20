const distance = (a, b) => Math.hypot(...a.map((value, axis) => b[axis] - value));
const node = (p, options = {}) => ({ p, ...options });

export function compilePath(nodes, speed = 1.75) {
  let duration = 0;
  const segments = [];
  nodes.slice(0, -1).forEach((from, index) => {
    const to = nodes[index + 1];
    if (from.wait) {
      segments.push({ from: from.p, to: from.p, start: duration, duration: from.wait, mode: 'wait' });
      duration += from.wait;
    }
    const length = distance(from.p, to.p);
    if (length < .0001) return;
    const segmentDuration = length / (from.speed ?? speed);
    segments.push({ from: from.p, to: to.p, start: duration, duration: segmentDuration, mode: from.mode ?? 'walk', steps: from.steps });
    duration += segmentDuration;
  });
  return { nodes, segments, duration };
}

export function samplePath(path, seconds) {
  const time = Math.max(0, Math.min(path.duration, seconds));
  const segment = path.segments.find(item => time <= item.start + item.duration) ?? path.segments.at(-1);
  const fraction = Math.max(0, Math.min(1, (time - segment.start) / segment.duration));
  const p = segment.from.map((value, axis) => value + (segment.to[axis] - value) * fraction);
  if (segment.steps) {
    const dy = segment.to[1] - segment.from[1];
    const step = dy < 0 ? Math.ceil(fraction * segment.steps) : Math.floor(fraction * segment.steps);
    p[1] = segment.from[1] + dy * step / segment.steps;
  }
  return { p, dx: segment.to[0] - segment.from[0], dz: segment.to[2] - segment.from[2], moving: segment.mode !== 'wait', mode: segment.mode };
}

export function getStationPaths(l) {
  const feet = .018;
  const upperDoor = [l.upperX + 1.61, l.upperY + feet, -1.59];
  // Choose a car door beyond the foot of the stairs: boarding never cuts
  // through the staircase or underneath its low end.
  const lowerDoorZ = [5.83, 2.61, -.61, -3.83].find(z => z < l.lowerStairBottomZ - .25);
  const lowerDoor = [l.lowerX - 1.59, l.lowerY + feet, lowerDoorZ];
  const lowerLanding = [l.lowerX - .28, l.lowerY + feet, lowerDoorZ];
  const reverseLanding = [l.lowerX + .28, l.lowerY + feet, lowerDoorZ];
  const upperLanding = [l.escalatorX, l.upperY + feet, .4];
  const transferNodes = [
    node(upperDoor, { mode: 'boarding' }),
    node([upperDoor[0], l.upperY + feet, -.55]),
    node(upperLanding),
    node([l.escalatorX, l.upperY + feet, l.upperDescent.topZ], { mode: 'escalator', speed: 1.35 }),
    node([l.escalatorX, l.tunnelY + feet, l.tunnelNearZ]),
    node([l.escalatorX, l.tunnelY + feet, l.tunnelZ]),
  ];
  if (l.hasWalkway) transferNodes.push(
    node([l.walkwayStartX - .3, l.tunnelY + feet, l.tunnelZ]),
    node([l.walkwayStartX, l.tunnelY + .078, l.tunnelZ], { mode: 'walkway', speed: 2.8 }),
    node([l.walkwayEndX, l.tunnelY + .078, l.tunnelZ]),
    node([l.walkwayEndX + .3, l.tunnelY + feet, l.tunnelZ]),
  );
  transferNodes.push(
    node([l.lowerX - .28, l.tunnelY + feet, l.tunnelZ]),
    node([l.lowerX - .28, l.tunnelY + feet, l.tunnelNearZ], { mode: 'stairs', speed: 1.55, steps: l.stairTreads }),
    node([l.lowerX - .28, l.lowerY + feet, l.lowerStairBottomZ]),
    node(lowerLanding),
    node([l.lowerX - .8, l.lowerY + feet, lowerDoorZ], { wait: .8, mode: 'boarding' }),
    node(lowerDoor),
  );

  const laneZ = l.entranceZ + .36;
  const exitLaneZ = l.entranceZ - .36;
  const entryNodes = [
    node([l.entranceTopX - 1.2, l.streetY + feet, laneZ]),
    node([l.entranceTopX, l.streetY + feet, laneZ], { mode: 'stairs', speed: 1.6, steps: 26 }),
    node([l.entranceBottomX, l.upperY + feet, laneZ]),
    node([l.entranceBottomX + 1.3, l.upperY + feet, laneZ]),
    node([upperDoor[0], l.upperY + feet, laneZ], { wait: 1.3 }),
    node([upperDoor[0], l.upperY + feet, -.6], { mode: 'boarding' }),
    node(upperDoor, { mode: 'boarding' }),
  ];
  const exitNodes = [
    node(upperDoor, { mode: 'boarding' }),
    node([upperDoor[0], l.upperY + feet, -.6]),
    node([upperDoor[0], l.upperY + feet, exitLaneZ]),
    node([l.entranceBottomX + 1.3, l.upperY + feet, exitLaneZ]),
    node([l.entranceBottomX, l.upperY + feet, exitLaneZ], { mode: 'stairs', speed: 1.6, steps: 26 }),
    node([l.entranceTopX, l.streetY + feet, exitLaneZ]),
    node([l.entranceTopX - 1.4, l.streetY + feet, exitLaneZ]),
  ];
  const reverseNodes = [
    node(lowerDoor, { mode: 'boarding' }), node(reverseLanding),
    node([l.lowerX + .28, l.lowerY + feet, l.lowerStairBottomZ], { mode: 'stairs', speed: 1.55, steps: l.stairTreads }),
    node([l.lowerX + .28, l.tunnelY + feet, l.tunnelNearZ]),
    node([l.lowerX + .28, l.tunnelY + feet, l.tunnelZ + 1]),
    node([l.stairX, l.tunnelY + feet, l.tunnelZ + 1]),
    node([l.stairX, l.tunnelY + feet, l.tunnelNearZ], { mode: 'stairs', speed: 1.55, steps: Math.ceil(l.escalatorRun / .24) }),
    node([l.stairX, l.upperY + feet, l.upperDescent.topZ]),
    node([l.stairX, l.upperY + feet, .4]),
    node([l.upperX + 2.4, l.upperY + feet, -.45]),
  ];
  return {
    transfer: compilePath(transferNodes), entry: compilePath(entryNodes),
    exit: compilePath(exitNodes), reverse: compilePath(reverseNodes), lowerDoorZ,
  };
}
