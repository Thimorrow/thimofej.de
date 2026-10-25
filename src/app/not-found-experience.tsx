'use client';

import { useCallback, useEffect, useRef, type CSSProperties, type PointerEvent } from 'react';
import Link from 'next/link';
import { motion, useSpring, useTransform } from 'motion/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import styles from './not-found.module.css';

type ErrorCopy = {
  label: string;
  firstLine: string;
  secondLine: string;
  home: string;
  homeHref: string;
};

const resting = { x: 13, y: -24, z: -14, lift: -15 };
const spring = { stiffness: 190, damping: 24, mass: .8, restDelta: .001, restSpeed: .01 };
const layers = Array.from({ length: 13 }, (_, index) => index);

export default function NotFoundExperience({ text }: { text: ErrorCopy }) {
  const reduced = useReducedMotion();
  const recovery = useRef({ hovered: false, focused: false });
  const tiltX = useSpring(resting.x, spring);
  const tiltY = useSpring(resting.y, spring);
  const tiltZ = useSpring(resting.z, spring);
  const lift = useSpring(resting.lift, spring);
  const trackAngle = useTransform(tiltZ, [resting.z, 0], [-26, -10]);
  const leftTilt = useTransform(tiltY, value => (value - resting.y) * -.055);
  const rightTilt = useTransform(tiltX, value => (value - resting.x) * .07);

  const settle = useCallback(() => {
    tiltX.set(resting.x);
    tiltY.set(resting.y);
    tiltZ.set(resting.z);
    lift.set(resting.lift);
  }, [tiltX, tiltY, tiltZ, lift]);

  useEffect(() => {
    if (!reduced) return;
    tiltX.jump(resting.x);
    tiltY.jump(resting.y);
    tiltZ.jump(resting.z);
    lift.jump(resting.lift);
  }, [reduced, tiltX, tiltY, tiltZ, lift]);

  const assemble = () => {
    if (reduced) return;
    tiltX.set(0);
    tiltY.set(0);
    tiltZ.set(0);
    lift.set(0);
  };

  const returnToRest = () => {
    if (!reduced && !recovery.current.focused && !recovery.current.hovered) settle();
  };

  const followPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType !== 'mouse' || recovery.current.focused || recovery.current.hovered || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    tiltX.set(resting.x - y * 8);
    tiltY.set(resting.y + x * 13);
    tiltZ.set(resting.z + x * 3);
    lift.set(resting.lift - y * 5);
  };

  return (
    <main className={styles.main} data-motion={reduced ? 'reduced' : 'active'}>
      <div className={styles.art} aria-hidden="true" onPointerMove={followPointer} onPointerLeave={returnToRest} onPointerCancel={returnToRest}>
        <div className={styles.digits}>
          <motion.span className={styles.four} style={{ rotateZ: reduced ? 0 : leftTilt }}>4</motion.span>
          <span className={styles.middle}>
            <span className={styles.zeroMeasure}>0</span>
            <motion.svg className={`${styles.orbit} ${styles.orbitBack}`} viewBox="0 0 420 220" fill="none" style={{ x: '-50%', y: '-50%', rotateZ: reduced ? -26 : trackAngle }}>
              <path d="M13 110a197 58 0 0 1 394 0" />
            </motion.svg>
            <motion.span className={styles.zeroObject} style={{ rotateX: reduced ? resting.x : tiltX, rotateY: reduced ? resting.y : tiltY, rotateZ: reduced ? resting.z : tiltZ, y: reduced ? resting.lift : lift }}>
              {layers.map(depth => <span key={depth} className={styles.depthLayer} style={{ '--depth': depth } as CSSProperties}>0</span>)}
              <span className={styles.zeroFace}>0</span>
              <span className={styles.zeroRim}>0</span>
            </motion.span>
            <motion.svg className={`${styles.orbit} ${styles.orbitFront}`} viewBox="0 0 420 220" fill="none" style={{ x: '-50%', y: '-50%', rotateZ: reduced ? -26 : trackAngle }}>
              <path d="M407 110a197 58 0 0 1-394 0" />
              <circle className={styles.satellite} cx="352" cy="150" r="5.5" />
            </motion.svg>
          </span>
          <motion.span className={styles.lastFour} style={{ rotateZ: reduced ? 0 : rightTilt }}>4</motion.span>
        </div>
      </div>
      <div className={styles.messageRow}>
        <div className={styles.message}>
          <p className={styles.label}>{text.label}</p>
          <h1>{text.firstLine}<br /><span>{text.secondLine}</span></h1>
        </div>
        <Link
          className={styles.home}
          href={text.homeHref}
          onPointerEnter={event => { if (event.pointerType === 'mouse') { recovery.current.hovered = true; assemble(); } }}
          onPointerLeave={() => { recovery.current.hovered = false; returnToRest(); }}
          onFocus={() => { recovery.current.focused = true; assemble(); }}
          onBlur={() => { recovery.current.focused = false; returnToRest(); }}
        >
          <svg className={styles.homeArrow} viewBox="0 0 72 48" fill="none" aria-hidden="true">
            <path className={styles.homeArrowPath} d="M64 35H32c-12 0-20-8-20-20V9m0 0L3 18M12 9l9 9" />
          </svg>
          <span className={styles.homeLabel}>{text.home}</span>
        </Link>
      </div>
    </main>
  );
}
