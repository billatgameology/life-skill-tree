import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';

/**
 * The design registry. Every UI design of the skill library registers here,
 * and the gallery home page + router render straight from this list.
 *
 * To add a design: build it as a self-contained route component under
 * src/designs/<slug>/, then append one entry below.
 * See docs/design-variations.md for the full contract.
 */
export interface DesignMeta {
  /** Route slug — the design mounts at /#/<slug> */
  slug: string;
  /** Display name, e.g. "Honeycomb" */
  name: string;
  /** One-line hook shown under the name on the gallery card */
  tagline: string;
  /** 1–2 sentence description of the concept */
  description: string;
  /** Short trait chips, e.g. ['Dark', 'Hex map', 'Pan & zoom'] */
  vibe: string[];
  /** Accent color used by the gallery card */
  accent: string;
  /** ISO date the design was added */
  addedDate: string;
  /** Small decorative SVG motif for the gallery card preview area */
  preview: ReactNode;
  /** Lazy-loaded root component of the design */
  Component: LazyExoticComponent<ComponentType>;
}

function hexPts(cx: number, cy: number, r: number): string {
  let s = '';
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    s += `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)} `;
  }
  return s.trim();
}

const honeycombPreview = (
  <svg viewBox="0 0 140 90" className="h-full w-full" aria-hidden="true">
    {[
      { x: 70, y: 45, o: 1, fill: 'rgba(212,175,55,0.28)', stroke: '#D4AF37' },
      { x: 46, y: 31, o: 0.8, fill: 'rgba(91,155,107,0.22)', stroke: '#5B8B6B' },
      { x: 94, y: 31, o: 0.8, fill: 'rgba(90,155,160,0.22)', stroke: '#5A9BA0' },
      { x: 46, y: 59, o: 0.8, fill: 'rgba(138,107,155,0.22)', stroke: '#8A6B9B' },
      { x: 94, y: 59, o: 0.8, fill: 'rgba(155,90,90,0.22)', stroke: '#9B5A5A' },
      { x: 70, y: 17, o: 0.5, fill: 'transparent', stroke: '#4A4858' },
      { x: 22, y: 45, o: 0.5, fill: 'transparent', stroke: '#4A4858' },
      { x: 118, y: 45, o: 0.5, fill: 'transparent', stroke: '#4A4858' },
      { x: 70, y: 73, o: 0.5, fill: 'transparent', stroke: '#4A4858' },
    ].map((h, i) => (
      <polygon
        key={i}
        points={hexPts(h.x, h.y, 15)}
        fill={h.fill}
        stroke={h.stroke}
        strokeWidth="1.5"
        opacity={h.o}
      />
    ))}
    <circle cx="70" cy="45" r="3" fill="#D4AF37" />
  </svg>
);

const codexPreview = (
  <svg viewBox="0 0 140 90" className="h-full w-full" aria-hidden="true">
    <rect x="25" y="15" width="45" height="60" rx="3" fill="#FFFBF4" stroke="#D9D4C8" strokeWidth="2" />
    <rect x="70" y="15" width="45" height="60" rx="3" fill="#FFFBF4" stroke="#D9D4C8" strokeWidth="2" />
    <line x1="70" y1="15" x2="70" y2="75" stroke="#D9D4C8" strokeWidth="2" />
    <line x1="36" y1="32" x2="59" y2="32" stroke="#B89A4D" strokeWidth="2" strokeLinecap="round" />
    <line x1="36" y1="42" x2="59" y2="42" stroke="#D9D4C8" strokeWidth="2" strokeLinecap="round" />
    <line x1="36" y1="52" x2="59" y2="52" stroke="#D9D4C8" strokeWidth="2" strokeLinecap="round" />
    <line x1="81" y1="32" x2="104" y2="32" stroke="#B89A4D" strokeWidth="2" strokeLinecap="round" />
    <line x1="81" y1="42" x2="104" y2="42" stroke="#D9D4C8" strokeWidth="2" strokeLinecap="round" />
    <line x1="81" y1="52" x2="104" y2="52" stroke="#D9D4C8" strokeWidth="2" strokeLinecap="round" />
    <circle cx="70" cy="45" r="5" fill="#B89A4D" />
  </svg>
);

