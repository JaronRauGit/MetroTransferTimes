// The gallery stays centred on the solid wall, before the lower track opening.
export const creatorsDimensions = Object.freeze({
  width: 14.8,
  depth: 8.2,
  z: -10.8,
  floorOffset: -4,
  figureScale: 2.1,
  aircraftScale: 2.05,
  aircraftPosition: [-1, 8.6, 1.7],
  aircraftRotation: [.08, Math.PI - .35, -.08],
});

export function getCreatorsLayout(station) {
  const x = (station.streetMinX + station.lowerX - 3.78) / 2;
  const y = station.upperY + creatorsDimensions.floorOffset;
  return { ...creatorsDimensions, x, y };
}

export function creatorsNookBounds(station) {
  const { x, y } = getCreatorsLayout(station);
  return { min: [x - 7.7, y - 1.7, -18.2], max: [x + 7.7, y + 11.2, -6.5] };
}
