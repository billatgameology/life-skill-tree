import { Link } from 'react-router-dom';
import { ArrowLeft, CircuitBoard, Search } from 'lucide-react';
import { LAT_BASE, TOTAL_PADS } from '../graph';
import { useLattice } from '../context';

export default function BoardHeader() {
  const { completedIds, openProbe } = useLattice();
  const done = completedIds.length;
  const pct = Math.round((done / TOTAL_PADS) * 100);

  return (
    <header className="z-30 flex h-[60px] shrink-0 items-center gap-2 border-b border-[var(--lt-line)] bg-[var(--lt-well)] px-2 sm:gap-3 sm:px-5">
      <Link
        to="/"
        aria-label="Back to the design gallery"
        className="lt-mono flex h-11 items-center gap-1.5 rounded px-2 text-[10px] uppercase tracking-[0.14em] text-[var(--lt-dim)] hover:text-[var(--lt-silk)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Gallery</span>
      </Link>

      <Link to={LAT_BASE} className="flex min-h-11 items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded border border-[var(--lt-copper)] bg-[var(--lt-panel)] text-[var(--lt-gold)]">
          <CircuitBoard className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <span className="leading-tight">
          <strong className="block text-[15px] font-bold tracking-[0.24em] text-[var(--lt-silk)]">
            LATTICE
          </strong>
          <span className="lt-mono hidden text-[9px] uppercase tracking-[0.2em] text-[var(--lt-dim)] sm:block">
            walk the traces
          </span>
        </span>
      </Link>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2" title="Overall progress">
          <span className="lt-mono hidden text-[9px] uppercase tracking-[0.18em] text-[var(--lt-dim)] md:inline">
            soldered
          </span>
          <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-[var(--lt-panel)] sm:block">
            <div className="h-full rounded-full bg-[var(--lt-gold)]" style={{ width: `${pct}%` }} />
          </div>
          <span className="lt-mono text-[11px] font-bold text-[var(--lt-gold)]">
            {done}/{TOTAL_PADS}
          </span>
        </div>
        <button
          type="button"
          onClick={openProbe}
          aria-label="Probe — search any skill"
          className="lt-mono flex h-11 items-center gap-2 rounded-md border border-[var(--lt-line)] bg-[var(--lt-panel)] px-3 text-[10px] uppercase tracking-[0.14em] text-[var(--lt-dim)] hover:border-[var(--lt-copper)] hover:text-[var(--lt-silk)]"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Probe</span>
          <kbd
            aria-hidden="true"
            className="hidden rounded border border-[var(--lt-line)] px-1.5 py-0.5 text-[9px] text-[var(--lt-dim)] sm:inline"
          >
            /
          </kbd>
        </button>
      </div>
    </header>
  );
}
