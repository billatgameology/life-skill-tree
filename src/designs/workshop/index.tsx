import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Heart, Home, Search, Settings, Wrench, X } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import AuthModal from '@/components/AuthModal';
import Toast from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { ALL_SKILLS, CATEGORIES, CATEGORY_KEYS, getChildren, SKILL_MAP } from '@/data/skills';
import type { DomainKey, Skill } from '@/lib/types';

/** Workshop's scoped palette — pegboard gray, tool-steel, and safety yellow. */
const THEME: CSSProperties = {
  '--ws-board': '#E8E6E1',
  '--ws-steel': '#2C2E33',
  '--ws-ink': '#1A1C20',
  '--ws-ink2': '#5E6169',
  '--ws-yellow': '#F4B400',
  '--ws-yellow2': '#FFD04D',
  '--ws-card': '#F5F4F1',
  '--ws-rule': '#C9C6BE',
  '--ws-wood': '#A67C52',
} as CSSProperties;

type Section = {
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
      <h3 className="ws-display mb-2 text-xs font-bold uppercase tracking-wider text-[var(--ws-yellow)]">{title}</h3>
      <div className="ws-sans text-sm leading-relaxed text-[var(--ws-ink)]">{children}</div>
    </section>
  );
}

function ToolSheet({
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
    <div className="ws-sans relative h-full overflow-y-auto bg-[var(--ws-card)] p-6 lg:p-10">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md border border-[var(--ws-rule)] bg-[var(--ws-board)] text-[var(--ws-ink2)] transition-colors hover:border-[var(--ws-yellow)] hover:text-[var(--ws-ink)]"
        aria-label="Close spec sheet"
      >
        <X size={18} />
      </button>

      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--ws-steel)] text-[var(--ws-yellow)]">
            <Settings size={16} />
          </span>
          <span className="ws-mono text-xs font-bold uppercase tracking-wider text-[var(--ws-ink2)]">
            {CATEGORIES[skill.domain].name}
          </span>
          <span className="text-[var(--ws-ink2)]">·</span>
          <span className="ws-mono text-xs text-[var(--ws-ink2)]">{skill.difficulty}</span>
          <span className="text-[var(--ws-ink2)]">·</span>
          <span className="ws-mono text-xs text-[var(--ws-ink2)]">{skill.estimatedMinutes} min</span>
        </div>

        <h2 className="ws-display mb-4 text-3xl font-bold text-[var(--ws-ink)] lg:text-4xl">{skill.title}</h2>

        <p className="mb-6 text-lg leading-relaxed text-[var(--ws-ink2)]">{skill.learnerPromise}</p>

        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => onComplete(skill.id)}
            className={`ws-sans inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-bold transition-colors ${
              completed
                ? 'border-[var(--ws-yellow)] bg-[var(--ws-yellow)] text-[var(--ws-ink)]'
                : 'border-[var(--ws-rule)] bg-[var(--ws-board)] text-[var(--ws-ink)] hover:border-[var(--ws-yellow)] hover:text-[var(--ws-yellow)]'
            }`}
          >
            <Check size={16} />
            {completed ? 'Checked out' : 'Check out'}
          </button>
          <button
            onClick={() => onFavorite(skill.id)}
            className={`ws-sans inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-bold transition-colors ${
              favorited
                ? 'border-[var(--ws-steel)] bg-[var(--ws-steel)] text-[var(--ws-yellow)]'
                : 'border-[var(--ws-rule)] bg-[var(--ws-board)] text-[var(--ws-ink2)] hover:border-[var(--ws-steel)] hover:text-[var(--ws-ink)]'
            }`}
          >
            <Heart size={16} className={favorited ? 'fill-current' : ''} />
            {favorited ? 'On bench' : 'Keep on bench'}
          </button>
        </div>

        <div className="space-y-6 rounded-lg border border-[var(--ws-rule)] bg-[var(--ws-board)] p-5 lg:p-6">
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

          <Section title="Shop challenge">{skill.miniChallenge}</Section>

          <Section title="Steps">
            <ol className="list-decimal space-y-2 pl-5">
              {skill.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </Section>

          <Section title="Pass criteria">
            <ul className="list-disc space-y-1 pl-5">
              {skill.completionCriteria.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </Section>

          {skill.commonProblems && skill.commonProblems.length > 0 && (
            <Section title="Common snags">
              <ul className="list-disc space-y-1 pl-5">
                {skill.commonProblems.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </Section>
          )}

          {skill.tips && skill.tips.length > 0 && (
            <Section title="Pro tips">
              <ul className="list-disc space-y-1 pl-5">
                {skill.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </Section>
          )}

          {prerequisites.length > 0 && (
            <Section title="Required tools">
              <div className="flex flex-wrap gap-2">
                {prerequisites.map((p) => (
                  <span key={p.id} className="rounded-md bg-[var(--ws-card)] px-2 py-1 text-xs text-[var(--ws-ink2)]">
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
                  <span key={d.id} className="rounded-md bg-[var(--ws-card)] px-2 py-1 text-xs text-[var(--ws-ink2)]">
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

export default function WorkshopApp() {
  const { currentUser, authError, clearAuthError } = useAuth();
  const { user, loaded, completeSkill, toggleFavorite } = useUserData();

  const [query, setQuery] = useState('');
  const [activeKey, setActiveKey] = useState<DomainKey>(CATEGORY_KEYS[0]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(emptyToast());

  const completedIds = useMemo(() => user?.completedSkillIds ?? [], [user]);
  const favoriteIds = useMemo(() => user?.favorite ?? [], [user]);

  const allSections = useMemo<Section[]>(() => {
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

  const filteredSections = useMemo(() => {
    if (!query.trim()) return allSections;
    const q = query.toLowerCase();
    return allSections
      .map((section) => ({
        ...section,
        skills: section.skills.filter(
          (s) => s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q),
        ),
      }))
      .filter((section) => section.skills.length > 0);
  }, [allSections, query]);

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
      if (!requireAuth('Sign in to check out tools.')) return;
      completeSkill(skillId);
      showToast('Tool checked out.');
    },
    [completeSkill, requireAuth, showToast],
  );

  const handleFavorite = useCallback(
    (skillId: string) => {
      if (!requireAuth('Sign in to keep tools on the bench.')) return;
      toggleFavorite(skillId);
      showToast('Tool kept on bench.');
    },
    [toggleFavorite, requireAuth, showToast],
  );

  if (!loaded) {
    return (
      <div
        className="ws-sans fixed inset-0 flex items-center justify-center bg-[var(--ws-board)] text-[var(--ws-ink2)]"
        style={THEME}
      >
        <p className="ws-display animate-pulse text-sm font-bold">Loading the workshop…</p>
      </div>
    );
  }

  return (
    <div className="ws-sans fixed inset-0 flex flex-col bg-[var(--ws-board)] text-[var(--ws-ink)]" style={THEME}>
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-[var(--ws-rule)] bg-[var(--ws-steel)] px-4 py-3 text-[var(--ws-card)] lg:px-6">
        <Link
          to="/"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--ws-ink2)] text-[var(--ws-card)] transition-colors hover:border-[var(--ws-yellow)] hover:text-[var(--ws-yellow)]"
          aria-label="Back to gallery"
          title="Back to gallery"
        >
          <Home size={18} />
        </Link>
        <div className="flex flex-col">
          <h1 className="ws-display text-lg font-bold leading-tight text-[var(--ws-card)]">Life Skill Workshop</h1>
          <p className="hidden text-[10px] font-bold uppercase tracking-wider text-[var(--ws-ink2)] sm:block">
            {ALL_SKILLS.length} tools · {overallProgress.completed} checked out
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ws-ink2)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find tools…"
              className="ws-sans h-9 w-48 rounded-md border border-[var(--ws-ink2)] bg-[var(--ws-ink)] pl-9 pr-3 text-sm text-[var(--ws-card)] placeholder:text-[var(--ws-ink2)] outline-none focus:border-[var(--ws-yellow)] lg:w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-[var(--ws-yellow)]" />
            <div className="h-2 w-20 overflow-hidden rounded-full bg-[var(--ws-ink)]">
              <div
                className="h-full bg-[var(--ws-yellow)] transition-all"
                style={{ width: `${overallProgress.percent}%` }}
              />
            </div>
            <span className="ws-mono text-xs font-bold">{overallProgress.percent}%</span>
          </div>
        </div>
      </header>

      {/* Mobile search */}
      <div className="border-b border-[var(--ws-rule)] bg-[var(--ws-steel)] px-4 py-2 sm:hidden">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ws-ink2)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find tools…"
            className="ws-sans h-9 w-full rounded-md border border-[var(--ws-ink2)] bg-[var(--ws-ink)] pl-9 pr-3 text-sm text-[var(--ws-card)] placeholder:text-[var(--ws-ink2)] outline-none focus:border-[var(--ws-yellow)]"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Desktop section rail */}
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-[var(--ws-rule)] bg-[var(--ws-card)] lg:block">
          <div className="p-4">
            <h2 className="ws-display mb-3 text-xs font-bold uppercase tracking-wider text-[var(--ws-ink2)]">
              Sections
            </h2>
            <nav className="space-y-1">
              {allSections.map((section) => {
                const active = activeKey === section.key;
                return (
                  <button
                    key={section.key}
                    onClick={() => setActiveKey(section.key)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      active ? 'bg-[var(--ws-board)] text-[var(--ws-ink)]' : 'text-[var(--ws-ink2)] hover:bg-[var(--ws-board)]'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: section.color }} />
                    <span className="ws-sans flex-1 truncate">{section.name}</span>
                    <span className="ws-mono text-xs text-[var(--ws-ink2)]">
                      {section.completed}/{section.total}
                    </span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-6 border-t border-[var(--ws-rule)] pt-4">
              <div className="mb-1 flex justify-between text-xs text-[var(--ws-ink2)]">
                <span>Overall</span>
                <span className="ws-mono">{overallProgress.completed}/{overallProgress.total}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--ws-board)]">
                <div
                  className="h-full bg-[var(--ws-yellow)] transition-all"
                  style={{ width: `${overallProgress.percent}%` }}
                />
              </div>
            </div>
          </div>
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto bg-[var(--ws-board)]">
          {/* Mobile section tabs */}
          <div className="sticky top-0 z-10 border-b border-[var(--ws-rule)] bg-[var(--ws-board)]/95 px-4 py-2 backdrop-blur lg:hidden">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto">
              {allSections.map((section) => {
                const active = activeKey === section.key;
                return (
                  <button
                    key={section.key}
                    onClick={() => setActiveKey(section.key)}
                    className={`ws-sans shrink-0 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                      active
                        ? 'bg-[var(--ws-steel)] text-[var(--ws-yellow)]'
                        : 'border border-[var(--ws-rule)] bg-[var(--ws-card)] text-[var(--ws-ink)]'
                    }`}
                  >
                    {section.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-auto max-w-6xl p-4 lg:p-8">
            {filteredSections.map((section) => {
              const isActive = activeKey === section.key || Boolean(query.trim());
              return (
                <div key={section.key} className={isActive ? 'mb-8' : 'hidden lg:block lg:mb-8'}>
                  <div className="mb-3 flex items-center justify-between border-b-2 border-[var(--ws-rule)] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: section.color }} />
                      <h2 className="ws-display text-xl font-bold text-[var(--ws-ink)]">{section.name}</h2>
                      <span className="ws-mono text-xs text-[var(--ws-ink2)]">{section.skills.length} tools</span>
                    </div>
                    <div className="hidden items-center gap-2 sm:flex">
                      <span className="ws-mono text-xs text-[var(--ws-ink2)]">
                        {section.completed}/{section.total}
                      </span>
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-[var(--ws-rule)]">
                        <div
                          className="h-full rounded-full bg-[var(--ws-yellow)] transition-all"
                          style={{ width: `${formatPercent(section.completed, section.total)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {section.skills.map((skill) => {
                      const completed = completedIds.includes(skill.id);
                      const favorited = favoriteIds.includes(skill.id);
                      return (
                        <button
                          key={skill.id}
                          onClick={() => setSelectedId(skill.id)}
                          className="group relative flex flex-col rounded-md border border-[var(--ws-rule)] bg-[var(--ws-card)] p-4 text-left shadow-sm transition-all hover:border-[var(--ws-yellow)] hover:shadow-md"
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <span className="ws-display text-base font-bold text-[var(--ws-ink)] group-hover:text-[var(--ws-steel)]">
                              {skill.title}
                            </span>
                            <div className="flex shrink-0 gap-1">
                              {completed && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[var(--ws-yellow)] text-[var(--ws-ink)]">
                                  <Check size={12} />
                                </span>
                              )}
                              {favorited && <Heart size={14} className="fill-[var(--ws-steel)] text-[var(--ws-steel)]" />}
                            </div>
                          </div>
                          <p className="ws-sans mb-3 line-clamp-2 text-sm leading-snug text-[var(--ws-ink2)]">
                            {skill.summary}
                          </p>
                          <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--ws-rule)] pt-2 text-xs text-[var(--ws-ink2)]">
                            <span className="ws-mono rounded bg-[var(--ws-board)] px-1.5 py-0.5">{skill.difficulty}</span>
                            <span className="ws-mono">{skill.estimatedMinutes}m</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredSections.length === 0 && (
              <div className="py-12 text-center text-[var(--ws-ink2)]">
                <p className="ws-display text-lg font-bold">No tools match your search.</p>
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
            className="fixed inset-0 z-40 w-full border-l border-[var(--ws-rule)] bg-[var(--ws-card)] shadow-2xl lg:left-auto lg:w-[45vw] lg:min-w-[420px] lg:max-w-[640px]"
          >
            <ToolSheet
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
