import { useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import type { Skill } from '@/lib/types';
import { useManila } from '../context';
import {
  MA_BASE,
  prevNextCard,
  referencedBy,
  seeAlso,
  tierLabel,
  type CardInfo,
} from '../derive';
import { FiledMark, FiledStamp, Paperclip } from './bits';
import { paperGrain } from '../surfaces';

function TypedLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="ma-type mb-1.5 border-b border-[var(--ma-rule)] pb-0.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--ma-ink)]">
      {children}
    </h3>
  );
}

/** Difficulty row with the applicable word circled in pencil. */
function DifficultyRow({ difficulty }: { difficulty: Skill['difficulty'] }) {
  return (
    <>
      <span className="sr-only">Difficulty: {difficulty}</span>
      <span aria-hidden="true" className="ma-type inline-flex items-center gap-2.5 text-[10px] uppercase tracking-wider text-[var(--ma-graphite)]">
      {(['easy', 'medium', 'hard'] as const).map((d) => (
        <span key={d} className="relative px-1">
          {d === difficulty && (
            <svg
              className="absolute -inset-x-1 -inset-y-1 h-[calc(100%+8px)] w-[calc(100%+8px)]"
              viewBox="0 0 60 24"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <ellipse
                cx="30"
                cy="12"
                rx="27"
                ry="9"
                fill="none"
                stroke="var(--ma-graphite)"
                strokeWidth="1.6"
                strokeDasharray="3 1.5"
                transform="rotate(-2 30 12)"
              />
            </svg>
          )}
          <span className={d === difficulty ? 'font-bold text-[var(--ma-ink)]' : ''}>{d}</span>
        </span>
      ))}
      </span>
    </>
  );
}

/** A typed catalog cross-reference line, with the target's filed state inline. */
function CrossRefLine({ info }: { info: CardInfo }) {
  const { completedIds } = useManila();
  const filed = completedIds.includes(info.skill.id);
  return (
    <Link
      to={`${MA_BASE}/drawer/${info.drawer.domain}/card/${info.skill.id}`}
      className="ma-type group flex items-baseline gap-2 py-0.5 text-[12px] leading-relaxed"
    >
      <span className={`underline decoration-[var(--ma-rule)] underline-offset-2 group-hover:decoration-[var(--ma-ink)] ${filed ? 'text-[var(--ma-graphite)]' : 'text-[var(--ma-ink)]'}`}>
        {info.skill.title}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-[var(--ma-graphite)]">
        (Drawer {info.drawer.num} — {info.drawer.name})
      </span>
      {filed && <FiledMark />}
    </Link>
  );
}

function paperDust() {
  confetti({
    particleCount: 18,
    spread: 55,
    startVelocity: 22,
    gravity: 1.2,
    scalar: 0.75,
    ticks: 90,
    zIndex: 200,
    colors: ['#F3E5BF', '#B3472F', '#6E655B', '#F9F2E0'],
    origin: { y: 0.55 },
  });
}

