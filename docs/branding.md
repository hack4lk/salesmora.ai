# SalesMora.ai Brand Guide

**Status:** Mosaic logo, Blue & Seafoam palette, and Source Sans 3 typography selected.

This guide records the approved visual identity for the SalesMora.ai workspace and provides implementation guidance for the planned Next.js and Material UI application.

## Brand identity

- **Product name:** SalesMora.ai
- **Workspace name:** SalesMora.ai workspace
- **Selected mark:** Mosaic, a set of distinct tiles arranged as one system. It represents the CRM, workflows, and assistant working together in one workspace.
- **Selected palette:** 01 · Blue & Seafoam
- **Typography:** Source Sans 3 for the product UI and wordmark. See the [font exploration page](../branding/typography-exploration.html) for the comparison that informed the choice.

## Logo assets

- [Full horizontal logo SVG](../branding/assets/salesmora-logo.svg) — Mosaic mark with the inline `SalesMora.ai` wordmark.
- [Mosaic mark SVG](../branding/assets/salesmora-mark.svg) — mark-only form for tight spaces where the product is already identified.

Use the full logo for primary product identity. Use the mark by itself only where the surrounding context clearly identifies SalesMora. Keep the logo's original proportions, preserve clear space around it, and do not recolor it outside approved palette treatments. Do not stretch, rotate, add effects, or place it on a low-contrast background.

The SVG wordmark uses Source Sans 3 with system sans-serif fallbacks. The production app should load the selected font locally so the wordmark and interface render consistently.

## Color palette · 01 Blue & Seafoam

| Token | Hex | Use |
|---|---|---|
| Primary blue | `#3B6FA5` | Primary actions, active navigation, links, and the `.ai` wordmark accent |
| Seafoam | `#7CCBB7` | Secondary mark tiles and restrained decorative accents; avoid small text on white |
| Navy ink | `#23384D` | Headings, body text, and the main wordmark |
| Cool white | `#F4F8FC` | Page canvas and subtle tinted surfaces |
| White | `#FFFFFF` | Cards, dialogs, and primary content surfaces |

Use white text on the primary blue for filled actions; the selected blue has a 5.25:1 contrast ratio against white. Use navy ink for normal text. Seafoam is an accent color, not a text color on white. Keep most of the interface white or cool white and reserve strong blue for clear interactive emphasis.

Recommended neutral UI tokens that complement the palette:

- **Border:** `#E2EAF1`
- **Muted text:** `#64778A`
- **Primary hover:** `#315C8A`
- **Focus ring:** `#8DB5D5`

These additional interface neutrals are implementation recommendations and should be checked in context when the MUI theme is built.

## UI components and iconography

- Use Material UI components where they fit the interaction and accessibility needs; apply the selected palette through the shared MUI theme in `packages/ui`.
- Use `@mui/icons-material` for interface icons. Keep UI iconography consistent; do not substitute emoji, Unicode symbols, icon fonts, or website favicons.
- Do not use favicon files or browser icon metadata/routes anywhere in the application. The product logo and third-party service logos remain brand assets, not UI icon substitutes.
- Storybook should load the same theme, logo assets, global styles, and providers as the application.

## Typography · Source Sans 3

Use **Source Sans 3** for the product UI and wordmark. Adobe describes the family as designed for user-interface environments. It is licensed under the SIL Open Font License 1.1; include the license notice when bundling the font with the application.

