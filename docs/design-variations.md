# Adding a Design Variation

This app is one skill library viewed through multiple, completely independent UI designs.
The home page (`/#/`) is a gallery listing every design; each design mounts at its own
route (`/#/<slug>`). This document is the contract for building design #3, #4, #5, …
Read it fully before writing any code.

## Architecture

- `src/designs/registry.tsx` — the single source of truth. The gallery page and the
  router both render from `DESIGNS`. Adding a design = adding one entry here plus one
  self-contained folder.
- `src/pages/GalleryPage.tsx` — the gallery home. You should not need to touch it.
- `src/routes.tsx` — routes are generated from the registry. You should not need to
  touch it. Each design is mounted at `/<slug>/*`, so you may use nested routes
  inside your design if you want.
- `src/designs/<slug>/` — your design lives here, root component default-exported
  from `index.tsx`. It is lazy-loaded, so your code (and any heavy layout math) only
  loads when the design is opened.
- **Honeycomb is the exception**: it predates this convention and lives at
  `src/App.tsx` + `src/components/**`. Treat all of that as Honeycomb-private.
  Do not modify it, and be careful about importing its components (see below).

## What is shared and immutable

1. **Skill content.** The 233 JSON files in `src/skills/` and the data layer
   `src/data/skills.ts` (`ALL_SKILLS`, `CATEGORIES`, `CATEGORY_KEYS`, `SKILL_MAP`,
   `getChildren`) and `src/data/paths.ts` (`LEARNING_PATHS`). Never edit content to
   suit a design; the design adapts to the content. Re-grouping, re-sorting,
   re-coloring, and re-labeling *in presentation* is fully allowed and encouraged —
   the `domain` keys and skill data itself are what's fixed.
2. **User state.** Use `useUserData()` (`user.completedSkillIds`, `user.favorite`,
   `completeSkill(id)`, `toggleFavorite(id)`) and `useAuth()`. Progress must carry
   across designs — never invent design-local progress storage, and never write to
   Firestore directly.
3. **No gamification.** XP, points, streaks, and rank ladders were deliberately
   removed from this product. Do not reintroduce them. Completion, favorites, and a
   gentle celebration are the only progress mechanics. (`Skill.level` is a
   tier/ordering field, not a reward.)
4. **Auth gating pattern.** `completeSkill`/`toggleFavorite` return `false` when
   signed out — on `false`, open the auth modal and show a short toast (see how
   `src/App.tsx` `handleCompleteSkill` does it).

## What you own

Everything inside `src/designs/<slug>/` — layout, navigation model, metaphor, color,
typography, motion. A design should feel like a **different product**, not a re-skin.

- **Theming:** the global Tailwind tokens (`bg-void`, `ink`, `surface`, `glow-gold`, …)
  are Honeycomb's dark palette. Don't fight them — scope your own palette with CSS
  variables set on your design's root element (inline `style` or a scoped class) and
  use arbitrary-value Tailwind classes (`bg-[var(--paper)]`, `text-[#2A2418]`, etc.).
  A light theme is welcome. `ThemeContext` (accent picker) is Honeycomb-oriented;
  you may ignore it.
- **Fonts:** add Google Fonts `<link>`s to `index.html` (additive only — keep
  Cinzel + Inter, they're Honeycomb's).
- **Component reuse:** logic hooks (`useUserData`, `useAuth`, `useIsMobile`) — reuse
  freely. Full-screen overlays (`AuthModal`, `CelebrationOverlay`, `Toast`) — fine to
  reuse; they're neutral enough. Honeycomb presentation components (`MosaicView`,
  `SkillDetailPanel`, `RegistryView`, `BottomTabBar`, screens) — do **not** reuse;
  build your own presentation so designs stay independent. shadcn primitives in
  `src/components/ui/` are shared and fine.
- **Escape hatch:** always render a small, discoverable link back to the gallery
  (`<Link to="/">`).

## Hard constraints

- No new npm dependencies. Already available: framer-motion, lucide-react,
  radix/shadcn (`src/components/ui/`), embla-carousel, recharts, vaul, date-fns,
  canvas-confetti.
- Works on desktop **and** mobile (one responsive codebase; test a ~390px viewport).
- Handles the real scale: 233 skills / 15 domains must stay browsable — no single
  undifferentiated wall of cards, no unusably tiny tap targets.
- Skill detail must present the full content: summary/learnerPromise, whyItMatters,
  realLifeUses, youWillLearn, miniChallenge, steps, completionCriteria,
  commonProblems, tips, prerequisites ("builds on") and dependents ("leads to" —
  via `getChildren`), difficulty, estimatedMinutes. It's long — design for scrolling.