const gardenPreview = (
  <svg viewBox="0 0 140 90" className="h-full w-full" aria-hidden="true">
    <rect x="0" y="0" width="140" height="90" fill="#F9F7F2" />
    <ellipse cx="35" cy="70" rx="24" ry="8" fill="#E2DDD2" />
    <ellipse cx="70" cy="72" rx="24" ry="8" fill="#E2DDD2" />
    <ellipse cx="105" cy="70" rx="24" ry="8" fill="#E2DDD2" />
    <path d="M 35 70 Q 35 45 35 35" fill="none" stroke="#5A7D3A" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="28" cy="40" rx="8" ry="5" fill="#7A9D5A" transform="rotate(-30 28 40)" />
    <ellipse cx="42" cy="44" rx="8" ry="5" fill="#7A9D5A" transform="rotate(30 42 44)" />
    <path d="M 70 72 Q 70 47 70 37" fill="none" stroke="#6B4E3D" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="63" cy="42" rx="8" ry="5" fill="#E8A598" transform="rotate(-30 63 42)" />
    <ellipse cx="77" cy="46" rx="8" ry="5" fill="#E8A598" transform="rotate(30 77 46)" />
    <path d="M 105 70 Q 105 45 105 35" fill="none" stroke="#5A7D3A" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="98" cy="40" rx="8" ry="5" fill="#7A9D5A" transform="rotate(-30 98 40)" />
    <ellipse cx="112" cy="44" rx="8" ry="5" fill="#7A9D5A" transform="rotate(30 112 44)" />
    <circle cx="115" cy="22" r="8" fill="#F4B400" opacity="0.35" />
  </svg>
);

const workshopPreview = (
  <svg viewBox="0 0 140 90" className="h-full w-full" aria-hidden="true">
    <rect x="0" y="0" width="140" height="90" fill="#E8E6E1" />
    <pattern id="pegHoles" width="10" height="10" patternUnits="userSpaceOnUse">
      <circle cx="5" cy="5" r="1.2" fill="#C9C6BE" />
    </pattern>
    <rect x="0" y="0" width="140" height="90" fill="url(#pegHoles)" />
    <rect x="22" y="22" width="40" height="26" rx="2" fill="#F5F4F1" stroke="#C9C6BE" strokeWidth="2" />
    <circle cx="34" cy="35" r="5" fill="#F4B400" />
    <rect x="78" y="22" width="40" height="26" rx="2" fill="#F5F4F1" stroke="#C9C6BE" strokeWidth="2" />
    <rect x="92" y="30" width="12" height="10" fill="#2C2E33" />
    <rect x="22" y="56" width="40" height="26" rx="2" fill="#F5F4F1" stroke="#C9C6BE" strokeWidth="2" />
    <path d="M 36 62 L 44 62 L 42 72 L 38 72 Z" fill="#2C2E33" />
    <rect x="78" y="56" width="40" height="26" rx="2" fill="#F5F4F1" stroke="#C9C6BE" strokeWidth="2" />
    <circle cx="98" cy="69" r="6" fill="none" stroke="#2C2E33" strokeWidth="2.5" />
  </svg>
);

