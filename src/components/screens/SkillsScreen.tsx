import { Map as MapIcon, List as ListIcon } from 'lucide-react';
import MosaicView from '@/components/MosaicView';
import RegistryView from '@/components/RegistryView';
import { CATEGORIES, CATEGORY_KEYS, ALL_SKILLS } from '@/data/skills';
import type { DomainKey, Skill } from '@/lib/types';

export type SkillsViewMode = 'map' | 'list';

interface SkillsScreenProps {
  skillsView: SkillsViewMode;
  onChangeSkillsView: (mode: SkillsViewMode) => void;
  completedIds: string[];
  favoriteIds: string[];
  onSelectSkill: (skill: Skill) => void;
  selectedSkillId: string | null;
  activeCategories: Set<DomainKey>;
  onToggleCategory: (cat: DomainKey) => void;
  onShowAllCategories: () => void;
  selectedPathId: string | null;
}

export default function SkillsScreen({
  skillsView,
  onChangeSkillsView,
  completedIds,
  favoriteIds,
  onSelectSkill,
  selectedSkillId,
  activeCategories,
  onToggleCategory,
  onShowAllCategories,
  selectedPathId,
}: SkillsScreenProps) {
  const showingAll = activeCategories.size === CATEGORY_KEYS.length;

  return (
    <div className="relative h-full w-full">
      {/* Viz layer */}
      <div className="absolute inset-0">
        {skillsView === 'map' ? (
          <MosaicView
            completedIds={completedIds}
            onSelectSkill={onSelectSkill}
            selectedSkillId={selectedSkillId}
            activeCategories={activeCategories}
            selectedPathId={selectedPathId}
          />
        ) : (
          <div className="h-full w-full pt-[104px]">
            <RegistryView
              completedIds={completedIds}
              favoriteIds={favoriteIds}
              onSelectSkill={onSelectSkill}
              selectedSkillId={selectedSkillId}
              activeCategories={activeCategories}
            />
          </div>
        )}
      </div>

      {/* Floating header: title + segmented + category chips */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-void via-void/85 to-transparent px-3 pb-3 pt-3">
        <div className="pointer-events-auto flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-heading font-bold uppercase tracking-[0.14em] text-ink-dim">
              Life Skills
            </p>
            <h1 className="truncate font-display text-lg text-ink">Skill Tree</h1>
          </div>
          <div className="flex flex-shrink-0 items-center rounded-full border border-border bg-surface-raised/80 p-0.5 backdrop-blur">
            {([
              { id: 'map' as SkillsViewMode, label: 'Map', Icon: MapIcon },
              { id: 'list' as SkillsViewMode, label: 'List', Icon: ListIcon },
            ]).map((opt) => {
              const isActive = skillsView === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onChangeSkillsView(opt.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-heading font-bold transition-colors ${
                    isActive ? 'bg-glow-gold/20 text-glow-gold' : 'text-ink-dim hover:text-ink'
                  }`}
                >
                  <opt.Icon size={12} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category filter chips */}
        <div className="pointer-events-auto mt-2.5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={onShowAllCategories}
            className="flex-shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-heading font-semibold transition-colors"
            style={{
              backgroundColor: showingAll ? 'rgb(var(--accent-rgb) / 0.18)' : 'rgba(255,255,255,0.04)',
              borderColor: showingAll ? 'rgb(var(--accent-rgb) / 0.55)' : '#2A2A3A',
              color: showingAll ? 'rgb(var(--accent-rgb))' : '#7D7A8A',
            }}
          >
            All <span className="opacity-60">{ALL_SKILLS.length}</span>
          </button>
          {CATEGORY_KEYS.map((cat) => {
            const data = CATEGORIES[cat];
            const isActive = activeCategories.size === 1 && activeCategories.has(cat);
            const count = ALL_SKILLS.filter((s) => s.domain === cat).length;
            return (
              <button
                key={cat}
                onClick={() => onToggleCategory(cat)}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-heading font-semibold transition-colors"
                style={{
                  backgroundColor: isActive ? `${data.color}22` : 'rgba(255,255,255,0.04)',
                  borderColor: isActive ? `${data.color}88` : '#2A2A3A',
                  color: isActive ? data.color : '#7D7A8A',
                }}
              >
                {data.name}
                <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
