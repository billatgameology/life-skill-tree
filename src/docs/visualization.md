SkillTree Explorer Architectural Guide

This document provides instructions for a code agent or developer on how to maintain and expand the four primary visualization engines in the SkillTreeExplorer application.

1. Sunburst View (Concentric Rings)

Purpose: Hierarchical overview grouped by Domain (angle) and Level (radius).

The Arc Logic: Arcs are generated using SVG path data. The describeArc helper converts polar coordinates (angle/radius) into Cartesian M, A, and L commands.

Skill Placement:

Angle: Map the domain index to a 360-degree range (domainIndex / totalDomains * 360).

Radius: Skills are placed inside the solid arcs. Level 1 occupies the inner ring (Radius 100-190). Levels 2 and 3 occupy the outer ring (Radius 210-380).

Maintenance: To add more rings, define new R_INNER and R_OUTER constants and ensure the jitter logic in the skill mapping doesn't push dots outside the path boundary.

2. Trellis View (Lane Progression)

Purpose: Clear, linear progression for multi-domain comparison.

Layout: A standard Flexbox column layout where each row is a "Lane" for a Domain.

Tiers: Each lane is subdivided into three equal columns (Level 1, Level 2, Level 3).

Scaling: This view handles high skill counts by allowing vertical scrolling. To improve density, switch the Level containers from flex-wrap to a more compact grid if skill counts per tier exceed 50.

3. Mosaic View (Volume Map)

Purpose: Immediate visual impact of dataset volume and category density.

Structure: A CSS Grid of "Continent Cards." Each card represents one domain.

The Tiled Logic: Skills are rendered as simple colored squares in a sub-grid inside each card.

Progress Visuals: The square's opacity is bound to the skill.progress value. The backgroundColor is hard-bound to the CATEGORIES color map.

Interactive: Clicking a tile triggers the onSelect callback. Because tiles are small, use hover:scale-110 for accessibility.

4. Registry View (Data Table)

Purpose: High-performance searching, sorting, and administrative management.

Engine: Standard HTML table with a sticky header.

Filtering: The view uses the filteredSkills memoized array, which reacts instantly to the searchQuery state in the parent component.

Performance: For 300+ nodes, standard React rendering is fine. If the dataset grows to 1000+, implement a virtualized list (windowing) for the table rows.

Global Constants

CATEGORIES: The single source of truth for domain names, hex colors, and Lucide icons.

generateSkills: The mock engine producing 20 skills per domain. In production, replace this with a Firestore onSnapshot listener.