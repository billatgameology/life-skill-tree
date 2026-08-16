import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Heart, Home, Leaf, Search, Sun, X } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import AuthModal from '@/components/AuthModal';
import Toast from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { ALL_SKILLS, CATEGORIES, CATEGORY_KEYS, getChildren, SKILL_MAP } from '@/data/skills';
import type { DomainKey, Skill } from '@/lib/types';

/** Garden's scoped palette — soft cream, leaf green, and soil brown. */
const THEME: CSSProperties = {
  '--gd-cream': '#F9F7F2',
  '--gd-paper': '#FFFFFF',
  '--gd-soil': '#6B4E3D',
  '--gd-ink': '#2F3328',
  '--gd-ink2': '#5B5F54',
  '--gd-leaf': '#5A7D3A',
  '--gd-leaf2': '#7A9D5A',
  '--gd-sky': '#7EA4B3',
  '--gd-petal': '#E8A598',
  '--gd-rule': '#E2DDD2',
} as CSSProperties;

type Bed = {
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

function BloomRing({ percent, color, size = 40 }: { percent: number; color: string; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="3" opacity="0.15" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeLinecap="round"
        className="transition-all"
      />
    </svg>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="gd-sans mb-2 text-xs font-bold uppercase tracking-wider text-[var(--gd-leaf)]">{title}</h3>
      <div className="gd-sans text-sm leading-relaxed text-[var(--gd-ink)]">{children}</div>
    </section>
  );
}

function PlantTag({
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
  const color = CATEGORIES[skill.domain].color;

  return (
    <div className="gd-sans relative h-full overflow-y-auto bg-[var(--gd-cream)] p-6 lg:p-10">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--gd-rule)] text-[var(--gd-ink2)] transition-colors hover:border-[var(--gd-leaf)] hover:text-[var(--gd-leaf)]"
        aria-label="Close plant tag"
      >
        <X size={18} />
      </button>

      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--gd-paper)]" style={{ backgroundColor: color }}>
            <Leaf size={16} />
          </span>
          <span className="gd-sans text-xs font-bold uppercase tracking-wider text-[var(--gd-ink2)]">
            {CATEGORIES[skill.domain].name}
          </span>
          <span className="text-[var(--gd-ink2)]">·</span>
          <span className="gd-sans text-xs text-[var(--gd-ink2)]">{skill.difficulty}</span>
          <span className="text-[var(--gd-ink2)]">·</span>
          <span className="gd-sans text-xs text-[var(--gd-ink2)]">{skill.estimatedMinutes} min</span>
        </div>

        <h2 className="gd-sans mb-4 text-3xl font-bold text-[var(--gd-ink)] lg:text-4xl">{skill.title}</h2>

        <p className="mb-6 text-lg leading-relaxed text-[var(--gd-ink2)]">{skill.learnerPromise}</p>

        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => onComplete(skill.id)}
            className={`gd-sans inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-bold transition-colors ${
              completed
                ? 'border-[var(--gd-leaf)] bg-[var(--gd-leaf)] text-[var(--gd-paper)]'
                : 'border-[var(--gd-rule)] bg-[var(--gd-paper)] text-[var(--gd-ink)] hover:border-[var(--gd-leaf)] hover:text-[var(--gd-leaf)]'
            }`}
          >
            <Check size={16} />
            {completed ? 'Bloomed' : 'Mark bloomed'}
          </button>
          <button
            onClick={() => onFavorite(skill.id)}
            className={`gd-sans inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-bold transition-colors ${
              favorited
                ? 'border-[var(--gd-petal)] text-[var(--gd-petal)]'
                : 'border-[var(--gd-rule)] bg-[var(--gd-paper)] text-[var(--gd-ink2)] hover:border-[var(--gd-petal)] hover:text-[var(--gd-petal)]'
            }`}
          >
            <Heart size={16} className={favorited ? 'fill-current' : ''} />
            {favorited ? 'Saved seed' : 'Save seed'}
          </button>
        </div>

        <div className="space-y-6 rounded-2xl border border-[var(--gd-rule)] bg-[var(--gd-paper)] p-5 lg:p-6">
          <Section title="Why it grows">{skill.whyItMatters}</Section>

          <Section title="Where it helps">
            <ul className="list-disc space-y-1 pl-5">
              {skill.realLifeUses.map((use, i) => (
                <li key={i}>{use}</li>
              ))}
            </ul>
          </Section>

          <Section title="What you will cultivate">
            <ul className="list-disc space-y-1 pl-5">
              {skill.youWillLearn.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="Quick check">{skill.miniChallenge}</Section>

          <Section title="Care steps">
            <ol className="list-decimal space-y-2 pl-5">
              {skill.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </Section>

          <Section title="Ready to harvest">
            <ul className="list-disc space-y-1 pl-5">
              {skill.completionCriteria.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </Section>

          {skill.commonProblems && skill.commonProblems.length > 0 && (
            <Section title="Common weeds">
              <ul className="list-disc space-y-1 pl-5">
                {skill.commonProblems.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </Section>
          )}

          {skill.tips && skill.tips.length > 0 && (
            <Section title="Gardener's notes">
              <ul className="list-disc space-y-1 pl-5">
                {skill.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </Section>
          )}

          {prerequisites.length > 0 && (
            <Section title="Needs these to grow">
              <div className="flex flex-wrap gap-2">
                {prerequisites.map((p) => (
                  <span key={p.id} className="rounded-full bg-[var(--gd-cream)] px-3 py-1 text-xs text-[var(--gd-ink2)]">
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
                  <span key={d.id} className="rounded-full bg-[var(--gd-cream)] px-3 py-1 text-xs text-[var(--gd-ink2)]">
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

export default function GardenApp() {
  const { currentUser, authError, clearAuthError } = useAuth();
  const { user, loaded, completeSkill, toggleFavorite } = useUserData();

  const [query, setQuery] = useState('');
  const [activeKey, setActiveKey] = useState<DomainKey>(CATEGORY_KEYS[0]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(emptyToast());

  const completedIds = useMemo(() => user?.completedSkillIds ?? [], [user]);
  const favoriteIds = useMemo(() => user?.favorite ?? [], [user]);

  const allBeds = useMemo<Bed[]>(() => {
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

  const filteredBeds = useMemo(() => {
    if (!query.trim()) return allBeds;
    const q = query.toLowerCase();
    return allBeds
      .map((bed) => ({
        ...bed,
        skills: bed.skills.filter(
          (s) => s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q),
        ),
      }))
      .filter((bed) => bed.skills.length > 0);
  }, [allBeds, query]);

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
      if (!requireAuth('Sign in to save your blooms.')) return;
      completeSkill(skillId);
      showToast('Plant marked as bloomed.');
    },
    [completeSkill, requireAuth, showToast],
  );

  const handleFavorite = useCallback(
    (skillId: string) => {
      if (!requireAuth('Sign in to save seeds.')) return;
      toggleFavorite(skillId);
      showToast('Seed saved.');
    },
    [toggleFavorite, requireAuth, showToast],
  );

  if (!loaded) {
    return (
      <div
        className="gd-sans fixed inset-0 flex items-center justify-center bg-[var(--gd-cream)] text-[var(--gd-ink2)]"
        style={THEME}
      >
        <p className="gd-sans animate-pulse text-sm font-semibold">Preparing the garden…</p>
      </div>
    );
  }

  return (
    <div className="gd-sans fixed inset-0 flex flex-col bg-[var(--gd-cream)] text-[var(--gd-ink)]" style={THEME}>
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-[var(--gd-rule)] bg-[var(--gd-paper)] px-4 py-3 lg:px-6">
        <Link
          to="/"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--gd-rule)] text-[var(--gd-ink2)] transition-colors hover:border-[var(--gd-leaf)] hover:text-[var(--gd-leaf)]"
          aria-label="Back to gallery"
          title="Back to gallery"
        >
          <Home size={18} />
        </Link>
        <div className="flex flex-col">
          <h1 className="gd-sans text-lg font-bold leading-tight text-[var(--gd-ink)]">Life Skill Garden</h1>
          <p className="hidden text-[10px] font-bold uppercase tracking-wider text-[var(--gd-ink2)] sm:block">
            {ALL_SKILLS.length} plants · {overallProgress.completed} bloomed
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gd-ink2)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find plants…"
              className="gd-sans h-9 w-48 rounded-full border border-[var(--gd-rule)] bg-[var(--gd-cream)] pl-9 pr-3 text-sm text-[var(--gd-ink)] placeholder:text-[var(--gd-ink2)] outline-none focus:border-[var(--gd-leaf)] lg:w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <BloomRing percent={overallProgress.percent} color="var(--gd-leaf)" size={36} />
            <span className="gd-sans text-xs font-bold text-[var(--gd-ink2)]">{overallProgress.percent}%</span>
          </div>
        </div>
      </header>

      {/* Mobile search */}
      <div className="border-b border-[var(--gd-rule)] bg-[var(--gd-paper)] px-4 py-2 sm:hidden">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gd-ink2)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find plants…"
            className="gd-sans h-9 w-full rounded-full border border-[var(--gd-rule)] bg-[var(--gd-cream)] pl-9 pr-3 text-sm text-[var(--gd-ink)] placeholder:text-[var(--gd-ink2)] outline-none focus:border-[var(--gd-leaf)]"
          />
        </div>
      </div>

      {/* Mobile bed tabs */}
      <div className="sticky top-0 z-10 border-b border-[var(--gd-rule)] bg-[var(--gd-cream)]/95 px-4 py-2 backdrop-blur lg:hidden">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto">
          {allBeds.map((bed) => {
            const active = activeKey === bed.key;
            return (
              <button
                key={bed.key}
                onClick={() => setActiveKey(bed.key)}
                className={`gd-sans shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  active
                    ? 'bg-[var(--gd-leaf)] text-[var(--gd-paper)]'
                    : 'border border-[var(--gd-rule)] bg-[var(--gd-paper)] text-[var(--gd-ink2)]'
                }`}
              >
                {bed.name}
              </button>
            );
          })}
        </div>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto bg-[var(--gd-cream)]">
        <div className="mx-auto max-w-6xl p-4 lg:p-8">
          {/* Desktop bed rail */}
          <div className="mb-6 hidden flex-wrap gap-2 lg:flex">
            {allBeds.map((bed) => {
              const active = activeKey === bed.key;
              return (
                <button
                  key={bed.key}
                  onClick={() => setActiveKey(bed.key)}
                  className={`gd-sans inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    active
                      ? 'bg-[var(--gd-leaf)] text-[var(--gd-paper)]'
                      : 'border border-[var(--gd-rule)] bg-[var(--gd-paper)] text-[var(--gd-ink)] hover:border-[var(--gd-leaf)]'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: active ? '#fff' : bed.color }} />
                  {bed.name}
                </button>
              );
            })}
          </div>

          {filteredBeds.map((bed) => {
            const isActive = activeKey === bed.key || Boolean(query.trim());
            return (
              <div key={bed.key} className={`${isActive ? 'mb-10' : 'hidden lg:block lg:mb-10'} rounded-2xl border border-[var(--gd-rule)] bg-[var(--gd-paper)] p-4 lg:p-6`}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--gd-paper)]" style={{ backgroundColor: bed.color }}>
                      <Sun size={16} />
                    </span>
                    <h2 className="gd-sans text-xl font-bold text-[var(--gd-ink)]">{bed.name}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <BloomRing percent={formatPercent(bed.completed, bed.total)} color={bed.color} size={32} />
                    <span className="gd-sans text-xs font-bold text-[var(--gd-ink2)]">
                      {bed.completed}/{bed.total}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {bed.skills.map((skill) => {
                    const completed = completedIds.includes(skill.id);
                    const favorited = favoriteIds.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        onClick={() => setSelectedId(skill.id)}
                        className="group relative flex flex-col rounded-xl border border-[var(--gd-rule)] bg-[var(--gd-cream)] p-4 text-left transition-all hover:border-[var(--gd-leaf)] hover:shadow-sm"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <span className="gd-sans text-base font-bold text-[var(--gd-ink)] group-hover:text-[var(--gd-leaf)]">
                            {skill.title}
                          </span>
                          <div className="flex shrink-0 gap-1">
                            {completed && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gd-leaf)] text-[var(--gd-paper)]">
                                <Check size={12} />
                              </span>
                            )}
                            {favorited && <Heart size={14} className="fill-[var(--gd-petal)] text-[var(--gd-petal)]" />}
                          </div>
                        </div>
                        <p className="gd-sans mb-3 line-clamp-2 text-sm leading-snug text-[var(--gd-ink2)]">
                          {skill.summary}
                        </p>
                        <div className="mt-auto flex items-center gap-2 text-xs text-[var(--gd-ink2)]">
                          <span className="rounded-full bg-[var(--gd-paper)] px-2 py-0.5">{skill.difficulty}</span>
                          <span>{skill.estimatedMinutes}m</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredBeds.length === 0 && (
            <div className="py-12 text-center text-[var(--gd-ink2)]">
              <p className="gd-sans text-lg font-bold">No plants match your search.</p>
            </div>
          )}
        </div>
      </main>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-0 z-40 w-full border-l border-[var(--gd-rule)] bg-[var(--gd-cream)] shadow-2xl lg:left-auto lg:w-[45vw] lg:min-w-[420px] lg:max-w-[640px]"
          >
            <PlantTag
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
