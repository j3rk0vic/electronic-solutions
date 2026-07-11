/**
 * motion.ts — the signature layer.
 *
 *  • Theme morph: global scroll progress lerps every CSS token from the GREEN
 *    (vrt) palette to the RED (dom) palette, concentrated in the middle third.
 *  • ScrollSmoother: weighted, buttery smooth scroll (+ orb parallax).
 *  • SplitText: hero headline reveals line-by-line on load.
 *  • Scroll reveals: staggered section/card/stat entrances.
 *  • Nav: Vrt⇄Dom toggle smooth-scrolls and stays in sync with the active world.
 *  • Magnetic CTAs.
 *
 * prefers-reduced-motion: no smooth-scroll hijack, no ambient loops, no heavy
 * reveals, no SplitText. The theme still tints to scroll position (a gentle
 * color interpolation, not vestibular motion) and the toggle still works.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Only the home page morphs green→red. Standalone pages pin a palette via
 * :root[data-theme] in global.css, so JS must not write inline tokens over it.
 */
const morphs = (document.documentElement.dataset.theme ?? 'morph') === 'morph';

/* ── theme palettes ─────────────────────────────────────────────────── */
type Palette = Record<'bg' | 'surface' | 'text' | 'muted' | 'accent' | 'ink', [number, number, number]>;

const GREEN: Palette = {
  bg: [8, 19, 12],
  surface: [14, 32, 21],
  text: [238, 245, 236],
  muted: [150, 178, 150],
  accent: [108, 226, 76],
  ink: [6, 16, 8],
};
const RED: Palette = {
  bg: [20, 8, 7],
  surface: [33, 17, 16],
  text: [245, 234, 231],
  muted: [186, 150, 146],
  accent: [226, 74, 44],
  ink: [22, 6, 4],
};

const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
const rgb = (c: number[]) => `rgb(${c[0]},${c[1]},${c[2]})`;
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

const root = document.documentElement.style;

/** Paint the live tokens for a raw scroll progress p ∈ [0,1]. */
function applyTheme(p: number) {
  // Transition concentrated in the middle third of the page.
  const t = smoothstep(0.2, 0.8, p);
  const mix = (k: keyof Palette) => GREEN[k].map((v, i) => lerp(v, RED[k][i], t));
  root.setProperty('--bg', rgb(mix('bg')));
  root.setProperty('--surface', rgb(mix('surface')));
  root.setProperty('--text', rgb(mix('text')));
  root.setProperty('--muted', rgb(mix('muted')));
  root.setProperty('--accent', rgb(mix('accent')));
  root.setProperty('--accent-ink', rgb(mix('ink')));
  const b = mix('text');
  root.setProperty('--border', `rgba(${b[0]},${b[1]},${b[2]},0.12)`);
  // Drive the nav logo cross-fade (green ↔ red) from the same morph factor.
  root.setProperty('--t-morph', String(t));
}

/* ── nav: toggle + smooth anchor scrolling ──────────────────────────── */
function setupNav() {
  // ScrollSmoother owns scrolling via a transform on a fixed wrapper, so native
  // scrollIntoView/scrollTo desync on tall pages — use its own scrollTo. Reduced
  // motion has no smoother, so fall back to native scrollIntoView (instant jump).
  const scrollToId = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    const smoother = ScrollSmoother.get();
    if (smoother) smoother.scrollTo(target, true, 'top 88px');
    else target.scrollIntoView({ block: 'start' });
  };

  document.querySelectorAll<HTMLElement>('[data-scroll-to]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const id = el.dataset.scrollTo!;
      if (!document.getElementById(id)) return;
      e.preventDefault();
      scrollToId(id);
    });
  });

  // Other scripts (e.g. the shop dialog's "Pošalji upit") ask us to scroll.
  window.addEventListener('es:scrollto', (e) => scrollToId((e as CustomEvent<string>).detail));

  // Content that changes height at runtime (e.g. the shop category filter) must
  // ask ScrollSmoother to re-measure, or its scroll range keeps the old height
  // and leaves empty space below. No-op in reduced mode (no smoother).
  window.addEventListener('es:refresh', () => ScrollTrigger.refresh());

  setupMobileMenu();
}

