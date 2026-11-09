export type ReportTemplateNameEntry = { id: string; name: string };

export function reportTemplateNameError(name: string, existing: readonly ReportTemplateNameEntry[], currentId?: string): 'length' | 'duplicate' | undefined {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 80) return 'length';
  if (existing.some(template => template.id !== currentId && template.name.trim().toLowerCase() === trimmed.toLowerCase())) return 'duplicate';
}
