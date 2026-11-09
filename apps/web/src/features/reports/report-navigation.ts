import { reportSelectionSchema, type ReportSelection } from '@salesmora/contracts';

export function reportHref(selection: ReportSelection): string {
  const parsed = reportSelectionSchema.parse(selection);
  const params = new URLSearchParams({ workspace: parsed.query.workspaceId, query: JSON.stringify(parsed.query) });
  if (params.get('query')!.length > 16000) throw new Error('Report query exceeds the navigation limit.');
  return `/reports/${parsed.area}?${params}`;
}
