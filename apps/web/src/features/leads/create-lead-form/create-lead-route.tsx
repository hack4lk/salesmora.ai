'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { leadCreatedSchema } from '@salesmora/contracts';
import { ApiQueryScopeBoundary } from '../../api/api-query-provider';
import { ApiRequestError } from '../../api/api-request';
import { invalidateLeadQueries } from '../leads-page/lead-queries';
import { useLeadMutation } from '../leads-page/use-lead-mutation';
import { CreateLeadForm, type CreateLeadValues } from './create-lead-form';
import { createLeadFormData } from './create-lead-form.data';
import { createLeadRouteData as copy } from './create-lead-route.data';
interface CreateLeadRouteProps {
  workspaceId: string; viewerId: string; owners: ReadonlyArray<{ id: string; name: string }>;
}
export function CreateLeadRoute(props: CreateLeadRouteProps) {
  return <ApiQueryScopeBoundary scope={{ viewerId: props.viewerId, workspaceId: props.workspaceId }}>
    <CreateLeadContent key={`${props.viewerId}-${props.workspaceId}`} {...props} />
  </ApiQueryScopeBoundary>;
}
function CreateLeadContent({ workspaceId, owners }: CreateLeadRouteProps) {
  const router = useRouter();
  const client = useQueryClient();
  const createMutation = useLeadMutation(raw => leadCreatedSchema.parse(raw), createLeadFormData.errors.submission);
  const submissionId = useRef<string | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [version, setVersion] = useState(0);
  const [refreshError, setRefreshError] = useState(false);
  const homeHref = `/home?workspace=${encodeURIComponent(workspaceId)}`;
  async function submit(lead: CreateLeadValues) {
    submissionId.current ??= crypto.randomUUID();
    setRefreshError(false);
    try {
      await createMutation.mutateAsync({ path: '/api/leads', method: 'POST', body: { workspaceId, submissionId: submissionId.current, lead } });
      setSaved(true);
      try { await invalidateLeadQueries(client, workspaceId); }
      catch { setRefreshError(true); }
      router.refresh();
      return { ok: true as const };
    } catch (error) { return { ok: false as const, message: error instanceof ApiRequestError ? error.message : createLeadFormData.errors.submission }; }
  }
  return <div className="grid gap-6">
    <CreateLeadForm key={version} owners={owners} onSubmit={submit} onCancel={() => router.push(homeHref)} successMessage={copy.success} />
    {refreshError && <p role="alert" className="text-sm text-muted">{copy.savedReload}</p>}
    {saved && <div className="flex flex-wrap gap-6">
      <Link href={homeHref} className="rounded-xl text-primary underline focus-visible:focus-ring">{copy.back}</Link>
      <button type="button" onClick={() => { submissionId.current = undefined; setSaved(false); setVersion(value => value + 1); }} className="rounded-xl text-primary underline focus-visible:focus-ring">{copy.another}</button>
    </div>}
  </div>;
}
