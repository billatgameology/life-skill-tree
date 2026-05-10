# Life Skill Tree — Project Core Design

> This document records the current product goal, core design decisions, and high-level architecture for the Life Skill Tree project.

---

## 1. Product Goal

Life Skill Tree is a GitHub-hosted **Vite + React** website for learning practical life skills through a giant connected map.

The experience should feel like exploring a video-game skill tree, but the content should stay practical, respectful, and immediately useful.

The learner should think:

> "Oh, this is useful. I can probably do this. Let me try."

The goal is not to create a textbook or a school course. The goal is to help learners discover small real-world wins and build everyday independence over time.

---

## 2. Audience

The project should be broadly useful for anyone, especially people under 20 who are building everyday independence.

The tone should respect the learner. It should not sound childish, patronizing, or adult-centered.

---

## 3. Core Experience

The default main view is a **giant connected skill tree**.

Skills appear as nodes. Connections show helpful relationships between skills. Learners can pan, zoom, click nodes, inspect skills, and mark real-world progress.

The tree is the main visual identity of the product.

---

## 4. Goal Path Cards

Goal path cards may appear above the giant tree.

Many learners naturally start with a target, not with a domain. They may think:

- I want to get my first job.
- I want to cook something simple.
- I want to go somewhere on my own.
- I want to manage my money better.
- I want to take care of my space.

A path bundles a group of reusable skills around one learner goal.

A path is guidance, not a lock. Learners can open a path to see recommended skills, but they can still browse, skip around, and explore the full tree freely.

---

## 5. Skills vs. Paths

### Skill

A skill is one small reusable real-world capability.

Examples:

- Write a Professional Email
- Make a Phone Call
- Track Daily Spending
- Tighten a Loose Screw
- Make Scrambled Eggs

A skill should be small enough to try, but meaningful enough to feel like progress.

### Path

A path is a goal-oriented bundle of skills.

Examples:

- First Job Readiness
- Cook One Simple Meal
- Go Somewhere on Your Own
- Manage Your Own Money
- Handle a Small Home Problem

A single skill can belong to many paths.

Example: **Write a Professional Email** could belong to:

- First Job Readiness
- School Independence
- Volunteer Application
- Handle a Problem Politely

Paths do not own skills. They organize reusable skills around learner goals.

---

## 6. Open Discovery Decision

No skills should be locked or hidden.

Learners should be able to look around, skip around, and explore freely.

Prerequisites may exist as guidance or suggested preparation, but they should not prevent access.

Use language like:

- Suggested preparation
- Helpful earlier skill
- Recommended order
- Try this first

Avoid language like:

- Locked
- Required to unlock
- You cannot start yet

---

## 7. Content Design Decisions

Each skill should represent one real-world action, not a broad topic.

Mini-challenges should be immediately doable in one sitting when possible.

Skill titles should match the mini-challenge scope.

Claims should be softened. Avoid words like "any," "always," "never," and "without help."

Health and safety skills need extra care. They should teach low-risk preparation and basic actions only, and should clearly say when to get help from someone nearby, a medical professional, or emergency services.

---

## 8. Data Design Direction

Core skill data should be reusable and view-agnostic.

The same skill should be able to appear in:

- Giant tree view
- Goal path cards
- Table view
- Search results
- Domain dashboards
- Suggested starter lists
- "What can I try today?" lists

The current MVP can keep tree position on each skill for simplicity, but future versions may separate layout data from skill content.

Possible long-term files:

```txt
skills.json       = reusable skill content
paths.json        = goal-oriented skill bundles
layouts.json      = tree/table/card display metadata
```

---

## 9. MVP Interface Direction

Recommended home experience:

1. Goal path cards at the top for common learner goals
2. Giant skill tree as the main default view
3. Skill panel opens when a learner clicks a skill
4. Preview content builds curiosity and relevance
5. Practice content supports real-world action
6. Learner can mark "I did it" or "I tried but got stuck"

The interface should feel like a practical quest map, not a school lesson list.

---

## 10. Current Core Decisions

- Giant tree remains the default main view.
- Goal paths are added as cards/highlights above the tree.
- Skills are individual reusable components.
- Paths bundle skills around learner goals.
- A skill can belong to many paths.
- No skills are locked or hidden.
- Suggested prerequisites are guidance only.
- Health and safety content requires extra caution and source review before publishing.
- The skill content guide is the source of truth for creating new skills.
