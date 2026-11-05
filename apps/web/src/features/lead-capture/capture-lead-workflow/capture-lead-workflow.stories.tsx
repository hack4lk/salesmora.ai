import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CaptureLeadWorkflow, type CaptureLeadWorkflowProps } from './capture-lead-workflow';
import { captureLeadWorkflowData as copy } from './capture-lead-workflow.data';
import { defaultCaptureLeadWorkflow as defaults } from './capture-lead-workflow.validation';
function Preview(args: CaptureLeadWorkflowProps) {
  const [value, setValue] = useState(args.value);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><p className="mb-6 mt-0 text-sm text-muted">{copy.stories.description}</p><CaptureLeadWorkflow {...args} value={value} onChange={next => { args.onChange(next); setValue(next); }} /></main>;
}
const meta = {
  title: 'Lead Capture/CaptureLeadWorkflow', component: CaptureLeadWorkflow, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  args: { value: defaults, source: 'website', teammates: copy.stories.teammates, canRead: true, canEdit: true, onChange: fn<CaptureLeadWorkflowProps['onChange']>(), onRetryTeammates: fn() },
} satisfies Meta<typeof CaptureLeadWorkflow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('radio', { name: copy.defaultAssignment })).toBeChecked();
  await expect(c.getByRole('combobox', { name: copy.stage })).toHaveValue('new');
  await expect(c.getByRole('checkbox', { name: copy.notify })).toBeChecked();
  await expect(c.getByText(copy.noTags)).toBeVisible();
} };
export const Gmail: Story = { args: { source: 'gmail' }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.applied.gmail)).toBeVisible();
} };
export const SelectTeammate: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('radio', { name: copy.teammateAssignment }));
  await expect(c.getByRole('combobox', { name: copy.teammate })).toHaveValue('');
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.teammate }), copy.stories.teammates[1].id);
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...defaults, assignment: 'teammate', teammateId: copy.stories.teammates[1].id });
  await expect(within(c.getByRole('region', { name: copy.summary })).getByText(copy.stories.teammates[1].name)).toBeVisible();
} };
export const BusinessDefault: Story = { args: { value: { ...defaults, assignment: 'teammate', teammateId: copy.stories.teammates[0].id } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('radio', { name: copy.defaultAssignment }));
  await expect(c.queryByRole('combobox', { name: copy.teammate })).not.toBeInTheDocument();
  await expect(args.onChange).toHaveBeenLastCalledWith(defaults);
} };
export const ChangeStageAndTags: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.selectOptions(c.getByRole('combobox', { name: copy.stage }), 'contacted');
  await userEvent.type(c.getByRole('textbox', { name: new RegExp(copy.tags) }), copy.stories.tags);
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...defaults, stage: 'contacted', tagsText: copy.stories.tags });
  const summary = within(c.getByRole('region', { name: copy.summary }));
  for (const tag of copy.stories.tags.split(', ')) await expect(summary.getByText(tag, { exact: true })).toBeVisible();
} };
export const NotificationsOff: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('checkbox', { name: copy.notify }));
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...defaults, notifyAssigned: false });
  await expect(c.getByText(copy.disabled, { exact: true })).toBeVisible();
} };
export const MissingTeammate: Story = { args: { value: { ...defaults, assignment: 'teammate', teammateId: copy.stories.unknown }, showErrors: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('combobox', { name: copy.teammate })).toHaveValue(copy.stories.unknown);
  await expect(c.getByText(copy.incomplete)).toBeVisible();
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.teammate }), copy.stories.teammates[0].id);
  await expect(c.queryByText(copy.incomplete)).not.toBeInTheDocument();
} };
export const InvalidTags: Story = { args: { value: { ...defaults, tagsText: copy.stories.duplicateTags }, showErrors: true }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(copy.errors.tags);
} };
export const NoTeammates: Story = { args: { teammates: [] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('radio', { name: copy.teammateAssignment })).toBeDisabled(); await expect(c.getByText(copy.empty)).toBeVisible();
} };
export const LoadingTeammates: Story = { args: { teammatesState: 'loading', value: { ...defaults, assignment: 'teammate', teammateId: copy.stories.teammates[0].id } } };
export const TeammatesFailure: Story = { args: { teammatesState: 'error' }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.retry })); await expect(args.onRetryTeammates).toHaveBeenCalledTimes(1);
} };
export const ReadOnly: Story = { args: { canEdit: false, value: { ...defaults, assignment: 'teammate', teammateId: copy.stories.teammates[0].id, tagsText: copy.stories.tags } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); for (const role of ['radio', 'checkbox', 'combobox', 'textbox'] as const) for (const input of c.getAllByRole(role)) await expect(input).toBeDisabled();
  await expect(args.onChange).not.toHaveBeenCalled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); for (const role of ['radio', 'checkbox', 'combobox', 'textbox'] as const) for (const input of c.getAllByRole(role)) await expect(input).toBeDisabled();
  await expect(args.onChange).not.toHaveBeenCalled();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByRole('radio')).not.toBeInTheDocument();
} };
export const LongContent: Story = { args: { teammates: [{ id: 'long', name: copy.stories.long }], value: { ...defaults, assignment: 'teammate', teammateId: 'long', tagsText: Array.from({ length: 10 }, (_, index) => `${index} ${copy.stories.longTag}`).join(',') } } };
export const Narrow: Story = { globals: { viewport: { value: 'mobile1', isRotated: false } } };
