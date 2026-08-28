/**
 * motion.ts — the signature layer.
 *
 *  • Theme morph: global scroll progress lerps every CSS token from the GREEN
 *    (vrt) palette to the RED (dom) palette, concentrated in the middle third.
 *  • ScrollSmoother: weighted, buttery smooth scroll (+ orb / heading parallax).
 *  • SplitText: hero headline reveals line-by-line on load.
 *  • Scroll reveals: staggered section/card/stat entrances.
 *  • Nav: Vrt⇄Dom toggle smooth-scrolls and stays in sync with the active world.
 *  • Magnetic CTAs.
 *
 * View Transitions: the site uses Astro's <ClientRouter>, so navigations swap
 * the DOM in place without a full reload. This module therefore (re)builds all
 * page-scoped motion on `astro:page-load` and tears it down on
 * `astro:before-swap` — killing ScrollSmoother, disposing ScrollTriggers, and
 * clearing the inline theme tokens so the next page's pinned palette isn't
 * shadowed by leftovers from a morph page. Window/document-level wiring is
 * bound once (see wireGlobalsOnce).
 *
 * prefers-reduced-motion: no smooth-scroll hijack, no ambient loops, no heavy
 * reveals, no SplitText. The theme still tints to scroll position (a gentle
 * color interpolation, not vestibular motion) and the toggle still works.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Shared motion rhythm — the JS-side mirror of the CSS motion tokens in
   global.css. Keeping reveals in one place means every entrance across the
   site shares the same duration, easing and stagger cadence. Stagger sits at
   the snappy end of the 30–50ms guidance so grids resolve quickly. */
const ENTER = { dur: 0.7, ease: 'power3.out', stagger: 0.05 } as const;

/** Is the *current* page the morphing home page? Recomputed each navigation:
 *  standalone pages pin a palette via :root[data-theme] in global.css, so JS
 *  must not write inline tokens over them. */
const pageMorphs = () => (document.documentElement.dataset.theme ?? 'morph') === 'morph';

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
const THEME_VARS = ['--bg', '--surface', '--text', '--muted', '--accent', '--accent-ink', '--border', '--t-morph'];

/** Paint the live tokens for a raw scroll progress p ∈ [0,1] across the seam. */
function applyTheme(p: number) {
  // p already covers just the Vrt→Dom handover band (see the ScrollTrigger
  // below), so ease across the whole of it — the band's shortness is what
  // makes the flip decisive, not a narrow sub-range inside it.
  const t = smoothstep(0, 1, p);
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

/** Remove any inline theme tokens so a pinned destination page (data-theme=
 *  dom/vrt) paints from its stylesheet rules instead of a morph page's leftovers. */
function clearInlineTheme() {
  THEME_VARS.forEach((v) => root.removeProperty(v));
}

/* ── smooth scroll to an id (works with or without ScrollSmoother) ────── */
function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const smoother = ScrollSmoother.get();
  if (smoother) smoother.scrollTo(target, true, 'top 88px');
  else target.scrollIntoView({ block: 'start' });
}

/** Toggle the [aria-pressed] / active state of the Vrt/Dom pills. */
function setActiveWorld(world: 'vrt' | 'dom') {
  document.querySelectorAll<HTMLElement>('[data-world-btn]').forEach((btn) => {
    const on = btn.dataset.worldBtn === world;
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
  });
}

/* ── mobile hamburger menu open/close ────────────────────────────────── */
function setMenuOpen(open: boolean) {
  const nav = document.querySelector<HTMLElement>('.nav');
  const burger = document.querySelector<HTMLButtonElement>('[data-nav-burger]');
  const panel = document.querySelector<HTMLElement>('[data-nav-panel]');
  if (!nav || !burger || !panel) return;
  nav.classList.toggle('is-menu-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Zatvori izbornik' : 'Otvori izbornik');
  if (open) panel.querySelector<HTMLElement>('a')?.focus();
}

/* ═══════════════════════════════════════════════════════════════════════
   ONE-TIME GLOBAL WIRING — window/document listeners that must survive View
   Transitions (binding them per page would stack duplicates). They all query
   live DOM / ScrollSmoother.get() at call time, so they keep working as pages
   swap underneath them.
   ═══════════════════════════════════════════════════════════════════════ */
let globalsWired = false;
function wireGlobalsOnce() {
  if (globalsWired) return;
  globalsWired = true;

  // Other scripts (e.g. the shop dialog's "Pošalji upit") ask us to scroll.
  window.addEventListener('es:scrollto', (e) => scrollToId((e as CustomEvent<string>).detail));

  // Content that changes height at runtime (e.g. the shop filter) asks
  // ScrollSmoother to re-measure so no dead scroll space is left below.
  window.addEventListener('es:refresh', () => ScrollTrigger.refresh());

  // Escape closes the mobile menu (elements queried live each time).
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const nav = document.querySelector<HTMLElement>('.nav');
    if (nav?.classList.contains('is-menu-open')) {
      setMenuOpen(false);
      document.querySelector<HTMLButtonElement>('[data-nav-burger]')?.focus();
    }
  });
}

