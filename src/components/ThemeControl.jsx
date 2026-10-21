export default function ThemeControl({ appearance }) {
  const dark = appearance.theme === 'dark';
  return <div className="theme-control" role="group" aria-label="Appearance">
    <button className="theme-toggle" type="button" aria-label="Night mode" aria-pressed={dark} title={`Switch to ${dark ? 'day' : 'night'} mode`} onClick={appearance.toggle}>
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{dark ? <path d="M20.8 14A8.8 8.8 0 0 1 10 3.2 9 9 0 1 0 20.8 14Z" /> : <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>}</svg>
    </button>
    <button className="theme-auto" type="button" aria-pressed={appearance.automatic} title="Follow your local time: night from 19:00 to 07:00" onClick={appearance.useAutomatic}>Auto</button>
  </div>;
}
