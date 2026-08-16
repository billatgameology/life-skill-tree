# Design concepts for variations 3–5

These concepts were selected together so each design differs from Honeycomb,
Interchange, and the other new variations in metaphor, mood, navigation, and
detail presentation.

## 3. Fieldbook (`/fieldbook`)

- **Metaphor:** A naturalist's field journal. Domains are chapters, skills are
  observations, completion is a dated field mark, and favorites are pinned
  specimens.
- **Mood / palette:** Sun-faded and botanical: parchment `#F2E7D5`, forest
  `#244B3A`, terracotta `#C56648`, golden ochre `#C7933E`, and pencil
  `#453B31`.
- **Desktop layout:** A clothbound chapter rail stays at the left. The selected
  chapter opens into a spacious two-column folio of observation cards, with a
  running header, search, and compact field marks.
- **Mobile layout:** A sticky journal header and horizontal chapter tabs replace
  the rail. Observation cards become a single readable stack with full-width
  tap targets.
- **Navigation model:** Chapter index -> filtered observation folio -> routed
  field-note detail. Search can find an observation across every chapter.
- **Detail presentation:** A long-form field note with a margin metadata block,
  numbered procedure, checkable evidence criteria, troubleshooting notes, and
  linked "builds on" / "leads to" observations.
- **Progress presentation:** Overall progress is a restrained field-log count;
  each chapter has an inked fraction and a thin botanical growth line.

## 4. Workbench (`/workbench`)

- **Metaphor:** A communal maker's workshop. Domains are labeled parts drawers,
  skills are job cards, completion punches a job ticket, and favorites hang on
  the ready rack.
- **Mood / palette:** Tactile, sturdy, and energetic: plywood `#E9D2AE`, enamel
  blue `#174C5B`, safety orange `#F26B38`, graphite `#20282A`, and shop cream
  `#FFF6E6`.
- **Desktop layout:** A top tool rail holds search and overall status, a bank of
  fifteen compact drawers selects the active domain, and the main pegboard lays
  out level-based job-card lanes.
- **Mobile layout:** The tool rail condenses, drawers become a horizontal rack,
  and the three job lanes stack into one touch-friendly queue.
- **Navigation model:** Parts-drawer selector -> level lanes on one continuous
  board -> routed instruction-sheet detail. A ready-rack filter exposes saved
  jobs without creating a separate hierarchy.
- **Detail presentation:** A clipped shop instruction sheet with tools-to-learn,
  numbered procedure, challenge checklist, common snags, shop tips, and linked
  prerequisite / follow-on job cards.
- **Progress presentation:** Overall and per-drawer completion use analog-style
  fill gauges and punched-ticket states, never points or ranks.

## 5. Shortwave (`/shortwave`)

- **Metaphor:** A bright analog radio receiver. Domains occupy frequency bands,
  skills are broadcasts, levels are dayparts, completion is a logged reception,
  and favorites are presets.
- **Mood / palette:** Optimistic 1970s broadcast color: apricot `#FFCA8A`,
  aubergine `#3A1747`, electric cyan `#45D5E8`, tomato `#F05D4D`, and cream
  `#FFF7E8`.
- **Desktop layout:** A wide frequency dial tunes the active domain above a
  two-pane radio console: broadcast schedule at left and lively signal/progress
  readout at right.
- **Mobile layout:** The dial becomes a swipeable band strip. Broadcast cards
  stack below a compact now-tuned readout, with large controls and a sticky
  preset/search bar.
- **Navigation model:** Tune frequency band -> scan its level-grouped broadcast
  schedule -> routed transmission detail. A scanner searches all bands and a
  presets switch finds favorites.
- **Detail presentation:** A broadcast log/transcript with a strong ON AIR
  summary, timed metadata, segment-style steps, reception test criteria,
  troubleshooting, notes, and linked prior / next transmissions.
- **Progress presentation:** A signal meter shows overall reception; each band
  has its own illuminated segment count and completed broadcasts are logged.

## Selection check

| Design | Differentiation | 233-skill usability | Feasibility | Delight |
|---|---|---|---|---|
| Fieldbook | Strong editorial/organic identity | 15-chapter rail and global search | High | Quiet, tactile discovery |
| Workbench | Strong physical/tooling identity | Drawer selector and three level lanes | High | Punch cards and pegboard details |
| Shortwave | Strong media/analog identity | Tunable bands, schedule groups, scanner | High | Dial, signal, and broadcast language |

