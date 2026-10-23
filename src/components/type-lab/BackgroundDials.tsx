"use client";
import { useEffect, useRef, type MutableRefObject } from 'react';
import { createDialKit, createDialRoot, type DialConfig } from 'dialkit/vanilla';
import 'dialkit/vanilla/styles.css';
import { backgroundControls, backgroundDefaults, randomizeBackgroundGroup, type BackgroundTuning } from './background-tuning';
import type { Config } from './config';

export function BackgroundDials({ config }: { config: MutableRefObject<Config> }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const initial = { ...backgroundDefaults, ...config.current.tuning };
    const schema: DialConfig = {};
    for (const [key, c] of Object.entries(backgroundControls)) {
      const group = (schema[c.group] ??= {}) as DialConfig;
      group[c.label] = [initial[key as keyof BackgroundTuning], c.range[1], c.range[2], c.range[3]];
    }
    (schema['Ruhige Welle'] as DialConfig).würfeln = { type: 'action', label: 'Ruhige Welle würfeln' };
    (schema.Klickwelle as DialConfig).würfeln = { type: 'action', label: 'Klickwelle würfeln' };
    schema.Zurücksetzen = { type: 'action' };
    schema['JSON exportieren'] = { type: 'action', label: 'JSON exportieren' };
    const kit = createDialKit('Hintergrund', schema, { id: 'background-tuning', persist: false, onAction(action) {
      if (action === 'Zurücksetzen' || action.endsWith('.würfeln')) {
        const current = {...backgroundDefaults,...config.current.tuning};
        const next = action === 'Zurücksetzen' ? backgroundDefaults : randomizeBackgroundGroup(current,action.startsWith('Ruhige Welle.') ? 'ambient' : 'click');
        const updates: Record<string, Record<string, number>> = {};
        for (const [key, c] of Object.entries(backgroundControls)) (updates[c.group] ??= {})[c.label] = next[key as keyof BackgroundTuning];
        kit.setValues(updates);
      }
      if (action === 'JSON exportieren') {
        const url = URL.createObjectURL(new Blob([JSON.stringify(config.current.tuning, null, 2)], { type: 'application/json' }));
        const link = document.createElement('a'); link.href = url; link.download = 'hintergrund-einstellungen.json'; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } });
    const unsubscribe = kit.subscribe(values => {
      const tuning = { ...backgroundDefaults };
      for (const [key, c] of Object.entries(backgroundControls)) {
        const group = values[c.group] as Record<string, number>;
        tuning[key as keyof BackgroundTuning] = group[c.label];
      }
      config.current.tuning = tuning;
      try { localStorage.setItem('tz-background-tuning', JSON.stringify(tuning)); } catch { /* Live tuning and export still work. */ }
    });
    const root = createDialRoot({ target: host.current!, mode: 'inline', theme: 'dark', productionEnabled: true });
    return () => { unsubscribe(); root.destroy(); kit.destroy(); };
  }, [config]);
  return <div ref={host} />;
}
