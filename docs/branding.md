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