function SkillCardInner({ info }: { info: CardInfo }) {
  const { completedIds, favoriteIds, completionDates, fileCard, toggleClip } = useManila();
  const { skill, drawer, callNumber } = info;
  const filed = completedIds.includes(skill.id);
  const clipped = favoriteIds.includes(skill.id);
  const [justFiled, setJustFiled] = useState(false);
  const [ghostStamp, setGhostStamp] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(() => skill.completionCriteria.map(() => false));
  const allChecked = checks.length > 0 && checks.every(Boolean);

  const { prev, next } = prevNextCard(skill.id);
  const prereqs = seeAlso(skill);
  const refs = referencedBy(skill);

  const handleFile = () => {
    if (filed) return;
    if (fileCard(skill.id)) {
      setJustFiled(true);
      paperDust();
    }
  };

  return (
    <article
      className="relative rounded-sm border border-black/30 bg-[var(--ma-card)] shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
      style={{ ...paperGrain(), borderLeft: `5px solid ${drawer.tint}` }}
    >
      {/* Red top rule */}
      <div className="h-[3px] w-full bg-[var(--ma-redrule)]" />

      <div className="px-4 pb-4 pt-3.5 sm:px-6 sm:pb-6 sm:pt-5">
        {/* Mobile: back to the drawer */}
        <Link
          to={`${MA_BASE}/drawer/${drawer.domain}`}
          className="ma-type mb-2 inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-[var(--ma-graphite)] hover:text-[var(--ma-ink)] md:hidden"
        >
          <ChevronLeft size={12} /> Drawer {drawer.num} — {drawer.name}
        </Link>

        {/* Header zone */}
        <header className="relative border-b-2 border-[var(--ma-rule)] pb-3">
          {(filed || ghostStamp) && (
            <div className="absolute -right-1 -top-1 sm:right-0 sm:top-0">
              {/* Keyed on ghost/filed so the slam remounts (framer `initial` is mount-only) */}
              <FiledStamp
                key={filed ? 'filed' : 'ghost'}
                date={completionDates[skill.id]}
                animate={justFiled}
                ghost={!filed && ghostStamp}
              />
            </div>
          )}
          <h1 className={`ma-type text-[20px] font-bold leading-snug text-[var(--ma-ink)] sm:text-[22px] ${filed || ghostStamp ? 'pr-24' : ''}`}>
            {skill.title}
          </h1>
          <p className="ma-type mt-1.5 text-[10px] uppercase tracking-[0.1em] text-[var(--ma-graphite)]">
            Card {callNumber} · Drawer: {drawer.name} · {tierLabel(skill.level)} · ~{skill.estimatedMinutes} min
          </p>
          <div className="mt-1.5">
            <DifficultyRow difficulty={skill.difficulty} />
          </div>
          <p className="ma-body mt-2.5 text-[14px] leading-relaxed text-[var(--ma-ink)]">
            {skill.summary}
          </p>
        </header>

        <div className="mt-4 space-y-5">
          <section>
            <TypedLabel>Why it matters</TypedLabel>
            <p className="ma-body text-[13.5px] leading-relaxed text-[var(--ma-ink)]">
              {skill.whyItMatters}
            </p>
          </section>

          {skill.realLifeUses.length > 0 && (
            <section>
              <TypedLabel>Real-life uses</TypedLabel>
              <ul className="space-y-1">
                {skill.realLifeUses.map((use, i) => (
                  <li key={i} className="ma-body flex items-start gap-2 text-[13px] leading-relaxed text-[var(--ma-ink)]">
                    <span className="ma-type mt-px shrink-0 text-[11px] text-[var(--ma-graphite)]">–</span>
                    {use}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skill.steps.length > 0 && (
            <section>
              <TypedLabel>Steps</TypedLabel>
              <ol className="space-y-2">
                {skill.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="ma-type w-5 shrink-0 pt-px text-right text-[13px] font-bold" style={{ color: drawer.tint }}>
                      {i + 1}.
                    </span>
                    <p className="ma-body text-[13.5px] leading-relaxed text-[var(--ma-ink)]">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {skill.youWillLearn.length > 0 && (
            <section>
              <TypedLabel>You will learn</TypedLabel>
              <ul className="space-y-1">
                {skill.youWillLearn.map((item, i) => (
                  <li key={i} className="ma-body flex items-start gap-2 text-[13px] leading-relaxed text-[var(--ma-ink)]">
                    <span className="ma-type mt-px shrink-0 text-[11px]" style={{ color: drawer.tint }}>+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Stapled mini-challenge slip with the criteria checklist */}
          {skill.miniChallenge && (
            <section
              className="relative rotate-[0.6deg] rounded-sm border border-black/20 bg-[var(--ma-manila)] px-4 pb-3.5 pt-4 shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
              style={paperGrain()}
            >
              <svg className="absolute left-1/2 top-[-4px] h-[10px] w-[26px] -translate-x-1/2" viewBox="0 0 26 10" aria-hidden="true">
                <path d="M 3 10 L 3 3 L 23 3 L 23 10" fill="none" stroke="#7E7A72" strokeWidth="2.4" />
              </svg>
              <h3 className="ma-type mb-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--ma-ink)]">
                Try it — mini challenge
              </h3>
              <p className="ma-body text-[13px] leading-relaxed text-[var(--ma-ink)]">{skill.miniChallenge}</p>
              {skill.completionCriteria.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-[var(--ma-ink)]/15 pt-2.5">
                  <p className="ma-type text-[9.5px] uppercase tracking-wider text-[var(--ma-graphite)]">
                    Done when {!filed && '(tick these off — just for you, nothing is locked)'}
                  </p>
                  {skill.completionCriteria.map((criterion, i) => {
                    const ticked = filed || checks[i];
                    return (
                      <label key={i} className="ma-body flex cursor-pointer items-start gap-2 text-[12.5px] leading-relaxed text-[var(--ma-ink)]">
                        <input
                          type="checkbox"
                          checked={ticked}
                          disabled={filed}
                          onChange={() => setChecks((prev) => prev.map((c, ci) => (ci === i ? !c : c)))}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={`ma-type shrink-0 select-none text-[13px] font-bold peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--ma-brass)] ${
                            ticked ? 'text-[var(--ma-stamp)]' : 'text-[var(--ma-graphite)]'
                          }`}
                        >
                          [{ticked ? 'x' : ' '}]
                        </span>
                        {criterion}
                      </label>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {skill.tips && skill.tips.length > 0 && (
            <section>
              <TypedLabel>Tips — in pencil</TypedLabel>
              <ul className="space-y-1">
                {skill.tips.map((tip, i) => (
                  <li key={i} className="ma-body flex items-start gap-2 text-[12.5px] italic leading-relaxed text-[var(--ma-graphite)]">
                    <span className="ma-type mt-px shrink-0 not-italic">✎</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skill.commonProblems && skill.commonProblems.length > 0 && (
            <section>
              <TypedLabel>Known issues</TypedLabel>
              <ul className="space-y-1">
                {skill.commonProblems.map((problem, i) => (
                  <li key={i} className="ma-body flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--ma-ink)]">
                    <span className="ma-type mt-px shrink-0 text-[11px] font-bold text-[var(--ma-redrule)]">!</span>
                    {problem}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(prereqs.length > 0 || refs.length > 0) && (
            <section>
              <TypedLabel>Cross-references</TypedLabel>
              {prereqs.length > 0 && (
                <>
                  <p className="ma-type text-[9.5px] uppercase tracking-wider text-[var(--ma-graphite)]">
                    See also — suggested first, not required:
                  </p>
                  {prereqs.map((p) => (
                    <CrossRefLine key={p.skill.id} info={p} />
                  ))}
                </>
              )}
              {refs.length > 0 && (
                <>
                  <p className={`ma-type text-[9.5px] uppercase tracking-wider text-[var(--ma-graphite)] ${prereqs.length > 0 ? 'mt-2' : ''}`}>
                    Referenced by:
                  </p>
                  {refs.map((r) => (
                    <CrossRefLine key={r.skill.id} info={r} />
                  ))}
                </>
              )}
            </section>
          )}

          {/* Onward travel */}
          <div className="ma-type flex items-center justify-between border-t border-[var(--ma-rule)] pt-3 text-[11px] uppercase tracking-wider">
            {prev ? (
              <Link to={`${MA_BASE}/drawer/${drawer.domain}/card/${prev.skill.id}`} className="text-[var(--ma-graphite)] hover:text-[var(--ma-ink)]" title={prev.skill.title}>
                ← {prev.callNumber}
              </Link>
            ) : (
              <span className="text-[var(--ma-graphite)]/40">← —</span>
            )}
            {justFiled && next && (
              <Link to={`${MA_BASE}/drawer/${drawer.domain}/card/${next.skill.id}`} className="flex items-center gap-1 font-bold text-[var(--ma-ink)] hover:text-[var(--ma-stamp)]">
                Next card: {next.skill.title} <ArrowRight size={11} />
              </Link>
            )}
            {next ? (
              <Link to={`${MA_BASE}/drawer/${drawer.domain}/card/${next.skill.id}`} className="text-[var(--ma-graphite)] hover:text-[var(--ma-ink)]" title={next.skill.title}>
                {next.callNumber} →
              </Link>
            ) : (
              <span className="text-[var(--ma-graphite)]/40">— →</span>
            )}
          </div>
        </div>
      </div>

      {/* Action bar — sticks to the bottom of whichever container scrolls the card */}
      <div className="sticky bottom-0 flex items-center gap-2.5 rounded-b-sm border-t border-[var(--ma-rule)] bg-[var(--ma-card)]/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        {!filed ? (
          <button
            onClick={handleFile}
            onMouseEnter={() => setGhostStamp(true)}
            onMouseLeave={() => setGhostStamp(false)}
            onFocus={() => setGhostStamp(true)}
            onBlur={() => setGhostStamp(false)}
            className={`ma-type rounded-sm bg-[var(--ma-stamp)] px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-[0.1em] text-[var(--ma-card)] transition-shadow hover:brightness-110 ${
              allChecked ? 'shadow-[0_0_0_2px_var(--ma-card),0_0_0_4px_var(--ma-stamp)]' : ''
            }`}
          >
            File this card
          </button>
        ) : (
          <span className="ma-type text-[11px] font-bold uppercase tracking-wider text-[var(--ma-stamp)]">
            Filed{completionDates[skill.id] ? ` · in your dossier` : ''}
          </span>
        )}
        <button
          onClick={() => toggleClip(skill.id)}
          className={`ma-type flex items-center gap-1.5 rounded-sm border px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
            clipped
              ? 'border-[var(--ma-graphite)] text-[var(--ma-ink)]'
              : 'border-[var(--ma-rule)] text-[var(--ma-graphite)] hover:text-[var(--ma-ink)]'
          }`}
        >
          <Paperclip size={12} />
          {clipped ? 'Clipped' : 'Clip it'}
        </button>
      </div>
    </article>
  );
}

/** The full typed index card. Keyed so per-card state resets on navigation. */
export default function SkillCard({ info }: { info: CardInfo }) {
  return <SkillCardInner key={info.skill.id} info={info} />;
}
