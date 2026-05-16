import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { ALL_SKILLS, CATEGORIES, getSkillState } from '@/data/skills';
import type { Skill, DomainKey } from '@/lib/types';

interface RegistryViewProps {
  completedIds: string[];
  favoriteIds: string[];
  onSelectSkill: (skill: Skill) => void;
  selectedSkillId: string | null;
  activeCategories: Set<DomainKey>;
}

type StatusFilter = 'all' | 'favorites' | 'todo' | 'learned';

export default function RegistryView({
  completedIds,
  favoriteIds,
  onSelectSkill,
  selectedSkillId,
  activeCategories,
}: RegistryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<'title' | 'domain' | 'level' | 'difficulty' | 'time'>('title');

  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const inScope = useMemo(
    () => ALL_SKILLS.filter((s) => activeCategories.has(s.domain)),
    [activeCategories]
  );

  const filteredSkills = useMemo(() => {
    let skills = inScope;

    if (statusFilter === 'favorites') skills = skills.filter((s) => favoriteSet.has(s.id));
    else if (statusFilter === 'learned') skills = skills.filter((s) => completedSet.has(s.id));
    else if (statusFilter === 'todo') skills = skills.filter((s) => !completedSet.has(s.id));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      skills = skills.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          s.domain.toLowerCase().includes(q)
      );
    }

    return [...skills].sort((a, b) => {
      switch (sortKey) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'domain':
          return a.domain.localeCompare(b.domain) || a.title.localeCompare(b.title);
        case 'level':
          return a.level - b.level || a.title.localeCompare(b.title);
        case 'difficulty': {
          const dOrder = { easy: 0, medium: 1, hard: 2 };
          return dOrder[a.difficulty] - dOrder[b.difficulty] || a.title.localeCompare(b.title);
        }
        case 'time':
          return a.estimatedMinutes - b.estimatedMinutes;
        default:
          return 0;
      }
    });
  }, [inScope, statusFilter, favoriteSet, completedSet, searchQuery, sortKey]);

  const counts = useMemo(
    () => ({
      all: inScope.length,
      favorites: inScope.filter((s) => favoriteSet.has(s.id)).length,
      todo: inScope.filter((s) => !completedSet.has(s.id)).length,
      learned: inScope.filter((s) => completedSet.has(s.id)).length,
    }),
    [inScope, favoriteSet, completedSet]
  );

  const statusChips: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'todo', label: 'To do' },
    { id: 'learned', label: 'Learned' },
  ];

  const renderSortHeader = (label: string, key: typeof sortKey) => (
    <th
      onClick={() => setSortKey(key)}
      className="cursor-pointer select-none px-3 py-2 text-left text-[10px] font-heading font-bold uppercase tracking-wider text-ink-dim transition-colors hover:text-ink"
    >
      {label} {sortKey === key ? '▸' : ''}
    </th>
  );

  return (
    <div className="flex h-full w-full flex-col bg-void">
      {/* Search + status filters */}
      <div className="flex-shrink-0 space-y-2 border-b border-border p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills..."
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-4 text-sm text-ink placeholder:text-ink-dim/50 focus:border-glow-gold/50 focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {statusChips.map((chip) => {
            const isActive = statusFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setStatusFilter(chip.id)}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-heading font-semibold transition-colors"
                style={{
                  backgroundColor: isActive ? 'rgb(var(--accent-rgb) / 0.18)' : 'rgba(255,255,255,0.04)',
                  borderColor: isActive ? 'rgb(var(--accent-rgb) / 0.55)' : '#2A2A3A',
                  color: isActive ? 'rgb(var(--accent-rgb))' : '#7D7A8A',
                }}
              >
                {chip.label}
                <span className="opacity-60">{counts[chip.id]}</span>
              </button>
            );
          })}
          <span className="flex-shrink-0 self-center pl-1 text-[10px] text-ink-dim">
            {filteredSkills.length} shown
          </span>
        </div>
      </div>

      {/* Table */}
      <div
        className="detail-scrollbar flex-1 overflow-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
      >
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-surface">
            <tr className="border-b border-border">
              {renderSortHeader('Skill', 'title')}
              {renderSortHeader('Domain', 'domain')}
              {renderSortHeader('Level', 'level')}
              {renderSortHeader('Difficulty', 'difficulty')}
              {renderSortHeader('Time', 'time')}
              <th className="px-3 py-2 text-left text-[10px] font-heading font-bold uppercase tracking-wider text-ink-dim">
                XP
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-heading font-bold uppercase tracking-wider text-ink-dim">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSkills.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center text-xs text-ink-dim">
                  {statusFilter === 'favorites'
                    ? 'No favorites match. Tap the heart on a skill to save it here.'
                    : 'Nothing matches. Try clearing the search or filter.'}
                </td>
              </tr>
            ) : (
              filteredSkills.map((skill) => {
                const state = getSkillState(skill, completedIds);
                const cat = CATEGORIES[skill.domain];
                const isSelected = skill.id === selectedSkillId;
                const isFav = favoriteSet.has(skill.id);
                return (
                  <tr
                    key={skill.id}
                    onClick={() => onSelectSkill(skill)}
                    className="cursor-pointer border-b border-border/50 transition-colors hover:bg-surface-raised/50"
                    style={{ backgroundColor: isSelected ? `${cat.color}10` : undefined }}
                  >
                    <td className="px-3 py-2 text-xs font-body font-medium text-ink">
                      {isFav && <span className="mr-1 text-glow-gold">♥</span>}
                      {skill.title}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-heading font-semibold"
                        style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                      >
                        {cat.name}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-ink-dim">{skill.level}</td>
                    <td className="px-3 py-2 text-xs capitalize text-ink-dim">{skill.difficulty}</td>
                    <td className="px-3 py-2 text-xs text-ink-dim">{skill.estimatedMinutes}m</td>
                    <td className="px-3 py-2 text-xs font-bold text-glow-gold">+{skill.xp}</td>
                    <td className="px-3 py-2">
                      {state === 'completed' ? (
                        <span className="text-[10px] font-heading font-semibold text-glow-green">Done</span>
                      ) : (
                        <span className="text-[10px] text-ink-dim">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
