// Use the visitor's local clock; no location or network lookup is needed.
export function themeAtTime(date = new Date()) {
  const hour = date.getHours();
  return hour < 7 || hour >= 19 ? 'dark' : 'light';
}

export const worldPalettes = {
  light: { background: '#dce9e3', monochrome: '#e2e4e1', ground: '#d1ddce', sky: '#c4dcf3', bounce: '#a49c86', sunlight: '#ffe1b0' },
  dark: { background: '#101e2a', monochrome: '#24323d', ground: '#202d39', sky: '#91a9d1', bounce: '#354254', sunlight: '#bdd6ff' },
};
