import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock,
  Gauge,
  Lightbulb,
  ListChecks,
  Radio,
  Search,
  Star,
  X,
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import Toast from '@/components/Toast';
import { ALL_SKILLS } from '@/data/skills';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import type { DomainKey, Skill } from '@/lib/types';
import {
  BAND_MAP,
  BANDS,
  BROADCASTS,
  SHORTWAVE_BASE,
  adjacentBroadcasts,
  daypartFor,
  dependentBroadcasts,
  groupByDaypart,
  prerequisiteBroadcasts,
  type BroadcastInfo,
  type FrequencyBand,
} from './radioData';
import './shortwave.css';

const SHORTWAVE_THEME = {
  '--sw-apricot': '#FFCA8A',
  '--sw-aubergine': '#3A1747',
  '--sw-cyan': '#45D5E8',
  '--sw-tomato': '#F05D4D',
  '--sw-cream': '#FFF7E8',
  '--sw-gold': '#E7A839',
  '--sw-ink-muted': '#715B6B',
  '--sw-panel': '#FFE8C6',
  '--sw-white': '#FFFCF7',
} as CSSProperties;

interface ShortwaveState {
  completedIds: Set<string>;
  presetIds: Set<string>;
  completionDates: Record<string, string>;
  logReception: (skillId: string) => boolean;
  togglePreset: (skillId: string) => boolean;
  openScanner: () => void;
  notify: (message: string) => void;
}

const ShortwaveContext = createContext<ShortwaveState | null>(null);

function useShortwave() {
  const value = useContext(ShortwaveContext);
  if (!value) throw new Error('Shortwave components must be inside ShortwaveContext.');
  return value;
}

function countComplete(skills: Skill[], completedIds: Set<string>) {
  return skills.reduce((count, skill) => count + (completedIds.has(skill.id) ? 1 : 0), 0);
}

function percentage(part: number, whole: number) {
  if (whole === 0) return 0;
  return Math.round((part / whole) * 100);
}

function Header() {
  const { completedIds, openScanner } = useShortwave();
  const complete = completedIds.size;
  const progress = percentage(complete, ALL_SKILLS.length);

  return (
    <header className="sw-header">
      <Link to="/" className="sw-gallery-link" aria-label="Back to design gallery">
        <ChevronLeft aria-hidden="true" />
        <span>Design gallery</span>
      </Link>

      <Link to={SHORTWAVE_BASE} className="sw-wordmark" aria-label="Shortwave home">
        <span className="sw-wordmark-icon"><Radio aria-hidden="true" /></span>
        <span>
          <strong>Shortwave</strong>
          <small>Life skills on your wavelength</small>
        </span>
      </Link>

      <div className="sw-header-actions">
        <div className="sw-header-progress" title={`${complete} of ${ALL_SKILLS.length} broadcasts logged`}>
          <span><CircleDot aria-hidden="true" /> {progress}% received</span>
          <span className="sw-header-progress-track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </span>
        </div>
        <button type="button" className="sw-scan-button" onClick={openScanner}>
          <Search aria-hidden="true" />
          <span>Scan all</span>
          <kbd>/</kbd>
        </button>
      </div>
    </header>
  );
}

function FrequencyDial({ activeBand }: { activeBand: FrequencyBand }) {
  const { completedIds } = useShortwave();
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeBand.domain]);

  return (
    <section className="sw-dial-shell" aria-labelledby="sw-dial-title">
      <div className="sw-dial-heading">
        <div>
          <p className="sw-kicker">FM life-skill service · 15 clear bands</p>
          <h1 id="sw-dial-title">Tune your day</h1>
        </div>
        <p>Slide the dial and choose a frequency band.</p>
      </div>

      <div className="sw-dial-window">
        <div className="sw-dial-ticks" aria-hidden="true" />
        <nav className="sw-band-strip" aria-label="Skill frequency bands">
          {BANDS.map((band) => {
            const complete = countComplete(band.skills, completedIds);
            const progress = percentage(complete, band.skills.length);
            const active = band.domain === activeBand.domain;
            return (
              <Link
                ref={active ? activeRef : undefined}
                key={band.domain}
                to={`${SHORTWAVE_BASE}/band/${band.domain}`}
                className={`sw-band ${active ? 'is-active' : ''}`}
                style={{ '--sw-band': band.accent } as CSSProperties}
                aria-current={active ? 'page' : undefined}
                aria-label={`${band.frequency} FM, ${band.name}, ${complete} of ${band.skills.length} logged`}
              >
                <span className="sw-band-frequency">{band.frequency}</span>
                <span className="sw-band-unit">FM</span>
                <span className="sw-band-name">{band.name}</span>
                <span className="sw-band-segments" aria-hidden="true">
                  <span style={{ width: `${progress}%` }} />
                </span>
                <small>{complete}/{band.skills.length} received</small>
              </Link>
            );
          })}
        </nav>
        <div className="sw-dial-needle" aria-hidden="true"><span /></div>
      </div>
    </section>
  );
}

