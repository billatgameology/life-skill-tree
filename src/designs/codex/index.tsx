import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Check, Heart, Home, Search, Star, X } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import AuthModal from '@/components/AuthModal';
import Toast from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { ALL_SKILLS, CATEGORIES, CATEGORY_KEYS, getChildren, SKILL_MAP } from '@/data/skills';
import type { DomainKey, Skill } from '@/lib/types';

/** Codex's scoped palette — warm paper and moss ink. */
const THEME: CSSProperties = {
  '--cx-paper': '#F4F1EA',
  '--cx-ink': '#2A2F23',
  '--cx-ink2': '#5A5F52',
  '--cx-rule': '#D9D4C8',
  '--cx-card': '#FFFBF4',
  '--cx-gold': '#B89A4D',
  '--cx-gold2': '#D4B86A',
} as CSSProperties;

type Chapter = {
  key: DomainKey;
  name: string;
  color: string;
  skills: Skill[];
  completed: number;
  total: number;
};

type ToastState = { message: string; visible: boolean };

function emptyToast() {
  return { message: '', visible: false };
}

function formatPercent(numerator: number, denominator: number) {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="cx-display mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--cx-gold)]">
        {title}
      </h3>
      <div className="cx-sans text-sm leading-relaxed text-[var(--cx-ink)]">{children}</div>
    </section>
  );
}

