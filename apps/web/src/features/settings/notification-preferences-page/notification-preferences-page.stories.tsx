import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { NotificationPreferencesPage, type NotificationPreferencesPageProps } from './notification-preferences-page';
import { notificationPreferencesPageData as copy } from './notification-preferences-page.data';

function Preview(args: NotificationPreferencesPageProps) {
  const [values, setValues] = useState(args.values);
  const [saved, setSaved] = useState(args.savedValues);
  const [state, setState] = useState(args.state);
  const [saveState, setSaveState] = useState(args.saveState);
  return <NotificationPreferencesPage {...args} state={state} values={values} savedValues={saved} saveState={saveState}
    onChange={next => { args.onChange(next); setValues(next); setSaveState('idle'); }}
    onSave={next => { args.onSave(next); setSaved(next); setSaveState('saved'); }}
    onDiscard={() => { args.onDiscard(); setValues(saved); setSaveState('idle'); }}
    onRetry={() => { args.onRetry(); setState('ready'); }}/>;
}
const meta = {
  title: 'Settings/NotificationPreferencesPage', component: NotificationPreferencesPage, parameters: { layout: 'fullscreen' },
  args: { settingsHref: copy.stories.settingsHref, state: 'ready', values: { leadAssignedEmail: true }, savedValues: { leadAssignedEmail: true }, saveState: 'idle', onChange: fn(), onSave: fn(), onDiscard: fn(), onRetry: fn() },
  render: args => <Preview {...args}/>,
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-6xl p-4 sm:p-8"><p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story/></main>],
} satisfies Meta<typeof NotificationPreferencesPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('switch', { name: copy.leadAssigned })).toBeChecked();
  await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.discard })).toBeDisabled();
  await expect(c.getByRole('link', { name: copy.back })).toHaveAttribute('href', copy.stories.settingsHref);
} };
export const EmailOff: Story = { args: { values: { leadAssignedEmail: false }, savedValues: { leadAssignedEmail: false } } };
export const UnsavedChanges: Story = { args: { values: { leadAssignedEmail: false } } };
export const Saving: Story = { args: { values: { leadAssignedEmail: false }, saveState: 'pending' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('switch')).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.saving })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.discard })).toBeDisabled();
  await expect(args.onSave).not.toHaveBeenCalled();
} };
export const SaveError: Story = { args: { values: { leadAssignedEmail: false }, saveState: 'error' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.saveErrorTitle);
  await expect(c.getByRole('switch')).not.toBeChecked();
  await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(c.getByRole('status', { name: copy.successTitle })).toBeVisible();
} };
export const Saved: Story = { args: { saveState: 'saved' } };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(c.queryByRole('switch')).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: copy.save })).not.toBeInTheDocument();
} };
export const LoadError: Story = { args: { state: 'error' } };
export const RetryLoading: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.loadErrorTitle);
  await userEvent.click(c.getByRole('button', { name: copy.retry }));
  await expect(args.onRetry).toHaveBeenCalledOnce();
  await expect(c.getByRole('switch')).toBeVisible();
} };
export const ToggleAndSave: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  const toggle = c.getByRole('switch', { name: copy.leadAssigned });
  toggle.focus(); await expect(toggle).toHaveFocus();
  await userEvent.keyboard(' ');
  await expect(toggle).not.toBeChecked();
  await expect(args.onChange).toHaveBeenCalledWith({ leadAssignedEmail: false });
  await expect(args.onSave).not.toHaveBeenCalled();
  await expect(c.getByText(copy.appDescription)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(args.onSave).toHaveBeenCalledOnce();
  await expect(args.onSave).toHaveBeenCalledWith({ leadAssignedEmail: false });
  await expect(c.getByRole('status', { name: copy.successTitle })).toBeVisible();
  await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
} };
export const DiscardChanges: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('switch'));
  await userEvent.click(c.getByRole('button', { name: copy.discard }));
  await expect(c.getByRole('switch')).toBeChecked();
  await expect(args.onDiscard).toHaveBeenCalledOnce();
  await expect(args.onSave).not.toHaveBeenCalled();
  await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
} };
export const Narrow: Story = { globals: { viewport: { value: 'mobile1', isRotated: false } } };

