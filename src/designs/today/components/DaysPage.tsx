import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import { ALL_SKILLS, CATEGORIES, SKILL_MAP } from '@/data/skills';
import type { Skill } from '@/lib/types';
import { useToday } from '../context';
import { CARD_COLOR, TODAY_BASE, parseDateKey } from '../deal';

function SkillRow({ skill }: { skill: Skill }) {
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
        <span className="shrink-0 text-[11.5px] uppercase tracking-[0.14em] text-[var(--td-text-2)]">
          {CATEGORIES[skill.domain].name}
        </span>
      </Link>
    </li>
  );
}

/** The past-days log: a quiet record built from completion dates. No streaks. */
export default function DaysPage() {
  const { completedSet, completionDates, favoriteIds } = useToday();

  const days = useMemo(() => {
    const byDate = new Map<string, Skill[]>();
    for (const [id, date] of Object.entries(completionDates)) {
      const skill = SKILL_MAP[id] as Skill | undefined;
      if (!skill || !date) continue;
      const list = byDate.get(date) ?? [];
      list.push(skill);
      byDate.set(date, list);
    }
    return [...byDate.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, skills]) => ({
        date,
        skills: skills.sort((a, b) => a.title.localeCompare(b.title)),
      }));
  }, [completionDates]);

  const kept = useMemo(
    () =>
      favoriteIds
        .map((id) => SKILL_MAP[id] as Skill | undefined)
        .filter((s): s is Skill => Boolean(s))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [favoriteIds],
  );

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
          Days
        </h1>
        <p className="mt-3 text-[13px] uppercase tracking-[0.2em] text-[var(--td-text-2)]">
          {completedSet.size} of {ALL_SKILLS.length} done — in your own time
        </p>
      </header>

      {kept.length > 0 && (
        <section className="mt-10">
          <h2 className="td-display flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.24em] text-[var(--td-text-2)]">
            <Bookmark size={14} aria-hidden="true" />
            Kept close
          </h2>
          <ul className="mt-3 space-y-0.5">
            {kept.map((skill) => (
              <SkillRow key={skill.id} skill={skill} />
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="td-display text-[12px] font-bold uppercase tracking-[0.24em] text-[var(--td-text-2)]">
          The log
        </h2>

        {days.length === 0 ? (
          <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-[var(--td-text-2)]">
            Nothing written down yet. Complete a skill and the day quietly gets a line here — no
            scores, no streaks, just what you did and when.
          </p>
        ) : (
          <div className="mt-4 space-y-8">
            {days.map(({ date, skills }) => (
              <div key={date}>
                <h3 className="border-b border-[var(--td-line)] pb-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--td-text)]">
                  {format(parseDateKey(date), 'EEEE d MMMM yyyy')}
                </h3>
                <ul className="mt-2 space-y-0.5">
                  {skills.map((skill) => (
                    <SkillRow key={skill.id} skill={skill} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
