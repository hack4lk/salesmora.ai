import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IntakeDuplicateDecision, type IntakeDuplicateDecisionProps } from './intake-duplicate-decision';
import { intakeDuplicateDecisionData as copy } from './intake-duplicate-decision.data';
import type { IntakeDuplicateChoice, IntakeDuplicateMatch } from './intake-duplicate-decision.validation';
const review = { intakeId: 'intake-item', intakeVersion: 1, revision: 'review-1', resolved: false };
const changes = [
  { id: 'phone', label: copy.stories.phone, existing: copy.stories.oldPhone, proposed: copy.stories.newPhone },
  { id: 'service', label: copy.stories.service, existing: copy.stories.oldService, proposed: copy.stories.newService },
  { id: 'stage', label: copy.stories.stage, existing: copy.stories.oldStage, proposed: copy.stories.newStage },
  { id: 'tags', label: copy.stories.tags, existing: copy.stories.oldTags, proposed: copy.stories.newTags },
];
const matches: IntakeDuplicateMatch[] = [{ id: 'lead-1', version: 3, name: copy.stories.name, contact: copy.stories.contact, reason: copy.stories.reason, canLink: true, changes }];
const link: IntakeDuplicateChoice = { kind: 'link', reviewRevision: review.revision, leadId: 'lead-1', leadVersion: 3, changeIds: [] };
function Preview(args: IntakeDuplicateDecisionProps) {
  const [value, setValue] = useState(args.value);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><p className="mb-6 mt-0 text-sm text-muted">{copy.stories.description}</p><div className="mx-auto max-w-3xl"><IntakeDuplicateDecision {...args} value={value} onChange={next => { args.onChange(next); setValue(next); }} /></div></main>;
}
const meta = {
  title: 'Lead Capture/IntakeDuplicateDecision', component: IntakeDuplicateDecision, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  args: { review, matches, value: null, canRead: true, canReadMatches: true, canChoose: true, canCreateSeparate: true, canDismiss: true, onChange: fn(), onRetry: fn() },
} satisfies Meta<typeof IntakeDuplicateDecision>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { value: link } };
export const FreshDecision: Story = { play: async ({ canvasElement, args }) => { const c = within(canvasElement); for (const radio of c.getAllByRole('radio')) await expect(radio).not.toBeChecked(); await expect(args.onChange).not.toHaveBeenCalled(); } };
export const SelectChanges: Story = { args: { value: link }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); for (const checkbox of c.getAllByRole('checkbox')) await expect(checkbox).not.toBeChecked();
  await userEvent.click(c.getByRole('checkbox', { name: copy.apply(copy.stories.phone) })); await expect(args.onChange).toHaveBeenLastCalledWith({ ...link, changeIds: ['phone'] });
  await userEvent.click(c.getByRole('checkbox', { name: copy.apply(copy.stories.stage) })); await expect(args.onChange).toHaveBeenLastCalledWith({ ...link, changeIds: ['phone', 'stage'] });
  await userEvent.click(c.getByRole('checkbox', { name: copy.apply(copy.stories.phone) })); await expect(args.onChange).toHaveBeenLastCalledWith({ ...link, changeIds: ['stage'] });
} };
export const ThreeChoices: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('radio', { name: new RegExp(copy.link) })); await expect(args.onChange).toHaveBeenLastCalledWith(link);
  await userEvent.click(c.getByRole('checkbox', { name: copy.apply(copy.stories.tags) }));
  await userEvent.click(c.getByRole('radio', { name: new RegExp(copy.separate) })); await expect(args.onChange).toHaveBeenLastCalledWith({ kind: 'separate', reviewRevision: review.revision }); await expect(c.queryByRole('checkbox')).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('radio', { name: new RegExp(copy.dismiss) })); await expect(args.onChange).toHaveBeenLastCalledWith({ kind: 'dismiss', reviewRevision: review.revision });
} };
export const MultipleMatches: Story = { args: { value: link, matches: [...matches, { ...matches[0], id: 'lead-2', version: 5, name: copy.stories.otherName, contact: copy.stories.otherContact, reason: copy.stories.otherReason }] }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('checkbox', { name: copy.apply(copy.stories.phone) })); await userEvent.click(c.getByRole('radio', { name: new RegExp(copy.stories.otherReason) })); await expect(args.onChange).toHaveBeenLastCalledWith({ ...link, leadId: 'lead-2', leadVersion: 5, changeIds: [] });
} };
export const LinkOnly: Story = { args: { value: link, matches: [{ ...matches[0], changes: [] }] }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByText(copy.noChanges)).toBeVisible(); await expect(c.queryByRole('checkbox')).not.toBeInTheDocument(); } };
export const CapacityBlocked: Story = { args: { canCreateSeparate: false }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('radio', { name: new RegExp(copy.separate) })).toBeDisabled(); await expect(c.getByRole('radio', { name: new RegExp(copy.link) })).toBeEnabled(); await expect(c.getByRole('radio', { name: new RegExp(copy.dismiss) })).toBeEnabled(); } };
export const MatchAccessDenied: Story = { args: { canReadMatches: false }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByText(copy.missingAccess)).toBeVisible(); await expect(c.queryByText(copy.stories.name)).not.toBeInTheDocument(); await expect(c.getByRole('radio', { name: new RegExp(copy.link) })).toBeDisabled(); } };
export const ReadOnly: Story = { args: { value: link, canChoose: false }, play: async ({ canvasElement }) => { const c = within(canvasElement); for (const control of [...c.getAllByRole('radio'), ...c.getAllByRole('checkbox')]) await expect(control).toBeDisabled(); } };
export const Pending: Story = { args: { value: link, pending: true }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); for (const control of [...c.getAllByRole('radio'), ...c.getAllByRole('checkbox')]) await expect(control).toBeDisabled(); await userEvent.click(c.getByRole('checkbox', { name: copy.apply(copy.stories.phone) })); await expect(args.onChange).not.toHaveBeenCalled(); } };
export const StaleReview: Story = { args: { value: link, review: { ...review, revision: 'review-2' } }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.stale); await expect(c.queryByRole('checkbox')).not.toBeInTheDocument(); await userEvent.click(c.getByRole('radio', { name: new RegExp(copy.link) })); await expect(args.onChange).toHaveBeenLastCalledWith({ ...link, reviewRevision: 'review-2' }); } };
export const LoadingMatches: Story = { args: { matchesState: 'loading' }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('status')).toHaveAttribute('aria-busy', 'true'); await expect(c.queryByText(copy.stories.name)).not.toBeInTheDocument(); } };
export const MatchesError: Story = { args: { matchesState: 'error' }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.error); await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(args.onRetry).toHaveBeenCalledTimes(1); await expect(c.queryByText(copy.stories.name)).not.toBeInTheDocument(); } };
export const NoMatches: Story = { args: { matches: [] } };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByText(copy.stories.name)).not.toBeInTheDocument(); await expect(c.queryByRole('radio')).not.toBeInTheDocument(); } };
export const Resolved: Story = { args: { review: { ...review, resolved: true } }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.resolved); for (const radio of c.getAllByRole('radio')) await expect(radio).toBeDisabled(); } };
export const LongContent: Story = { args: { value: link, matches: [{ ...matches[0], name: copy.stories.long.repeat(2), changes: changes.map(change => ({ ...change, existing: copy.stories.long.repeat(2), proposed: copy.stories.long.repeat(3) })) }] } };