- Required capabilities: browse/explore, search or find, open detail, mark complete
  (auth-gated), favorite, per-domain + overall progress.

## Process

1. **Concept before code.** Write down: name, metaphor, mood/palette (hex values),
   desktop layout, mobile layout, navigation model, detail presentation, progress
   presentation. Check it against the differentiation ledger below — if it shares a
   metaphor OR a mood with an existing design, pick again. Generating several
   competing concepts and judging them (differentiation / usability at 233-skill
   scale / feasibility / delight) produces much better results than running with
   the first idea.
2. **Build** under `src/designs/<slug>/`. Root component: `index.tsx` default export.
3. **Register**: append a `DesignMeta` entry in `src/designs/registry.tsx` — including
   a small hand-drawn SVG `preview` motif for the gallery card (look at the existing
   entries; keep it abstract, ~140×90 viewBox).
4. **Verify**: `npm run build` and `npm run lint` must pass. Then actually exercise:
   gallery card → design opens; search; open a content-heavy skill (e.g.
   `boil-pasta`); complete + favorite while signed out (should prompt auth, not
   crash); back-to-gallery link; mobile viewport.
5. **Update the ledger** below and add your design's entry to it.

## Differentiation ledger

Every design's identity, so later designs can avoid overlap. A new design should
differ from ALL entries in metaphor, navigation model, and mood.

| # | Name | Route | Metaphor | Mood / theme | Navigation model |
|---|------|-------|----------|--------------|------------------|
| 1 | Honeycomb | `/honeycomb` | Hex-territory star map (RPG skill tree) | Dark, cosmic, gold glow, Cinzel serif | Pan/zoom spatial map + sortable registry table, bottom tabs |
| 2 | Interchange | `/interchange` | City transit system: domains = lines, skills = stations, levels = fare zones, paths = journeys, completion = a dated VISITED stamp | Light "municipal modernism": ink on map paper (#F7F6F2), flat wayfinding, Overpass/Overpass Mono + Source Serif 4 | Page-based altitudes (network board → platform diagram → station page) with real routes/back-button, desktop line-index rail, mobile bottom tabs, `/`-key station finder |
| 3 | Fieldbook | `/fieldbook` | Naturalist field journal: domains = chapters, skills = observations, favorites = pinned specimens, completion = a dated field mark | Sun-faded botanical paper (#F2E7D5), forest ink, terracotta annotations, literary serif | Clothbound chapter rail → searchable observation folio → routed long-form field note; horizontal chapter tabs on mobile |
| 4 | Workbench | `/workbench` | Community maker shop: domains = parts drawers, skills = job cards, completion = punched work orders, favorites = ready rack | Tactile plywood, enamel blue, safety orange, graphite; sturdy industrial typography | Drawer bank → three level-based pegboard lanes → routed clipped instruction sheet; horizontally scrollable drawer rack on mobile |
| 5 | Shortwave | `/shortwave` | Analog radio receiver: domains = frequency bands, skills = broadcasts, levels = dayparts, completion = logged reception, favorites = presets | Bright 1970s broadcast studio: apricot, aubergine, electric cyan, tomato, cream | Frequency dial → level-grouped broadcast schedule → routed transmission log; global scanner and preset switch |

Directions intentionally still open (claim one or invent your own): periodic-table /
specimen-drawer grid (dense systematic completeness) · garden / seasonal growth
(organic, time-of-day rhythm) · card catalog · boarding-pass / itinerary.

## Notes from building design #2 (useful precedents)

- **Scoped theming that works:** Interchange sets its palette as `--ic-*` CSS vars
  on its root element and uses arbitrary-value Tailwind (`bg-[var(--ic-paper)]`).
  Its font stacks are the `.ic-sans` / `.ic-mono` / `.ic-serif` utilities in
  `src/index.css` — those are Interchange's; add your own similarly-prefixed ones.
- **`useUserData` now also returns `completionDates`** (skillId → "YYYY-MM-DD"),
  added additively for Interchange's date stamp. Any design may use it.
- **Nested routes are free:** a design is mounted at `/<slug>/*`, so plain
  react-router `<Routes>` inside it gives real pages, back-button behavior, and
  shareable URLs (see `src/designs/interchange/index.tsx`, which also shows manual
  per-location scroll restoration on its scroll container).
- **Derive, don't duplicate:** Interchange's whole transit view (line ordering,
  station codes, zones, interchange detection) is one pure derivation module over
  the shared data (`src/designs/interchange/lineMeta.ts`). Follow that pattern for
  your metaphor instead of hand-copying skill lists.
- **There is no un-complete.** `useUserData` can only add completions — don't
  design an "undo" affordance you can't implement.
