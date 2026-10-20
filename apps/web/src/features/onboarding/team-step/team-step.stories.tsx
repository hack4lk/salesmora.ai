import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ServicesTeamPreview } from '../services-area-step/services-team-preview';
import { SessionOwnerPreview } from './session-owner-preview';
import { TeamStep, type TeamStepProps, type TeamValues } from './team-step';
import { teamStepData as copy } from './team-step.data';
import { onboardingStepFrameData as frame } from '../onboarding-step-frame/onboarding-step-frame.data';
function Controlled(args: TeamStepProps) {
  const [values, setValues] = useState(args.values);
  return <TeamStep {...args} values={values} onChange={next => { setValues(next); args.onChange(next); }} />;
}
const filled: TeamValues = { invitations: [{ id: 'alex', email: copy.stories.email, role: 'office' }, { id: 'jordan', email: copy.stories.second, role: 'admin' }] };
const meta = {
  title: 'Onboarding/TeamStep', component: TeamStep,
  args: { ownerEmail: copy.stories.owner, values: { invitations: [] }, onChange: fn(), onContinue: fn(), onBack: fn(), onSkip: fn() },
  render: args => <Controlled {...args} />, parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="mx-auto grid w-full max-w-2xl gap-6 p-4 sm:p-8"><header><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p></header><Story /></main>],
} satisfies Meta<typeof TeamStep>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { render: args => <SessionOwnerPreview>{email => <ServicesTeamPreview values={{ services: ['repairs'], postalCode: '', serviceRange: '' }} onChange={() => {}} onBack={() => {}} onContinue={() => {}} ownerEmail={email} initialStep="team" teamArgs={args} />}</SessionOwnerPreview> };
export const Filled: Story = { args: { values: filled } };
export const ContinueSolo: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: frame.continue }));
  await expect(args.onContinue).toHaveBeenCalledWith({ invitations: [] });
} };
export const AddAndContinue: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.add }));
  const email = c.getByRole('textbox', { name: copy.email });
  await expect(email).toHaveFocus();
  await expect(c.getByRole('combobox', { name: copy.role })).toHaveValue('field');
  await userEvent.type(email, copy.stories.spaced);
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.role }), 'admin');
  await userEvent.click(c.getByRole('button', { name: frame.continue }));
  await expect(args.onContinue).toHaveBeenCalledWith({ invitations: [{ id: expect.any(String), email: copy.stories.email, role: 'admin' }] });
} };
export const ValidationRecovery: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.add }));
  await userEvent.click(c.getByRole('button', { name: frame.continue }));
  const email = c.getByRole('textbox', { name: copy.email });
  await expect(c.getByText(copy.errors.email)).toBeVisible();
  await expect(email).toHaveFocus();
  await expect(args.onContinue).not.toHaveBeenCalled();
  await userEvent.type(email, copy.stories.email);
  await expect(c.queryByText(copy.errors.email)).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: frame.continue }));
  await expect(args.onContinue).toHaveBeenCalledTimes(1);
} };
export const InvalidEmail: Story = { args: { values: { invitations: [{ ...filled.invitations[0], email: copy.stories.invalid }] } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: frame.continue }));
  await expect(c.getByText(copy.errors.email)).toBeVisible();
  await expect(args.onContinue).not.toHaveBeenCalled();
} };
export const DuplicateEmail: Story = { args: { values: { invitations: [filled.invitations[0], { ...filled.invitations[1], email: copy.stories.spaced }] } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: frame.continue }));
  await expect(c.getByText(copy.errors.duplicate)).toBeVisible();
  await expect(c.getAllByRole('textbox')[1]).toHaveFocus();
  await expect(args.onContinue).not.toHaveBeenCalled();
} };
export const OwnerEmail: Story = { args: { values: { invitations: [{ ...filled.invitations[0], email: copy.stories.owner }] } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: frame.continue }));
  await expect(c.getByText(copy.errors.owner)).toBeVisible();
} };
export const RemoveTeammate: Story = { args: { values: filled }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.remove(1) }));
  await expect(c.getAllByRole('textbox')).toHaveLength(1);
  await expect(c.getByRole('textbox')).toHaveValue(copy.stories.second);
  await expect(c.getByRole('button', { name: copy.add })).toHaveFocus();
  await userEvent.click(c.getByRole('button', { name: frame.continue }));
  await expect(args.onContinue).toHaveBeenCalledWith({ invitations: [filled.invitations[1]] });
} };
export const SkipAndBack: Story = { args: { values: { invitations: [{ ...filled.invitations[0], email: '' }] } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: frame.skipTeam }));
  await expect(args.onSkip).toHaveBeenCalledTimes(1);
  await userEvent.click(c.getByRole('button', { name: frame.back }));
  await expect(args.onBack).toHaveBeenCalledTimes(1);
  await expect(args.onContinue).not.toHaveBeenCalled();
  await expect(c.queryByText(copy.errors.email)).not.toBeInTheDocument();
} };
export const KeyboardSubmit: Story = { args: { values: { invitations: [filled.invitations[0]] } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('textbox'));
  await userEvent.keyboard('{Enter}');
  await expect(args.onContinue).toHaveBeenCalledWith({ invitations: [filled.invitations[0]] });
} };
export const Pending: Story = { args: { values: filled, pending: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  for (const field of [...c.getAllByRole('textbox'), ...c.getAllByRole('combobox'), ...c.getAllByRole('button')]) await expect(field).toBeDisabled();
} };
export const Mobile: Story = { args: { values: filled }, globals: { viewport: { value: 'phone', isRotated: false } } };
