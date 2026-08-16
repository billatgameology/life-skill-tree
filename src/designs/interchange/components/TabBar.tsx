import { Link, useLocation } from 'react-router-dom';
import { TrainFront, Route as RouteIcon, Flag, CircleUser } from 'lucide-react';
import { IC_BASE } from '../lineMeta';

const TABS = [
  { id: 'lines', label: 'Lines', to: IC_BASE, Icon: TrainFront },
  { id: 'journeys', label: 'Journeys', to: `${IC_BASE}/journeys`, Icon: RouteIcon },
  { id: 'saved', label: 'Saved stops', to: `${IC_BASE}/saved`, Icon: Flag },
  { id: 'you', label: 'You', to: `${IC_BASE}/you`, Icon: CircleUser },
];

function activeTab(pathname: string): string {
  if (pathname.startsWith(`${IC_BASE}/journey`)) return 'journeys';
  if (pathname.startsWith(`${IC_BASE}/saved`)) return 'saved';
  if (pathname.startsWith(`${IC_BASE}/you`)) return 'you';
  return 'lines';
}

/** Mobile bottom tab bar (hidden on desktop, where the rail covers navigation). */
export default function TabBar() {
  const { pathname } = useLocation();
  const active = activeTab(pathname);

  return (
    <nav
      className="z-30 grid shrink-0 grid-cols-4 border-t border-[var(--ic-rule)] bg-[var(--ic-paper)] pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Main"
    >
      {TABS.map(({ id, label, to, Icon }) => {
        const isActive = active === id;
        return (
          <Link
            key={id}
            to={to}
            className={`relative flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
              isActive ? 'text-[var(--ic-ink)]' : 'text-[var(--ic-ink2)]'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {isActive && <span className="absolute inset-x-4 top-0 h-0.5 bg-[var(--ic-ink)]" />}
            <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
