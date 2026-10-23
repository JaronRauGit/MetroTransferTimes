export default function ThemeControl({ appearance }) {
  const dark = appearance.theme === 'dark';
  return <div className="theme-control" role="group" aria-label="Appearance">
    <button type="button" aria-pressed={!dark} onClick={() => appearance.select('light')}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></svg>Afternoon
    </button>
    <button type="button" aria-pressed={dark} onClick={() => appearance.select('dark')}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 14A8.8 8.8 0 0 1 10 3.2 9 9 0 1 0 20.8 14Z" /></svg>Night
    </button>
    <button className="theme-auto" type="button" aria-label="Follow local time" aria-pressed={appearance.automatic} title="Follow your local time: night from 19:00 to 07:00" onClick={appearance.useAutomatic}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11a9 9 0 1 1 2 7M3 4v7h7" /><path d="M12 7v5l3 2" /></svg></button>
  </div>;
}
