import { Link } from 'react-router-dom';
import { Check, ChevronRight, Star, Zap } from 'lucide-react';
import { CATEGORIES, SKILL_MAP } from '@/data/skills';
import type { Skill } from '@/lib/types';
import {
  LAT_BASE,
  LOOSE_PINS,
  NETS,
  REFDES,
  TOTAL_PADS,
  TOTAL_TRACES,
  downstreamOf,
  entryPads,
  liveFrontier,
  netSoldered,
  padState,
} from '../graph';
import type { Net } from '../graph';
import { useLattice } from '../context';
import { NetPreview } from './TraceMap';

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="lt-mono mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--lt-copper)]">
      {children}
    </h2>
  );
}

function StateDot({ skill }: { skill: Skill }) {
  const { completedSet } = useLattice();
  const state = padState(skill, completedSet);
  if (state === 'soldered') {
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--lt-gold)] text-[var(--lt-gold-ink)]">
        <Check className="h-3 w-3" aria-hidden="true" />
      </span>
    );
  }
  if (state === 'live') {
    return (
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--lt-gold)] shadow-[0_0_8px_rgba(240,195,60,0.6)]"
        aria-hidden="true"
      />
    );
  }
  return (
    <span
      className="h-2.5 w-2.5 shrink-0 rounded-full border border-[#4A6B57] bg-transparent"
      aria-hidden="true"
    />
  );
}

function FrontierCard({ skill, powered }: { skill: Skill; powered: boolean }) {
  const feeds = skill.suggestedPrerequisites
    .map((id) => SKILL_MAP[id]?.title)
    .filter(Boolean)
    .join(' + ');
  const drives = downstreamOf(skill).length;
  return (
    <Link
      to={`${LAT_BASE}/skill/${skill.id}`}
      className="flex w-[248px] shrink-0 flex-col gap-2 rounded-lg border border-[var(--lt-copper)] bg-[var(--lt-panel)] p-3.5 transition-colors hover:border-[var(--lt-gold)]"
    >
      <span className="lt-mono flex items-center justify-between text-[9px] uppercase tracking-[0.16em] text-[var(--lt-dim)]">
        {REFDES[skill.id]}
        <Zap
          className="h-3.5 w-3.5 text-[var(--lt-gold)]"
          fill="currentColor"
          aria-hidden="true"
        />
      </span>
      <span className="text-[15px] font-bold leading-snug text-[var(--lt-silk)]">
        {skill.title}
      </span>
      <span className="lt-clamp2 text-[11px] leading-snug text-[var(--lt-dim)]">
        {powered && feeds ? `Powered by ${feeds}` : skill.summary}
      </span>
      <span className="lt-mono mt-auto text-[10px] uppercase tracking-[0.12em] text-[var(--lt-copper)]">
        {skill.difficulty} · {skill.estimatedMinutes} min
        {!powered && drives > 0 ? ` · drives ${drives}` : ''}
      </span>
    </Link>
  );
}

