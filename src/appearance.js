// Use the visitor's local clock; no location or network lookup is needed.
export function themeAtTime(date = new Date()) {
  const hour = date.getHours();
  return hour < 7 || hour >= 19 ? 'dark' : 'light';
}

export const worldPalettes = {
  light: { background: '#dce9e3', monochrome: '#e2e4e1', ground: '#d8e4d9', sky: '#fff3df', bounce: '#91a49b', sunlight: '#fff3dc' },
  dark: { background: '#101e2a', monochrome: '#24323d', ground: '#1b3039', sky: '#a5b7dd', bounce: '#324a54', sunlight: '#abc8ed' },
};
