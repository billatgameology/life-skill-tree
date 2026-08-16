import { Link, useLocation } from 'react-router-dom';
import { BookOpen, LayoutGrid, Mountain, Search, Tent } from 'lucide-react';
import { useFrontier } from '../context';
import { FR_BASE, TOTAL } from '../expedition';

/** Small rising-sun glyph for the wordmark. */
function DawnGlyph() {
  return (
    <svg viewBox="0 0 24 16" width="22" height="15" aria-hidden className="shrink-0">
      <line x1="1" y1="14" x2="23" y2="14" stroke="var(--fr-dawn)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 14 a6 6 0 0 1 12 0" fill="none" stroke="var(--fr-ember)" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="12" y1="2" x2="12" y2="4.5" stroke="var(--fr-ember)" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="4.5" y1="5.5" x2="6.2" y2="7.2" stroke="var(--fr-ember)" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="19.5" y1="5.5" x2="17.8" y2="7.2" stroke="var(--fr-ember)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const NAV = [
  { to: FR_BASE, label: 'Camp', icon: Tent, exact: true },
  { to: `${FR_BASE}/ahead`, label: 'Ahead', icon: Mountain, exact: false },
  { to: `${FR_BASE}/logbook`, label: 'Logbook', icon: BookOpen, exact: false },
];

function isActive(pathname: string, to: string, exact: boolean): boolean {
  return exact ? pathname === to || pathname === `${to}/` : pathname.startsWith(to);
}

/** Top chrome: wordmark, desktop nav, scout, back to the gallery — plus the
 * ever-present horizon strip showing covered ground. */
export function TopBar() {
  const { completedIds, openScout } = useFrontier();
  const { pathname } = useLocation();
  const pct = Math.round((completedIds.length / TOTAL) * 100);

  return (
    <header className="shrink-0 border-b border-[var(--fr-line)] bg-[var(--fr-deep)]">
      <div className="mx-auto flex h-14 max-w-[1160px] items-center gap-2 px-3 sm:px-5">
        <Link to={FR_BASE} className="flex min-h-[44px] items-center gap-2.5 pr-1" title="Base camp">
          <DawnGlyph />
          <span className="fr-display text-[15px] font-extrabold uppercase tracking-[0.32em] text-[var(--fr-ink)]">
            Frontier
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Frontier sections">
          {NAV.map(({ to, label, exact }) => {
            const active = isActive(pathname, to, exact);
            return (
              <Link
                key={to}
                to={to}
                className={`fr-mono flex h-9 items-center rounded-md px-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  active
                    ? 'bg-[var(--fr-card)] text-[var(--fr-ember)]'
                    : 'text-[var(--fr-dim)] hover:text-[var(--fr-ink)]'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={openScout}
            aria-label="Scout — find any skill"
            className="fr-mono flex h-11 items-center gap-2 rounded-md px-3 text-[11px] uppercase tracking-[0.14em] text-[var(--fr-dim)] transition-colors hover:bg-[var(--fr-card)] hover:text-[var(--fr-ink)]"
          >
            <Search size={16} aria-hidden />
            <span className="hidden sm:inline">Scout</span>
            <kbd className="hidden rounded border border-[var(--fr-line)] px-1.5 py-0.5 text-[9px] text-[var(--fr-faint)] lg:inline">
              /
            </kbd>
          </button>
          <Link
            to="/"
            aria-label="Back to the design gallery"
            title="All designs"
            className="flex h-11 w-11 items-center justify-center rounded-md text-[var(--fr-faint)] transition-colors hover:bg-[var(--fr-card)] hover:text-[var(--fr-ink)]"
          >
            <LayoutGrid size={16} aria-hidden />
          </Link>
        </div>
      </div>

      {/* Horizon strip: ground covered, always in view. */}
      <div
        className="h-[3px] w-full bg-[#0A0F20]"
        role="img"
        aria-label={`Ground covered: ${completedIds.length} of ${TOTAL} skills`}
      >
        <div
          className="h-full"
          style={{
            width: `${Math.max(pct, completedIds.length > 0 ? 1 : 0)}%`,
            background: 'linear-gradient(to right, #B3542F, #FF8A5C 60%, #FFB454)',
          }}
        />
      </div>
    </header>
  );
}

/** Bottom tabs on mobile. */
export function MobileTabBar() {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Frontier sections"
      className="shrink-0 border-t border-[var(--fr-line)] bg-[var(--fr-deep)] pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch">
        {NAV.map(({ to, label, icon: Icon, exact }) => {
          const active = isActive(pathname, to, exact);
          return (
            <Link
              key={to}
              to={to}
              className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                active ? 'text-[var(--fr-ember)]' : 'text-[var(--fr-dim)]'
              }`}
            >
              <Icon size={19} aria-hidden />
              <span className="fr-mono text-[9.5px] font-bold uppercase tracking-[0.18em]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
