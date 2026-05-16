import { useMemo } from 'react';
import { Settings, Award, LogIn, Flame, Heart, Trophy, Zap, ChevronRight } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserData } from '@/lib/types';
import { CATEGORIES, CATEGORY_KEYS, ALL_SKILLS } from '@/data/skills';

const LEVELS = [
  { level: 1, min: 0, max: 30, title: 'Seedling' },
  { level: 2, min: 30, max: 75, title: 'Sprout' },
  { level: 3, min: 75, max: 135, title: 'Explorer' },
  { level: 4, min: 135, max: 210, title: 'Adventurer' },
  { level: 5, min: 210, max: 300, title: 'Champion' },
  { level: 6, min: 300, max: 999, title: 'Master' },
];

function getLevelInfo(xp: number) {
  return LEVELS.find((l) => xp >= l.min && xp < l.max) || LEVELS[LEVELS.length - 1];
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg width="76" height="76" viewBox="0 0 76 76">
      <circle cx="38" cy="38" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
      <circle
        cx="38"
        cy="38"
        r={r}
        stroke="rgb(var(--accent-rgb))"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
        transform="rotate(-90 38 38)"
        style={{ transition: 'stroke-dasharray 320ms ease' }}
      />
      <text x="38" y="43" textAnchor="middle" fontSize="16" fontWeight="800" fill="#C8C6D2">
        {pct}%
      </text>
    </svg>
  );
}

interface ProfileScreenProps {
  user: UserData | null;
  currentUser: FirebaseUser | null;
  completedIds: string[];
  favoriteIds: string[];
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenSettings: () => void;
  onOpenBadges: () => void;
}

export default function ProfileScreen({
  user,
  currentUser,
  completedIds,
  favoriteIds,
  onSignIn,
  onSignOut,
  onOpenSettings,
  onOpenBadges,
}: ProfileScreenProps) {
  const totalSkills = ALL_SKILLS.length;
  const done = completedIds.length;
  const pct = totalSkills ? Math.round((done / totalSkills) * 100) : 0;
  const level = getLevelInfo(user?.xp ?? 0);

  const categoryStats = useMemo(
    () =>
      CATEGORY_KEYS.map((cat) => {
        const catSkills = ALL_SKILLS.filter((s) => s.domain === cat);
        const completed = catSkills.filter((s) => completedIds.includes(s.id)).length;
        return { cat, data: CATEGORIES[cat], completed, total: catSkills.length };
      }),
    [completedIds]
  );

  if (!currentUser || !user) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 pb-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface-raised">
          <LogIn size={24} className="text-ink-dim" />
        </div>
        <h2 className="font-display text-lg text-ink">Sign in to save progress</h2>
        <p className="mt-1.5 max-w-[280px] text-xs leading-relaxed text-ink-muted">
          Sync your skills, paths, and favorites across devices. Your learning travels with you.
        </p>
        <button
          onClick={onSignIn}
          className="mt-5 w-full max-w-[280px] rounded-xl bg-glow-gold py-3 font-heading text-sm font-bold text-void transition-all hover:brightness-110"
        >
          Sign in or create account
        </button>
        <button
          onClick={onOpenSettings}
          className="mt-3 text-[11px] font-heading font-semibold text-glow-gold"
        >
          Adjust app settings →
        </button>
      </div>
    );
  }

  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'You';
  const initials = displayName
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const stats = [
    { label: 'Skills learned', value: done, sub: `of ${totalSkills}`, Icon: Trophy, color: '#5B9B6B' },
    { label: 'Favorites', value: favoriteIds.length, sub: 'saved', Icon: Heart, color: '#E8628C' },
    { label: 'Day streak', value: user.currentStreak, sub: 'days', Icon: Flame, color: '#E89066' },
    { label: 'Total XP', value: user.xp, sub: `Lv ${level.level} · ${level.title}`, Icon: Zap, color: '#D4AF37' },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="detail-scrollbar flex-1 overflow-y-auto px-4 pb-28 pt-4">
        {/* Identity */}
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full font-heading text-lg font-bold text-void"
            style={{ background: 'linear-gradient(135deg, rgb(var(--accent-rgb)), var(--accent-2))' }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg text-ink">{displayName}</p>
            <p className="truncate text-xs text-ink-muted">{currentUser.email}</p>
          </div>
          <button
            onClick={onOpenSettings}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised/70 text-ink-dim transition-colors hover:text-ink"
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Progress card */}
        <div
          className="mt-4 flex items-center justify-between rounded-2xl border p-4"
          style={{
            background: 'linear-gradient(180deg, rgb(var(--accent-rgb) / 0.12) 0%, rgba(255,255,255,0.02) 100%)',
            borderColor: 'rgb(var(--accent-rgb) / 0.4)',
          }}
        >
          <div>
            <p className="text-[10px] font-heading font-bold uppercase tracking-wider text-glow-gold">Overall</p>
            <p className="mt-1 font-display text-2xl text-ink">
              {done}
              <span className="text-base text-ink-muted"> / {totalSkills}</span>
            </p>
            <p className="text-xs text-ink-muted">skills learned</p>
          </div>
          <ProgressRing pct={pct} />
        </div>

        {/* Stat grid */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-surface-raised/40 p-3">
              <div className="flex items-center gap-1.5">
                <s.Icon size={12} style={{ color: s.color }} />
                <span className="text-[10px] font-heading font-bold uppercase tracking-wide" style={{ color: s.color }}>
                  {s.label}
                </span>
              </div>
              <p className="mt-1 font-display text-xl text-ink">{s.value}</p>
              <p className="truncate text-[11px] text-ink-muted">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Category mastery */}
        <div className="mt-3 rounded-xl border border-border bg-surface-raised/40 p-3.5">
          <p className="mb-2.5 text-[10px] font-heading font-bold uppercase tracking-wider text-ink-dim">
            Category mastery
          </p>
          <div className="space-y-2">
            {categoryStats.map(({ cat, data, completed, total }) => (
              <div key={cat} className="flex items-center gap-2.5">
                <span
                  className="w-24 flex-shrink-0 truncate text-[10px] font-heading font-bold uppercase"
                  style={{ color: data.color }}
                >
                  {data.name}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-raised">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${total ? (completed / total) * 100 : 0}%`, backgroundColor: data.color }}
                  />
                </div>
                <span className="w-9 flex-shrink-0 text-right text-[10px] text-ink-dim">
                  {completed}/{total}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges + Settings entries */}
        <button
          onClick={onOpenBadges}
          className="mt-3 flex w-full items-center gap-3 rounded-xl border border-border bg-surface-raised/40 px-4 py-3.5 text-left transition-colors hover:bg-surface-raised/70"
        >
          <Award size={16} className="text-glow-gold" />
          <span className="flex-1 text-sm font-heading font-semibold text-ink">Badges</span>
          <span className="text-[11px] text-ink-dim">{user.badges.length} earned</span>
          <ChevronRight size={14} className="text-ink-dim" />
        </button>

        <button
          onClick={onOpenSettings}
          className="mt-2 flex w-full items-center gap-3 rounded-xl border border-border bg-surface-raised/40 px-4 py-3.5 text-left transition-colors hover:bg-surface-raised/70"
        >
          <Settings size={16} className="text-glow-gold" />
          <span className="flex-1 text-sm font-heading font-semibold text-ink">Settings</span>
          <ChevronRight size={14} className="text-ink-dim" />
        </button>

        <button
          onClick={onSignOut}
          className="mt-3 w-full rounded-xl border border-destructive/40 bg-destructive/10 py-3 font-heading text-sm font-bold text-destructive transition-colors hover:bg-destructive/20"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
