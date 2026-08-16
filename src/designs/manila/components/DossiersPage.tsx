import { Link, Navigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useManila } from '../context';
import { CARDS, DOSSIERS, MA_BASE, dossierProgress } from '../derive';
import { FiledMark, PencilBar } from './bits';
import { paperGrain } from '../surfaces';

/** The file tray: every learning path as a manila dossier folder. */
export function DossiersPage() {
  const { completedIds } = useManila();

  return (
    <div className="mx-auto max-w-[760px] px-4 pb-10 pt-6 sm:px-6">
      <h1 className="ma-chrome text-xl font-bold text-[var(--ma-manila)]">Dossiers</h1>
      <p className="ma-body mt-0.5 text-[13px] text-[var(--ma-manila)]/70">
        Guided sets of cards, each assembled around one real goal, with a routing slip
        stapled inside.
      </p>

      <div className="mt-5 space-y-3">
        {DOSSIERS.map((path) => {
          const done = dossierProgress(path, completedIds);
          const complete = done === path.skillIds.length;
          return (
            <Link
              key={path.id}
              to={`${MA_BASE}/dossiers/${path.id}`}
              className="relative block rounded-md border border-black/25 bg-[var(--ma-manila)] px-4 py-3.5 shadow-[0_3px_8px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5"
              style={paperGrain()}
            >
              {/* Folder tab */}
              <span
                className="absolute -top-[9px] left-4 rounded-t-sm border border-b-0 border-black/25 bg-[var(--ma-manila)] px-2.5 py-0.5"
                style={paperGrain()}
              >
                <span className="ma-type text-[8.5px] font-bold uppercase tracking-[0.14em] text-[var(--ma-graphite)]">
                  {path.pathType} · {path.difficulty}
                </span>
              </span>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="ma-type min-w-0 truncate text-[15px] font-bold uppercase tracking-wide text-[var(--ma-ink)]">
                  {path.title}
                </h2>
                <span className="ma-type flex shrink-0 items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--ma-graphite)]">
                  {done} of {path.skillIds.length} filed
                  {complete && <FiledMark />}
                </span>
              </div>
              <p className="ma-body mt-1 text-[12.5px] italic leading-snug text-[var(--ma-graphite)]">
                "{path.learnerGoal}"
              </p>
              <div className="mt-2.5">
                <PencilBar done={done} total={path.skillIds.length} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** One dossier laid flat: the routing slip stapled inside the cover. */
export function DossierPage() {
  const { dossierId } = useParams();
  const { completedIds } = useManila();

  const path = DOSSIERS.find((p) => p.id === dossierId);
  if (!path) return <Navigate to={`${MA_BASE}/dossiers`} replace />;

  const done = new Set(completedIds);
  const filedTotal = dossierProgress(path, completedIds);

  return (
    <div className="mx-auto max-w-[720px] px-4 pb-10 pt-6 sm:px-6">
      <Link
        to={`${MA_BASE}/dossiers`}
        className="ma-chrome inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--ma-manila)]/75 hover:text-[var(--ma-manila)]"
      >
        <ChevronLeft size={14} /> All dossiers
      </Link>

      {/* Open folder */}
      <div
        className="mt-3 rounded-md border border-black/25 bg-[var(--ma-manila)] p-4 shadow-[0_5px_14px_rgba(0,0,0,0.4)] sm:p-6"
        style={paperGrain()}
      >
        <p className="ma-type text-[9px] uppercase tracking-[0.16em] text-[var(--ma-graphite)]">
          Dossier · {path.pathType} · {path.difficulty} · ~{path.estimatedTotalMinutes} min total
        </p>
        <h1 className="ma-type mt-1 text-[19px] font-bold uppercase leading-snug tracking-wide text-[var(--ma-ink)]">
          {path.title}
        </h1>
        <p className="ma-body mt-2 text-[13.5px] leading-relaxed text-[var(--ma-ink)]">{path.summary}</p>

        {/* Routing slip */}
        <div
          className="relative mt-5 rounded-sm border border-black/20 bg-[var(--ma-card)] px-4 pb-3.5 pt-4"
          style={paperGrain()}
        >
          <svg className="absolute left-6 top-[-4px] h-[10px] w-[26px]" viewBox="0 0 26 10" aria-hidden="true">
            <path d="M 3 10 L 3 3 L 23 3 L 23 10" fill="none" stroke="#7E7A72" strokeWidth="2.4" />
          </svg>
          <p className="ma-type mb-2 border-b border-[var(--ma-rule)] pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ma-ink)]">
            Routing slip — work in order · {filedTotal} of {path.skillIds.length} filed
          </p>
          <ol className="space-y-0.5">
            {path.skillIds.map((id, i) => {
              const info = CARDS[id];
              if (!info) return null;
              const filed = done.has(id);
              return (
                <li key={id}>
                  <Link
                    to={`${MA_BASE}/drawer/${info.drawer.domain}/card/${id}`}
                    className="ma-type group flex items-baseline gap-2 rounded px-1 py-1 text-[12.5px] hover:bg-[var(--ma-manila)]/60"
                  >
                    <span className="w-5 shrink-0 text-right text-[11px] text-[var(--ma-graphite)]">{i + 1}.</span>
                    <span className={`min-w-0 flex-1 truncate ${filed ? 'text-[var(--ma-graphite)] line-through decoration-[var(--ma-graphite)]/50' : 'text-[var(--ma-ink)] group-hover:underline'}`}>
                      {info.skill.title}
                    </span>
                    <span className="shrink-0 text-[9.5px] uppercase text-[var(--ma-graphite)]">{info.callNumber}</span>
                    {filed && <FiledMark />}
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Outcome */}
        <div className="mt-4">
          <p className="ma-type text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ma-ink)]">
            Where this leaves you
          </p>
          <p className="ma-body mt-1 text-[13px] leading-relaxed text-[var(--ma-ink)]">{path.realLifeOutcome}</p>
          {path.whenThisHelps.length > 0 && (
            <ul className="mt-2 space-y-1">
              {path.whenThisHelps.map((w, i) => (
                <li key={i} className="ma-body flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--ma-graphite)]">
                  <span className="ma-type mt-px shrink-0">–</span>
                  {w}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
