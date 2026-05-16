import { Hexagon, Route, Heart, User, type LucideIcon } from 'lucide-react';
import type { TabId } from '@/lib/types';

interface TabDef {
  id: TabId;
  label: string;
  Icon: LucideIcon;
}

const TABS: TabDef[] = [
  { id: 'skills', label: 'Skills', Icon: Hexagon },
  { id: 'paths', label: 'Paths', Icon: Route },
  { id: 'saved', label: 'Saved', Icon: Heart },
  { id: 'profile', label: 'Profile', Icon: User },
];

interface BottomTabBarProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  savedCount?: number;
}

export default function BottomTabBar({ active, onChange, savedCount = 0 }: BottomTabBarProps) {
  return (
    <nav
      className="absolute inset-x-0 bottom-0 z-[60] flex border-t border-border bg-surface/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        const showBadge = tab.id === 'saved' && savedCount > 0;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors"
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="relative">
              <tab.Icon
                size={20}
                className={isActive ? 'text-glow-gold' : 'text-ink-dim'}
                fill={isActive && tab.id === 'saved' ? 'currentColor' : 'none'}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              {showBadge && (
                <span className="absolute -right-2 -top-1.5 min-w-[15px] rounded-full bg-glow-gold px-1 text-center text-[9px] font-heading font-bold leading-[15px] text-void">
                  {savedCount > 99 ? '99+' : savedCount}
                </span>
              )}
            </span>
            <span
              className={`text-[10px] font-heading font-semibold tracking-wide ${
                isActive ? 'text-glow-gold' : 'text-ink-dim'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
