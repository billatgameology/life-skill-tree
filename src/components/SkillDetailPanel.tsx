import { useState, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Check, GripVertical, ArrowRight, Star } from 'lucide-react';
import type { Skill } from '@/lib/types';
import { CATEGORIES, ALL_SKILLS, getChildren } from '@/data/skills';

interface SkillDetailPanelProps {
  skill: Skill | null;
  completedIds: string[];
  onComplete: (skillId: string, xp: number) => boolean;
  onShowCelebration: () => void;
  onShowToast: (msg: string) => void;
  favoriteIds: string[];
  onToggleFavorite: (skillId: string) => boolean;
  isMobile?: boolean;
}

const MIN_WIDTH = 320;
const MAX_WIDTH = 640;
const DEFAULT_WIDTH = 420;

export default function SkillDetailPanel({
  skill,
  completedIds,
  onComplete,
  onShowCelebration,
  onShowToast,
  favoriteIds,
  onToggleFavorite,
  isMobile = false,
}: SkillDetailPanelProps) {
  const [justCompletedSkillId, setJustCompletedSkillId] = useState<string | null>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const panelRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(DEFAULT_WIDTH);

  const stopResize = useCallback(() => {
    if (!isResizingRef.current) return;
    isResizingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    // Sync final width to React state so placeholder/content panels stay in sync
    if (panelRef.current) {
      const finalWidth = panelRef.current.getBoundingClientRect().width;
      setWidth(Math.round(finalWidth));
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const delta = startXRef.current - e.clientX;
    const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta));
    if (panelRef.current) {
      panelRef.current.style.width = `${newWidth}px`;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    stopResize();
    document.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove, stopResize]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = panelRef.current?.getBoundingClientRect().width || width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, { once: true });
  }, [width, handleMouseMove, handleMouseUp]);

  const isCompleted = skill ? completedIds.includes(skill.id) : false;
  const isFavorite = skill ? favoriteIds.includes(skill.id) : false;
  const justCompleted = Boolean(skill && justCompletedSkillId === skill.id);
  const isEffectivelyCompleted = isCompleted || justCompleted;
  const category = skill ? CATEGORIES[skill.domain] : null;

  // Related skills
  const prerequisites = skill
    ? skill.suggestedPrerequisites.map(pid => ALL_SKILLS.find(s => s.id === pid)).filter(Boolean) as Skill[]
    : [];
  const unlocks = skill ? getChildren(skill.id) : [];

  const triggerConfetti = () => {
    if (!category) return;
    const defaults = { origin: { y: 0.6 }, zIndex: 200 };
    confetti({ ...defaults, particleCount: 30, spread: 60, colors: [category.color, '#D4AF37', '#FFFFFF'] });
    confetti({ ...defaults, particleCount: 30, spread: 100, colors: [category.color, '#D4AF37', '#FFFFFF'] });
    confetti({ ...defaults, particleCount: 20, spread: 140, scalar: 0.8, colors: ['#D4AF37', '#FFFFFF'] });
  };

  const handleComplete = () => {
    if (!skill || isCompleted || justCompleted) return;
    const completed = onComplete(skill.id, skill.xp);
    if (!completed) return;

    if (isFavorite) {
      onToggleFavorite(skill.id);
    }

    setJustCompletedSkillId(skill.id);
    triggerConfetti();
    onShowCelebration();
    onShowToast(`+${skill.xp} XP earned!`);
  };

  const handleToggleFavorite = () => {
    if (!skill) return;
    onToggleFavorite(skill.id);
  };

  const resizeHandle = !isMobile && (
    <div
      onMouseDown={handleMouseDown}
      className="absolute left-0 top-0 bottom-0 w-4 -translate-x-1/2 cursor-col-resize z-20 group flex items-center justify-center"
      title="Drag to resize"
    >
      <div className="w-px h-8 rounded-full bg-border group-hover:bg-glow-gold/50 transition-colors" />
      <GripVertical size={10} className="absolute text-ink-dim/30 group-hover:text-glow-gold/60 transition-colors" />
    </div>
  );

  // Placeholder when no skill selected
  if (!skill || !category) {
    return (
      <div
        ref={panelRef}
        className="flex-shrink-0 h-full bg-surface border-l border-border flex flex-col items-center justify-center text-center px-5 select-none relative"
        style={{ width: isMobile ? '100vw' : `clamp(300px, 37vw, ${width}px)` }}
      >
        {resizeHandle}
        <div className="w-16 h-16 rounded-full bg-surface-raised border border-border flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A4858" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <p className="text-ink-dim text-sm font-heading font-semibold mb-1">Select a Skill</p>
        <p className="text-ink-dim/60 text-xs font-body">Click any node on the tree to view its details</p>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 h-full bg-surface border-l border-border flex flex-col overflow-hidden relative"
      style={{ width: isMobile ? '100vw' : `clamp(300px, 37vw, ${width}px)` }}
    >
      {resizeHandle}
      {/* Header with category color */}
      <div
        className={`relative flex-shrink-0 ${isMobile ? 'px-3.5 py-3 pr-12 text-left' : 'pt-6 pb-4 px-5 text-center'}`}
        style={{ backgroundColor: `${category.color}10`, borderBottom: `1px solid ${category.color}30` }}
      >
        {isMobile ? (
          <>
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-full flex flex-shrink-0 items-center justify-center text-sm relative mt-0.5"
                style={{
                  backgroundColor: isCompleted ? '#D4AF3720' : `${category.color}20`,
                  border: isCompleted ? '2px solid #D4AF37' : `2px solid ${category.color}60`,
                  boxShadow: isCompleted
                    ? '0 0 10px rgba(212,175,55,0.18)'
                    : `0 0 10px ${category.color}18`,
                }}
              >
                {isCompleted ? (
                  <Check size={18} strokeWidth={3} className="text-glow-gold" />
                ) : (
                  <span style={{ color: category.color }}>{category.icon}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <h2 className="min-w-0 truncate font-heading text-ink font-semibold leading-snug text-[13px]">
                    {skill.title}
                  </h2>
                  <span
                    className="inline-block max-w-[42%] flex-shrink-0 truncate px-2 py-0.5 rounded-full text-[9px] font-heading font-semibold text-white"
                    style={{ backgroundColor: `${category.color}90` }}
                  >
                    {category.name}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 bg-surface-raised text-glow-gold font-heading font-bold text-[10px] px-2 py-0.5 rounded-full border border-border">
                    +{skill.xp} XP
                  </span>
                  {!isEffectivelyCompleted && (
                    <>
                      <button
                        onClick={handleToggleFavorite}
                        className={`inline-flex h-6 items-center justify-center rounded-full border px-2 text-[10px] font-heading font-bold transition-colors ${
                          isFavorite
                            ? 'bg-glow-gold/15 border-glow-gold/50 text-glow-gold'
                            : 'bg-surface-raised border-border text-ink-dim hover:text-ink'
                        }`}
                        title={isFavorite ? 'Favorited' : 'Add to favorites'}
                        aria-label={isFavorite ? 'Favorited' : 'Add to favorites'}
                      >
                        {isFavorite ? 'Favorited' : 'Favorite'}
                      </button>
                      <button
                        onClick={handleComplete}
                        className="inline-flex h-6 items-center justify-center rounded-full bg-glow-gold px-2.5 text-[10px] font-heading font-bold text-void transition-all cursor-pointer hover:brightness-110 active:brightness-90"
                      >
                        I Did It!
                      </button>
                    </>
                  )}
                  {isEffectivelyCompleted && (
                    <span className="inline-flex h-6 items-center justify-center rounded-full bg-glow-green/20 px-2.5 text-[10px] font-heading font-bold text-glow-green">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <span
              className="inline-block px-3 py-0.5 rounded-full text-[11px] font-heading font-semibold text-white mb-3"
              style={{ backgroundColor: `${category.color}90` }}
            >
              {category.name}
            </span>

            <div
              className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-lg relative mb-3"
              style={{
                backgroundColor: isCompleted ? '#D4AF3720' : `${category.color}20`,
                border: isCompleted ? '2px solid #D4AF37' : `2px solid ${category.color}60`,
                boxShadow: isCompleted
                  ? '0 0 12px rgba(212,175,55,0.2)'
                  : `0 0 12px ${category.color}20`,
              }}
            >
              {isCompleted ? (
                <Check size={24} strokeWidth={3} className="text-glow-gold" />
              ) : (
                <span style={{ color: category.color }}>{category.icon}</span>
              )}
            </div>

            <h2 className="font-heading text-ink font-semibold leading-tight text-base mb-2">
              {skill.title}
            </h2>

            <span className="inline-flex items-center gap-1 bg-surface-raised text-glow-gold font-heading font-bold text-[11px] px-3 py-0.5 rounded-full border border-border">
              +{skill.xp} XP
            </span>
            {!isEffectivelyCompleted && (
              <button
                onClick={handleToggleFavorite}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-heading font-semibold mt-3 ${
                  isFavorite
                    ? 'bg-glow-gold/15 border-glow-gold/50 text-glow-gold'
                    : 'bg-surface-raised border-border text-ink-dim hover:text-ink'
                }`}
              >
                <Star size={11} className={isFavorite ? 'fill-glow-gold' : ''} />
                {isFavorite ? 'Favorited' : 'Add to Favorites'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Scrollable content */}
      <div className={`detail-scrollbar flex-1 overflow-y-auto ${isMobile ? 'px-3.5 py-2.5 pr-2.5 space-y-2' : 'px-5 py-4 pr-4 space-y-4'}`}>
        {/* Learner Promise */}
        <p className={`text-ink font-body font-medium ${isMobile ? 'text-[13px] leading-snug' : 'text-sm leading-relaxed'}`}>
          {skill.learnerPromise}
        </p>

        {/* Difficulty + Time + XP badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md bg-surface-raised border border-border text-[11px] text-ink-dim font-heading font-semibold capitalize">
            {skill.difficulty}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-surface-raised border border-border text-[11px] text-ink-dim font-heading font-semibold">
            {skill.estimatedMinutes} min
          </span>
          <span className="px-2 py-0.5 rounded-md bg-glow-gold/10 border border-glow-gold/30 text-[11px] text-glow-gold font-heading font-bold">
            +{skill.xp} XP
          </span>
        </div>

        {/* Why This Matters */}
        <div className="space-y-1">
          <h3 className="font-heading font-bold text-ink text-xs uppercase tracking-wider">
            Why This Matters
          </h3>
          <p className="text-ink-muted font-body text-xs leading-relaxed">
            {skill.whyItMatters}
          </p>
        </div>

        {/* Real-Life Uses */}
        {skill.realLifeUses.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="font-heading font-bold text-ink text-xs uppercase tracking-wider">
              You Might Use This When...
            </h3>
            <ul className="space-y-1">
              {skill.realLifeUses.map((use, i) => (
                <li key={i} className="text-ink-muted font-body text-xs leading-relaxed flex items-start gap-2">
                  <span style={{ color: category.color }} className="mt-0.5 flex-shrink-0">-</span>
                  {use}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What You Will Learn */}
        {skill.youWillLearn.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="font-heading font-bold text-ink text-xs uppercase tracking-wider">
              What You Will Learn
            </h3>
            <ul className="space-y-1">
              {skill.youWillLearn.map((item, i) => (
                <li key={i} className="text-ink-muted font-body text-xs leading-relaxed flex items-start gap-2">
                  <Check size={10} className="mt-0.5 flex-shrink-0" style={{ color: category.color }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mini Challenge */}
        {skill.miniChallenge && (
          <div
            className="p-3 rounded-xl border text-xs font-body font-medium leading-relaxed"
            style={{
              backgroundColor: `${category.color}08`,
              borderColor: `${category.color}25`,
              color: '#C8C6D2',
            }}
          >
            <span className="font-heading font-bold block mb-0.5" style={{ color: category.color }}>Try This</span>
            {skill.miniChallenge}
          </div>
        )}

        {/* Steps */}
        {skill.steps.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-ink text-xs uppercase tracking-wider">
              Step-by-Step
            </h3>
            <div className="space-y-2">
              {skill.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white font-heading font-bold text-[10px] mt-0.5"
                    style={{ backgroundColor: isCompleted ? '#5B9B6B' : category.color }}
                  >
                    {isCompleted ? <Check size={10} /> : i + 1}
                  </span>
                  <p className={`text-xs font-body leading-relaxed ${isCompleted ? 'text-ink-dim line-through opacity-50' : 'text-ink-muted'}`}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion Criteria */}
        {skill.completionCriteria.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="font-heading font-bold text-ink text-xs uppercase tracking-wider">
              Completion Criteria
            </h3>
            <ul className="space-y-1">
              {skill.completionCriteria.map((criterion, i) => (
                <li key={i} className="text-ink-muted font-body text-xs leading-relaxed flex items-start gap-2">
                  <Check size={10} className="mt-0.5 flex-shrink-0 text-glow-gold" />
                  {criterion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Common Problems */}
        {skill.commonProblems && skill.commonProblems.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="font-heading font-bold text-ink-dim text-xs uppercase tracking-wider">
              Common Problems
            </h3>
            <ul className="space-y-1">
              {skill.commonProblems.map((problem, i) => (
                <li key={i} className="text-ink-dim font-body text-xs leading-relaxed flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0 text-ink-dim/50">!</span>
                  {problem}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Builds On */}
        {prerequisites.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="font-heading font-bold text-ink text-xs uppercase tracking-wider">
              Builds On
            </h3>
            <ul className="space-y-1">
              {prerequisites.map(pre => {
                const preDone = completedIds.includes(pre.id);
                const preCat = CATEGORIES[pre.domain];
                return (
                  <li key={pre.id} className="flex items-center gap-2 text-xs font-body">
                    <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${preDone ? 'bg-glow-green/20 text-glow-green' : 'bg-surface-raised border border-border text-ink-dim'}`}>
                      {preDone ? <Check size={8} strokeWidth={3} /> : <span className="text-[8px]">○</span>}
                    </span>
                    <span className={preDone ? 'text-ink-dim line-through opacity-60' : 'text-ink-muted'}>
                      {pre.title}
                    </span>
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-surface-raised border border-border text-ink-dim/60">
                      {preCat.name}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Leads To */}
        {unlocks.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="font-heading font-bold text-ink text-xs uppercase tracking-wider">
              Leads To
            </h3>
            <ul className="space-y-1">
              {unlocks.map(child => {
                const childDone = completedIds.includes(child.id);
                const childCat = CATEGORIES[child.domain];
                return (
                  <li key={child.id} className="flex items-center gap-2 text-xs font-body">
                    <ArrowRight size={10} className="flex-shrink-0 text-ink-dim/40" />
                    <span className={childDone ? 'text-glow-gold' : 'text-ink-muted'}>
                      {child.title}
                    </span>
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-surface-raised border border-border text-ink-dim/60">
                      {childCat.name}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Tips */}
        {skill.tips && skill.tips.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="font-heading font-bold text-glow-gold text-xs uppercase tracking-wider">
              Tips
            </h3>
            <ul className="space-y-1">
              {skill.tips.map((tip, i) => (
                <li key={i} className="text-ink-muted font-body text-xs leading-relaxed flex items-start gap-2">
                  <span className="text-glow-gold mt-0.5 flex-shrink-0">-</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer action button */}
      <div className={`flex-shrink-0 border-t border-border bg-surface ${isMobile || isEffectivelyCompleted ? 'hidden' : 'p-4'}`}>
        <button
          onClick={handleComplete}
          disabled={isCompleted || justCompleted}
          className={`w-full font-heading font-bold transition-all cursor-pointer ${isMobile ? 'py-2 rounded-lg text-xs' : 'py-3 rounded-xl text-sm'} ${
            isCompleted || justCompleted
              ? 'bg-glow-green/20 text-glow-green cursor-default'
              : 'bg-glow-gold text-void hover:brightness-110 active:brightness-90'
          }`}
        >
          {isCompleted ? 'Completed' : justCompleted ? 'Done!' : 'I Did It!'}
        </button>
      </div>
    </div>
  );
}
