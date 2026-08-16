import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  Gauge,
  Hammer,
  Lightbulb,
  ListChecks,
  Search,
  Sparkles,
  Tag,
  Wrench,
  X,
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import Toast from '@/components/Toast';
import { ALL_SKILLS, CATEGORIES, CATEGORY_KEYS, SKILL_MAP, getChildren } from '@/data/skills';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import type { DomainKey, Skill } from '@/lib/types';
import './workbench.css';

const WB_BASE = '/workbench';

const THEME = {
  '--wb-plywood': '#E9D2AE',
  '--wb-blue': '#174C5B',
  '--wb-orange': '#F26B38',
  '--wb-graphite': '#20282A',
  '--wb-cream': '#FFF6E6',
  '--wb-paper': '#FFFCF4',
} as CSSProperties;

const LEVELS = [
  {
    level: 1,
    number: '01',
    title: 'First fixes',
    description: 'Straightforward jobs for getting the basics in hand.',
  },
  {
    level: 2,
    number: '02',
    title: 'Everyday builds',
    description: 'Multi-step jobs that turn knowledge into a dependable routine.',
  },
  {
    level: 3,
    number: '03',
    title: 'Big assemblies',
    description: 'More involved jobs that combine several practical skills.',
  },
] as const;

const SKILLS_BY_DOMAIN = CATEGORY_KEYS.reduce<Record<DomainKey, Skill[]>>((groups, domain) => {
  groups[domain] = ALL_SKILLS.filter((skill) => skill.domain === domain);
  return groups;
}, {} as Record<DomainKey, Skill[]>);

type WorkbenchState = {
  activeDomain: DomainKey;
  completedIds: string[];
  favoriteIds: string[];
  completionDates: Record<string, string>;
  readyRack: boolean;
  openFinder: () => void;
  selectDomain: (domain: DomainKey) => void;
  showReadyRack: () => void;
  complete: (skillId: string) => boolean;
  favorite: (skillId: string) => boolean;
};

const WorkbenchContext = createContext<WorkbenchState | null>(null);

function useWorkbench() {
  const value = useContext(WorkbenchContext);
  if (!value) throw new Error('Workbench components must be rendered inside WorkbenchApp.');
  return value;
}