const interchangePreview = (
  <svg viewBox="0 0 140 90" className="h-full w-full" aria-hidden="true">
    {/* Paper card */}
    <rect x="8" y="6" width="124" height="78" rx="6" fill="#F7F6F2" />
    {/* Three transit lines */}
    <path d="M 20 66 L 52 66 L 84 34 L 122 34" fill="none" stroke="#A9853B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 20 22 L 70 22 L 96 48 L 122 48" fill="none" stroke="#47898E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 30 78 L 30 44 L 52 22" fill="none" stroke="#7D5C8F" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Stations */}
    {[
      { x: 44, y: 22, fill: '#47898E' },
      { x: 96, y: 48, fill: '#FFFFFF', stroke: '#47898E' },
      { x: 38, y: 66, fill: '#A9853B' },
      { x: 104, y: 34, fill: '#FFFFFF', stroke: '#A9853B' },
      { x: 30, y: 52, fill: '#FFFFFF', stroke: '#7D5C8F' },
    ].map((s, i) => (
      <circle key={i} cx={s.x} cy={s.y} r="4" fill={s.fill} stroke={s.stroke ?? s.fill} strokeWidth="2.5" />
    ))}
    {/* Interchange: double ring */}
    <circle cx="70" cy="22" r="5" fill="#FFFFFF" stroke="#16181B" strokeWidth="2.5" />
    <circle cx="70" cy="22" r="8.5" fill="none" stroke="#16181B" strokeWidth="1.5" />
  </svg>
);

const manilaPreview = (
  <svg viewBox="0 0 140 90" className="h-full w-full" aria-hidden="true">
    {/* Cabinet face */}
    <rect x="18" y="8" width="104" height="74" rx="4" fill="#3E2F23" stroke="#241C16" strokeWidth="1.5" />
    {/* Drawer rows */}
    {[14, 38, 62].map((y, i) => (
      <g key={i}>
        <rect x="24" y={y} width="92" height="18" rx="2" fill="#46362A" stroke="#241C16" strokeWidth="1" />
        {/* Brass label frame with cream card */}
        <rect x="40" y={y + 3} width="44" height="9" rx="1.5" fill="#C9A45C" opacity="0.85" />
        <rect x="42" y={y + 4.5} width="40" height="6" rx="1" fill="#F9F2E0" />
        {/* Brass pull */}
        <rect x="94" y={y + 6.5} width="14" height="3" rx="1.5" fill="#C9A45C" />
      </g>
    ))}
    {/* A pulled index card */}
    <g transform="rotate(-5 108 30)">
      <rect x="92" y="16" width="40" height="28" rx="1.5" fill="#F9F2E0" stroke="#241C16" strokeWidth="1" />
      <rect x="92" y="16" width="40" height="3" fill="#C46A5A" />
      <line x1="96" y1="26" x2="126" y2="26" stroke="#A9BFCB" strokeWidth="1" />
      <line x1="96" y1="31" x2="120" y2="31" stroke="#A9BFCB" strokeWidth="1" />
      {/* FILED stamp */}
      <rect x="106" y="33" width="22" height="8" rx="1" fill="none" stroke="#B3472F" strokeWidth="1.3" transform="rotate(-6 117 37)" />
    </g>
  </svg>
);

