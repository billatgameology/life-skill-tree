import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';
import { CATEGORIES, SKILL_MAP } from '@/data/skills';
import { LAT_BASE, NET_MAP, netSoldered } from '../graph';
import { useLattice } from '../context';
import { TraceMap } from './TraceMap';

export default function NetPage() {
  const { netId } = useParams();
  const [searchParams] = useSearchParams();
  const { completedSet } = useLattice();

  const net = netId ? NET_MAP[netId] : undefined;
  if (!net) return <Navigate to={LAT_BASE} replace />;

  const focus = searchParams.get('focus');
  const done = netSoldered(net, completedSet);
  const total = net.skillIds.length;

  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-20 pt-6 sm:px-6">
      <Link
        to={LAT_BASE}
        className="lt-mono inline-flex min-h-11 items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[var(--lt-dim)] hover:text-[var(--lt-silk)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to the board
      </Link>

      <header className="mb-5 mt-2">
        <p className="lt-mono text-[10px] uppercase tracking-[0.24em] text-[var(--lt-copper)]">
          {net.label} · {total} pads · {net.edges.length} traces
        </p>
        <h1 className="lt-mono mt-1 break-all text-[24px] font-bold tracking-tight text-[var(--lt-silk)] sm:text-[30px]">
          {net.signal}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="text-[12px] text-[var(--lt-dim)]">
            {net.domains.map((d) => CATEGORIES[d].name).join(' × ')}
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-32 overflow-hidden rounded-full border border-[var(--lt-line)] bg-[var(--lt-well)]">
              <span
                className="block h-full rounded-full bg-[var(--lt-gold)]"
                style={{ width: `${(done / total) * 100}%` }}
              />
            </span>
            <span className="lt-mono text-[11px] font-bold text-[var(--lt-gold)]">
              {done}/{total} soldered
            </span>
          </span>
        </div>
      </header>

      <TraceMap net={net} focusId={focus} />

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="flex items-center gap-2 text-[11px] text-[var(--lt-dim)]">
          <span className="h-3 w-3 rounded-sm bg-[var(--lt-gold)]" aria-hidden="true" />
          soldered
        </span>
        <span className="flex items-center gap-2 text-[11px] text-[var(--lt-dim)]">
          <span
            className="h-3 w-3 rounded-sm border-2 border-[var(--lt-copper)] bg-[var(--lt-panel)]"
            aria-hidden="true"
          />
          live — every feed soldered
        </span>
        <span className="flex items-center gap-2 text-[11px] text-[var(--lt-dim)]">
          <span
            className="h-3 w-3 rounded-sm border border-[#2E4A39] bg-[var(--lt-well)]"
            aria-hidden="true"
          />
          open — still walkable, never locked
        </span>
        <span className="lt-mono text-[10px] uppercase tracking-[0.12em] text-[var(--lt-dim)]">
          traces run top → down
        </span>
      </div>

      {/* Entry pads */}
      <section className="mt-8">
        <h2 className="lt-mono mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--lt-copper)]">
          Entry pads on this net
        </h2>
        <div className="flex flex-wrap gap-2">
          {net.entryIds.map((id) => {
            const s = SKILL_MAP[id];
            return (
              <Link
                key={id}
                to={`${LAT_BASE}/skill/${id}`}
                className="flex min-h-11 items-center gap-2 rounded-md border border-[var(--lt-line)] bg-[var(--lt-panel)] px-3.5 text-[12.5px] font-semibold text-[var(--lt-silk)] transition-colors hover:border-[var(--lt-copper)]"
              >
                <Zap
                  className="h-3.5 w-3.5 text-[var(--lt-gold)]"
                  fill="currentColor"
                  aria-hidden="true"
                />
                {s.title}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
