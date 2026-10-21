import { useEffect, useLayoutEffect, useState } from 'react';

export function useCompactDisplay() {
  const query = '(max-width: 900px), (pointer: coarse)';
  const [compact, setCompact] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setCompact(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return compact;
}

// Mobile keyboards can resize the visual viewport without changing 100dvh.
// Follow that usable height, while allowing ordinary browser pinch zoom.
export function useViewportHeight() {
  useLayoutEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    let frame;
    const update = () => {
      if (Math.abs(viewport.scale - 1) > .01) return;
      document.documentElement.style.setProperty('--app-height', `${viewport.height}px`);
      const input = document.activeElement;
      if (input?.matches('.calculator-dock input')) input.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    update();
    viewport.addEventListener('resize', schedule);
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener('resize', schedule);
      window.removeEventListener('resize', schedule);
      document.documentElement.style.removeProperty('--app-height');
    };
  }, []);
}