const fieldbookPreview = (
  <svg viewBox="0 0 140 90" className="h-full w-full" aria-hidden="true">
    <rect x="9" y="7" width="122" height="76" rx="5" fill="#244B3A" />
    <path d="M18 13h48c5 0 9 4 9 9v53c-3-3-7-4-12-4H18z" fill="#F2E7D5" />
    <path d="M122 13H74c-5 0-9 4-9 9v53c3-3 7-4 12-4h45z" fill="#FAF2E5" />
    <path d="M70 19v50" stroke="#CBB99E" strokeWidth="1.5" />
    <path d="M35 61c8-10 11-22 9-36M43 35c-7-1-11-5-13-10M42 42c7-2 12-6 15-11M39 50c-6 0-10-3-13-7" fill="none" stroke="#5F806A" strokeWidth="2" strokeLinecap="round" />
    <circle cx="43" cy="35" r="2.5" fill="#C56648" />
    <path d="M82 27h28M82 36h23M82 49h31M82 58h19" stroke="#8D7D68" strokeWidth="2" strokeLinecap="round" opacity=".7" />
    <path d="M19 76h102" stroke="#C7933E" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const workbenchPreview = (
  <svg viewBox="0 0 140 90" className="h-full w-full" aria-hidden="true">
    <rect x="7" y="6" width="126" height="78" rx="5" fill="#E9D2AE" />
    {Array.from({ length: 6 }).map((_, row) =>
      Array.from({ length: 10 }).map((__, col) => (
        <circle key={`${row}-${col}`} cx={16 + col * 12} cy={14 + row * 12} r="1.2" fill="#AE9472" opacity=".7" />
      )),
    )}
    <rect x="17" y="18" width="34" height="23" rx="2" fill="#FFF6E6" stroke="#174C5B" strokeWidth="2" />
    <path d="M22 25h22M22 31h15" stroke="#174C5B" strokeWidth="2" strokeLinecap="round" />
    <circle cx="45" cy="36" r="3" fill="#F26B38" />
    <rect x="58" y="30" width="32" height="26" rx="2" fill="#174C5B" />
    <path d="M64 38h20M64 45h14" stroke="#FFF6E6" strokeWidth="2" strokeLinecap="round" />
    <rect x="96" y="17" width="25" height="38" rx="3" fill="#FFF6E6" stroke="#20282A" strokeWidth="2" />
    <path d="M102 25h13M102 32h13M102 39h8" stroke="#20282A" strokeWidth="2" strokeLinecap="round" />
    <path d="M24 69h92" stroke="#20282A" strokeWidth="5" strokeLinecap="round" />
    <path d="M45 63v12M72 63v12M99 63v12" stroke="#F26B38" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const shortwavePreview = (
  <svg viewBox="0 0 140 90" className="h-full w-full" aria-hidden="true">
    <rect x="7" y="8" width="126" height="74" rx="10" fill="#FFCA8A" />
    <rect x="16" y="17" width="108" height="25" rx="4" fill="#3A1747" />
    <path d="M24 32c6 0 6-9 12-9s6 14 12 14 6-11 12-11 6 7 12 7 6-10 12-10 6 14 12 14 6-8 12-8" fill="none" stroke="#45D5E8" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M23 49h76" stroke="#3A1747" strokeWidth="3" strokeLinecap="round" />
    {[29, 41, 53, 65, 77, 89].map((x, i) => (
      <path key={x} d={`M${x} 46v${i % 2 ? 7 : 10}`} stroke="#3A1747" strokeWidth="2" />
    ))}
    <path d="M62 44v17" stroke="#F05D4D" strokeWidth="3" strokeLinecap="round" />
    <circle cx="111" cy="62" r="13" fill="#FFF7E8" stroke="#3A1747" strokeWidth="3" />
    <path d="M111 62l7-5" stroke="#F05D4D" strokeWidth="3" strokeLinecap="round" />
    <circle cx="24" cy="70" r="4" fill="#F05D4D" />
    <circle cx="38" cy="70" r="4" fill="#45D5E8" />
  </svg>
);

export const DESIGNS: DesignMeta[] = [
  {
    slug: 'honeycomb',
    name: 'Honeycomb',
    tagline: 'A dark constellation of hex territories to explore and light up.',
    description:
      'The original design: domains as contiguous hex territories on a pannable starfield map, with an RPG-flavored gold-glow aesthetic and a sortable registry list.',
    vibe: ['Dark', 'Hex map', 'Pan & zoom', 'RPG'],
    accent: '#D4AF37',
    addedDate: '2026-05-16',
    preview: honeycombPreview,
    Component: lazy(() => import('@/App')),
  },
  {
    slug: 'interchange',
    name: 'Interchange',
    tagline: 'A calm transit map of daily life — ride the lines, visit the stations.',
    description:
      'Vignelli-inspired ink-on-paper wayfinding: the 15 domains become transit lines, the 233 skills become stations along platform diagrams, learning paths become journeys, and every completed skill earns a dated VISITED stamp.',
    vibe: ['Light', 'Transit map', 'Wayfinding', 'Ink on paper'],
    accent: '#3E9B63',
    addedDate: '2026-08-16',
    preview: interchangePreview,
    Component: lazy(() => import('@/designs/interchange')),
  },
  {
    slug: 'manila',
    name: 'Manila',
    tagline: 'A card catalog of everyday competence — pull a card, stamp it FILED.',
    description:
      'A mid-century archive: 15 wooden drawers of typed index cards, riffled edges you lift to read, dossier folders with routing slips, and a red date stamp for every skill you master.',
    vibe: ['Warm', 'Card catalog', 'Typewriter', 'Date stamps'],
    accent: '#C9A45C',
    addedDate: '2026-08-16',
    preview: manilaPreview,
    Component: lazy(() => import('@/designs/manila')),
  },
  {
    slug: 'fieldbook',
    name: 'Fieldbook',
    tagline: 'A sun-faded journal for noticing, practicing, and recording everyday know-how.',
    description:
      'A naturalist-inspired field guide where domains become clothbound chapters, skills become observations, and progress gathers as quiet ink marks across a personal folio.',
    vibe: ['Botanical', 'Field journal', 'Editorial', 'Warm paper'],
    accent: '#C56648',
    addedDate: '2026-08-16',
    preview: fieldbookPreview,
    Component: lazy(() => import('@/designs/fieldbook')),
  },
  {
    slug: 'workbench',
    name: 'Workbench',
    tagline: 'Pull a parts drawer, choose a job card, and learn by doing.',
    description:
      'A tactile community workshop: fifteen parts drawers organize the library, level lanes keep every job browsable, and completed skills become satisfyingly punched work orders.',
    vibe: ['Tactile', 'Pegboard', 'Maker shop', 'Job cards'],
    accent: '#F26B38',
    addedDate: '2026-08-16',
    preview: workbenchPreview,
    Component: lazy(() => import('@/designs/workbench')),
  },
  {
    slug: 'shortwave',
    name: 'Shortwave',
    tagline: 'Tune the bands of daily life and log the broadcasts that come through clearly.',
    description:
      'A bright analog receiver where domains occupy the dial, skills air as broadcasts, favorites become presets, and progress reads as a calm signal meter.',
    vibe: ['Retro bright', 'Radio dial', 'Broadcast log', 'Analog'],
    accent: '#45D5E8',
    addedDate: '2026-08-16',
    preview: shortwavePreview,
    Component: lazy(() => import('@/designs/shortwave')),
  },
  {
    slug: 'codex',
    name: 'Codex',
    tagline: 'A warm field guide to everyday skills, with chapters, entries, and field marks.',
    description:
      'An editorial almanac that turns the 15 domains into book chapters and the 233 skills into numbered specimen entries. Each completed skill earns a small field-mark check.',
    vibe: ['Light', 'Editorial', 'Field guide', 'Print'],
    accent: '#B89A4D',
    addedDate: '2026-08-16',
    preview: codexPreview,
    Component: lazy(() => import('@/designs/codex')),
  },
  {
    slug: 'garden',
    name: 'Garden',
    tagline: 'A calm garden where skills grow as seedlings and bloom when you complete them.',
    description:
      'An organic, seasonal view: domains are raised beds, skills are plants, and progress is shown as blooming rings. Tap a plant to read its care tag.',
    vibe: ['Light', 'Organic', 'Garden', 'Watercolor'],
    accent: '#5A7D3A',
    addedDate: '2026-08-16',
    preview: gardenPreview,
    Component: lazy(() => import('@/designs/garden')),
  },
  {
    slug: 'workshop',
    name: 'Workshop',
    tagline: 'A practical pegboard wall of tools — check them out, keep favorites on the bench.',
    description:
      'A utilitarian workshop view: domains are tool-wall sections, skills are hanging tool cards, and completion adds a brass checked-out tag. A no-nonsense grid for the whole library.',
    vibe: ['Light', 'Pegboard', 'Tools', 'Industrial'],
    accent: '#F4B400',
    addedDate: '2026-08-16',
    preview: workshopPreview,
    Component: lazy(() => import('@/designs/workshop')),
  },
];
