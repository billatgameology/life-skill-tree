import { useMemo } from 'react';
import { Flag, LogOut } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { SKILL_MAP } from '@/data/skills';
import type { Skill, UserData } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useFrontier } from '../context';
import { TOTAL, domainName, logDays, surveyTerritory } from '../expedition';
import { BandLabel, DomainTag, HorizonBar, SkillRow, StandingMark } from './atoms';

function startedLabel(iso: string | undefined): string {
  if (!iso) return '';
  try {
    return format(parseISO(iso), 'd MMM yyyy');
  } catch {
    return '';
  }
}

/**
 * The expedition log: the record of ground covered, day by day, plus marked
 * waypoints and the expedition's overall shape.
 */
export default function LogbookPage({ user }: { user: UserData | null }) {
  const { completedIds, favoriteIds, completionDates, signedIn, openAuth } = useFrontier();
  const { currentUser, signOutUser } = useAuth();

  const { behind, frontier, beyond } = useMemo(() => surveyTerritory(completedIds), [completedIds]);
  const days = useMemo(() => logDays(completedIds, completionDates), [completedIds, completionDates]);
  const waypoints = useMemo(
    () =>
      favoriteIds.flatMap((id): Skill[] => {
        const s = SKILL_MAP[id];
        return s ? [s] : [];
      }),
    [favoriteIds],
  );

  const started = startedLabel(user?.firstVisitDate);

  return (
    <div className="mx-auto max-w-[880px] px-4 pb-16 pt-7 sm:px-6">
      <p className="fr-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--fr-faint)]">
        Expedition log
      </p>
      <h1 className="fr-display mt-2 text-[26px] font-extrabold leading-tight tracking-tight text-[var(--fr-ink)] sm:text-[32px]">
        The ground you have covered
      </h1>

      {/* Shape of the expedition */}
      <div className="mt-6 rounded-lg border border-[var(--fr-line)] bg-[var(--fr-card)] p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="fr-display text-[34px] font-extrabold leading-none text-[var(--fr-ember)]">
            {behind.length}
          </span>
          <span className="fr-mono text-[11px] uppercase tracking-[0.18em] text-[var(--fr-dim)]">
            of {TOTAL} skills covered
          </span>
          {started && signedIn && (
            <span className="fr-mono ml-auto text-[10px] uppercase tracking-[0.14em] text-[var(--fr-faint)]">
              underway since {started}
            </span>
          )}
        </div>
        <div className="mt-3">
          <HorizonBar value={behind.length} max={TOTAL} label="Ground covered" />
        </div>
        <p className="fr-mono mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[10px] uppercase tracking-[0.16em] text-[var(--fr-dim)]">
          <span>
            <span className="text-[var(--fr-dawn)]">{frontier.length}</span> within reach
          </span>
          <span>
            <span className="text-[var(--fr-ink)]">{beyond.length}</span> further out
          </span>
        </p>
      </div>

      {/* Account */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-[var(--fr-line)] px-4 py-3">
        {signedIn ? (
          <>
            <p className="fr-body min-w-0 flex-1 text-[13px] text-[var(--fr-dim)]">
              Recording as{' '}
              <span className="font-semibold text-[var(--fr-ink)]">
                {currentUser?.displayName || currentUser?.email || 'expedition member'}
              </span>
              . Progress carries across every design.
            </p>
            <button
              onClick={() => void signOutUser()}
              className="fr-mono flex min-h-[44px] items-center gap-2 rounded-md border border-[var(--fr-line)] px-3.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--fr-dim)] transition-colors hover:text-[var(--fr-ink)]"
            >
              <LogOut size={13} aria-hidden />
              Sign out
            </button>
          </>
        ) : (
          <>
            <p className="fr-body min-w-0 flex-1 text-[13px] text-[var(--fr-dim)]">
              No record is being kept yet — sign in and every skill you cover is written down here.
            </p>
            <button
              onClick={openAuth}
              className="fr-display min-h-[44px] rounded-md px-4 text-[13px] font-extrabold uppercase tracking-[0.05em] text-[#2A1606] transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(to right, #FF8A5C, #FFB454)' }}
            >
              Sign in
            </button>
          </>
        )}
      </div>

      {/* Waypoints */}
      <section className="mt-10">
        <BandLabel tone="dawn">Marked waypoints</BandLabel>
        {waypoints.length === 0 ? (
          <p className="fr-body mt-2 flex items-center gap-2 text-[13px] text-[var(--fr-dim)]">
            <Flag size={14} aria-hidden className="text-[var(--fr-faint)]" />
            Nothing flagged yet — mark a waypoint on any skill you want to come back to.
          </p>
        ) : (
          <div className="mt-2 grid gap-x-6 md:grid-cols-2">
            {waypoints.map((skill) => (
              <SkillRow
                key={skill.id}
                skill={skill}
                lead={<Flag size={15} aria-hidden className="shrink-0 fill-[var(--fr-dawn)] text-[var(--fr-dawn)]" />}
                sub={domainName(skill.domain)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Chronology */}
      <section className="mt-10">
        <BandLabel tone="ember">Day by day</BandLabel>
        {days.length === 0 ? (
          <p className="fr-body mt-2 max-w-[52ch] text-[13px] leading-snug text-[var(--fr-dim)]">
            The log is still blank. The first entry gets written the moment you mark your first
            ground covered.
          </p>
        ) : (
          <div className="mt-3 space-y-6">
            {days.map((day) => (
              <div key={day.label}>
                <p className="fr-mono border-b border-[var(--fr-line)] pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.2em] text-[var(--fr-ember)]">
                  {day.label}
                  <span className="ml-2 text-[var(--fr-faint)]">
                    {day.marks.length} {day.marks.length === 1 ? 'entry' : 'entries'}
                  </span>
                </p>
                <div className="mt-1 grid gap-x-6 md:grid-cols-2">
                  {day.marks.map((mark) => (
                    <SkillRow
                      key={mark.skill.id}
                      skill={mark.skill}
                      lead={<StandingMark standing="behind" />}
                      sub={<DomainTag domain={mark.skill.domain} muted />}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
