---
name: Cadastral Prestige
colors:
  surface: '#f9f9ff'
  surface-dim: '#d7dae6'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#ebedfa'
  surface-container-high: '#e5e8f4'
  surface-container-highest: '#dfe2ef'
  on-surface: '#181c24'
  on-surface-variant: '#45474b'
  inverse-surface: '#2c303a'
  inverse-on-surface: '#eef0fd'
  outline: '#76777c'
  outline-variant: '#c6c6cc'
  surface-tint: '#5a5e69'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#181c25'
  on-primary-container: '#80848f'
  inverse-primary: '#c3c6d3'
  secondary: '#755a25'
  on-secondary: '#ffffff'
  secondary-container: '#fdd896'
  on-secondary-container: '#775d27'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1d1c15'
  on-tertiary-container: '#87847a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dfe2ef'
  primary-fixed-dim: '#c3c6d3'
  on-primary-fixed: '#181c25'
  on-primary-fixed-variant: '#434751'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e5c282'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5b430f'
  tertiary-fixed: '#e7e2d7'
  tertiary-fixed-dim: '#cbc6bc'
  on-tertiary-fixed: '#1d1c15'
  on-tertiary-fixed-variant: '#49473f'
  background: '#f9f9ff'
  on-background: '#181c24'
  surface-variant: '#dfe2ef'
typography:
  display:
    fontFamily: DM Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: DM Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: DM Sans
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: DM Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: DM Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: DM Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-md:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: DM Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.005em
  label-lg:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  cadastral-meta:
    fontFamily: DM Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
spacing:
  gutter: 1.5rem
  gutter-desktop: 2rem
  margin: 1.25rem
  margin-tablet: 2.5rem
  margin-desktop: 4rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses authoritative legal rigor combined with the cartographic precision of modern land intelligence. Built for high-net-worth property acquisitions, institutional real estate funds, and sovereign title verification, the interface balances restrained luxury with mathematical exactness.

The aesthetic fuses high-end editorial layouts with technical surveying artifacts. It avoids decorative excess, relying on precise lines reminiscent of boundary deeds, balanced whitespace, and rigorous typographic hierarchies. The emotional tone is discreet, unflinching, and permanent—evoking the security of a centuries-old deed vault powered by satellite cadastral precision.

## Colors

The palette is anchored in archival permanence and architectural materiality:

- **Primary (`#151922` Ink):** The definitive ground truth color. Used for high-emphasis headlines, primary structural borders, and critical legal signatures. Interactive hover shifts to `#262C3B` (Hover Ink).
- **Secondary (`#A98A50` Gold):** Reserved for technical verification marks, verified land boundaries, active inspection markers, and fine cadastral accents. For text on light grounds requiring compliance contrast, `#77592A` (Gold Ink) is deployed.
- **Tertiary (`#EDE8DD` Ivory):** Subtle structural fills, table headers, and parcel comparison containers. Paired with `#A9A79F` (Muted Ivory) for de-emphasized spatial grids.
- **Neutral & Surfaces:** The root canvas is `#FBFAF7` (Canvas), overlaid with `#FFFFFF` (Surface) for inspection dossiers and `#F2EEE7` (Stone) for secondary panels. Body text is rendered in `#1A1E27` (Foreground) with secondary data and metadata in `#5C6370` (Muted Text). Structural hair lines use `#E4DED3` (Borders).

## Typography

The design system relies exclusively on `DM Sans`, utilizing its clean geometric construction to emulate both archival legal clarity and crisp cartographic annotation. 

- **Display & Headlines:** Set with tight negative tracking (`-0.03em` to `-0.01em`) to create an editorial visual anchor. Used sparingly on title registers and high-level parcel evaluations.
- **Body:** Calibrated line heights (`1.55` to `1.6`) ensure long-form title opinions, encumbrance schedules, and easement definitions remain effortless to parse over prolonged review sessions.
- **Labels & Cadastral Meta:** Formatted with increased tracking and mid-to-heavy weights. The `cadastral-meta` style is rendered strictly uppercase to serve as coordinate labels, survey marker IDs, and boundary polygon references.

## Layout & Spacing

Layouts conform to a 12-column architectural grid with strict horizontal and vertical alignment lines. Structural sections are divided by hairline rules rather than excessive blank intervals.

