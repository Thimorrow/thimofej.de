/* eslint-disable @next/next/no-img-element -- Local, fixed-size reference assets. */
'use client';

import { useEffect, useRef, useState } from 'react';
import localFont from 'next/font/local';
import './academy-preview.css';

// The Academy app's UI font (Inter), shipped as a file so the build never needs Google Fonts.
const inter = localFont({ src: './inter.woff2', weight: '100 900', display: 'swap' });

type Section = { heading: string; lines: string[] };
type Beat =
  | { kind: 'tomo'; text: string; advance?: true }
  | { kind: 'user'; text: string }
  | { kind: 'result'; section: Section };
type Mission = {
  number: number; title: string; short: string; duration: string; cover: string;
  steps: string[]; output: string; pending: string; script: Beat[];
};

// Real Academy missions (titles, steps, covers, outputs); the conversations are
// short sample runs written in each mission's own voice. The app says "du".
export const MISSIONS: Mission[] = [
  {
    number: 3,
    title: 'Dein Personal Handbook: Endlich mal ein gutes Onboarding',
    short: 'Dein Personal Handbook',
    duration: '~60 Min.',
    cover: '/projects/academy/preview/academy/missions/personal-handbook.jpg',
    steps: ['Ich tippe mal & dein Alltag', 'Dein Stil', 'Handbook bauen', 'Der Beweis'],
    output: 'Mein Personal Handbook',
    pending: 'Mein Stil',
    script: [
      { kind: 'tomo', text: 'Dein Personal Handbook. 📋 Bevor du irgendwas erzählst, ich tippe einfach mal: Ein guter Teil deiner Woche dreht sich um Angebote, Abstimmungen und eine ganze Menge E-Mails. Treffe ich es grob?' },
      { kind: 'user', text: 'Ziemlich gut. Ich bin im Vertriebsinnendienst: Angebote, Rückfragen von Kunden, und montags erst mal das Postfach sortieren.' },
      { kind: 'tomo', advance: true, text: 'Merkst du was? Ich fang nicht bei null an. Genau das bauen wir jetzt für dich: ein Onboarding, mit dem jede KI dich schon kennt. Ich trag ein, was du gesagt hast.' },
      { kind: 'result', section: { heading: 'Wer ich bin', lines: ['Rolle: Vertriebsinnendienst', 'Wofür ich da bin: Angebote und Kundenanfragen'] } },
      { kind: 'result', section: { heading: 'Woran ich arbeite', lines: ['Montags das Postfach sortieren', 'Rückfragen von Kunden beantworten'] } },
      { kind: 'tomo', text: 'Was ist eine Aufgabe, die dir richtig Spaß macht? Ein Handbook, das nur die nervigen Sachen kennt, trifft dich nicht.' },
    ],
  },
  {
    number: 5,
    title: 'Alltagsaufgaben mit KI: Finde deine 10 Use Cases',
    short: 'Deine 10 Use Cases',
    duration: '~30 Min.',
    cover: '/projects/academy/preview/academy/missions/alltags-cases.jpg',
    steps: ['Zehn Use Cases sammeln', 'Top-Kandidat & Backlog'],
    output: 'Mein Use-Case-Backlog',
    pending: 'Mein Top-Kandidat',
    script: [
      { kind: 'tomo', text: 'Jetzt wird’s praktisch: Wir suchen zehn Stellen in deiner Woche, wo KI dir Zeit schenkt oder dein Ergebnis besser macht. Wo denkst du manchmal: Das müsste doch schneller gehen?' },
      { kind: 'user', text: 'Protokolle nach Meetings. Angebote aus alten Vorlagen zusammenbauen. Und Kundenmails, die eigentlich immer gleich klingen.' },
      { kind: 'tomo', text: 'Drei starke Kandidaten, ich trage sie ein. Und ich werf dir noch einen hin, der in fast jedem Job zieht.' },
      { kind: 'result', section: { heading: 'Zeit zurückholen', lines: ['Protokolle nach Meetings', 'Angebote aus Vorlagen', 'Antworten auf Standard-Kundenmails'] } },
      { kind: 'result', section: { heading: 'Qualität draufpacken', lines: ['Feedback aus fünf Perspektiven auf wichtige Texte'] } },
      { kind: 'tomo', text: 'Vier von zehn stehen. Wo hättest du gern eine zweite Meinung, bevor etwas rausgeht?' },
    ],
  },
  {
    number: 6,
    title: 'Dein erster Aufgaben-Snippet: Gut briefen ist die halbe Miete',
    short: 'Dein erster Aufgaben-Snippet',
    duration: '~30 Min.',
    cover: '/projects/academy/preview/academy/missions/aufgaben-snippet.jpg',
    steps: ['Deine Aufgabe briefen', 'Snippet bauen & benennen', 'Erster Lauf'],
    output: 'Mein erster Aufgaben-Snippet',
    pending: 'Mein Snippet-Briefing',
    script: [
      { kind: 'tomo', text: 'Nimm deinen Top-Kandidaten aus dem Backlog. Beschreib die Aufgabe erst mal roh, so wie du sie einer Kollegin erklären würdest.' },
      { kind: 'user', text: 'Nach jedem Kundentermin schreibe ich ein Angebot. Die Infos suche ich mir aus meinen Notizen zusammen und baue es aus alten Angeboten.' },
      { kind: 'tomo', text: 'Gutes Material. Ich habe es in deinem Ergebnis als Aufgabe festgehalten und die ersten RAZKOB-Bausteine abgeleitet.' },
      { kind: 'result', section: { heading: 'Meine Aufgabe', lines: ['Nach jedem Kundentermin ein Angebot aus Notizen und alten Angeboten erstellen'] } },
      { kind: 'result', section: { heading: 'RAZKOB-Bausteine', lines: ['R · Rolle: Vertriebsassistenz', 'A · Aufgabe: Angebot entwerfen', 'K · Kontext: noch offen'] } },
      { kind: 'tomo', text: 'K ist der wichtigste Baustein: Gib der KI den Krimi, nicht nur den Klappentext. Was muss sie über deine Kunden wissen?' },
    ],
  },
];

