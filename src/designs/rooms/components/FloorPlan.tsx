import { useNavigate } from 'react-router-dom';
import type { KeyboardEvent, ReactNode } from 'react';
import { useRooms } from '../context';
import { PLACES, PLACE_MAP, RM_BASE, placeProgress, type PlaceId } from '../places';

const CREAM = '#F4E8D6';
const MUTED = '#AEC3BE';
const AMBER = '#F0B860';
const DARK = '#22363C';

/** Clickable bounds for every place in the scene. */
const BOXES: Record<PlaceId, { x: number; y: number; w: number; h: number }> = {
  'bedroom': { x: 80, y: 150, w: 230, h: 210 },
  'bathroom': { x: 310, y: 150, w: 160, h: 210 },
  'quiet-corner': { x: 470, y: 150, w: 200, h: 210 },
  'living-room': { x: 80, y: 375, w: 160, h: 210 },
  'kitchen': { x: 240, y: 375, w: 160, h: 210 },
  'desk': { x: 400, y: 375, w: 95, h: 210 },
  'laundry': { x: 495, y: 375, w: 85, h: 210 },
  'front-door': { x: 580, y: 375, w: 90, h: 210 },
  'phone': { x: 705, y: 330, w: 85, h: 230 },
  'shops': { x: 800, y: 380, w: 120, h: 205 },
  'town': { x: 930, y: 340, w: 120, h: 245 },
  'street': { x: 700, y: 590, w: 360, h: 75 },
};

/** Lamp/window glow opacity from a room's completion fraction. */
function glowOf(done: number, total: number): number {
  const frac = total > 0 ? done / total : 0;
  return 0.12 + 0.78 * frac;
}

/**
 * The dwelling at dusk — a flat, cutaway evening scene. Every room is a
 * clickable region; its window or lamp glows brighter as skills get done.
 * Desktop-first; the mobile room list covers small screens.
 */
