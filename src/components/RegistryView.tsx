import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { ALL_SKILLS, CATEGORIES, getSkillState } from '@/data/skills';
import type { Skill, DomainKey } from '@/lib/types';

interface RegistryViewProps {
  completedIds: string[];
  onSelectSkill: (skill: Skill) => void;
  selectedSkillId: string | null;
  activeCategories: Set<DomainKey>;
}

export default function RegistryView({
  completedIds,
  onSelectSkill,
  selectedSkillId,
  activeCategories,
}: RegistryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<'title' | 'domain' | 'level' | 'difficulty' | 'time'>('title');

  const filteredSkills = useMemo(() => {
    let skills = ALL_SKILLS.filter(s => activeCategories.has(s.domain));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      skills = skills.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.domain.toLowerCase().includes(q)
      );
    }
    return [...skills].sort((a, b) => {
      switch (sortKey) {
        case 'title': return a.title.localeCompare(b.title);
        case 'domain': return a.domain.localeCompare(b.domain) || a.title.localeCompare(b.title);
        case 'level': return a.level - b.level || a.title.localeCompare(b.title);
        case 'difficulty':
          {
            const dOrder = { easy: 0, medium: 1, hard: 2 };
            return dOrder[a.difficulty] - dOrder[b.difficulty] || a.title.localeCompare(b.title);
          }
        case 'time': return a.estimatedMinutes - b.estimatedMinutes;
        default: return 0;
      }
    });
  }, [activeCategories, searchQuery, sortKey]);

  const renderSortHeader = (label: string, key: typeof sortKey) => (
    <th
      onClick={() => setSortKey(key)}
      className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-heading font-bold text-ink-dim cursor-pointer hover:text-ink transition-colors select-none"
    >
      {label} {sortKey === key ? '▸' : ''}
    </th>
  );

  return (
    <div className="w-full h-full flex flex-col bg-void">
      {/* Search bar */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search skills..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface border border-border text-ink text-sm font-body placeholder:text-ink-dim/50 focus:outline-none focus:border-glow-gold/50"
          />
        </div>
        <div className="text-[10px] text-ink-dim mt-1.5">
          {filteredSkills.length} of {ALL_SKILLS.filter(s => activeCategories.has(s.domain)).length} skills shown
        </div>
      </div>

      {/* Table */}
      <div className="detail-scrollbar flex-1 overflow-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}>
        <table className="min-w-[720px] w-full text-left border-collapse">
          <thead className="sticky top-0 bg-surface z-10">
            <tr className="border-b border-border">
              {renderSortHeader('Skill', 'title')}
              {renderSortHeader('Domain', 'domain')}
              {renderSortHeader('Level', 'level')}
              {renderSortHeader('Difficulty', 'difficulty')}
              {renderSortHeader('Time', 'time')}
              <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-heading font-bold text-ink-dim">XP</th>
              <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-heading font-bold text-ink-dim">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSkills.map(skill => {
              const state = getSkillState(skill, completedIds);
              const cat = CATEGORIES[skill.domain];
              const isSelected = skill.id === selectedSkillId;
              return (
                <tr
                  key={skill.id}
                  onClick={() => onSelectSkill(skill)}
                  className="border-b border-border/50 cursor-pointer transition-colors hover:bg-surface-raised/50"
                  style={{
                    backgroundColor: isSelected ? `${cat.color}10` : undefined,
                  }}
                >
                  <td className="px-3 py-2 text-xs font-body font-medium text-ink">{skill.title}</td>
                  <td className="px-3 py-2">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-heading font-semibold"
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                    >
                      {cat.name}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-ink-dim">{skill.level}</td>
                  <td className="px-3 py-2 text-xs text-ink-dim capitalize">{skill.difficulty}</td>
                  <td className="px-3 py-2 text-xs text-ink-dim">{skill.estimatedMinutes}m</td>
                  <td className="px-3 py-2 text-xs text-glow-gold font-bold">+{skill.xp}</td>
                  <td className="px-3 py-2">
                    {state === 'completed' ? (
                      <span className="text-[10px] text-glow-green font-heading font-semibold">Done</span>
                    ) : (
                      <span className="text-[10px] text-ink-dim">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
