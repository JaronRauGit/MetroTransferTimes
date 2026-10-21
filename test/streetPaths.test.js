import test from 'node:test';
import assert from 'node:assert/strict';
import { getStationLayout } from '../src/world/stationLayout.js';
import { getStreetWalkingPath, getStreetVehiclePath, sampleStreetTrip } from '../src/world/streetPaths.js';

test('street pedestrians walk across the neighbourhood without stepping into the metro opening', () => {
  for (const walkDistance of ['0', '200', '1000000000']) {
    const layout = getStationLayout({ walkDistance });
    for (const reverse of [true, false]) for (const lane of [0, 1]) {
      const path = getStreetWalkingPath(layout, { reverse, lane });
      for (let t = 0; t <= path.duration; t += .1) {
        const { p } = sampleStreetTrip(path, t, 0, 3);
        assert.ok(p.every(Number.isFinite));
        assert.ok(p[0] > layout.streetMinX && p[0] < layout.streetMaxX);
        const aboveOpening = p[0] + .23 > layout.entranceTopX - .08 && p[0] - .23 < layout.entranceBottomX + .23 && p[2] + .23 > -.87 && p[2] - .23 < 1.4;
        assert.equal(aboveOpening, false);
      }
      assert.ok(Math.abs(path.nodes.at(-1).p[0] - path.nodes[0].p[0]) > 20);
    }
  }
});

test('bicycles have separate directions clear of the occasional car lane', () => {
  const layout = getStationLayout();
  const forward = getStreetVehiclePath(layout, { bicycle: true });
  const reverse = getStreetVehiclePath(layout, { bicycle: true, reverse: true });
  const car = getStreetVehiclePath(layout, { bicycle: false });
  assert.ok(forward.nodes[0].p[0] < forward.nodes.at(-1).p[0]);
  assert.ok(reverse.nodes[0].p[0] > reverse.nodes.at(-1).p[0]);
  assert.ok(Math.abs(forward.nodes[0].p[2] - reverse.nodes[0].p[2]) > .406);
  assert.ok(car.nodes[0].p[2] - .3075 > forward.nodes[0].p[2] + .203);
  assert.equal(sampleStreetTrip(car, car.duration + 5, 0, 55).visible, false);
  assert.equal(sampleStreetTrip(car, car.duration + 5, 0, 55).opacity, 0);
});