export default function FloorPlan() {
  const navigate = useNavigate();
  const { completedIds } = useRooms();

  const progress = Object.fromEntries(
    PLACES.map((p) => [p.id, placeProgress(p.id, completedIds)]),
  ) as Record<PlaceId, { done: number; total: number }>;

  const open = (id: PlaceId) => navigate(`${RM_BASE}/room/${id}`);
  const onKey = (e: KeyboardEvent<SVGGElement>, id: PlaceId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open(id);
    }
  };

  /** Shared wrapper: hit area, frame, labels, then the room's furniture. */
  function room(id: PlaceId, children: ReactNode, opts?: { label?: [number, number]; noFrame?: boolean }) {
    const p = PLACE_MAP[id];
    const b = BOXES[id];
    const { done, total } = progress[id];
    const [lx, ly] = opts?.label ?? [b.x + 12, b.y + 26];
    return (
      <g
        key={id}
        role="link"
        tabIndex={0}
        aria-label={`${p.name} — ${done} of ${total} done`}
        className="rm-room"
        onClick={() => open(id)}
        onKeyDown={(e) => onKey(e, id)}
      >
        <rect className="rm-room-bg" x={b.x} y={b.y} width={b.w} height={b.h} fill={p.tint} fillOpacity={0.12} rx={4} />
        {!opts?.noFrame && (
          <rect className="rm-room-frame" x={b.x} y={b.y} width={b.w} height={b.h} fill="none" stroke="#3B565C" strokeWidth={1.5} rx={4} />
        )}
        {children}
        <text x={lx} y={ly} fill={CREAM} fontSize={13} letterSpacing={1.2} className="rm-body" style={{ textTransform: 'uppercase' }}>
          {p.short}
        </text>
        <text x={lx} y={ly + 17} fill={MUTED} fontSize={11} className="rm-body">
          {done}/{total} done
        </text>
      </g>
    );
  }

  return (
    <svg viewBox="0 0 1060 680" className="h-auto w-full" role="group" aria-label="The dwelling at dusk — pick a place to walk into">
      {/* ── Night sky ── */}
      {[
        [230, 60], [320, 95], [430, 50], [540, 88], [640, 55], [760, 90],
        [830, 45], [900, 110], [980, 70], [1030, 130], [170, 110], [720, 150],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.6 : 1.1} fill={CREAM} opacity={0.45} />
      ))}
      <circle cx={110} cy={72} r={24} fill={CREAM} opacity={0.9} />
      <circle cx={120} cy={65} r={21} fill="var(--rm-night)" />

      {/* ── Ground and road ── */}
      <rect x={0} y={597} width={1060} height={65} fill="#1E3133" />
      <rect x={690} y={600} width={370} height={60} fill="#25323C" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={706 + i * 50} y={628} width={26} height={4} rx={2} fill={CREAM} opacity={0.22} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={826 + i * 13} y={604} width={8} height={52} fill={CREAM} opacity={0.25} />
      ))}
      {/* path from the front door */}
      <polygon points="612,597 648,597 668,660 600,660" fill="#3A4A50" opacity={0.6} />

      {/* ── House shell ── */}
      <rect x={68} y={142} width={614} height={455} fill="#243940" stroke="#3B565C" strokeWidth={2} />
      <rect x={68} y={360} width={614} height={15} fill="#182A2E" />
      <rect x={560} y={72} width={26} height={48} fill="#2E464D" stroke="#3B565C" strokeWidth={2} />
      <polygon points="50,142 375,42 700,142" fill="#2E464D" stroke="#3B565C" strokeWidth={2} />

      {/* ── Upstairs ── */}
      {room('bedroom', (
        <>
          <rect x={240} y={190} width={52} height={64} rx={3} fill={AMBER} fillOpacity={glowOf(progress['bedroom'].done, progress['bedroom'].total)} stroke="#3B565C" className="rm-shimmer" />
          <line x1={266} y1={190} x2={266} y2={254} stroke="#243940" strokeWidth={2} />
          <rect x={100} y={272} width={10} height={80} rx={3} fill={PLACE_MAP['bedroom'].tint} opacity={0.7} />
          <rect x={108} y={322} width={124} height={30} rx={4} fill={PLACE_MAP['bedroom'].tint} opacity={0.55} />
          <rect x={113} y={308} width={34} height={16} rx={5} fill={CREAM} opacity={0.75} />
          <rect x={160} y={322} width={72} height={30} rx={4} fill={PLACE_MAP['bedroom'].tint} opacity={0.85} />
          <ellipse cx={272} cy={354} rx={28} ry={5} fill={CREAM} opacity={0.15} />
        </>
      ))}
      {room('bathroom', (
        <>
          <rect x={430} y={182} width={26} height={34} rx={2} fill={AMBER} fillOpacity={glowOf(progress['bathroom'].done, progress['bathroom'].total)} stroke="#3B565C" className="rm-shimmer" />
          <circle cx={368} cy={228} r={19} fill={PLACE_MAP['bathroom'].tint} opacity={0.25} stroke={CREAM} strokeOpacity={0.4} />
          <rect x={328} y={320} width={100} height={30} rx={14} fill={CREAM} opacity={0.8} />
          <rect x={338} y={350} width={9} height={7} fill={CREAM} opacity={0.5} />
          <rect x={410} y={350} width={9} height={7} fill={CREAM} opacity={0.5} />
          <rect x={428} y={300} width={4} height={22} fill={PLACE_MAP['bathroom'].tint} />
          <rect x={418} y={300} width={14} height={4} fill={PLACE_MAP['bathroom'].tint} />
        </>
      ))}
      {room('quiet-corner', (
        <>
          <circle cx={610} cy={212} r={26} fill={AMBER} fillOpacity={glowOf(progress['quiet-corner'].done, progress['quiet-corner'].total)} stroke="#3B565C" className="rm-shimmer" />
          <line x1={584} y1={212} x2={636} y2={212} stroke="#243940" strokeWidth={2} />
          <line x1={610} y1={186} x2={610} y2={238} stroke="#243940" strokeWidth={2} />
          <rect x={500} y={272} width={16} height={70} rx={6} fill={PLACE_MAP['quiet-corner'].tint} opacity={0.8} />
          <rect x={500} y={322} width={62} height={26} rx={6} fill={PLACE_MAP['quiet-corner'].tint} opacity={0.65} />
          <rect x={552} y={302} width={16} height={46} rx={6} fill={PLACE_MAP['quiet-corner'].tint} opacity={0.5} />
          <rect x={612} y={336} width={16} height={14} rx={2} fill={PLACE_MAP['quiet-corner'].tint} opacity={0.6} />
          <ellipse cx={620} cy={324} rx={5} ry={9} fill={PLACE_MAP['quiet-corner'].tint} opacity={0.8} />
          <ellipse cx={612} cy={328} rx={4} ry={7} fill={PLACE_MAP['quiet-corner'].tint} opacity={0.6} transform="rotate(-24 612 328)" />
        </>
      ))}

      {/* ── Downstairs ── */}
      {room('living-room', (
        <>
          <rect x={120} y={428} width={26} height={20} rx={2} fill={PLACE_MAP['living-room'].tint} opacity={0.35} stroke={CREAM} strokeOpacity={0.4} />
          <circle cx={217} cy={472} r={16} fill={AMBER} fillOpacity={glowOf(progress['living-room'].done, progress['living-room'].total)} className="rm-shimmer" />
          <polygon points="206,472 229,472 222,452" fill={AMBER} opacity={0.85} />
          <rect x={216} y={472} width={3} height={70} fill={PLACE_MAP['living-room'].tint} opacity={0.8} />
          <rect x={100} y={492} width={90} height={26} rx={6} fill={PLACE_MAP['living-room'].tint} opacity={0.7} />
          <rect x={94} y={514} width={102} height={26} rx={6} fill={PLACE_MAP['living-room'].tint} opacity={0.55} />
          <rect x={94} y={500} width={12} height={40} rx={5} fill={PLACE_MAP['living-room'].tint} opacity={0.7} />
          <rect x={184} y={500} width={12} height={40} rx={5} fill={PLACE_MAP['living-room'].tint} opacity={0.7} />
          <ellipse cx={150} cy={576} rx={44} ry={6} fill={CREAM} opacity={0.12} />
        </>
      ))}
      {room('kitchen', (
        <>
          <rect x={336} y={424} width={40} height={60} rx={3} fill={AMBER} fillOpacity={glowOf(progress['kitchen'].done, progress['kitchen'].total)} stroke="#3B565C" className="rm-shimmer" />
          <rect x={256} y={448} width={56} height={4} fill={CREAM} opacity={0.35} />
          <rect x={262} y={432} width={12} height={16} rx={1} fill={PLACE_MAP['kitchen'].tint} opacity={0.7} />
          <rect x={280} y={436} width={10} height={12} rx={1} fill={PLACE_MAP['kitchen'].tint} opacity={0.55} />
          <rect x={256} y={510} width={128} height={14} rx={2} fill={PLACE_MAP['kitchen'].tint} opacity={0.75} />
          <rect x={256} y={524} width={128} height={46} fill={PLACE_MAP['kitchen'].tint} opacity={0.3} />
          <rect x={270} y={494} width={30} height={16} rx={3} fill={CREAM} opacity={0.75} />
          <path d="M285 488 q4 -8 0 -14" stroke={AMBER} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.7} />
        </>
      ))}
      {room('desk', (
        <>
          <circle cx={463} cy={474} r={14} fill={AMBER} fillOpacity={glowOf(progress['desk'].done, progress['desk'].total)} className="rm-shimmer" />
          <polygon points={'452,474 473,474 466,456'} fill={AMBER} opacity={0.85} />
          <rect x={462} y={474} width={3} height={28} fill={PLACE_MAP['desk'].tint} opacity={0.8} />
          <rect x={410} y={502} width={75} height={8} rx={2} fill={PLACE_MAP['desk'].tint} opacity={0.75} />
          <rect x={414} y={510} width={5} height={60} fill={PLACE_MAP['desk'].tint} opacity={0.6} />
          <rect x={476} y={510} width={5} height={60} fill={PLACE_MAP['desk'].tint} opacity={0.6} />
          <rect x={420} y={492} width={20} height={5} rx={1} fill={CREAM} opacity={0.6} />
          <rect x={423} y={487} width={15} height={5} rx={1} fill={CREAM} opacity={0.45} />
        </>
      ))}
      {room('laundry', (
        <>
          <circle cx={562} cy={458} r={8} fill={AMBER} fillOpacity={glowOf(progress['laundry'].done, progress['laundry'].total)} className="rm-shimmer" />
          <rect x={508} y={440} width={58} height={5} fill={CREAM} opacity={0.35} />
          <rect x={510} y={424} width={22} height={14} rx={2} fill={AMBER} opacity={0.6} />
          <rect x={508} y={480} width={58} height={90} rx={6} fill={PLACE_MAP['laundry'].tint} opacity={0.7} />
          <circle cx={537} cy={527} r={21} fill={DARK} />
          <circle cx={537} cy={527} r={13} fill="none" stroke={CREAM} strokeOpacity={0.35} strokeWidth={2} />
          <circle cx={517} cy={491} r={3} fill={CREAM} opacity={0.55} />
        </>
      ))}
      {room('front-door', (
        <>
          <rect x={598} y={436} width={54} height={16} rx={2} fill={AMBER} fillOpacity={glowOf(progress['front-door'].done, progress['front-door'].total)} stroke="#3B565C" className="rm-shimmer" />
          <rect x={598} y={458} width={54} height={112} rx={3} fill={PLACE_MAP['front-door'].tint} opacity={0.8} />
          <circle cx={642} cy={518} r={3.5} fill={CREAM} />
          <rect x={592} y={572} width={66} height={8} rx={3} fill={CREAM} opacity={0.3} />
        </>
      ), { label: [588, 401] })}

      {/* ── Out in the world ── */}
      {room('phone', (
        <>
          <rect x={708} y={336} width={79} height={220} rx={16} fill={DARK} stroke={PLACE_MAP['phone'].tint} strokeWidth={2.5} />
          <rect x={716} y={352} width={63} height={170} rx={6} fill={AMBER} fillOpacity={glowOf(progress['phone'].done, progress['phone'].total)} className="rm-shimmer" />
          <rect x={736} y={342} width={23} height={4} rx={2} fill={CREAM} opacity={0.3} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={724 + (i % 2) * 26} y={364 + Math.floor(i / 2) * 26} width={21} height={19} rx={4} fill={CREAM} opacity={0.3} />
          ))}
          <circle cx={747.5} cy={540} r={4} fill={CREAM} opacity={0.4} />
        </>
      ), { label: [705, 306], noFrame: true })}
      {room('shops', (
        <>
          <rect x={800} y={400} width={120} height={185} fill={PLACE_MAP['shops'].tint} opacity={0.22} stroke={PLACE_MAP['shops'].tint} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={800 + i * 20} y={388} width={20} height={24} fill={i % 2 === 0 ? PLACE_MAP['shops'].tint : CREAM} opacity={i % 2 === 0 ? 0.95 : 0.75} />
          ))}
          <rect x={812} y={440} width={60} height={60} fill={AMBER} fillOpacity={glowOf(progress['shops'].done, progress['shops'].total)} stroke={CREAM} strokeOpacity={0.3} className="rm-shimmer" />
          <rect x={882} y={500} width={26} height={85} fill={CREAM} opacity={0.22} />
        </>
      ), { label: [800, 356], noFrame: true })}
      {room('town', (
        <>
          <rect x={930} y={392} width={120} height={193} fill={PLACE_MAP['town'].tint} opacity={0.22} stroke={PLACE_MAP['town'].tint} />
          <polygon points="924,392 1056,392 990,344" fill={PLACE_MAP['town'].tint} opacity={0.9} />
          <circle cx={990} cy={372} r={10} fill={AMBER} fillOpacity={glowOf(progress['town'].done, progress['town'].total)} className="rm-shimmer" />
          <line x1={990} y1={372} x2={990} y2={366} stroke={DARK} strokeWidth={2} />
          <line x1={990} y1={372} x2={995} y2={374} stroke={DARK} strokeWidth={2} />
          <rect x={944} y={412} width={11} height={150} fill={CREAM} opacity={0.4} />
          <rect x={984} y={412} width={11} height={150} fill={CREAM} opacity={0.4} />
          <rect x={1024} y={412} width={11} height={150} fill={CREAM} opacity={0.4} />
          <rect x={930} y={566} width={120} height={19} fill={PLACE_MAP['town'].tint} opacity={0.5} />
        </>
      ), { label: [930, 316], noFrame: true })}
      {room('street', (
        <>
          <rect x={921} y={498} width={4} height={102} fill={PLACE_MAP['street'].tint} opacity={0.9} />
          <rect x={921} y={496} width={26} height={4} fill={PLACE_MAP['street'].tint} opacity={0.9} />
          <circle cx={949} cy={504} r={7} fill={AMBER} opacity={0.95} />
          <circle cx={949} cy={504} r={17} fill={AMBER} fillOpacity={glowOf(progress['street'].done, progress['street'].total) * 0.5} className="rm-shimmer" />
          <rect x={794} y={540} width={3} height={60} fill={PLACE_MAP['street'].tint} opacity={0.9} />
          <rect x={786} y={526} width={20} height={15} rx={2} fill={PLACE_MAP['street'].tint} opacity={0.85} />
        </>
      ), { label: [770, 632], noFrame: true })}
    </svg>
  );
}
