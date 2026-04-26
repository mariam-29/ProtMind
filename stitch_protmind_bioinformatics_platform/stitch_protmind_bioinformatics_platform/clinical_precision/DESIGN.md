---
name: Clinical Precision
colors:
  surface: '#f4faff'
  surface-dim: '#c0dff0'
  surface-bright: '#f4faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e7f6ff'
  surface-container: '#daf1ff'
  surface-container-high: '#ceedfe'
  surface-container-highest: '#c8e7f8'
  on-surface: '#001f2a'
  on-surface-variant: '#3d4947'
  inverse-surface: '#153441'
  inverse-on-surface: '#e1f4ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006b60'
  primary: '#00685d'
  on-primary: '#ffffff'
  primary-container: '#008376'
  on-primary-container: '#f4fffb'
  inverse-primary: '#67d9c8'
  secondary: '#1d6584'
  on-secondary: '#ffffff'
  secondary-container: '#9bdafd'
  on-secondary-container: '#16607f'
  tertiary: '#3d6263'
  on-tertiary: '#ffffff'
  tertiary-container: '#567b7b'
  on-tertiary-container: '#f3fffe'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f6e4'
  primary-fixed-dim: '#67d9c8'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005048'
  secondary-fixed: '#c2e8ff'
  secondary-fixed-dim: '#90cff1'
  on-secondary-fixed: '#001e2b'
  on-secondary-fixed-variant: '#004d67'
  tertiary-fixed: '#c2eaea'
  tertiary-fixed-dim: '#a7cece'
  on-tertiary-fixed: '#002020'
  on-tertiary-fixed-variant: '#274d4d'
  background: '#f4faff'
  on-background: '#001f2a'
  surface-variant: '#c8e7f8'
typography:
  h1:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.4'
  body:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.6'
  label:
    fontFamily: DM Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.0'
  mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-padding: 24px
  grid-gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
This design system is built for high-stakes medical informatics, where clarity and trust are paramount. The aesthetic rejects the whimsical "AI-sparkle" trends in favor of a **precision-tool** philosophy. It utilizes a cool-toned, clinical palette to reduce cognitive load during long periods of data analysis. 

The visual language draws from modern laboratory equipment and academic publishing—clean lines, high information density without clutter, and a strict adherence to functional hierarchy. The UI should evoke the feeling of a sophisticated instrument: responsive, exact, and transparent.

## Colors
The palette is rooted in the "Near-white Ice" background to ensure a sterile, clinical environment. 
- **The Deep Ocean Blue (`--color-deep`)** is reserved for structural permanence: sidebars, top navigation headers, and primary section titles. 
- **The Teal Primary (`--color-primary`)** acts as the singular functional color for intent and action. 
- **The Pale Mint (`--color-surface`)** provides subtle tonal separation for data containers and zebra-striping, keeping the interface soft on the eyes.
- **The Pale Cyan (`--color-accent`)** is used exclusively for non-interactive highlights, such as category badges and hover-states, to maintain a clear distinction from primary actions.

## Typography
Typography is optimized for legibility of complex data.
- **Sora** brings a geometric, modern-scientific feel to headings, signaling innovation.
- **DM Sans** is the workhorse for UI text; its neutral character ensures that medical terminology and patient data remain the focus.
- **JetBrains Mono** is mandatory for all protein sequences, genomic coordinates, and database IDs to ensure character alignment and prevent misreading of similar glyphs (e.g., '0' and 'O', '1' and 'l').

## Layout & Spacing
The design system employs a **12-column fluid grid** for main content areas, allowing data tables and protein visualizers to expand to the full width of the viewport. 

Navigation is handled via a fixed-width left sidebar (using `--color-deep`) to provide a constant anchor point. Spacing follows a strict 4px/8px modular scale to maintain mathematical harmony. Information-dense views (like sequence alignments) should use "compact" spacing (4px gutters), while dashboard overviews use "standard" spacing (16px gutters) to allow for breathing room.

## Elevation & Depth
This system uses **Tonal Layering** rather than heavy shadows to maintain a "flat clinical" look. 
- **Level 0 (Background):** `--color-bg` (#F0FAFA) for the application canvas.
- **Level 1 (Panels):** `--color-surface` (#E8FAE8) for secondary containers and table rows.
- **Level 2 (Cards):** White (#FFFFFF) background with a subtle ocean-tinted shadow (`0 2px 12px rgba(13,92,122,0.08)`). This is the primary container for data modules.
- **Level 3 (Modals):** White (#FFFFFF) with a more pronounced shadow to indicate focus and separation from the clinical grid.

Depth is communicated through color shifts rather than physical height, ensuring the UI feels like a single, integrated laboratory interface.

## Shapes
The shape language is "Soft-Technical." 
- **Cards** use a 12px radius to feel approachable and modern.
- **Interactive Elements** (buttons, inputs) use tighter radii (8px and 6px) to appear more "tooled" and precise. 
- **Inputs** use a 1px border by default, which thickens to a 2px solid `--color-primary` ring on focus, providing an unambiguous visual cue for data entry.

## Components

### Buttons
- **Primary:** Filled with `--color-primary`, White text. High-contrast for "Run Analysis" or "Save."
- **Secondary:** Outlined with `--color-primary`. Used for alternative actions or navigation within a module.
- **Ghost:** Text-only in `--color-primary`. Used for low-priority actions like "Cancel" or "Clear Filters."
- **Interaction:** All buttons use a 150ms ease-in-out transition on hover, shifting the background color slightly darker.

### Tables & Data Grids
- **Zebra Striping:** Alternate rows use `--color-surface`.
- **Headers:** Sticky headers with `--color-deep` text and a subtle bottom border.
- **Mono Cells:** Sequence columns must use `JetBrains Mono`.

### Status Badges
- **Composition:** `--color-accent` background with `--color-deep` text. 
- **Shape:** 4px border radius.
- **Usage:** Used for tagging "Validated," "In-Progress," or "Draft" states without using semantic "traffic light" colors (red/green) unless specifically indicating error/success.

### Inputs
- **Field Style:** White background, 6px radius, 1px border in `--color-text-muted`.
- **Focus:** 2px solid `--color-primary`.
- **Labels:** Positioned above the field in `DM Sans` 13px Medium, using `--color-text-muted`.

### Cards
- **Structure:** White background, 12px radius, specific shadow applied. Headers within cards should have a subtle divider in `--color-accent`.