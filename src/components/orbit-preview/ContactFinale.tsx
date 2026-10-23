'use client';

import { useRef } from 'react';
import './contact-finale.css';

const row = 'THIMOFEJ · ZAPKO · THIMORROW · '.repeat(7);

export function ContactFinale() {
  const section = useRef<HTMLElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const resetLetters = () => {
    word.current?.querySelectorAll<HTMLElement>('[data-contact-letter]').forEach(letter => {letter.style.transform = '';});
    if (section.current) section.current.dataset.engaged = 'false';
  };

  return <section ref={section} className="contact-finale oh-panel" id="kontakt" aria-labelledby="contact-title">
    <div className="contact-raster" aria-hidden="true">
      {Array.from({length: 15}, (_, index) => <span key={index}>{row}</span>)}
    </div>
    <div className="contact-layout">
      <h2 id="contact-title" aria-label="Hallo."><a className="contact-hello" href="mailto:thimofej@yesterday-ai.de"
        aria-label="Hallo sagen: E-Mail an Thimofej"
        onPointerMove={event => {
          if (event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches || event.currentTarget.closest('[data-paused="true"]')) return;
          const bounds = section.current!.getBoundingClientRect();
          section.current!.style.setProperty('--contact-x', `${event.clientX - bounds.left}px`);
          section.current!.style.setProperty('--contact-y', `${event.clientY - bounds.top}px`);
          const wordBounds = word.current!.getBoundingClientRect();
          word.current!.querySelectorAll<HTMLElement>('[data-contact-letter]').forEach(letter => {
            const center = letter.offsetLeft + letter.offsetWidth / 2;
            const distance = (event.clientX - wordBounds.left - center) / wordBounds.width;
            const lift = Math.exp(-distance * distance * 28);
            letter.style.transform = `translateY(${-lift * 24}px) rotate(${distance * lift * 18}deg)`;
          });
        }}
        onPointerEnter={event => {
          if (event.pointerType === 'mouse') section.current!.dataset.engaged = 'true';
        }}
        onPointerLeave={resetLetters}
        onBlur={resetLetters}>
        <span ref={word} className="contact-word" aria-hidden="true">{[...'Hallo.'].map((letter, index) => <span data-contact-letter className={letter === '.' ? 'contact-letter contact-stop' : 'contact-letter'} key={index}>{letter}</span>)}</span>
        <svg className="finale-arrow" viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M18 82 82 18M18 18h64v64" vectorEffect="non-scaling-stroke"/></svg>
      </a></h2>
      <div className="contact-details">
        <a className="finale-email" href="mailto:thimofej@yesterday-ai.de">thimofej@yesterday-ai.de</a>
        <div className="oh-social"><a href="https://github.com/thimorrow">GitHub <span aria-hidden="true">↗</span></a><a href="https://x.com/thimorrowr">X <span aria-hidden="true">↗</span></a></div>
      </div>
      <footer className="contact-footer"><span>© 2026 Thimofej Zapko</span><a href="#anfang">Zurück nach oben <span aria-hidden="true">↑</span></a></footer>
    </div>
  </section>;
}
