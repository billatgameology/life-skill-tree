# Life Skill Tree

A GitHub-hosted **Vite + React** website for learning practical life skills through a giant connected map.

## Product Goal

Build a fast, visual-first experience that feels like exploring a world map of life capability:
- Skills are nodes
- Progression paths are edges
- Users can move from basic to advanced life skills across domains

## Development Strategy (Phased)

### Phase 1 — Look & Feel First (Quick Prototype)
Create something fast that communicates the core experience:
- Render a large interactive skill map
- Show clear visual states (locked / available / completed)
- Prioritize polished UI feel over deep feature completeness

### Phase 2 — Build the Topic List
Define and organize life-skill coverage:
- Create a structured topic inventory by domain
- Identify prerequisites and progression paths
- Start with high-utility foundational skills before advanced branches

### Phase 3 — Scale Content with Strong Structure
Design the system so content growth stays clean and maintainable:
- Standardize a skill-node schema (IDs, domains, difficulty, prerequisites, tags)
- Establish content authoring conventions and review workflow
- Separate map/graph data from presentation UI for easier iteration

## MVP Scope (Now)

### In Scope
- Vite + React app scaffold and deployment-ready setup for GitHub hosting
- Initial map UI with connected nodes/edges
- Starter dataset of life-skill topics and dependencies
- Core navigation and map interaction patterns

### Out of Scope (for now)
- Full educational lesson content
- Parent/teacher dashboards
- Professional-development or certification tracking
- Advanced gamification mechanics (streaks/leaderboards)

## Audience

Broadly useful for anyone, especially people under 20 building everyday independence.

## Initial Domain Examples

- Basic Electronics & Troubleshooting
  - Connect to Wi-Fi
  - Connect Bluetooth devices
  - Basic device settings and recovery habits
- Navigation & Mobility
  - Read map routes
  - Understand public transit basics
  - Plan a simple trip
- Money Basics
  - Track spending
  - Make a simple budget
  - Understand needs vs wants

## Suggested Technical Direction

- **Frontend:** React (Vite)
- **Map rendering:** Start simple (SVG or canvas), then evolve as graph grows
- **Data model:** JSON-based node/edge graph
- **Hosting:** GitHub Pages (or equivalent GitHub-hosted static deployment)

## Next Actions

1. Initialize Vite + React project structure
2. Define v1 `skills.json` and `edges.json` (or combined graph schema)
3. Implement a basic map renderer with pan/zoom and node states
4. Seed first 40–60 foundational skills
5. Validate look and feel, then iterate topic structure for scale

---

This plan is strong: **quick visual prototype → structured topic list → scalable content system**.
