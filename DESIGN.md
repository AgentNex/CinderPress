# Design System: CinderPress Editorial CMS
**Project ID:** cinderpress-publishing-platform

## 1. Visual Theme & Atmosphere
CinderPress is an editorial publishing platform built with geometric precision, quiet authority, and restrained industrial craftsmanship. Inspired by the functional, architectonic clarity of Cloudflare-grade developer tools and modern literary publications, the atmosphere is calm, tactile, and typographic. 

It categorically rejects generic AI SaaS clichés: there are no neon purples, glowing cyan cards, floating translucent glass blobs, or cheesy holographic shields. Instead, the UI feels like ink set upon heavy, warm rag paper—crisp hairline borders, balanced negative space, sharp geometric accents, and purposeful high-contrast readability. The primary reading canvas is immersive and distraction-free, while the CMS Studio acts as an efficient, modular workshop for wordsmiths.

## 2. Color Palette & Roles
The color system is strictly disciplined, utilizing warm organic neutrals anchored by deep ink and highlighted with focused industrial amber-orange accents:

- **Signal Flare Orange (#F48120)** — Primary brand accent; used strictly for primary call-to-actions, active publish status, and focused geometric mark facets. Never used as large background fills.
- **Deep Ember (#D86612)** — Hover and pressed state for primary actions; high-contrast focus rings and active link underlines.
- **Vellum Paper Canvas (#FAF8F3)** — Primary application and reading background in light mode; evokes high-grade archival publication stock.
- **Soft Parchment Surface (#F3F0E8)** — Secondary card, sidebar, and container background; provides subtle tactile contrast against the main canvas.
- **Muted Bone (#EAE5D9)** — Hover states for secondary surfaces, table headers, and toolbar backgrounds.
- **Architectural Hairline Border (#D9D4CA)** — 1px crisp structural division for cards, panels, table rows, and input strokes.
- **Solid Deep Ink (#171717)** — Primary typography color, dark mode surface base, and high-emphasis structural headers.
- **Charcoal Graphite (#242424)** — Studio canvas background in dark mode; secondary headers and strong body copy.
- **Graphite Slate (#383836)** — Dark mode cards and input surfaces; crisp contrast against deep ink.
- **Dark Mode Hairline (#454542)** — 1px border division in dark mode.
- **Archival Muted Ink (#6B6B67)** — Secondary body text, timestamps, reading-time metadata, and inactive icons.
- **Sage Olive (#2E7D32)** — Restrained success state indicator for published articles and valid saved states.
- **Crimson Oxide (#C62828)** — Restrained error state indicator for failed validations and destructive deletions.
- **Pure White (#FFFFFF)** — High-contrast paper cards and image backing.

## 3. Typography Rules
- **Display & Editorial Headlines**: Clean geometric grotesque sans-serif (`Geist Sans`, `Inter`, or system sans fallback). Large headlines (-0.025em tracking, tight leading 1.15 to 1.25) establish confident hierarchy without decorative fashion gimmicks.
- **Body & Longform Reading**: High-legibility grotesque sans-serif with comfortable metrics: `18px` base on desktop, `1.65` line-height, constrained reading measure between `680px` and `720px` to optimize ocular scanning.
- **Metadata & Technical Accents**: Monospace (`Geist Mono`, `JetBrains Mono`, or system monospace). Used for reading times, publish dates, slug indicators, status badges, byte counters, and keyboard shortcut legends (`text-xs uppercase tracking-wider`).

## 4. Component Stylings
* **Buttons**:
  - *Primary Button*: Crisp 8px radius (`rounded-lg`), bold `Signal Flare Orange (#F48120)` background, pure white text, 1px subtle border (`border-[#D86612]`), smooth 150ms transit elevation with no blur blobs. Includes an in-flight spinner and disable-state for idempotency.
  - *Secondary / Outline Button*: Warm Parchment background (`#F3F0E8`), 1px Architectural Hairline border (`#D9D4CA`), Deep Ink text, hover state transitions to `#EAE5D9`.
  - *Ghost / Toolbar Button*: Transparent background, `#6B6B67` text, transitions to `#EAE5D9` on hover with active state highlighted in subtle orange tint.
* **Cards & Containers**:
  - Architectural 10px–12px radius (`rounded-xl`), crisp 1px Hairline border (`#D9D4CA`), flat or whisper-soft 1px drop shadow (`shadow-sm` with zero spread, `rgba(0,0,0,0.04)`).
  - Editorial Story Cards feature varied hierarchy: Featured story uses full horizontal span with wide aspect-ratio media, while secondary stories use compact column rhythms.
* **Inputs & Forms**:
  - 8px radius (`rounded-lg`), Soft Parchment surface (`#F3F0E8` or pure white), 1px stroke (`#D9D4CA`), transitioning to 2px focused amber ring (`focus:border-[#F48120] focus:ring-1 focus:ring-[#F48120]`). Clear validation errors appear directly beneath the field with red oxide accents.
* **Badges & Tags**:
  - Small pill/chamfered tags (`rounded-md`), uppercase monospace tracking, soft neutral tint (`bg-[#EAE5D9] text-[#171717]`), with Draft status in subtle amber tint and Published status in olive green tint.

## 5. Layout Principles
- **Grid & Alignment**: Strict 8-point typographic and spacing grid (`4px`, `8px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- **Whitespace Strategy**: Generous, intentional editorial margins. Breathing room around longform prose avoids visual fatigue.
- **Reading Measure**: Article text body strictly capped at `max-w-2xl` (`680px-720px`) centered or offset by an editorial sidebar.
- **Mobile First Adaptation**:
  - Full touch targets (minimum 44x44px for buttons and touch targets).
  - Clean collapsible navigation drawer.
  - Studio editor switches to full-width distraction-free canvas with publishing parameters tucked into an accessible bottom sheet.
