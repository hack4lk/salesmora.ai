export const leadCSVHeaders = ['Lead ID', 'Lead #', 'Name', 'Email', 'Phone', 'Service', 'Address', 'Details', 'Internal notes', 'Source', 'Stage', 'Owner name', 'Owner ID', 'Created', 'Updated', 'Archived'] as const;

/** Always quote, double embedded quotes, and neutralize spreadsheet formula prefixes. */
export function csvCell(value: unknown): string {
  let text = value == null ? '' : String(value);
  if (/^[\s\uFEFF]*[=+\-@]/u.test(text) || /^[\t\r\n]/u.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function csvLine(values: readonly unknown[]): string { return values.map(csvCell).join(',') + '\r\n'; }
