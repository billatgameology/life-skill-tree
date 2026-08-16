import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  Feather,
  Leaf,
  Pin,
  Search,
  X,
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import Toast from '@/components/Toast';
import { ALL_SKILLS, CATEGORIES, SKILL_MAP, getChildren } from '@/data/skills';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import type { DomainKey, Skill } from '@/lib/types';
import {
  FIELD_BOOK_BASE,
  FIELD_CHAPTER_MAP,
  FIELD_CHAPTERS,
  adjacentObservations,
  findObservations,
  observationCode,
  type FieldChapter,
} from './fieldbookData';
import './fieldbook.css';

interface FieldbookState {
  completedIds: string[];
  favoriteIds: string[];
  completionDates: Record<string, string>;
  markObserved: (skillId: string) => boolean;
  togglePinned: (skillId: string) => boolean;
}

const FieldbookContext = createContext<FieldbookState | null>(null);

function useFieldbook(): FieldbookState {
  const value = useContext(FieldbookContext);
  if (!value) throw new Error('useFieldbook must be used inside FieldbookApp.');
  return value;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatFieldDate(isoDate: string | undefined): string {
  if (!isoDate) return 'Recorded';
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.valueOf())) return isoDate;
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function completionCount(skills: Skill[], completedIds: Set<string>): number {
  return skills.reduce((count, skill) => count + Number(completedIds.has(skill.id)), 0);
}

function ProgressLine({ value, total, light = false }: { value: number; total: number; light?: boolean }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div
      className={`fb-growth-line${light ? ' fb-growth-line--light' : ''}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={value}
      aria-label={`${value} of ${total} observations recorded`}
    >
      <span style={{ width: `${percentage}%` }} />
    </div>
  );
}

function activeDomainForPath(pathname: string): DomainKey | null {
  const chapterMatch = pathname.match(/\/chapter\/([^/]+)/);
  const chapterKey = chapterMatch?.[1];
  if (chapterKey && Object.prototype.hasOwnProperty.call(FIELD_CHAPTER_MAP, chapterKey)) {
    return chapterKey as DomainKey;
  }

  const noteMatch = pathname.match(/\/note\/([^/]+)/);
  const noteId = noteMatch?.[1];
  return noteId && Object.prototype.hasOwnProperty.call(SKILL_MAP, noteId)
    ? SKILL_MAP[noteId].domain
    : null;
}

function FieldbookMark({ skillId, compact = false }: { skillId: string; compact?: boolean }) {
  const { completionDates } = useFieldbook();
  return (
    <span className={`fb-field-mark${compact ? ' fb-field-mark--compact' : ''}`}>
      <Check aria-hidden="true" size={compact ? 11 : 15} strokeWidth={3} />
      <span>{compact ? 'Recorded' : formatFieldDate(completionDates[skillId])}</span>
    </span>
  );
}

function ChapterRail({ activeDomain }: { activeDomain: DomainKey | null }) {
  const { completedIds, favoriteIds } = useFieldbook();
  const completed = useMemo(() => new Set(completedIds), [completedIds]);

  return (
    <aside className="fb-rail" aria-label="Fieldbook chapters">
      <div className="fb-rail-top">
        <Link className="fb-gallery-link fb-gallery-link--rail" to="/">
          <ArrowLeft size={14} aria-hidden="true" /> Design gallery
        </Link>
        <Link className="fb-wordmark" to={FIELD_BOOK_BASE} aria-label="Fieldbook chapter index">
          <span className="fb-wordmark-seal"><Leaf size={21} aria-hidden="true" /></span>
          <span>
            <strong>Fieldbook</strong>
            <small>Practical observations</small>
          </span>
        </Link>

        <div className="fb-overall-log">
          <span className="fb-kicker fb-kicker--light">Field log</span>
          <p>
            <strong>{completed.size}</strong>
            <span> / {ALL_SKILLS.length} recorded</span>
          </p>
          <ProgressLine value={completed.size} total={ALL_SKILLS.length} light />
          <small>{favoriteIds.length} pinned specimen{favoriteIds.length === 1 ? '' : 's'}</small>
        </div>
      </div>

      <nav className="fb-chapter-list">
        <Link
          to={FIELD_BOOK_BASE}
          className={`fb-chapter-link fb-chapter-link--index${activeDomain === null ? ' is-active' : ''}`}
          aria-current={activeDomain === null ? 'page' : undefined}
        >
          <BookOpen size={17} aria-hidden="true" />
          <span>Chapter index</span>
        </Link>

        {FIELD_CHAPTERS.map((chapter) => {
          const count = completionCount(chapter.skills, completed);
          const active = chapter.domain === activeDomain;
          return (
            <Link
              key={chapter.domain}
              to={`${FIELD_BOOK_BASE}/chapter/${chapter.domain}`}
              className={`fb-chapter-link${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="fb-chapter-numeral">{chapter.numeral}</span>
              <span className="fb-chapter-link-copy">
                <strong>{chapter.name}</strong>
                <span>{count}/{chapter.skills.length}</span>
              </span>
              <span className="fb-rail-progress" aria-hidden="true">
                <span style={{ width: `${(count / chapter.skills.length) * 100}%` }} />
              </span>
            </Link>
          );
        })}
      </nav>
      <p className="fb-edition">FIELD EDITION · {ALL_SKILLS.length} NOTES</p>
    </aside>
  );
}

