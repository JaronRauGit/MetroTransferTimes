import { forwardRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

export const colors = {
  sand: '#dec4a2',
  limestone: '#f0dfc5',
  cream: '#f8edd7',
  stone: '#cdb598',
  stoneSide: '#ad9279',
  terracotta: '#ca7659',
  terracottaDark: '#a85e48',
  coral: '#d45f50',
  olive: '#80946b',
  deepOlive: '#526f58',
  mint: '#91b6a5',
  teal: '#5b9b9a',
  tealDark: '#315e66',
  glass: '#6aafb4',
  metal: '#677c7b',
  rail: '#474f50',
  ink: '#334f50',
  warmWhite: '#fff5dc',
};

export const Block = forwardRef(function Block({ position, size, color = colors.limestone, rotation, roughness = 0.93, metalness = 0, castShadow = true, receiveShadow = true, transparent = false, opacity = 1, ...props }, ref) {
  return <mesh ref={ref} position={position} rotation={rotation} castShadow={castShadow} receiveShadow={receiveShadow} {...props}>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} transparent={transparent} opacity={opacity} />
  </mesh>;
});

export function Rod({ from, to, radius = 0.035, color = colors.metal, segments = 6 }) {
  const start = useMemo(() => new THREE.Vector3(...from), [from.join(',')]);
  const end = useMemo(() => new THREE.Vector3(...to), [to.join(',')]);
  const direction = useMemo(() => end.clone().sub(start), [start, end]);
  const midpoint = useMemo(() => start.clone().add(end).multiplyScalar(.5), [start, end]);
  const quaternion = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()), [direction]);
  return <mesh position={midpoint} quaternion={quaternion} castShadow>
    <cylinderGeometry args={[radius, radius, direction.length(), segments]} />
    <meshStandardMaterial color={color} roughness={0.75} metalness={0.1} />
  </mesh>;
}

function makeSignTexture(text, background, foreground, width, height, subtext) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = Math.round(1024 * height / width);
  const context = canvas.getContext('2d');
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = foreground;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  const mainSize = subtext ? canvas.height * .45 : canvas.height * .6;
  context.font = `800 ${Math.round(mainSize)}px Arial, sans-serif`;
  context.fillText(text, canvas.width / 2, subtext ? canvas.height * .42 : canvas.height * .51, canvas.width * .9);
  if (subtext) {
    context.font = `700 ${Math.round(canvas.height * .2)}px Arial, sans-serif`;
    context.fillText(subtext, canvas.width / 2, canvas.height * .8, canvas.width * .9);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function Sign({ position, size = [1.5, .45], text, subtext, background = colors.cream, foreground = colors.tealDark, rotation, frame = colors.stoneSide }) {
  const texture = useMemo(() => makeSignTexture(text, background, foreground, size[0], size[1], subtext), [text, subtext, background, foreground, size[0], size[1]]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group position={position} rotation={rotation}>
    <Block size={[size[0] + .09, size[1] + .09, .09]} color={frame} />
    <mesh position={[0, 0, .051]}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  </group>;
}

export function FloorSlab({ position, size, color = colors.sand, sideColor = colors.stoneSide }) {
  const [width, depth, thickness] = size;
  return <group position={position}>
    <Block position={[0, -thickness / 2, 0]} size={[width, thickness, depth]} color={sideColor} />
    <Block position={[0, .015, 0]} size={[width, .055, depth]} color={color} castShadow={false} />
  </group>;
}
