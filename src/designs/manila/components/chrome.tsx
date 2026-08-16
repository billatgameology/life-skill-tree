import { Link, useLocation } from 'react-router-dom';
import { Archive, FolderClosed, Search, FileText, LayoutGrid } from 'lucide-react';
import { useManila } from '../context';
import { MA_BASE, TOTAL_CARDS } from '../derive';
import { woodFace } from '../surfaces';

const TABS = [
  { id: 'cabinet', label: 'Cabinet', to: MA_BASE, Icon: Archive },
  { id: 'dossiers', label: 'Dossiers', to: `${MA_BASE}/dossiers`, Icon: FolderClosed },
  { id: 'lookup', label: 'Lookup', to: `${MA_BASE}/lookup`, Icon: Search },
  { id: 'desk', label: 'My Dossier', to: `${MA_BASE}/desk`, Icon: FileText },
];

function activeTab(pathname: string): string {
  if (pathname.startsWith(`${MA_BASE}/dossier`)) return 'dossiers';
  if (pathname.startsWith(`${MA_BASE}/lookup`)) return 'lookup';
  if (pathname.startsWith(`${MA_BASE}/desk`)) return 'desk';
  return 'cabinet';
}

/** Desktop top rail: walnut bar with a brass title plate. */
export function TopRail() {
  const { completedIds, openLookup } = useManila();
  const { pathname } = useLocation();
  const active = activeTab(pathname);

  return (
    <header
      className="relative z-30 hidden h-14 shrink-0 items-center gap-4 border-b border-black/40 px-4 shadow-[0_2px_8px_rgba(0,0,0,0.35)] md:flex"
      style={woodFace(true)}
    >
      <Link
        to={MA_BASE}
        className="flex items-center gap-2.5 rounded border border-[var(--ma-brass)]/70 bg-[var(--ma-brass)]/12 px-3 py-1"
        title="The cabinet"
      >
        <span className="ma-chrome text-[14px] font-bold tracking-tight text-[var(--ma-brass)]">
          Life Skill Tree
        </span>
        <span className="ma-type text-[9px] uppercase tracking-[0.22em] text-[var(--ma-manila)]/80">
          Card Catalog
        </span>
      </Link>

      <nav className="flex items-center gap-1" aria-label="Main">
        {TABS.filter((t) => t.id !== 'lookup').map(({ id, label, to }) => (
          <Link
            key={id}
            to={to}
            aria-current={active === id ? 'page' : undefined}
            className={`ma-chrome rounded px-3 py-1.5 text-[13px] font-semibold transition-colors ${
              active === id
                ? 'bg-black/25 text-[var(--ma-brass)]'
                : 'text-[var(--ma-manila)]/75 hover:text-[var(--ma-manila)]'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <button
        onClick={openLookup}
        className="ma-type ml-auto flex h-9 w-56 items-center gap-2 rounded border border-black/40 bg-[var(--ma-card)] px-3 text-left text-[12px] text-[var(--ma-graphite)] shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)] transition-colors hover:border-[var(--ma-brass)]"
      >
        <Search size={13} />
        <span className="flex-1">Lookup a card…</span>
        <kbd className="rounded border border-[var(--ma-ink)]/20 px-1 text-[10px]">/</kbd>
      </button>

      <span className="ma-type text-[12px] text-[var(--ma-manila)]/85" title="Cards filed">
        <span className="font-bold text-[var(--ma-brass)]">{completedIds.length}</span>
        {' / '}
        {TOTAL_CARDS} filed
      </span>

      <Link
        to="/"
        className="flex h-9 w-9 items-center justify-center rounded border border-black/40 bg-black/20 text-[var(--ma-manila)]/70 transition-colors hover:text-[var(--ma-manila)]"
        title="All designs"
        aria-label="Back to the design gallery"
      >
        <LayoutGrid size={15} />
      </Link>
    </header>
  );
}

/** Mobile bottom tab bar: walnut with a brass active underline. */
export function MobileTabBar() {
  const { pathname } = useLocation();
  const active = activeTab(pathname);

  return (
    <nav
      className="z-30 grid shrink-0 grid-cols-4 border-t border-black/50 pb-[env(safe-area-inset-bottom)] md:hidden"
      style={woodFace(true)}
      aria-label="Main"
    >
      {TABS.map(({ id, label, to, Icon }) => {
        const isActive = active === id;
        return (
          <Link
            key={id}
            to={to}
            aria-current={isActive ? 'page' : undefined}
            className={`ma-chrome relative flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
              isActive ? 'text-[var(--ma-brass)]' : 'text-[var(--ma-manila)]/65'
            }`}
          >
            {isActive && <span className="absolute inset-x-5 top-0 h-0.5 bg-[var(--ma-brass)]" />}
            <Icon size={17} strokeWidth={isActive ? 2.3 : 1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
