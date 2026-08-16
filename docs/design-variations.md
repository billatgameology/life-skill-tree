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
- Handles the real scale: 233 skills must stay reachable — no single
  undifferentiated wall of cards, no unusably tiny tap targets. The domain
  taxonomy is *available data*, *not* a required organizing principle; a design
  may ignore it entirely as long as skills stay findable its own way.
- Skill detail must present the full content: summary/learnerPromise, whyItMatters,
  realLifeUses, youWillLearn, miniChallenge, steps, completionCriteria,
  commonProblems, tips, prerequisites ("builds on") and dependents ("leads to" —
  via `getChildren`), difficulty, estimatedMinutes. It's long — design for scrolling.
- Required capabilities: some way to explore/find skills, open detail, mark complete
  (auth-gated), favorite, and visible progress — overall plus within whatever
  structure the design actually uses (per-domain progress is available data, not a
  layout mandate).

## Structural differentiation — the real bar

A hard lesson from designs #1–#9: seven of nine ended up with the SAME interaction
skeleton — *partition skills by domain → list within partition → detail page* — in
different costumes (chapters, drawers, beds, pegboard sections, and frequency bands
are all the same noun). A new metaphor + palette on that skeleton is a re-skin, not
a new design, **and fails review regardless of how good the metaphor is.**

A design's identity = its **organizing axis** (what structures the collection) +
its **core verb** (what the user actually does). New designs must differ from ALL
existing designs on at least one of these, preferably both. Axes already used:

- Domain taxonomy → list → detail (the default; used by most of #1–#9 — CLOSED,
  do not build another)
- Spatial pan/zoom territory map (Honeycomb)
- Deterministic sequence along a line w/ prev-next travel + cross-cutting journeys
  (Interchange)

Axes claimed by designs #10–#15 (all added 2026-08-16): the prerequisite DAG as
navigation itself (Lattice) · the user's completion frontier as the home surface
(Frontier) · time / estimatedMinutes-first (Tempo) · place cross-cutting domains
(Rooms) · anti-browsing, one dealt skill (Today) · one continuous global path
(Trail).

