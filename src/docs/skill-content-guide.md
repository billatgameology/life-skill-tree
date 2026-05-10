# Skill Content Guide

> One document for everything: the original spec, all review feedback, design principles, and the schema. This is the source of truth for skill authoring.

---

## 1. Project Origin

This project started as a GitHub-hosted **Vite + React** website for learning practical life skills through a giant connected map.

**Product goal:** Skills are nodes. Progression paths are edges. Users move from basic to advanced life skills across domains.

**Audience:** Broadly useful for anyone, especially people under 20 building everyday independence.

**Evolution:** Started as a colorful kids app → stripped to fundamentals → dark PoE 2 aesthetic → 55 individual skill files with full content. This document captures every design decision along the way.

---

## 2. Core Design Principles

### 2.1 One skill = one real-world action

Not a category of competence. Not a bundle of topics. One concrete thing a person can try.

| Too broad (split these) | Just right |
|---|---|
| Cook Simple Meals | Make Scrambled Eggs, Boil Pasta, Cook Rice |
| Basic Home Repairs | Tighten a Loose Screw, Hammer a Nail Safely |
| Basic First Aid | Treat a Small Cut, Treat a Minor Burn |
| Use a Bank Account | Compare Bank Accounts (one action at a time) |

**Test:** Can the learner do the mini-challenge today without needing a whole new situation to happen? If not, the skill is too broad.

### 2.2 A prerequisite means "you actually need this first"

Not "same domain and lower level." Not "these feel related." A prerequisite should directly enable the next skill.

| Skill | Bad Prerequisite | Why | Good Prerequisite |
|---|---|---|---|
| Connect Bluetooth | Connect to Wi-Fi | Bluetooth does not need Wi-Fi | Manage Device Settings |
| Introduce Yourself | Write Professional Email | In-person is independent | (none) |
| Make a Phone Call | Write Professional Email | Phone calls are independent | (none) |
| Change a Light Bulb | Do Laundry | Unrelated | (none) |
| Tighten a Screw | Do Laundry | Tool use is independent | (none) |

**For this age group, many skills can simply be independent root skills.** You do not need to force every node into a chain.

### 2.3 Mini-challenges must be immediately doable

One tiny action. Not multi-day. Not "wait for a future problem." Not the full mastery outcome.

| Bad | Good |
|---|---|
| "Track every purchase for 7 days" | "Write down your last 5 purchases" |
| "Arrive early for 3 days" | "Calculate what time to leave with a 10-minute buffer" |
| "Wait for an app to misbehave" | "Practice restart-check-update on one app" |
| "Open a savings account" | "Compare two accounts, write down one fee each charges" |

### 2.4 Soften all claims

No words: "any," "always," "never," "without help." Realistic claims build trust.

| Softened | Better |
|---|---|
| "Never be late again" | "Plan when to leave so you are less likely to feel rushed" |
| "Pair any Bluetooth accessory" | "Pair common Bluetooth accessories" |
| "Replace any standard light bulb" | "Replace a common household light bulb" |

### 2.5 Respectful tone

Clear, calm, practical. Not childish. Not lecturing. Not adult-centered.

| Bad | Good |
|---|---|
| "It is essential adult infrastructure." | "A bank account helps you keep money safe." |
| "Being early is being on time." | "A small buffer gives you room for delays." |
| "Great job superstar!" | (just skip this entirely) |
| "Ask a grown-up" | "Ask someone nearby who can help." |

### 2.6 Title should match the mini-challenge

The skill title and the mini-challenge should describe the same scope of action.

| Before | After |
|---|---|
| Use a Bank Account | Compare Bank Accounts |
| Manage a Minor Illness | Care for a Mild Illness |
| Grocery Shop | Shop for One Meal |
| Basic Device Troubleshooting | Restart and Update an App |
| Organize Documents | Sort Important Papers |
| Resolve a Disagreement | Repair a Small Disagreement |

### 2.7 Health and safety skills need extra care

Health and safety skills should teach **basic preparation and low-risk actions only**. They should clearly say when to get help from a trusted person, medical professional, or emergency service.

**Before publishing health/safety content, verify steps against an authoritative source.**

Skills needing source review: Treat a Small Cut, Treat a Minor Burn, Stop a Nosebleed, Care for a Mild Illness, Find a Doctor.

### 2.8 Open discovery

All skills visible from the start. No locked/hidden content. The learner should browse freely.

Prerequisites are **suggested preparation**, not gates. They may guide learners toward helpful earlier skills, but they should not prevent access to a skill.

### 2.9 Skills are reusable components

A skill is an individual reusable capability component. It should not be written as if it belongs to only one tree branch, one goal, or one path.

A single skill can belong to many goal-oriented paths.