const visitValues = { leadAssignedEmail: true, visitChangedEmail: true };
const visitArgs = { showVisitChanges: true, values: visitValues, savedValues: visitValues };
export const VisitChangeEmails: Story = { args: visitArgs, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('switch', { name: copy.visitChanged })).toBeChecked();
  await expect(c.getByRole('switch', { name: copy.leadAssigned })).toBeChecked(); await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
} };
export const VisitEmailOff: Story = { args: { ...visitArgs, values: { ...visitValues, visitChangedEmail: false }, savedValues: { ...visitValues, visitChangedEmail: false } } };
export const SaveVisitOnly: Story = { args: visitArgs, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('switch', { name: copy.visitChanged }));
  await expect(args.onSave).not.toHaveBeenCalled(); await expect(c.getByRole('switch', { name: copy.leadAssigned })).toBeChecked();
  await expect(c.getByText(copy.visitAppDescription)).toBeVisible(); await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(args.onSave).toHaveBeenCalledOnce(); await expect(args.onSave).toHaveBeenCalledWith({ leadAssignedEmail: true, visitChangedEmail: false });
  await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
} };
export const DiscardBothPreferences: Story = { args: visitArgs, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('switch', { name: copy.visitChanged })); await userEvent.click(c.getByRole('switch', { name: copy.leadAssigned }));
  await userEvent.click(c.getByRole('button', { name: copy.discard }));
  await expect(c.getByRole('switch', { name: copy.visitChanged })).toBeChecked(); await expect(c.getByRole('switch', { name: copy.leadAssigned })).toBeChecked();
  await expect(args.onSave).not.toHaveBeenCalled(); await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
} };
export const SavingVisitPreferences: Story = { args: { ...visitArgs, values: { ...visitValues, visitChangedEmail: false }, saveState: 'pending' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); for (const toggle of c.getAllByRole('switch')) await expect(toggle).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.discard })).toBeDisabled(); await expect(c.getByRole('button', { name: copy.saving })).toBeDisabled(); await expect(args.onSave).not.toHaveBeenCalled();
} };
export const VisitSaveError: Story = { args: { ...visitArgs, values: { ...visitValues, visitChangedEmail: false }, saveState: 'error' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.saveErrorTitle); await expect(c.getByRole('switch', { name: copy.visitChanged })).not.toBeChecked();
  await userEvent.click(c.getByRole('button', { name: copy.save })); await expect(args.onSave).toHaveBeenCalledWith({ leadAssignedEmail: true, visitChangedEmail: false });
  await expect(c.getByRole('status', { name: copy.successTitle })).toBeVisible();
} };
export const VisitKeyboard: Story = { args: visitArgs, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), toggle = c.getByRole('switch', { name: copy.visitChanged }); toggle.focus(); await userEvent.keyboard(' ');
  await expect(toggle).not.toBeChecked(); await expect(toggle).toHaveFocus(); await expect(args.onChange).toHaveBeenCalledWith({ leadAssignedEmail: true, visitChangedEmail: false });
  await expect(args.onSave).not.toHaveBeenCalled();
} };
export const VisitLoading: Story = { args: { ...visitArgs, state: 'loading' }, play: async ({ canvasElement }) => { await expect(within(canvasElement).queryByRole('switch')).not.toBeInTheDocument(); } };

export const EstimateEmails: Story = {
  args: {
    ...visitArgs,
    showEstimateNotifications: true,
    values: { ...visitValues, estimateEmail: true },
    savedValues: { ...visitValues, estimateEmail: true },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('switch', { name: copy.estimateEvents })).toBeChecked();
    await expect(c.getByText(copy.estimateDescription)).toBeVisible();
    await expect(c.getAllByRole('switch')).toHaveLength(3);
  },
};
export const EstimateEmailOff: Story = {
  args: {
    ...visitArgs,
    showEstimateNotifications: true,
    values: { ...visitValues, estimateEmail: false },
    savedValues: { ...visitValues, estimateEmail: false },
  },
};
export const SaveEstimatePreference: Story = {
  args: {
    ...visitArgs,
    showEstimateNotifications: true,
    values: { ...visitValues, estimateEmail: true },
    savedValues: { ...visitValues, estimateEmail: true },
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('switch', { name: copy.estimateEvents }));
    await expect(args.onSave).not.toHaveBeenCalled();
    await userEvent.click(c.getByRole('button', { name: copy.save }));
    await expect(args.onSave).toHaveBeenCalledWith({
      leadAssignedEmail: true,
      visitChangedEmail: true,
      estimateEmail: false,
    });
  },
};

