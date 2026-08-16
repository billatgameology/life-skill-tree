import { Link, Navigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import type { DomainKey, Skill } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useManila } from '../context';
import { CARDS, DRAWER_MAP, MA_BASE, filedCount, tiersOf, type DrawerDef } from '../derive';
import { FiledMark, Paperclip, PencilBar } from './bits';
import { paperGrain, woodFace } from '../surfaces';
import SkillCard from './SkillCard';

/**
 * A riffled card edge. Cards overlap so only the top ~48px shows; hover/focus
 * raises the card above its neighbors, revealing the summary line beneath.
 * The whole 48px edge is the tap target on touch devices.
 */
function CardEdgeRow({ skill, isOpen }: { skill: Skill; isOpen: boolean }) {
  const { completedIds, favoriteIds } = useManila();
  const info = CARDS[skill.id];
  const filed = completedIds.includes(skill.id);
  const clipped = favoriteIds.includes(skill.id);

  return (
    <Link
      to={`${MA_BASE}/drawer/${info.drawer.domain}/card/${skill.id}`}
      className={`relative -mb-[26px] block h-[74px] rounded-t-sm border border-black/25 bg-[var(--ma-card)] px-3 pt-1.5 shadow-[0_-1px_4px_rgba(0,0,0,0.18)] outline-none transition-transform duration-100 last:mb-0 hover:z-40 hover:-translate-y-1 hover:shadow-[0_4px_14px_rgba(0,0,0,0.45)] focus-visible:z-40 focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[var(--ma-brass)] ${
        isOpen ? 'ring-2 ring-[var(--ma-brass)]' : ''
      }`}
      style={{ ...paperGrain(), borderLeft: `4px solid ${info.drawer.tint}` }}
      aria-current={isOpen ? 'true' : undefined}
    >
      <span className="flex h-[38px] items-center gap-2">
        <span className="ma-type w-11 shrink-0 text-[9.5px] uppercase tracking-wider text-[var(--ma-graphite)]">
          {info.callNumber}
        </span>
        <span
          className={`ma-type min-w-0 flex-1 truncate text-[13px] font-bold leading-tight ${
            filed ? 'text-[var(--ma-graphite)]' : 'text-[var(--ma-ink)]'
          }`}
        >
          {skill.title}
        </span>
        {clipped && <Paperclip size={13} />}
        {filed && <FiledMark />}
        <span className="ma-type shrink-0 text-[9.5px] uppercase text-[var(--ma-graphite)]">
          {skill.estimatedMinutes}m · {skill.difficulty}
        </span>
      </span>
      <span className="ma-body block truncate text-[11px] leading-snug text-[var(--ma-graphite)]">
        {skill.summary}
      </span>
    </Link>
  );
}

/** Sticky manila tier divider with an offset tab, like a physical divider set. */
function TierDivider({
  label,
  filed,
  total,
  position,
}: {
  label: string;
  filed: number;
  total: number;
  position: number;
}) {
  return (
    <div className="sticky top-0 z-[45] -mx-1 px-1 pt-2" style={{ backgroundColor: 'var(--ma-walnut)' }}>
      <div
        className="w-[40%] min-w-[180px] max-w-full rounded-t-md border border-b-0 border-black/25 bg-[var(--ma-manila)] px-3 py-1"
        style={{
          ...paperGrain(),
          // Offset tab like a physical divider set, but clamped so it never
          // escapes a narrow column (phones, two-pane tablets).
          marginLeft: `max(0px, min(${(position % 3) * 30}%, calc(100% - 180px)))`,
        }}
      >
        <p className="ma-type truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ma-ink)]">
          {label}
        </p>
      </div>
      <div
        className="rounded-b-sm border border-black/25 bg-[var(--ma-manila)] px-3 py-0.5"
        style={paperGrain()}
      >
        <p className="ma-type text-[9px] uppercase tracking-wider text-[var(--ma-graphite)]">
          {filed} of {total} filed
        </p>
      </div>
    </div>
  );
}

