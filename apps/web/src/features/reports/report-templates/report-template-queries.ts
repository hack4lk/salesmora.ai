import { mutationOptions, type QueryClient } from '@tanstack/react-query';
import { reportTemplateListSchema, type ReportTemplateArea } from '@salesmora/contracts';
import { apiReadOptions } from '../../api/api-read-options';
import type { ApiQueryScope } from '../../api/api-query';

export function reportTemplateListOptions(scope: ApiQueryScope, area: ReportTemplateArea) {
  const params = new URLSearchParams({ workspaceId: scope.workspaceId, area });
  return apiReadOptions(scope, 'report-templates', { area }, `/api/reports/templates?${params}`, raw => {
    const list = reportTemplateListSchema.parse(raw);
    if (list.some(item => item.workspaceId !== scope.workspaceId || item.area !== area)) {
      throw new Error('Template list does not match this report.');
    }
    return list;
  }, 'Templates could not be loaded.');
}

export function reportTemplateMutationOptions(client: QueryClient, scope: ApiQueryScope, area: ReportTemplateArea) {
  const queryKey = reportTemplateListOptions(scope, area).queryKey;
  return mutationOptions({
    onMutate: () => client.cancelQueries({ queryKey, exact: true }),
    mutationFn: (work: () => Promise<void>) => work(),
    // The reviewed command reconciles its receipt; do not replace an open dialog's list.
    onSuccess: () => client.invalidateQueries({ queryKey, exact: true, refetchType: 'none' }),
  });
}