Axes still open: dialogue/triage-first concierge ("what's going on?" as the whole
interface) · scheduling skills onto a real calendar week · serendipity/shuffle as
the primary verb (Today's redeal only brushes it) · comparison/duel mechanics ·
social/shared surfaces (out of scope while the app is single-user). Novel
interaction mechanics count too, when they ARE the design rather than decoration.

## Judging criteria (for concept competitions)

When generating competing concepts and judging them, score on:

1. **Structural differentiation** — organizing axis + core verb vs EVERY existing
   design. A domain→list→detail skeleton scores 1–2 here no matter the metaphor.
2. **Fitness for its own promise** — judge usability against what THIS design
   promises, not against taxonomy browsing. A daily-draw design isn't "bad at
   goal-directed lookup"; a search escape-hatch covers that. Do not let the
   "distracted user finds a skill fast" lens veto structural novelty — that lens,
   applied as a universal criterion, is exactly what produced nine list apps.
   Every design still needs *an* escape hatch to any specific skill (search is
   enough), but that's a checkbox, not the center of the score.
3. **Feasibility** — one focused session, existing deps only, honest scope.
4. **Delight/memorability** — would someone reopen it just because of how it feels?

## Process

1. **Concept before code.** Write down: organizing axis, core verb, name, metaphor,
   mood/palette (hex values), desktop layout, mobile layout, navigation model,
   detail presentation, progress presentation. Check it against the structural
   axes above AND the ledger below — if it shares an organizing axis with an
   existing design, pick again; metaphor/mood overlap is secondary. Generating
   several competing concepts and judging them on the criteria above produces much
   better results than running with the first idea.
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
| 3 | Manila | `/manila` | Mid-century card catalog + personal dossier: domains = wooden drawers, skills = typed index cards with call numbers (04.07), levels = tier dividers, paths = dossier folders with routing slips, completion = red FILED date stamp | Warm mid-tone "reading room": walnut chrome + cream cards, Courier Prime/Special Elite typewriter labels with Atkinson Hyperlegible body, brass + stamp-pad red | Cabinet grid → drawer riffle (overlapping card edges that lift on hover) → pulled card; desktop master-detail blotter panel, mobile bottom tabs, `/`-key Lookup request card, derived "Pulled for you" tray |
| 4 | Fieldbook | `/fieldbook` | Naturalist field journal: domains = chapters, skills = observations, favorites = pinned specimens, completion = a dated field mark | Sun-faded botanical paper (#F2E7D5), forest ink, terracotta annotations, literary serif | Clothbound chapter rail → searchable observation folio → routed long-form field note; horizontal chapter tabs on mobile |
| 5 | Workbench | `/workbench` | Community maker shop: domains = parts drawers, skills = job cards, completion = punched work orders, favorites = ready rack | Tactile plywood, enamel blue, safety orange, graphite; sturdy industrial typography | Drawer bank → three level-based pegboard lanes → routed clipped instruction sheet; horizontally scrollable drawer rack on mobile |
| 6 | Shortwave | `/shortwave` | Analog radio receiver: domains = frequency bands, skills = broadcasts, levels = dayparts, completion = logged reception, favorites = presets | Bright 1970s broadcast studio: apricot, aubergine, electric cyan, tomato, cream | Frequency dial → level-grouped broadcast schedule → routed transmission log; global scanner and preset switch |
| 7 | Codex | `/codex` | Life-skills field guide / almanac: domains are chapters, skills are numbered entries, completion is a field-mark check | Warm paper (#F4F1EA), moss ink (#2A2F23), faded gold (#B89A4D), print serif, scholarly quiet | Chapter table of contents rail → chapter spread of skill cards → full-page specimen entry; search jumps across chapters |
| 8 | Garden | `/garden` | Seasonal garden: domains are raised beds, skills are plants/seedlings, completion makes them bloom | Soft cream (#F9F7F2), leaf green (#5A7D3A), soil brown (#6B4E3D), rounded organic type, watercolor calm | Bird's-eye bed grid → tap a plant → detail tag; mobile bed tabs + bottom sheet |
| 9 | Workshop | `/workshop` | Workshop pegboard: domains are tool-wall sections, skills are hanging tool cards, completion adds a brass check tag | Pegboard gray (#E8E6E1), tool-steel (#2C2E33), safety yellow (#F4B400), industrial sans + mono, utilitarian | Pegboard grid by section → tool card → side drawer spec sheet; mobile section accordions + bottom sheet |
| 10 | Lattice | `/lattice` | Printed circuit board: skills = pads, prerequisite edges = copper traces, connected components = nets, isolated skills = loose pins, completion = a soldered joint that lights every downstream trace — warmth, never a lock | Dark solder-mask green (#0E2318), copper (#D98E4A) and HASL gold (#F0C33C), silkscreen-white mono labels; Archivo + JetBrains Mono | Home board (live-edge frontier strip → net directory with real-topology minimaps → loose-pin bin) → scrollable per-net trace map with pre-routed chamfered traces → pad datasheet whose upstream/downstream trace links are the primary way around; `/`-key Probe finder |
| 11 | Frontier | `/frontier` | Expedition at dawn: completions are the cairn trail behind camp, the frontier is the actionable edge (all prereqs covered), the rest are reachable ridges — never locked; each advance visibly migrates the territory | Deep indigo night giving way to coral-amber horizon light (#10162B/#FF8A5C), bold editorial Archivo, mono expedition labels, quiet contour textures | Progress-banded base camp (behind → frontier → further out) with a curated reshuffleable frontier hand; routed survey pages; full-frontier index + day-by-day logbook; `/`-key Scout escape hatch |
| 12 | Tempo | `/tempo` | Precision chronograph: minutes are the shelf, skills are what fits the time you have, sessions are 2–3 skills assembled to sum exactly to a budget, completion is minutes banked in a ledger | Crisp white watch-dial (#FAFAF7), near-black hands (#121316), one sweep-hand red (#C81E14), chunky tabular numerals; Space Grotesk + JetBrains Mono | Minute dial (5/10/15/20/30+) reshapes one duration-banded quick-win list → skill spec sheet; session builder with swappable slots + persistent run strip; invested ledger with month-by-month rhythm; `/`-key finder escape hatch |
| 13 | Rooms | `/rooms` | A home and its surroundings at dusk: skills live in the PLACE they happen (kitchen, laundry corner, front door, street, shops, your phone) — places deliberately cross-cut domains, and each completion turns on another light in the house | Cozy evening interior: deep teal night (#1B2C31), lamp amber (#F0B860), warm cream, muted terracotta/rose/sage room tints; Source Serif 4 + Atkinson Hyperlegible | Cutaway dwelling SVG floor plan (desktop) / illustrated room list (mobile) → room page with level shelves + "also passes through here" → routed long-form skill page; `/`-key search overlay; favorites as a corkboard strip |
| 14 | Today | `/today` | A daily dealt card: the app opens onto exactly one skill; "not today" spends a small hand of redeals, mood chips re-deal in context, completion closes the day | Near-black charcoal stage (#131118), one saturated card color per domain, oversized Space Grotesk, confetti celebration, zero guilt mechanics | No browsing: deterministic per-day deal (date + completed-set seed, domain rotates day over day) → full-page detail → done-for-today with a tomorrow hint; quiet-corner search + A–Z index and a past-days log as escape hatches |
| 15 | Trail | `/trail` | One continuous hiking trail: all 233 skills as waypoints on a single serpentine path, chunked into 15 derived named legs, completion = a berry paint blaze, favorites = gold flags, progress = distance traveled / furthest point | Parchment topographic map (#F0E8D2) with faint contour rings, dashed pine path (#3F5A2E), berry blazes (#8F3B45); Source Serif 4 italics + Nunito + Cousine | One scrollable global path (trailhead board → legs → trail's end) with a Continue jump to the first unblazed waypoint, jump-to-leg index overlay, `/`-key waypoint finder, waypoint page with global prev/next onward travel |

Directions intentionally still open (claim one or invent your own): see the
"Axes still open" list in the Structural differentiation section above — and
remember the bar is a new organizing axis or core verb, not a new metaphor.

## Design batch #3-5 concepts

### #3 Codex — Field Guide
- **Metaphor:** A life-skills almanac / field guide. Domains are chapters; skills are numbered entries with specimen-style detail pages; completion is a small field-mark check.
- **Mood / palette:** Warm paper `#F4F1EA`, moss ink `#2A2F23`, faded gold `#B89A4D`, soft rule `#D9D4C8`. Editorial, print, scholarly, quiet.
- **Fonts:** Crimson Pro (display), Source Sans 3 (body), Cousine (data).
- **Desktop layout:** Two-column spread: left chapter TOC rail, right chapter "spread" of skill index cards. Persistent header with search and back-to-gallery link.
- **Mobile layout:** Single column with chapter dropdown, stacked skill cards, and a full-screen detail entry.
- **Navigation model:** Chapter TOC → skill cards → specimen entry. Search jumps directly to any entry.
- **Detail presentation:** Full-page specimen page with serif headings, all skill fields in labeled sections, prerequisites/dependents as "see also" entries.
- **Progress presentation:** Per-chapter progress bar in the TOC and chapter headers; overall completion shown in the "Field Log" badge.

### #4 Garden — Seasonal Growth
- **Metaphor:** A garden of skills. Domains are raised beds; skills are plants/seedlings; completing one makes it bloom.
- **Mood / palette:** Soft cream `#F9F7F2`, leaf green `#5A7D3A`, soil brown `#6B4E3D`, sky blue `#7EA4B3`, petal accents. Organic, watercolor, calm.
- **Fonts:** Quicksand (rounded headings), Nunito (body).
- **Desktop layout:** Bird's-eye grid of raised beds; each bed shows plant cards. Right-side detail panel slides in like a plant tag.
- **Mobile layout:** Vertical scroll through beds; tapping a plant opens a bottom-sheet detail tag.
- **Navigation model:** Browse beds → tap plant → detail tag. Bed tabs on mobile and a top search/filter bar.
- **Detail presentation:** Plant tag with rounded sections: care instructions (what you'll learn), steps, criteria, tips, common problems, and related plants.
- **Progress presentation:** Bloom ring per bed and overall garden bloom percentage.

### #5 Workshop — Pegboard
- **Metaphor:** A workshop pegboard wall. Domains are sections of the tool wall; skills are tool cards hung on pegs; completion adds a brass "checked out" tag.
- **Mood / palette:** Pegboard gray `#E8E6E1`, tool-steel `#2C2E33`, safety yellow `#F4B400`, black ink `#1A1C20`, wood `#A67C52`. Practical, tactile, utilitarian.
- **Fonts:** Space Grotesk (industrial headings), JetBrains Mono (labels/data).
- **Desktop layout:** Pegboard grid of tool cards grouped by section. Tool detail opens in a side drawer styled like a spec sheet.
- **Mobile layout:** Vertical list of tool categories with expandable cards; detail opens in a bottom sheet.
- **Navigation model:** Section tabs/rail → tool grid → detail drawer. Search by tool name.
- **Detail presentation:** Tool spec sheet with difficulty, time, uses, steps, criteria, tips, common problems, and prerequisites/dependents as "related tools".
- **Progress presentation:** Per-section progress bars and overall workshop completion gauge.

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
