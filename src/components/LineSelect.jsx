import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { lineColor, lineOptions } from '../world/lineCatalog.js';

export function LineBadge({ line }) {
  const darkText = ['L3', 'L4', 'L9', 'L10', 'L11'].includes(line);
  return <span className="line-badge" style={{ backgroundColor: lineColor(line), color: darkText ? '#183c37' : '#fff9ed' }}>{line}</span>;
}

export default function LineSelect({ id, label, value, onChange, inline = false }) {
  const anchor = useRef();
  const popup = useRef();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(lineOptions.indexOf(value));
  const [position, setPosition] = useState({ left: 0, top: 0, maxHeight: 230 });
  const menuId = `${id}-options`;

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = anchor.current.getBoundingClientRect();
      const width = Math.min(264, window.innerWidth - 20);
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const upwards = below < 204 && above > below;
      const height = Math.min(204, upwards ? above : below);
      setPosition({ left: Math.min(window.innerWidth - width - 10, Math.max(10, rect.left)), top: upwards ? rect.top - height - 7 : rect.bottom + 7, width, maxHeight: height });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const dismiss = event => {
      if (!anchor.current?.contains(event.target) && !popup.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  function choose(line) {
    onChange(line);
    setOpen(false);
    anchor.current.focus();
  }

  function handleKey(event) {
    const movement = { ArrowDown: 1, ArrowUp: -1, ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (movement) {
      event.preventDefault();
      if (!open) { setActive(lineOptions.indexOf(value)); setOpen(true); }
      else setActive(index => (index + movement + lineOptions.length) % lineOptions.length);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); setOpen(true); setActive(event.key === 'Home' ? 0 : lineOptions.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(lineOptions[active]);
      else { setActive(lineOptions.indexOf(value)); setOpen(true); }
    } else if (event.key === 'Escape' || event.key === 'Tab') setOpen(false);
  }

  const Wrapper = inline ? 'span' : 'div';
  return <Wrapper className={`line-picker${inline ? ' inline-line-picker' : ''}`}>
    <span className={inline ? 'sr-only' : 'line-picker-label'} id={`${id}-label`}>{label}</span>
    <button ref={anchor} id={id} type="button" className="line-picker-trigger" role="combobox" aria-labelledby={`${id}-label ${id}-value`} aria-haspopup="listbox" aria-expanded={open} aria-controls={menuId} aria-activedescendant={open ? `${id}-${lineOptions[active]}` : undefined} onKeyDown={handleKey} onClick={() => { setActive(lineOptions.indexOf(value)); setOpen(current => !current); }}>
      <span id={`${id}-value`}><LineBadge line={value} /></span>
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
    {open && createPortal(<div ref={popup} id={menuId} className="line-picker-popup" role="listbox" aria-labelledby={`${id}-label`} style={position}>
      {lineOptions.map((line, index) => <div key={line} id={`${id}-${line}`} role="option" aria-selected={line === value} className={`line-picker-option${index === active ? ' is-active' : ''}`} onPointerDown={event => event.preventDefault()} onPointerEnter={() => setActive(index)} onClick={() => choose(line)}>
        <LineBadge line={line} /><span>Line {line.slice(1)}</span><span className="line-option-check" aria-hidden="true">{line === value ? '✓' : ''}</span>
      </div>)}
    </div>, document.body)}
  </Wrapper>;
}
