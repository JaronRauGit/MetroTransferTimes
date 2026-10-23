import { useLayoutEffect, useRef } from 'react';
import { batchStaticMeshes } from './staticBatch.js';

export default function StaticBatch({ children, revision, enabled = true, allowTransparent = false }) {
  const source = useRef(), output = useRef(), previous = useRef(null), materials = useRef(new Map());
  useLayoutEffect(() => {
    previous.current?.restore();
    previous.current?.disposeGeometry();
    output.current.clear();
    if (!enabled) { previous.current = null; return; }
    const batch = batchStaticMeshes(source.current, materials.current, allowTransparent);
    for (const [key, material] of materials.current) if (!batch.materials.has(key)) material.dispose();
    materials.current = batch.materials;
    previous.current = batch;
    output.current.add(batch.group);
    source.current.parent.userData.batching = { sources: batch.sourceCount, draws: batch.group.children.length };
  }, [revision, enabled, allowTransparent]);
  useLayoutEffect(() => () => {
    previous.current?.restore(); previous.current?.disposeGeometry();
    materials.current.forEach(material => material.dispose()); materials.current.clear();
  }, []);
  return <group><group ref={source}>{children}</group><group ref={output} /></group>;
}
