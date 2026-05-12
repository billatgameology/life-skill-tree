import { useEffect, useMemo, useRef } from 'react';
import { ALL_SKILLS, CATEGORIES, CATEGORY_KEYS, getSkillState } from '@/data/skills';
import { PATH_MAP } from '@/data/paths';
import type { Skill, DomainKey } from '@/lib/types';


function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return null;
  const value = Number.parseInt(normalized, 16);
  if (Number.isNaN(value)) return null;
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function getReadableTextColor(backgroundHex: string): string {
  const rgb = hexToRgb(backgroundHex);
  if (!rgb) return '#0D0E17';
  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance > 0.52 ? '#0D0E17' : '#F6F4FF';
}

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
  const selectedSkillRef = useRef<HTMLButtonElement | null>(null);

  const pathSkillIds = useMemo(() => {
    if (!selectedPathId) return null;
    const path = PATH_MAP[selectedPathId];
    return path ? new Set(path.skillIds) : null;
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

  useEffect(() => {
    if (!selectedSkillId || !selectedSkillRef.current) return;
    selectedSkillRef.current.scrollIntoView({
      block: 'center',
      inline: 'center',
      behavior: 'smooth',
    });
  }, [selectedSkillId, lanes]);

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
                            ref={isSelected ? selectedSkillRef : undefined}
                            onClick={() => onSelectSkill(skill)}
                            className="px-2 py-1 rounded-md text-[11px] font-body font-medium border transition-all cursor-pointer"
                            style={{
                              backgroundColor: isSelected ? `${cat.color}25` : state === 'completed' ? `${cat.color}26` : '#151621',
                              borderColor: isSelected ? '#FFF7D1' : state === 'completed' ? `${cat.color}99` : '#2A2A3A',
                              boxShadow: isSelected
                                ? `0 0 0 2px #0D0E17, 0 0 0 4px #FFF7D1, 0 0 18px ${cat.color}, 0 0 28px rgba(255,255,255,0.35)`
                                : 'none',
                              color: dimmed ? '#4A4858' : state === 'completed' ? getReadableTextColor(cat.color) : '#B8B5C3',
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