- **CSS family:** `'Source Sans 3', 'Segoe UI', Arial, sans-serif`
- **Weights:** 400 regular for body text; 600 semibold for headings, controls, and emphasized data; 700 bold for strong emphasis and wordmark.
- **Variable font:** Prefer the variable WOFF2 font when the production Next.js app is set up; self-host it and define the supported weight range.
- **Loading:** Use `font-display: swap`, preload only the regular face if needed, and test layout shifts and fallback rendering.
- **MUI:** Set `theme.typography.fontFamily` to the CSS family above and keep component-specific font overrides limited.
- **Source and license:** [Adobe Source Sans 3 repository](https://github.com/adobe-fonts/source-sans) · [SIL Open Font License 1.1](https://github.com/adobe-fonts/source-sans/blob/release/LICENSE.md).

The [font specimen](../branding/typography-exploration.html) retains Inter, Manrope, DM Sans, and Plus Jakarta Sans as comparison references. Source Sans 3 is marked as selected.

## Review pages

- [Logo directions](../branding/index.html)
- [Mark exploration](../branding/mark-exploration.html)
- [Color exploration](../branding/color-exploration.html)
- [Typography exploration](../branding/typography-exploration.html)

## UI sizing and typography standard

The executable Tailwind tokens live in `packages/ui/src/styles/global.css`. This guide describes their intended use; components consume the named utilities instead of repeating numeric values.

| Role | Tailwind utility | Standard |
|---|---|---|
| Page heading | `text-heading sm:text-heading-lg font-semibold` | 30px / 36px, line height 1.25, tracking -0.025em |
| Brand/display heading | `text-display lg:text-display-lg font-semibold` | 48px / 60px, line height 1.25, tracking -0.025em |
| Body copy | `text-base leading-relaxed` | 16px, line height 1.625 |
| Prominent body copy | `text-lg leading-relaxed` | 18px, line height 1.625 |
| Caption/footer | `text-sm` | Tailwind's 14px size and 20px line height |
| Eyebrow | `text-xs font-bold tracking-widest uppercase` | Tailwind's 12px size and 0.1em tracking |
| Form content | `max-w-form` | 28rem (448px), always with `w-full` |
| Brand headline block | `max-w-brand` | 28rem (448px) |
| Summary text | `max-w-reading` | 24rem (384px) |
| Full logo | `w-brand-logo h-auto` | 14rem (224px); original asset proportions |

Use Tailwind's default 4px spacing scale. Prefer `2`, `3`, `4`, `6`, `8`, `10`, `12`, and `16` for gaps/padding. Account page gutters use `px-6 sm:px-10 md:px-12 lg:px-16`; preserve the logo file's own clear space and align its image box to that gutter. Do not compensate for artwork bounds with negative pixel margins. Desktop account panels use equal columns at `md`; mobile stacks the header and content. Breakpoints remain shared: sm 600px, md 900px, lg 1200px, xl 1536px.

Use the standard scale first. Add a named, shared token only for a clear recurring role, and document it here. Do not merely hide a one-off adjustment behind a new token. Avoid arbitrary numeric sizing/leading/tracking classes in product components. Structural MUI slot selectors may use Tailwind's bracket syntax; that syntax selects a slot rather than inventing a numeric design value. Use accessible utilities such as `sr-only focus:not-sr-only` for skip links.

### Primary submit action

Use `SubmitButton` for primary form submission. Standard classes use `min-h-11 px-6 py-3 text-base leading-normal font-semibold rounded-xl`: a 48px single-line height with room to grow when labels wrap, no fixed-height clipping. Use primary blue/white, primary-dark hover, and line/muted disabled colors. Default to full form width. Pending state disables the button and shows a 16px spinner with reduced-motion support. Use the shared `focus-visible:focus-ring` utility so MUI resets cannot override the keyboard outline.

### Form-level feedback

Use `FormFeedback` for form-level errors and success. Panels use a white surface, ink text, the shared rounded-xl corners, and p-4 spacing. Error borders/icons use the shared error red `#D32F2F`; success borders/icons use semantic green `#236144` (`--color-success`). These semantic colors identify outcomes; primary actions retain brand blue. Always include a text title and message alongside the status icon. Titles use `text-base leading-6 font-semibold`; messages use `text-sm leading-6`.


### Main assistant palette

The main assistant uses the approved dark blue treatment in both collapsed and expanded states. These semantic tokens apply only to the assistant; the surrounding workspace retains the Blue & Seafoam palette.

| Token | Hex | Use |
|---|---|---|
| `assistant-header` | `#274C75` | Header and user messages |
| `assistant-surface` | `#213146` | Body and composer |
| `assistant-message` | `#263D56` | Assistant messages and selected context |
| `assistant-foreground` | `#E4EEF7` | Main text |
| `assistant-muted` | `#B6C8D9` | Supporting copy and placeholder |
| `assistant-border` | `#4C6B89` | Outlines and disabled controls |
| `assistant-accent` | `#8DBBE8` | Primary action, icon tile, and keyboard focus |
