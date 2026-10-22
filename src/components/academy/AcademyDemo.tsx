'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { appendAnswer, missions, resultMarkdown, type DemoMission } from './mission-model';
import { ArtifactPanel, Glyph, MissionCard, StatusFilter, StepRail } from './CatalogParts';
import './catalog/catalog.css';
import './academy-demo.css';

type Filter = 'all' | 'started' | 'completed';

function TomoFace() {
  return <Image unoptimized src="/projects/academy/catalog/tomo-face-chat.svg" alt="" width={28} height={28} />;
}

export default function AcademyDemo() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selected, setSelected] = useState<string | null>(null);
  const [runs, setRuns] = useState<Record<string, string[]>>({});
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [mobileView, setMobileView] = useState<'chat' | 'result' | 'steps'>('chat');
  const [tour, setTour] = useState(false);
  const [feedback, setFeedback] = useState('');
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);
  const mission = missions.find(m => m.id === selected);
  const answers = mission ? (runs[mission.id] ?? []) : [];
  const count = answers.length;
  const complete = !!mission && count >= mission.steps.length;
  const step = mission?.steps[count];
  const matching = missions.filter(m => {
    const n = runs[m.id]?.length ?? 0;
    const statusMatch = filter === 'all' || (filter === 'started' ? n > 0 && n < m.steps.length : n >= m.steps.length);
    return statusMatch && `${m.title} ${m.description}`.toLocaleLowerCase('de').includes(search.toLocaleLowerCase('de').trim());
  });

  useEffect(() => {
    if (mounted.current) heading.current?.focus({ preventScroll: true });
    mounted.current = true;
  }, [selected]);

  useEffect(() => {
    if (input.current) { input.current.style.height = 'auto'; input.current.style.height = `${input.current.scrollHeight}px`; }
  }, [draft, selected]);

  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [selected, count]);

  useEffect(() => {
    if (!tour || !mission || complete) return;
    const timer = window.setTimeout(() => {
      if (document.hidden) { setTour(false); return; }
      setRuns(previous => {
        const current = previous[mission.id] ?? [];
        const nextStep = mission.steps[current.length];
        if (!nextStep) return previous;
        return { ...previous, [mission.id]: appendAnswer(mission, current, nextStep.suggestions[0]) };
      });
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 2400);
    return () => window.clearTimeout(timer);
  }, [tour, mission, complete, count]);

  const open = (item: DemoMission) => {
    setSelected(item.id); setDraft(''); setFeedback(''); setMobileView('chat'); setTour(false);
  };
  const back = () => { setSelected(null); setTour(false); setDraft(''); setFeedback(''); };
  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mission || tour) return;
    setRuns(previous => ({ ...previous, [mission.id]: appendAnswer(mission, previous[mission.id] ?? [], draft) }));
    setDraft(''); setFeedback(''); input.current?.focus({ preventScroll: true });
  };
  const reset = () => {
    if (!mission) return;
    setRuns(previous => ({ ...previous, [mission.id]: [] }));
    setDraft(''); setTour(false); setFeedback(''); setMobileView('chat');
  };
  const copy = async () => {
    if (!mission || !count) return;
    try {
      await navigator.clipboard.writeText(resultMarkdown(mission, answers));
      setFeedback('Ergebnis in die Zwischenablage kopiert.');
    } catch {
      setFeedback('Kopieren ist in diesem Browser nicht verfügbar. Du kannst das Ergebnis als Datei herunterladen.');
    }
  };
  const download = () => {
    if (!mission || !count) return;
    const url = URL.createObjectURL(new Blob([resultMarkdown(mission, answers)], { type: 'text/markdown;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `${mission.id}.md`; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setFeedback('Dein Ergebnis wurde als Markdown-Datei bereitgestellt.');
  };

  return (
    <div className="academy-modules ad-app" data-theme={theme} lang="de">
      <div className="demo-disclosure"><details><summary>Interaktive Produktdemo</summary><p>Module aus academy-design, verbunden mit einem festen Demo-Ablauf ohne Live-KI. Deine Eingaben bleiben in diesem Browser und werden beim Neuladen zurückgesetzt.</p></details><button type="button" className="btn btn-ghost" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? 'Dunkel anzeigen' : 'Hell anzeigen'}</button></div>
      <div className="demo-shell" data-app="academy">
        {!mission ? (
          <div className="demo-catalog-layout">
            <aside className="sidebar demo-sidebar" data-component="app-sidebar" data-app="academy" data-state="expanded" data-mobile-open="false" aria-label="Academy-Navigation">
              <div className="brand-row"><span className="brand-link"><Image unoptimized className="brand-logo" src="/projects/academy/catalog/logo-60x60.svg" alt="yesterday Academy" width={32} height={32} /></span><span className="wordmark" data-component="wordmark" data-size="compact"><span className="wordmark-brand">yesterday</span> <span className="wordmark-product">academy</span></span></div>
              <nav className="nav" aria-label="Lernbereich"><span className="sidebar-link is-active" aria-current="page"><span className="nav-icon"><Glyph name="target" /></span><span className="nav-label">Missionen</span></span></nav>
              <div className="identity-footer"><span className="avatar" aria-hidden="true">DG</span><span className="identity-name">Demo-Gast</span></div>
            </aside>
            <section className="screen-shell demo-catalog-content" aria-labelledby="demo-catalog-title"><div className="screen-inner">
              <header className="page-head" data-component="page-head"><div className="page-head-copy"><h3 id="demo-catalog-title" ref={heading} tabIndex={-1} className="page-head-title">Deine Missionen</h3><p className="page-head-sub">Wähle eine Mission und arbeite mit Tomo an deinem ersten Ergebnis.</p></div></header>
              <div className="controls-bar" data-component="mission-controls-bar"><div className="content-search" role="search" data-component="content-search"><span className="search-glyph"><Glyph name="search" /></span><input className="search-input" type="search" aria-label="Missionen durchsuchen" placeholder="Missionen durchsuchen" value={search} onChange={event => setSearch(event.target.value)} /></div><StatusFilter value={filter} onChange={setFilter} /></div>
              <p className="demo-catalog-count">{matching.length} {matching.length === 1 ? 'Mission' : 'Missionen'} · KI in deinem Arbeitsalltag</p>
              {matching.length ? <ul className="demo-mission-grid">{matching.map(item => <li key={item.id}><MissionCard mission={item} answers={runs[item.id] ?? []} onOpen={() => open(item)} /></li>)}</ul> : <div className="demo-empty-result" role="status"><h4>Keine passenden Missionen</h4><p>Ändere die Suche oder den Status, um weitere Missionen zu sehen.</p><button type="button" className="btn btn-secondary" onClick={() => { setSearch(''); setFilter('all'); }}>Alle Missionen anzeigen</button></div>}
              <p className="demo-catalog-note">Die Missionen stammen aus der öffentlichen Academy-Vorschau. Die Gespräche sind für diese Demo verkürzt.</p>
            </div></section>
          </div>
        ) : (
          <>
            <header className="topbar topbar-mission demo-topbar" data-component="topbar"><button type="button" className="topbar-brand topbar-brand-mission" onClick={back} aria-label="Zurück zu Missionen" title="Zurück zu Missionen"><Image unoptimized className="topbar-brand-logo" src="/projects/academy/catalog/logo-60x60.svg" alt="" width={32} height={32} /></button><div className="mission-info"><h3 ref={heading} tabIndex={-1} className="mission-title">{mission.short}</h3><span className={`status-pill ${complete ? 'pill-completed' : 'pill-active'}`}><span className="status-dot" aria-hidden="true" />{complete ? 'Abgeschlossen' : 'In Bearbeitung'}</span></div><div className="actions"><button type="button" className="btn btn-ghost" onClick={reset} disabled={!count && !tour} title={!count && !tour ? 'Die Mission beginnt bereits beim ersten Schritt.' : undefined}>Neu starten</button></div></header>
            <div className="demo-mobile-switch" role="group" aria-label="Ansicht wählen">{(['steps', 'chat', 'result'] as const).map((view, index) => <button type="button" className="btn btn-secondary" key={view} aria-pressed={mobileView === view} onClick={() => setMobileView(view)}>{['Schritte', 'Gespräch', `Ergebnis${count ? ` (${count})` : ''}`][index]}</button>)}</div>
            <div className={`session-shell demo-workspace demo-show-${mobileView}`} data-component="session-shell">
              <StepRail mission={mission} answers={answers} />
              <section className="chat-pane" data-component="chat-pane" aria-label="Gespräch mit Tomo"><div className="chat-container">
                <div className="demo-chat-actions"><span>{complete ? 'Alle Phasen abgeschlossen' : `Phase ${count + 1} / ${mission.steps.length} · ${step?.title}`}</span><button type="button" className="btn btn-ghost" onClick={() => { setTour(!tour); setDraft(''); }} disabled={complete}>{tour && !complete ? 'Beispiel pausieren' : 'Beispiel abspielen'}</button></div>
                <div className="chat-scroll-wrapper"><div ref={log} className="chat-scroll-body" role="log" aria-label="Nachrichtenverlauf" aria-live="off"><div className="chat-track"><div className="message-list">
                  <div className="message-row" data-message-role="assistant"><div className="message-avatar-slot">{!count && <TomoFace />}</div><div className="message-body"><div className="prose"><p>{mission.steps[0].question}</p></div></div></div>
                  {answers.map((answer, index) => <div className="demo-turn" key={`${mission.id}-${index}`}><div className="message-row" data-message-role="user"><div className="message-body"><div className="prose"><p>{answer}</p></div></div></div><div className="message-row" data-message-role="assistant"><div className="message-avatar-slot">{index === count - 1 && <TomoFace />}</div><div className="message-body"><div className="prose"><p>{mission.steps[index].acknowledgement}</p>{mission.steps[index + 1] && <p>{mission.steps[index + 1].question}</p>}</div></div></div></div>)}
                  {complete && <div className="demo-complete" role="note"><strong>Dein Ergebnis ist bereit.</strong><p>Du kannst dein Dokument kopieren, herunterladen und im eigenen KI-Werkzeug testen.</p><button type="button" className="btn btn-secondary demo-result-link" onClick={() => setMobileView('result')}>Ergebnis ansehen</button></div>}
                </div></div></div></div>
                {!complete && <><div className="demo-suggestions"><button type="button" className="btn btn-ghost" disabled={tour} onClick={() => { setDraft(step?.suggestions[0] ?? ''); input.current?.focus({ preventScroll: true }); }}>Beispiel einsetzen</button><button type="button" className="btn btn-ghost" disabled={tour} onClick={() => { setDraft(step?.suggestions[1] ?? ''); input.current?.focus({ preventScroll: true }); }}>Anderes Beispiel</button></div><div className="composer-slot" data-component="chat-composer"><div className="composer-inner"><form onSubmit={send} className="chat-composer-shell"><textarea ref={input} className="chat-input-textarea" id="academy-demo-message" aria-label="Deine Antwort an Tomo" value={draft} maxLength={1500} disabled={tour} rows={1} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder={tour ? 'Beispiel läuft – jederzeit pausierbar.' : 'Nachricht eingeben…'} /><div className="composer-row"><span className="demo-input-hint">{tour ? 'Fester Demo-Ablauf' : draft.length > 1200 ? `${draft.length}/1500 Zeichen` : 'Enter senden · Shift + Enter neue Zeile'}</span><span className="composer-spacer" /><button type="submit" className="chat-send" aria-label="Antwort senden" title="Antwort senden" disabled={!draft.trim() || tour}><Glyph name="send" /></button></div></form></div></div><p className="ai-disclaimer">Demo ohne Live-KI · keine Übertragung deiner Eingaben</p></>}
              </div></section>
              <ArtifactPanel mission={mission} answers={answers} onCopy={copy} onDownload={download} />
            </div>
          </>
        )}
      </div>
      <div className="demo-status-announcement" role="status">{feedback || (complete ? 'Mission abgeschlossen. Dein Ergebnis ist bereit.' : mission ? `Phase ${count + 1} / ${mission.steps.length} · ${step?.title}` : 'Wähle eine von drei Missionen.')}</div>
    </div>
  );
}
