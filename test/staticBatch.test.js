import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, BoxGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { batchStaticMeshes } from '../src/world/staticBatch.js';

function box(colour, x) {
  const mesh = new Mesh(new BoxGeometry(1, 2, 3), new MeshStandardMaterial({ color: colour, roughness: .9 }));
  mesh.position.x = x;
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}
test('static batching preserves transformed geometry, normals, colours and moving objects', () => {
  const root = new Group(), parent = new Group();
  root.position.set(5, -3, 2); root.rotation.y = .6; parent.rotation.z = .25; parent.scale.set(1, 2, .8);
  const first = box('#d29067', -2), second = box('#689886', 2), moving = box('#fff0d0', 0);
  moving.userData.dynamic = true;
  parent.add(first, second, moving); root.add(parent);
  root.updateWorldMatrix(true, true);
  const expected = new Box3().setFromObject(first).union(new Box3().setFromObject(second));
  const colour = first.material.color.clone();
  const batch = batchStaticMeshes(root);
  root.add(batch.group); root.updateWorldMatrix(true, true);
  assert.equal(batch.sourceCount, 2); assert.equal(batch.group.children.length, 1);
  assert.equal(moving.visible, true); assert.equal(first.visible, false);
  const bounds = new Box3().setFromObject(batch.group);
  assert.ok(bounds.min.distanceTo(expected.min) < 1e-6 && bounds.max.distanceTo(expected.max) < 1e-6);
  const geometry = batch.group.children[0].geometry;
  assert.equal(geometry.attributes.position.count, 72);
  assert.equal(geometry.attributes.normal.count, 72);
  const colours = geometry.attributes.color;
  assert.ok(new Vector3(colours.getX(0), colours.getY(0), colours.getZ(0)).distanceTo(new Vector3(colour.r, colour.g, colour.b)) < 1e-6);
  batch.restore(); assert.equal(first.visible, true); batch.disposeGeometry();
  const next = batchStaticMeshes(root, batch.materials);
  assert.equal(next.group.children[0].material, batch.group.children[0].material, 'mood updates must retain existing GPU material programs');
  next.restore(); next.disposeGeometry(); next.materials.forEach(material => material.dispose());
});

test('train batches retain uniform fade and leave articulated doors independent', () => {
  const root = new Group(), door = new Group(); door.userData.dynamic = true;
  const body = box('#eeeecc', -1), roof = box('#aaccbb', 1);
  for (const mesh of [body, roof]) { mesh.material.transparent = true; mesh.material.opacity = .3; }
  door.add(box('#ff7777', 0)); root.add(body, roof, door);
  const batch = batchStaticMeshes(root, new Map(), true);
  assert.equal(batch.sourceCount, 2); assert.equal(door.children[0].visible, true);
  assert.equal(batch.group.children[0].material.transparent, true);
  assert.equal(batch.group.children[0].material.userData.trainBaseOpacity, 1);
  batch.restore(); batch.disposeGeometry(); batch.materials.forEach(material => material.dispose());
});

test('mirrored meshes retain their outward-facing triangles after merging', () => {
  const root = new Group(), mirrored = box('#d29067', -2);
  mirrored.scale.x = -1;
  root.add(mirrored, box('#689886', 2));
  const batch = batchStaticMeshes(root);
  const { position, normal } = batch.group.children[0].geometry.attributes;
  for (let i = 0; i < position.count; i += 3) {
    const a = new Vector3().fromBufferAttribute(position, i), b = new Vector3().fromBufferAttribute(position, i + 1), c = new Vector3().fromBufferAttribute(position, i + 2);
    assert.ok(b.sub(a).cross(c.sub(a)).dot(new Vector3().fromBufferAttribute(normal, i)) > 0);
  }
  batch.restore(); batch.disposeGeometry(); batch.materials.forEach(material => material.dispose());
});