function PresetButton({ skillId, compact = false }: { skillId: string; compact?: boolean }) {
  const { presetIds, togglePreset } = useShortwave();
  const saved = presetIds.has(skillId);

  return (
    <button
      type="button"
      className={`sw-preset-button ${saved ? 'is-saved' : ''} ${compact ? 'is-compact' : ''}`}
      onClick={() => togglePreset(skillId)}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from presets' : 'Save as preset'}
      title={saved ? 'Remove from presets' : 'Save as preset'}
    >
      <Star aria-hidden="true" />
      {!compact && <span>{saved ? 'Preset saved' : 'Save preset'}</span>}
    </button>
  );
}

function BroadcastCard({ skill, showBand = false }: { skill: Skill; showBand?: boolean }) {
  const { completedIds } = useShortwave();
  const info = BROADCASTS[skill.id];
  const logged = completedIds.has(skill.id);

  return (
    <article
      className={`sw-broadcast-card ${logged ? 'is-logged' : ''}`}
      style={{ '--sw-band': info.band.accent } as CSSProperties}
    >
      <Link to={`${SHORTWAVE_BASE}/transmission/${skill.id}`} className="sw-broadcast-main">
        <span className="sw-broadcast-status" aria-hidden="true">
          {logged ? <Check /> : <span />}
        </span>
        <span className="sw-broadcast-copy">
          <span className="sw-broadcast-meta">
            <b>{info.code}</b>
            {showBand && <span>{info.band.frequency} FM · {info.band.name}</span>}
            <span>{skill.estimatedMinutes} min</span>
            <span>{skill.difficulty}</span>
          </span>
          <strong className="sw-broadcast-title">{skill.title}</strong>
          <span className="sw-broadcast-summary">{skill.summary}</span>
        </span>
        <span className="sw-open-broadcast">
          <span>Open log</span><ChevronRight aria-hidden="true" />
        </span>
      </Link>
      <PresetButton skillId={skill.id} compact />
    </article>
  );
}