function MobileChapters({ activeDomain }: { activeDomain: DomainKey | null }) {
  return (
    <nav className="fb-mobile-chapters" aria-label="Fieldbook chapters">
      <Link
        to={FIELD_BOOK_BASE}
        className={`fb-mobile-tab${activeDomain === null ? ' is-active' : ''}`}
        aria-current={activeDomain === null ? 'page' : undefined}
      >
        Index
      </Link>
      {FIELD_CHAPTERS.map((chapter) => (
        <Link
          key={chapter.domain}
          to={`${FIELD_BOOK_BASE}/chapter/${chapter.domain}`}
          className={`fb-mobile-tab${activeDomain === chapter.domain ? ' is-active' : ''}`}
          aria-current={activeDomain === chapter.domain ? 'page' : undefined}
        >
          <span>{chapter.numeral}</span> {chapter.name}
        </Link>
      ))}
    </nav>
  );
}

function SearchResult({ skill, close }: { skill: Skill; close: () => void }) {
  const { completedIds, favoriteIds } = useFieldbook();
  const recorded = completedIds.includes(skill.id);
  const pinned = favoriteIds.includes(skill.id);
  return (
    <Link className="fb-search-result" to={`${FIELD_BOOK_BASE}/note/${skill.id}`} onClick={close}>
      <span className="fb-search-code">{observationCode(skill.id)}</span>
      <span className="fb-search-result-copy">
        <strong>{skill.title}</strong>
        <small>{CATEGORIES[skill.domain].name} · {skill.estimatedMinutes} min</small>
      </span>
      <span className="fb-search-flags" aria-label={`${recorded ? 'Recorded' : 'Not recorded'}${pinned ? ', pinned' : ''}`}>
        {pinned && <Pin size={13} aria-hidden="true" />}
        {recorded && <Check size={14} strokeWidth={3} aria-hidden="true" />}
      </span>
      <ChevronRight size={16} aria-hidden="true" />
    </Link>
  );
}

