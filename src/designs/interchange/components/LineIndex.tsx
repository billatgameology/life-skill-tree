import { Link, useLocation } from 'react-router-dom';
import { Route as RouteIcon, Flag, CircleUser, ChevronRight } from 'lucide-react';
import { useInterchange } from '../context';
import { IC_BASE, LINES, visitedCount } from '../lineMeta';
import { LineBullet, LineStrip, LineFraction } from './atoms';

/**
 * The 15-line index. Renders as the permanent desktop rail and as the
 * mobile "Lines" home screen (same rows, roomier density).
 */
export default function LineIndex({ variant }: { variant: 'rail' | 'screen' }) {
  const { completedIds, favoriteIds } = useInterchange();
  const { pathname } = useLocation();
  const isRail = variant === 'rail';

  return (
    <div className={isRail ? 'flex h-full flex-col' : ''}>
      {!isRail && (
        <div className="px-4 pb-1 pt-5">
          <h1 className="text-xl font-extrabold tracking-tight">Lines</h1>
          <p className="mt-0.5 text-[12px] text-[var(--ic-ink2)]">
            15 lines, one for each part of daily life. Pick one and ride it stop by stop.
          </p>
        </div>
      )}

      <ul className={isRail ? 'flex-1 py-2' : 'py-2'}>
        {LINES.map((line) => {
          const to = `${IC_BASE}/line/${line.domain}`;
          const isActive = pathname === to;
          const complete = visitedCount(line, completedIds) === line.stations.length;
          return (
            <li key={line.domain}>
              <Link
                to={to}
                className={`block border-b border-[var(--ic-rule)] px-4 py-2.5 transition-colors hover:bg-[var(--ic-band)] ${
                  isActive ? 'bg-[var(--ic-band)]' : ''
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="flex items-center gap-2.5">
                  <LineBullet line={line} size="sm" complete={complete} />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-bold leading-tight">
                    {line.name}
                  </span>
                  <LineFraction line={line} completedIds={completedIds} />
                </span>
                <span className="mt-1.5 block pl-[34px] pr-1">
                  <LineStrip line={line} completedIds={completedIds} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Desktop rail: the destinations mobile reaches via tabs. */}
      {isRail && (
        <nav className="border-t border-[var(--ic-rule)] py-1.5" aria-label="More">
          {[
            // activePrefix matches both /journeys and /journey/:id (mirrors TabBar).
            { to: `${IC_BASE}/journeys`, activePrefix: `${IC_BASE}/journey`, label: 'Journeys', Icon: RouteIcon },
            { to: `${IC_BASE}/saved`, activePrefix: `${IC_BASE}/saved`, label: `Saved stops${favoriteIds.length ? ` (${favoriteIds.length})` : ''}`, Icon: Flag },
            { to: `${IC_BASE}/you`, activePrefix: `${IC_BASE}/you`, label: 'Network status', Icon: CircleUser },
          ].map(({ to, activePrefix, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2.5 px-4 py-2 text-[13px] font-semibold transition-colors hover:bg-[var(--ic-band)] ${
                pathname.startsWith(activePrefix) ? 'text-[var(--ic-ink)]' : 'text-[var(--ic-ink2)]'
              }`}
            >
              <Icon size={15} />
              {label}
              <ChevronRight size={13} className="ml-auto opacity-40" />
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
