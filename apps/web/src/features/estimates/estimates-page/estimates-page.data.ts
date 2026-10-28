export const estimatesPageData = {
  title: "Estimates",
  description: "Review scope, pricing and customer decisions across your leads and jobs.",
  fieldDescription: "Estimates linked to jobs assigned to you.",
  create: "Create estimate",
  export: "Export CSV",
  workspace: "Harbor Home Services",
  userEmail: "alex.morgan@example.com",
  fieldEmail: "sam.rivera@example.com",
  preview: "Storybook preview: fictional data only. No records, emails or files are created.",
  forbidden: "You do not have access to Estimates.",
  previewAction: (action: string, number: string) =>
    `Preview only: ${action} for ${number}. Its screen or confirmation dialog is planned in a later slice; no changes were made.`,
  createPreview:
    "Preview only: the estimate editor is planned in a later slice. A lead or assigned job must be selected before a draft can be created.",
  navigationPreview: "Navigation stays in this Storybook preview; no app route was opened.",
  relatedPreview: (number: string) =>
    `Preview only: the related record is ${number}. No app route was opened.`,
  exportPreview: "Preview only: export review finished. No CSV was downloaded.",
  exportFailure: "The Estimate export could not be completed. Try again.",
  exportChanged: "The matching Estimate count changed. Reopen the export review before downloading.",
  exportDownloaded: (count: number) => `${count.toLocaleString("en-US")} estimates exported.`,
  assistantBadge: "Storybook preview",
  assistantDescription: "Review the shared assistant layout for Estimates.",
  assistantText:
    "This is the shared assistant for the Estimates list. Estimate queries and proposal cards will be connected in later slices. No AI calls or estimate actions run in this preview.",
  assistantUnavailable: "Estimate assistant tools are not connected in Storybook.",
  quickFilters: {
    awaiting: "Awaiting response",
    expiring: "Expiring in 7 days",
  },
  clearQuickFilter: "Clear quick filter",
  actions: {
    preparing: "Preparing the draft...",
    duplicateError: "The estimate could not be duplicated. Retry or reload the latest list.",
    reviseError: "The revision Draft could not be opened. Retry or reload the latest list.",
    changed: "This estimate or your access changed. Reload the latest list before trying again.",
    mismatch: "The Draft response did not match this action. Reload the latest list before continuing.",
    reload: "Reload latest list",
  },
  exportScope: (labels: readonly string[]) =>
    labels.length
      ? `Filtered estimates: ${labels.join(" · ")}`
      : "Estimates in your permitted scope (archived and superseded excluded)",
  stories: {
    missingSearch: "No matching estimate 99999",
    manySearch: "EST-1900",
  },
} as const;
