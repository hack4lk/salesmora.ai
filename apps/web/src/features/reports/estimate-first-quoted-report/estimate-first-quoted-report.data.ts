export const estimateFirstQuotedReportData = {
  title: 'First-quoted estimate families',
  metric: 'Families first quoted',
  help: 'About first-quoted estimate families',
  definition: 'Count each currently authorized workspace-qualified estimate family once, on its earliest persisted initial Send or Publish date across issued revisions. Resends and later issued revisions do not add another family; unissued drafts are not quotes.',
  history: 'Archived or later-voided families retain their first issuance history, subject to current authorization. A superseded revision can supply the original issuance. Missing history is not guessed from creation, update, decision or resend dates.',
  context: 'Current issued revision and state provide context only; they do not change the first-issuance period. This is not an acceptance funnel, current awaiting count or monetary report.',
  coverage: 'First-issuance history is incomplete',
  invalid: 'First-quoted Estimates could not be displayed because the period, distinct families, issuance history or evidence are inconsistent. Retry the report.',
};
