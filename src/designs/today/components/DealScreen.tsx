import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { Bookmark, BookmarkCheck, CalendarDays, LayoutGrid, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ALL_SKILLS, CATEGORIES } from '@/data/skills';
import { useToday } from '../context';
import {
  CARD_COLOR,
  CARD_INK,
  CARD_INK_SOFT,
  DIFFICULTY_LABEL,
  MOODS,
  TODAY_BASE,
  parseDateKey,
  tomorrowHint,
} from '../deal';

/** The quiet corner: the only navigation this design admits to having. */
function QuietCorner() {
  return (
    <nav aria-label="Quiet corner" className="flex items-center">
      <Link to={`${TODAY_BASE}/find`} aria-label="Find any skill" title="Find any skill ( / )" className="td-quiet">
        <Search size={18} />
      </Link>
      <Link to={`${TODAY_BASE}/days`} aria-label="Past days" title="Past days" className="td-quiet">
        <CalendarDays size={18} />
      </Link>
      <Link to="/" aria-label="Back to the design gallery" title="Back to the design gallery" className="td-quiet">
        <LayoutGrid size={18} />
      </Link>
    </nav>
  );
}

/** Shown once today's dealt card has been completed. Come-back-tomorrow energy. */
function DoneForToday({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center px-6 py-14 text-center">
      <p className="text-[12px] uppercase tracking-[0.3em] text-[var(--td-card)]">That&rsquo;s the day</p>
      <h1 className="td-display mt-4 text-[clamp(2.6rem,9vw,4.5rem)] font-bold leading-[1.02] tracking-tight">
        Done for today.
      </h1>
      <p className="mt-5 text-[17px] leading-relaxed text-[var(--td-text-2)]">
        &ldquo;{title}&rdquo; is part of your days now. The deck rests until tomorrow — it leans toward{' '}
        <span className="font-semibold text-[var(--td-card)]">{hint}</span>.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[14px]">
        <Link to={`${TODAY_BASE}/days`} className="td-link inline-flex min-h-[44px] items-center text-[var(--td-text)]">
          See your days
        </Link>
        <Link to={`${TODAY_BASE}/find`} className="td-link inline-flex min-h-[44px] items-center text-[var(--td-text-2)]">
          Find a skill anyway
        </Link>
      </div>
    </div>
  );
}