function BroadcastSchedule({ skills, showBands = false }: { skills: Skill[]; showBands?: boolean }) {
  const groups = groupByDaypart(skills);

  return (
    <div className="sw-schedule-groups">
      {groups.map((group) => (
        <section key={group.level} className="sw-daypart">
          <header className="sw-daypart-header">
            <span className="sw-daypart-time">{group.time}</span>
            <div>
              <h3>{group.name}</h3>
              <p>{group.note} · {group.broadcasts.length} {group.broadcasts.length === 1 ? 'broadcast' : 'broadcasts'}</p>
            </div>
            <span className="sw-daypart-level">Level {group.level}</span>
          </header>
          <div className="sw-broadcast-list">
            {group.broadcasts.map((skill) => (
              <BroadcastCard key={skill.id} skill={skill} showBand={showBands} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SignalMeter({ value, label }: { value: number; label: string }) {
  const bars = 12;
  const lit = Math.round((value / 100) * bars);
  return (
    <div className="sw-signal-meter" aria-label={`${label}: ${value}%`}>
      <div className="sw-signal-bars" aria-hidden="true">
        {Array.from({ length: bars }, (_, index) => (
          <span
            key={index}
            className={index < lit ? 'is-lit' : ''}
            style={{ height: `${26 + index * 4}px` }}
          />
        ))}
      </div>
      <div className="sw-signal-value"><strong>{value}</strong><span>%</span></div>
      <p>{label}</p>
    </div>
  );
}

function ReceiverReadout({ band }: { band: FrequencyBand }) {
  const { completedIds, presetIds } = useShortwave();
  const overallComplete = completedIds.size;
  const bandComplete = countComplete(band.skills, completedIds);
  const overallProgress = percentage(overallComplete, ALL_SKILLS.length);
  const bandProgress = percentage(bandComplete, band.skills.length);
  const nextBroadcast = band.skills.find((skill) => !completedIds.has(skill.id));

  return (
    <aside className="sw-readout" style={{ '--sw-band': band.accent } as CSSProperties}>
      <div className="sw-readout-screen">
        <div className="sw-on-air-line"><span /> RECEIVER STATUS</div>
        <SignalMeter value={overallProgress} label="Overall reception" />
        <dl className="sw-readout-stats">
          <div><dt>Logged</dt><dd>{overallComplete}<small> / {ALL_SKILLS.length}</small></dd></div>
          <div><dt>Presets</dt><dd>{presetIds.size}</dd></div>
        </dl>
      </div>

      <section className="sw-band-readout">
        <p className="sw-kicker">Now tuned</p>
        <div className="sw-now-frequency"><strong>{band.frequency}</strong><span>FM</span></div>
        <h2>{band.name}</h2>
        <div className="sw-band-progress-copy">
          <span>Band signal</span><b>{bandComplete} of {band.skills.length}</b>
        </div>
        <div className="sw-band-progress-track" aria-label={`${bandProgress}% of ${band.name} complete`}>
          <span style={{ width: `${bandProgress}%` }} />
        </div>
        <p className="sw-mobile-overall">
          <span>Overall reception</span>
          <strong>{overallComplete} / {ALL_SKILLS.length} · {overallProgress}%</strong>
        </p>
      </section>

      <section className="sw-up-next">
        <p className="sw-kicker">Suggested next broadcast</p>
        {nextBroadcast ? (
          <Link to={`${SHORTWAVE_BASE}/transmission/${nextBroadcast.id}`}>
            <span>{BROADCASTS[nextBroadcast.id].code}</span>
            <strong>{nextBroadcast.title}</strong>
            <small>{daypartFor(nextBroadcast.level).name} · {nextBroadcast.estimatedMinutes} min</small>
            <ChevronRight aria-hidden="true" />
          </Link>
        ) : (
          <p className="sw-clear-band">Every broadcast on this band is logged. Clear signal!</p>
        )}
      </section>

      <div className="sw-readout-note">
        <Gauge aria-hidden="true" />
        <p><strong>No scores, no static.</strong> This receiver only tracks what you complete and what you want to hear again.</p>
      </div>
    </aside>
  );
}

function EmptyPresets({ onShowAll }: { onShowAll: () => void }) {
  return (
    <div className="sw-empty-presets">
      <span><Star aria-hidden="true" /></span>
      <h3>Your preset bank is quiet</h3>
      <p>Tap the star beside any broadcast to keep it close at hand.</p>
      <button type="button" onClick={onShowAll}>Return to the tuned band</button>
    </div>
  );
}

function SchedulePage() {
  const { domain } = useParams();
  const { presetIds, openScanner } = useShortwave();
  const [showPresets, setShowPresets] = useState(false);
  const activeBand = domain && Object.prototype.hasOwnProperty.call(BAND_MAP, domain)
    ? BAND_MAP[domain as DomainKey]
    : null;

  if (!activeBand) return <Navigate to={`${SHORTWAVE_BASE}/band/${BANDS[0].domain}`} replace />;

  const presetSkills = ALL_SKILLS.filter((skill) => presetIds.has(skill.id));
  const scheduledSkills = showPresets ? presetSkills : activeBand.skills;

  return (
    <div className="sw-page sw-schedule-page">
      <FrequencyDial activeBand={activeBand} />

      <div className="sw-console">
        <section className="sw-program-panel" style={{ '--sw-band': activeBand.accent } as CSSProperties}>
          <header className="sw-program-header">
            <div>
              <p className="sw-kicker">{showPresets ? 'Preset bank · all frequencies' : `${activeBand.frequency} FM · ${activeBand.code} band`}</p>
              <h2>{showPresets ? 'Saved broadcasts' : `${activeBand.name} schedule`}</h2>
              <p>
                {showPresets
                  ? `${presetSkills.length} ${presetSkills.length === 1 ? 'broadcast is' : 'broadcasts are'} ready for replay.`
                  : `${activeBand.skills.length} broadcasts, organized by daypart and learning level.`}
              </p>
            </div>
            <div className="sw-filter-switch" role="group" aria-label="Schedule filter">
              <button
                type="button"
                className={!showPresets ? 'is-active' : ''}
                onClick={() => setShowPresets(false)}
                aria-pressed={!showPresets}
              >
                <Radio aria-hidden="true" /> Band
              </button>
              <button
                type="button"
                className={showPresets ? 'is-active' : ''}
                onClick={() => setShowPresets(true)}
                aria-pressed={showPresets}
              >
                <Star aria-hidden="true" /> Presets
              </button>
            </div>
          </header>

          {scheduledSkills.length > 0 ? (
            <BroadcastSchedule skills={scheduledSkills} showBands={showPresets} />
          ) : (
            <EmptyPresets onShowAll={() => setShowPresets(false)} />
          )}
        </section>

        <ReceiverReadout band={activeBand} />
      </div>

      <div className="sw-mobile-controls" aria-label="Shortwave quick controls">
        <button type="button" onClick={openScanner}><Search aria-hidden="true" /> Scan all</button>
        <button
          type="button"
          onClick={() => setShowPresets((current) => !current)}
          className={showPresets ? 'is-active' : ''}
          aria-pressed={showPresets}
        >
          <Star aria-hidden="true" /> Presets {presetSkills.length > 0 && <span>{presetSkills.length}</span>}
        </button>
      </div>
    </div>
  );
}

function DetailSection({ icon, title, children, className = '' }: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`sw-log-section ${className}`}>
      <header><span>{icon}</span><h2>{title}</h2></header>
      <div className="sw-log-section-body">{children}</div>
    </section>
  );
}

function ConnectionCard({ info, relation }: { info: BroadcastInfo; relation: string }) {
  const { completedIds } = useShortwave();
  const logged = completedIds.has(info.skill.id);
  return (
    <Link
      to={`${SHORTWAVE_BASE}/transmission/${info.skill.id}`}
      className="sw-connection-card"
      style={{ '--sw-band': info.band.accent } as CSSProperties}
    >
      <span className="sw-connection-dot">{logged ? <Check aria-hidden="true" /> : <Radio aria-hidden="true" />}</span>
      <span>
        <small>{relation} · {info.band.frequency} FM · {info.code}</small>
        <strong>{info.skill.title}</strong>
      </span>
      <ChevronRight aria-hidden="true" />
    </Link>
  );
}

function TransmissionDetailBody({ info }: { info: BroadcastInfo }) {
  const { completedIds, completionDates, logReception, notify } = useShortwave();
  const { skill, band } = info;
  const [checkedCriteria, setCheckedCriteria] = useState<boolean[]>(() => skill.completionCriteria.map(() => false));
  const [justLogged, setJustLogged] = useState(false);
  const logged = completedIds.has(skill.id);
  const prerequisites = prerequisiteBroadcasts(skill);
  const dependents = dependentBroadcasts(skill);
  const { previous, next } = adjacentBroadcasts(skill.id);
  const daypart = daypartFor(skill.level);
  const bandComplete = countComplete(band.skills, completedIds);
  const allCriteriaChecked = checkedCriteria.length > 0 && checkedCriteria.every(Boolean);

  const handleLog = () => {
    if (logged) return;
    if (logReception(skill.id)) {
      setJustLogged(true);
      notify('Reception logged. Nicely done.');
    }
  };

  return (
    <article className="sw-detail-page" style={{ '--sw-band': band.accent } as CSSProperties}>
      <nav className="sw-detail-nav" aria-label="Transmission navigation">
        <Link to={`${SHORTWAVE_BASE}/band/${band.domain}`} className="sw-back-band">
          <ArrowLeft aria-hidden="true" /> <span>{band.frequency} FM · {band.name}</span>
        </Link>
        <div>
          {previous ? (
            <Link to={`${SHORTWAVE_BASE}/transmission/${previous.skill.id}`} aria-label={`Previous broadcast: ${previous.skill.title}`}>
              <ChevronLeft aria-hidden="true" /><span>Previous</span>
            </Link>
          ) : <span className="sw-disabled"><ChevronLeft aria-hidden="true" /><span>Previous</span></span>}
          {next ? (
            <Link to={`${SHORTWAVE_BASE}/transmission/${next.skill.id}`} aria-label={`Next broadcast: ${next.skill.title}`}>
              <span>Next</span><ChevronRight aria-hidden="true" />
            </Link>
          ) : <span className="sw-disabled"><span>Next</span><ChevronRight aria-hidden="true" /></span>}
        </div>
      </nav>

      <div className="sw-detail-wrap">
        <header className="sw-transmission-hero">
          <div className="sw-on-air-badge"><span /> ON AIR</div>
          <div className="sw-hero-grid">
            <div className="sw-hero-copy">
              <p className="sw-kicker">Broadcast {info.code}</p>
              <h1>{skill.title}</h1>
              <p className="sw-hero-summary">{skill.summary}</p>
              <blockquote>
                <strong>Stay tuned:</strong> {skill.learnerPromise}
              </blockquote>
              <div className="sw-hero-actions">
                <button
                  type="button"
                  className={`sw-log-button ${logged ? 'is-logged' : ''} ${allCriteriaChecked ? 'is-ready' : ''}`}
                  onClick={handleLog}
                  disabled={logged}
                >
                  <Check aria-hidden="true" />
                  {logged ? 'Reception logged' : 'Log this reception'}
                </button>
                <PresetButton skillId={skill.id} />
              </div>
              {logged && completionDates[skill.id] && (
                <p className={`sw-log-date ${justLogged ? 'just-logged' : ''}`}>
                  <CircleDot aria-hidden="true" /> Logged on {completionDates[skill.id]}
                </p>
              )}
            </div>

            <aside className="sw-transmission-card" aria-label="Broadcast information">
              <div><span>Frequency</span><strong>{band.frequency}<small> FM</small></strong></div>
              <dl>
                <div><dt>Band</dt><dd>{band.name}</dd></div>
                <div><dt>Daypart</dt><dd>{daypart.name}</dd></div>
                <div><dt>Difficulty</dt><dd className="sw-capitalize">{skill.difficulty}</dd></div>
                <div><dt>Run time</dt><dd>{skill.estimatedMinutes} minutes</dd></div>
                <div><dt>Band reception</dt><dd>{bandComplete} / {band.skills.length}</dd></div>
              </dl>
            </aside>
          </div>
        </header>

        <div className="sw-log-layout">
          <main className="sw-log-main">
            <DetailSection icon={<CircleDot aria-hidden="true" />} title="Why this signal matters">
              <p className="sw-long-copy">{skill.whyItMatters}</p>
              <h3>Where it comes in handy</h3>
              <ul className="sw-bullet-list">
                {skill.realLifeUses.map((use) => <li key={use}>{use}</li>)}
              </ul>
            </DetailSection>

            <DetailSection icon={<BookOpen aria-hidden="true" />} title="What you'll pick up">
              <ul className="sw-learn-grid">
                {skill.youWillLearn.map((item, index) => (
                  <li key={item}><span>{String(index + 1).padStart(2, '0')}</span>{item}</li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection icon={<Radio aria-hidden="true" />} title="The transmission" className="sw-steps-section">
              <p className="sw-segment-intro">Follow these segments in order. Pause whenever you need to.</p>
              <ol className="sw-step-list">
                {skill.steps.map((step, index) => (
                  <li key={step}>
                    <span className="sw-step-number">{String(index + 1).padStart(2, '0')}</span>
                    <div><small>Segment {index + 1}</small><p>{step}</p></div>
                  </li>
                ))}
              </ol>
            </DetailSection>

            <DetailSection icon={<ListChecks aria-hidden="true" />} title="Reception test" className="sw-criteria-section">
              <p>Check the evidence as you complete it. These practice checks stay on this page; use the button below to save completion to your account.</p>
              <div className="sw-criteria-list">
                {skill.completionCriteria.map((criterion, index) => (
                  <label key={criterion} className={checkedCriteria[index] ? 'is-checked' : ''}>
                    <input
                      type="checkbox"
                      checked={checkedCriteria[index] ?? false}
                      onChange={() => setCheckedCriteria((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value))}
                    />
                    <span className="sw-faux-check"><Check aria-hidden="true" /></span>
                    <span>{criterion}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                className={`sw-log-button sw-log-button-wide ${logged ? 'is-logged' : ''} ${allCriteriaChecked ? 'is-ready' : ''}`}
                onClick={handleLog}
                disabled={logged}
              >
                <Check aria-hidden="true" />
                {logged ? 'Reception already logged' : allCriteriaChecked ? 'All clear — log reception' : 'Log reception when ready'}
              </button>
            </DetailSection>

            <section className="sw-challenge-card">
              <div className="sw-challenge-label"><span>LIVE</span> Listener challenge</div>
              <h2>Try it off-air</h2>
              <p>{skill.miniChallenge}</p>
            </section>

            <div className="sw-notes-grid">
              <DetailSection icon={<AlertTriangle aria-hidden="true" />} title="If you hit static">
                {skill.commonProblems && skill.commonProblems.length > 0 ? (
                  <ul className="sw-note-list">
                    {skill.commonProblems.map((problem) => <li key={problem}>{problem}</li>)}
                  </ul>
                ) : <p className="sw-muted-copy">No common problems are listed for this broadcast.</p>}
              </DetailSection>
              <DetailSection icon={<Lightbulb aria-hidden="true" />} title="Engineer notes">
                {skill.tips && skill.tips.length > 0 ? (
                  <ul className="sw-note-list">
                    {skill.tips.map((tip) => <li key={tip}>{tip}</li>)}
                  </ul>
                ) : <p className="sw-muted-copy">No extra tips are needed. Follow the transmission at your own pace.</p>}
              </DetailSection>
            </div>
          </main>

          <aside className="sw-log-sidebar">
            <section>
              <p className="sw-kicker">Builds on · prior signals</p>
              <h2>Before this broadcast</h2>
              <div className="sw-connections">
                {prerequisites.length > 0
                  ? prerequisites.map((item) => <ConnectionCard key={item.skill.id} info={item} relation="Builds on" />)
                  : <p className="sw-no-connections">No prior transmission required. You can start here.</p>}
              </div>
            </section>

            <section>
              <p className="sw-kicker">Leads to · next signals</p>
              <h2>Keep listening</h2>
              <div className="sw-connections">
                {dependents.length > 0
                  ? dependents.map((item) => <ConnectionCard key={item.skill.id} info={item} relation="Leads to" />)
                  : <p className="sw-no-connections">No follow-on broadcast is linked yet. Explore the rest of this band.</p>}
              </div>
            </section>
          </aside>
        </div>

        <footer className="sw-detail-footer">
          {previous ? (
            <Link to={`${SHORTWAVE_BASE}/transmission/${previous.skill.id}`}>
              <ChevronLeft aria-hidden="true" /><span><small>Previous on {band.frequency} FM</small><strong>{previous.skill.title}</strong></span>
            </Link>
          ) : <span />}
          {next ? (
            <Link to={`${SHORTWAVE_BASE}/transmission/${next.skill.id}`}>
              <span><small>Next on {band.frequency} FM</small><strong>{next.skill.title}</strong></span><ChevronRight aria-hidden="true" />
            </Link>
          ) : <span />}
        </footer>
      </div>
    </article>
  );
}

function TransmissionPage() {
  const { skillId } = useParams();
  const info = skillId && Object.prototype.hasOwnProperty.call(BROADCASTS, skillId)
    ? BROADCASTS[skillId]
    : null;
  if (!info) return <Navigate to={SHORTWAVE_BASE} replace />;
  return <TransmissionDetailBody key={info.skill.id} info={info} />;
}

const SEARCH_SUGGESTIONS = ['cook dinner', 'make a budget', 'first aid', 'job interview', 'use a map'];

function scannerHaystack(skill: Skill) {
  const band = BROADCASTS[skill.id].band;
  return [
    skill.title,
    skill.summary,
    skill.learnerPromise,
    skill.whyItMatters,
    ...(skill.tags ?? []),
    ...skill.youWillLearn,
    band.name,
    band.frequency,
    BROADCASTS[skill.id].code,
  ].join(' ').toLowerCase();
}

function Scanner({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { completedIds, presetIds } = useShortwave();
  const [query, setQuery] = useState('');
  const [presetsOnly, setPresetsOnly] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
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
    window.addEventListener('keydown', handleKey);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('keydown', handleKey);
      returnFocusRef.current?.focus();
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0 && !presetsOnly) return [];
    return ALL_SKILLS
      .filter((skill) => (!presetsOnly || presetIds.has(skill.id)) && tokens.every((token) => scannerHaystack(skill).includes(token)))
      .sort((a, b) => {
        const normalized = query.trim().toLowerCase();
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const aRank = aTitle.startsWith(normalized) ? 0 : aTitle.includes(normalized) ? 1 : 2;
        const bRank = bTitle.startsWith(normalized) ? 0 : bTitle.includes(normalized) ? 1 : 2;
        return aRank - bRank || a.title.localeCompare(b.title);
      });
  }, [presetIds, presetsOnly, query]);

  if (!open) return null;

  return (
    <div className="sw-scanner-backdrop" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className="sw-scanner"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sw-scanner-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="sw-scanner-header">
          <div className="sw-scanner-title">
            <span><Search aria-hidden="true" /></span>
            <div><p className="sw-kicker">Global frequency scanner</p><h2 id="sw-scanner-title">Find a broadcast</h2></div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close scanner"><X aria-hidden="true" /></button>
        </header>

        <div className="sw-scanner-controls">
          <label className="sw-search-field">
            <Search aria-hidden="true" />
            <span className="sw-visually-hidden">Search all broadcasts</span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search all ${ALL_SKILLS.length} broadcasts…`}
              autoComplete="off"
            />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X aria-hidden="true" /></button>}
          </label>
          <button
            type="button"
            className={`sw-scanner-preset-filter ${presetsOnly ? 'is-active' : ''}`}
            onClick={() => setPresetsOnly((current) => !current)}
            aria-pressed={presetsOnly}
          >
            <Star aria-hidden="true" /> Presets only <span>{presetIds.size}</span>
          </button>
        </div>

        <div className="sw-scanner-body">
          {query.length === 0 && !presetsOnly ? (
            <div className="sw-scanner-idle">
              <section>
                <p className="sw-kicker">Try a quick scan</p>
                <div className="sw-suggestions">
                  {SEARCH_SUGGESTIONS.map((suggestion) => (
                    <button type="button" key={suggestion} onClick={() => setQuery(suggestion)}>{suggestion}</button>
                  ))}
                </div>
              </section>
              <section>
                <p className="sw-kicker">Or jump to a band</p>
                <div className="sw-scanner-bands">
                  {BANDS.map((band) => (
                    <Link
                      key={band.domain}
                      to={`${SHORTWAVE_BASE}/band/${band.domain}`}
                      onClick={onClose}
                      style={{ '--sw-band': band.accent } as CSSProperties}
                    >
                      <strong>{band.frequency}</strong><span>{band.name}</span><small>{band.skills.length} broadcasts</small>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          ) : results.length === 0 ? (
            <div className="sw-scanner-empty">
              <Radio aria-hidden="true" />
              <h3>No signal found</h3>
              <p>Try fewer words, or turn off the preset filter.</p>
            </div>
          ) : (
            <div className="sw-search-results">
              <p className="sw-results-count">{results.length} {results.length === 1 ? 'broadcast' : 'broadcasts'} found across all bands</p>
              <ul>
                {results.slice(0, 80).map((skill) => {
                  const info = BROADCASTS[skill.id];
                  const logged = completedIds.has(skill.id);
                  return (
                    <li key={skill.id}>
                      <Link
                        to={`${SHORTWAVE_BASE}/transmission/${skill.id}`}
                        onClick={onClose}
                        style={{ '--sw-band': info.band.accent } as CSSProperties}
                      >
                        <span className={`sw-result-status ${logged ? 'is-logged' : ''}`}>{logged ? <Check aria-hidden="true" /> : <Radio aria-hidden="true" />}</span>
                        <span className="sw-result-copy">
                          <small>{info.band.frequency} FM · {info.band.name} · {info.code}</small>
                          <strong>{skill.title}</strong>
                          <span>{skill.summary}</span>
                        </span>
                        <span className="sw-result-time"><Clock aria-hidden="true" />{skill.estimatedMinutes} min</span>
                        <ChevronRight aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {results.length > 80 && <p className="sw-results-limit">Showing the first 80 matches. Add another word to narrow the signal.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Design #5 — an optimistic analog receiver for tuning into everyday know-how. */
export default function ShortwaveApp() {
  const { authError, clearAuthError } = useAuth();
  const { user, loaded, syncError, completeSkill, toggleFavorite, completionDates } = useUserData();
  const location = useLocation();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const scrollPositions = useRef(new Map<string, number>());

  const notify = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);
  const openScanner = useCallback(() => setScannerOpen(true), []);
  const closeScanner = useCallback(() => setScannerOpen(false), []);

  const logReception = useCallback((skillId: string) => {
    const accepted = completeSkill(skillId);
    if (!accepted) {
      setAuthOpen(true);
      notify('Sign in to log a reception.');
    }
    return accepted;
  }, [completeSkill, notify]);

  const togglePreset = useCallback((skillId: string) => {
    const accepted = toggleFavorite(skillId);
    if (!accepted) {
      setAuthOpen(true);
      notify('Sign in to save a preset.');
    }
    return accepted;
  }, [notify, toggleFavorite]);

  const completedIds = useMemo(() => new Set(user?.completedSkillIds ?? []), [user?.completedSkillIds]);
  const presetIds = useMemo(() => new Set(user?.favorite ?? []), [user?.favorite]);
  const contextValue = useMemo<ShortwaveState>(() => ({
    completedIds,
    presetIds,
    completionDates,
    logReception,
    togglePreset,
    openScanner,
    notify,
  }), [completedIds, completionDates, logReception, notify, openScanner, presetIds, togglePreset]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      event.preventDefault();
      openScanner();
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [openScanner]);

  useLayoutEffect(() => {
    mainRef.current?.scrollTo({ top: scrollPositions.current.get(location.key) ?? 0 });
  }, [location.key]);

  const handleScroll = useCallback(() => {
    if (mainRef.current) scrollPositions.current.set(location.key, mainRef.current.scrollTop);
  }, [location.key]);

  if (!loaded) {
    return (
      <div className="shortwave sw-loading" style={SHORTWAVE_THEME}>
        <Radio aria-hidden="true" />
        <p>Tuning the receiver…</p>
      </div>
    );
  }

  return (
    <ShortwaveContext.Provider value={contextValue}>
      <>
        <div className="shortwave" style={SHORTWAVE_THEME}>
          <Header />
          <main ref={mainRef} className="sw-main-scroll" onScroll={handleScroll}>
            <Routes>
              <Route index element={<Navigate to={`${SHORTWAVE_BASE}/band/${BANDS[0].domain}`} replace />} />
              <Route path="band/:domain" element={<SchedulePage />} />
              <Route path="transmission/:skillId" element={<TransmissionPage />} />
              <Route path="*" element={<Navigate to={SHORTWAVE_BASE} replace />} />
            </Routes>
          </main>

          <Scanner open={scannerOpen} onClose={closeScanner} />
          {syncError && <div className="sw-sync-error">Receiver sync failed: {syncError}</div>}
          <Toast
            message={toastMessage}
            visible={toastVisible}
            onDone={() => {
              setToastVisible(false);
              setToastMessage('');
            }}
          />
        </div>
        <AuthModal
          open={authOpen || Boolean(authError)}
          onClose={() => {
            setAuthOpen(false);
            clearAuthError();
          }}
        />
      </>
    </ShortwaveContext.Provider>
  );
}
