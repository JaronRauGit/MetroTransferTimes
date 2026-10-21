import { useEffect, useLayoutEffect, useState } from 'react';
import { themeAtTime, worldPalettes } from './appearance.js';

export default function useAppearance() {
  const [localTheme, setLocalTheme] = useState(themeAtTime);
  const [override, setOverride] = useState(null);
  const theme = override ?? localTheme;
  useEffect(() => {
    const update = () => setLocalTheme(themeAtTime());
    const timer = window.setInterval(update, 60_000);
    document.addEventListener('visibilitychange', update);
    update();
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', update); };
  }, []);
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', worldPalettes[theme].background);
  }, [theme]);
  return { theme, automatic: override === null, toggle: () => setOverride(theme === 'dark' ? 'light' : 'dark'), useAutomatic: () => { setLocalTheme(themeAtTime()); setOverride(null); } };
}
