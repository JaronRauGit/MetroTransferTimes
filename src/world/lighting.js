// Lighting and surface response are independent of station dimensions and inputs.
export const lightingProfiles = {
  light: {
    ambient: .16, sky: 1.15, sun: 3.8, exposure: 1.08,
    environment: .28, station: 1.1, bloom: .035,
    skyTop: '#a9c8e7', horizon: '#f4e8d1', skyGround: '#9a9987',
  },
  dark: {
    ambient: .09, sky: .72, sun: .8, exposure: 1.08,
    environment: .2, station: 3.4, bloom: .16,
    skyTop: '#243c65', horizon: '#62718a', skyGround: '#252d39',
  },
};

export const surfaceResponse = {
  stone: { roughness: .93, metalness: 0 },
  asphalt: { roughness: .98, metalness: 0 },
  glass: { roughness: .4, metalness: .05, envMapIntensity: .6 },
  rail: { roughness: .38, metalness: .64, envMapIntensity: .65 },
};

export function lightingQuality(compact) {
  return {
    sunShadowSize: compact ? 1024 : 2048,
    contactResolution: compact ? 256 : 512,
    aoQuality: compact ? 'performance' : 'medium',
    aoHalfResolution: compact,
    aoRadius: compact ? .28 : .38,
    aoIntensity: compact ? .45 : .6,
    bloomResolution: compact ? 128 : 256,
    windowSpills: compact ? 1 : 2,
    bicycleSpills: !compact,
  };
}