Example: **Write a Professional Email** could appear in:
- First Job Readiness
- School Independence
- Volunteer Application
- Handle a Problem Politely

Do not duplicate a skill just because it appears in a new goal. Reuse the same skill unless the steps, risk level, or completion criteria are meaningfully different.

### 2.10 Giant tree first, multiple views later

The giant skill tree remains the default main view. It is the primary visual identity of the product.

However, skill data should be view-agnostic. The same skills should also be able to appear in:
- Goal path cards
- Table view
- Search results
- Domain dashboards
- Suggested starter lists
- "What can I try today?" lists

Tree position, path grouping, table sorting, and featured cards are display choices. They should not change the core meaning of a skill.

---

## 3. Main Experience: Giant Tree + Goal Path Cards

The default experience is still a giant connected skill tree. The tree gives the product its video-game map feeling and lets learners browse freely.

At the top of the experience, the app may show **goal path cards** that highlight useful bundles of basic skills. These cards help learners who arrive with a target in mind.

Examples:
- First Job Readiness
- Cook One Simple Meal
- Go Somewhere on Your Own
- Manage Your Own Money
- Take Care of Your Space
- Handle a Small Home Problem

A path is guidance, not a lock. Learners can open a path, see the recommended skills, and still jump around the full tree.

Recommended home experience:

1. Goal path cards at the top for common learner goals
2. Giant skill tree as the main default view
3. Skill panel opens when a learner clicks any skill
4. Optional filters/search/table views can be added later

---

## 4. Skill Panel Experience

When a learner clicks a skill, the panel should answer five questions quickly:

1. What is this?
2. Why would I care?
3. When would I actually use it?
4. How hard is it?
5. What is the first tiny step?

**Panel structure (in order):**

1. Domain badge
2. Skill title
3. Learner promise
4. Difficulty / time / XP
5. Why this matters
6. Real-life uses
7. What you will learn
8. Mini challenge
9. Step-by-step guide
10. Completion criteria
11. Common problems (optional)
12. Tips (optional)

**Preview mode** shows items 1-8. **Practice mode** shows items 9-12. For the MVP they may appear in the same panel, but content still follows this order: first interest, then action.

---

## 5. Schema

### Skill schema

```ts
type Skill = {
  id: string;                    // kebab-case, never changes
  title: string;                 // short display name
  domain: SkillDomain;           // one of 15 domains
  summary: string;               // one sentence

  learnerPromise: string;        // what you will be able to do
  whyItMatters: string;          // 1-2 sentences
  realLifeUses: string[];        // 4 specific situations

  level: 0 | 1 | 2 | 3 | 4;      // visual depth / suggested complexity, not access control
  difficulty: "easy" | "medium" | "hard";
  status: "available" | "completed";

  suggestedPrerequisites: string[]; // helpful earlier skills, not locks

  xp: number;                    // visual flavor
  estimatedMinutes: number;      // 10-30

  materialsNeeded?: string[];    // physical/digital things used by the skill
  result?: string;               // visible outcome or artifact produced by the skill

  youWillLearn: string[];        // 4 concrete abilities
  miniChallenge: string;         // one tiny action
  steps: string[];               // 5 step checklist
  completionCriteria: string[];  // observable signs

  commonProblems?: string[];     // likely things that go wrong
  tips?: string[];               // practical advice

  safetyLevel?: "low" | "medium" | "high";
  requiresSourceReview?: boolean;
  helpBoundary?: string;         // when to ask someone nearby, a professional, or emergency services

  tags?: string[];               // future search/filter

  createdDate: string;            // ISO date, e.g. "2026-01-15" — when the skill was authored
  publishedDate: string | null;   // ISO date or null if not yet published
};
```

### Goal path schema

Paths are goal-oriented bundles of reusable skills. They help learners start from a target and discover the skills that support that target.

```ts
type SkillPath = {
  id: string;
  title: string;
  summary: string;
  learnerGoal: string;           // written from the learner's point of view

  pathType: "goal" | "situation" | "starter" | "challenge";
  difficulty: "easy" | "medium" | "hard";

  skillIds: string[];            // skills included in this path
  recommendedOrder?: string[];   // optional suggested order, not a lock

  realLifeOutcome: string;       // what this path helps the learner do
  whenThisHelps: string[];       // specific situations where the path is useful

  featured?: boolean;            // can appear as a card above the tree
  estimatedTotalMinutes?: number;
  tags?: string[];
};
```

### Domains

```ts
type SkillDomain =
  | "digital-basics"      // Digital Basics
  | "navigation"          // Navigation
  | "money-finance"       // Money & Finance
  | "food-cooking"        // Food & Cooking
  | "home-care"           // Home Care
  | "communication"       // Communication
  | "health-safety"       // Health & Safety
  | "organization";       // Organization
```

