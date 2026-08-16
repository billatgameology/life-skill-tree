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
];
