import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { CATEGORY_KEYS } from '@/data/skills';
import type { DomainKey, Skill } from '@/lib/types';
import { useFrontier } from '../context';
import {
  DIFF_LABEL,
  TINTS,
  domainName,
  oneStepAway,
  surveyTerritory,
  unmetPrereqs,
} from '../expedition';
import { BandLabel, SkillRow, StandingMark } from './atoms';

function groupByDomain(skills: Skill[]): [DomainKey, Skill[]][] {
  const map = new Map<DomainKey, Skill[]>();
  for (const s of skills) {
    const bucket = map.get(s.domain);
    if (bucket) bucket.push(s);
    else map.set(s.domain, [s]);
  }
  return CATEGORY_KEYS.filter((k) => map.has(k)).map((k) => [k, map.get(k) as Skill[]]);
}

function DomainHeader({ domain, count }: { domain: DomainKey; count: number }) {
  return (
    <div className="mt-5 flex items-center gap-2 border-b border-[var(--fr-line)] pb-1.5">
      <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: TINTS[domain] }} />
      <h3 className="fr-mono text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: TINTS[domain] }}>
        {domainName(domain)}
      </h3>
      <span className="fr-mono text-[10px] text-[var(--fr-faint)]">{count}</span>
    </div>
  );
}

/**
 * The full survey of the ground ahead: everything within reach (grouped so 98
 * skills stay scannable), the next ridgeline, and the far country — none of
 * it locked.
 */
export default function AheadPage() {
  const { completedIds } = useFrontier();
  const { frontier, beyond } = useMemo(() => surveyTerritory(completedIds), [completedIds]);

  const ridge = useMemo(() => oneStepAway(beyond, completedIds), [beyond, completedIds]);
  const ridgeIds = useMemo(() => new Set(ridge.map((r) => r.skill.id)), [ridge]);
  const far = useMemo(() => beyond.filter((s) => !ridgeIds.has(s.id)), [beyond, ridgeIds]);

  const frontierGroups = useMemo(() => groupByDomain(frontier), [frontier]);
  const farGroups = useMemo(() => groupByDomain(far), [far]);

  const [openFar, setOpenFar] = useState<Set<DomainKey>>(new Set());
  const toggleFar = (domain: DomainKey) =>
    setOpenFar((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });

  return (
    <div className="mx-auto max-w-[880px] px-4 pb-16 pt-7 sm:px-6">
      <p className="fr-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--fr-faint)]">
        Full survey
      </p>
      <h1 className="fr-display mt-2 text-[26px] font-extrabold leading-tight tracking-tight text-[var(--fr-ink)] sm:text-[32px]">
        The ground ahead
      </h1>
      <p className="fr-mono mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[10px] uppercase tracking-[0.16em] text-[var(--fr-dim)]">
        <span>
          <span className="text-[var(--fr-dawn)]">{frontier.length}</span> within reach
        </span>
        <span>
          <span className="text-[var(--fr-ink)]">{ridge.length}</span> one step out
        </span>
        <span>
          <span className="text-[var(--fr-faint)]">{far.length}</span> further out
        </span>
      </p>

      {/* Within reach */}
      {frontier.length > 0 && (
        <section className="mt-9">
          <BandLabel tone="dawn">Within reach now</BandLabel>
          <p className="fr-body mt-1 text-[13px] text-[var(--fr-dim)]">
            Every approach clear. Grouped so you can scan — start anywhere.
          </p>
          {frontierGroups.map(([domain, skills]) => (
            <div key={domain}>
              <DomainHeader domain={domain} count={skills.length} />
              <div className="mt-1 grid gap-x-6 md:grid-cols-2">
                {skills.map((skill) => (
                  <SkillRow
                    key={skill.id}
                    skill={skill}
                    lead={<StandingMark standing="frontier" />}
                    sub={`${DIFF_LABEL[skill.difficulty]} · stage ${skill.level}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* One step away */}
      {ridge.length > 0 && (
        <section className="mt-12">
          <BandLabel>The next ridgeline</BandLabel>
          <p className="fr-body mt-1 text-[13px] text-[var(--fr-dim)]">
            One piece of groundwork away from your frontier.
          </p>
          <div className="mt-2 grid gap-x-6 md:grid-cols-2">
            {ridge.map(({ skill, missing }) => (
              <SkillRow
                key={skill.id}
                skill={skill}
                lead={<StandingMark standing="beyond" />}
                sub={`after “${missing.title}”`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Further out */}
      {far.length > 0 && (
        <section className="mt-12">
          <BandLabel>Far country</BandLabel>
          <p className="fr-body mt-1 max-w-[62ch] text-[13px] leading-snug text-[var(--fr-dim)]">
            {far.length} skills with more groundwork between you and them. Still not locked — open
            any of them to see what would help first.
          </p>
          <div className="mt-3 space-y-1.5">
            {farGroups.map(([domain, skills]) => {
              const open = openFar.has(domain);
              return (
                <div key={domain} className="rounded-md border border-[var(--fr-line)]">
                  <button
                    onClick={() => toggleFar(domain)}
                    aria-expanded={open}
                    className="flex min-h-[48px] w-full items-center gap-2.5 px-3 text-left transition-colors hover:bg-[var(--fr-card)]"
                  >
                    {open ? (
                      <ChevronDown size={15} aria-hidden className="shrink-0 text-[var(--fr-faint)]" />
                    ) : (
                      <ChevronRight size={15} aria-hidden className="shrink-0 text-[var(--fr-faint)]" />
                    )}
                    <span
                      aria-hidden
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: TINTS[domain] }}
                    />
                    <span className="fr-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--fr-ink)]">
                      {domainName(domain)}
                    </span>
                    <span className="fr-mono ml-auto text-[10px] text-[var(--fr-faint)]">
                      {skills.length}
                    </span>
                  </button>
                  {open && (
                    <div className="border-t border-[var(--fr-line)] px-1.5 py-1.5">
                      {skills.map((skill) => {
                        const missing = unmetPrereqs(skill, completedIds);
                        return (
                          <SkillRow
                            key={skill.id}
                            skill={skill}
                            lead={<StandingMark standing="beyond" />}
                            sub={`after ${missing.map((m) => `“${m.title}”`).join(', ')}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