### Completion Button

Primary: **"I did it"** — feels like marking a real-world accomplishment, not submitting schoolwork.

Stuck option: **"I tried but got stuck"** — should show common problems, tips, and suggested prerequisite skills.

### Status and suggested prerequisites

Use `status: "available"` for new authored skills. Do not use locked content in the skill data.

Use `suggestedPrerequisites` only when an earlier skill directly helps the learner succeed. Leave it empty when the relationship is weak.

Bad suggested prerequisite: `do-laundry` before `tighten-a-loose-screw`

Good suggested prerequisite: `wash-hands` before `treat-a-small-cut`

### Layout data

Skill content does not include display position. Layout data lives in `src/data/skill-layouts.json`, organized by view type. Today only the `tree` view has positions; future views like `table` or `cards` can add their own sections without changing skill content.

---

## 6. Field Writing Guide

### learnerPromise
Short, confidence-building. "You will be able to..." not "You will learn about..."

Good: "Pair wireless devices without guessing through settings."
Bad: "Learn about Bluetooth technology."

### whyItMatters
Connect to independence, confidence, convenience, safety, or problem-solving. Practical, not abstract.

Good: "Bluetooth is a small tech skill that helps you use wireless devices independently."
Bad: "Understanding Bluetooth is essential for modern life."

### realLifeUses
Specific situations where the learner would use the skill. This is the most important engagement field.

Good: "You get new wireless headphones." "Your speaker will not connect."
Bad: "In your daily life." "At work or school."

### miniChallenge
One small concrete action. Doable today.

Good: "Connect one Bluetooth device and test that it works."
Bad: "Learn this skill." "Understand how it works."

### steps
Short, direct, action-oriented. No textbook explanations.

Good: "Open Bluetooth settings." "Turn Bluetooth on." "Put the accessory in pairing mode."
Bad: "Bluetooth is a wireless technology that uses radio waves..."

### completionCriteria
Observable signs. Not "you understand X."

Good: "The accessory appears as connected." "The accessory works correctly."
Bad: "You understand professional communication."

### commonProblems
Likely things that go wrong. Makes the skill feel safer to try.

Good: "The device does not appear in the list." "The battery is too low."

### tips
Practical, short advice.

Good: "Keep the devices close together while pairing."

### materialsNeeded
Physical or digital things the learner needs to try the skill. This keeps skills grounded and helps future filters like "skills I can try right now."

Good: `["phone", "Bluetooth accessory"]`
Good: `["clean clothes", "washer", "detergent"]`

### result
The visible outcome, artifact, or finished state.

Good: "A folded small load of laundry."
Good: "A short email draft with a subject, greeting, clear request, and closing."

### safetyLevel / requiresSourceReview / helpBoundary
Use these fields for health, safety, tools, heat, electricity, transportation, money, or anything where poor guidance could create risk.

- `safetyLevel: "low"` for ordinary low-risk practice
- `safetyLevel: "medium"` for skills needing extra caution or helper guidance
- `safetyLevel: "high"` only when the skill should mostly focus on recognizing limits and getting appropriate help
- `requiresSourceReview: true` for health/safety content that should be verified before publishing
- `helpBoundary` explains when to ask someone nearby, a professional, or emergency services

Good help boundary: "Ask someone nearby who can help if the bulb is high, broken, hot, or hard to reach."

### createdDate / publishedDate

- `createdDate` — the day the skill was authored. ISO format: `2026-01-15`.
- `publishedDate` — the day the skill went live on the site. ISO format, or `null` if it is not yet published.

Skills with `requiresSourceReview: true` should stay at `publishedDate: null` until the content has been verified against an authoritative source.

---

## 7. Review History

### Review 1 — Content Quality Pass

**Main issues found:**
1. Some skills were "topic bundles" — too broad, combined several actions
2. Prerequisites were mechanically generated, not meaningfully designed
3. Mini-challenges were too long or depended on future situations
4. Some claims overused words like "any," "always," "never"
5. A few lines were adult-centered or lecture-like
6. Schema domains didn't match spec enum values

**Fixes applied:**
- Split broad skills into individual actions (Cook Simple Meals → 4 skills, etc.)
- Redesigned prerequisites to be directly meaningful
- Rewrote all mini-challenges to be immediately doable
- Softened overclaims throughout
- Fixed tone to be clear and respectful
- Aligned domains with spec enum
- Added status field to every skill

### Review 2 — Structure and Tightening Pass

**Main issues found:**
1. Home care: Laundry was an awkward prerequisite for tool use and changing bulbs
2. Health: Hygiene prerequisites formed an unnatural chain
3. A few skills still slightly too large (Use a Bank Account, Manage Illness)
4. Some titles didn't match their mini-challenge scope
5. Health/safety skills need future source verification