/* ── mobile hamburger menu (≤860px) ──────────────────────────────────── */
function setupMobileMenu() {
  const nav = document.querySelector<HTMLElement>('.nav');
  const burger = document.querySelector<HTMLButtonElement>('[data-nav-burger]');
  const panel = document.querySelector<HTMLElement>('[data-nav-panel]');
  if (!nav || !burger || !panel) return;

  const setOpen = (open: boolean) => {
    nav.classList.toggle('is-menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zatvori izbornik' : 'Otvori izbornik');
    if (open) panel.querySelector<HTMLElement>('a')?.focus();
  };

  burger.addEventListener('click', () => setOpen(!nav.classList.contains('is-menu-open')));

  // Any link closes the menu (scroll links also trigger their own handler).
  panel.querySelectorAll<HTMLElement>('[data-nav-panel-link]').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-menu-open')) {
      setOpen(false);
      burger.focus();
    }
  });
}

/** Toggle the [aria-pressed] / active state of the Vrt/Dom pills. */
function setActiveWorld(world: 'vrt' | 'dom') {
  document.querySelectorAll<HTMLElement>('[data-world-btn]').forEach((btn) => {
    const on = btn.dataset.worldBtn === world;
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
  });
}

/* ── magnetic hover for CTAs ─────────────────────────────────────────── */
function setupMagnetic() {
  document.querySelectorAll<HTMLElement>('.magnetic').forEach((el) => {
    const strength = 0.35;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      gsap.to(el, { x, y, duration: 0.4, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' });
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   REDUCED MOTION — minimal, static, but keep identity (color + toggle).
   ═══════════════════════════════════════════════════════════════════════ */
function initReduced() {
  const dom = document.getElementById('dom');
  if (morphs && dom) {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      applyTheme(max > 0 ? window.scrollY / max : 0);
      // Dom active once its top crosses 55% of the viewport, and for everything below.
      setActiveWorld(dom.getBoundingClientRect().top <= window.innerHeight * 0.55 ? 'dom' : 'vrt');
    };
    window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
    onScroll();
  }
  setupNav();
}

/* ═══════════════════════════════════════════════════════════════════════
   FULL MOTION
   ═══════════════════════════════════════════════════════════════════════ */
function initFull() {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

  ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 1.15,
    effects: true, // enables data-speed parallax (orbs / images)
    normalizeScroll: true,
  });

  // Theme morph driven by the smoothed scroll position (home page only).
  if (morphs) {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => applyTheme(self.progress),
      onRefresh: (self) => applyTheme(self.progress),
    });
    applyTheme(0);
  }

  setupNav();
  setupMagnetic();

  // Toggle follows the active world: Dom once its heading crosses mid-screen,
  // and stays Dom for everything below it (tv / value / contact); back to Vrt
  // only when scrolling above the Dom section again. Standalone pages have no
  // #dom section and render plain links instead of the toggle.
  if (document.getElementById('dom')) {
    ScrollTrigger.create({
      trigger: '#dom',
      start: 'top 55%',
      onEnter: () => setActiveWorld('dom'),
      onLeaveBack: () => setActiveWorld('vrt'),
    });
  }

  // Arriving from another page with a hash (e.g. /trgovina → /#vrt): the native
  // jump happens before ScrollSmoother exists, so re-seek once it's measured.
  if (location.hash) {
    const target = document.querySelector<HTMLElement>(location.hash);
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }

  // Generic scroll reveals (skip hero — it has its own intro).
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    if (el.closest('[data-hero]')) return;
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // Staggered reveals for grouped items (cards / stats / brands).
  gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
    const items = group.querySelectorAll<HTMLElement>('[data-reveal-item]');
    gsap.set(items, { opacity: 0, y: 34 });
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.09,
      scrollTrigger: { trigger: group, start: 'top 82%' },
    });
  });

  // Clip-path reveal for framed/lifestyle images.
  gsap.utils.toArray<HTMLElement>('[data-clip-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: 'inset(0 0 100% 0)' },
      {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      }
    );
  });

  // ── hero intro (after fonts so SplitText measures lines correctly) ──
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const runHeroIntro = () => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    const h1 = hero?.querySelector<HTMLElement>('[data-hero-title]');
    if (h1) {
      const split = new SplitText(h1, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
      gsap.set(split.lines, { yPercent: 110 });
      tl.to(split.lines, { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.1);
    }
    tl.to(
      hero?.querySelectorAll('[data-reveal]') ?? [],
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1 },
      0.45
    );
  };
  if (hero) {
    if (document.fonts?.ready) document.fonts.ready.then(runHeroIntro);
    else runHeroIntro();
  }

  // Recalculate once everything (images/fonts) settles.
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* ── boot ────────────────────────────────────────────────────────────── */
if (reduce) initReduced();
else initFull();