/* ── per-page nav wiring (elements are replaced on every navigation) ──── */
function setupNavPage() {
  document.querySelectorAll<HTMLElement>('[data-scroll-to]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const id = el.dataset.scrollTo!;
      if (!document.getElementById(id)) return;
      e.preventDefault();
      scrollToId(id);
    });
  });

  const burger = document.querySelector<HTMLButtonElement>('[data-nav-burger]');
  const nav = document.querySelector<HTMLElement>('.nav');
  burger?.addEventListener('click', () => setMenuOpen(!nav?.classList.contains('is-menu-open')));

  document.querySelectorAll<HTMLElement>('[data-nav-panel-link]').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
}

/* ── magnetic hover for CTAs (element listeners; die with the page) ───── */
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
   PER-PAGE LIFECYCLE
   ═══════════════════════════════════════════════════════════════════════ */
let split: SplitText | null = null; // kept so we can revert before a swap
let reducedScrollHandler: (() => void) | null = null;

/** Reduced-motion: minimal, static, but keep identity (color + toggle). */
function initReduced() {
  const dom = document.getElementById('dom');
  if (pageMorphs() && dom) {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      applyTheme(max > 0 ? window.scrollY / max : 0);
      // Dom active once its top crosses 55% of the viewport, and below.
      setActiveWorld(dom.getBoundingClientRect().top <= window.innerHeight * 0.55 ? 'dom' : 'vrt');
    };
    reducedScrollHandler = () => requestAnimationFrame(onScroll);
    window.addEventListener('scroll', reducedScrollHandler, { passive: true });
    onScroll();
  }
  setupNavPage();
}

/** Full motion path. */
function initFull() {
  // Defensive: never run two smoothers at once if a swap raced the teardown.
  ScrollSmoother.get()?.kill();
  ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 1.15,
    effects: true, // enables data-speed parallax (orbs / section headings)
    normalizeScroll: true,
  });

  // Theme morph, anchored to the Vrt→Dom seam (home page only). Driving this
  // off total page progress smeared green→red across most of the scroll, so it
  // never read as a boundary — just a slow drift. Tying it to #dom keeps Vrt
  // fully green, flips hard as the Dom heading comes up, and holds red below.
  if (pageMorphs()) {
    const seam = document.getElementById('dom');
    if (seam) {
      ScrollTrigger.create({
        trigger: seam,
        start: 'top 78%',
        end: 'top 42%',
        onUpdate: (self) => applyTheme(self.progress),
        onRefresh: (self) => applyTheme(self.progress),
      });
    }
    applyTheme(0);
  }

  setupNavPage();
  setupMagnetic();

  // Toggle follows the active world: Dom once its heading crosses mid-screen,
  // and stays Dom for everything below it; back to Vrt only when scrolling
  // above the Dom section again. Standalone pages have no #dom section.
  if (document.getElementById('dom')) {
    ScrollTrigger.create({
      trigger: '#dom',
      start: 'top 55%',
      onEnter: () => setActiveWorld('dom'),
      onLeaveBack: () => setActiveWorld('vrt'),
    });
  }

  // Arriving with a hash (e.g. /trgovina → /#vrt): re-seek once measured.
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
      duration: ENTER.dur,
      ease: ENTER.ease,
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // Staggered reveals for grouped items (cards / stats / brands).
  gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
    const items = group.querySelectorAll<HTMLElement>('[data-reveal-item]');
    gsap.set(items, { opacity: 0, y: 28 });
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: ENTER.dur,
      ease: ENTER.ease,
      stagger: ENTER.stagger,
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
    if (!document.body.contains(hero)) return; // page may have swapped away
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    const h1 = hero?.querySelector<HTMLElement>('[data-hero-title]');
    if (h1) {
      split = new SplitText(h1, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
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

  // Recalculate once the current view's images/fonts settle.
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

/** Build all page-scoped motion for the freshly-shown page. */
function initPage() {
  wireGlobalsOnce();
  if (reduce) initReduced();
  else initFull();
}

/** Dispose everything page-scoped so the next page starts from a clean slate. */
function teardown() {
  split?.revert();
  split = null;
  if (reducedScrollHandler) {
    window.removeEventListener('scroll', reducedScrollHandler);
    reducedScrollHandler = null;
  }
  ScrollTrigger.getAll().forEach((t) => t.kill());
  ScrollSmoother.get()?.kill();
  clearInlineTheme();
}

/* ── boot: driven by the View Transitions lifecycle ──────────────────────
   astro:page-load fires on the initial load AND after every navigation, so it
   is our single init entry point. astro:before-swap fires before the old DOM
   is replaced — the moment to tear ScrollSmoother down. */
document.addEventListener('astro:page-load', initPage);
document.addEventListener('astro:before-swap', teardown);