**Fixes applied:**
- Made most home-care skills independent root skills
- Redesigned health prerequisites: hygiene skills are independent, only treat-small-cut → needs wash-hands
- Renamed 6 skills to match their actual mini-challenge:
  - Use a Bank Account → Compare Bank Accounts
  - Manage a Minor Illness → Care for a Mild Illness
  - Grocery Shop → Shop for One Meal
  - Basic Device Troubleshooting → Restart and Update an App
  - Organize Documents → Sort Important Papers
  - Resolve a Disagreement → Repair a Small Disagreement
- Added health/safety content rule: teach low-risk actions only, verify against authoritative sources before publishing

### Current Skill Count: 55 across 8 domains

| Domain | Count | Root Skills |
|---|---|---|
| Digital Basics | 6 | Connect Wi-Fi, Manage Device Settings |
| Navigation | 6 | Read a Street Map |
| Money & Finance | 6 | Track Daily Spending |
| Food & Cooking | 9 | Food Safety Basics |
| Home Care | 8 | Do Laundry, Reset Messy Room, Tighten Screw, Hammer Nail, Change Lightbulb |
| Communication | 6 | Write Professional Email, Make Phone Call, Introduce Yourself |
| Health & Safety | 8 | Treat Small Cut, Treat Minor Burn, Stop Nosebleed, Wash Hands, Brush Floss, Emergency Numbers |
| Organization | 6 | Use a Calendar |

---

## 8. Future Considerations

### Separate layout data (done)

Skill coordinates have been moved out of individual skill files into `src/data/skill-layouts.json`. This keeps skill content view-agnostic and lets the same skills appear in the giant tree, path cards, table views, and search results.

The layout file is organized by view so future displays (table, cards, dashboard) can add their own metadata without interfering with existing views.

Current files:

```ts
// src/data/skill-layouts.json
{
  "tree": {
    "connect-wifi": { "x": 1000, "y": 420 },
    ...
  },
  "table": {      // future
    "defaultSort": "domain",
    "columns": ["title", "domain", "difficulty", "estimatedMinutes"]
  }
}
```

```txt
src/skills/*.json            = reusable skill content (no position)
src/data/skill-layouts.json  = display metadata by view type
src/data/skills.ts           = skills index: imports, layouts, and exports
paths.json                   = goal-oriented skill bundles (future)
```

### Add later: richer path cards

Path cards can become a stronger entry point without replacing the giant tree. A path card might show progress, starter skills, estimated total time, and the next suggested skill.

### Add later: table view

Table view can help with authoring, review, sorting, and filtering. Useful columns include title, domain, difficulty, time, safety level, materials, mini-challenge, and suggested prerequisites.

### Add later: Preview / Practice mode separation

For MVP, both modes appear in the same panel. Later, split into:
- **Preview:** domain, title, promise, why, real-life uses, difficulty, mini-challenge, "Start" button
- **Practice:** steps, completion criteria, common problems, tips, "I did it" button

### Add later: Source-verified health content

Before publishing to a real audience, verify health/safety skill steps against:
- Red Cross first aid guidelines
- CDC health recommendations
- Local emergency services guidance

---

## 9. Batch Generation Guardrails

When using this guide to generate many skills:

- Do not invent suggested prerequisites just to make the tree connected.
- Prefer empty `suggestedPrerequisites` over weak relationships.
- Do not use locked status.
- Do not make broad category skills. Split broad ideas into smaller real-world actions.
- Do not create multi-day habits as mini-challenges.
- Do not duplicate a skill for each path. Reuse skills across paths.
- Do not make a path-specific skill unless the steps, risk level, or completion criteria are meaningfully different.
- Do not include medical, legal, or financial advice beyond basic preparation unless source-reviewed.
- If unsure whether a skill is too broad, split it.

---

## 10. Quality Checklist

Before adding a new skill, check:

- [ ] One real-world action, not a bundle
- [ ] Mini-challenge is doable today in one sitting
- [ ] No "any," "always," "never," "without help"
- [ ] Title matches the mini-challenge scope
- [ ] Suggested prerequisites are directly meaningful guidance, not locks (or empty)
- [ ] Tone is clear, calm, respectful — not childish, not lecturing
- [ ] Health/safety skills teach low-risk actions only
- [ ] Completion criteria are observable
- [ ] Steps are short and action-oriented
- [ ] Domain matches spec enum exactly
- [ ] Status is "available"
- [ ] Materials needed and result are included when useful
- [ ] Health/safety/tool skills include safety level, source review flag if needed, and a help boundary
- [ ] Skill is reusable across multiple possible goal paths
- [ ] ID is kebab-case and stable
- [ ] createdDate is set to the authoring date
- [ ] publishedDate is set to the go-live date, or null if pending source review
