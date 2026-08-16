import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ChevronRight } from 'lucide-react';
import { SKILL_MAP } from '@/data/skills';
import { useTempo } from '../context';
import {
  TOTAL_MINUTES,
  TOTAL_SKILLS,
  TP_BASE,
  formatDay,
  formatDuration,
  investedMinutes,
  monthlyRhythm,
} from '../time';

const RECENT_LIMIT = 25;

/**
 * The honest ledger: completionDates x estimatedMinutes. Accumulation is
 * celebrated; absence is never scolded — no streaks, no chains.
 */
export default function InvestedScreen({
  signedIn,
  onSignIn,
}: {
  signedIn: boolean;
  onSignIn: () => void;
}) {
  const { completedIds, completionDates, favoriteIds, sessionsDone } = useTempo();

  const invested = investedMinutes(completedIds);
  const months = useMemo(() => monthlyRhythm(completionDates), [completionDates]);
  const maxMonth = months.reduce((m, x) => Math.max(m, x.minutes), 0);
  const pct = Math.round((invested / TOTAL_MINUTES) * 100);

  const recent = useMemo(
    () =>
      Object.entries(completionDates)
        .filter(([id]) => SKILL_MAP[id])
        .sort(([ia, a], [ib, b]) => b.localeCompare(a) || ia.localeCompare(ib)),
    [completionDates],
  );

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:pt-12">
      <h1 className="tp-mono text-center text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--tp-ink2)]">
        Time invested
      </h1>

      {/* The big honest number */}
      <p className="tp-mono mt-3 text-center text-[52px] font-bold leading-none text-[var(--tp-ink)] sm:text-[64px]">
        {formatDuration(invested)}
      </p>
      <p className="tp-sans mt-2 text-center text-[14px] text-[var(--tp-ink2)]">
        of real-life practice, {completedIds.length} of {TOTAL_SKILLS} skills logged
      </p>

      {/* Library-time progress */}
      <div className="mx-auto mt-5 max-w-md">
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--tp-ground)]" role="presentation">
          <div
            className="h-full rounded-full bg-[var(--tp-red)]"
            style={{ width: `${Math.min(100, Math.max(invested > 0 ? 1 : 0, pct))}%` }}
          />
        </div>
        <p className="tp-mono mt-1.5 text-center text-[10px] uppercase tracking-[0.14em] text-[var(--tp-ink2)]">
          {pct}% of the library&rsquo;s {formatDuration(TOTAL_MINUTES)}
        </p>
      </div>

      {sessionsDone > 0 && (
        <p className="tp-mono mt-3 text-center text-[11px] uppercase tracking-[0.14em] text-[var(--tp-ink2)]">
          <span className="font-bold text-[var(--tp-ink)]">{sessionsDone}</span>{' '}
          {sessionsDone === 1 ? 'session' : 'sessions'} completed this visit
        </p>
      )}

      {!signedIn && (
        <div className="mx-auto mt-8 max-w-md rounded-md border border-[var(--tp-hairline)] bg-[var(--tp-card)] px-5 py-4 text-center">
          <p className="tp-sans text-[14px] text-[var(--tp-ink)]">
            Sign in and every minute you practice starts counting.
          </p>
          <button
            onClick={onSignIn}
            className="tp-display mt-3 inline-flex h-11 items-center rounded-md bg-[var(--tp-ink)] px-5 text-[14px] font-bold text-[var(--tp-dial)] transition-opacity hover:opacity-85"
          >
            Sign in
          </button>
        </div>
      )}

      {/* Month-by-month rhythm */}
      {months.length > 0 && (
        <section className="mt-10 border-t border-[var(--tp-hairline)] pt-4" aria-label="Monthly rhythm">
          <h2 className="tp-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--tp-ink2)]">
            Your rhythm
          </h2>
          <div className="mt-4 space-y-2">
            {months.map((m) => (
              <div key={m.key} className="flex items-center gap-3">
                <span
                  className={`tp-mono w-[72px] shrink-0 text-[11px] uppercase ${
                    m.isCurrent ? 'font-bold text-[var(--tp-ink)]' : 'text-[var(--tp-ink2)]'
                  }`}
                >
                  {m.label}
                </span>
                <div className="h-[18px] flex-1 rounded-sm bg-[var(--tp-ground)]">
                  {m.minutes > 0 && (
                    <div
                      className={`h-full rounded-sm ${m.isCurrent ? 'bg-[var(--tp-red)]' : 'bg-[var(--tp-ink)]'}`}
                      style={{ width: `${Math.max(3, (m.minutes / maxMonth) * 100)}%` }}
                    />
                  )}
                </div>
                <span className="tp-mono w-[70px] shrink-0 text-right text-[11px] text-[var(--tp-ink2)]">
                  {m.minutes > 0 ? formatDuration(m.minutes) : '—'}
                </span>
              </div>
            ))}
          </div>
          <p className="tp-sans mt-3 text-[12px] text-[var(--tp-ink2)]">
            Quiet months are just quiet months. The total only ever grows.
          </p>
        </section>
      )}

      {signedIn && months.length === 0 && (
        <p className="tp-sans mt-10 border-t border-[var(--tp-hairline)] pt-6 text-center text-[14px] text-[var(--tp-ink2)]">
          Your first logged skill starts the record.{' '}
          <Link to={TP_BASE} className="font-semibold text-[var(--tp-ink)] underline underline-offset-2">
            Find one that fits.
          </Link>
        </p>
      )}

      {/* Recent entries */}
      {recent.length > 0 && (
        <section className="mt-10 border-t border-[var(--tp-hairline)] pt-4" aria-label="Recent entries">
          <h2 className="tp-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--tp-ink2)]">
            The ledger
          </h2>
          <div className="mt-2">
            {recent.slice(0, RECENT_LIMIT).map(([id, date]) => {
              const s = SKILL_MAP[id];
              return (
                <Link
                  key={id}
                  to={`${TP_BASE}/skill/${id}`}
                  className="group flex min-h-[44px] items-center gap-3 border-b border-[var(--tp-hairline)] py-2"
                >
                  <span className="tp-mono w-[86px] shrink-0 text-[11px] uppercase text-[var(--tp-ink2)]">
                    {formatDay(date)}
                  </span>
                  <span className="tp-display min-w-0 flex-1 truncate text-[14px] font-semibold text-[var(--tp-ink)]">
                    {s.title}
                  </span>
                  <span className="tp-mono shrink-0 text-[12px] font-bold text-[var(--tp-red)]">
                    +{s.estimatedMinutes} min
                  </span>
                </Link>
              );
            })}
          </div>
          {recent.length > RECENT_LIMIT && (
            <p className="tp-mono mt-2 text-[10px] uppercase tracking-[0.14em] text-[var(--tp-ink2)]">
              + {recent.length - RECENT_LIMIT} earlier entries
            </p>
          )}
        </section>
      )}

      {/* Pinned for later */}
      <section className="mt-10 border-t border-[var(--tp-hairline)] pt-4" aria-label="Pinned skills">
        <h2 className="tp-mono flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--tp-ink2)]">
          <Bookmark size={11} aria-hidden />
          Pinned for later
        </h2>
        {favoriteIds.length === 0 ? (
          <p className="tp-sans mt-3 text-[13px] text-[var(--tp-ink2)]">
            Pin skills to earmark them for a future block of time.
          </p>
        ) : (
          <div className="mt-2">
            {favoriteIds
              .map((id) => SKILL_MAP[id])
              .filter((s): s is (typeof SKILL_MAP)[string] => Boolean(s))
              .map((s) => (
                <Link
                  key={s.id}
                  to={`${TP_BASE}/skill/${s.id}`}
                  className="group flex min-h-[44px] items-center gap-3 border-b border-[var(--tp-hairline)] py-2"
                >
                  <span className="tp-mono w-8 shrink-0 text-right text-[14px] font-bold text-[var(--tp-ink)]">
                    {s.estimatedMinutes}
                  </span>
                  <span aria-hidden className="tp-mono text-[9px] uppercase text-[var(--tp-ink2)]">min</span>
                  <span className="tp-display min-w-0 flex-1 truncate text-[14px] font-semibold text-[var(--tp-ink)]">
                    {s.title}
                  </span>
                  <ChevronRight
                    size={14}
                    aria-hidden
                    className="shrink-0 text-[var(--tp-tick)] group-hover:text-[var(--tp-ink2)]"
                  />
                </Link>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
