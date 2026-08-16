import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { SKILL_MAP } from '@/data/skills';
import { useTempo } from '../context';
import { TP_BASE, investedMinutes } from '../time';

/**
 * Persistent progress strip while a session is running — visible on every
 * screen so the queue is never lost. Each segment links to its skill.
 */
export default function SessionStrip() {
  const { session, endSession } = useTempo();
  if (session?.stage !== 'run') return null;

  const logged = investedMinutes(session.loggedIds);

  return (
    <div className="z-20 flex h-12 shrink-0 items-center gap-3 border-b border-[var(--tp-hairline)] bg-[var(--tp-card)] px-3 sm:px-5">
      <Link
        to={`${TP_BASE}/session`}
        className="tp-mono flex min-h-[44px] shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--tp-red)]"
        title="Session overview"
      >
        <span aria-hidden className="tp-rec h-2 w-2 rounded-full bg-[var(--tp-red)]" />
        Session
      </Link>

      <div className="flex min-w-0 flex-1 gap-1" role="group" aria-label="Session queue">
        {session.slots.map((id, i) => {
          const skill = SKILL_MAP[id];
          const state = i < session.current ? 'done' : i === session.current ? 'current' : 'upcoming';
          const cls =
            state === 'done'
              ? 'bg-[var(--tp-ink)] text-[var(--tp-dial)] border-[var(--tp-ink)]'
              : state === 'current'
                ? 'border-[var(--tp-red)] text-[var(--tp-ink)] bg-[var(--tp-dial)]'
                : 'border-[var(--tp-hairline)] text-[var(--tp-ink2)] bg-[var(--tp-ground)]';
          return (
            <Link
              key={id}
              to={`${TP_BASE}/skill/${id}`}
              aria-label={`Slot ${i + 1}: ${skill?.title ?? id}${state === 'current' ? ' (current)' : state === 'done' ? ' (done)' : ''}`}
              aria-current={state === 'current' ? 'step' : undefined}
              className={`tp-mono flex h-11 min-w-0 flex-1 items-center justify-center rounded border-[1.5px] text-[12px] font-bold ${cls}`}
            >
              {skill?.estimatedMinutes ?? '·'}
            </Link>
          );
        })}
      </div>

      <span className="tp-mono shrink-0 text-[11px] text-[var(--tp-ink2)]">
        <span className="font-bold text-[var(--tp-ink)]">{logged}</span>/{session.budget} min
      </span>

      <button
        onClick={endSession}
        aria-label="End session"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-[var(--tp-ink2)] transition-colors hover:text-[var(--tp-ink)]"
      >
        <X size={16} />
      </button>
    </div>
  );
}