function NetCard({ net }: { net: Net }) {
  const { completedSet } = useLattice();
  const done = netSoldered(net, completedSet);
  const total = net.skillIds.length;
  const names = net.domains.map((d) => CATEGORIES[d].name);
  const domainLine =
    names.length <= 2 ? names.join(' × ') : `${names.slice(0, 2).join(' × ')} +${names.length - 2}`;
  return (
    <Link
      to={`${LAT_BASE}/net/${net.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-[var(--lt-line)] bg-[var(--lt-panel)] transition-colors hover:border-[var(--lt-copper)]"
    >
      <div className="lt-board-grid h-24 border-b border-[var(--lt-line)] bg-[var(--lt-well)] p-2">
        <NetPreview net={net} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="lt-mono flex items-baseline justify-between gap-2 text-[10px] uppercase tracking-[0.14em]">
          <span className="font-bold text-[var(--lt-copper)]">{net.label}</span>
          <span className="text-[var(--lt-dim)]">{total} pads</span>
        </div>
        <div className="lt-mono truncate text-[13px] font-bold text-[var(--lt-silk)]">
          {net.signal}
        </div>
        <div className="truncate text-[11px] text-[var(--lt-dim)]">{domainLine}</div>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--lt-well)]">
            <div
              className="h-full rounded-full bg-[var(--lt-gold)]"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
          <span className="lt-mono text-[10px] text-[var(--lt-gold)]">
            {done}/{total}
          </span>
        </div>
      </div>
    </Link>
  );
}

function PadChip({ skill }: { skill: Skill }) {
  return (
    <Link
      to={`${LAT_BASE}/skill/${skill.id}`}
      className="flex min-h-11 items-center gap-2.5 rounded-md border border-[var(--lt-line)] bg-[var(--lt-panel)] px-3 py-2 transition-colors hover:border-[var(--lt-copper)]"
    >
      <StateDot skill={skill} />
      <span className="min-w-0 flex-1">
        <span className="lt-mono block text-[8px] uppercase tracking-[0.16em] text-[var(--lt-dim)]">
          {REFDES[skill.id]}
        </span>
        <span className="block truncate text-[12.5px] font-semibold text-[var(--lt-silk)]">
          {skill.title}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--lt-dim)]" aria-hidden="true" />
    </Link>
  );
}

export default function BoardHome() {
  const { completedIds, completedSet, favoriteIds } = useLattice();
  const frontier = liveFrontier(completedSet).slice(0, 8);
  const entries = frontier.length === 0 ? entryPads(completedSet).slice(0, 8) : [];
  const pinned = favoriteIds.map((id) => SKILL_MAP[id]).filter(Boolean);
  const pct = Math.round((completedIds.length / TOTAL_PADS) * 100);

  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-20 pt-8 sm:px-6">
      {/* Hero */}
      <section className="mb-10">
        <p className="lt-mono text-[10px] uppercase tracking-[0.26em] text-[var(--lt-copper)]">
          prerequisite circuit · rev. 233
        </p>
        <h1 className="mt-1.5 text-[30px] font-extrabold leading-tight tracking-tight text-[var(--lt-silk)] sm:text-[38px]">
          The board
        </h1>
        <p className="mt-2 max-w-[64ch] text-[14px] leading-relaxed text-[var(--lt-dim)]">
          Every skill is a pad; every prerequisite is a copper trace. Nothing is ever locked —
          solder a joint and the traces leaving it go live, warming up whatever they feed. Walk the
          copper.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="lt-mono text-[11px] uppercase tracking-[0.14em] text-[var(--lt-dim)]">
            {TOTAL_PADS} pads · {TOTAL_TRACES} traces · {NETS.length} nets · {LOOSE_PINS.length}{' '}
            loose pins
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-36 overflow-hidden rounded-full border border-[var(--lt-line)] bg-[var(--lt-well)]">
              <span
                className="block h-full rounded-full bg-[var(--lt-gold)]"
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className="lt-mono text-[11px] font-bold text-[var(--lt-gold)]">
              {pct}% soldered
            </span>
          </span>
        </div>
      </section>

      {/* Frontier / entry pads */}
      <section className="mb-10">
        <Kicker>
          {frontier.length > 0 ? 'Live edges — powered by your soldered work' : 'Entry pads — good first joints'}
        </Kicker>
        {frontier.length === 0 && (
          <p className="mb-3 max-w-[62ch] text-[12.5px] text-[var(--lt-dim)]">
            These root pads have no prerequisites and power the most downstream skills. Solder one
            and watch its traces go live.
          </p>
        )}
        <div className="lt-scroll flex gap-3 overflow-x-auto pb-2">
          {(frontier.length > 0 ? frontier : entries).map((s) => (
            <FrontierCard key={s.id} skill={s} powered={frontier.length > 0} />
          ))}
        </div>
      </section>

      {/* Pinned */}
      {pinned.length > 0 && (
        <section className="mb-10">
          <Kicker>
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
              Pinned pads
            </span>
          </Kicker>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {pinned.map((s) => (
              <PadChip key={s.id} skill={s} />
            ))}
          </div>
        </section>
      )}

      {/* Net directory */}
      <section className="mb-10">
        <Kicker>Nets — {NETS.length} connected circuits</Kicker>
        <p className="mb-4 max-w-[64ch] text-[12.5px] text-[var(--lt-dim)]">
          Each net is a real connected cluster of the prerequisite graph, named after its hub pad.
          Open one to walk its traces.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NETS.map((net) => (
            <NetCard key={net.id} net={net} />
          ))}
        </div>
      </section>

      {/* Loose pins */}
      <section>
        <Kicker>Loose pins — {LOOSE_PINS.length} standalone pads</Kicker>
        <p className="mb-4 max-w-[64ch] text-[12.5px] text-[var(--lt-dim)]">
          These skills have no traces at all — nothing feeds them and they feed nothing. Honest
          singles: pick any one up whenever you like.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {LOOSE_PINS.map((s) => (
            <PadChip key={s.id} skill={s} />
          ))}
        </div>
      </section>

      {/* Footer note */}
      <p className="lt-mono mt-14 border-t border-[var(--lt-line)] pt-5 text-[9px] uppercase tracking-[0.18em] text-[var(--lt-dim)]">
        lattice rev. {TOTAL_PADS} · nets {String(NETS.length).padStart(2, '0')} · no pad is ever
        locked
      </p>
    </div>
  );
}
