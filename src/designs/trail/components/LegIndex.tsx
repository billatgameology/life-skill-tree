import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useTrail } from '../context';
import { LEGS, TR_BASE, legBlazedCount, type Leg } from '../derive';

interface LegIndexProps {
  open: boolean;
  onClose: () => void;
}

function LegRow({ leg, onPick }: { leg: Leg; onPick: (leg: Leg) => void }) {
  const { completedIds } = useTrail();
  const blazed = legBlazedCount(leg, completedIds);
  const cleared = blazed === leg.stops.length;
  return (
    <li>
      <button
        onClick={() => onPick(leg)}
        className="flex min-h-[52px] w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-[var(--tr-ground)]"
      >
        <span
          className="tr-mono flex h-7 min-w-9 shrink-0 items-center justify-center rounded px-1 text-[10.5px] font-bold text-white"
          style={{ backgroundColor: leg.tint }}
        >
          {leg.roman}
        </span>
        <span className="min-w-0 flex-1">
          <span className="tr-serif block truncate text-[15.5px] font-semibold italic leading-tight">{leg.name}</span>
          <span className="tr-mono block truncate text-[9.5px] uppercase tracking-wider text-[var(--tr-ink2)]">
            Waypoints {leg.startNum}–{leg.endNum} · {leg.pairing}
          </span>
          <span className="mt-1.5 block h-[3px] w-full overflow-hidden rounded-full bg-[var(--tr-rule)]" aria-hidden="true">
            <span
              className="block h-full rounded-full"
              style={{
                width: `${(blazed / leg.stops.length) * 100}%`,
                backgroundColor: cleared ? 'var(--tr-berry)' : leg.tint,
              }}
            />
          </span>
        </span>
        {cleared ? (
          <span className="tr-mono shrink-0 rounded border-[1.5px] border-[var(--tr-berry)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--tr-berry)]">
            Cleared
          </span>
        ) : (
          <span className="tr-mono shrink-0 text-[10.5px] tracking-wider text-[var(--tr-ink2)]">
            {blazed}/{leg.stops.length}
          </span>
        )}
      </button>
    </li>
  );
}

/** The compact leg index — jump anywhere on the ~20,000px trail in one tap. */
export default function LegIndex({ open, onClose }: LegIndexProps) {
  const { requestJump } = useTrail();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const pick = (leg: Leg) => {
    requestJump(`leg-${leg.index}`);
    const onTrailPage = location.pathname === TR_BASE || location.pathname === `${TR_BASE}/`;
    if (!onTrailPage) navigate(TR_BASE);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-[#2E3120]/45 p-4 pt-[7vh] backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Legs of the trail"
    >
      <div
        className="flex max-h-[82vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-[var(--tr-rule)] bg-[var(--tr-panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-[var(--tr-rule)] px-4 py-3">
          <h2 className="tr-serif text-[17px] font-semibold italic">Legs of the trail</h2>
          <span className="tr-mono ml-1 text-[10px] uppercase tracking-wider text-[var(--tr-ink2)]">
            {LEGS.length} legs
          </span>
          <button
            onClick={onClose}
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-md text-[var(--tr-ink2)] hover:bg-[var(--tr-ground)] hover:text-[var(--tr-ink)]"
            aria-label="Close the leg index"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto p-2">
          {LEGS.map((leg) => (
            <LegRow key={leg.index} leg={leg} onPick={pick} />
          ))}
        </ul>
      </div>
    </div>
  );
}
