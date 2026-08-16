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

const latticePreview = (
  <svg viewBox="0 0 140 90" className="h-full w-full" aria-hidden="true">
    <rect x="8" y="8" width="124" height="74" rx="6" fill="#0E2318" stroke="#24422F" strokeWidth="1.5" />
    {[
      'M 30 22 L 30 38 L 38 46 L 62 46',
      'M 30 22 L 30 30 L 70 30 L 78 38 L 78 60',
      'M 110 24 L 110 40 L 102 48 L 86 48 L 78 56 L 78 60',
      'M 46 68 L 60 68 L 66 62 L 78 62',
    ].map((d, i) => (
      <path key={i} d={d} fill="none" stroke={i === 0 ? '#F0C33C' : '#7A5C3E'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    ))}
    {[
      { cx: 30, cy: 22, fill: '#F0C33C', ring: 'transparent' },
      { cx: 62, cy: 46, fill: '#F0C33C', ring: 'transparent' },
      { cx: 110, cy: 24, fill: '#D98E4A', ring: 'transparent' },
      { cx: 78, cy: 60, fill: '#D98E4A', ring: 'transparent' },
      { cx: 46, cy: 68, fill: '#284534', ring: '#4A6B57' },
    ].map((p, i) => (
      <g key={i}>
        <circle cx={p.cx} cy={p.cy} r="6" fill={p.fill} stroke={p.ring} strokeWidth="1.5" />
        <circle cx={p.cx} cy={p.cy} r="2.2" fill="#0E2318" />
      </g>
    ))}
  </svg>
);

const frontierPreview = (
  <svg viewBox="0 0 140 90" className="h-full w-full" fill="none" aria-hidden="true">
    <rect width="140" height="90" rx="6" fill="#10162B" />
    <path d="M14 30 Q 42 20 72 28 T 128 25" stroke="#2A3457" strokeWidth="1" />
    <path d="M10 38 Q 45 30 78 36 T 130 33" stroke="#2A3457" strokeWidth="1" opacity="0.6" />
    <ellipse cx="70" cy="46" rx="54" ry="13" fill="#FF8A5C" opacity="0.09" />
    <ellipse cx="70" cy="46" rx="30" ry="7" fill="#FF8A5C" opacity="0.14" />
    <rect x="10" y="45" width="120" height="1.6" rx="0.8" fill="#B3542F" opacity="0.7" />
    <rect x="42" y="45" width="56" height="1.6" rx="0.8" fill="#FF8A5C" />
    {[24, 58, 92].map((x) => (
      <g key={x}>
        <rect x={x} y="52" width="24" height="15" rx="2.5" fill="#1A2140" stroke="#2A3457" strokeWidth="1" />
        <rect x={x} y="52" width="24" height="2.5" rx="1.2" fill="#FF8A5C" />
      </g>
    ))}
    <path d="M18 80 H 122" stroke="#2A3457" strokeWidth="1" />
    {[18, 38, 58, 78].map((x) => (
      <circle key={x} cx={x} cy="80" r="3" fill="#FFB454" />
    ))}
    <circle cx="98" cy="80" r="3.5" fill="#FFB454" stroke="#FF8A5C" strokeWidth="2" strokeOpacity="0.55" />
  </svg>
);

const tempoPreview = (
  <svg viewBox="0 0 140 90" className="h-full w-full" fill="none" aria-hidden="true">
    <rect width="140" height="90" fill="#FAFAF7" />
    <circle cx="27" cy="29" r="16" fill="#FFFFFF" stroke="#121316" strokeWidth="2.4" />
    {[
      { x1: 27, y1: 15.5, x2: 27, y2: 19 },
      { x1: 27, y1: 39, x2: 27, y2: 42.5 },
      { x1: 13.5, y1: 29, x2: 17, y2: 29 },
      { x1: 37, y1: 29, x2: 40.5, y2: 29 },
    ].map((t) => (
      <line key={`${t.x1}-${t.y1}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#121316" strokeWidth="1.5" />
    ))}
    <line x1="27" y1="29" x2="35" y2="18" stroke="#C81E14" strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="27" cy="29" r="2.2" fill="#C81E14" />
    {[
      { x: 57, label: '5', on: false },
      { x: 79, label: '10', on: false },
      { x: 101, label: '15', on: true },
      { x: 123, label: '20', on: false },
    ].map((s) => (
      <g key={s.label}>
        <rect x={s.x - 9} y="15" width="18" height="27" rx="2.5" fill={s.on ? '#121316' : '#FFFFFF'} stroke={s.on ? '#121316' : '#C9C9C1'} strokeWidth="1.4" />
        {s.on && <rect x={s.x - 5} y="15" width="10" height="2.6" fill="#C81E14" />}
        <text x={s.x} y="33.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10.5" fontWeight="700" fill={s.on ? '#FAFAF7' : '#121316'}>
          {s.label}
        </text>
      </g>
    ))}
    {[
      { y: 56, w: 94 },
      { y: 66, w: 72 },
      { y: 76, w: 106 },
    ].map((b) => (
      <g key={b.y}>
        <rect x="13" y={b.y} width="7" height="6" rx="1" fill="#C81E14" />
        <rect x="25" y={b.y + 1} width={b.w} height="4" rx="2" fill="#C9C9C1" />
      </g>
    ))}
  </svg>
);

const roomsPreview = (
  <svg viewBox="0 0 140 90" className="h-full w-full" aria-hidden="true">
    <circle cx="18" cy="14" r="7" fill="#F4E8D6" opacity="0.9" />
    <circle cx="21" cy="12" r="6" fill="#1B2C31" />
    {[[40, 10], [62, 20], [95, 8], [118, 16], [131, 34]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="1.2" fill="#F4E8D6" opacity="0.5" />
    ))}
    <rect x="24" y="38" width="72" height="40" fill="#243940" stroke="#3B565C" strokeWidth="1.5" />
    <polygon points="20,38 60,16 100,38" fill="#2E464D" stroke="#3B565C" strokeWidth="1.5" />
    <rect x="31" y="45" width="12" height="12" fill="#F0B860" opacity="0.9" />
    <rect x="51" y="45" width="12" height="12" fill="#F0B860" opacity="0.35" />
    <rect x="71" y="45" width="12" height="12" fill="#F0B860" opacity="0.6" />
    <rect x="43" y="62" width="12" height="16" rx="1" fill="#C79A6B" />
    <circle cx="52.5" cy="70" r="1.2" fill="#F4E8D6" />
    <rect x="104" y="52" width="12" height="26" rx="3" fill="#22363C" stroke="#7CC3B4" strokeWidth="1.2" />
    <rect x="106.5" y="55" width="7" height="17" rx="1" fill="#F0B860" opacity="0.5" />
    <rect x="0" y="78" width="140" height="2.5" fill="#1E3133" />
    <rect x="121" y="60" width="1.8" height="18" fill="#93A6C9" />
    <circle cx="122" cy="58" r="2.5" fill="#F0B860" />
  </svg>
);

const todayPreview = (
  <svg viewBox="0 0 140 90" className="h-full w-full" aria-hidden="true">
    <rect width="140" height="90" fill="#131118" />
    <rect x="38" y="16" width="68" height="52" rx="7" fill="none" stroke="#2B2735" strokeWidth="1.5" transform="rotate(4 72 42)" />
    <g transform="rotate(-3 70 44)">
      <rect x="34" y="14" width="72" height="56" rx="7" fill="#FFC94B" />
      <rect x="41" y="22" width="26" height="3" rx="1.5" fill="#332D3E" opacity="0.55" />
      <rect x="41" y="30" width="52" height="7" rx="2" fill="#191521" />
      <rect x="41" y="40" width="40" height="7" rx="2" fill="#191521" />
      <rect x="41" y="54" width="24" height="9" rx="4.5" fill="#191521" />
      <rect x="69" y="54" width="20" height="9" rx="4.5" fill="none" stroke="#191521" strokeWidth="1.5" />
    </g>
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={28 + i * 23} y={78} width={18} height={6} rx={3} fill="none" stroke="#453F55" strokeWidth="1.2" />
    ))}
  </svg>
);

const trailPreview = (
  <svg viewBox="0 0 140 90" className="h-full w-full" aria-hidden="true">
    <rect x="0" y="0" width="140" height="90" fill="#F0E8D2" />
    <path d="M -10 28 Q 30 10 70 24 T 150 20" fill="none" stroke="#D9CDA9" strokeWidth="1" />
    <path d="M -10 60 Q 40 82 80 64 T 150 72" fill="none" stroke="#D9CDA9" strokeWidth="1" />
    <path
      d="M 12 78 C 40 80, 58 68, 66 56 C 74 44, 52 40, 44 32 C 37 25, 56 16, 76 18 C 98 20, 116 26, 126 14"
      fill="none" stroke="#3F5A2E" strokeWidth="2.5" strokeDasharray="3 5" strokeLinecap="round"
    />
    {[
      { x: 12, y: 78, c: '#8F3B45', done: true },
      { x: 66, y: 56, c: '#456650', done: false },
      { x: 44, y: 32, c: '#8F3B45', done: true },
      { x: 76, y: 18, c: '#6F5C32', done: false },
      { x: 126, y: 14, c: '#4A6379', done: false },
    ].map((p, i) => (
      <g key={i}>
        <circle cx={p.x} cy={p.y} r="6" fill={p.done ? p.c : '#F8F3E3'} stroke={p.c} strokeWidth="2" />
        {p.done && <rect x={p.x - 1.5} y={p.y - 3.5} width="3" height="7" rx="1" fill="#FFFFFF" />}
      </g>
    ))}
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
  {
    slug: 'lattice',
    name: 'Lattice',
    tagline: 'Skills are pads, prerequisites are copper — walk the traces.',
    description:
      'The prerequisite graph is the navigation itself, rendered as a dark printed circuit board: connected components become walkable nets of pads and copper traces, isolated skills sit honestly in a loose-pins bin, and completing a skill solders the joint and lights every downstream trace.',
    vibe: ['Dark PCB', 'Copper & gold', 'Graph walk', 'Silkscreen mono'],
    accent: '#F0C33C',
    addedDate: '2026-08-16',
    preview: latticePreview,
    Component: lazy(() => import('@/designs/lattice')),
  },
  {
    slug: 'frontier',
    name: 'Frontier',
    tagline: 'Your progress is the map.',
    description:
      'The library reorganized around where you stand: covered ground behind you, a dawn-lit frontier of skills whose groundwork is already done, and reachable ridges beyond — every completion visibly migrates the territory.',
    vibe: ['Expedition at dawn', 'Indigo & coral', 'Living dashboard', 'Never locked'],
    accent: '#FF8A5C',
    addedDate: '2026-08-16',
    preview: frontierPreview,
    Component: lazy(() => import('@/designs/frontier')),
  },
  {
    slug: 'tempo',
    name: 'Tempo',
    tagline: 'Fit practice into the time you actually have.',
    description:
      'Skills organized by minutes instead of domains: a chunky time dial reshapes the library to what fits your moment, a session builder assembles blocks that sum exactly to your budget, and completion dates become an honest ledger of invested practice.',
    vibe: ['Timepiece', 'White dial', 'Tabular numerals', 'Sweep-hand red'],
    accent: '#E8442F',
    addedDate: '2026-08-16',
    preview: tempoPreview,
    Component: lazy(() => import('@/designs/tempo')),
  },
  {
    slug: 'rooms',
    name: 'Rooms',
    tagline: 'Walk into the room where the skill lives.',
    description:
      'The 233 skills re-shelved by where in life they happen — a dwelling at dusk whose kitchen, laundry corner, front door, street, and phone cross-cut the domain taxonomy entirely; every completion turns on another light in the house.',
    vibe: ['Dusk', 'Cozy', 'Lamp-lit', 'Cross-cut'],
    accent: '#F0B860',
    addedDate: '2026-08-16',
    preview: roomsPreview,
    Component: lazy(() => import('@/designs/rooms')),
  },
  {
    slug: 'today',
    name: 'Today',
    tagline: 'One skill, dealt fresh every day.',
    description:
      'Anti-browsing: the whole app is one full-bleed card dealt deterministically each day — do it, keep it, or warmly pass — with mood chips that re-deal in context and a quiet corner index for the days you need one specific skill.',
    vibe: ['One card a day', 'Anti-browsing', 'Near-black stage', 'No streaks'],
    accent: '#FFC94B',
    addedDate: '2026-08-16',
    preview: todayPreview,
    Component: lazy(() => import('@/designs/today')),
  },
  {
    slug: 'trail',
    name: 'Trail',
    tagline: 'All 233 skills, one continuous path.',
    description:
      'The whole library as a single winding trail: a deterministic easy-to-hard ordering drawn as one dashed serpentine, every skill a tappable waypoint, completions painted on as berry blazes — walk it in order or wander, nothing is locked.',
    vibe: ['Topo parchment', 'One long path', 'Trail blazes', 'Wander freely'],
    accent: '#C9737E',
    addedDate: '2026-08-16',
    preview: trailPreview,
    Component: lazy(() => import('@/designs/trail')),
  },
];
