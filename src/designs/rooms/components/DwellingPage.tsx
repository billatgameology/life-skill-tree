import { Link } from 'react-router-dom';
import { Pin } from 'lucide-react';
import { SKILL_MAP } from '@/data/skills';
import { useRooms } from '../context';
import { PLACES, RM_BASE, overallProgress, placeOf, placeProgress } from '../places';
import FloorPlan from './FloorPlan';
import RoomVignette from './RoomVignette';

/** Home surface: the dwelling at dusk (desktop) / illustrated room list (mobile). */
export default function DwellingPage() {
  const { completedIds, favoriteIds } = useRooms();
  const { done, total } = overallProgress(completedIds);
  const pinned = favoriteIds.filter((id) => SKILL_MAP[id]);

  const indoors = PLACES.filter((p) => p.indoors);
  const outdoors = PLACES.filter((p) => !p.indoors);

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-16 pt-8 sm:px-6">
      <section className="mb-8">
        <h1 className="rm-serif text-3xl font-semibold text-[var(--rm-ink)] sm:text-4xl">
          Every skill lives somewhere.
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[var(--rm-muted)]">
          Not by subject — by place. Walk into the kitchen, the laundry corner, the street outside.
          Each skill you finish turns on another light.
        </p>
        <div className="mt-4 max-w-md">
          <div className="flex items-baseline justify-between text-[12px] text-[var(--rm-muted)]">
            <span>{done} of {total} lamps lit</span>
            <span className="tabular-nums">{total > 0 ? Math.round((done / total) * 100) : 0}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--rm-rule)]" role="presentation">
            <div
              className="h-full rounded-full bg-[var(--rm-amber)]"
              style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </section>

      {/* Desktop: the dwelling cutaway */}
      <section className="hidden lg:block" aria-label="Floor plan">
        <FloorPlan />
        <p className="mt-2 text-center text-[12px] text-[var(--rm-muted)]">
          Click a room to walk in · press <kbd className="rounded border border-[var(--rm-rule)] px-1">/</kbd> to search
        </p>
      </section>

      {/* Mobile / narrow: illustrated room list */}
      <section className="lg:hidden" aria-label="Rooms">
        <RoomList title="Inside" places={indoors} completedIds={completedIds} />
        <RoomList title="Out in the world" places={outdoors} completedIds={completedIds} />
      </section>

      {pinned.length > 0 && (
        <section className="mt-10" aria-label="Pinned skills">
          <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--rm-amber)]">
            <Pin size={13} aria-hidden="true" /> On the corkboard
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {pinned.map((id) => {
              const skill = SKILL_MAP[id];
              const place = placeOf(id);
              return (
                <li key={id}>
                  <Link
                    to={`${RM_BASE}/skill/${id}`}
                    className="rm-lift inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--rm-rule)] bg-[var(--rm-card)] px-3 py-2 text-[13px] text-[var(--rm-ink)]"
                  >
                    {skill.title}
                    <span className="text-[11px] text-[var(--rm-muted)]">{place.short}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function RoomList({
  title,
  places,
  completedIds,
}: {
  title: string;
  places: typeof PLACES;
  completedIds: string[];
}) {
  return (
    <div className="mb-7">
      <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--rm-muted)]">
        {title}
      </h2>
      <ul className="flex flex-col gap-2.5">
        {places.map((p) => {
          const { done, total } = placeProgress(p.id, completedIds);
          return (
            <li key={p.id}>
              <Link
                to={`${RM_BASE}/room/${p.id}`}
                className="rm-lift flex items-center gap-4 rounded-xl border border-[var(--rm-rule)] bg-[var(--rm-card)] p-4"
              >
                <RoomVignette placeId={p.id} />
                <span className="min-w-0 flex-1">
                  <span className="rm-serif block text-[17px] font-semibold leading-snug text-[var(--rm-ink)]">
                    {p.name}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-[var(--rm-muted)]">
                    {p.flavor}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="text-[12px] tabular-nums text-[var(--rm-muted)]">{done}/{total}</span>
                  <span className="block h-1.5 w-16 overflow-hidden rounded-full bg-[var(--rm-rule)]">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${total > 0 ? (done / total) * 100 : 0}%`, backgroundColor: p.tint }}
                    />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
