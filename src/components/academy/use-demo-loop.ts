'use client';

import { useEffect, useRef, useState } from 'react';

export function useDemoLoop(enabled: boolean) {
  const root = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  const [time, setTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const [available, setAvailable] = useState(false);
  const [pagePaused, setPagePaused] = useState(false);

  useEffect(() => {
    if (!enabled || !root.current) return;
    const node = root.current;
    const home = node.closest('.orbit-home');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => {
      const stopped = home?.getAttribute('data-paused') === 'true';
      setPagePaused(stopped);
      setAvailable(visible && !document.hidden && !stopped);
    };
    const preference = () => setPaused(reduced.matches);
    preference();
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio >= .2; update(); }, { threshold: .2 });
    observer.observe(node);
    const mutation = new MutationObserver(update);
    if (home) mutation.observe(home, { attributes: true, attributeFilter: ['data-paused'] });
    document.addEventListener('visibilitychange', update);
    reduced.addEventListener('change', preference);
    return () => { observer.disconnect(); mutation.disconnect(); document.removeEventListener('visibilitychange', update); reduced.removeEventListener('change', preference); };
  }, [enabled]);

  const running = enabled && available && !paused;
  useEffect(() => {
    if (!running) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      // Hidden or stalled tabs must never skip an entire conversation on return.
      elapsed.current += Math.min(200, now - previous);
      previous = now;
      setTime(elapsed.current);
    }, 100);
    return () => clearInterval(timer);
  }, [running]);

  return { root, time, paused, pagePaused, running, toggle: () => setPaused(value => !value) };
}
