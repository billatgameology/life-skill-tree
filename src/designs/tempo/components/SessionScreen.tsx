import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Check, ChevronRight, Play, RefreshCw, X } from 'lucide-react';
import { SKILL_MAP } from '@/data/skills';
import { useTempo } from '../context';
import { SESSION_BUDGETS, TP_BASE, formatDuration, investedMinutes } from '../time';
import { DiffTag, DomainChip, LoggedCheck } from './bits';

function BudgetPicker({ active, onPick }: { active: number | null; onPick: (b: number) => void }) {
  return (
    <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="Session budget">
      {SESSION_BUDGETS.map((b) => {
        const selected = active === b;
        return (
          <button
            key={b}
            onClick={() => onPick(b)}
            aria-pressed={selected}
            aria-label={`${b} minute session`}
            className={`relative flex h-[72px] w-[62px] flex-col items-center justify-center rounded-md border transition-colors sm:w-[72px] ${
              selected
                ? 'border-[var(--tp-ink)] bg-[var(--tp-ink)] text-[var(--tp-dial)]'
                : 'border-[var(--tp-hairline)] bg-[var(--tp-card)] text-[var(--tp-ink)] hover:border-[var(--tp-ink2)]'
            }`}
          >
            {selected && (
              <span aria-hidden className="absolute inset-x-4 top-0 h-[3px] rounded-b bg-[var(--tp-red)]" />
            )}
            <span className="tp-mono text-[26px] font-bold leading-none">{b}</span>
            <span
              className={`tp-mono mt-1 text-[9px] uppercase tracking-[0.18em] ${
                selected ? 'text-[var(--tp-dial)] opacity-70' : 'text-[var(--tp-ink2)]'
              }`}
            >
              min
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** A queue slot in the plan/run views. */
function SlotCard({
  skillId,
  index,
  status,
  onSwap,
}: {
  skillId: string;
  index: number;
  status: 'plan' | 'done' | 'current' | 'upcoming';
  onSwap?: (index: number) => void;
}) {
  const skill = SKILL_MAP[skillId];
  if (!skill) return null;
  const border =
    status === 'current'
      ? 'border-[var(--tp-red)]'
      : status === 'done'
        ? 'border-[var(--tp-hairline)] opacity-60'
        : 'border-[var(--tp-hairline)]';

  return (
    <div className={`flex items-center gap-3 rounded-md border bg-[var(--tp-card)] px-3 py-3 ${border}`}>
      <span className="tp-mono w-10 shrink-0 text-center">
        <span className="block text-[24px] font-bold leading-none text-[var(--tp-ink)]">
          {skill.estimatedMinutes}
        </span>
        <span className="mt-0.5 block text-[8px] uppercase tracking-[0.18em] text-[var(--tp-ink2)]">min</span>
      </span>
      <span aria-hidden className="h-9 w-px shrink-0 bg-[var(--tp-hairline)]" />
      <Link to={`${TP_BASE}/skill/${skill.id}`} className="min-w-0 flex-1">
        <span className="tp-display block truncate text-[15px] font-semibold text-[var(--tp-ink)]">
          {skill.title}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <DomainChip domain={skill.domain} />
          <DiffTag difficulty={skill.difficulty} />
        </span>
      </Link>
      {status === 'done' && <LoggedCheck />}
      {status === 'current' && (
        <span className="tp-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--tp-red)]">
          Now
        </span>
      )}
      {onSwap && (
        <button
          onClick={() => onSwap(index)}
          aria-label={`Swap slot ${index + 1} for a different skill`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--tp-hairline)] text-[var(--tp-ink2)] transition-colors hover:border-[var(--tp-ink2)] hover:text-[var(--tp-ink)]"
        >
          <RefreshCw size={15} aria-hidden />
        </button>
      )}
    </div>
  );
}

export default function SessionScreen() {
  const navigate = useNavigate();
  const { session, planSession, swapSessionSlot, startSession, endSession } = useTempo();

  // One gentle burst when a session finishes.
  const celebrated = useRef(false);
  useEffect(() => {
    if (session?.stage !== 'done') {
      celebrated.current = false;
      return;
    }
    if (celebrated.current || session.loggedIds.length === 0) return;
    celebrated.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    confetti({
      particleCount: 50,
      spread: 75,
      startVelocity: 28,
      gravity: 1.0,
      scalar: 0.85,
      ticks: 110,
      zIndex: 200,
      colors: ['#C81E14', '#121316', '#FAFAF7', '#C9C9C1'],
    });
  }, [session]);

  // ── No session yet: the pitch + budget picker ──
  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:pt-12">
        <h1 className="tp-display text-center text-[26px] font-bold leading-tight text-[var(--tp-ink)] sm:text-[32px]">
          Got a longer stretch?
        </h1>
        <p className="tp-sans mx-auto mt-2 max-w-md text-center text-[14px] leading-relaxed text-[var(--tp-ink2)]">
          Pick a block and Tempo assembles 2–3 skills that fill it exactly — different corners
          of life, unfinished first. Swap any slot until it feels right.
        </p>
        <div className="mt-7">
          <BudgetPicker active={null} onPick={planSession} />
        </div>
      </div>
    );
  }

  const slotSum = investedMinutes(session.slots);

  // ── Plan: review the assembled queue ──
  if (session.stage === 'plan') {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-8">
        <h1 className="tp-display text-center text-[24px] font-bold text-[var(--tp-ink)]">
          Your {session.budget}-minute session
        </h1>
        <div className="mt-5">
          <BudgetPicker active={session.budget} onPick={planSession} />
        </div>

        <div className="mt-7 space-y-2.5">
          {session.slots.map((id, i) => (
            <SlotCard key={id} skillId={id} index={i} status="plan" onSwap={swapSessionSlot} />
          ))}
        </div>

        <p className="tp-mono mt-4 text-center text-[12px] uppercase tracking-[0.14em] text-[var(--tp-ink2)]">
          {session.slots.map((id) => SKILL_MAP[id]?.estimatedMinutes ?? 0).join(' + ')} ={' '}
          <span className="font-bold text-[var(--tp-ink)]">{slotSum}</span> of {session.budget} min
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              const first = startSession();
              if (first) navigate(`${TP_BASE}/skill/${first}`);
            }}
            className="tp-display inline-flex h-12 items-center gap-2 rounded-md bg-[var(--tp-red)] px-6 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
          >
            <Play size={16} className="fill-white" aria-hidden />
            Start session
          </button>
          <button
            onClick={endSession}
            className="tp-mono inline-flex h-12 items-center gap-1.5 rounded-md border border-[var(--tp-hairline)] px-4 text-[11px] uppercase tracking-[0.1em] text-[var(--tp-ink2)] transition-colors hover:border-[var(--tp-ink2)] hover:text-[var(--tp-ink)]"
          >
            <X size={13} aria-hidden />
            Discard
          </button>
        </div>
      </div>
    );
  }

  // ── Run: session in progress ──
  if (session.stage === 'run') {
    const currentId = session.slots[session.current];
    return (
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-8">
        <p className="tp-mono text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tp-red)]">
          Session in progress
        </p>
        <h1 className="tp-display mt-1 text-center text-[24px] font-bold text-[var(--tp-ink)]">
          {formatDuration(investedMinutes(session.loggedIds))} logged of {session.budget} min
        </h1>

        <div className="mt-7 space-y-2.5">
          {session.slots.map((id, i) => (
            <SlotCard
              key={id}
              skillId={id}
              index={i}
              status={i < session.current ? 'done' : i === session.current ? 'current' : 'upcoming'}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(`${TP_BASE}/skill/${currentId}`)}
            className="tp-display inline-flex h-12 items-center gap-2 rounded-md bg-[var(--tp-ink)] px-6 text-[15px] font-bold text-[var(--tp-dial)] transition-opacity hover:opacity-85"
          >
            Resume
            <ChevronRight size={16} aria-hidden />
          </button>
          <button
            onClick={endSession}
            className="tp-mono inline-flex h-12 items-center gap-1.5 rounded-md border border-[var(--tp-hairline)] px-4 text-[11px] uppercase tracking-[0.1em] text-[var(--tp-ink2)] transition-colors hover:border-[var(--tp-ink2)] hover:text-[var(--tp-ink)]"
          >
            <X size={13} aria-hidden />
            End session
          </button>
        </div>
      </div>
    );
  }

  // ── Done: the summary ──
  const loggedMin = investedMinutes(session.loggedIds);
  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-10 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--tp-red)]">
        <Check size={30} strokeWidth={3} className="text-[var(--tp-red)]" aria-hidden />
      </span>
      <h1 className="tp-display mt-4 text-[26px] font-bold text-[var(--tp-ink)]">Session complete</h1>
      <p className="tp-sans mt-1 text-[14px] text-[var(--tp-ink2)]">
        {session.loggedIds.length > 0 ? (
          <>
            You fit <span className="tp-mono font-bold text-[var(--tp-ink)]">{formatDuration(loggedMin)}</span> of
            real-life practice into this block.
          </>
        ) : (
          'That block is over — nothing logged this time, and that is fine.'
        )}
      </p>

      {session.loggedIds.length > 0 && (
        <div className="mx-auto mt-6 max-w-md text-left">
          {session.loggedIds.map((id) => {
            const s = SKILL_MAP[id];
            if (!s) return null;
            return (
              <Link
                key={id}
                to={`${TP_BASE}/skill/${id}`}
                className="flex min-h-[44px] items-center gap-3 border-b border-[var(--tp-hairline)] py-2 last:border-b-0"
              >
                <Check size={14} strokeWidth={3} className="shrink-0 text-[var(--tp-red)]" aria-hidden />
                <span className="tp-display min-w-0 flex-1 truncate text-[14px] font-semibold text-[var(--tp-ink)]">
                  {s.title}
                </span>
                <span className="tp-mono text-[12px] text-[var(--tp-ink2)]">{s.estimatedMinutes} min</span>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-7 flex items-center justify-center gap-3">
        <button
          onClick={endSession}
          className="tp-display inline-flex h-12 items-center rounded-md bg-[var(--tp-ink)] px-6 text-[15px] font-bold text-[var(--tp-dial)] transition-opacity hover:opacity-85"
        >
          Build another
        </button>
        <Link
          to={`${TP_BASE}/invested`}
          className="tp-mono inline-flex h-12 items-center rounded-md border border-[var(--tp-hairline)] px-4 text-[11px] uppercase tracking-[0.1em] text-[var(--tp-ink2)] transition-colors hover:border-[var(--tp-ink2)] hover:text-[var(--tp-ink)]"
        >
          See time invested
        </Link>
      </div>
    </div>
  );
}
