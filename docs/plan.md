# Skill Rework Plan — Based on Review Feedback

## Phase 1: Fix Schema
- Update types.ts: rename CategoryKey values to spec enum (digital-basics, home-care, etc.)
- Update skills/index.ts loader with new domain names
- Add status + position fields to all skill JSONs

## Phase 2: Rewrite All Skills (parallel, 4 batches)
- Split broad skills into individual ones
- Fix prerequisites to be meaningful
- Rewrite mini-challenges to be immediately doable
- Soften overclaims
- Fix tone

## Phase 3: Update Components
- Update SkillTreeCanvas, SkillDetailPanel for new domain names
- Build & deploy
