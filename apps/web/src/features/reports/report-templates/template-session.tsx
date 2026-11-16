'use client';

import { useState, type ReactNode } from 'react';
import type { ReportTemplate } from '@salesmora/contracts';
import { ApiQueryScopeBoundary } from '../../api/api-query-provider';

export type TemplateRun = (result: unknown, template: ReportTemplate) => void;
export function TemplateSession<T extends { workspaceId: string; viewerId: string }>({ initial, parse, children }: {
  initial: T; parse: (raw: unknown) => T;
  children: (result: T, active: ReportTemplate | undefined, run: TemplateRun, revision: number) => ReactNode;
}) {
  const [current, setCurrent] = useState<{ result: T; template?: ReportTemplate; revision: number }>({ result: initial, revision: 0 });
  return <ApiQueryScopeBoundary scope={{ viewerId: initial.viewerId, workspaceId: initial.workspaceId }}>
    {children(current.result, current.template, (result, template) => {
    const parsed = parse(result);
    if (parsed.workspaceId !== initial.workspaceId || parsed.viewerId !== initial.viewerId) {
      throw new Error('The template result does not match the current workspace or viewer.');
    }
    setCurrent(previous => ({ result: parsed, template, revision: previous.revision + 1 }));
    }, current.revision)}
  </ApiQueryScopeBoundary>;
}
