'use client';

import { useEffect } from 'react';

export default function AnchorScrollControl() {
  useEffect(() => {
    let frame = 0;
    let journey = 0;
    let transition: ViewTransition | undefined;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => {
      journey++;
      cancelAnimationFrame(frame);
      frame = 0;
      transition?.skipTransition();
      transition = undefined;
    };
    const start = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement) || !link.closest('.orbit-home, .academy-page') || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
      let target: HTMLElement | null;
      try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
      if (!target) return;
      event.preventDefault();
      stop();
      const from = window.scrollY;
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const to = Math.max(0, Math.min(max, from + target.getBoundingClientRect().top - margin));
      const oldURL = location.href;
      if (url.hash !== location.hash) {
        history.pushState(null, '', url.hash);
        window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL, newURL: location.href }));
      }
      const finish = () => {
        // Move keyboard navigation to the destination without starting another scroll.
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
          target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
        }
        target.focus({ preventScroll: true });
      };
      if (reduced.matches || Math.abs(to - from) < 2) {
        window.scrollTo({ top: to, behavior: 'instant' });
        finish();
        return;
      }
      if (Math.abs(to - from) > window.innerHeight * 1.25) {
        const currentJourney = journey;
        const arrive = () => {
          if (currentJourney !== journey) return;
          window.scrollTo({ top: to, behavior: 'instant' });
          window.dispatchEvent(new Event('anchor-arrive'));
          finish();
        };
        if (document.startViewTransition) {
          transition = document.startViewTransition(arrive);
          void transition.finished.catch(() => {});
        } else arrive();
        return;
      }
      const duration = Math.min(1100, 600 + Math.abs(to - from) * .3);
      let began: number | undefined;
      const tick = (now: number) => {
        began ??= now;
        const progress = Math.min(1, (now - began) / duration);
        const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
        window.scrollTo({ top: from + (to - from) * eased, behavior: 'instant' });
        if (progress < 1) frame = requestAnimationFrame(tick);
        else { frame = 0; finish(); }
      };
      frame = requestAnimationFrame(tick);
    };
    const key = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape', 'Tab'].includes(event.key)) stop();
    };
    document.addEventListener('click', start);
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('keydown', key);
    window.addEventListener('popstate', stop);
    reduced.addEventListener('change', stop);
    return () => {
      stop();
      document.removeEventListener('click', start);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('keydown', key);
      window.removeEventListener('popstate', stop);
      reduced.removeEventListener('change', stop);
    };
  }, []);
  return null;
}
