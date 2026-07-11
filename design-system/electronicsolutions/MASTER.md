# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.
>
> **SOURCE OF TRUTH:** This file is derived from the actual implementation
> (`src/styles/global.css`, `src/scripts/motion.ts`, and the components). If code
> and this file ever disagree, the code wins — update this file to match.

---

**Project:** ElectronicSolutions — electronic-solution.hr
**Category:** Local retail & service marketing (garden power tools · climate & heating · TV)
**Format:** Single long-scroll, premium marketing site — Astro 5 static, Tailwind v4, GSAP.
**Signature:** The whole page continuously morphs from a **GREEN world (Vrt / EGO Power+)**
to a **RED world (Dom / klima & grijanje)** as the user scrolls. Every token — background,
text, accent, borders, nav logo — is driven from the same scroll progress, so the entire
UI shifts as one. Standalone pages (trgovina/servis/o-nama) pin one end of the scale.

---

## Global Rules

### Color — dual palette + live morph

The theme is **not** a single palette; it is a scroll-driven interpolation between two.
`motion.ts` lerps every token from GREEN→RED across the middle third of the page
(`smoothstep(0.2, 0.8, scrollProgress)`); standalone pages pin GREEN or RED via
`:root[data-theme]` in CSS (no JS token writes). **Dark mode is the only mode.**

| Token (CSS var) | GREEN world (vrt) | RED world (dom) | Role |
|-----------------|-------------------|-----------------|------|
| `--bg`          | `rgb(8,19,12)`    | `rgb(20,8,7)`   | Page background |
| `--surface`     | `rgb(14,32,21)`   | `rgb(33,17,16)` | Cards, inputs, nav pill |
| `--text`        | `rgb(238,245,236)`| `rgb(245,234,231)` | Primary text |
| `--muted`       | `rgb(150,178,150)`| `rgb(186,150,146)` | Secondary text, labels |
| `--accent`      | `rgb(108,226,76)` | `rgb(226,74,44)`| CTAs, kickers, prices, highlights |
| `--accent-ink`  | `rgb(6,16,8)`     | `rgb(22,6,4)`   | Text on an `--accent` fill |
| `--border`      | `rgba(text,0.12)` | `rgba(text,0.12)` | Hairline borders |
| `--t-morph`     | `0`               | `1`             | 0→1 morph factor (drives logo cross-fade) |

**Contrast (WCAG AA verified at both ends — all ≥4.5:1):**
text/bg 17.0 / 16.7 · muted/bg 8.2 / 7.4 · accent/bg 11.4 / 4.9 · ink/accent 11.6 / 4.9.
The red-world accent pairs sit closest to the line (~4.6–4.9) — keep accent text at these
values or better; do not darken `--accent` or lighten `--bg` in the red world.

### Typography

- **Display:** `Bricolage Grotesque` (weights 600, 800) — headlines, product/card titles, stats.
- **Body:** `Inter` (400, 500, 600) — paragraphs, blurbs, form fields.
- **Mono:** `Space Mono` (400, 700) — eyebrows, kickers, nav links, labels, prices, badges (uppercase, letter-spaced).
- **Mood:** premium, confident, industrial-but-warm, bilingual-Croatian.
- Loaded via Google Fonts with `display=swap` + preconnect (see `Layout.astro`).

**Fluid type scale (clamp tokens in `global.css`):**
`--text-eyebrow` `--text-display` (hero) `--text-h2` (sections) `--text-h3`. Body uses
`clamp()` per component. Line-height 1.5–1.7 for body; ~0.94–1.1 for display.

### Spacing & layout

- `.wrap`: `max-width: 1200px`, fluid `padding-inline: clamp(20px,5vw,32px)`.
- `.section`: `padding-block: clamp(80px,12vw,130px)`.
- Rhythm token scale: 4 / 8 / 16 / 24 / 32 / 48 / 64px.
- Radii: cards/tiles 12–22px; pills/CTAs 100px; inputs 12px.

### Shadows / elevation

- Cards rest: `0 18px 40px -28px rgba(0,0,0,.7)`.
- Card hover: `0 26px 55px -28px color-mix(--accent 55%, black)` (accent-tinted lift).
- CTA hover glow: `0 10–14px 26–30px -10px color-mix(--accent 70%, black)`.

---

## Motion System

One rhythm for the whole site. CSS tokens live in `global.css`; the JS mirror is `ENTER`
in `motion.ts`. **All motion is GPU-only (transform/opacity), 150–300ms band, and every
rule has a `prefers-reduced-motion` off-switch.**

| Token | Value | Use |
|-------|-------|-----|
| `--ease-out` | `cubic-bezier(0.2,0.7,0.2,1)` | entrances, hovers, expands |
| `--ease-in`  | `cubic-bezier(0.5,0,0.75,0)`  | exits, collapses |
| `--ease-spring` | `cubic-bezier(0.34,1.56,0.64,1)` | press/pop feedback |
| `--dur-fast` | `0.16s` | color/opacity micro-changes |
| `--dur-mid`  | `0.24s` | standard hover + state |
| `--dur-slow` | `0.34s` | larger surface transitions |
| `--dur-exit` | `0.18s` | exits (~70% of enter) |
| `--lift`     | `-6px`  | shared hover-lift distance |

