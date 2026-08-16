import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Search } from 'lucide-react';
import { ALL_SKILLS, CATEGORIES } from '@/data/skills';
import type { Skill } from '@/lib/types';
import { useToday } from '../context';
import { CARD_COLOR, TODAY_BASE } from '../deal';

function SkillRow({ skill, done }: { skill: Skill; done: boolean }) {
  return (
    <li>
      <Link
        to={`${TODAY_BASE}/skill/${skill.id}`}
        className="td-link flex min-h-[48px] items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-[var(--td-stage-2)]"
      >
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: CARD_COLOR[skill.domain] }}
        />
        <span className="min-w-0 flex-1 truncate text-[15px] text-[var(--td-text)]">{skill.title}</span>
        {done && (
          <>
            <Check size={15} aria-hidden="true" className="shrink-0 text-[var(--td-text-2)]" />
            <span className="sr-only">(done)</span>
          </>
        )}
        <span className="hidden shrink-0 text-[11.5px] uppercase tracking-[0.14em] text-[var(--td-text-2)] sm:inline">
          {CATEGORIES[skill.domain].name}
        </span>
      </Link>
    </li>
  );
}

/**
 * The escape hatch, kept deliberately plain: search anything, or scroll the
 * A–Z index. It exists so any of the 233 skills stays reachable — it is not
 * the experience.
 */
export default function FindPage() {
  const { completedSet } = useToday();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return null;
    return ALL_SKILLS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        CATEGORIES[s.domain].name.toLowerCase().includes(q) ||
        (s.tags ?? []).some((t) => t.toLowerCase().includes(q)),
    ).slice(0, 60);
  }, [q]);

  const groups = useMemo(() => {
    const byLetter = new Map<string, Skill[]>();
    const sorted = [...ALL_SKILLS].sort((a, b) => a.title.localeCompare(b.title));
    for (const skill of sorted) {
      const letter = skill.title[0].toUpperCase();
      const list = byLetter.get(letter) ?? [];
      list.push(skill);
      byLetter.set(letter, list);
    }
    return [...byLetter.entries()];
  }, []);

  return (
    <div className="mx-auto w-full max-w-[680px] px-5 pb-20 pt-4 sm:px-8">
      <header>
        <Link
          to={TODAY_BASE}
          className="td-btn -ml-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-2 text-[13.5px] font-semibold text-[var(--td-text-2)] hover:text-[var(--td-text)]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Today
        </Link>
        <h1 className="td-display mt-4 text-[clamp(2.2rem,7vw,3.4rem)] font-bold leading-none tracking-tight">
          Find
        </h1>
        <p className="mt-3 max-w-[46ch] text-[14px] leading-relaxed text-[var(--td-text-2)]">
          The quiet way in — for the days you need one specific thing instead of the card.
        </p>
      </header>

      <label className="mt-7 flex min-h-[52px] items-center gap-3 rounded-2xl border border-[var(--td-line)] bg-[var(--td-stage-2)] px-4 focus-within:border-[#565068]">
        <Search size={17} aria-hidden="true" className="shrink-0 text-[var(--td-text-2)]" />
        <span className="sr-only">Search all skills</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search all 233 skills…"
          autoFocus
          className="min-w-0 flex-1 bg-transparent text-[15.5px] text-[var(--td-text)] outline-none placeholder:text-[var(--td-text-2)]"
        />
      </label>

      {results ? (
        <section className="mt-6" aria-label="Search results">
          {results.length === 0 ? (
            <p className="text-[14.5px] text-[var(--td-text-2)]">
              Nothing matches &ldquo;{query.trim()}&rdquo; — try a shorter word.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {results.map((skill) => (
                <SkillRow key={skill.id} skill={skill} done={completedSet.has(skill.id)} />
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="mt-8" aria-label="A to Z index">
          {groups.map(([letter, skills]) => (
            <div key={letter} className="mt-6 first:mt-0">
              <h2 className="td-display border-b border-[var(--td-line)] pb-1.5 text-[13px] font-bold tracking-[0.2em] text-[var(--td-text-2)]">
                {letter}
              </h2>
              <ul className="mt-1.5 space-y-0.5">
                {skills.map((skill) => (
                  <SkillRow key={skill.id} skill={skill} done={completedSet.has(skill.id)} />
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
