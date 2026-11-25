'use client';

import { useState } from 'react';
import type { WorkspaceServiceChoice } from '@salesmora/contracts';
import { ServicePicker } from '../../services/service-picker/service-picker';
import type { JobView } from '../job-preview.types';
import { JobDialog } from '../job-dialog/job-dialog';
import { jobInput, jobLabel } from '../job-ui';
import { copy } from './job-edit-dialog.data';
import { JobPostalCodeField } from '../job-postal-code-field/job-postal-code-field';
import { normalizeJobZip } from '../job-postal-code-field/postal-code';

export function JobEditDialog({ open, job, pending, error, conflict, onReload, onClose, onConfirm, services = [], postalCode }: {
  open: boolean; job: JobView; services?: WorkspaceServiceChoice[]; pending?: boolean; error?: string;
  conflict?: boolean; onReload?: () => void; onClose: () => void;
  /** Supplied by the postal-enabled host after storage/conversion integration is ready. */
  postalCode?: string;
  onConfirm: (value: Pick<JobView, 'title' | 'service' | 'location' | 'description'> & { postalCode?: string }) => void | Promise<void>;
}) {
  const [value, setValue] = useState({ title: job.title, service: job.serviceId ?? job.service, location: job.location, description: job.description });
  const [zip, setZip] = useState(postalCode ?? '');
  const disabled = !job.capabilities.edit;
  const selected = services.find(service => service.id === value.service || service.key === value.service || service.name === value.service);
  return <JobDialog open={open} title={copy.title} description={copy.description} confirmLabel={copy.save}
    confirmDisabled={!value.title.trim() || disabled || postalCode !== undefined && !normalizeJobZip(zip)} pending={pending} error={error} conflict={conflict}
    onReload={onReload} onClose={onClose} onSubmit={() => onConfirm(postalCode === undefined ? value : { ...value, postalCode: normalizeJobZip(zip)! })}>
    <label className={jobLabel}>{copy.name}<input required className={jobInput} disabled={disabled} maxLength={200}
      value={value.title} onChange={event => setValue({ ...value, title: event.target.value })}/></label>
    <ServicePicker services={services} value={selected?.id ?? null} legacyValue={value.service} label={copy.service}
      allowRetainedValue disabled={disabled} onChange={id => setValue({ ...value, service: id ?? '' })}/>
    <label className={jobLabel}>{copy.location}<input className={jobInput} disabled={disabled} maxLength={500}
      value={value.location} onChange={event => setValue({ ...value, location: event.target.value })}/></label>
    {postalCode !== undefined && <JobPostalCodeField value={zip} onChange={setZip} disabled={disabled}/>}
    <label className={jobLabel}>{copy.descriptionLabel}<textarea rows={4} className={jobInput} disabled={disabled} maxLength={4000}
      value={value.description} onChange={event => setValue({ ...value, description: event.target.value })}/></label>
  </JobDialog>;
}
