'use client';

import Image from 'next/image';
import {useEffect, useLayoutEffect, useId, useRef, useState, type KeyboardEvent} from 'react';
import {createPortal} from 'react-dom';
import {animate} from 'motion';
import {extendTimer, pauseTimer, timerClock, timerRemaining, toggleTimer, type DemoTimer} from './lilt-demo-model';
import {nativeNotch, nativeNotchSpring, notchFrame, notchPath} from './lilt-native-motion';
import './lilt-demo.css';

type Page = 'music' | 'focus' | 'shelf';
type IconName = Page | 'play' | 'pause' | 'reset' | 'next' | 'previous' | 'file' | 'chevron' | 'settings' | 'plus' | 'trash' | 'more';
type ShelfFile = {id: string; name: string; location: string; blob: Blob};
type FocusMenu = 'duration' | 'activity' | 'custom' | 'intervals' | null;
const pages: Page[] = ['music', 'focus', 'shelf'];
const tracks = [
  {title: 'Ambient', src: '/sound/drone.mp3'},
  {title: 'Arrival', src: '/sound/arrival.mp3'},
];

function Icon({name}: {name: IconName}) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    {name === 'music' && <><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></>}
    {name === 'focus' && <><circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.6 1.6M9.5 3h5"/></>}
    {name === 'shelf' && <><path d="M3.5 13.5 6 6.5A2 2 0 0 1 7.9 5h8.2A2 2 0 0 1 18 6.5l2.5 7v4A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5Z"/><path d="M3.5 13.5H8l1.5 2h5l1.5-2h4.5"/></>}
    {name === 'play' && <path fill="currentColor" stroke="none" d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/>}
    {name === 'pause' && <><rect fill="currentColor" stroke="none" x="6.5" y="5" width="4" height="14" rx="1.4"/><rect fill="currentColor" stroke="none" x="13.5" y="5" width="4" height="14" rx="1.4"/></>}
    {name === 'reset' && <><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/></>}
    {name === 'next' && <><path fill="currentColor" stroke="none" d="M5 6.6v10.8a.9.9 0 0 0 1.4.75l8.1-5.4a.9.9 0 0 0 0-1.5L6.4 5.85A.9.9 0 0 0 5 6.6Z"/><rect fill="currentColor" stroke="none" x="16.6" y="5.5" width="2.6" height="13" rx="1.3"/></>}
    {name === 'previous' && <g transform="translate(24 0) scale(-1 1)"><path fill="currentColor" stroke="none" d="M5 6.6v10.8a.9.9 0 0 0 1.4.75l8.1-5.4a.9.9 0 0 0 0-1.5L6.4 5.85A.9.9 0 0 0 5 6.6Z"/><rect fill="currentColor" stroke="none" x="16.6" y="5.5" width="2.6" height="13" rx="1.3"/></g>}
    {name === 'file' && <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/></>}
    {name === 'chevron' && <path strokeWidth="2.1" d="M6 9l6 6 6-6"/>}
    {name === 'settings' && <><path strokeWidth="1.7" d="m9.3 3-.5 2-1.4.8-2-.5-2.7 4.6 1.6 1.5v1.6l-1.6 1.5 2.7 4.6 2-.5 1.4.8.5 2h5.4l.5-2 1.4-.8 2 .5 2.7-4.6-1.6-1.5v-1.6l1.6-1.5-2.7-4.6-2 .5-1.4-.8-.5-2Z"/><circle strokeWidth="1.7" cx="12" cy="12.2" r="3"/></>}
    {name === 'plus' && <path strokeWidth="2" d="M12 5v14M5 12h14"/>}
    {name === 'trash' && <path strokeWidth="1.8" d="M4.5 7h15M9.5 7V5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7M6.5 7l.8 11.1a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7"/>}
    {name === 'more' && <>{[6,12,18].map(x => <circle key={x} cx={x} cy="12" r="1.6" fill="currentColor" stroke="none"/>)}</>}
  </svg>;
}

function PlayPause({playing}: {playing: boolean}) {
  return <span className="lilt-demo-play-pause" aria-hidden="true">
    <span data-shown={!playing}><Icon name="play"/></span>
    <span data-shown={playing}><Icon name="pause"/></span>
  </span>;
}

