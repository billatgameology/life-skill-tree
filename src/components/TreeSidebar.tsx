import { useRef, useState, useCallback } from 'react';
import {
  Award,
  ChevronDown,
  ChevronRight,
  Clock,
  LogIn,
  LogOut,
  GripVertical,
  Hexagon,
  LayoutGrid,
  Map,
  PanelLeftClose,
  Table,
  User,
  Star,
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { CATEGORIES, CATEGORY_KEYS } from '@/data/skills';
import { LEARNING_PATHS } from '@/data/paths';
import type { DomainKey, Skill, View } from '@/lib/types';

type VizMode = 'mosaic' | 'trellis' | 'registry';

interface TreeSidebarProps {
  activeCategories: Set<DomainKey>;
  onToggleCategory: (cat: DomainKey) => void;
  onShowAllCategories: () => void;
  selectedPathId: string | null;
  onSelectPath: (pathId: string | null) => void;
  activeView: View;
  onChangeView: (view: View) => void;
  authUser: FirebaseUser | null;
  onOpenAuth: () => void;
  onSignOut: () => Promise<void>;
  vizMode: VizMode;
  onChangeVizMode: (mode: VizMode) => void;
  onCollapse: () => void;
  favoriteSkills: Skill[];
  onSelectFavoriteSkill: (skill: Skill) => void;
}

const MIN_WIDTH = 200;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 260;

export default function TreeSidebar({
  activeCategories,
  onToggleCategory,
  onShowAllCategories,
  selectedPathId,
  onSelectPath,
  activeView,
  onChangeView,
  authUser,
  onOpenAuth,
  onSignOut,
  vizMode,
  onChangeVizMode,
  onCollapse,
  favoriteSkills,
  onSelectFavoriteSkill,
}: TreeSidebarProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [pathsOpen, setPathsOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(DEFAULT_WIDTH);

  const stopResize = useCallback(() => {
    if (!isResizingRef.current) return;
    isResizingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    if (panelRef.current) {
      const finalWidth = panelRef.current.getBoundingClientRect().width;
      setWidth(Math.round(finalWidth));
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const delta = e.clientX - startXRef.current;
    const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta));
    if (panelRef.current) {
      panelRef.current.style.width = `${newWidth}px`;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    stopResize();
    document.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove, stopResize]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, { once: true });
  }, [width, handleMouseMove, handleMouseUp]);

  const isShowingAllCategories = activeCategories.size === CATEGORY_KEYS.length;

  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 h-full bg-surface border-r border-border flex flex-col overflow-hidden relative select-none"
      style={{ width }}
    >
      <div
        onMouseDown={handleMouseDown}
        className="absolute right-0 top-0 bottom-0 w-4 translate-x-1/2 cursor-col-resize z-20 group flex items-center justify-center"
        title="Drag to resize"
      >
        <div className="w-px h-8 rounded-full bg-border group-hover:bg-glow-gold/50 transition-colors" />
        <GripVertical size={10} className="absolute text-ink-dim/30 group-hover:text-glow-gold/60 transition-colors" />
      </div>

      <div className="flex-shrink-0 px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="font-heading font-bold text-ink text-[11px] uppercase tracking-wider">
          Controls
        </span>
        <button
          onClick={onCollapse}
          className="w-7 h-7 rounded-md flex items-center justify-center text-ink-dim hover:text-ink hover:bg-surface-raised transition-colors"
          title="Hide sidebar"
        >
          <PanelLeftClose size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
        <div className="space-y-2">
          <h3 className="font-heading font-bold text-ink text-[11px] uppercase tracking-wider">
            Views
          </h3>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'mosaic' as VizMode, label: 'Mosaic', Icon: Hexagon },
              { id: 'trellis' as VizMode, label: 'Trellis', Icon: LayoutGrid },
              { id: 'registry' as VizMode, label: 'Table', Icon: Table },
            ].map(item => {
              const isActive = vizMode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onChangeVizMode(item.id)}
                  className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg border transition-all cursor-pointer"
                  style={{
                    backgroundColor: isActive ? '#D4AF3715' : '#151621',
                    borderColor: isActive ? '#D4AF3760' : '#2A2A3A',
                  }}
                >
                  <item.Icon size={14} className={isActive ? 'text-glow-gold' : 'text-ink-dim'} />
                  <span className={`text-[9px] font-heading font-semibold ${isActive ? 'text-glow-gold' : 'text-ink-dim'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-raised/30 overflow-hidden">
          <button
            onClick={() => setGroupsOpen(open => !open)}
            className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-surface-raised/60 transition-colors"
          >
            {groupsOpen ? <ChevronDown size={14} className="text-ink-dim" /> : <ChevronRight size={14} className="text-ink-dim" />}
            <span className="font-heading font-bold text-ink text-[11px] uppercase tracking-wider flex-1">
              Skill Groups
            </span>
            <span className="text-[10px] text-ink-dim">
              {isShowingAllCategories ? 'All' : activeCategories.size}
            </span>
          </button>
          {groupsOpen && (
            <div className="px-3 pb-3 space-y-2">
              <button
                onClick={onShowAllCategories}
                className="w-full px-2.5 py-1.5 rounded-md text-[11px] font-heading font-semibold border transition-all cursor-pointer text-left"
                style={{
                  backgroundColor: isShowingAllCategories ? '#D4AF3715' : 'transparent',
                  color: isShowingAllCategories ? '#D4AF37' : '#7D7A8A',
                  borderColor: isShowingAllCategories ? '#D4AF3760' : '#2A2A3A',
                }}
              >
                All groups
              </button>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_KEYS.map(cat => {
                  const catData = CATEGORIES[cat];
                  const isActive = activeCategories.size === 1 && activeCategories.has(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => onToggleCategory(cat)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-heading font-semibold border transition-all cursor-pointer"
                      style={{
                        backgroundColor: isActive ? `${catData.color}20` : 'transparent',
                        color: isActive ? catData.color : '#6E6B7A',
                        borderColor: isActive ? `${catData.color}60` : '#2A2A3A',
                      }}
                    >
                      {catData.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface-raised/30 overflow-hidden">
          <button
            onClick={() => setPathsOpen(open => !open)}
            className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-surface-raised/60 transition-colors"
          >
            {pathsOpen ? <ChevronDown size={14} className="text-ink-dim" /> : <ChevronRight size={14} className="text-ink-dim" />}
            <span className="font-heading font-bold text-ink text-[11px] uppercase tracking-wider flex-1">
              Learning Paths
            </span>
            <span className="text-[10px] text-ink-dim">
              {selectedPathId ? '1' : LEARNING_PATHS.length}
            </span>
          </button>
          {pathsOpen && (
            <div className="px-3 pb-3 space-y-1.5">
              {LEARNING_PATHS.map(path => {
                const isActive = selectedPathId === path.id;
                return (
                  <button
                    key={path.id}
                    onClick={() => onSelectPath(selectedPathId === path.id ? null : path.id)}
                    className="w-full text-left px-3 py-2 rounded-lg border transition-all cursor-pointer"
                    style={{
                      backgroundColor: isActive ? `${path.color}15` : '#151621',
                      borderColor: isActive ? `${path.color}60` : '#2A2A3A',
                      boxShadow: isActive ? `0 0 10px ${path.color}20` : 'none',
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Map size={11} style={{ color: path.color }} />
                      <span className="text-[11px] font-semibold truncate flex-1" style={{ color: isActive ? path.color : '#B8B5C3' }}>
                        {path.title}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-ink-dim">
                        <Clock size={9} />
                        {path.estimatedTotalMinutes}m
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface-raised/30 overflow-hidden">
          <button
            onClick={() => setFavoritesOpen(open => !open)}
            className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-surface-raised/60 transition-colors"
          >
            {favoritesOpen ? <ChevronDown size={14} className="text-ink-dim" /> : <ChevronRight size={14} className="text-ink-dim" />}
            <span className="font-heading font-bold text-ink text-[11px] uppercase tracking-wider flex-1">
              Favorites
            </span>
            <span className="text-[10px] text-ink-dim">{favoriteSkills.length}</span>
          </button>
          {favoritesOpen && (
            <div className="px-3 pb-3 space-y-1.5">
              {favoriteSkills.length === 0 ? (
                <p className="text-[11px] text-ink-dim py-1">No favorites yet.</p>
              ) : (
                favoriteSkills.map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => onSelectFavoriteSkill(skill)}
                    className="w-full text-left px-3 py-2 rounded-lg border transition-all cursor-pointer bg-[#151621] border-[#2A2A3A] hover:border-glow-gold/40"
                  >
                    <div className="flex items-center gap-2">
                      <Star size={11} className="text-glow-gold flex-shrink-0" />
                      <span className="text-[11px] font-semibold text-[#B8B5C3] truncate">{skill.title}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 p-3 border-t border-border">
        <div className="mb-2 rounded-lg border border-border bg-surface-raised/40 px-3 py-2">
          <p className="text-[10px] font-heading font-bold uppercase tracking-wider text-ink-dim">
            Account
          </p>
          {authUser ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-heading font-semibold text-ink">
                  {authUser.displayName || 'Signed in'}
                </p>
                <p className="truncate text-[10px] text-ink-dim">
                  {authUser.email}
                </p>
              </div>
              <button
                onClick={() => void onSignOut()}
                className="w-8 h-8 rounded-md flex items-center justify-center text-ink-dim hover:text-ink hover:bg-surface-high transition-colors"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="mt-2 w-full h-9 rounded-lg border border-glow-gold/40 bg-glow-gold/10 text-glow-gold hover:bg-glow-gold/15 transition-colors flex items-center justify-center gap-2 text-xs font-heading font-bold"
            >
              <LogIn size={14} />
              Sign in
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          {[
            { id: 'profile' as View, label: 'Profile', Icon: User },
            { id: 'badges' as View, label: 'Badges', Icon: Award },
          ].map(item => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg transition-colors cursor-pointer"
                style={{
                  backgroundColor: isActive ? '#D4AF3715' : 'transparent',
                }}
              >
                <item.Icon size={18} className={isActive ? 'text-glow-gold' : 'text-ink-dim'} />
                <span className={`text-[10px] font-heading font-semibold ${isActive ? 'text-glow-gold' : 'text-ink-dim'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
