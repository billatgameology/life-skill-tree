import { useRef, useState, useCallback } from 'react';
import { GripVertical, Map, Clock, TreePine, User, Award } from 'lucide-react';
import { CATEGORIES, CATEGORY_KEYS } from '@/data/skills';
import { LEARNING_PATHS } from '@/data/paths';
import type { DomainKey, View } from '@/lib/types';

interface TreeSidebarProps {
  activeCategories: Set<DomainKey>;
  onToggleCategory: (cat: DomainKey) => void;
  selectedPathId: string | null;
  onSelectPath: (pathId: string | null) => void;
  activeView: View;
  onChangeView: (view: View) => void;
}

const MIN_WIDTH = 200;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 260;

export default function TreeSidebar({
  activeCategories,
  onToggleCategory,
  selectedPathId,
  onSelectPath,
  activeView,
  onChangeView,
}: TreeSidebarProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
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
    document.removeEventListener('mouseup', handleMouseUp);
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
    document.addEventListener('mouseup', handleMouseUp);
  }, [width, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 h-full bg-surface border-r border-border flex flex-col overflow-hidden relative select-none"
      style={{ width }}
    >
      {/* Resize handle on right edge */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute right-0 top-0 bottom-0 w-4 translate-x-1/2 cursor-col-resize z-20 group flex items-center justify-center"
        title="Drag to resize"
      >
        <div className="w-px h-8 rounded-full bg-border group-hover:bg-glow-gold/50 transition-colors" />
        <GripVertical size={10} className="absolute text-ink-dim/30 group-hover:text-glow-gold/60 transition-colors" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 no-scrollbar">
        {/* Section: Filters */}
        <div className="space-y-2">
          <h3 className="font-heading font-bold text-ink text-[11px] uppercase tracking-wider">
            Skill Groups
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_KEYS.map(cat => {
              const catData = CATEGORIES[cat];
              const isActive = activeCategories.has(cat);
              return (
                <button
                  key={cat}
                  onClick={() => onToggleCategory(cat)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-heading font-semibold border transition-all cursor-pointer"
                  style={{
                    backgroundColor: isActive ? `${catData.color}20` : 'transparent',
                    color: isActive ? catData.color : '#4A4858',
                    borderColor: isActive ? `${catData.color}50` : '#2A2A3A',
                  }}
                >
                  {catData.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: Learning Paths */}
        <div className="space-y-2">
          <h3 className="font-heading font-bold text-ink text-[11px] uppercase tracking-wider">
            Learning Paths
          </h3>
          <div className="space-y-1.5">
            {LEARNING_PATHS.map(path => {
              const isActive = selectedPathId === path.id;
              return (
                <button
                  key={path.id}
                  onClick={() => onSelectPath(selectedPathId === path.id ? null : path.id)}
                  className="w-full text-left px-3 py-2.5 rounded-lg border transition-all cursor-pointer"
                  style={{
                    backgroundColor: isActive ? `${path.color}15` : '#151621',
                    borderColor: isActive ? `${path.color}60` : '#2A2A3A',
                    boxShadow: isActive ? `0 0 10px ${path.color}20` : 'none',
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Map size={11} style={{ color: path.color }} />
                    <span className="text-[11px] font-semibold truncate" style={{ color: isActive ? path.color : '#B8B5C3' }}>
                      {path.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-ink-dim/70 leading-relaxed mb-1.5 line-clamp-2">
                    {path.summary}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-ink-dim">
                    <span>{path.skillIds.length} skills</span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={9} />
                      {path.estimatedTotalMinutes}m
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 p-3 border-t border-border">
        <div className="flex items-center gap-1">
          {[
            { id: 'home' as View, label: 'Tree', Icon: TreePine },
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
