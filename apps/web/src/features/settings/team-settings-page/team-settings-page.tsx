'use client';
import { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { DataTable, FormFeedback, MoreHorizOutlined, Pagination, type DataTableColumn } from '@salesmora/ui';
import { calendarWeekdays } from '@salesmora/contracts';
import { jobButton } from '../../jobs/job-ui';
import { TeamMemberEditor } from './team-member-editor';
import type { TeamSettingsMember, TeamSettingsPageProps } from './team-settings-page.types';

function availabilitySummary(member: TeamSettingsMember) {
  if (!member.availability.weeklyHours) return 'Not set';
  const days = calendarWeekdays.filter(day => member.availability.weeklyHours?.[day]);
  return days.length ? `${days.length} working ${days.length === 1 ? 'day' : 'days'} / week` : 'No working days';
}
function coverageSummary(member: TeamSettingsMember) {
  return member.workZipCodes.length ? `${member.workZipCodes.slice(0, 3).join(', ')}${member.workZipCodes.length > 3 ? ` +${member.workZipCodes.length - 3}` : ''}` : 'Not set';
}
/** Canonical view; the connected host will provide authorized, paged summaries and version-bound saves. */
export function TeamSettingsPage(props: TeamSettingsPageProps) {
  const [menu, setMenu] = useState<{ anchor: HTMLElement; member: TeamSettingsMember } | null>(null);
  const [edit, setEdit] = useState<{ member: TeamSettingsMember; tab: 'availability' | 'coverage' } | null>(null);
  const [updated, setUpdated] = useState(false);
  const actions = (member: TeamSettingsMember) => <button type="button" className={`${jobButton} inline-flex size-11 shrink-0 items-center justify-center px-0`}
    aria-label={`Options for ${member.name}`} aria-haspopup="menu" aria-expanded={menu?.member.id === member.id}
    disabled={props.pending || props.state === 'loading'} onClick={event => setMenu({ anchor: event.currentTarget, member })}><MoreHorizOutlined aria-hidden="true"/></button>;
  const columns: DataTableColumn<TeamSettingsMember>[] = [
    { id: 'member', label: 'Member', render: member => <div><span className="font-semibold">{member.name}</span><p className="mb-0 mt-1 text-xs text-muted">{member.role}</p></div> },
    { id: 'availability', label: 'Availability', render: member => availabilitySummary(member) },
    { id: 'coverage', label: 'Work ZIP codes', render: member => coverageSummary(member) },
    { id: 'actions', label: 'Actions', compact: true, render: actions },
  ];
  const open = (tab: 'availability' | 'coverage') => { if (menu) { setEdit({ member: menu.member, tab }); setMenu(null); setUpdated(false); } };
  return <div className="grid min-w-0 gap-6">
    <header><a href={props.settingsHref} className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-primary focus-visible:focus-ring">Back to settings</a>
      <h1 className="mb-0 mt-4 text-heading font-semibold text-ink sm:text-heading-lg">Team</h1>
      <p className="mb-0 mt-3 text-base text-muted">Set when and where each teammate can work.</p></header>
    {updated && <FormFeedback kind="success" message="Team member updated."/>}
    {!props.canManage && <p role="status" className="m-0 text-sm text-muted">You can view team settings. Changes require permission.</p>}
    <div className="min-w-0"><DataTable caption="Workspace team" columns={columns} rows={props.members} getRowId={member => member.id}
      getRowLabel={member => member.name} constrainHeight={false} state={props.state ?? 'ready'} emptyMessage="No team members to show."
      errorMessage="Team members could not be loaded." onRetry={props.onReload}
      renderCard={member => <div className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0"><h2 className="m-0 text-base font-semibold">{member.name}</h2>
        <p className="mb-0 mt-1 text-xs text-muted">{member.role}</p><p className="mb-0 mt-3 text-sm">{availabilitySummary(member)}</p>
        <p className="mb-0 mt-2 text-sm wrap-anywhere">Work ZIP codes: {coverageSummary(member)}</p></div>{actions(member)}</div>}/>
      {(!props.state || props.state === 'ready') && <Pagination total={props.total} page={props.page} pageSize={props.pageSize}
        disabled={props.pending} onPageChange={props.onPageChange} onPageSizeChange={props.onPageSizeChange}/>}</div>
    <Menu anchorEl={menu?.anchor} open={!!menu} onClose={() => setMenu(null)}>
      <MenuItem onClick={() => open('availability')}>Availability</MenuItem><MenuItem onClick={() => open('coverage')}>Work ZIP codes</MenuItem>
    </Menu>
    {edit && <TeamMemberEditor key={`${edit.member.id}:${edit.member.revision}:${edit.member.coverageRevision}`} {...props}
      member={edit.member} initialTab={edit.tab} onClose={() => setEdit(null)} onReload={() => { setEdit(null); props.onReload(); }}
      onSaveMember={async input => { await props.onSaveMember(input); setUpdated(true); }}/>}</div>;
}