function SkillSpecimen({
  skill,
  completed,
  favorited,
  onClose,
  onComplete,
  onFavorite,
}: {
  skill: Skill;
  completed: boolean;
  favorited: boolean;
  onClose: () => void;
  onComplete: (id: string) => void;
  onFavorite: (id: string) => void;
}) {
  const prerequisites = skill.suggestedPrerequisites
    .map((id) => SKILL_MAP[id])
    .filter(Boolean) as Skill[];
  const dependents = getChildren(skill.id) as Skill[];

  return (
    <div className="cx-sans relative h-full overflow-y-auto bg-[var(--cx-paper)] p-6 lg:p-10">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--cx-rule)] text-[var(--cx-ink2)] transition-colors hover:border-[var(--cx-gold)] hover:text-[var(--cx-ink)]"
        aria-label="Close entry"
      >
        <X size={18} />
      </button>

      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--cx-gold)]">
          <BookOpen size={14} />
          <span>{CATEGORIES[skill.domain].name}</span>
          <span className="text-[var(--cx-ink2)]">·</span>
          <span className="cx-mono text-[var(--cx-ink2)]">{skill.difficulty}</span>
          <span className="text-[var(--cx-ink2)]">·</span>
          <span className="cx-mono text-[var(--cx-ink2)]">{skill.estimatedMinutes} min</span>
        </div>

        <h2 className="cx-display mb-4 text-3xl font-semibold text-[var(--cx-ink)] lg:text-4xl">
          {skill.title}
        </h2>

        <p className="mb-8 text-lg italic leading-relaxed text-[var(--cx-ink2)]">
          {skill.learnerPromise}
        </p>

        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => onComplete(skill.id)}
            className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${
              completed
                ? 'border-[var(--cx-gold)] bg-[var(--cx-gold)] text-[var(--cx-paper)]'
                : 'border-[var(--cx-rule)] text-[var(--cx-ink)] hover:border-[var(--cx-gold)] hover:text-[var(--cx-gold)]'
            }`}
          >
            <Check size={16} />
            {completed ? 'Marked' : 'Mark field'}
          </button>
          <button
            onClick={() => onFavorite(skill.id)}
            className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${
              favorited
                ? 'border-[var(--cx-gold)] text-[var(--cx-gold)]'
                : 'border-[var(--cx-rule)] text-[var(--cx-ink2)] hover:border-[var(--cx-gold)] hover:text-[var(--cx-gold)]'
            }`}
          >
            <Heart size={16} className={favorited ? 'fill-current' : ''} />
            {favorited ? 'Bookmarked' : 'Bookmark'}
          </button>
        </div>

        <div className="space-y-6 border-t border-[var(--cx-rule)] pt-6">
          <Section title="Why it matters">{skill.whyItMatters}</Section>

          <Section title="Real-life uses">
            <ul className="list-disc space-y-1 pl-5">
              {skill.realLifeUses.map((use, i) => (
                <li key={i}>{use}</li>
              ))}
            </ul>
          </Section>

          <Section title="What you will learn">
            <ul className="list-disc space-y-1 pl-5">
              {skill.youWillLearn.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="Mini challenge">{skill.miniChallenge}</Section>

          <Section title="Steps">
            <ol className="list-decimal space-y-2 pl-5">
              {skill.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </Section>

          <Section title="Completion criteria">
            <ul className="list-disc space-y-1 pl-5">
              {skill.completionCriteria.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </Section>

          {skill.commonProblems && skill.commonProblems.length > 0 && (
            <Section title="Common problems">
              <ul className="list-disc space-y-1 pl-5">
                {skill.commonProblems.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </Section>
          )}

          {skill.tips && skill.tips.length > 0 && (
            <Section title="Field notes">
              <ul className="list-disc space-y-1 pl-5">
                {skill.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </Section>
          )}

          {prerequisites.length > 0 && (
            <Section title="Builds on">
              <div className="flex flex-wrap gap-2">
                {prerequisites.map((p) => (
                  <span key={p.id} className="rounded-md bg-[var(--cx-card)] px-2 py-1 text-xs text-[var(--cx-ink2)]">
                    {p.title}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {dependents.length > 0 && (
            <Section title="Leads to">
              <div className="flex flex-wrap gap-2">
                {dependents.map((d) => (
                  <span key={d.id} className="rounded-md bg-[var(--cx-card)] px-2 py-1 text-xs text-[var(--cx-ink2)]">
                    {d.title}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CodexApp() {
  const { currentUser, authError, clearAuthError } = useAuth();
  const { user, loaded, completeSkill, toggleFavorite } = useUserData();

  const [query, setQuery] = useState('');
  const [activeKey, setActiveKey] = useState<DomainKey>(CATEGORY_KEYS[0]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(emptyToast());

  const completedIds = useMemo(() => user?.completedSkillIds ?? [], [user]);
  const favoriteIds = useMemo(() => user?.favorite ?? [], [user]);

  const allChapters = useMemo<Chapter[]>(() => {
    return CATEGORY_KEYS.map((key) => {
      const skills = ALL_SKILLS.filter((s) => s.domain === key).sort(
        (a, b) => a.level - b.level || a.title.localeCompare(b.title),
      );
      const completed = skills.filter((s) => completedIds.includes(s.id)).length;
      return {
        key,
        name: CATEGORIES[key].name,
        color: CATEGORIES[key].color,
        skills,
        completed,
        total: skills.length,
      };
    });
  }, [completedIds]);

  const filteredChapters = useMemo(() => {
    if (!query.trim()) return allChapters;
    const q = query.toLowerCase();
    return allChapters
      .map((chapter) => ({
        ...chapter,
        skills: chapter.skills.filter(
          (s) => s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q),
        ),
      }))
      .filter((chapter) => chapter.skills.length > 0);
  }, [allChapters, query]);

  const selectedSkill = useMemo(() => {
    if (!selectedId) return null;
    return SKILL_MAP[selectedId] ?? null;
  }, [selectedId]);

  const overallProgress = useMemo(() => {
    const total = ALL_SKILLS.length;
    const completed = completedIds.length;
    return { completed, total, percent: formatPercent(completed, total) };
  }, [completedIds]);

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);

  const requireAuth = useCallback(
    (message: string): boolean => {
      if (currentUser) return true;
      setAuthOpen(true);
      showToast(message);
      return false;
    },
    [currentUser, showToast],
  );

  const handleComplete = useCallback(
    (skillId: string) => {
      if (!requireAuth('Sign in to save your field marks.')) return;
      completeSkill(skillId);
      showToast('Field mark recorded.');
    },
    [completeSkill, requireAuth, showToast],
  );

  const handleFavorite = useCallback(
    (skillId: string) => {
      if (!requireAuth('Sign in to save bookmarks.')) return;
      toggleFavorite(skillId);
      showToast('Bookmark toggled.');
    },
    [toggleFavorite, requireAuth, showToast],
  );

  if (!loaded) {
    return (
      <div
        className="cx-sans fixed inset-0 flex items-center justify-center bg-[var(--cx-paper)] text-[var(--cx-ink2)]"
        style={THEME}
      >
        <p className="cx-display animate-pulse text-sm italic">Opening the field guide…</p>
      </div>
    );
  }

  return (
    <div className="cx-sans fixed inset-0 flex flex-col bg-[var(--cx-paper)] text-[var(--cx-ink)]" style={THEME}>
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-[var(--cx-rule)] bg-[var(--cx-card)] px-4 py-3 lg:px-6">
        <Link
          to="/"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--cx-rule)] text-[var(--cx-ink2)] transition-colors hover:border-[var(--cx-gold)] hover:text-[var(--cx-gold)]"
          aria-label="Back to gallery"
          title="Back to gallery"
        >
          <Home size={18} />
        </Link>
        <div className="flex flex-col">
          <h1 className="cx-display text-lg font-semibold leading-tight text-[var(--cx-ink)]">Life Skill Codex</h1>
          <p className="hidden text-[10px] uppercase tracking-wider text-[var(--cx-ink2)] sm:block">
            {ALL_SKILLS.length} entries · {overallProgress.completed} marked
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cx-ink2)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entries…"
              className="cx-sans h-9 w-48 rounded-md border border-[var(--cx-rule)] bg-[var(--cx-paper)] pl-9 pr-3 text-sm text-[var(--cx-ink)] placeholder:text-[var(--cx-ink2)] outline-none focus:border-[var(--cx-gold)] lg:w-64"
            />
          </div>
          <div className="flex items-center gap-2 rounded-md border border-[var(--cx-rule)] bg-[var(--cx-paper)] px-3 py-1.5">
            <Star size={14} className="text-[var(--cx-gold)]" />
            <span className="cx-mono text-xs font-semibold">{overallProgress.percent}%</span>
          </div>
        </div>
      </header>

      {/* Mobile search */}
      <div className="border-b border-[var(--cx-rule)] bg-[var(--cx-card)] px-4 py-2 sm:hidden">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cx-ink2)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search entries…"
            className="cx-sans h-9 w-full rounded-md border border-[var(--cx-rule)] bg-[var(--cx-paper)] pl-9 pr-3 text-sm text-[var(--cx-ink)] placeholder:text-[var(--cx-ink2)] outline-none focus:border-[var(--cx-gold)]"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Desktop TOC rail */}
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-[var(--cx-rule)] bg-[var(--cx-card)] lg:block">
          <div className="p-4">
            <h2 className="cx-display mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--cx-ink2)]">
              Chapters
            </h2>
            <nav className="space-y-1">
              {allChapters.map((chapter) => {
                const active = activeKey === chapter.key;
                return (
                  <button
                    key={chapter.key}
                    onClick={() => setActiveKey(chapter.key)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      active ? 'bg-[var(--cx-paper)] text-[var(--cx-ink)]' : 'text-[var(--cx-ink2)] hover:bg-[var(--cx-paper)]'
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: chapter.color }}
                    />
                    <span className="cx-sans flex-1 truncate">{chapter.name}</span>
                    <span className="cx-mono text-xs text-[var(--cx-ink2)]">
                      {chapter.completed}/{chapter.total}
                    </span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-6 border-t border-[var(--cx-rule)] pt-4">
              <div className="mb-1 flex justify-between text-xs text-[var(--cx-ink2)]">
                <span>Overall</span>
                <span className="cx-mono">{overallProgress.completed}/{overallProgress.total}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--cx-rule)]">
                <div
                  className="h-full bg-[var(--cx-gold)] transition-all"
                  style={{ width: `${overallProgress.percent}%` }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main chapter spread */}
        <main className="min-h-0 flex-1 overflow-y-auto bg-[var(--cx-paper)]">
          {/* Mobile chapter tabs */}
          <div className="sticky top-0 z-10 border-b border-[var(--cx-rule)] bg-[var(--cx-paper)]/95 px-4 py-2 backdrop-blur lg:hidden">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto">
              {allChapters.map((chapter) => {
                const active = activeKey === chapter.key;
                return (
                  <button
                    key={chapter.key}
                    onClick={() => setActiveKey(chapter.key)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-[var(--cx-ink)] text-[var(--cx-paper)]'
                        : 'border border-[var(--cx-rule)] bg-[var(--cx-card)] text-[var(--cx-ink2)]'
                    }`}
                  >
                    {chapter.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-auto max-w-5xl p-4 lg:p-8">
            {filteredChapters.map((chapter) => (
              <div key={chapter.key} className={activeKey === chapter.key || query ? 'mb-10' : 'hidden lg:block lg:mb-10'}>
                <div className="mb-4 flex items-center justify-between border-b border-[var(--cx-rule)] pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: chapter.color }}
                    />
                    <h2 className="cx-display text-xl font-semibold text-[var(--cx-ink)]">{chapter.name}</h2>
                    <span className="cx-mono text-xs text-[var(--cx-ink2)]">{chapter.skills.length} entries</span>
                  </div>
                  <div className="hidden items-center gap-2 sm:flex">
                    <span className="cx-mono text-xs text-[var(--cx-ink2)]">
                      {chapter.completed}/{chapter.total}
                    </span>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--cx-rule)]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${formatPercent(chapter.completed, chapter.total)}%`, backgroundColor: chapter.color }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {chapter.skills.map((skill) => {
                    const completed = completedIds.includes(skill.id);
                    const favorited = favoriteIds.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        onClick={() => setSelectedId(skill.id)}
                        className="group relative flex flex-col rounded-lg border border-[var(--cx-rule)] bg-[var(--cx-card)] p-4 text-left transition-all hover:border-[var(--cx-gold)] hover:shadow-sm"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <span className="cx-display text-base font-semibold text-[var(--cx-ink)] group-hover:text-[var(--cx-gold)]">
                            {skill.title}
                          </span>
                          <div className="flex shrink-0 gap-1">
                            {completed && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--cx-gold)] text-[var(--cx-paper)]">
                                <Check size={12} />
                              </span>
                            )}
                            {favorited && <Heart size={14} className="fill-[var(--cx-gold)] text-[var(--cx-gold)]" />}
                          </div>
                        </div>
                        <p className="cx-sans mb-3 line-clamp-2 text-sm leading-snug text-[var(--cx-ink2)]">
                          {skill.summary}
                        </p>
                        <div className="mt-auto flex items-center gap-2 text-xs text-[var(--cx-ink2)]">
                          <span className="cx-mono rounded bg-[var(--cx-paper)] px-1.5 py-0.5">{skill.difficulty}</span>
                          <span className="cx-mono">{skill.estimatedMinutes}m</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredChapters.length === 0 && (
              <div className="py-12 text-center text-[var(--cx-ink2)]">
                <p className="cx-display text-lg italic">No entries match your search.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-0 z-40 w-full border-l border-[var(--cx-rule)] bg-[var(--cx-paper)] shadow-2xl lg:left-auto lg:w-[45vw] lg:min-w-[420px] lg:max-w-[640px]"
          >
            <SkillSpecimen
              skill={selectedSkill}
              completed={completedIds.includes(selectedSkill.id)}
              favorited={favoriteIds.includes(selectedSkill.id)}
              onClose={() => setSelectedId(null)}
              onComplete={handleComplete}
              onFavorite={handleFavorite}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        open={authOpen || Boolean(authError)}
        onClose={() => {
          setAuthOpen(false);
          clearAuthError();
        }}
      />

      <Toast
        message={toast.message}
        visible={toast.visible}
        onDone={() => setToast(emptyToast())}
      />
    </div>
  );
}
