import { Map as MapIcon, List as ListIcon } from 'lucide-react';
import MosaicView from '@/components/MosaicView';
import RegistryView from '@/components/RegistryView';
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
  selectedPathId,
}: SkillsScreenProps) {
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
          <div className="h-full w-full pt-[72px]">
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
      </div>
    </div>
  );
}
