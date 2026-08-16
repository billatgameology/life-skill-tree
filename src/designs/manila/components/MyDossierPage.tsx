import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { LayoutGrid, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { UserData } from '@/lib/types';
import { useManila } from '../context';
import { CARDS, DRAWERS, MA_BASE, TOTAL_CARDS, accessionLog, filedCount } from '../derive';
import { DotLeaderRow, Paperclip, PencilBar } from './bits';
import { paperGrain } from '../surfaces';

/** My Dossier: the inventory sheet, the accession log, and the clipped stack. */
export default function MyDossierPage({
  user,
  onSignIn,
}: {
  user: UserData | null;
  onSignIn: () => void;
}) {
  const { currentUser, signOutUser } = useAuth();
  const { completedIds, favoriteIds, completionDates } = useManila();
  const log = accessionLog(completionDates);

  let onFileSince = '';
  if (currentUser && user?.firstVisitDate) {
    try {
      onFileSince = format(parseISO(user.firstVisitDate), 'MMMM yyyy');
    } catch {
      onFileSince = '';
    }
  }

  const clipped = favoriteIds
    .map((id) => CARDS[id])
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="mx-auto max-w-[860px] px-4 pb-10 pt-6 sm:px-6">
      <h1 className="ma-chrome text-xl font-bold text-[var(--ma-manila)]">My Dossier</h1>
      <p className="ma-body mt-0.5 text-[13px] text-[var(--ma-manila)]/70">
        Your personnel file — everything you've filed, in your own hand.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {/* Inventory sheet */}
        <section
          className="rounded-sm border border-black/30 bg-[var(--ma-card)] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.4)] sm:p-5"
          style={paperGrain()}
        >
          <p className="ma-type mb-3 border-b-2 border-[var(--ma-rule)] pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--ma-ink)]">
            Inventory sheet
          </p>
          <div className="space-y-2">
            {DRAWERS.map((d) => {
              const filed = filedCount(d, completedIds);
              return (
                <Link key={d.domain} to={`${MA_BASE}/drawer/${d.domain}`} className="block hover:opacity-75">
                  <DotLeaderRow label={d.name} value={`${filed}/${d.cards.length}`} tint={d.tint} />
                  <div className="mt-1">
                    <PencilBar done={filed} total={d.cards.length} tint={d.tint} />
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="ma-type mt-4 border-t-2 border-[var(--ma-ink)] pt-2 text-[13px] font-bold uppercase tracking-wide text-[var(--ma-ink)]" style={{ borderBottom: '3px double var(--ma-ink)', paddingBottom: 6 }}>
            Total on file: {completedIds.length} / {TOTAL_CARDS}
            {onFileSince && (
              <span className="ml-2 text-[9.5px] font-normal text-[var(--ma-graphite)]">
                on file since {onFileSince}
              </span>
            )}
          </p>
        </section>

        <div className="space-y-4">
          {/* Accession log */}
          <section
            className="rounded-sm border border-black/30 bg-[var(--ma-card)] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.4)] sm:p-5"
            style={paperGrain()}
          >
            <p className="ma-type mb-2 border-b-2 border-[var(--ma-rule)] pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--ma-ink)]">
              Accession log <span className="font-normal text-[var(--ma-graphite)]">— everything you've filed</span>
            </p>
            {log.length === 0 ? (
              <p className="ma-body py-3 text-[12.5px] text-[var(--ma-graphite)]">
                Nothing on file yet. Pull a card from any drawer and stamp your first filing.
              </p>
            ) : (
              <div className="max-h-[340px] space-y-3 overflow-y-auto pr-1">
                {log.map((month) => (
                  <div key={month.label}>
                    <p className="ma-type text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--ma-graphite)]">
                      {month.label}
                    </p>
                    <ul>
                      {month.entries.map(({ card, dateLabel }) => (
                        <li key={card.skill.id}>
                          <Link
                            to={`${MA_BASE}/drawer/${card.drawer.domain}/card/${card.skill.id}`}
                            className="ma-type flex items-baseline gap-2 py-0.5 text-[12px] hover:underline"
                          >
                            <span className="w-12 shrink-0 text-[9.5px] uppercase text-[var(--ma-stamp)]">{dateLabel}</span>
                            <span className="min-w-0 flex-1 truncate text-[var(--ma-ink)]">{card.skill.title}</span>
                            <span className="shrink-0 text-[9.5px] text-[var(--ma-graphite)]">{card.callNumber}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Clipped stack */}
          <section
            className="rounded-sm border border-black/30 bg-[var(--ma-card)] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.4)] sm:p-5"
            style={paperGrain()}
          >
            <p className="ma-type mb-2 border-b-2 border-[var(--ma-rule)] pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--ma-ink)]">
              Clipped <span className="font-normal text-[var(--ma-graphite)]">— saved for later</span>
            </p>
            {clipped.length === 0 ? (
              <p className="ma-body py-2 text-[12.5px] text-[var(--ma-graphite)]">
                Clip a card to keep it on your desk.
              </p>
            ) : (
              <ul>
                {clipped.map((card) => (
                  <li key={card.skill.id}>
                    <Link
                      to={`${MA_BASE}/drawer/${card.drawer.domain}/card/${card.skill.id}`}
                      className="ma-type flex items-center gap-2 py-1 text-[12px] text-[var(--ma-ink)] hover:underline"
                    >
                      <Paperclip size={12} />
                      <span className="min-w-0 flex-1 truncate">{card.skill.title}</span>
                      <span className="shrink-0 text-[9.5px] text-[var(--ma-graphite)]">{card.callNumber}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Account */}
          <section className="rounded-sm border border-black/40 bg-black/20 p-4">
            {currentUser ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="ma-chrome min-w-0 flex-1 truncate text-[13px] font-semibold text-[var(--ma-manila)]">
                  {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={() => void signOutUser()}
                  className="ma-chrome flex items-center gap-1.5 rounded border border-[var(--ma-manila)]/30 px-3 py-2 text-[12px] font-semibold text-[var(--ma-manila)]/80 hover:text-[var(--ma-manila)]"
                >
                  <LogOut size={13} /> Sign out
                </button>
              </div>
            ) : (
              <div>
                <p className="ma-body text-[12.5px] leading-relaxed text-[var(--ma-manila)]/75">
                  Sign in to keep your filings and clips — they carry across every design of
                  this app.
                </p>
                <button
                  onClick={onSignIn}
                  className="ma-chrome mt-3 flex items-center gap-1.5 rounded bg-[var(--ma-brass)] px-4 py-2 text-[12.5px] font-bold text-[#2A211B] hover:brightness-110"
                >
                  <LogIn size={13} /> Sign in
                </button>
              </div>
            )}
          </section>

          <Link
            to="/"
            className="ma-chrome flex w-fit items-center gap-2 text-[12.5px] font-semibold text-[var(--ma-manila)]/60 hover:text-[var(--ma-manila)]"
          >
            <LayoutGrid size={13} /> All designs
          </Link>
        </div>
      </div>
    </div>
  );
}
