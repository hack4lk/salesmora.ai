# SalesMora.ai branding

This folder is the source of truth for product branding assets and decisions. Keep working logo directions in `options/` until one is selected; move approved production artwork into a clearly named `assets/` folder after review.

## Current direction

**The Mosaic mark, 01 · Blue & Seafoam palette, and Source Sans 3 typeface are selected.** The tile pattern represents flexible tools brought together in one workspace. The wordmark presents `SalesMora.ai` as one continuous text run, with `.ai` inline. See the typography selection and implementation notes in [the brand guide](../docs/branding.md).

The selected app-ready lockup and mark are in `assets/`. The full-logo comparison is `index.html`; mark variations are in `mark-exploration.html`; color variations are in `color-exploration.html`; typography samples are in `typography-exploration.html`. Exploratory source files remain in `options/` and `marks/`.

## Asset rules

- Keep logo artwork as editable SVG wherever practical.
- UI icons use the shared `@mui/icons-material` library; do not use website favicons as UI icons.
- Do not add favicon files or browser icon metadata/routes to the application.
- Keep product logo artwork and third-party service logos distinct from interface iconography.
