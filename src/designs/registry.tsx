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