function percent(done: number, total: number) {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function ProgressGauge({ done, total, compact = false }: { done: number; total: number; compact?: boolean }) {
  const value = percent(done, total);
  return (
    <div className={compact ? 'wb-gauge wb-gauge--compact' : 'wb-gauge'} aria-label={`${done} of ${total} jobs complete`}>
      <div className="wb-gauge__track" aria-hidden="true">
        <span className="wb-gauge__fill" style={{ width: `${value}%` }} />
        <span className="wb-gauge__needle" style={{ left: `${value}%` }} />
      </div>
      {!compact && (
        <div className="wb-gauge__readout">
          <span>{done} punched</span>
          <strong>{value}%</strong>
        </div>
      )}
    </div>
  );
}

function ToolRail() {
  const {
    completedIds,
    favoriteIds,
    readyRack,
    openFinder,
    showReadyRack,
  } = useWorkbench();

  return (
    <header className="wb-toolrail">
      <div className="wb-brand-block">
        <Link to={WB_BASE} className="wb-brand" aria-label="Workbench home">
          <span className="wb-brand__mark" aria-hidden="true"><Hammer size={20} /></span>
          <span>
            <span className="wb-brand__kicker">Life skills co-op</span>
            <strong>WORKBENCH</strong>
          </span>
        </Link>
        <Link to="/" className="wb-gallery-link">
          Design gallery <ExternalLink size={12} aria-hidden="true" />
        </Link>
      </div>

      <div className="wb-overall-progress">
        <div className="wb-toolrail-label">
          <Gauge size={14} aria-hidden="true" /> Overall shop log
        </div>
        <ProgressGauge done={completedIds.length} total={ALL_SKILLS.length} />
      </div>

      <nav className="wb-tool-actions" aria-label="Workbench tools">
        <button type="button" className="wb-tool-button wb-tool-button--search" onClick={openFinder}>
          <Search size={18} aria-hidden="true" />
          <span>Find a job</span>
          <kbd>/</kbd>
        </button>
        <Link
          to={WB_BASE}
          onClick={showReadyRack}
          className={`wb-tool-button ${readyRack ? 'is-active' : ''}`}
          aria-current={readyRack ? 'page' : undefined}
        >
          <Bookmark size={18} fill={readyRack ? 'currentColor' : 'none'} aria-hidden="true" />
          <span>Ready rack</span>
          <b>{favoriteIds.length}</b>
        </Link>
      </nav>
    </header>
  );
}

function DrawerBank() {
  const { activeDomain, completedIds, readyRack, selectDomain } = useWorkbench();
  const completed = useMemo(() => new Set(completedIds), [completedIds]);

  return (
    <section className="wb-cabinet" aria-labelledby="wb-parts-heading">
      <div className="wb-cabinet__titlebar">
        <div>
          <span className="wb-stencil">Parts bank A</span>
          <h2 id="wb-parts-heading">Choose a parts drawer</h2>
        </div>
        <p>15 drawers · {ALL_SKILLS.length} job cards</p>
      </div>
      <div className="wb-drawer-rack" role="group" aria-label="Skill domains">
        {CATEGORY_KEYS.map((domain, index) => {
          const category = CATEGORIES[domain];
          const skills = SKILLS_BY_DOMAIN[domain];
          const done = skills.filter((skill) => completed.has(skill.id)).length;
          const active = !readyRack && domain === activeDomain;
          return (
            <button
              type="button"
              aria-pressed={active}
              key={domain}
              className={`wb-drawer ${active ? 'is-open' : ''}`}
              onClick={() => selectDomain(domain)}
              title={`${category.name}: ${done} of ${skills.length} complete`}
            >
              <span className="wb-drawer__number">D-{String(index + 1).padStart(2, '0')}</span>
              <span className="wb-drawer__handle" aria-hidden="true" />
              <span className="wb-drawer__label">
                <span aria-hidden="true">{category.icon}</span> {category.name}
              </span>
              <ProgressGauge done={done} total={skills.length} compact />
              <span className="wb-drawer__count">{done}/{skills.length}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function JobCard({ skill }: { skill: Skill }) {
  const { completedIds, favoriteIds, complete, favorite } = useWorkbench();
  const completed = completedIds.includes(skill.id);
  const saved = favoriteIds.includes(skill.id);
  const domain = CATEGORIES[skill.domain];

  return (
    <article className={`wb-job-card ${completed ? 'is-complete' : ''}`}>
      <div className="wb-job-card__topline">
        <span className="wb-job-number">JOB {skill.id.slice(0, 3).toUpperCase()}-{String(skill.level).padStart(2, '0')}</span>
        <button
          type="button"
          className={`wb-save-button ${saved ? 'is-saved' : ''}`}
          onClick={() => favorite(skill.id)}
          aria-label={saved ? `Remove ${skill.title} from the ready rack` : `Hang ${skill.title} on the ready rack`}
          aria-pressed={saved}
        >
          <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>

      <Link to={`${WB_BASE}/job/${skill.id}`} className="wb-job-card__link">
        <h4>{skill.title}</h4>
        <p>{skill.summary}</p>
        <span className="wb-card-open">Open instruction sheet <ChevronRight size={14} aria-hidden="true" /></span>
      </Link>

      <div className="wb-job-card__meta">
        <span><Clock3 size={13} aria-hidden="true" /> {skill.estimatedMinutes} min</span>
        <span><Tag size={13} aria-hidden="true" /> {skill.difficulty}</span>
        <span className="wb-card-domain" title={domain.name}>{domain.icon}</span>
      </div>

      {completed ? (
        <div className="wb-ticket-punch" aria-label="Job complete">
          <Check size={15} strokeWidth={3} aria-hidden="true" /> PUNCHED
        </div>
      ) : (
        <button type="button" className="wb-quick-punch" onClick={() => complete(skill.id)}>
          <CheckCircle2 size={15} aria-hidden="true" /> Mark complete
        </button>
      )}
    </article>
  );
}

function LevelLane({ level, skills }: { level: (typeof LEVELS)[number]; skills: Skill[] }) {
  return (
    <section className="wb-lane" aria-labelledby={`wb-lane-${level.level}`}>
      <header className="wb-lane__header">
        <span className="wb-lane__plate">LANE {level.number}</span>
        <div>
          <h3 id={`wb-lane-${level.level}`}>{level.title}</h3>
          <p>{level.description}</p>
        </div>
        <span className="wb-lane__count">{skills.length}</span>
      </header>
      <div className="wb-lane__cards">
        {skills.length > 0 ? (
          skills.map((skill) => <JobCard key={skill.id} skill={skill} />)
        ) : (
          <div className="wb-lane-empty">
            <Wrench size={20} aria-hidden="true" />
            <span>No cards stored in this lane.</span>
          </div>
        )}
      </div>
    </section>
  );
}

function BoardPage() {
  const { activeDomain, completedIds, favoriteIds, readyRack, openFinder } = useWorkbench();
  const completed = useMemo(() => new Set(completedIds), [completedIds]);
  const favorite = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const jobs = readyRack
    ? ALL_SKILLS.filter((skill) => favorite.has(skill.id))
    : SKILLS_BY_DOMAIN[activeDomain];
  const done = jobs.filter((skill) => completed.has(skill.id)).length;
  const category = CATEGORIES[activeDomain];

  return (
    <div className="wb-board-page">
      <DrawerBank />

      <section
        id="wb-job-board"
        className="wb-board"
        role="region"
        aria-labelledby="wb-board-title"
        aria-live="polite"
      >
        <header className="wb-board__heading">
          <div>
            <span className="wb-stencil">{readyRack ? 'Saved across every drawer' : `Drawer ${String(CATEGORY_KEYS.indexOf(activeDomain) + 1).padStart(2, '0')}`}</span>
            <h1 id="wb-board-title">
              <span aria-hidden="true">{readyRack ? '🔖' : category.icon}</span>{' '}
              {readyRack ? 'Ready rack' : category.name}
            </h1>
            <p>
              {readyRack
                ? 'Jobs you hung up for quick access, sorted into the same three shop lanes.'
                : `Pull a card, follow its instruction sheet, and punch it when the job feels dependable.`}
            </p>
          </div>
          <div className="wb-domain-progress">
            <span>{readyRack ? 'Rack status' : 'Drawer status'}</span>
            <strong>{done} / {jobs.length}</strong>
            <ProgressGauge done={done} total={jobs.length} compact />
          </div>
        </header>

        {readyRack && jobs.length === 0 ? (
          <div className="wb-empty-rack">
            <span className="wb-empty-rack__hook"><Bookmark size={28} aria-hidden="true" /></span>
            <h2>The ready rack is clear</h2>
            <p>Use the bookmark on any job card to hang it here. Your saved jobs from every drawer will stay together.</p>
            <button type="button" onClick={openFinder}><Search size={17} aria-hidden="true" /> Find a job to save</button>
          </div>
        ) : (
          <div className="wb-lanes">
            {LEVELS.map((level) => (
              <LevelLane
                key={level.level}
                level={level}
                skills={jobs.filter((skill) => skill.level === level.level)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SheetSection({
  icon,
  label,
  children,
  className = '',
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`wb-sheet-section ${className}`}>
      <h2><span aria-hidden="true">{icon}</span>{label}</h2>
      {children}
    </section>
  );
}

function ConnectionCard({ skill, relationship }: { skill: Skill; relationship: string }) {
  const { completedIds } = useWorkbench();
  const complete = completedIds.includes(skill.id);
  return (
    <Link to={`${WB_BASE}/job/${skill.id}`} className="wb-connection-card">
      <span className={`wb-connection-card__status ${complete ? 'is-complete' : ''}`} aria-hidden="true">
        {complete ? <Check size={12} strokeWidth={3} /> : skill.level}
      </span>
      <span>
        <small>{relationship} · {CATEGORIES[skill.domain].name}</small>
        <strong>{skill.title}</strong>
      </span>
      <ChevronRight size={15} aria-hidden="true" />
    </Link>
  );
}

function InstructionSheetInner({ skill }: { skill: Skill }) {
  const {
    completedIds,
    favoriteIds,
    completionDates,
    complete,
    favorite,
    selectDomain,
  } = useWorkbench();
  const [checks, setChecks] = useState(() => skill.completionCriteria.map(() => false));
  const completed = completedIds.includes(skill.id);
  const saved = favoriteIds.includes(skill.id);
  const allChecked = checks.length > 0 && checks.every(Boolean);
  const prerequisites = skill.suggestedPrerequisites
    .map((id) => SKILL_MAP[id])
    .filter((item): item is Skill & { x: number; y: number } => Boolean(item));
  const dependents = getChildren(skill.id);
  const category = CATEGORIES[skill.domain];

  return (
    <div className="wb-detail-page">
      <div className="wb-detail-nav">
        <Link to={WB_BASE} onClick={() => selectDomain(skill.domain)}>
          <ArrowLeft size={17} aria-hidden="true" /> Back to parts board
        </Link>
        <button type="button" onClick={() => favorite(skill.id)} aria-pressed={saved} className={saved ? 'is-saved' : ''}>
          <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
          {saved ? 'On ready rack' : 'Hang on ready rack'}
        </button>
      </div>

      <article className="wb-instruction-sheet">
        <div className="wb-sheet-clip" aria-hidden="true"><span /></div>
        <header className="wb-sheet-hero">
          <div className="wb-sheet-hero__copy">
            <span className="wb-job-label">SHOP INSTRUCTION · {category.name.toUpperCase()}</span>
            <h1>{skill.title}</h1>
            <p className="wb-job-brief">{skill.summary}</p>
          </div>
          <div className="wb-sheet-ticket">
            <span>JOB CARD</span>
            <strong>{skill.id.toUpperCase()}</strong>
            <dl>
              <div><dt>Lane</dt><dd>{skill.level} of 3</dd></div>
              <div><dt>Time</dt><dd>{skill.estimatedMinutes} min</dd></div>
              <div><dt>Fit</dt><dd>{skill.difficulty}</dd></div>
            </dl>
            {completed && (
              <div className="wb-sheet-ticket__punch">
                <Check size={18} strokeWidth={3} aria-hidden="true" />
                <span>PUNCHED{completionDates[skill.id] ? <small>{completionDates[skill.id]}</small> : null}</span>
              </div>
            )}
          </div>
        </header>

        <div className="wb-promise-strip">
          <span>Finished result</span>
          <p>{skill.learnerPromise}</p>
        </div>

        <div className="wb-sheet-layout">
          <div className="wb-sheet-main">
            <SheetSection icon={<Wrench size={18} />} label="Why this job matters">
              <p>{skill.whyItMatters}</p>
              <h3>Where it earns its keep</h3>
              <ul className="wb-use-list">
                {skill.realLifeUses.map((item, index) => (
                  <li key={index}><span>{String(index + 1).padStart(2, '0')}</span>{item}</li>
                ))}
              </ul>
            </SheetSection>

            <SheetSection icon={<ListChecks size={18} />} label="Tools you will learn">
              <ul className="wb-learn-list">
                {skill.youWillLearn.map((item, index) => (
                  <li key={index}><Check size={15} strokeWidth={3} aria-hidden="true" />{item}</li>
                ))}
              </ul>
            </SheetSection>

            <SheetSection icon={<Hammer size={18} />} label="Procedure" className="wb-procedure">
              <ol>
                {skill.steps.map((step, index) => (
                  <li key={index}>
                    <span className="wb-step-number">{String(index + 1).padStart(2, '0')}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </SheetSection>

            <SheetSection icon={<Sparkles size={18} />} label="Bench test" className="wb-challenge">
              <p className="wb-challenge__prompt">{skill.miniChallenge}</p>
              <div className="wb-checklist">
                <h3>Quality check</h3>
                <p>Tick each piece of evidence when you can see it. These checks stay on this sheet only.</p>
                {skill.completionCriteria.map((criterion, index) => (
                  <label key={index}>
                    <input
                      type="checkbox"
                      checked={completed || checks[index]}
                      disabled={completed}
                      onChange={() => setChecks((current) => current.map((value, itemIndex) => (
                        itemIndex === index ? !value : value
                      )))}
                    />
                    <span>{criterion}</span>
                  </label>
                ))}
              </div>
              {!completed && (
                <button
                  type="button"
                  className={`wb-complete-button ${allChecked ? 'is-ready' : ''}`}
                  onClick={() => complete(skill.id)}
                >
                  <ClipboardCheck size={18} aria-hidden="true" /> Punch this job complete
                </button>
              )}
              {completed && (
                <p className="wb-complete-note"><CheckCircle2 size={18} aria-hidden="true" /> This job is in your completed shop log.</p>
              )}
            </SheetSection>

            <div className="wb-notes-grid">
              <SheetSection icon={<AlertTriangle size={17} />} label="Common snags" className="wb-snags">
                <ul>
                  {(skill.commonProblems ?? []).map((problem, index) => <li key={index}>{problem}</li>)}
                </ul>
              </SheetSection>
              <SheetSection icon={<Lightbulb size={17} />} label="Shop tips" className="wb-tips">
                <ul>
                  {(skill.tips ?? []).map((tip, index) => <li key={index}>{tip}</li>)}
                </ul>
              </SheetSection>
            </div>
          </div>

          <aside className="wb-sheet-sidebar" aria-label="Related job cards">
            <div className="wb-sidebar-block">
              <span className="wb-stencil">Set-up jobs</span>
              <h2>Builds on</h2>
              {prerequisites.length > 0 ? prerequisites.map((item) => (
                <ConnectionCard key={item.id} skill={item} relationship="Builds on" />
              )) : <p className="wb-no-connections">No suggested set-up jobs. You can start here.</p>}
            </div>

            <div className="wb-sidebar-block">
              <span className="wb-stencil">Next assemblies</span>
              <h2>Leads to</h2>
              {dependents.length > 0 ? dependents.map((item) => (
                <ConnectionCard key={item.id} skill={item} relationship="Leads to" />
              )) : <p className="wb-no-connections">This card does not feed a later job yet.</p>}
            </div>

            <div className="wb-sidebar-spec">
              <span className="wb-stencil">Job specification</span>
              <dl>
                <div><dt>Parts drawer</dt><dd>{category.name}</dd></div>
                <div><dt>Level lane</dt><dd>{skill.level}</dd></div>
                <div><dt>Difficulty</dt><dd>{skill.difficulty}</dd></div>
                <div><dt>Estimated time</dt><dd>{skill.estimatedMinutes} minutes</dd></div>
              </dl>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}

function InstructionSheet() {
  const { skillId } = useParams();
  const skill = skillId && Object.prototype.hasOwnProperty.call(SKILL_MAP, skillId)
    ? SKILL_MAP[skillId]
    : undefined;
  if (!skill) return <Navigate to={WB_BASE} replace />;
  return <InstructionSheetInner key={skill.id} skill={skill} />;
}

function Finder({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { completedIds, favoriteIds } = useWorkbench();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const completed = useMemo(() => new Set(completedIds), [completedIds]);
  const favorite = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [open, onClose]);

  const normalized = query.trim().toLowerCase();
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const results = normalized
    ? ALL_SKILLS.filter((skill) => {
      const category = CATEGORIES[skill.domain];
      const haystack = [
        skill.title,
        skill.summary,
        skill.learnerPromise,
        category.name,
        ...(skill.tags ?? []),
      ].join(' ').toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    }).sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aRank = aTitle.startsWith(normalized) ? 0 : aTitle.includes(normalized) ? 1 : 2;
      const bRank = bTitle.startsWith(normalized) ? 0 : bTitle.includes(normalized) ? 1 : 2;
      return aRank - bRank || a.title.localeCompare(b.title);
    })
    : [];

  if (!open) return null;

  return (
    <div className="wb-finder-backdrop" onMouseDown={onClose}>
      <div
        ref={panelRef}
        className="wb-finder"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wb-finder-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="wb-finder__header">
          <div>
            <span className="wb-stencil">Master job index</span>
            <h2 id="wb-finder-title">Find any job card</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close job finder"><X size={20} /></button>
        </header>
        <label className="wb-finder__input">
          <Search size={20} aria-hidden="true" />
          <span className="sr-only">Search all job cards</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search all ${ALL_SKILLS.length} jobs…`}
          />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}
        </label>

        <div className="wb-finder__body">
          {!normalized ? (
            <div className="wb-finder-idle">
              <div className="wb-finder-idle__sign"><Wrench size={28} aria-hidden="true" /></div>
              <h3>Everything in the shop is indexed.</h3>
              <p>Search by a job name, a drawer such as “Food & Cooking,” or an outcome such as “write an email.”</p>
              <div className="wb-finder-suggestions" aria-label="Suggested searches">
                {['cook dinner', 'make a budget', 'job interview', 'fix at home'].map((suggestion) => (
                  <button type="button" key={suggestion} onClick={() => setQuery(suggestion)}>{suggestion}</button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="wb-results-count">{results.length} {results.length === 1 ? 'card' : 'cards'} found</p>
              <div className="wb-search-results">
                {results.map((skill) => (
                  <Link key={skill.id} to={`${WB_BASE}/job/${skill.id}`} onClick={onClose}>
                    <span className={`wb-search-result__state ${completed.has(skill.id) ? 'is-complete' : ''}`}>
                      {completed.has(skill.id) ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : skill.level}
                    </span>
                    <span className="wb-search-result__copy">
                      <strong>{skill.title}</strong>
                      <small>{CATEGORIES[skill.domain].name} · {skill.estimatedMinutes} min · {skill.difficulty}</small>
                    </span>
                    {favorite.has(skill.id) && <Bookmark size={14} fill="currentColor" className="wb-search-result__saved" aria-label="On ready rack" />}
                    <ChevronRight size={17} aria-hidden="true" />
                  </Link>
                ))}
                {results.length === 0 && (
                  <div className="wb-no-results">
                    <Search size={24} aria-hidden="true" />
                    <h3>No matching card</h3>
                    <p>Try fewer words or a broader shop drawer name.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Design #4 — a communal maker's workshop for browsing and completing life-skill jobs. */
export default function WorkbenchApp() {
  const { authError, clearAuthError } = useAuth();
  const { user, loaded, syncError, completeSkill, toggleFavorite, completionDates } = useUserData();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const [activeDomain, setActiveDomain] = useState<DomainKey>('digital-basics');
  const [readyRack, setReadyRack] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const selectDomain = useCallback((domain: DomainKey) => {
    setActiveDomain(domain);
    setReadyRack(false);
  }, []);

  const showReadyRack = useCallback(() => setReadyRack(true), []);
  const openFinder = useCallback(() => setFinderOpen(true), []);
  const closeFinder = useCallback(() => setFinderOpen(false), []);

  const handleComplete = useCallback((skillId: string) => {
    const accepted = completeSkill(skillId);
    if (!accepted) {
      setAuthOpen(true);
      showToast('Sign in to punch completed job cards.');
      return false;
    }
    showToast('Job ticket punched. Nice work.');
    return true;
  }, [completeSkill, showToast]);

  const handleFavorite = useCallback((skillId: string) => {
    const accepted = toggleFavorite(skillId);
    if (!accepted) {
      setAuthOpen(true);
      showToast('Sign in to use your ready rack.');
      return false;
    }
    return true;
  }, [showToast, toggleFavorite]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      event.preventDefault();
      openFinder();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openFinder]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  const state = useMemo<WorkbenchState>(() => ({
    activeDomain,
    completedIds: user?.completedSkillIds ?? [],
    favoriteIds: user?.favorite ?? [],
    completionDates,
    readyRack,
    openFinder,
    selectDomain,
    showReadyRack,
    complete: handleComplete,
    favorite: handleFavorite,
  }), [
    activeDomain,
    completionDates,
    handleComplete,
    handleFavorite,
    openFinder,
    readyRack,
    selectDomain,
    showReadyRack,
    user,
  ]);

  if (!loaded) {
    return (
      <div className="wb-root wb-loading" style={THEME}>
        <span className="wb-loading__tool"><Wrench size={28} aria-hidden="true" /></span>
        <p>Opening the workshop…</p>
      </div>
    );
  }

  return (
    <WorkbenchContext.Provider value={state}>
      <div className="wb-root" style={THEME}>
        <ToolRail />
        <main ref={mainRef} className="wb-main">
          <Routes>
            <Route index element={<BoardPage />} />
            <Route path="job/:skillId" element={<InstructionSheet />} />
            <Route path="*" element={<Navigate to={WB_BASE} replace />} />
          </Routes>
        </main>

        <Finder open={finderOpen} onClose={closeFinder} />
        <AuthModal
          open={authOpen || Boolean(authError)}
          onClose={() => {
            setAuthOpen(false);
            clearAuthError();
          }}
        />
        {syncError && <div className="wb-sync-error" role="alert">Shop log could not sync: {syncError}</div>}
        <Toast
          message={toastMessage}
          visible={toastVisible}
          onDone={() => {
            setToastVisible(false);
            setToastMessage('');
          }}
        />
      </div>
    </WorkbenchContext.Provider>
  );
}
