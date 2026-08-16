import { Link, Navigate, useParams } from 'react-router-dom';
import { Check, Pin } from 'lucide-react';
import type { Skill } from '@/lib/types';
import { useRooms } from '../context';
import {
  DIFFICULTY_META,
  PLACE_MAP,
  RM_BASE,
  domainName,
  minutesLabel,
  placeOf,
  placeProgress,
  shelvesOf,
  visitorsOf,
  type PlaceId,
} from '../places';
import RoomVignette from './RoomVignette';

/** One room: scene flavor, room progress, and everything kept here. */
export default function RoomPage() {
  const { placeId } = useParams();
  const { completedIds, favoriteIds } = useRooms();

  // Own-property check: `in` accepts prototype-chain keys like "constructor".
  const place = placeId && Object.hasOwn(PLACE_MAP, placeId) ? PLACE_MAP[placeId as PlaceId] : null;
  if (!place) return <Navigate to={RM_BASE} replace />;

  const { done, total } = placeProgress(place.id, completedIds);
  const shelves = shelvesOf(place.id);
  const visitors = visitorsOf(place.id);
  const doneSet = new Set(completedIds);
  const pinnedSet = new Set(favoriteIds);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      <Link to={RM_BASE} className="text-[13px] text-[var(--rm-muted)] hover:text-[var(--rm-ink)]">
        ← All rooms
      </Link>

      <header className="mt-4 flex items-start gap-4">
        <div className="rounded-xl border border-[var(--rm-rule)] bg-[var(--rm-card)] p-2">
          <RoomVignette placeId={place.id} size={56} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="rm-serif text-[28px] font-semibold leading-tight text-[var(--rm-ink)]">
            {place.name}
          </h1>
          <p className="rm-serif mt-1 text-[15px] italic text-[var(--rm-muted)]">{place.flavor}</p>
          <div className="mt-3 max-w-sm">
            <div className="flex items-baseline justify-between text-[12px] text-[var(--rm-muted)]">
              <span>{done} of {total} done here</span>
              <span className="tabular-nums">{total > 0 ? Math.round((done / total) * 100) : 0}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--rm-rule)]">
              <div
                className="h-full rounded-full"
                style={{ width: `${total > 0 ? (done / total) * 100 : 0}%`, backgroundColor: place.tint }}
              />
            </div>
          </div>
        </div>
      </header>

      {shelves.map((shelf) => (
        <section key={shelf.level} className="mt-8" aria-label={shelf.label}>
          <h2 className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--rm-amber)]">
            {shelf.label}
            <span className="h-px flex-1 bg-[var(--rm-rule)]" aria-hidden="true" />
          </h2>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {shelf.skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                done={doneSet.has(skill.id)}
                pinned={pinnedSet.has(skill.id)}
              />
            ))}
          </ul>
        </section>
      ))}

      {visitors.length > 0 && (
        <section className="mt-10" aria-label="Also passes through here">
          <h2 className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--rm-muted)]">
            Also passes through here
            <span className="h-px flex-1 bg-[var(--rm-rule)]" aria-hidden="true" />
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {visitors.map((skill) => (
              <li key={skill.id}>
                <Link
                  to={`${RM_BASE}/skill/${skill.id}`}
                  className="rm-lift inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--rm-rule)] bg-[var(--rm-card)] px-3 py-2 text-[13px] text-[var(--rm-ink)]"
                >
                  {doneSet.has(skill.id) && (
                    <Check size={13} className="text-[var(--rm-amber)]" aria-label="Done" />
                  )}
                  {skill.title}
                  <span className="text-[11px] text-[var(--rm-muted)]">
                    lives in {placeOf(skill.id).short}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SkillCard({ skill, done, pinned }: { skill: Skill; done: boolean; pinned: boolean }) {
  const diff = DIFFICULTY_META[skill.difficulty];
  return (
    <li>
      <Link
        to={`${RM_BASE}/skill/${skill.id}`}
        className={`rm-lift flex min-h-[72px] flex-col justify-center gap-1.5 rounded-xl border bg-[var(--rm-card)] p-4 ${
          done ? 'border-[var(--rm-amber-dim)]' : 'border-[var(--rm-rule)]'
        }`}
      >
        <span className="flex items-start justify-between gap-2">
          <span className="text-[15px] font-semibold leading-snug text-[var(--rm-ink)]">
            {skill.title}
          </span>
          <span className="flex shrink-0 items-center gap-1.5 pt-0.5">
            {pinned && <Pin size={13} className="text-[var(--rm-rose)]" aria-label="Pinned" />}
            {done && (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--rm-amber)]"
                aria-label="Done"
              >
                <Check size={12} className="text-[#2A1F12]" aria-hidden="true" />
              </span>
            )}
          </span>
        </span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-[var(--rm-muted)]">
          <span className="uppercase tracking-wide">{domainName(skill.domain)}</span>
          <span aria-hidden="true">·</span>
          <span>{minutesLabel(skill.estimatedMinutes)}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: diff.color }}
              aria-hidden="true"
            />
            {diff.label}
          </span>
        </span>
      </Link>
    </li>
  );
}
