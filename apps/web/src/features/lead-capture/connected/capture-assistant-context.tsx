'use client';
import { useEffect } from 'react';
import type { CaptureAssistantContext } from '@salesmora/contracts';
import { useWorkspaceAssistant } from '../../assistant/workspace-assistant/workspace-assistant';
/** Page intent only. Unsaved wizard state is neither submitted nor replaced by a read turn. */
export function CaptureAssistantPageContext({ context }: { context: CaptureAssistantContext }) {
  const setContext = useWorkspaceAssistant()?.setPageContext;
  const key = JSON.stringify(context);
  useEffect(() => { setContext?.({ key, label: 'sourceId' in context ? 'Selected capture source' : 'Lead Capture', captureContext: context }); }, [key, context, setContext]);
  return null;
}
