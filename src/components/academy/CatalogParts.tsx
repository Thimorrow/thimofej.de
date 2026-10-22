'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { progressFor, type DemoMission } from './mission-model';

export function Glyph({ name }: { name: 'search' | 'chevron' | 'check' | 'send' | 'download' | 'target' | 'back' }) {
  const paths = { search: 'M21 21l-4.35-4.35', chevron: 'm6 9 6 6 6-6', check: 'M20 6 9 17l-5-5', send: 'M12 19V5m-7 7 7-7 7 7', download: 'M12 3v12m-5-4 5 5 5-5M5 21h14', target: 'M12 2v3m0 14v3', back: 'm15 18-6-6 6-6' };
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{name === 'search' && <circle cx="11" cy="11" r="7" />}{name === 'target' && <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></>}<path d={paths[name]} /></svg>;
}

// base/components/mission-filter-dropdown.html, single-choice recipe.
export function StatusFilter({ value, onChange }: { value: string; onChange: (value: 'all' | 'started' | 'completed') => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = [{ value: 'all' as const, label: 'Alle Missionen' }, { value: 'started' as const, label: 'In Bearbeitung' }, { value: 'completed' as const, label: 'Abgeschlossen' }];
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  useEffect(() => { if (open) root.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus(); }, [open]);
  return <div ref={root} className="filter-dropdown" data-component="mission-filter-dropdown" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }} onKeyDown={event => {
    if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
    if (open && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const items = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')];
      const index = items.indexOf(document.activeElement as HTMLButtonElement);
      items[event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
    }
  }}><button ref={trigger} type="button" className={`filter-trigger${open ? ' is-open' : ''}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); } }}><span>{options.find(option => option.value === value)?.label}</span><span className={`filter-chevron${open ? ' is-open' : ''}`}><Glyph name="chevron" /></span></button>{open && <div className="filter-panel flip-right" role="menu" aria-label="Missionsstatus"><ul className="filter-list" role="none">{options.map(option => <li key={option.value} role="none"><button type="button" className="filter-item" role="menuitemradio" aria-checked={value === option.value} onClick={() => { onChange(option.value); setOpen(false); trigger.current?.focus(); }}><span className="filter-item-label">{option.label}</span>{value === option.value && <Glyph name="check" />}</button></li>)}</ul></div>}</div>;
}

// base/components/mission-card.html; refine notes implemented in academy-demo.css.
export function MissionCard({ mission, answers, onOpen }: { mission: DemoMission; answers: string[]; onOpen: () => void }) {
  const status = answers.length >= mission.steps.length ? 'completed' : answers.length ? 'active' : 'available';
  return <article className="mission-card" data-component="mission-card" data-status={status}>
    <div className="demo-mission-cover"><Image unoptimized src={mission.cover} alt="" width={480} height={320} /><Image unoptimized className="demo-ai-label" src="/projects/academy/ai-generated.png" alt="KI-generiert" width={1028} height={267} /></div>
    <div className="mission-card-body"><span className="mission-card-status" data-status={status}><Glyph name={status === 'completed' ? 'check' : 'target'} />{status === 'completed' ? 'Abgeschlossen' : status === 'active' ? 'In Bearbeitung' : 'Neu'}</span><h4 className="mission-card-title">{mission.short}</h4><p className="mission-card-description">{mission.description}</p><div className="mission-card-footer"><span className="demo-card-meta">{mission.duration} · {mission.steps.length} Schritte</span>{answers.length > 0 && <div className="mission-card-progress-track" role="progressbar" aria-label="Missionsfortschritt" aria-valuenow={progressFor(mission, answers)} aria-valuemin={0} aria-valuemax={100}><span className="mission-card-progress-fill" style={{ width: `${progressFor(mission, answers)}%` }} /></div>}<button type="button" className="btn btn-secondary" onClick={onOpen}>{status === 'completed' ? 'Ergebnis ansehen' : status === 'active' ? 'Mission fortsetzen' : 'Mission starten'}</button></div></div>
  </article>;
}

// base/components/step-rail.html and step-rail-identity.html.
export function StepRail({ mission, answers }: { mission: DemoMission; answers: string[] }) {
  const count = answers.length;
  return <aside className="step-rail" data-component="step-rail" aria-label="Missionsfortschritt"><nav className="step-rail-nav" aria-label="Missionsschritte"><div className="mission-header"><div className="mission-progress"><div className="mission-progress-row"><span className="progress-heading">Fortschritt</span><span className="progress-label">Phase {Math.min(count + 1, mission.steps.length)} / {mission.steps.length}</span></div><div className="mission-progress-track" role="progressbar" aria-valuenow={progressFor(mission, answers)} aria-valuemin={0} aria-valuemax={100} aria-label="Missionsfortschritt"><span className="mission-progress-fill" style={{ width: `${progressFor(mission, answers)}%` }} /></div></div></div><ol className="step-list">{mission.steps.map((step, index) => {
    const state = index < count ? 'completed' : index === count ? 'current' : 'upcoming';
    return <li key={step.title} className="step-item" data-step-state={state} aria-current={state === 'current' ? 'step' : undefined}><div className="step-content"><span className={`step-marker step-marker--${state}`}>{state === 'completed' ? <Glyph name="check" /> : index + 1}</span><span className="step-label">{step.title}<span className="sr-only">{state === 'completed' ? ' · erledigt' : state === 'current' ? ' · aktuell' : ''}</span></span></div></li>;
  })}</ol></nav><div className="identity-footer"><span className="avatar" aria-hidden="true">DG</span><span className="identity-name">Demo-Gast</span></div></aside>;
}

// base/components/artifact-panel.html; copy sits in the header, not above a section.
export function ArtifactPanel({ mission, answers, onCopy, onDownload }: { mission: DemoMission; answers: string[]; onCopy: () => void; onDownload: () => void }) {
  return <aside className="artifact-panel" data-component="artifact-panel" aria-label="Dein Ergebnis"><header className="artifact-header"><h3 className="artifact-title">{mission.output}</h3><button type="button" className="btn btn-ghost" disabled={!answers.length} onClick={onCopy}>Ergebnis kopieren</button></header><div className="artifact-content"><div className="artifact-scroll"><div className="artifact-sections">{!answers.length && <div className="demo-empty-result"><h4>Dein Ergebnis entsteht hier.</h4><p>Antworte Tomo. Jeder Schritt ergänzt dein Dokument; danach kannst du es kopieren oder herunterladen.</p></div>}{answers.map((answer, index) => <section className="artifact-section-card" data-state="completed" key={`${mission.id}-${index}`}><div className="section-heading-row"><h4 className="section-heading">{mission.steps[index].heading}</h4></div><div className="section-content"><div className="artifact-prose"><p>{answer}</p></div></div></section>)}{mission.steps[answers.length] && answers.length > 0 && <div className="artifact-section-card" data-state="waiting"><div className="section-heading-row"><span className="section-heading">{mission.steps[answers.length].heading}</span></div><div className="section-placeholder"><p>Noch offen · im nächsten Schritt</p></div></div>}</div></div></div><div className="artifact-footer"><div className="artifact-footer-inner"><button type="button" className="download-button" disabled={!answers.length} onClick={onDownload}><span className="download-icon"><Glyph name="download" /></span><span className="download-label"><strong>Ergebnis herunterladen</strong><small>Markdown · .md{!answers.length ? ' · nach deiner ersten Antwort' : ''}</small></span></button></div></div></aside>;
}