/** One drawer: header, riffled tiers, and (desktop) the blotter panel. */
export default function DrawerPage() {
  const { domain, skillId } = useParams();
  const { completedIds } = useManila();
  const isMobile = useIsMobile();

  const drawer: DrawerDef | undefined = domain ? DRAWER_MAP[domain as DomainKey] : undefined;
  if (!drawer) return <Navigate to={MA_BASE} replace />;
  const openCard = skillId ? CARDS[skillId] : undefined;
  if (skillId && (!openCard || openCard.drawer.domain !== drawer.domain)) {
    return <Navigate to={`${MA_BASE}/drawer/${drawer.domain}`} replace />;
  }

  const tiers = tiersOf(drawer);
  const filed = filedCount(drawer, completedIds);
  const done = new Set(completedIds);

  const riffle = (
    <div>
      {tiers.map((tier, ti) => (
        <section key={tier.level} className="pb-8">
          <TierDivider
            label={tier.label}
            filed={tier.cards.reduce((n, c) => n + (done.has(c.id) ? 1 : 0), 0)}
            total={tier.cards.length}
            position={ti}
          />
          <div className="mt-2">
            {tier.cards.map((skill) => (
              <CardEdgeRow key={skill.id} skill={skill} isOpen={openCard?.skill.id === skill.id} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1080px] px-4 pb-10 sm:px-6">
      {/* Mobile: an open card takes the whole screen (the riffle stays behind Back).
          Rendered exclusively — never as a second hidden SkillCard instance. */}
      {openCard && isMobile && (
        <div className="pt-4">
          <SkillCard info={openCard} />
        </div>
      )}

      <div className={openCard && isMobile ? 'hidden' : ''}>
        {/* Drawer header */}
        <div
          className="mt-5 rounded-md border border-black/45 p-3 shadow-[0_3px_8px_rgba(0,0,0,0.35)]"
          style={woodFace(true)}
        >
          <div className="flex items-center gap-3">
            <Link
              to={MA_BASE}
              className="ma-chrome flex shrink-0 items-center gap-1 rounded px-2 py-1.5 text-[12px] font-semibold text-[var(--ma-manila)]/75 hover:bg-black/25 hover:text-[var(--ma-manila)]"
            >
              <ChevronLeft size={14} /> Cabinet
            </Link>
            <div
              className="min-w-0 flex-1 rounded-sm border-2 border-[var(--ma-brass)]/80 bg-[var(--ma-card)] px-3 py-1.5"
              style={paperGrain()}
            >
              <p className="ma-type text-[8.5px] uppercase tracking-[0.16em] text-[var(--ma-graphite)]">
                Drawer {drawer.num} · {drawer.cards.length} cards
              </p>
              <p
                className="ma-type truncate text-[15px] font-bold uppercase tracking-wide"
                style={{ color: drawer.tint }}
              >
                {drawer.name}
              </p>
            </div>
            <div className="hidden w-40 shrink-0 sm:block">
              <p className="ma-type mb-1 text-right text-[10px] uppercase tracking-wider text-[var(--ma-manila)]/80">
                {filed}/{drawer.cards.length} filed
              </p>
              <PencilBar done={filed} total={drawer.cards.length} tint="var(--ma-brass)" />
            </div>
          </div>
        </div>

        {/* Riffle + blotter */}
        <div className="mt-5 flex items-start gap-6">
          <div className="min-w-0 flex-1 md:max-w-[600px]">{riffle}</div>

          {/* Desktop blotter panel */}
          <div className="sticky top-4 hidden w-[440px] shrink-0 md:block">
            {openCard && !isMobile ? (
              // Keyed so swapping cards starts the new card scrolled to the top.
              <div key={openCard.skill.id} className="max-h-[calc(100vh-140px)] overflow-y-auto rounded-sm pr-1">
                <SkillCard info={openCard} />
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-md border border-black/40 bg-black/20 text-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)]">
                <p className="ma-type text-[12px] uppercase tracking-[0.16em] text-[var(--ma-manila)]/60">
                  The blotter is clear
                </p>
                <p className="ma-body mt-1 max-w-[240px] text-[12px] text-[var(--ma-manila)]/45">
                  Pull a card from the drawer to read it here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
