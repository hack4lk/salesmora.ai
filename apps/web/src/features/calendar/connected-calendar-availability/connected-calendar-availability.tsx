'use client';

import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { calendarPersonAvailabilityResultSchema } from '@salesmora/contracts';
import { useApiQuery } from '../../api/use-api-query';
import { useApiMutation } from '../../api/use-api-mutation';
import { apiReadOptions, invalidateWorkspaceResources } from '../../api/api-read-options';
import { isApiAccessError } from '../../api/api-query';
import { ApiRequestError } from '../../api/api-request';
import { JobDialog } from '../../jobs/job-dialog/job-dialog';
import { jobButton } from '../../jobs/job-ui';
import { CalendarAvailabilityDialog, type CalendarAvailabilityDialogProps } from '../calendar-availability-dialog/calendar-availability-dialog';
import { calendarAvailabilityDialogData as copy } from '../calendar-availability-dialog/calendar-availability-dialog.data';

const failure = 'Availability could not be loaded or saved. Try again.';
export function ConnectedCalendarAvailability({ personId, workspaceId, viewerId, onClose, onSaved }: {
  personId: string; workspaceId: string; viewerId: string; onClose: () => void; onSaved: () => void;
}) {
  const client = useQueryClient();
  const path = `/api/calendar/availability/${encodeURIComponent(personId)}`;
  const options = apiReadOptions({ viewerId, workspaceId }, 'calendar-availability', { personId }, `${path}?workspace=${encodeURIComponent(workspaceId)}`,
    raw => calendarPersonAvailabilityResultSchema.parse(raw), failure);
  const query = useApiQuery(options);
  const mutation = useApiMutation('calendar-availability', raw => calendarPersonAvailabilityResultSchema.parse(raw), failure);
  const [error, setError] = useState(''), [conflict, setConflict] = useState(false);
  const receipt = useRef<{ payload: string; id: string }>(undefined);
  const denied = isApiAccessError(mutation.error);
  if (!query.data || query.isError || denied) return <JobDialog open title={copy.title} description={query.isError || denied ? failure : 'Loading availability…'} confirmLabel={copy.save} confirmDisabled onClose={onClose} onSubmit={() => {}}>
    {query.isError || denied ? <button type="button" className={jobButton} onClick={() => { void query.refetch({ throwOnError: true }).then(() => mutation.reset()).catch(() => {}); }}>Try again</button> : <p role="status" className="m-0 text-sm text-muted">Loading availability…</p>}
  </JobDialog>;
  const current = query.data;
  const save: CalendarAvailabilityDialogProps['onSave'] = async input => {
    const payload = JSON.stringify({ ...input, workspaceId });
    if (receipt.current?.payload !== payload) receipt.current = { payload, id: crypto.randomUUID() };
    setError('');
    try {
      const result = await mutation.mutateAsync({ path, method: 'PATCH', body: { ...input, workspaceId, submissionId: receipt.current.id } });
      client.setQueryData(options.queryKey, result); receipt.current = undefined;
      await invalidateWorkspaceResources(client, workspaceId, ['calendar-advisories','workflow-booking-options','team-settings'], { refetchType: 'none' });
      onSaved();
    } catch (error) {
      setConflict(error instanceof ApiRequestError && error.status === 409);
      setError(error instanceof Error ? error.message : failure); throw error;
    }
  };
  return <CalendarAvailabilityDialog open person={current.person} revision={current.revision} timezone={current.timezone} value={current.availability} canEdit={current.canEdit}
    pending={mutation.isPending || query.isFetching && conflict} error={error} conflict={conflict} onClose={onClose} onSave={save}
    onReload={() => { void query.refetch({ throwOnError: true }).then(() => { setConflict(false); setError(''); receipt.current = undefined; }).catch(() => setError(failure)); }}/>;
}