const READ_MS = 900; // time to read Tomo's message before the user's reply lands
const THINK_MS = 800;
const PAUSE_MS = 300;
const RESULT_MS = 450;
// Loop rhythm: overview, pressed card, mission plays, finished chat stays readable.
const OVERVIEW_MS = 1400;
const PRESS_MS = 500;
const HOLD_MS = 3000;

/** Scripted, backend-free replay of an Academy mission chat, built like the app's mission screen. */
export default function AcademyPreview() {
  const [active, setActive] = useState(0);
  // Mission 0 first, so the server render (and no-JS / reduced motion) shows a finished chat.
  const [view, setView] = useState<'overview' | 'mission'>('mission');
  const [pressed, setPressed] = useState(false);
  // idle = nothing started (SSR, reduced motion); loop = endless tour; manual = visitor took over.
  const [mode, setMode] = useState<'idle' | 'loop' | 'manual'>('idle');
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [calm, setCalm] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pagePaused, setPagePaused] = useState(false);
  // Visible beats per mission. The server renders every beat, so crawlers, no-JS
  // and reduced-motion visitors get the finished conversation.
  const [shown, setShown] = useState(() => MISSIONS.map(m => m.script.length));
  const [thinking, setThinking] = useState(false);
  const [playing, setPlaying] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  // The mission still being replayed; a finished replay simply stops counting as live.
  const live = playing !== null && shown[playing] < MISSIONS[playing].script.length ? playing : null;
  const running = inView && pageVisible && !calm && !paused && !pagePaused;

  const play = (index: number) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setShown(s => s.map((n, i) => (i === index ? 0 : n)));
    setPlaying(index);
  };

  const open = (index: number) => {
    setActive(index);
    setPressed(false);
    setView('mission');
    play(index);
  };

  const finishLive = () => {
    if (live !== null) setShown(s => s.map((n, i) => (i === live ? MISSIONS[live].script.length : n)));
  };

  // Visitor takes over: the loop stops, the chosen mission still plays.
  const pick = (index: number) => {
    if (!calm) setMode('manual');
    open(index);
  };

  const back = () => {
    if (!calm) setMode('manual');
    finishLive();
    setPressed(false);
    setView('overview');
  };

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const home = root.current?.closest('.orbit-home');
    let started = false;
    const syncMotion = () => {
      setCalm(media.matches);
      if (media.matches) {
        setShown(MISSIONS.map(m => m.script.length));
        setThinking(false);
      }
    };
    const syncPause = () => setPagePaused(home?.getAttribute('data-paused') === 'true');
    syncMotion();
    syncPause();
    const io = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      setInView(visible);
      if (!visible || started || media.matches) return;
      started = true;
      setView('overview');
      setMode('loop');
    }, { threshold: 0 });
    io.observe(root.current!);
    const mutation = new MutationObserver(syncPause);
    if (home) mutation.observe(home, { attributes: true, attributeFilter: ['data-paused'] });
    const syncVisibility = () => setPageVisible(!document.hidden);
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    media.addEventListener('change', syncMotion);
    return () => {
      io.disconnect();
      mutation.disconnect();
      document.removeEventListener('visibilitychange', syncVisibility);
      media.removeEventListener('change', syncMotion);
    };
  }, []);

  // Loop: overview -> pressed card -> mission plays -> hold -> overview with the next mission.
  useEffect(() => {
    if (mode !== 'loop' || !running || (view === 'mission' && live !== null)) return;
    const wait = view === 'mission' ? HOLD_MS : pressed ? PRESS_MS : OVERVIEW_MS;
    const t = window.setTimeout(() => {
      if (view === 'mission') { setView('overview'); setActive(a => (a + 1) % MISSIONS.length); }
      else if (pressed) open(active);
      else setPressed(true);
    }, wait);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, running, view, pressed, live, active]);

  // Timeline: each tick reveals the next beat of the playing mission.
  useEffect(() => {
    if (playing === null || !running) return;
    const script = MISSIONS[playing].script;
    const next = shown[playing];
    if (next >= script.length) return;
    const beat = script[next];
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const reveal = () => setShown(s => s.map((n, i) => (i === playing ? n + 1 : n)));

    if (beat.kind === 'user') {
      later(READ_MS, reveal);
    } else if (beat.kind === 'result') {
      later(RESULT_MS, reveal);
    } else {
      const start = next === 0 ? 250 : PAUSE_MS;
      later(start, () => setThinking(true));
      later(start + THINK_MS, () => { setThinking(false); reveal(); });
    }
    return () => { timers.forEach(clearTimeout); setThinking(false); };
  }, [playing, shown, running]);

  const mission = MISSIONS[active];
  const beats = mission.script.slice(0, shown[active]);
  const step = beats.filter(b => b.kind === 'tomo' && b.advance).length;
  const sections = beats.flatMap(b => (b.kind === 'result' ? [b.section] : []));
  const lastTomo = beats.map(b => b.kind).lastIndexOf('tomo');
  const progress = Math.round(((step + (sections.length ? 0.5 : 0.2)) / mission.steps.length) * 100);

  return (
    <div ref={root} className={`academy-reference ${inter.className}`} data-animate={running}>
      <div className="ap-window">
        <div className="ap-topbar">
          {/* The rail (with its back link) is hidden below 1100px, so the topbar carries one there. */}
          {view === 'mission' && <button type="button" className="ap-back-top" aria-label="Zurück zu Missionen" onClick={back}>‹</button>}
          {view === 'mission' && <img src="/projects/academy/preview/academy/tomo-face-chat.svg" alt="" width="20" height="20" className="ap-brand" />}
          <strong className="ap-title">{view === 'mission' ? `#${mission.number} ${mission.title}` : 'Missionen'}</strong>
          {view === 'mission' && <span className="ap-pill"><i />In Bearbeitung</span>}
          <span className="ap-spacer" />
          {!calm && <button type="button" className="ap-pause" aria-label={paused ? 'Produktdemo fortsetzen' : 'Produktdemo pausieren'} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Weiter' : 'Pause'}</button>}
        </div>

        <div className="ap-stage">
          <div className={`ap-view${view === 'overview' ? '' : ' is-off'}`} inert={view !== 'overview'}>
            <ul className="ap-overview" aria-label="Missionen">
              {MISSIONS.map((m, i) => (
                <li key={m.number}>
                  <button type="button" className={`ap-mc${pressed && i === active ? ' is-pressed' : ''}`} onClick={() => pick(i)}>
                    <span className="ai-image ap-cover"><img src={m.cover} alt="" width="480" height="320" loading="lazy" /><img className="ai-label" src="/projects/academy/preview/labels/ai-generated.png" alt="KI-generiert" width="1028" height="267" loading="lazy"/></span>
                    <span className="ap-mc-body">
                      <span className="ap-mc-meta">Mission #{m.number} · {m.duration}</span>
                      <strong>{m.title}</strong>
                      <span className="ap-mc-steps">{m.steps.length} Schritte</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={`ap-view${view === 'mission' ? '' : ' is-off'}`} inert={view !== 'mission'}>
        <div className="ap-shell">
          <aside className="ap-rail" aria-label="Fortschritt">
            <button type="button" className="ap-back" onClick={back}>‹ Zurück zu Missionen</button>
            <div className="ap-progress">
              <span>Fortschritt</span><span>Schritt {step + 1} von {mission.steps.length}</span>
            </div>
            <div className="ap-track"><i style={{ width: `${progress}%` }} /></div>
            <ol className="ap-steps">
              {mission.steps.map((name, i) => {
                const state = i < step ? 'done' : i === step ? 'current' : 'upcoming';
                return (
                  <li key={name} className={`is-${state}`}>
                    <span className="ap-marker" aria-hidden="true">{state === 'done' ? '✓' : i + 1}</span>
                    {name}
                    {state !== 'upcoming' && <span className="sr-only">{state === 'done' ? ' (erledigt)' : ' (aktuell)'}</span>}
                  </li>
                );
              })}
            </ol>
            <div className="ap-identity" aria-hidden="true"><span>AM</span>Alex Meyer</div>
          </aside>

          <div className="ap-chat">
            {/* column-reverse keeps the newest message in view natively, without scripting the scroll */}
            <div className="ap-log"><div>
              {beats.map((b, i) => b.kind === 'user' ? (
                <div key={`${active}-${i}`} className="ap-row ap-row--user"><p className="ap-bubble">{b.text}</p></div>
              ) : b.kind === 'tomo' ? (
                <div key={`${active}-${i}`} className="ap-row">
                  <span className="ap-avatar">{i === lastTomo && !thinking && <img src="/projects/academy/preview/academy/tomo-face-chat.svg" alt="" width="24" height="24" />}</span>
                  <p><span className="sr-only">Tomo: </span>{b.text}</p>
                </div>
              ) : null)}
              {thinking && (
                <div className="ap-row ap-thinking" aria-hidden="true">
                  <span className="ap-avatar"><i /><i /><img src="/projects/academy/preview/academy/tomo-face-chat.svg" alt="" width="24" height="24" /></span>
                  <p>Tomo denkt nach…</p>
                </div>
              )}
            </div></div>
            <div className="ap-composer" aria-hidden="true">
              <p className="is-placeholder">Schreib Tomo eine Nachricht …</p>
              <div className="ap-composer-row"><span className="ap-spacer" /><span className="ap-send">↑</span></div>
            </div>
            <p className="ap-disclaimer">KI Agenten können Fehler machen</p>
          </div>

          <aside className="ap-artifact" aria-label="Ergebnis">
            <p className="ap-artifact-title">{mission.output}</p>
            {/* column-reverse again: the newest card stays in view while the list grows */}
            <div className="ap-sections"><div>
              {sections.map(s => (
                <section key={s.heading} className="ap-card">
                  <h4>{s.heading}</h4>
                  <ul>{s.lines.map(l => <li key={l}>{l}</li>)}</ul>
                </section>
              ))}
              <section className="ap-card is-pending" aria-label={`${mission.pending}, noch offen`}>
                <h4><i />{mission.pending}</h4>
                <span className="ap-skeleton" /><span className="ap-skeleton is-short" />
              </section>
            </div></div>
            <div className="ap-download" aria-hidden="true"><span>↓</span><p>Ergebnis herunterladen<small>Markdown · .md</small></p></div>
          </aside>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
