import { Vector3, Vector4 } from 'three';

// Small baked irradiance volumes keep the underground warm without evaluating
// three area lights on every fragment of every building, person and carriage.
export function createStationLight() {
  return {
    stationLightBounds: { value: [new Vector4(), new Vector4(), new Vector4()] },
    stationLightHeights: { value: new Vector3() },
    stationLightNight: { value: 0 },
  };
}
export function updateStationLight(uniforms, l, night) {
  const bounds = uniforms.stationLightBounds.value;
  bounds[0].set(l.upperX - 7.5, -3.6, l.upperX + 7.5, 1.38);
  bounds[1].set(l.tunnelStartX, l.tunnelNearZ, l.tunnelEndX, l.tunnelFarZ + .1);
  bounds[2].set(l.lowerX - 3.6, l.lowerZ - 7.5, l.lowerX + 1.38, l.lowerZ + 7.5);
  uniforms.stationLightHeights.value.set(l.upperY - .08, l.tunnelY - .08, l.lowerY - .08);
  uniforms.stationLightNight.value = night ? 1 : .15;
}
export function injectStationLight(shader, uniforms) {
  Object.assign(shader.uniforms, uniforms);
  shader.vertexShader = `varying vec3 stationWorldPosition;\n${shader.vertexShader}`.replace('#include <project_vertex>', `
    #include <project_vertex>
    vec4 stationPosition = vec4(transformed, 1.0);
    #ifdef USE_INSTANCING
      stationPosition = instanceMatrix * stationPosition;
    #endif
    stationWorldPosition = (modelMatrix * stationPosition).xyz;`);
  shader.fragmentShader = `varying vec3 stationWorldPosition;
    uniform vec4 stationLightBounds[3];
    uniform vec3 stationLightHeights;
    uniform float stationLightNight;\n${shader.fragmentShader}`.replace('#include <opaque_fragment>', `
    float stationWarmth = 0.0;
    for (int i = 0; i < 3; i++) {
      vec4 b = stationLightBounds[i];
      vec2 edge = min(stationWorldPosition.xz - b.xy, b.zw - stationWorldPosition.xz);
      float height = stationWorldPosition.y - stationLightHeights[i];
      stationWarmth += smoothstep(0.0, 0.4, min(edge.x, edge.y))
        * smoothstep(-0.4, 0.05, height) * (1.0 - smoothstep(0.4, 2.6, height));
    }
    float upward = max(0.0, inverseTransformDirection(normal, viewMatrix).y);
    outgoingLight += diffuseColor.rgb * vec3(1.0, 0.69, 0.35)
      * min(1.0, stationWarmth) * stationLightNight * (0.45 + 0.55 * upward);
    #include <opaque_fragment>`);
}
