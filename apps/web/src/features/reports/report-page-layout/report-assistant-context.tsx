'use client';

import { useLayoutEffect } from 'react';
import { reportAssistantContextSchema, type ReportTemplateArea, type ReportTemplatePeriod } from '@salesmora/contracts';
import { useWorkspaceAssistant } from '../../assistant/workspace-assistant/workspace-assistant';
import { reportAreaDefinitions } from '../report-area-catalog/report-area-catalog.definitions';

export function ReportAssistantContext({ area, workspaceId, query, period, ready }: {
  area: ReportTemplateArea; workspaceId: string; query: object; period: ReportTemplatePeriod | null; ready: boolean;
}) {
  const setPageContext = useWorkspaceAssistant()?.setPageContext;
  const serialized = ready ? JSON.stringify(reportAssistantContextSchema.parse({ selection: { area, query }, period })) : undefined;
  useLayoutEffect(() => {
    if (!setPageContext) return;
    if (!serialized) { setPageContext(undefined); return; }
    const reportContext = reportAssistantContextSchema.parse(JSON.parse(serialized));
    if (reportContext.selection.query.workspaceId !== workspaceId) throw new Error('Report context does not match the active workspace.');
    setPageContext({
      key: `report:${workspaceId}:${serialized}`,
      label: reportAreaDefinitions.find(item => item.id === area)!.label,
      reportContext,
    });
    return () => setPageContext(undefined);
  }, [setPageContext, serialized, workspaceId, area]);
  return null;
}
