import { useMemo } from 'react';
import { ALL_SKILLS, CATEGORIES, CATEGORY_KEYS, getSkillState } from '@/data/skills';
import type { Skill, DomainKey } from '@/lib/types';

interface TrellisViewProps {
  completedIds: string[];
  onSelectSkill: (skill: Skill) => void;
  selectedSkillId: string | null;
  activeCategories: Set<DomainKey>;
  selectedPathId: string | null;
}

export default function TrellisView({
  completedIds,
  onSelectSkill,
  selectedSkillId,
  activeCategories,
  selectedPathId,
}: TrellisViewProps) {
  const pathSkillIds = useMemo(() => {
    if (!selectedPathId) return null;
    const path = ALL_SKILLS.find(s => s.id === selectedPathId);
    return path ? new Set([selectedPathId]) : null;
  }, [selectedPathId]);

  const lanes = useMemo(() => {
    return CATEGORY_KEYS.filter(cat => activeCategories.has(cat)).map(cat => {
      const skills = ALL_SKILLS.filter(s => s.domain === cat);
      const byLevel: Record<number, Skill[]> = { 1: [], 2: [], 3: [] };
      skills.forEach(s => {
        const lvl = Math.min(s.level, 3);
        if (!byLevel[lvl]) byLevel[lvl] = [];
        byLevel[lvl].push(s);
      });
      return { domain: cat, byLevel };
    });
  }, [activeCategories]);

  return (
    <div className="w-full h-full overflow-auto bg-void p-6">
      <div className="space-y-4 max-w-6xl mx-auto">
        {lanes.map(({ domain, byLevel }) => {
          const cat = CATEGORIES[domain];
          return (
            <div key={domain} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: cat.color }}>{cat.icon}</span>
                <h3 className="font-heading font-bold text-sm" style={{ color: cat.color }}>
                  {cat.name}
                </h3>
                <span className="text-[10px] text-ink-dim ml-auto">
                  {(byLevel[1]?.length || 0) + (byLevel[2]?.length || 0) + (byLevel[3]?.length || 0)} skills
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(level => (
                  <div key={level} className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-ink-dim font-heading font-semibold">
                      Level {level}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(byLevel[level] || []).map(skill => {
                        const state = getSkillState(skill, completedIds);
                        const isSelected = skill.id === selectedSkillId;
                        const inActivePath = pathSkillIds ? pathSkillIds.has(skill.id) : true;
                        const dimmed = pathSkillIds && !inActivePath;
                        return (
                          <button
                            key={skill.id}
                            onClick={() => onSelectSkill(skill)}
                            className="px-2 py-1 rounded-md text-[11px] font-body font-medium border transition-all cursor-pointer"
                            style={{
                              backgroundColor: isSelected ? `${cat.color}25` : state === 'completed' ? '#D4AF3720' : '#151621',
                              borderColor: isSelected ? cat.color : state === 'completed' ? '#D4AF3760' : '#2A2A3A',
                              color: dimmed ? '#4A4858' : state === 'completed' ? '#D4AF37' : '#B8B5C3',
                              opacity: dimmed ? 0.4 : 1,
                            }}
                          >
                            {skill.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
