import { useCallback, useMemo } from 'react';
import { useWorldNight } from './WorldAppearance.jsx';

const leafCacheKey = () => 'miniature-leaf-transmission-v1';

export default function FoliageMaterial({ color, side = 0 }) {
  const night = useWorldNight();
  const transmission = useMemo(() => ({ value: 0 }), []);
  transmission.value = night ? 0 : .045;
  const compile = useCallback(shader => {
    shader.uniforms.leafTransmission = transmission;
    shader.fragmentShader = `uniform float leafTransmission;\n${shader.fragmentShader}`.replace('#include <opaque_fragment>', `
      #if NUM_DIR_LIGHTS > 0
        float backlight = pow(max(dot(-normal, directionalLights[0].direction), 0.0), 2.0);
        outgoingLight += diffuseColor.rgb * directionalLights[0].color * backlight * leafTransmission;
      #endif
      #include <opaque_fragment>`);
  }, [transmission]);
  return <meshStandardMaterial color={color} roughness={.96} flatShading side={side}
    customProgramCacheKey={leafCacheKey} onBeforeCompile={compile} />;
}