function JournalHeader({ activeDomain }: { activeDomain: DomainKey | null }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const results = useMemo(() => findObservations(query), [query]);
  const runningTitle = activeDomain ? FIELD_CHAPTER_MAP[activeDomain].name : 'Chapter index';

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
        inputRef.current?.focus();
        return;
      }
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const first = results[0];
    if (!first) return;
    setOpen(false);
    navigate(`${FIELD_BOOK_BASE}/note/${first.id}`);
  };

  return (
    <header className="fb-header">
      <div className="fb-mobile-brand">
        <Link className="fb-mobile-wordmark" to={FIELD_BOOK_BASE}>
          <Leaf size={18} aria-hidden="true" /> Fieldbook
        </Link>
        <Link className="fb-gallery-link" to="/">
          Gallery
        </Link>
      </div>

      <div className="fb-running-header" aria-hidden="true">
        <span>Life Skill Fieldbook</span>
        <i />
        <strong>{runningTitle}</strong>
      </div>

      <div className="fb-search-wrap">
        <form className="fb-search-form" role="search" onSubmit={submitSearch}>
          <Search size={18} aria-hidden="true" />
          <label className="fb-visually-hidden" htmlFor="fieldbook-search">Search every observation</label>
          <input
            id="fieldbook-search"
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(event.target.value.trim().length > 0);
            }}
            onFocus={() => setOpen(query.trim().length > 0)}
            placeholder="Find an observation…"
            autoComplete="off"
            aria-expanded={open}
            aria-controls="fieldbook-search-results"
          />
          <kbd aria-hidden="true">/</kbd>
          {query && (
            <button
              type="button"
              className="fb-search-clear"
              aria-label="Clear search"
              onClick={() => {
                setQuery('');
                setOpen(false);
                inputRef.current?.focus();
              }}
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </form>

        {open && (
          <div id="fieldbook-search-results" className="fb-search-panel" aria-live="polite">
            <div className="fb-search-panel-heading">
              <span>{results.length} observation{results.length === 1 ? '' : 's'} found</span>
              <button type="button" onClick={close}>Close</button>
            </div>
            <div className="fb-search-results">
              {results.length > 0 ? (
                results.map((skill) => <SearchResult key={skill.id} skill={skill} close={close} />)
              ) : (
                <p className="fb-search-empty">No field notes match “{query}”. Try a task, domain, or keyword.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function ChapterCard({ chapter }: { chapter: FieldChapter }) {
  const { completedIds } = useFieldbook();
  const completed = useMemo(() => new Set(completedIds), [completedIds]);
  const count = completionCount(chapter.skills, completed);

  return (
    <Link className="fb-index-card" to={`${FIELD_BOOK_BASE}/chapter/${chapter.domain}`}>
      <span className="fb-index-card-number">Chapter {chapter.numeral}</span>
      <span className="fb-index-card-icon" aria-hidden="true">{chapter.icon}</span>
      <h2>{chapter.name}</h2>
      <p>{chapter.description}</p>
      <div className="fb-index-card-log">
        <span>{count} of {chapter.skills.length} recorded</span>
        <span>{chapter.skills.length} notes <ArrowRight size={14} aria-hidden="true" /></span>
      </div>
      <ProgressLine value={count} total={chapter.skills.length} />
    </Link>
  );
}

function PinnedStrip() {
  const { favoriteIds } = useFieldbook();
  const pinned = favoriteIds
    .map((id) => Object.prototype.hasOwnProperty.call(SKILL_MAP, id) ? SKILL_MAP[id] : undefined)
    .filter((skill) => skill !== undefined);
  if (pinned.length === 0) return null;

  return (
    <section className="fb-pinned-strip" aria-labelledby="pinned-specimens-heading">
      <div className="fb-section-heading fb-section-heading--compact">
        <span className="fb-kicker">Pinned specimens</span>
        <h2 id="pinned-specimens-heading">Notes kept close at hand</h2>
      </div>
      <div className="fb-pinned-list">
        {pinned.map((skill) => (
          <Link key={skill.id} to={`${FIELD_BOOK_BASE}/note/${skill.id}`}>
            <Pin size={15} aria-hidden="true" />
            <span>
              <strong>{skill.title}</strong>
              <small>{observationCode(skill.id)} · {CATEGORIES[skill.domain].name}</small>
            </span>
            <ChevronRight size={15} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function ChapterIndex() {
  const { completedIds } = useFieldbook();
  const completed = new Set(completedIds);
  const percent = Math.round((completed.size / ALL_SKILLS.length) * 100);

  return (
    <div className="fb-page fb-index-page">
      <section className="fb-index-hero">
        <div>
          <span className="fb-kicker">Volume I · Everyday practice</span>
          <h1>A fieldbook for the things life asks you to know.</h1>
          <p>
            Open a chapter, choose one useful observation, and try it in the world.
            Every note is short enough to begin today.
          </p>
        </div>
        <div className="fb-hero-log" aria-label={`Overall progress: ${completed.size} of ${ALL_SKILLS.length}`}>
          <span className="fb-handwritten">your field log</span>
          <strong>{completed.size}<small> / {ALL_SKILLS.length}</small></strong>
          <p>{percent}% of observations recorded</p>
          <ProgressLine value={completed.size} total={ALL_SKILLS.length} />
          <Leaf className="fb-hero-leaf" size={43} aria-hidden="true" />
        </div>
      </section>

      <PinnedStrip />

      <section aria-labelledby="chapter-index-heading">
        <div className="fb-section-heading">
          <span className="fb-kicker">Contents</span>
          <h2 id="chapter-index-heading">Fifteen chapters of practical knowledge</h2>
          <p>{ALL_SKILLS.length} observations, arranged to keep the whole collection easy to browse.</p>
        </div>
        <div className="fb-index-grid">
          {FIELD_CHAPTERS.map((chapter) => <ChapterCard key={chapter.domain} chapter={chapter} />)}
        </div>
      </section>
    </div>
  );
}

function FavoriteButton({ skill, labeled = false }: { skill: Skill; labeled?: boolean }) {
  const { favoriteIds, togglePinned } = useFieldbook();
  const pinned = favoriteIds.includes(skill.id);
  return (
    <button
      type="button"
      className={`fb-pin-button${pinned ? ' is-pinned' : ''}${labeled ? ' fb-pin-button--labeled' : ''}`}
      onClick={() => togglePinned(skill.id)}
      aria-pressed={pinned}
      aria-label={pinned ? `Unpin ${skill.title}` : `Pin ${skill.title}`}
      title={pinned ? 'Remove pinned specimen' : 'Pin this specimen'}
    >
      <Pin size={17} fill={pinned ? 'currentColor' : 'none'} aria-hidden="true" />
      {labeled && <span>{pinned ? 'Pinned specimen' : 'Pin this note'}</span>}
    </button>
  );
}

function ObservationCard({ skill }: { skill: Skill }) {
  const { completedIds } = useFieldbook();
  const recorded = completedIds.includes(skill.id);
  return (
    <article className={`fb-observation-card${recorded ? ' is-recorded' : ''}`}>
      <div className="fb-card-topline">
        <span>Observation {observationCode(skill.id)}</span>
        <FavoriteButton skill={skill} />
      </div>
      <Link className="fb-observation-link" to={`${FIELD_BOOK_BASE}/note/${skill.id}`}>
        <h2>{skill.title}</h2>
        <p>{skill.summary}</p>
        <div className="fb-card-meta">
          <span>Level {skill.level}</span>
          <span>{titleCase(skill.difficulty)}</span>
          <span><Clock3 size={13} aria-hidden="true" /> {skill.estimatedMinutes} min</span>
        </div>
        <span className="fb-read-note">Read field note <ArrowRight size={14} aria-hidden="true" /></span>
      </Link>
      {recorded && <FieldbookMark skillId={skill.id} compact />}
    </article>
  );
}

function ChapterPage() {
  const { domain } = useParams();
  const chapter = domain && Object.prototype.hasOwnProperty.call(FIELD_CHAPTER_MAP, domain)
    ? FIELD_CHAPTER_MAP[domain as DomainKey]
    : null;
  const { completedIds, favoriteIds } = useFieldbook();
  const [pinnedOnly, setPinnedOnly] = useState(false);

  if (!chapter) return <Navigate to={FIELD_BOOK_BASE} replace />;

  const completed = new Set(completedIds);
  const count = completionCount(chapter.skills, completed);
  const visibleSkills = pinnedOnly
    ? chapter.skills.filter((skill) => favoriteIds.includes(skill.id))
    : chapter.skills;
  const chapterIndex = FIELD_CHAPTERS.findIndex((candidate) => candidate.domain === chapter.domain);
  const previousChapter = chapterIndex > 0 ? FIELD_CHAPTERS[chapterIndex - 1] ?? null : null;
  const nextChapter = FIELD_CHAPTERS[chapterIndex + 1] ?? null;

  return (
    <div className="fb-page fb-chapter-page">
      <header className="fb-chapter-heading">
        <div className="fb-chapter-heading-copy">
          <span className="fb-kicker">Chapter {chapter.numeral}</span>
          <span className="fb-chapter-emoji" aria-hidden="true">{chapter.icon}</span>
          <h1>{chapter.name}</h1>
          <p>{chapter.description}</p>
        </div>
        <div className="fb-chapter-log">
          <span className="fb-handwritten">chapter field marks</span>
          <p><strong>{count}</strong> / {chapter.skills.length}</p>
          <ProgressLine value={count} total={chapter.skills.length} />
        </div>
      </header>

      <div className="fb-folio-toolbar">
        <p><strong>{visibleSkills.length}</strong> observation{visibleSkills.length === 1 ? '' : 's'} in this folio</p>
        <div className="fb-filter-group" aria-label="Filter chapter observations">
          <button type="button" className={!pinnedOnly ? 'is-active' : ''} onClick={() => setPinnedOnly(false)}>
            All notes
          </button>
          <button type="button" className={pinnedOnly ? 'is-active' : ''} onClick={() => setPinnedOnly(true)}>
            <Pin size={14} aria-hidden="true" /> Pinned
          </button>
        </div>
      </div>

      {visibleSkills.length > 0 ? (
        <div className="fb-folio-grid">
          {visibleSkills.map((skill) => <ObservationCard key={skill.id} skill={skill} />)}
        </div>
      ) : (
        <div className="fb-empty-folio">
          <Pin size={25} aria-hidden="true" />
          <h2>No pinned specimens in this chapter yet.</h2>
          <p>Pin an observation to keep it close at hand.</p>
          <button type="button" onClick={() => setPinnedOnly(false)}>Show every note</button>
        </div>
      )}

      <nav className="fb-chapter-pagination" aria-label="Adjacent chapters">
        {previousChapter ? (
          <Link to={`${FIELD_BOOK_BASE}/chapter/${previousChapter.domain}`}>
            <ArrowLeft size={15} aria-hidden="true" />
            <span><small>Previous chapter</small>{previousChapter.name}</span>
          </Link>
        ) : <span />}
        {nextChapter && (
          <Link to={`${FIELD_BOOK_BASE}/chapter/${nextChapter.domain}`}>
            <span><small>Next chapter</small>{nextChapter.name}</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        )}
      </nav>
    </div>
  );
}

function NoteSection({
  number,
  title,
  children,
  className = '',
}: {
  number: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`fb-note-section ${className}`}>
      <div className="fb-note-section-heading">
        <span>{number}</span>
        <h2>{title}</h2>
        <i aria-hidden="true" />
      </div>
      {children}
    </section>
  );
}

function ObservationConnections({ title, skills, empty }: { title: string; skills: Skill[]; empty: string }) {
  return (
    <div className="fb-connections-group">
      <h3>{title}</h3>
      {skills.length > 0 ? (
        <div className="fb-connection-list">
          {skills.map((skill) => (
            <Link key={skill.id} to={`${FIELD_BOOK_BASE}/note/${skill.id}`}>
              <span>{observationCode(skill.id)}</span>
              <strong>{skill.title}</strong>
              <small>{CATEGORIES[skill.domain].name}</small>
              <ChevronRight size={15} aria-hidden="true" />
            </Link>
          ))}
        </div>
      ) : <p className="fb-quiet-note">{empty}</p>}
    </div>
  );
}

function FieldNotePage() {
  const { skillId } = useParams();
  const skill = skillId && Object.prototype.hasOwnProperty.call(SKILL_MAP, skillId)
    ? SKILL_MAP[skillId]
    : undefined;
  const { completedIds, markObserved } = useFieldbook();
  const [evidenceState, setEvidenceState] = useState<{ skillId: string; checked: number[] }>({
    skillId: '',
    checked: [],
  });
  const [newlyRecorded, setNewlyRecorded] = useState<string | null>(null);

  if (!skill) return <Navigate to={FIELD_BOOK_BASE} replace />;

  const chapter = FIELD_CHAPTER_MAP[skill.domain];
  const recorded = completedIds.includes(skill.id);
  const prerequisites = skill.suggestedPrerequisites
    .map((id) => SKILL_MAP[id])
    .filter((candidate) => candidate !== undefined);
  const dependents = getChildren(skill.id);
  const { previous, next } = adjacentObservations(skill);
  const checked = evidenceState.skillId === skill.id ? evidenceState.checked : [];

  const toggleEvidence = (index: number) => {
    setEvidenceState((current) => {
      const currentChecked = current.skillId === skill.id ? current.checked : [];
      return {
        skillId: skill.id,
        checked: currentChecked.includes(index)
          ? currentChecked.filter((item) => item !== index)
          : [...currentChecked, index],
      };
    });
  };

  const handleRecord = () => {
    if (recorded) return;
    if (markObserved(skill.id)) setNewlyRecorded(skill.id);
  };

  return (
    <div className="fb-page fb-note-page">
      <Link className="fb-back-to-chapter" to={`${FIELD_BOOK_BASE}/chapter/${skill.domain}`}>
        <ArrowLeft size={15} aria-hidden="true" /> Chapter {chapter.numeral}: {chapter.name}
      </Link>

      <header className="fb-note-hero">
        <div className="fb-note-hero-copy">
          <span className="fb-kicker">Field note · Observation {observationCode(skill.id)}</span>
          <h1>{skill.title}</h1>
          <p className="fb-note-summary">{skill.summary}</p>
          <blockquote>
            <Feather size={18} aria-hidden="true" />
            <span><small>What you’ll be able to do</small>{skill.learnerPromise}</span>
          </blockquote>
          <div className="fb-note-actions">
            {recorded ? (
              <FieldbookMark skillId={skill.id} />
            ) : (
              <button type="button" className="fb-record-button" onClick={handleRecord}>
                <CircleCheck size={18} aria-hidden="true" /> Record this observation
              </button>
            )}
            <FavoriteButton skill={skill} labeled />
          </div>
        </div>
        <div className="fb-specimen-drawing" aria-hidden="true">
          <Leaf size={88} strokeWidth={0.8} />
          <span>{chapter.icon}</span>
          <i>FIG. {chapter.number}</i>
        </div>
        {newlyRecorded === skill.id && <span className="fb-fresh-mark">FIELD MARK ADDED</span>}
      </header>

      <div className="fb-note-layout">
        <aside className="fb-margin-notes" aria-label="Observation metadata">
          <span className="fb-handwritten">margin record</span>
          <dl>
            <div><dt>Chapter</dt><dd>{chapter.numeral} · {chapter.name}</dd></div>
            <div><dt>Difficulty</dt><dd>{titleCase(skill.difficulty)}</dd></div>
            <div><dt>Time in field</dt><dd>{skill.estimatedMinutes} minutes</dd></div>
            <div><dt>Sequence</dt><dd>Level {skill.level}</dd></div>
            <div><dt>Evidence</dt><dd>{skill.completionCriteria.length} checks</dd></div>
          </dl>
          <div className="fb-margin-progress">
            <span>{checked.length} / {skill.completionCriteria.length} evidence checks</span>
            <ProgressLine value={checked.length} total={skill.completionCriteria.length} />
          </div>
          <p className="fb-pencil-note">Ticking evidence here is a temporary field checklist. “Record this observation” saves progress to your account.</p>
        </aside>

        <article className="fb-note-body">
          <NoteSection number="01" title="Why it matters">
            <p className="fb-prose-lead">{skill.whyItMatters}</p>
            <h3>Where you might use it</h3>
            <ul className="fb-botanical-list">
              {skill.realLifeUses.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </NoteSection>

          <NoteSection number="02" title="What to notice">
            <ul className="fb-learning-list">
              {skill.youWillLearn.map((item, index) => (
                <li key={item}><span>{String(index + 1).padStart(2, '0')}</span>{item}</li>
              ))}
            </ul>
          </NoteSection>

          <NoteSection number="03" title="Field exercise" className="fb-challenge-section">
            <div className="fb-challenge-card">
              <span className="fb-handwritten">mini challenge</span>
              <p>{skill.miniChallenge}</p>
            </div>
          </NoteSection>

          <NoteSection number="04" title="Method, step by step">
            <ol className="fb-procedure-list">
              {skill.steps.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </NoteSection>

          <NoteSection number="05" title="Evidence of a good result">
            <p className="fb-section-intro">Check each sign when you can see it in your own attempt.</p>
            <div className="fb-evidence-list">
              {skill.completionCriteria.map((criterion, index) => {
                const isChecked = checked.includes(index);
                return (
                  <label key={criterion} className={isChecked ? 'is-checked' : ''}>
                    <input type="checkbox" checked={isChecked} onChange={() => toggleEvidence(index)} />
                    <span className="fb-custom-check"><Check size={14} strokeWidth={3} aria-hidden="true" /></span>
                    <span>{criterion}</span>
                  </label>
                );
              })}
            </div>
            {!recorded && (
              <button type="button" className="fb-record-button fb-record-button--lower" onClick={handleRecord}>
                <CircleCheck size={18} aria-hidden="true" /> Record this observation
              </button>
            )}
          </NoteSection>

          <NoteSection number="06" title="When the result looks different">
            {skill.commonProblems && skill.commonProblems.length > 0 ? (
              <ul className="fb-problem-list">
                {skill.commonProblems.map((problem) => <li key={problem}>{problem}</li>)}
              </ul>
            ) : (
              <p className="fb-quiet-note">No common problems have been noted for this observation.</p>
            )}
          </NoteSection>

          <NoteSection number="07" title="Notes from the margin">
            {skill.tips && skill.tips.length > 0 ? (
              <div className="fb-tip-stack">
                {skill.tips.map((tip, index) => (
                  <p key={tip}><span>Note {index + 1}</span>{tip}</p>
                ))}
              </div>
            ) : (
              <p className="fb-quiet-note">No additional margin notes are needed.</p>
            )}
          </NoteSection>

          <NoteSection number="08" title="Related observations">
            <div className="fb-connections-grid">
              <ObservationConnections
                title="Builds on"
                skills={prerequisites}
                empty="This note can be started without an earlier observation."
              />
              <ObservationConnections
                title="Leads to"
                skills={dependents}
                empty="No later observations currently depend on this note."
              />
            </div>
          </NoteSection>
        </article>
      </div>

      <nav className="fb-note-pagination" aria-label="Adjacent observations">
        {previous ? (
          <Link to={`${FIELD_BOOK_BASE}/note/${previous.id}`}>
            <ArrowLeft size={17} aria-hidden="true" />
            <span><small>Previous observation</small>{previous.title}</span>
          </Link>
        ) : <span />}
        {next && (
          <Link to={`${FIELD_BOOK_BASE}/note/${next.id}`}>
            <span><small>Next observation</small>{next.title}</span>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        )}
      </nav>
    </div>
  );
}

/**
 * Design #3 — Fieldbook. A sun-faded naturalist's journal where domains are
 * chapters, skills are observations, completions are field marks, and saved
 * skills are pinned specimens.
 */
export default function FieldbookApp() {
  const { authError, clearAuthError } = useAuth();
  const { user, loaded, syncError, completeSkill, toggleFavorite, completionDates } = useUserData();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const markObserved = useCallback((skillId: string): boolean => {
    const saved = completeSkill(skillId);
    if (!saved) {
      setAuthOpen(true);
      showToast('Sign in to save your field marks.');
      return false;
    }
    showToast('Observation added to your field log.');
    return true;
  }, [completeSkill, showToast]);

  const completedIds = useMemo(() => user?.completedSkillIds ?? [], [user?.completedSkillIds]);
  const favoriteIds = useMemo(() => user?.favorite ?? [], [user?.favorite]);
  const togglePinned = useCallback((skillId: string): boolean => {
    const wasPinned = favoriteIds.includes(skillId);
    const saved = toggleFavorite(skillId);
    if (!saved) {
      setAuthOpen(true);
      showToast('Sign in to pin this specimen.');
      return false;
    }
    showToast(wasPinned ? 'Specimen unpinned.' : 'Specimen pinned for later.');
    return true;
  }, [favoriteIds, showToast, toggleFavorite]);

  const contextValue = useMemo<FieldbookState>(() => ({
    completedIds,
    favoriteIds,
    completionDates,
    markObserved,
    togglePinned,
  }), [completedIds, favoriteIds, completionDates, markObserved, togglePinned]);

  const activeDomain = activeDomainForPath(location.pathname);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  if (!loaded) {
    return (
      <div className="fb-root fb-loading">
        <Leaf size={28} aria-hidden="true" />
        <p>Opening the fieldbook…</p>
      </div>
    );
  }

  return (
    <FieldbookContext.Provider value={contextValue}>
      <div className="fb-root">
        <ChapterRail activeDomain={activeDomain} />
        <div className="fb-shell">
          <JournalHeader activeDomain={activeDomain} />
          <MobileChapters activeDomain={activeDomain} />
          <main ref={mainRef} className="fb-main">
            <Routes>
              <Route index element={<ChapterIndex />} />
              <Route path="chapter/:domain" element={<ChapterPage />} />
              <Route path="note/:skillId" element={<FieldNotePage />} />
              <Route path="*" element={<Navigate to={FIELD_BOOK_BASE} replace />} />
            </Routes>
          </main>
        </div>

        <AuthModal
          open={authOpen || Boolean(authError)}
          onClose={() => {
            setAuthOpen(false);
            clearAuthError();
          }}
        />

        {syncError && (
          <div className="fb-sync-error" role="status">Field log sync failed: {syncError}</div>
        )}

        <Toast
          message={toastMessage}
          visible={toastVisible}
          onDone={() => {
            setToastVisible(false);
            setToastMessage('');
          }}
        />
      </div>
    </FieldbookContext.Provider>
  );
}
