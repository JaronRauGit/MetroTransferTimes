import { BufferAttribute, Group, Matrix4, Mesh } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

function materialKey(mesh, allowTransparent) {
  const m = mesh.material;
  return JSON.stringify([m.type, m.roughness, m.metalness, m.emissive.getHex(), m.emissiveIntensity,
    m.envMapIntensity, m.side, m.flatShading, m.toneMapped, allowTransparent || m.transparent, mesh.castShadow, mesh.receiveShadow,
    m.customProgramCacheKey().replace(/-miniature-monochrome$/, '')]);
}

// Bake transforms and colours, never station dimensions. Animated subtrees,
// transparent surfaces, textures and existing instances stay independent.
export function batchStaticMeshes(root, cache = new Map(), allowTransparent = false) {
  root.updateWorldMatrix(true, true);
  const inverse = root.matrixWorld.clone().invert(), transform = new Matrix4(), buckets = new Map();
  function collect(object) {
    if (object.userData.dynamic || !object.visible) return;
    const m = object.material;
    if (object.isMesh && !object.isInstancedMesh && m?.isMeshStandardMaterial && (!m.transparent || allowTransparent) && !m.map && !m.normalMap && !m.aoMap && !m.alphaMap) {
      const key = materialKey(object, allowTransparent);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(object);
    }
    object.children.forEach(collect);
  }
  collect(root);
  const group = new Group(), originals = [], nextCache = new Map();
  group.name = 'static-batches';
  for (const [key, meshes] of buckets) {
    if (meshes.length < 2) continue;
    const parts = meshes.map(mesh => {
      const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      transform.multiplyMatrices(inverse, mesh.matrixWorld);
      geometry.applyMatrix4(transform);
      // A mirrored source normally reverses WebGL's front face per draw. Once
      // merged, reverse its triangle winding so the same faces remain visible.
      if (transform.determinant() < 0) {
        for (const attribute of Object.values(geometry.attributes)) {
          const { array, itemSize, count } = attribute;
          for (let vertex = 0; vertex < count; vertex += 3) for (let component = 0; component < itemSize; component++) {
            const a = (vertex + 1) * itemSize + component, b = (vertex + 2) * itemSize + component;
            [array[a], array[b]] = [array[b], array[a]];
          }
        }
      }
      if (!geometry.attributes.normal) geometry.computeVertexNormals();
      const count = geometry.attributes.position.count, colours = new Float32Array(count * 3);
      const old = geometry.attributes.color, colour = mesh.material.color;
      for (let i = 0; i < count; i++) {
        colours[i * 3] = colour.r * (old ? old.getX(i) : 1);
        colours[i * 3 + 1] = colour.g * (old ? old.getY(i) : 1);
        colours[i * 3 + 2] = colour.b * (old ? old.getZ(i) : 1);
      }
      for (const name of Object.keys(geometry.attributes)) if (name !== 'position' && name !== 'normal') geometry.deleteAttribute(name);
      geometry.setAttribute('color', new BufferAttribute(colours, 3));
      geometry.clearGroups();
      return geometry;
    });
    const geometry = mergeGeometries(parts, false);
    parts.forEach(part => part.dispose());
    let material = cache.get(key);
    if (!material) {
      const source = meshes[0].material;
      material = source.clone();
      material.onBeforeCompile = source.onBeforeCompile;
      material.customProgramCacheKey = source.customProgramCacheKey;
      material.color.setHex(0xffffff);
      material.vertexColors = true;
      if (allowTransparent) { material.transparent = true; material.opacity = 1; material.userData.trainBaseOpacity = 1; }
    }
    nextCache.set(key, material);
    const mesh = new Mesh(geometry, material);
    mesh.castShadow = meshes[0].castShadow;
    mesh.receiveShadow = meshes[0].receiveShadow;
    group.add(mesh);
    for (const original of meshes) { originals.push(original); original.visible = false; }
  }
  return {
    group, materials: nextCache, sourceCount: originals.length,
    restore() { originals.forEach(mesh => { mesh.visible = true; }); },
    disposeGeometry() { group.children.forEach(mesh => mesh.geometry.dispose()); },
  };
}