**Reusable utilities (global.css):** `.press` (active scale 0.97), `.u-underline`
(left-wipe underline), `.u-lift` (surface hover-lift).

**Signature behaviours (motion.ts, GSAP):**
- **Theme morph** — ScrollTrigger drives `applyTheme(progress)` on the home page.
- **ScrollSmoother** — weighted smooth scroll (`smooth: 1.15`), `effects: true` enables `data-speed` parallax.
- **Parallax** — ambient fixed orbs + world-heading blocks (`data-speed="0.94"`) drift subtly.
- **Reveals** — `[data-reveal]` (rise+fade), `[data-reveal-group]/[data-reveal-item]` (stagger 0.05s), `[data-clip-reveal]` (clip-path wipe). Enter dur 0.7s, `power3.out`.
- **Hero intro** — SplitText line-mask reveal after `document.fonts.ready`.
- **Magnetic CTAs** — `.magnetic` elements ease toward the cursor (do NOT also put `.press` on these — transform conflict).
- **View Transitions** — `<ClientRouter />` in `Layout`; the nav carries `transition:name="site-nav"`. `motion.ts` rebuilds all page-scoped motion on `astro:page-load` and tears ScrollSmoother down + clears inline theme tokens on `astro:before-swap`.

---

## Component Specs (as built)

- **Buttons / CTAs** — mono, uppercase, letter-spaced, pill (`border-radius:100px`).
  Primary = `--accent` fill + `--accent-ink` text + hover glow. Outline = `--accent` border,
  fills on hover. Non-magnetic buttons take `:active { transform: scale(0.95–0.97) }`.
- **Cards** (`ProductCard`, `ShopItem`, `InfoGrid`) — `--surface` @ ~72%, 1px `--border`,
  radius 20px. Hover: lift `-8px` + `--accent` border + accent shadow; the framed product
  image scales `1.06` **inside** an `overflow:hidden` tile (no layout shift).
- **Product tile** — 4:5, radial white background so transparent and white-bg product shots
  read identically.
- **Nav** — fixed, `backdrop-filter: blur(12px)`, hairline bottom border. Logo cross-fades
  green↔red via `--t-morph`. Links: mono uppercase + left-wipe underline on hover/focus.
  Vrt⇄Dom toggle on home; plain links elsewhere. Hamburger + full-screen panel ≤860px.
- **Inputs** (`ContactForm`) — `--surface` @70%, radius 12px; focus = `--accent` border +
  3px soft accent ring. Disabled = opacity ~0.45 + `not-allowed`. Status via `aria-live`.
- **Dialog** (shop) — native `<dialog>` (top layer, focus-trap, Esc) + `@starting-style`
  enter/exit + blurred `::backdrop`.
- **Filter chips** — pill, `--muted`→`--text` on hover, `--accent` fill when active, press scale.

---

## Anti-Patterns (Do NOT Use)

- ❌ **Light mode** — the site is dark-only; both worlds are dark.
- ❌ **Writing inline theme tokens on a pinned page** — `data-theme=vrt/dom` pages read the
  palette from CSS; JS must not set `--bg` etc. on them (and must clear them on VT teardown).
- ❌ **Emojis as icons** — use inline SVG (the existing stroke style).
- ❌ **Layout-shifting hovers** — scale images *inside* clipped tiles; never move surrounding content.
- ❌ **Instant state changes** — every hover/state uses a `--dur-*` transition (150–300ms).
- ❌ **Invisible focus** — keep the global `:focus-visible` accent outline.
- ❌ **Animating width/height/top/left** — transform/opacity only.
- ❌ **`.press` on `.magnetic` elements** — the transforms fight.
- ❌ **Raw hex in components** — consume the semantic `--*` tokens so the morph tracks.

---

## Responsive Breakpoints

Systematic: **375 / 768 / 1024 / 1440**. Verified: no horizontal scroll at any width.
- Nav → hamburger at **≤860px**.
- World grid 3→2→1 at 1080 / 900 / 520; shop grid 4→3→2→1 at 1080 / 760 / 440.
- Form rows stack ≤620px; info grid ≤760px; footer columns ≤860px; dialog stacks ≤720px.

---

## Pre-Delivery Checklist

- [ ] Tokens consumed via `var(--*)` so the green→red morph tracks (no raw hex).
- [ ] No emojis as icons; SVG only, consistent stroke.
- [ ] `cursor: pointer` on every clickable; hover/press/focus states all present.
- [ ] Transitions 150–300ms via `--dur-*`; transform/opacity only.
- [ ] Contrast ≥4.5:1 checked at **both** morph ends (red accent is the tight one).
- [ ] `:focus-visible` outline intact; keyboard reaches all controls; mobile menu Esc-closes.
- [ ] `prefers-reduced-motion`: no smooth-scroll hijack, no loops/SplitText; color morph + toggle still work; every new transition has a reduced-motion guard.
- [ ] View Transitions: navigate home⇄trgovina⇄servis⇄o-nama — palette correct, ScrollSmoother rebuilds, no console errors, no stale inline tokens.
- [ ] Responsive 375 / 768 / 1024 / 1440; no horizontal scroll; nothing hidden behind the fixed nav.
- [ ] `npm run build` clean; content-collection schemas valid.
