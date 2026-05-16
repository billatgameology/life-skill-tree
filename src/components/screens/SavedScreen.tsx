import { Heart, ChevronRight, Check } from 'lucide-react';
import { ALL_SKILLS, CATEGORIES, CATEGORY_KEYS } from '@/data/skills';
import type { Skill } from '@/lib/types';

interface SavedScreenProps {
  favoriteIds: string[];
  completedIds: string[];
  onSelectSkill: (skill: Skill) => void;
  onBrowseSkills: () => void;
}

export default function SavedScreen({
  favoriteIds,
  completedIds,
  onSelectSkill,
  onBrowseSkills,
}: SavedScreenProps) {
  const favoriteSet = new Set(favoriteIds);
  const grouped = CATEGORY_KEYS.map((cat) => ({
    cat,
    data: CATEGORIES[cat],
    skills: ALL_SKILLS.filter((s) => s.domain === cat && favoriteSet.has(s.id)),
  })).filter((g) => g.skills.length > 0);

  if (favoriteIds.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 pb-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface-raised">
          <Heart size={26} className="text-ink-dim" />
        </div>
        <h2 className="font-display text-lg text-ink">Save skills to learn later</h2>
        <p className="mt-1.5 max-w-[260px] text-xs leading-relaxed text-ink-muted">
          Tap the heart on any skill to bookmark it here and build your own personal list.
        </p>
        <button
          onClick={onBrowseSkills}
          className="mt-5 rounded-lg border border-glow-gold/50 bg-glow-gold/15 px-4 py-2 font-heading text-xs font-bold text-glow-gold transition-colors hover:bg-glow-gold/25"
        >
          Browse Skills
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-1 pt-4">
        <p className="text-[10px] font-heading font-bold uppercase tracking-[0.14em] text-ink-dim">
          Your bookmarks
        </p>
        <h1 className="font-display text-lg text-ink">Saved</h1>
        <p className="mt-1 text-xs text-ink-muted">
          <span className="font-bold text-glow-gold">{favoriteIds.length}</span> skill
          {favoriteIds.length === 1 ? '' : 's'} saved across {grouped.length} categor
          {grouped.length === 1 ? 'y' : 'ies'}
        </p>
      </div>
      <div className="detail-scrollbar flex-1 overflow-y-auto px-4 pb-28 pt-2">
        {grouped.map(({ cat, data, skills }) => (
          <div key={cat} className="mb-4">
            <div className="mb-1.5 flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: data.color, boxShadow: `0 0 4px ${data.color}` }}
              />
              <span className="text-[10px] font-heading font-bold uppercase tracking-wider" style={{ color: data.color }}>
                {data.name}
              </span>
              <span className="text-[10px] text-ink-dim">{skills.length}</span>
            </div>
            <div className="space-y-1.5">
              {skills.map((skill) => {
                const isDone = completedIds.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    onClick={() => onSelectSkill(skill)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface-raised/40 px-3 py-2.5 text-left transition-colors hover:border-glow-gold/40"
                  >
                    <span
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: isDone ? `${data.color}` : `${data.color}20`,
                        border: `1px solid ${data.color}`,
                      }}
                    >
                      {isDone && <Check size={11} strokeWidth={3} className="text-void" />}
                    </span>
                    <span
                      className={`flex-1 truncate text-xs font-body font-medium ${
                        isDone ? 'text-ink-dim line-through opacity-60' : 'text-ink'
                      }`}
                    >
                      {skill.title}
                    </span>
                    <ChevronRight size={14} className="flex-shrink-0 text-ink-dim" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
