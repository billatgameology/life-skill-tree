import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { LayoutGrid, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { UserData } from '@/lib/types';
import { useInterchange } from '../context';
import { LINES, TOTAL_STATIONS, visitedCount } from '../lineMeta';
import { BoardLabel, LineBullet, LineStrip, LineFraction } from './atoms';

/**
 * The Spine: one proportional bar for the whole network — each line gets a
 * segment sized by its station count, filled by its visited share.
 */
function Spine({ completedIds }: { completedIds: string[] }) {
  return (
    <div className="flex h-2.5 w-full gap-px overflow-hidden rounded-full" aria-hidden="true">
      {LINES.map((line) => {
        const pct = (visitedCount(line, completedIds) / line.stations.length) * 100;
        return (
          <span
            key={line.domain}
            className="relative min-w-0"
            style={{ flexGrow: line.stations.length, backgroundColor: `${line.color}30` }}
            title={line.name}
          >
            <span
              className="absolute inset-y-0 left-0"
              style={{ width: `${pct}%`, backgroundColor: line.color }}
            />
          </span>
        );
      })}
    </div>
  );
}

/** Network status + account: the "You" screen. */
export default function YouScreen({
  user,
  onSignIn,
}: {
  user: UserData | null;
  onSignIn: () => void;
}) {
  const { currentUser, signOutUser } = useAuth();
  const { completedIds } = useInterchange();

  let ridingSince = '';
  if (currentUser && user?.firstVisitDate) {
    try {
      ridingSince = format(parseISO(user.firstVisitDate), 'MMMM yyyy');
    } catch {
      ridingSince = '';
    }
  }

  return (
    <div className="mx-auto max-w-[680px] px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Network status</h1>

      {/* Headline stats */}
      <div className="mt-5 rounded-lg border border-[var(--ic-rule)] bg-[var(--ic-card)] p-5 sm:p-6">
        <p className="ic-mono text-4xl font-bold tracking-tight">
          {completedIds.length}
          <span className="text-xl text-[var(--ic-ink2)]"> / {TOTAL_STATIONS}</span>
        </p>
        <p className="ic-mono mt-1 text-[10.5px] uppercase tracking-[0.16em] text-[var(--ic-ink2)]">
          stations visited{ridingSince ? ` · riding since ${ridingSince}` : ''}
        </p>
        <div className="mt-4">
          <Spine completedIds={completedIds} />
        </div>
      </div>

      {/* Per-line status */}
      <div className="mt-7">
        <BoardLabel>Line by line</BoardLabel>
        <ul className="overflow-hidden rounded-lg border border-[var(--ic-rule)] bg-[var(--ic-card)]">
          {LINES.map((line) => {
            const complete = visitedCount(line, completedIds) === line.stations.length;
            return (
              <li key={line.domain} className="border-b border-[var(--ic-rule)] px-3.5 py-2.5 last:border-b-0">
                <div className="flex items-center gap-2.5">
                  <LineBullet line={line} size="sm" complete={complete} />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold">{line.name}</span>
                  {complete ? (
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--ic-green)]">
                      Line complete
                    </span>
                  ) : (
                    <LineFraction line={line} completedIds={completedIds} />
                  )}
                </div>
                <div className="mt-1.5 pl-[32px]">
                  <LineStrip line={line} completedIds={completedIds} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Account */}
      <div className="mt-7">
        <BoardLabel>Account</BoardLabel>
        {currentUser ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--ic-rule)] bg-[var(--ic-card)] px-4 py-3.5">
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
              {currentUser.displayName || currentUser.email}
            </span>
            <button
              onClick={() => void signOutUser()}
              className="flex items-center gap-1.5 rounded-md border border-[var(--ic-rule)] px-3 py-2 text-[12px] font-bold text-[var(--ic-ink2)] hover:text-[var(--ic-ink)]"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--ic-rule)] bg-[var(--ic-card)] px-4 py-3.5">
            <p className="text-[13px] leading-relaxed text-[var(--ic-ink2)]">
              Sign in to keep your visited stations and saved stops — they carry across every
              design of this app.
            </p>
            <button
              onClick={onSignIn}
              className="mt-3 flex items-center gap-1.5 rounded-md bg-[var(--ic-ink)] px-4 py-2 text-[12.5px] font-bold text-[var(--ic-paper)] hover:opacity-90"
            >
              <LogIn size={13} /> Sign in
            </button>
          </div>
        )}
      </div>

      <Link
        to="/"
        className="mt-7 flex w-fit items-center gap-2 text-[12.5px] font-semibold text-[var(--ic-ink2)] hover:text-[var(--ic-ink)]"
      >
        <LayoutGrid size={13} /> All designs
      </Link>
    </div>
  );
}
