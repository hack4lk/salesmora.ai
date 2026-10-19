# Component copy and styling

Applies to all new components and changes to existing ones, starting October 9, 2026.

## Component folders

Keep each UI component in its own kebab-case folder, including its source, copy data, and Storybook stories:

```text
forms/
  text-field/
    text-field.tsx
    text-field.data.ts
    text-field.stories.tsx
  password-field/
    password-field.tsx
    password-field.data.ts
    password-field.stories.tsx
  field-classes.ts
layout/
  account-layout/
    account-layout.tsx
    account-layout.data.ts
    account-layout.stories.tsx
```

SubmitButton, TermsAcceptance, and FormFeedback follow the same pattern. Keep shared helpers such as `field-classes.ts` at their shared parent level. Export components through `packages/ui/src/index.ts`; application imports from `@salesmora/ui` remain stable. Story titles and URLs remain unchanged. Theme/provider/icon infrastructure stays in its existing shared folders.

## Copy

Keep user-facing strings in a colocated `<component-name>.data.ts` file. This includes accessible labels, optional-field wording, and fictional Storybook content. Components import that data rather than embedding copy in JSX. Forms/screens supply configurable labels, descriptions, and validation messages through props from their own data files.

Current files:

- `packages/ui/src/layout/account-layout/account-layout.data.ts`
- `packages/ui/src/forms/text-field/text-field.data.ts`
- `packages/ui/src/forms/password-field/password-field.data.ts`
- `apps/web/src/app/page.data.ts` and `apps/web/src/setup.data.ts` for setup previews

Storybook metadata titles remain literal strings because its indexer requires static titles. Technical strings such as HTML attributes, autocomplete values, IDs, CSS classes, and test selectors are not display copy.

## Styling

Use Tailwind classes through `className`. Do not add component `style` or MUI `sx` objects. Shared field classes live in `packages/ui/src/forms/field-classes.ts`. The public field props omit `sx` and `style`; use `className` for presentation changes.

`packages/ui/src/styles/global.css` owns Tailwind imports/source scanning, brand tokens, breakpoints, font loading, base styles, and focus styles. Both Next.js and Storybook import the same stylesheet. MUI's theme retains palette, typography, and shape configuration for its built-in controls; component overrides use Tailwind's stable MUI slot selectors. MUI supplies behavior and generates its internal control styles.

CSS layer order is `theme, base, mui, components, utilities`, allowing utilities to override MUI while keeping MUI above Tailwind's reset. Next.js enables MUI's CSS layer through AppRouterCacheProvider; Storybook enables it through StyledEngineProvider. Storybook injects the declarations from `apps/web/public/cascade-layers.css` through MUI GlobalStyles before its controls, so MUI global styles cannot establish a different layer order.

## Approval and local checks

Continue one component or screen at a time, with colocated stories, interaction checks, accessibility checks, narrow/wide layout review, and relevant lint/type/build checks. Pause for local user approval before the next item. A requested refactor applies to existing items before new components begin. See [local testing](local-testing.md) and the [build tracker](auth-onboarding-build-tracker.md).

## Design values

Follow the [brand sizing and typography standard](branding.md#ui-sizing-and-typography-standard). Use default Tailwind spacing and named shared typography/content-width tokens. Avoid arbitrary numeric sizing, line heights, letter spacing, grid proportions, and negative pixel alignment adjustments in JSX. A new token needs a meaningful reusable role; moving a one-off number into a token is not sufficient. Keep the approved logo's intrinsic proportions and clear space. Responsive layout changes should be reviewed in Storybook before approval.

MUI resets can override base-layer focus styles. Interactive wrappers should apply the shared `focus-visible:focus-ring` utility so keyboard focus remains visible above the MUI layer. Verify the computed outline during keyboard checks.


Product-specific forms use the same folder convention under `apps/web/src/features/<area>/`, for example `auth/registration-form/`. Colocate UI validation when the form needs it; generic shared controls stay in `packages/ui`. Inject submission callbacks for Storybook mocks until the actual server boundary is implemented. Keep UI checks separate from authoritative server validation.
