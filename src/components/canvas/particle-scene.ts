import { CatmullRomCurve3, Color, Object3D, PerspectiveCamera, Vector3 } from "three";
import gsap from "gsap";
import { scrollProgress } from "@/lib/scrollProgress";
import { audio } from "@/lib/audio";
import {
  onIntroDone, markWorldReady, skipFlight, onReplay, emitArrive,
  emitFlightStart, onFlightSkip, FLIGHT_SEGS, FLIGHT_TOTAL,
} from "@/lib/intro";
import type { ParticleWorld } from "./particle-world";

/** Camera math and choreography stay independent of the GPU renderer. */
export function createParticleScene(world: ParticleWorld, lowEnd: boolean) {
  let disposed = false;
  let drawCount = world.count;
  const camera = new PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 0, 16);
  const object = new Object3D();
  const size = { width: 1, height: 1 };
  const particleUniforms = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uIntroAmt: { value: 1 }, // 1 = show the static world, 0 = show the scroll forms
    uU: { value: 0 }, // the flight parameter, drives per-scene reveal
    uMouse: { value: new Vector3(999, 999, 0) },
    uMouseActive: { value: 0 },
    uSize: { value: lowEnd ? 18 : 22 },
    uColorA: { value: new Color("#dbf1ff") },
    uColorB: { value: new Color("#21e6ff") },
    uOpacity: { value: 0.95 },
  };

  // Cinematic intro state. `u` (0..1) drives the camera along its flight; `amt`
  // crossfades the static world -> scroll forms at the very end.
  const intro = { active: false, u: 0, amt: 1 };
  let introTl: gsap.core.Timeline | null = null;
  const TWO_PI = Math.PI * 2;
  const morphState = { v: 0 };
  let lockArmed = false;
  let lastHoverSound = 0;
  let camRoll = 0;
  const LOCK_NOTES = [196, 220, 247, 294, 330, 392];
  const BASE_SIZE = lowEnd ? 18 : 22;

  // Cuts a running flight straight to the hero (scroll past the threshold, or the
  // skip button). Everything it touches is scene state, so both callers share it.
  function cutFlightToHero() {
    if (!intro.active) return;
    introTl?.kill();
    intro.active = false;
    intro.amt = 0;
    intro.u = 1;
    particleUniforms.uSize.value = BASE_SIZE;
    drawCount = world.heroCount;
    document.documentElement.classList.remove("intro-flying");
    emitArrive();
    markWorldReady();
  }

  // The camera's continuous zoom through the static world. 9 control points -> 8
  // segments; scene beats land on the EVEN indices (u = 0,.25,.5,.75,1) and the
  // ODD indices shape the curve. The path: take in the whole solar system (Saturn
  // included) -> rise UP and OVER Saturn's horizon -> descend to the canyon mouth
  // of the city boulevard -> fly DOWN the boulevard between the towers -> out the
  // far end, along the lamp-lit street to the small house -> up to its lit window
  // -> through, into the room -> swing to the front of the TZ -> hero. The camera
  // only ever moves forward / around.
  const CAM_PATH = new CatmullRomCurve3(
    [
      new Vector3(0, 1.6, 52), // 0 solar system (Saturn in view)
      new Vector3(3.5, 3.2, 41), // 1 climb toward Saturn
      new Vector3(5.0, 5.0, 34), // 2 OVER Saturn's horizon
      new Vector3(0.8, 1.9, 30), // 3 descend, lining up on the boulevard
      new Vector3(0, -1.3, 26), // 4 canyon mouth, low: rooflines vs. sky
      new Vector3(0, -0.9, 15.2), // 5 down the boulevard, out the far end
      new Vector3(0, 0.15, 7), // 6 up to the lit window (== orbit start)
      new Vector3(2.6, 0.2, 3.2), // 7 (curve shaping; orbit takes over here)
      new Vector3(0, 0, 4.2), // 8 hero front
    ],
    false,
    "centripetal",
  );
  const LOOK_PATH = new CatmullRomCurve3(
    [
      new Vector3(1.0, 0.3, 40), // 0 the system
      new Vector3(4.5, 1.2, 33), // 1 Saturn
      new Vector3(3.0, -0.5, 25), // 2 over Saturn, toward the far side
      new Vector3(0, -0.9, 21), // 3 down into the streets ahead
      new Vector3(0, 0.2, 12), // 4 slightly UP the boulevard: skyline vs. sky
      new Vector3(0, 0.0, 4.6), // 5 the lit window of the house
      new Vector3(0, 0, 0), // 6 room / TZ (== orbit look target, origin)
      new Vector3(0, 0, 0), // 7 TZ
      new Vector3(0, 0, 0), // 8 hero TZ at origin
    ],
    false,
    "centripetal",
  );
  const _camPos = new Vector3();
  const _lookPos = new Vector3();
  const _tan = new Vector3();


  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Returning visitors / reduced motion: no flight, jump straight to the hero.
  const jumpToHero = () => {
    intro.active = false;
    intro.amt = 0;
    intro.u = 1;
    particleUniforms.uU.value = 1;
    particleUniforms.uSize.value = BASE_SIZE;
    document.documentElement.classList.remove("intro-flying");
    drawCount = world.heroCount;
  };

  // The cinematic camera flight. Re-runnable: the replay button calls it again.
  const startFlight = () => {
    if (disposed) return;
    introTl?.kill();
    intro.u = 0;
    intro.amt = 1;
    intro.active = true;
    document.documentElement.classList.add("intro-flying");
    emitFlightStart();
    audio.flight();
    particleUniforms.uSize.value = lowEnd ? 30 : 42;
    drawCount = world.count;
    introTl = gsap.timeline({
      onComplete: () => {
        intro.active = false;
        document.documentElement.classList.remove("intro-flying");
        emitArrive();
        audio.arrival();
      },
    });

    // ONE even, gently-eased glide — the camera accelerates away from a scene
    // and eases into the next at a steady pace, only ever slowing at a scene,
    // never stopping, never lurching. All motion is the camera; world is rigid.
    // Segment durations live in FLIGHT_SEGS (shared with the caption overlay).
    introTl.to(
      intro,
      {
        keyframes: [
          { u: 0.25, duration: FLIGHT_SEGS[0], ease: "sine.inOut" }, // system -> over Saturn
          { u: 0.5, duration: FLIGHT_SEGS[1], ease: "sine.inOut" }, // -> city
          { u: 0.75, duration: FLIGHT_SEGS[2], ease: "sine.inOut" }, // -> house window
          { u: 1, duration: FLIGHT_SEGS[3], ease: "sine.inOut" }, // through, orbit, hero
        ],
      },
      0,
    );

    // Swoosh at each segment's MIDPOINT, where the camera moves fastest.
    introTl.add(() => audio.transition(), FLIGHT_SEGS[0] / 2);
    introTl.add(() => audio.transition(), FLIGHT_SEGS[0] + FLIGHT_SEGS[1] / 2);
    introTl.add(
      () => audio.transition(),
      FLIGHT_SEGS[0] + FLIGHT_SEGS[1] + FLIGHT_SEGS[2] / 2,
    );

    // Resolve: crossfade to the scroll forms, ease the pixels back to the hero
    // size, then drop the (already faded) world particles for the scroll phase.
    introTl
      .to(intro, { amt: 0, duration: 1.2, ease: "power2.in" }, FLIGHT_TOTAL - 0.8)
      .to(
        particleUniforms.uSize,
        { value: BASE_SIZE, duration: 2.4, ease: "power2.inOut" },
        FLIGHT_TOTAL - 3.0,
      );
    introTl.add(() => drawCount = world.heroCount, FLIGHT_TOTAL + 0.1);
  };

  const unsubIntro = onIntroDone(() => {
    if (disposed) return;
    if (reduce || skipFlight()) {
      jumpToHero();
      markWorldReady();
      return;
    }
    startFlight();
  });
  const unsubReplay = onReplay(() => startFlight());
  const unsubSkip = onFlightSkip(cutFlightToHero);

  const tmp = new Vector3();
  const onMove = (e: MouseEvent) => {
    const ndcx = (e.clientX / window.innerWidth) * 2 - 1;
    const ndcy = -(e.clientY / window.innerHeight) * 2 + 1;
    tmp.set(ndcx, ndcy, 0.5).unproject(camera);
    tmp.sub(camera.position).normalize();
    const dist = -camera.position.z / tmp.z;
    const world = particleUniforms.uMouse.value
      .copy(camera.position)
      .add(tmp.multiplyScalar(dist));
    particleUniforms.uMouseActive.value = 1;
    const near = world.x * world.x + world.y * world.y < 2.6;
    const now = performance.now();
    if (!intro.active && near && now - lastHoverSound > 120) {
      lastHoverSound = now;
      const heightT = Math.min(Math.max((world.y + 1.8) / 3.6, 0), 1);
      audio.hoverParticle(150 + heightT * 520);
    }
  };
  window.addEventListener("mousemove", onMove);
  const detach = () => {
    unsubIntro();
    unsubReplay();
    unsubSkip();
    introTl?.kill();
    intro.active = false;
    document.documentElement.classList.remove("intro-flying");
    particleUniforms.uSize.value = BASE_SIZE;
    window.removeEventListener("mousemove", onMove);
  };

  function update(delta: number) {
    const cam = camera;
    const portrait = size.width < 600;
    const heroDistance = 4.2 * Math.max(1, size.height / size.width);
    const d = Math.min(delta, 0.05);
    particleUniforms.uTime.value += d;

    // Scrolling cuts the cinematic short and hands straight to scroll.
    if (intro.active && scrollProgress.progress > 0.02) {
      cutFlightToHero();
    }

    particleUniforms.uIntroAmt.value = intro.amt;
    particleUniforms.uU.value = intro.u;

    const raw = Math.min(Math.max(scrollProgress.morphTarget, 0), 5);
    const seg = Math.min(Math.floor(raw), 4);
    const frac = raw - seg;
    const HOLD = 0.2;
    let f;
    if (frac < HOLD) f = 0;
    else if (frac > 1 - HOLD) f = 1;
    else {
      const tt = (frac - HOLD) / (1 - 2 * HOLD);
      f = tt * tt * (3 - 2 * tt);
    }
    morphState.v += (seg + f - morphState.v) * 0.045;
    const morph = morphState.v;
    particleUniforms.uMorph.value = morph;

    const fd = Math.min(Math.max((Math.abs(morph - Math.round(morph)) - 0.06) / 0.28, 0), 1);
    const crisp = 1 - fd * fd * (3 - 2 * fd);
    if (!intro.active && crisp > 0.92 && lockArmed) {
      lockArmed = false;
      audio.lock(LOCK_NOTES[Math.min(Math.max(Math.round(morph), 0), 5)]);
    } else if (crisp < 0.5) {
      lockArmed = true;
    }

    const p = object;
    if (p) {
      const t = particleUniforms.uTime.value;
      if (intro.active) {
        // The world is rigid; the camera is the only thing that moves.
        const u = Math.min(Math.max(intro.u, 0), 1);
        if (u <= 0.75) {
          // zoom through the world along the path, aimed at the scene ahead,
          // with a slight bank in the turns
          CAM_PATH.getPoint(u, _camPos);
          LOOK_PATH.getPoint(u, _lookPos);
          cam.position.copy(_camPos);
          cam.lookAt(_lookPos);
          CAM_PATH.getTangent(u, _tan);
          const rollTarget = Math.min(Math.max(-_tan.x * 0.4, -0.14), 0.14);
          camRoll += (rollTarget - camRoll) * 0.06;
          cam.rotateZ(camRoll);
        } else {
          // a real full 360° around the TZ, spiralling inward to the hero shot.
          // Starts at the window pose (matches path point 6) and ends dead front.
          const o = (u - 0.75) / 0.25; // 0..1
          const R = 7 + (heroDistance - 7) * o;
          const ang = o * TWO_PI;
          cam.position.set(R * Math.sin(ang), 0.15 * (1 - o), R * Math.cos(ang));
          cam.lookAt(0, 0, 0);
          camRoll += (0 - camRoll) * 0.06;
          cam.rotateZ(camRoll);
        }
        p.position.set(0, 0, 0);
        p.rotation.set(0, 0, 0);
      } else {
        p.rotation.y += d * 0.3 * (1 - crisp);
        p.rotation.y += (Math.sin(t * 0.4) * 0.14 - p.rotation.y) * 0.04 * crisp;
        p.rotation.y -= TWO_PI * Math.round(p.rotation.y / TWO_PI);
        p.rotation.x += (0 - p.rotation.x) * 0.05;
        cam.position.x += (0 - cam.position.x) * 0.06;
        cam.position.y += (0 - cam.position.y) * 0.06;
        cam.position.z += (heroDistance - cam.position.z) * 0.05;
        cam.rotation.x += (0 - cam.rotation.x) * 0.06;
        cam.rotation.y += (0 - cam.rotation.y) * 0.06;
        cam.rotation.z += (0 - cam.rotation.z) * 0.06;
        p.position.x = Math.sin(morph * Math.PI) * 0.38 * (1 - crisp);
        const w0 = Math.max(0, 1 - Math.abs(morph));
        // ease (don't snap) to the hero height — the intro ends with the TZ
        // centred (y=0); the hero wants it lifted (y=0.5) to leave room for the
        // text. Easing makes that a glide instead of a jump at the handoff.
        const heroHeight = portrait ? 1.65 : size.width < size.height ? 1.05 : 0.5;
        const targetY = w0 * heroHeight + Math.sin(t * 0.5) * 0.05;
        p.position.y += (targetY - p.position.y) * 0.04;
      }
    }
    object.updateMatrixWorld();
    camera.updateMatrixWorld();
  }

  return {
    world, camera, object, uniforms: particleUniforms, intro,
    get drawCount() { return drawCount; },
    resize(width: number, height: number) {
      size.width = width;
      size.height = height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    },
    update,
    dispose() {
      if (disposed) return;
      disposed = true;
      detach();
    },
  };
}

export type ParticleScene = ReturnType<typeof createParticleScene>;