const reminderValues = { ...visitValues, estimateEmail: true, deadlineReminderEmail: true };
const reminderArgs = {
  showVisitChanges: true,
  showEstimateNotifications: true,
  showDeadlineReminders: true,
  values: reminderValues,
  savedValues: reminderValues,
};
export const DeadlineReminderEmails: Story = {
  args: reminderArgs,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('switch')).toHaveLength(4);
    await expect(c.getByRole('switch', { name: copy.deadlineReminders })).toBeChecked();
    await expect(c.getByText(copy.deadlineAppDescription)).toBeVisible();
    await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
  },
};
export const DeadlineReminderOff: Story = {
  args: { ...reminderArgs, values: { ...reminderValues, deadlineReminderEmail: false }, savedValues: { ...reminderValues, deadlineReminderEmail: false } },
};
export const SaveDeadlineReminderOnly: Story = {
  args: reminderArgs,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('switch', { name: copy.deadlineReminders }));
    for (const name of [copy.leadAssigned, copy.visitChanged, copy.estimateEvents])
      await expect(c.getByRole('switch', { name })).toBeChecked();
    await expect(args.onSave).not.toHaveBeenCalled();
    await userEvent.click(c.getByRole('button', { name: copy.save }));
    await expect(args.onSave).toHaveBeenCalledOnce();
    await expect(args.onSave).toHaveBeenCalledWith({ ...reminderValues, deadlineReminderEmail: false });
    await expect(c.getByRole('status', { name: copy.successTitle })).toBeVisible();
    await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
  },
};
export const DiscardDeadlineReminder: Story = {
  args: reminderArgs,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('switch', { name: copy.deadlineReminders }));
    await userEvent.click(c.getByRole('switch', { name: copy.visitChanged }));
    await userEvent.click(c.getByRole('button', { name: copy.discard }));
    for (const toggle of c.getAllByRole('switch')) await expect(toggle).toBeChecked();
    await expect(args.onSave).not.toHaveBeenCalled();
    await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
  },
};
export const SavingDeadlineReminder: Story = {
  args: { ...reminderArgs, values: { ...reminderValues, deadlineReminderEmail: false }, saveState: 'pending' },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    for (const toggle of c.getAllByRole('switch')) await expect(toggle).toBeDisabled();
    await expect(c.getByRole('button', { name: copy.saving })).toBeDisabled();
    await expect(c.getByRole('button', { name: copy.discard })).toBeDisabled();
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};
export const DeadlineReminderSaveError: Story = {
  args: { ...reminderArgs, values: { ...reminderValues, deadlineReminderEmail: false }, saveState: 'error' },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('alert')).toHaveTextContent(copy.saveErrorTitle);
    await expect(c.getByRole('switch', { name: copy.deadlineReminders })).not.toBeChecked();
    await userEvent.click(c.getByRole('button', { name: copy.save }));
    await expect(args.onSave).toHaveBeenCalledWith({ ...reminderValues, deadlineReminderEmail: false });
  },
};
export const DeadlineReminderKeyboard: Story = {
  args: reminderArgs,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), toggle = c.getByRole('switch', { name: copy.deadlineReminders });
    toggle.focus();
    await userEvent.keyboard(' ');
    await expect(toggle).toHaveFocus();
    await expect(toggle).not.toBeChecked();
    await expect(args.onChange).toHaveBeenCalledWith({ ...reminderValues, deadlineReminderEmail: false });
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};
export const DeadlineReminderLoading: Story = {
  args: { ...reminderArgs, state: 'loading' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('switch')).not.toBeInTheDocument();
  },
};
export const DeadlineReminderLoadError: Story = {
  args: { ...reminderArgs, state: 'error' },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('switch')).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: copy.retry }));
    await expect(args.onRetry).toHaveBeenCalledOnce();
    await expect(c.getByRole('switch', { name: copy.deadlineReminders })).toBeChecked();
  },
};
export const DeadlineReminderDefaultOn: Story = {
  args: { ...reminderArgs, values: visitValues, savedValues: visitValues },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('switch', { name: copy.deadlineReminders })).toBeChecked();
    await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
    await userEvent.click(c.getByRole('switch', { name: copy.deadlineReminders }));
    await userEvent.click(c.getByRole('button', { name: copy.save }));
    await expect(args.onSave).toHaveBeenCalledWith({ ...visitValues, deadlineReminderEmail: false });
  },
};

