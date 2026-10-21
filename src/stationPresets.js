// Transcribed unchanged from the original Second branch, commit 1a75db5.
// Distances are metres; escalators are counted using the adjacent stairs.
// Preserve direction-specific values, including the original asymmetries.
export const measurementSource = 'https://github.com/JaronRauGit/MetroTransferTimes/blob/1a75db52d1b2f31559a02e5b83fea19b97acd9e3/index.html#L148';

export const platformOptions = [
  { id: 'l3_trinitat', line: 'L3', direction: 'Trinitat Nova' },
  { id: 'l3_zona', line: 'L3', direction: 'Zona Universitària' },
  { id: 'l5_cornelia', line: 'L5', direction: 'Cornellà Centre' },
  { id: 'l5_hebron', line: 'L5', direction: "Vall d'Hebron" },
];

export const stationPresets = [
  { id: 'sants', name: 'Sants Estació' },
  { id: 'diagonal', name: 'Diagonal' },
];

export const walkingDistances = {
    diagonal: {
        l3_trinitat: { l3_trinitat: 0, l3_zona: 157.89005, l5_cornelia: 190.0563, l5_hebron: 190.0263 },
        l3_zona: { l3_trinitat: 157.89005, l3_zona: 0, l5_cornelia: 173.55875, l5_hebron: 173.52875 },
        l5_cornelia: { l3_trinitat: 190.0563, l3_zona: 173.55875, l5_cornelia: 0, l5_hebron: 106.66 },
        l5_hebron: { l3_trinitat: 190.0263, l3_zona: 173.52875, l5_cornelia: 106.66, l5_hebron: 0 }
    },
    sants: {
        l3_trinitat: { l3_trinitat: 0, l3_zona: 123, l5_cornelia: 237.19, l5_hebron: 251.79 },
        l3_zona: { l3_trinitat: 123, l3_zona: 0, l5_cornelia: 248.67, l5_hebron: 263.27 },
        l5_cornelia: { l3_trinitat: 237.19, l3_zona: 248.67, l5_cornelia: 0, l5_hebron: 116.58 },
        l5_hebron: { l3_trinitat: 251.79, l3_zona: 263.27, l5_cornelia: 116.58, l5_hebron: 0 }
    }
};

export const escalatorSteps = {
    diagonal: {
        l3_trinitat: { l3_trinitat: 0, l3_zona: 47, l5_cornelia: 58, l5_hebron: 46 },
        l3_zona: { l3_trinitat: 47, l3_zona: 0, l5_cornelia: 59, l5_hebron: 47 },
        l5_cornelia: { l3_trinitat: 58, l3_zona: 59, l5_cornelia: 0, l5_hebron: 70 },
        l5_hebron: { l3_trinitat: 58, l3_zona: 59, l5_cornelia: 70, l5_hebron: 0 }
    },
    sants: {
        l3_trinitat: { l3_trinitat: 0, l3_zona: 68, l5_cornelia: 34, l5_hebron: 88 },
        l3_zona: { l3_trinitat: 68, l3_zona: 0, l5_cornelia: 34, l5_hebron: 88 },
        l5_cornelia: { l3_trinitat: 34, l3_zona: 34, l5_cornelia: 0, l5_hebron: 54 },
        l5_hebron: { l3_trinitat: 88, l3_zona: 88, l5_cornelia: 54, l5_hebron: 0 }
    }
};

export const walkwayLengths = {
    diagonal: {
        l3_trinitat: { l3_trinitat: 0, l3_zona: 0, l5_cornelia: 71.28, l5_hebron: 71.28 },
        l3_zona: { l3_trinitat: 0, l3_zona: 0, l5_cornelia: 71.28, l5_hebron: 71.28 },
        l5_cornelia: { l3_trinitat: 71.28, l3_zona: 71.28, l5_cornelia: 0, l5_hebron: 0 },
        l5_hebron: { l3_trinitat: 71.28, l3_zona: 71.28, l5_cornelia: 0, l5_hebron: 0 }
    },
    sants: {
        l3_trinitat: { l3_trinitat: 0, l3_zona: 0, l5_cornelia: 0, l5_hebron: 0 },
        l3_zona: { l3_trinitat: 0, l3_zona: 0, l5_cornelia: 0, l5_hebron: 0 },
        l5_cornelia: { l3_trinitat: 0, l3_zona: 0, l5_cornelia: 0, l5_hebron: 0 },
        l5_hebron: { l3_trinitat: 0, l3_zona: 0, l5_cornelia: 0, l5_hebron: 0 }
    }
};

export function getStationPreset(id, fromPlatform = 'l3_trinitat', toPlatform = 'l5_cornelia') {
  const station = stationPresets.find(item => item.id === id);
  const from = platformOptions.find(item => item.id === fromPlatform);
  const to = platformOptions.find(item => item.id === toPlatform);
  if (!station || !from || !to) throw new RangeError('Unknown station or platform');
  return {
    id,
    station: { name: station.name, fromLine: from.line, toLine: to.line, presetId: id, fromPlatform, toPlatform },
    values: {
      walkDistance: String(walkingDistances[id][fromPlatform][toPlatform]),
      escalatorDistance: String(escalatorSteps[id][fromPlatform][toPlatform]),
      numSteps: '0',
      walkwayLength: String(walkwayLengths[id][fromPlatform][toPlatform]),
    },
  };
}

export const defaultStationPreset = getStationPreset('diagonal');