export function LiltDemo({locale}: {locale: 'de' | 'en'}) {
  const english = locale === 'en';
  const copy = english ? {
    open: 'Open Lilt', fold: 'Fold Lilt', enlarge: 'Try Lilt', close: 'Close', tabs: 'Lilt features',
    music: 'Music', focus: 'Focus', shelf: 'Shelf', start: 'Start focus timer', pause: 'Pause focus timer',
    reset: 'Reset focus timer', duration: 'Focus duration', activity: 'Focus activity', extend: 'Add five minutes',
    custom: 'Custom…', intervals: 'Intervals…', work: 'Work', rest: 'Break', set: 'Set', minutes: 'Minutes',
    play: 'Play sample', pauseMusic: 'Pause sample', previous: 'Previous sample', next: 'Next sample',
    sample: 'Audio sample', audioError: 'Audio unavailable. Try again.', done: 'Focus complete',
    add: 'Add files', remove: 'Remove selected file', clear: 'Clear shelf', empty: 'Drop files here',
    preview: 'Preview file', download: 'Save file', local: 'Only in this browser', example: 'Example file',
    settings: 'Lilt demo settings', volume: 'Volume', motion: 'Reduce motion', undo: 'Undo',
    privacy: 'Files stay in this tab. Nothing is uploaded.',
  } : {
    open: 'Lilt öffnen', fold: 'Lilt einklappen', enlarge: 'Lilt ausprobieren', close: 'Schließen', tabs: 'Lilt-Bereiche',
    music: 'Musik', focus: 'Fokus', shelf: 'Ablage', start: 'Fokustimer starten', pause: 'Fokustimer pausieren',
    reset: 'Fokustimer zurücksetzen', duration: 'Fokusdauer', activity: 'Fokusaktivität', extend: 'Fünf Minuten hinzufügen',
    custom: 'Eigene Dauer…', intervals: 'Intervalle…', work: 'Arbeit', rest: 'Pause', set: 'Setzen', minutes: 'Minuten',
    play: 'Hörbeispiel abspielen', pauseMusic: 'Hörbeispiel pausieren', previous: 'Vorheriges Hörbeispiel', next: 'Nächstes Hörbeispiel',
    sample: 'Hörbeispiel', audioError: 'Audio nicht verfügbar. Erneut versuchen.', done: 'Fokus abgeschlossen',
    add: 'Dateien hinzufügen', remove: 'Ausgewählte Datei entfernen', clear: 'Ablage leeren', empty: 'Dateien hier ablegen',
    preview: 'Dateivorschau', download: 'Datei speichern', local: 'Nur in diesem Browser', example: 'Beispieldatei',
    settings: 'Lilt-Demo-Einstellungen', volume: 'Lautstärke', motion: 'Bewegung reduzieren', undo: 'Rückgängig',
    privacy: 'Dateien bleiben in diesem Tab. Es wird nichts hochgeladen.',
  };
  const id = useId().replace(/:/g, '');
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const shell = useRef<SVGPathElement>(null);
  const clip = useRef<SVGPathElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const shapeProgress = useRef(1);
  const compact = useRef<HTMLButtonElement>(null);
  const fold = useRef<HTMLButtonElement>(null);
  const enlarge = useRef<HTMLButtonElement>(null);
  const zoomDialog = useRef<HTMLDialogElement>(null);
  const detailDialog = useRef<HTMLDialogElement>(null);
  const detailReturn = useRef<HTMLElement | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const durationTrigger = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const tabButtons = useRef<Partial<Record<Page, HTMLButtonElement | null>>>({});
  const zoomRef = useRef(false);
  const [zoom, setZoom] = useState(false);
  const [width, setWidth] = useState(680);
  const [screenWidth, setScreenWidth] = useState(846);
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState<Page>('focus');
  const [keyboard, setKeyboard] = useState(false);
  const [motionDisabled, setMotionDisabled] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [menu, setMenu] = useState<FocusMenu>(null);
  const [custom, setCustom] = useState('25');
  const [rest, setRest] = useState('5');
  const [intervals, setIntervals] = useState<{work: number; rest: number; phase: 'work' | 'rest'} | null>(null);
  const [activity, setActivity] = useState('Deep Work');
  const [timer, setTimer] = useState<DemoTimer>({kind: 'idle', duration: 1500});
  const [now, setNow] = useState(0);
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [volume, setVolume] = useState(.5);
  const [files, setFiles] = useState<ShelfFile[]>(() => [
    {id: 'sample-notes', name: 'notes.md', location: copy.example, blob: new Blob(['# Lilt\n\nMusic. Focus. Shelf.\n\nMake room for what matters.'], {type: 'text/plain'})},
    {id: 'sample-ideas', name: 'ideas.txt', location: copy.example, blob: new Blob(['A small place for the things you are working on.'], {type: 'text/plain'})},
  ]);
  const [selected, setSelected] = useState<string | null>('sample-notes');
  const [removed, setRemoved] = useState<ShelfFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [detail, setDetail] = useState<'settings' | {file: ShelfFile; url: string; text: string | null} | null>(null);
  const touchLayout = zoom && width < 460;
  const frame = notchFrame(1, width, touchLayout);
  const disabledMotion = motionDisabled || reduceMotion || keyboard;
  const smallPreview = screenWidth < 560;
  const previewTransform = `translateX(-50%) scale(${smallPreview ? screenWidth / 680 : 1})`;
  const remaining = timerRemaining(timer, now);
  const clock = timerClock(remaining);
  const activeFile = files.find(file => file.id === selected);

  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    const measure = () => setScreenWidth(node.clientWidth);
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    measure();
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const node = stage.current;
    if (!node) return;
    const measure = () => setWidth(node.clientWidth);
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    measure();
    return () => observer.disconnect();
  }, [zoom]);

  useLayoutEffect(() => {
    function paint(progress: number) {
      shapeProgress.current = progress;
      const shape = notchFrame(progress, width, touchLayout);
      shell.current?.setAttribute('d', notchPath(shape, true));
      clip.current?.setAttribute('d', notchPath(shape, false));
      if (shadow.current) Object.assign(shadow.current.style, {
        left: `${shape.x}px`, width: `${shape.width}px`, height: `${shape.height}px`, borderRadius: `${shape.radius}px`,
      });
    }
    const target = open ? 1 : 0;
    if (disabledMotion) {paint(target); return;}
    const animation = animate(shapeProgress.current, target, {duration: nativeNotch.duration, ease: nativeNotchSpring, onUpdate: paint});
    return () => animation.stop();
  }, [open, width, touchLayout, disabledMotion, zoom]);

  useEffect(() => {
    if (timer.kind !== 'running') return;
    const tick = () => {
      const instant = Date.now();
      setNow(instant);
      if (timerRemaining(timer, instant) === 0) setTimer(current => pauseTimer(current, instant));
    };
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (audio.current) audio.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const home = node.closest('.orbit-home');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true;
    function sync() {
      const paused = home?.getAttribute('data-paused') === 'true';
      setMotionDisabled(reduced.matches || paused);
      if (document.hidden || (!visible && !zoomRef.current) || paused) {
        const instant = Date.now();
        setTimer(current => pauseTimer(current, instant));
        setNow(instant);
        audio.current?.pause();
      }
    }
    const intersection = new IntersectionObserver(entries => {visible = entries[0]?.isIntersecting ?? false;sync();});
    intersection.observe(node);
    const mutation = new MutationObserver(sync);
    if (home) mutation.observe(home, {attributes: true, attributeFilter: ['data-paused']});
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    sync();
    return () => {intersection.disconnect();mutation.disconnect();document.removeEventListener('visibilitychange', sync);reduced.removeEventListener('change', sync);};
  }, []);

  useEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector<HTMLElement>('input,button[aria-pressed="true"],button')?.focus();
  }, [menu]);

  useEffect(() => {
    function clickSurface(event: MouseEvent) {
      const target = event.target;
      if (detail || !(target instanceof Element)) return;
      const inside = stage.current?.contains(target);
      if (target.closest('.lilt-demo-enlarge,.lilt-demo-mobile-open,.lilt-demo-detail,.lilt-demo-dialog-bar') || target.matches('.lilt-demo-dialog')) return;
      if (!open) {
        if (target === shell.current) {setKeyboard(false);setOpen(true);}
        return;
      }
      if (inside && target.closest('button,input,select,textarea,a,.lilt-demo-menu')) return;
      setKeyboard(false);
      if (menu) {
        const restoreFocus = menuRef.current?.contains(document.activeElement);
        setMenu(null);
        if (restoreFocus) durationTrigger.current?.focus({preventScroll: true});
      } else {
        setOpen(false);
        if (inside) requestAnimationFrame(() => compact.current?.focus({preventScroll: true}));
      }
    }
    document.addEventListener('click', clickSurface);
    return () => document.removeEventListener('click', clickSurface);
  }, [open, menu, detail]);

  useEffect(() => {
    if (!zoom) return;
    zoomDialog.current?.showModal();
    fold.current?.focus();
  }, [zoom]);

  useEffect(() => {
    if (!detail) return;
    detailDialog.current?.showModal();
    return () => {if (typeof detail !== 'string') URL.revokeObjectURL(detail.url);};
  }, [detail]);

  function closeZoom() {
    zoomDialog.current?.close();
    zoomRef.current = false;
    setZoom(false);
    setMenu(null);
    requestAnimationFrame(() => enlarge.current?.focus({preventScroll: true}));
  }

  function openZoom() {
    zoomRef.current = true;
    setZoom(true);
    setMenu(null);
  }

  function changeOpen(value: boolean) {
    setMenu(null);
    setOpen(value);
    requestAnimationFrame(() => (value ? fold : compact).current?.focus({preventScroll: true}));
  }

  function selectPage(value: Page) {setPage(value);setMenu(null);}

  function tabKey(event: KeyboardEvent<HTMLButtonElement>, current: Page) {
    const index = pages.indexOf(current);
    const next = event.key === 'ArrowRight' ? pages[(index + 1) % 3]
      : event.key === 'ArrowLeft' ? pages[(index + 2) % 3]
      : event.key === 'Home' ? pages[0] : event.key === 'End' ? pages[2] : undefined;
    if (next) {event.preventDefault();selectPage(next);tabButtons.current[next]?.focus();}
  }

  function configure(minutes: number, interval = false) {
    setTimer({kind: 'idle', duration: minutes * 60});
    setIntervals(interval ? {work: minutes * 60, rest: Number(rest) * 60, phase: 'work'} : null);
    setMenu(null);
    durationTrigger.current?.focus();
  }

  function startTimer() {
    const instant = Date.now();
    setNow(instant);
    if (remaining === 0 && intervals) {
      const phase = intervals.phase === 'work' ? 'rest' : 'work';
      setIntervals({...intervals, phase});
      setTimer(toggleTimer({kind: 'idle', duration: intervals[phase]}, instant));
    } else setTimer(current => toggleTimer(current, instant));
  }

  function toggleAudio() {
    if (!audio.current) return;
    if (playing) audio.current.pause();
    else {setAudioError(false);void audio.current.play().catch(() => setAudioError(true));}
  }

  function changeTrack(direction: number) {
    audio.current?.pause();
    setTrack(value => (value + direction + tracks.length) % tracks.length);
    setElapsed(0);
    setAudioDuration(0);
    setAudioError(false);
  }

  function addFiles(incoming: FileList | File[]) {
    const additions = Array.from(incoming, blob => ({id: crypto.randomUUID(), name: blob.name, location: copy.local, blob}));
    if (!additions.length) return;
    setFiles(current => [...current, ...additions]);
    setSelected(additions[additions.length - 1].id);
    setRemoved([]);
  }

  async function preview(file: ShelfFile, trigger: HTMLElement) {
    detailReturn.current = trigger;
    const text = /\.(md|txt|csv|json|log|css|html|js|ts)$/i.test(file.name) || file.blob.type.startsWith('text/')
      ? await file.blob.slice(0, 64_000).text() : null;
    setDetail({file, text, url: URL.createObjectURL(file.blob)});
  }

  function closeDetail() {
    detailDialog.current?.close();
    setDetail(null);
    requestAnimationFrame(() => detailReturn.current?.focus({preventScroll: true}));
  }

  const wings = <><span className="lilt-demo-wing">{page === 'focus' ? <i className="lilt-demo-dot" data-running={timer.kind === 'running'}/> : <Icon name={page}/>}</span><span className="lilt-demo-wing">{page === 'focus' ? clock : page === 'shelf' ? files.length || '' : playing ? <span className="lilt-demo-wave">{[0,-.3,-.7,-.15,-.5].map(delay => <i key={delay} style={{animationDelay: `${delay}s`}}/>)}</span> : timerClock(Math.floor(elapsed))}</span></>;
  const app = <div ref={stage} className="lilt-demo-stage" data-open={open} data-page={page} data-instant={disabledMotion} data-small={touchLayout} data-playing={playing}
    style={zoom ? undefined : {transform: previewTransform}}
    onPointerDownCapture={() => setKeyboard(false)} onKeyDownCapture={event => {
      setKeyboard(true);
      if (event.key === 'Escape') {
        if (menu) {event.preventDefault();event.stopPropagation();setMenu(null);durationTrigger.current?.focus();}
        else if (open) {event.preventDefault();event.stopPropagation();changeOpen(false);}
      }
    }}>
    <div ref={shadow} className="lilt-demo-shadow" aria-hidden="true"/>
    <svg className="lilt-demo-shape" width="100%" height="320" aria-hidden="true"><defs><clipPath id={`${id}-clip`} clipPathUnits="userSpaceOnUse"><path ref={clip} d={notchPath(frame, false)}/></clipPath></defs><path ref={shell} d={notchPath(frame, true)} fill="black"/></svg>
    <div className="lilt-demo-clipped" style={{clipPath: `url(#${id}-clip)`}}>
      <button ref={compact} className="lilt-demo-compact" type="button" style={{width: Math.min(317, frame.width)}} inert={open} aria-hidden={open} tabIndex={open ? -1 : 0} aria-label={copy.open} aria-expanded={open} onClick={() => changeOpen(true)}>{wings}</button>
      <div className="lilt-demo-expanded" style={{width: frame.width}} inert={!open} aria-hidden={!open}>
        <button ref={fold} type="button" className="lilt-demo-fold" aria-label={copy.fold} aria-expanded={open} onClick={() => changeOpen(false)}>{wings}</button>
        <div className="lilt-demo-body">
          <div className="lilt-demo-page lilt-demo-focus" role="tabpanel" id={`${id}-focus-panel`} aria-labelledby={`${id}-focus`} data-active={page === 'focus'} aria-hidden={page !== 'focus'} inert={page !== 'focus'}>
            <div className="lilt-demo-focus-row">
              <button ref={durationTrigger} type="button" className="lilt-demo-time" disabled={timer.kind === 'running'} aria-label={`${copy.duration}: ${clock}`} aria-expanded={menu !== null && menu !== 'activity'} onClick={() => setMenu(value => value ? null : 'duration')}>{clock}<Icon name="chevron"/></button>
              <div className="lilt-demo-meta"><button className="lilt-demo-activity" type="button" disabled={timer.kind === 'running' || intervals?.phase === 'rest'} aria-label={copy.activity} aria-expanded={menu === 'activity'} onClick={() => setMenu(value => value === 'activity' ? null : 'activity')}><span>{remaining === 0 ? copy.done : intervals?.phase === 'rest' ? copy.rest : activity}</span><Icon name="chevron"/></button></div>
              <div className="lilt-demo-controls">
                <button type="button" className="lilt-demo-primary" aria-label={timer.kind === 'running' ? copy.pause : remaining === 0 && intervals ? (intervals.phase === 'work' ? copy.rest : copy.work) : copy.start} onClick={startTimer}><PlayPause playing={timer.kind === 'running'}/></button>
                {timer.kind !== 'idle' && <button type="button" className="lilt-demo-pill" aria-label={copy.extend} onClick={() => {setNow(Date.now());setTimer(extendTimer);}}>+5</button>}
                <button type="button" className="lilt-demo-icon-button" aria-label={copy.reset} onClick={() => {setTimer({kind: 'idle', duration: intervals?.work ?? timer.duration});if (intervals) setIntervals({...intervals, phase: 'work'});}}><Icon name="reset"/></button>
              </div>
            </div>
          </div>
          <div className="lilt-demo-page lilt-demo-music" role="tabpanel" id={`${id}-music-panel`} aria-labelledby={`${id}-music`} data-active={page === 'music'} aria-hidden={page !== 'music'} inert={page !== 'music'}>
            <div className="lilt-demo-music-row"><div key={track} className="lilt-demo-cover" aria-hidden="true"><Icon name="music"/></div><div className="lilt-demo-track"><strong>{tracks[track].title}</strong><span>{copy.sample}</span></div><div className="lilt-demo-controls"><button type="button" className="lilt-demo-icon-button" aria-label={copy.previous} onClick={() => changeTrack(-1)}><Icon name="previous"/></button><button type="button" className="lilt-demo-primary" aria-label={playing ? copy.pauseMusic : copy.play} onClick={toggleAudio}><PlayPause playing={playing}/></button><button type="button" className="lilt-demo-icon-button" aria-label={copy.next} onClick={() => changeTrack(1)}><Icon name="next"/></button></div></div>
            {audioError ? <p className="lilt-demo-audio-error" role="status">{copy.audioError}</p> : <div className="lilt-demo-progress"><span>{timerClock(Math.floor(elapsed))}</span><input type="range" aria-label={english ? 'Playback position' : 'Wiedergabeposition'} min="0" max={audioDuration || 1} step=".1" value={elapsed} onChange={event => {if (audio.current) {audio.current.currentTime = Number(event.target.value);setElapsed(Number(event.target.value));}}}/><span>{timerClock(Math.floor(audioDuration))}</span></div>}
          </div>
          <div className="lilt-demo-page lilt-demo-shelf" role="tabpanel" id={`${id}-shelf-panel`} aria-labelledby={`${id}-shelf`} data-active={page === 'shelf'} aria-hidden={page !== 'shelf'} inert={page !== 'shelf'} data-dragging={dragging}
            onDragOver={event => {event.preventDefault();setDragging(true);}} onDragLeave={event => {if (!event.currentTarget.contains(event.relatedTarget instanceof Node ? event.relatedTarget : null)) setDragging(false);}} onDrop={event => {event.preventDefault();setDragging(false);addFiles(event.dataTransfer.files);}}>
            <div className="lilt-demo-files">{files.length ? files.map(file => <button className="lilt-demo-file" type="button" key={file.id} aria-pressed={selected === file.id} onClick={() => setSelected(file.id)} onDoubleClick={event => void preview(file, event.currentTarget)}><span className="lilt-demo-file-icon"><Icon name="file"/></span><span><strong>{file.name}</strong><small>{file.location}</small></span></button>) : <div className="lilt-demo-empty">{removed.length ? <button type="button" onClick={() => {setFiles(removed);setSelected(removed[0]?.id ?? null);setRemoved([]);}}>{copy.undo}</button> : copy.empty}</div>}</div>
            <div className="lilt-demo-shelf-actions"><button type="button" aria-label={copy.add} onClick={() => fileInput.current?.click()}><Icon name="plus"/></button><button type="button" disabled={!activeFile} aria-label={copy.preview} onClick={event => {if (activeFile) void preview(activeFile, event.currentTarget);}}><Icon name="more"/></button><button type="button" disabled={!files.length} aria-label={activeFile ? copy.remove : copy.clear} onClick={() => {const next = activeFile ? files.filter(file => file.id !== activeFile.id) : [];setRemoved(activeFile ? [activeFile] : files);setFiles(next);setSelected(next[0]?.id ?? null);}}><Icon name="trash"/></button></div>
          </div>
        </div>
        <div className="lilt-demo-footer"><div className="lilt-demo-tabs" role="tablist" aria-label={copy.tabs}>
          <span className="lilt-demo-tab-marker" style={{transform: `translateX(calc(${pages.indexOf(page) * 100}% + ${pages.indexOf(page) * 2}px))`}} aria-hidden="true"/>
          {pages.map(item => <button key={item} ref={node => {tabButtons.current[item] = node;}} type="button" role="tab" id={`${id}-${item}`} aria-selected={page === item} aria-controls={`${id}-${item}-panel`} tabIndex={page === item ? 0 : -1} onKeyDown={event => tabKey(event, item)} onClick={() => selectPage(item)}><Icon name={item}/><span>{copy[item]}</span></button>)}
        </div><button type="button" className="lilt-demo-settings" aria-label={copy.settings} onClick={event => {detailReturn.current = event.currentTarget;setDetail('settings');}}><Icon name="settings"/></button></div>
        {menu && <div ref={menuRef} className="lilt-demo-menu" data-activity={menu === 'activity'} role="group" aria-label={menu === 'activity' ? copy.activity : copy.duration}>
          {menu === 'activity' ? ['Deep Work', 'Light Work'].map(value => <button type="button" key={value} aria-pressed={activity === value} onClick={() => {setActivity(value);setMenu(null);}}>{value}<span>{activity === value ? '✓' : ''}</span></button>) : menu === 'duration' ? <>{[25,50].map(minutes => <button type="button" key={minutes} aria-pressed={timer.duration === minutes * 60 && !intervals} onClick={() => configure(minutes)}>{minutes} min<span>{timer.duration === minutes * 60 && !intervals ? '✓' : ''}</span></button>)}<button type="button" onClick={() => {setCustom(String(intervals ? intervals.work / 60 : timer.duration / 60));setMenu('intervals');}}>{copy.intervals}</button><button type="button" onClick={() => {setCustom(String(timer.duration / 60));setMenu('custom');}}>{copy.custom}</button></> : <form onSubmit={event => {event.preventDefault();configure(Number(custom), menu === 'intervals');}}><label>{menu === 'intervals' ? copy.work : copy.minutes}<input aria-label={copy.minutes} type="number" min="1" max="180" required value={custom} onChange={event => setCustom(event.target.value)}/></label>{menu === 'intervals' && <label>{copy.rest}<input aria-label={copy.rest} type="number" min="1" max="180" required value={rest} onChange={event => setRest(event.target.value)}/></label>}<button type="submit">{copy.set}</button></form>}
        </div>}
      </div>
    </div>
  </div>;

  return <div ref={root} className="lilt-demo">
    <audio ref={audio} src={tracks[track].src} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onTimeUpdate={event => setElapsed(event.currentTarget.currentTime)} onLoadedMetadata={event => setAudioDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)} onError={() => {setPlaying(false);setAudioError(true);}}/>
    <input ref={fileInput} className="lilt-demo-file-input" type="file" multiple aria-label={copy.add} tabIndex={-1} onChange={event => {if (event.target.files) addFiles(event.target.files);event.target.value = '';}}/>
    {!zoom && <div className="lilt-demo-inline" inert={smallPreview} aria-hidden={smallPreview}>{app}</div>}
    {smallPreview && <button type="button" className="lilt-demo-mobile-open" style={{transform: previewTransform, clipPath: `url(#${id}-clip)`}} tabIndex={-1} aria-hidden="true" onClick={openZoom}/>}
    <button ref={enlarge} className="lilt-demo-enlarge" type="button" onClick={openZoom}>{copy.enlarge}<span aria-hidden="true">↗</span></button>
    {zoom && createPortal(<dialog ref={zoomDialog} className="lilt-demo-dialog" aria-label="Lilt" onCancel={event => {event.preventDefault();closeZoom();}} onClick={event => {if (event.target === event.currentTarget) closeZoom();}}><div className="lilt-demo-dialog-content"><div className="lilt-demo-dialog-bar"><span>Lilt</span><button type="button" aria-label={copy.close} onClick={closeZoom}>×</button></div>{app}<p className="lilt-demo-privacy">{copy.privacy}</p></div></dialog>, document.body)}
    {detail && createPortal(<dialog ref={detailDialog} className="lilt-demo-detail" aria-label={typeof detail === 'string' ? copy.settings : detail.file.name} onCancel={event => {event.preventDefault();closeDetail();}}><header><strong>{typeof detail === 'string' ? copy.settings : detail.file.name}</strong><button type="button" aria-label={copy.close} onClick={closeDetail}>×</button></header>{typeof detail === 'string' ? <div className="lilt-demo-preferences"><label>{copy.volume}<input type="range" min="0" max="1" step=".05" value={volume} onChange={event => setVolume(Number(event.target.value))}/></label><label>{copy.motion}<input type="checkbox" checked={reduceMotion} onChange={event => setReduceMotion(event.target.checked)}/></label><p>{copy.privacy}</p></div> : <><div className="lilt-demo-preview">{detail.text !== null ? <pre>{detail.text}</pre> : detail.file.blob.type.startsWith('image/') ? <Image src={detail.url} alt={detail.file.name} width={800} height={500} unoptimized/> : <p>{detail.file.name}<br/>{Math.ceil(detail.file.blob.size / 1024)} KB</p>}</div><a className="lilt-demo-save" href={detail.url} download={detail.file.name}>{copy.download} ↓</a><p>{copy.privacy}</p></>}</dialog>, document.body)}
  </div>;
}