const jobActivityValues = { ...reminderValues, jobActivityEmail: true };
const jobActivityArgs = { ...reminderArgs, showJobActivity: true, values: jobActivityValues, savedValues: jobActivityValues };
export const JobActivityEmails: Story = {
  args: jobActivityArgs,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('switch')).toHaveLength(5);
    await expect(c.getByRole('switch', { name: copy.jobActivity })).toBeChecked();
    await expect(c.getByText(copy.jobActivityAppDescription)).toBeVisible();
    await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
  },
};
export const JobActivityOff: Story = {
  args: { ...jobActivityArgs, values: { ...jobActivityValues, jobActivityEmail: false }, savedValues: { ...jobActivityValues, jobActivityEmail: false } },
};
export const SaveJobActivityOnly: Story = {
  args: jobActivityArgs,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('switch', { name: copy.jobActivity }));
    for (const name of [copy.leadAssigned, copy.visitChanged, copy.deadlineReminders, copy.estimateEvents])
      await expect(c.getByRole('switch', { name })).toBeChecked();
    await expect(args.onSave).not.toHaveBeenCalled();
    await userEvent.click(c.getByRole('button', { name: copy.save }));
    await expect(args.onSave).toHaveBeenCalledOnce();
    await expect(args.onSave).toHaveBeenCalledWith({ ...jobActivityValues, jobActivityEmail: false });
    await expect(c.getByRole('status', { name: copy.successTitle })).toBeVisible();
    await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
  },
};
export const DiscardJobActivity: Story = {
  args: jobActivityArgs,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('switch', { name: copy.jobActivity }));
    await userEvent.click(c.getByRole('switch', { name: copy.deadlineReminders }));
    await userEvent.click(c.getByRole('button', { name: copy.discard }));
    for (const toggle of c.getAllByRole('switch')) await expect(toggle).toBeChecked();
    await expect(args.onSave).not.toHaveBeenCalled();
    await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
  },
};
export const SavingJobActivity: Story = {
  args: { ...jobActivityArgs, values: { ...jobActivityValues, jobActivityEmail: false }, saveState: 'pending' },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    for (const toggle of c.getAllByRole('switch')) await expect(toggle).toBeDisabled();
    await expect(c.getByRole('button', { name: copy.saving })).toBeDisabled();
    await expect(c.getByRole('button', { name: copy.discard })).toBeDisabled();
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};
export const JobActivitySaveError: Story = {
  args: { ...jobActivityArgs, values: { ...jobActivityValues, jobActivityEmail: false }, saveState: 'error' },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('alert')).toHaveTextContent(copy.saveErrorTitle);
    await expect(c.getByRole('switch', { name: copy.jobActivity })).not.toBeChecked();
    await userEvent.click(c.getByRole('button', { name: copy.save }));
    await expect(args.onSave).toHaveBeenCalledWith({ ...jobActivityValues, jobActivityEmail: false });
  },
};
export const JobActivityKeyboard: Story = {
  args: jobActivityArgs,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), toggle = c.getByRole('switch', { name: copy.jobActivity });
    toggle.focus(); await userEvent.keyboard(' ');
    await expect(toggle).toHaveFocus();
    await expect(toggle).not.toBeChecked();
    await expect(args.onChange).toHaveBeenCalledWith({ ...jobActivityValues, jobActivityEmail: false });
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};
export const JobActivityLoading: Story = {
  args: { ...jobActivityArgs, state: 'loading' },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).queryByRole('switch')).not.toBeInTheDocument(); },
};
export const JobActivityLoadError: Story = {
  args: { ...jobActivityArgs, state: 'error' },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('switch')).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: copy.retry }));
    await expect(args.onRetry).toHaveBeenCalledOnce();
    await expect(c.getByRole('switch', { name: copy.jobActivity })).toBeChecked();
  },
};
export const JobActivityDefaultOn: Story = {
  args: { ...jobActivityArgs, values: reminderValues, savedValues: reminderValues },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('switch', { name: copy.jobActivity })).toBeChecked();
    await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
    await userEvent.click(c.getByRole('switch', { name: copy.jobActivity }));
    await userEvent.click(c.getByRole('button', { name: copy.save }));
    await expect(args.onSave).toHaveBeenCalledWith({ ...reminderValues, jobActivityEmail: false });
  },
};
export const JobActivityHidden: Story = {
  args: { ...jobActivityArgs, showJobActivity: false, values: { ...jobActivityValues, jobActivityEmail: false } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('switch', { name: copy.jobActivity })).not.toBeInTheDocument();
    await expect(c.getAllByRole('switch')).toHaveLength(4);
    await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
  },
};

export const JobCreationEmails: Story = {
  args: { ...jobActivityArgs, jobActivityScope: 'creation' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText(copy.jobActivityCreationDescription)).toBeVisible();
    await expect(c.queryByText(copy.jobActivityDescription)).not.toBeInTheDocument();
    await expect(c.getByRole('switch', { name: copy.jobActivity })).toBeChecked();
  },
};


export const JobStatusEmails: Story = {
  args: { ...jobActivityArgs, jobActivityScope: 'creation-status' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText(copy.jobActivityStatusDescription)).toBeVisible();
    await expect(c.getByRole('switch', { name: copy.jobActivity })).toBeChecked();
  },
};

export const JobAssignmentEmailsActive: Story = {
  args: { ...jobActivityArgs, jobActivityScope: 'creation-status-assignment' },
};

export const JobAllActivityEmailsActive: Story = {
  args: { ...jobActivityArgs, jobActivityScope: 'all' },
};
