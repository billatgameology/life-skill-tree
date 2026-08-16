import { Link, useLocation } from 'react-router-dom';
import { Gauge, History, LayoutGrid, ListChecks, Search } from 'lucide-react';
import { useTempo } from '../context';
import { TP_BASE, formatDuration, investedMinutes } from '../time';
import { DialMark } from './bits';

const TABS = [
  { id: 'fit', label: 'Fit', to: TP_BASE, Icon: Gauge },
  { id: 'session', label: 'Session', to: `${TP_BASE}/session`, Icon: ListChecks },
  { id: 'invested', label: 'Invested', to: `${TP_BASE}/invested`, Icon: History },
];

function activeTab(pathname: string): string {
  if (pathname.startsWith(`${TP_BASE}/session`)) return 'session';
  if (pathname.startsWith(`${TP_BASE}/invested`)) return 'invested';
  return 'fit';
}

/** Top bar: wordmark with a live sweep hand, desktop tabs, finder, gallery link. */
export function TopBar() {
  const { completedIds, openFinder, session } = useTempo();
  const { pathname } = useLocation();
  const active = activeTab(pathname);
  const invested = investedMinutes(completedIds);

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center gap-3 border-b border-[var(--tp-hairline)] bg-[var(--tp-card)] px-3 sm:px-5">
      <Link to={TP_BASE} className="flex min-h-[44px] items-center gap-2.5" title="Tempo home">
        <DialMark />
        <span className="tp-display text-[16px] font-bold tracking-[0.14em] text-[var(--tp-ink)]">
          TEMPO
        </span>
      </Link>

      <nav className="ml-2 hidden items-center gap-1 md:flex" aria-label="Main">
        {TABS.map(({ id, label, to }) => (
          <Link
            key={id}
            to={to}
            aria-current={active === id ? 'page' : undefined}
            className={`tp-display relative rounded px-3 py-2 text-[13px] font-semibold transition-colors ${
              active === id
                ? 'text-[var(--tp-ink)]'
                : 'text-[var(--tp-ink2)] hover:text-[var(--tp-ink)]'
            }`}
          >
            {label}
            {id === 'session' && session?.stage === 'run' && (
              <span aria-hidden className="tp-rec absolute right-0.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--tp-red)]" />
            )}
            {active === id && (
              <span aria-hidden className="absolute inset-x-3 bottom-0.5 h-[2px] bg-[var(--tp-red)]" />
            )}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <span
          className="tp-mono hidden text-[11px] text-[var(--tp-ink2)] sm:inline"
          title="Total time invested"
        >
          <span className="font-bold text-[var(--tp-ink)]">{formatDuration(invested)}</span> logged
        </span>

        <button
          onClick={openFinder}
          className="tp-mono hidden h-10 w-52 items-center gap-2 rounded border border-[var(--tp-hairline)] bg-[var(--tp-dial)] px-3 text-left text-[12px] text-[var(--tp-ink2)] transition-colors hover:border-[var(--tp-ink)] md:flex"
        >
          <Search size={13} aria-hidden />
          <span className="flex-1">Find any skill…</span>
          <kbd className="rounded border border-[var(--tp-hairline)] px-1 text-[10px]">/</kbd>
        </button>

        <button
          onClick={openFinder}
          aria-label="Find any skill"
          className="flex h-11 w-11 items-center justify-center rounded border border-[var(--tp-hairline)] text-[var(--tp-ink2)] transition-colors hover:text-[var(--tp-ink)] md:hidden"
        >
          <Search size={17} />
        </button>

        <Link
          to="/"
          title="All designs"
          aria-label="Back to the design gallery"
          className="flex h-11 w-11 items-center justify-center rounded border border-[var(--tp-hairline)] text-[var(--tp-ink2)] transition-colors hover:text-[var(--tp-ink)]"
        >
          <LayoutGrid size={16} />
        </Link>
      </div>
    </header>
  );
}

/** Mobile bottom tabs. */
export function TabBar() {
  const { session } = useTempo();
  const { pathname } = useLocation();
  const active = activeTab(pathname);

  return (
    <nav
      className="z-30 grid shrink-0 grid-cols-3 border-t border-[var(--tp-hairline)] bg-[var(--tp-card)] pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Main"
    >
      {TABS.map(({ id, label, to, Icon }) => {
        const isActive = active === id;
        return (
          <Link
            key={id}
            to={to}
            aria-current={isActive ? 'page' : undefined}
            className={`tp-display relative flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
              isActive ? 'text-[var(--tp-ink)]' : 'text-[var(--tp-ink2)]'
            }`}
          >
            {isActive && <span aria-hidden className="absolute inset-x-6 top-0 h-[2px] bg-[var(--tp-red)]" />}
            <span className="relative">
              <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} aria-hidden />
              {id === 'session' && session?.stage === 'run' && (
                <span aria-hidden className="tp-rec absolute -right-1.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[var(--tp-red)]" />
              )}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