/** Design #14's home surface: exactly one skill, dealt for today. */
export default function DealScreen() {
  const {
    dateKey,
    completedSet,
    favoriteIds,
    completionDates,
    deal,
    moodId,
    redealsLeft,
    redeal,
    setMood,
    toggleKeep,
  } = useToday();
  const reduce = useReducedMotion();

  const skill = deal.skill;
  const color = CARD_COLOR[skill.domain];
  const kept = favoriteIds.includes(skill.id);
  const doneToday = completionDates[skill.id] === dateKey;
  const doneCount = completedSet.size;
  const total = ALL_SKILLS.length;

  const cardMotion = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, rotate: 0 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { opacity: 0, y: 56, rotate: 3, scale: 0.97 },
        animate: { opacity: 1, y: 0, rotate: -0.75, scale: 1 },
        exit: { opacity: 0, y: -40, rotate: -4, scale: 0.98 },
        transition: { type: 'spring' as const, stiffness: 280, damping: 26 },
      };

  return (
    <div className="flex min-h-full flex-col" style={{ '--td-card': color } as CSSProperties}>
      <header className="flex items-start justify-between px-5 pt-4 sm:px-8 sm:pt-6">
        <div className="pt-2">
          <p className="td-display text-[16px] font-bold tracking-tight">Today</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.22em] text-[var(--td-text-2)]">
            {format(parseDateKey(dateKey), 'EEEE d MMMM')}
          </p>
        </div>
        <QuietCorner />
      </header>

      {doneToday ? (
        <DoneForToday title={skill.title} hint={tomorrowHint(dateKey, completedSet)} />
      ) : (
        <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8">
          {/* Ambient bloom in the card's color. */}
          <div aria-hidden="true" className="td-glow pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-[540px] w-full max-w-[860px] -translate-y-1/2" />

          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={skill.id}
              {...cardMotion}
              className="td-card-shadow relative w-full max-w-[660px] rounded-[30px] p-7 sm:p-12"
              style={{ backgroundColor: color, color: CARD_INK }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: CARD_INK_SOFT }}>
                {CATEGORIES[skill.domain].name}
                <span aria-hidden="true"> · </span>
                {skill.estimatedMinutes} min
                <span aria-hidden="true"> · </span>
                {DIFFICULTY_LABEL[skill.difficulty]}
              </p>

              <h1 className="td-display mt-4 text-[clamp(2.3rem,7.5vw,4.3rem)] font-bold leading-[1.02] tracking-tight">
                {skill.title}
              </h1>

              <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed" style={{ color: CARD_INK_SOFT }}>
                {skill.learnerPromise}
              </p>

              {deal.refresher && (
                <p
                  className="mt-4 inline-block rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold"
                  style={{ backgroundColor: 'rgba(25,21,33,0.12)', color: CARD_INK }}
                >
                  You&rsquo;ve done this one before — today it comes back around.
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to={`${TODAY_BASE}/skill/${skill.id}`}
                  className="td-display td-btn inline-flex min-h-[56px] items-center justify-center rounded-2xl px-8 text-[17px] font-bold"
                  style={{ backgroundColor: CARD_INK, color }}
                >
                  Do it
                </Link>

                {redealsLeft > 0 && (
                  <button
                    type="button"
                    onClick={redeal}
                    className="td-display td-btn inline-flex min-h-[56px] items-center justify-center rounded-2xl border-[1.5px] px-6 text-[15px] font-semibold"
                    style={{ borderColor: 'rgba(25,21,33,0.4)', color: CARD_INK }}
                  >
                    Not today
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => toggleKeep(skill.id)}
                  aria-pressed={kept}
                  className="td-btn inline-flex min-h-[56px] items-center gap-2 rounded-2xl px-4 text-[14.5px] font-semibold"
                  style={{ color: CARD_INK }}
                >
                  {kept ? <BookmarkCheck size={19} aria-hidden="true" /> : <Bookmark size={19} aria-hidden="true" />}
                  {kept ? 'Kept' : 'Keep this one'}
                </button>
              </div>

              {redealsLeft === 0 && (
                <p className="mt-5 text-[13px] leading-relaxed" style={{ color: CARD_INK_SOFT }}>
                  That&rsquo;s the whole hand for today — this card is yours to sit with. Anything
                  else lives in the quiet corner.
                </p>
              )}
            </motion.article>
          </AnimatePresence>

          <section aria-label="What's today like?" className="relative mt-9 w-full max-w-[660px] text-center">
            <p className="text-[11px] uppercase tracking-[0.26em] text-[var(--td-text-2)]">
              What&rsquo;s today like?
            </p>
            <div className="mt-3.5 flex flex-wrap justify-center gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  type="button"
                  aria-pressed={moodId === mood.id}
                  onClick={() => setMood(moodId === mood.id ? null : mood.id)}
                  className="td-chip"
                >
                  {mood.label}
                </button>
              ))}
            </div>
            {moodId && (
              <p className="mt-3 text-[12.5px] text-[var(--td-text-2)]">
                Dealing for that kind of day — tap the chip again for anything.
              </p>
            )}
          </section>
        </div>
      )}

      <footer className="px-6 pb-6 text-center">
        <p className="text-[11.5px] uppercase tracking-[0.2em] text-[var(--td-text-2)]">
          {doneCount > 0
            ? `${doneCount} of ${total} done — at your own pace`
            : `${total} skills — one a day, no hurry`}
        </p>
      </footer>
    </div>
  );
}
