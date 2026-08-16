import { Link } from 'react-router-dom';
import { useManila } from '../context';
import {
  DOSSIERS,
  DRAWERS,
  MA_BASE,
  dossierProgress,
  filedCount,
  pulledForYou,
} from '../derive';
import { FiledMark, PencilBar } from './bits';
import { paperGrain, woodFace } from '../surfaces';

/** One wooden drawer front with a brass label frame. */
function DrawerFront({ domain }: { domain: (typeof DRAWERS)[number] }) {
  const { completedIds } = useManila();
  const filed = filedCount(domain, completedIds);

  return (
    <Link
      to={`${MA_BASE}/drawer/${domain.domain}`}
      className="group relative block rounded-md border border-black/45 p-2.5 shadow-[0_3px_6px_rgba(0,0,0,0.35)] transition-transform duration-150 hover:-translate-y-0.5 sm:p-3"
      style={woodFace(true)}
    >
      {/* Brass label frame holding a typed label card */}
      <div className="rounded-sm border-2 border-[var(--ma-brass)]/80 bg-[var(--ma-brass)]/20 p-[3px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
        <div className="rounded-[2px] bg-[var(--ma-card)] px-2.5 py-2" style={paperGrain()}>
          <p className="ma-type flex items-baseline justify-between gap-2 text-[8.5px] uppercase tracking-[0.14em] text-[var(--ma-graphite)]">
            <span>Drawer {domain.num}</span>
            <span>{domain.cards.length} cards</span>
          </p>
          <p
            className="ma-type mt-0.5 truncate text-[13px] font-bold uppercase leading-tight tracking-wide"
            style={{ color: domain.tint }}
          >
            {domain.name}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1">
              <PencilBar done={filed} total={domain.cards.length} />
            </div>
            <span className="ma-type text-[9px] text-[var(--ma-graphite)]">
              {filed}/{domain.cards.length} filed
            </span>
          </div>
        </div>
      </div>
      {/* Brass drawer pull */}
      <div className="mx-auto mt-2 h-[7px] w-12 rounded-full border border-black/40 bg-gradient-to-b from-[#D9B77A] to-[#A9834A] shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
    </Link>
  );
}

/** The cabinet home: Pulled-for-you tray, 15 drawers, dossier tray. */
export default function CabinetPage() {
  const { completedIds } = useManila();
  const pulled = pulledForYou(completedIds, 6);

  return (
    <div className="mx-auto max-w-[920px] px-4 pb-10 pt-6 sm:px-6">
      <div className="mb-5">
        <h1 className="ma-chrome text-xl font-bold text-[var(--ma-manila)]">The Cabinet</h1>
        <p className="ma-body mt-0.5 text-[13px] text-[var(--ma-manila)]/70">
          233 skills, typed on index cards and filed in 15 drawers. Pull a card, work
          through it, stamp it done.
        </p>
      </div>

      {/* Pulled for you — the prerequisite DAG as a no-lock recommendation tray */}
      {pulled.length > 0 && (
        <section className="mb-7">
          <h2 className="ma-type mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ma-brass)]">
            Pulled for you <span className="font-normal text-[var(--ma-manila)]/60">— good next cards, nothing is locked</span>
          </h2>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
            {pulled.map(({ skill, drawer, callNumber }) => (
              <Link
                key={skill.id}
                to={`${MA_BASE}/drawer/${drawer.domain}/card/${skill.id}`}
                className="w-[200px] shrink-0 rounded-sm border border-black/30 bg-[var(--ma-card)] p-3 shadow-[0_2px_5px_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-0.5"
                style={{ ...paperGrain(), borderTop: `3px solid ${drawer.tint}` }}
              >
                <p className="ma-type text-[9px] uppercase tracking-wider text-[var(--ma-graphite)]">
                  {callNumber} · {skill.estimatedMinutes} min · {skill.difficulty}
                </p>
                <p className="ma-type mt-1 text-[13px] font-bold leading-snug text-[var(--ma-ink)]">
                  {skill.title}
                </p>
                <p className="ma-body mt-1 line-clamp-2 text-[11.5px] leading-snug text-[var(--ma-graphite)]">
                  {skill.summary}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* The 15 drawers */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DRAWERS.map((d) => (
          <DrawerFront key={d.domain} domain={d} />
        ))}
      </div>

      {/* Pending tray: dossier folders */}
      <section className="mt-8">
        <h2 className="ma-type mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ma-brass)]">
          Pending tray <span className="font-normal text-[var(--ma-manila)]/60">— dossiers: guided sets of cards</span>
        </h2>
        <div
          className="rounded-md border border-black/45 p-3 shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)]"
          style={woodFace()}
        >
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            {DOSSIERS.map((path) => {
              const done = dossierProgress(path, completedIds);
              return (
                <Link
                  key={path.id}
                  to={`${MA_BASE}/dossiers/${path.id}`}
                  className="w-[190px] shrink-0 rounded-t-md border border-b-0 border-black/25 bg-[var(--ma-manila)] px-3 pb-2 pt-2.5 shadow-[0_-2px_4px_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-1"
                  style={paperGrain()}
                >
                  <p className="ma-type truncate text-[12px] font-bold uppercase tracking-wide text-[var(--ma-ink)]">
                    {path.title}
                  </p>
                  <p className="ma-type mt-0.5 flex items-center gap-1.5 text-[9.5px] uppercase tracking-wider text-[var(--ma-graphite)]">
                    {done} of {path.skillIds.length} filed
                    {done === path.skillIds.length && <FiledMark />}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
