import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color } from 'three';
import { worldPalettes } from '../appearance.js';
import { useWorldMotion } from './WorldMotion.jsx';

// Desaturate the final lit material, including canvas signs and vertex colours.
// The highlighted trains and traveller live outside this group.
export default function MonochromeWorld({ children, theme = 'light' }) {
  const root = useRef();
  const painted = useRef(new WeakSet());
  const uniform = useMemo(() => ({ value: 0 }), []);
  const motion = useWorldMotion();
  const { scene } = useThree();
  const colour = useMemo(() => new Color(worldPalettes[theme].background), [theme]);
  const grey = useMemo(() => new Color(worldPalettes[theme].monochrome), [theme]);
  useLayoutEffect(() => {
    root.current.traverse(object => {
      if (!object.isMesh || !object.material) return;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (painted.current.has(material)) continue;
        painted.current.add(material);
        const compile = material.onBeforeCompile;
        const cacheKey = material.customProgramCacheKey();
        material.onBeforeCompile = function(shader, renderer) {
          compile.call(this, shader, renderer);
          shader.uniforms.worldDesaturation = uniform;
          shader.fragmentShader = `uniform float worldDesaturation;\n${shader.fragmentShader}`.replace('#include <tonemapping_fragment>', 'gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(dot(gl_FragColor.rgb, vec3(0.2126, 0.7152, 0.0722))), worldDesaturation);\n#include <tonemapping_fragment>');
        };
        material.customProgramCacheKey = () => `${cacheKey}-miniature-monochrome`;
        material.needsUpdate = true;
      }
    });
  });
  useFrame(() => {
    uniform.value = motion.current.snapshot.desaturation;
    if (scene.background?.isColor) scene.background.copy(colour).lerp(grey, uniform.value);
    root.current.userData.desaturation = uniform.value;
  });
  return <group name="ambient-world" ref={root}>{children}</group>;
}
