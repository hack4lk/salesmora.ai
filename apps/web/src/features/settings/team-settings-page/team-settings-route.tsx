'use client';
import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { teamSettingsMemberSchema, teamSettingsSnapshotSchema, type TeamSettingsSnapshot } from '@salesmora/contracts';
import { FormFeedback } from '@salesmora/ui';
import { SettingsQueryBoundary } from '../use-settings-request';
import { useApiQueryScope } from '../../api/api-query-provider';
import { apiReadOptions, invalidateWorkspaceResources } from '../../api/api-read-options';
import { useApiQuery } from '../../api/use-api-query';
import { useApiMutation } from '../../api/use-api-mutation';
import { ApiRequestError } from '../../api/api-request';
import { isApiAccessError } from '../../api/api-query';
import { TeamSettingsPage } from './team-settings-page';

export function TeamSettingsRoute({ initial }: { initial: TeamSettingsSnapshot }) {
  return <SettingsQueryBoundary workspaceId={initial.workspaceId}><Host initial={initial}/></SettingsQueryBoundary>;
}
function Host({ initial }: { initial: TeamSettingsSnapshot }) {
  const client = useQueryClient(), scope = useApiQueryScope();
  const [page, setPage] = useState(initial.page), [pageSize, setPageSize] = useState(initial.pageSize);
  const [conflict, setConflict] = useState(false), [error, setError] = useState('');
  const receipt = useRef<{ signature: string; id: string } | null>(null), lock = useRef(false);
  const path = `/api/settings/team?workspace=${encodeURIComponent(initial.workspaceId)}`;
  const options = apiReadOptions(scope, 'team-settings', { page, pageSize }, `${path}&page=${page}&pageSize=${pageSize}`, raw => {
    const result = teamSettingsSnapshotSchema.parse(raw); if (result.workspaceId !== initial.workspaceId) throw Error('Invalid workspace.'); return result;
  }, 'Team members could not be loaded.');
  const query = useApiQuery({ ...options, ...(page === initial.page && pageSize === initial.pageSize ? { initialData: initial } : {}), staleTime: 30000 });
  const mutation = useApiMutation('team-settings', raw => teamSettingsMemberSchema.parse(raw), 'Member settings could not be saved.');
  const denied = isApiAccessError(query.error) || isApiAccessError(mutation.error);
  if (denied) return <FormFeedback kind="error" message="Team settings are unavailable with your current access."/>;
  const current = query.data;
  return <div className="grid gap-5">{error && <FormFeedback kind="error" message={error}/>}
    <TeamSettingsPage settingsHref={`/settings?workspace=${encodeURIComponent(initial.workspaceId)}`} members={current?.members ?? []}
      total={current?.total ?? 0} page={current?.page ?? page} pageSize={pageSize} canManage={!!current?.canManage}
      state={query.isError ? 'error' : current ? 'ready' : 'loading'} pending={mutation.isPending} conflict={conflict}
      onPageChange={next => { setPage(next); setError(''); }} onPageSizeChange={size => { setPageSize(size as 10 | 20 | 50); setPage(1); setError(''); }}
      onReload={() => { void query.refetch({ throwOnError: true }).then(() => { setConflict(false); setError(''); receipt.current = null; mutation.reset(); }).catch(() => setError('Team members could not be loaded.')); }}
      onSaveMember={async command => {
        if (lock.current || !current?.canManage || conflict) throw Error('Reload team settings before saving.');
        lock.current = true; setError('');
        const signature = JSON.stringify(command); if (receipt.current?.signature !== signature) receipt.current = { signature, id: crypto.randomUUID() };
        try {
          const member = await mutation.mutateAsync({ path, method: 'PUT', body: { workspaceId: initial.workspaceId, requestId: receipt.current.id, command } });
          client.setQueryData(options.queryKey, { ...current, members: current.members.map(row => row.id === member.id ? member : row) }); receipt.current = null;
          await invalidateWorkspaceResources(client, initial.workspaceId, ['team-settings', 'calendar-availability', 'calendar-advisories', 'workflow-booking-options', 'workflow-routing-options'], { refetchType: 'none' });
        } catch (error) { setConflict(error instanceof ApiRequestError && error.status === 409); setError(error instanceof Error ? error.message : 'Member settings could not be saved.'); throw error; }
        finally { lock.current = false; }
      }}/></div>;
}
