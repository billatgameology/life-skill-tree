import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DESIGNS } from '@/designs/registry';
import { ALL_SKILLS, CATEGORY_KEYS } from '@/data/skills';

/**
 * The top-level home page: a gallery of every UI design built on top of the
 * shared skill library. Cards render straight from the design registry.
 */
export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-void text-ink">
      {/* Subtle radial wash so the page isn't a flat black slab */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(1200px 600px at 50% -10%, rgba(212,175,55,0.07), transparent 60%), radial-gradient(900px 500px at 85% 110%, rgba(90,155,160,0.06), transparent 60%)',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-5 pb-20 pt-16 sm:pt-24">
        <header className="mb-12 sm:mb-16">
          <p className="mb-3 text-[11px] font-heading font-bold uppercase tracking-[0.22em] text-ink-dim">
            Life Skill Tree
          </p>
          <h1 className="font-display text-4xl text-ink sm:text-5xl">Design Gallery</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-muted">
            One skill library, many ways to see it. Every design below renders the same{' '}
            <span className="text-ink">{ALL_SKILLS.length} skills</span> across{' '}
            <span className="text-ink">{CATEGORY_KEYS.length} domains</span> — only the lens
            changes. Your progress and favorites carry across all of them.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {DESIGNS.map((design, i) => (
            <Link
              key={design.slug}
              to={`/${design.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
              style={{ ['--design-accent' as string]: design.accent }}
            >
              {/* Preview motif */}
              <div
                className="relative h-40 w-full overflow-hidden border-b border-border bg-surface-raised/60"
                style={{
                  background: `radial-gradient(320px 180px at 50% 120%, ${design.accent}14, transparent 70%)`,
                }}
              >
                <div className="absolute inset-0 p-6 transition-transform duration-300 group-hover:scale-105">
                  {design.preview}
                </div>
                <span className="absolute left-4 top-3 font-display text-[11px] tracking-[0.18em] text-ink-dim">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Text block */}
              <div className="flex flex-1 flex-col gap-2 p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-xl text-ink">{design.name}</h2>
                  <span
                    className="flex items-center gap-1 text-[11px] font-heading font-bold uppercase tracking-wider opacity-70 transition-opacity group-hover:opacity-100"
                    style={{ color: design.accent }}
                  >
                    Open
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed text-ink-muted">{design.tagline}</p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                  {design.vibe.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-border bg-surface-raised px-2 py-0.5 text-[10px] font-heading text-ink-dim"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              {/* Accent hairline that lights up on hover */}
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{ background: design.accent }}
              />
            </Link>
          ))}
        </div>

        <footer className="mt-16 text-center text-[11px] text-ink-dim">
          More designs are on the way — each one is an experiment in how a skill library can feel.
        </footer>
      </div>
    </div>
  );
}
