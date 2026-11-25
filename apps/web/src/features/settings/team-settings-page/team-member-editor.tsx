'use client';
import { useId, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { CalendarAvailabilityDialog } from '../../calendar/calendar-availability-dialog/calendar-availability-dialog';
import { JobDialog } from '../../jobs/job-dialog/job-dialog';
import { jobInput, jobLabel } from '../../jobs/job-ui';
import { parseWorkZipCodes } from '../../jobs/job-postal-code-field/postal-code';
import type { TeamSettingsMember, TeamSettingsPageProps } from './team-settings-page.types';

export function TeamMemberEditor({ member, initialTab = 'availability', canManage, pending, conflict, onClose, onReload, onSaveMember }: {
  member: TeamSettingsMember; initialTab?: 'availability' | 'coverage'; onClose: () => void;
} & Pick<TeamSettingsPageProps, 'canManage' | 'pending' | 'conflict' | 'onReload' | 'onSaveMember'>) {
  const id = useId(), [tab, setTab] = useState(initialTab), [zipText, setZipText] = useState(member.workZipCodes.join(', '));
  const [saving, setSaving] = useState(false);
  const parsed = parseWorkZipCodes(zipText), valid = !parsed.invalid.length && parsed.codes.length <= 500;
  const changed = JSON.stringify([...parsed.codes].sort()) !== JSON.stringify([...member.workZipCodes].sort());
  const disabled = !canManage || pending || saving || conflict;
  return <CalendarAvailabilityDialog open person={member} revision={member.revision} timezone={member.timezone}
    value={member.availability} canEdit={canManage} pending={pending || saving} conflict={conflict} onReload={onReload}
    onClose={onClose} onSave={async () => {}} renderForm={(form, availability) => <JobDialog {...form} title={member.name}
      description="Manage working availability and where this teammate works."
      error={conflict ? 'Member settings changed. Reload the latest values before saving.' : undefined}
      confirmLabel="Save changes"
      confirmDisabled={disabled || !changed && !availability.changed || changed && !valid || availability.changed && !availability.valid}
      onSubmit={async () => {
        if (disabled || !changed && !availability.changed || changed && !valid || availability.changed && !availability.valid) return;
        setSaving(true);
        try { await onSaveMember({ personId: member.id,
          ...(changed ? { coverage: { revision: member.coverageRevision, countryCode: 'US' as const, postalCodes: parsed.codes } } : {}),
          ...(availability.changed ? { availability: { revision: member.revision, timezone: member.timezone, value: availability.value } } : {}),
        }); }
        finally { setSaving(false); }
      }}>
      <Tabs value={tab} aria-label="Member settings" onChange={(_, next) => setTab(next)} className="border-b border-line">
        <Tab id={`${id}-availability`} aria-controls={`${id}-availability-panel`} value="availability" label="Availability" disabled={pending || saving}/>
        <Tab id={`${id}-coverage`} aria-controls={`${id}-coverage-panel`} value="coverage" label="Work ZIP codes" disabled={pending || saving}/>
      </Tabs>
      {(changed && !valid && tab !== 'coverage' || availability.changed && !availability.valid && tab !== 'availability') && <p role="status" className="m-0 text-sm text-muted">Check the other tab for an unfinished change before saving.</p>}
      <div role="tabpanel" id={`${id}-availability-panel`} aria-labelledby={`${id}-availability`} hidden={tab !== 'availability'}>
        <fieldset disabled={tab !== 'availability'} className="m-0 grid min-w-0 gap-4 border-0 p-0">
          <p className="m-0 text-sm text-muted">Shared with Calendar.</p>{form.children}
        </fieldset>
      </div>
      <div role="tabpanel" id={`${id}-coverage-panel`} aria-labelledby={`${id}-coverage`} hidden={tab !== 'coverage'}>
        <fieldset disabled={disabled || tab !== 'coverage'} className="m-0 grid min-w-0 gap-4 border-0 p-0">
          {!canManage && <p className="m-0 text-sm text-muted">You don’t have permission to change work ZIP codes.</p>}
          <label className={jobLabel}>Work ZIP codes<textarea className={jobInput} rows={4} value={zipText} maxLength={6000}
            placeholder="10001, 10002, 10003" aria-invalid={!valid || undefined} aria-describedby={`${id}-zip-help`}
            onChange={event => setZipText(event.target.value)}/></label>
          <p id={`${id}-zip-help`} role={!valid ? 'status' : undefined} className="m-0 text-sm leading-6 text-muted">
            {parsed.invalid.length ? 'Use 5-digit US ZIP codes or ZIP+4, separated by commas or spaces.' : parsed.codes.length > 500 ? 'Use at most 500 ZIP codes.' : 'United States · Separate ZIP codes with commas or spaces. ZIP+4 matches its first five digits.'}</p>
          <p className="m-0 text-sm leading-6 text-muted">{parsed.codes.length ? `${parsed.codes.length} unique ZIP ${parsed.codes.length === 1 ? 'code' : 'codes'}. Teammates can cover the same ZIP.` : 'No coverage set. This member won’t be selected automatically for work matched by ZIP code.'}</p>
        </fieldset>
      </div>
    </JobDialog>}/>;
}