- **Breakpoints & Adaptation:**
  - *Mobile (< 768px):* 4-column structure with `1.25rem` outer margins and `1rem` column gutters. Dossier tools stack vertically into full-width cards.
  - *Tablet (768px - 1199px):* 8-column layout with `2.5rem` margins and `1.5rem` gutters. Dual-pane inspection views become active (index left, summary right).
  - *Desktop (≥ 1200px):* 12-column layout fixed at a max-width of `1440px` with `4rem` margins and `2rem` gutters. Accommodates simultaneous split-screen cadastral map layers and verification sidebars.
- **Rhythm:** Spacing follows precise mathematical increments (`4px`, `8px`, `16px`, `24px`, `40px`). Component interiors rely on `space-md` (`1rem`) and `space-lg` (`1.5rem`) to create comfortable breathing room that mirrors legal document margins.

## Elevation & Depth

This system avoids floating drop shadows or heavy blur effects, relying entirely on **cadastral lineation** and **tonal strata**:

- **Hairline Boundaries:** Surface depth is achieved by enclosing panels in `1px` solid borders using `#E4DED3`. Overlapping elements use a crisply delineated `1px` inset or outset separation.
- **Tonal Layering:** The root canvas (`#FBFAF7`) establishes depth level 0. Work surfaces and title certificates sit at depth level 1 on pure `#FFFFFF`. Collapsible survey sidebars and metadata inspectors sit at depth level 2 using `#F2EEE7`.
- **Active Selection & Focus:** Active parcel containers or highlighted title clauses do not cast shadows; instead, they receive a double border (a `1px` `#E4DED3` base coupled with a `1px` `#A98A50` inner bounding line) reflecting architectural drafting conventions.

## Shapes

The shape system utilizes pure right angles (`0px` border radius). 

Sharp geometry reflects institutional finality, precision-cut surveyor plates, and official deed certification. No organic pill shapes or softened corners are permitted anywhere in the layout. Interactive components, data tables, status badges, and input inputs all feature absolute square corners to maintain unbroken horizontal and vertical cadastral axes throughout the viewport.

## Components

### Buttons
- **Primary:** Filled `#151922` with `#FBFAF7` text, `0px` radius, `0.75rem 1.75rem` padding. Subtle hover transition to `#262C3B`. Active press triggers a 1px inner border in `#A98A50`.
- **Secondary / Boundary:** Transparent background with `1px solid #151922` and `#151922` text. Hover shifts background to `#EDE8DD`.
- **Tertiary (Survey Action):** Minimalist text link accompanied by a geometric cadastral crosshair indicator (`+`), using `#77592A` text with an underline offset of `4px`.

### Chips & Cadastral Badges
- **Status Badges (Verified, Encumbered, In Review):** Rectangular frame with `1px solid #E4DED3`, background in `#FFFFFF`, uppercase `cadastral-meta` text. A left-aligned `4px` square solid dot denotes state (e.g., `#A98A50` for verified, `#151922` for standard archive).

### Lists & Encumbrance Schedules
- Clean horizontal ledgers separated by `1px solid #E4DED3`. Rows do not shift vertically on hover; rather, a `2px` left border in `#A98A50` appears alongside a subtle `#F2EEE7` tint across the row.

### Checkboxes & Radio Buttons
- Strictly square (`16px x 16px`), sharp corners, with a `1px solid #151922` perimeter. Checked state presents a solid `#151922` fill containing a sharp hairline checkmark or a centered `6px x 6px` gold inner square (`#A98A50`).

### Input Fields & Search Bars
- Background in `#FFFFFF` with a bottom-only or full-framed `1px solid #E4DED3` border. Text uses `body-md` in `#1A1E27`. Focused state converts the border to `1px solid #151922` with a `cadastral-meta` floating label rendered in `#77592A`.

### Cards & Title Dossiers
- Pristine `#FFFFFF` surfaces wrapped in `1px solid #E4DED3`. Top headers feature a distinct metadata strip shaded in `#F2EEE7`, housing parcel IDs, registration dates, and survey accuracy figures.

### Coordinate & Cadastral Metadata Tables
- Monospaced-styled alignment using `DM Sans` numbers. Headers utilize `#EDE8DD` fill with `label-md` tracking. Grid intersections are marked with fine `#A98A50` crosshair tokens (`+`) at panel corners.