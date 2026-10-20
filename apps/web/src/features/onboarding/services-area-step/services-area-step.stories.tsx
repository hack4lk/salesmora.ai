import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ServicesAreaStep, type ServicesAreaStepProps, type ServicesAreaValues } from './services-area-step';
import { servicesAreaStepData as copy } from './services-area-step.data';
import { ServicesTeamPreview } from './services-team-preview';
import { teamStepData as teamCopy } from '../team-step/team-step.data';
import { onboardingStepFrameData as frame } from '../onboarding-step-frame/onboarding-step-frame.data';
function ControlledStep(args: ServicesAreaStepProps) {
  const [values, setValues] = useState(args.values);
  return <ServicesAreaStep {...args} values={values} onChange={(next) => { setValues(next); args.onChange(next); }} />;
}
const empty: ServicesAreaValues = { services: [], postalCode: '', serviceRange: '' };
const filled: ServicesAreaValues = { services: ['repairs', 'maintenance'], postalCode: copy.stories.postal, serviceRange: '25-miles' };
const meta = {
  title: 'Onboarding/ServicesAreaStep', component: ServicesAreaStep,
  args: { values: empty, onChange: fn(), onContinue: fn(), onBack: fn() },
  render: (args) => <ControlledStep {...args} />,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="mx-auto grid w-full max-w-2xl gap-6 p-4 sm:p-8"><header><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p></header><Story /></main>],
} satisfies Meta<typeof ServicesAreaStep>;
export default meta;
type Story = StoryObj<typeof meta>;
const search = (canvas: ReturnType<typeof within>) => canvas.getByRole('combobox', { name: copy.services });
const range = (canvas: ReturnType<typeof within>) => canvas.getByRole('combobox', { name: copy.range });
async function selectService(canvas: ReturnType<typeof within>, label: string) {
  await userEvent.clear(search(canvas));
  await userEvent.type(search(canvas), label);
  await userEvent.click(await canvas.findByRole('option', { name: label }));
  await userEvent.keyboard('{Escape}');
}
export const Default: Story = { render: args => <ServicesTeamPreview {...args} /> };
export const Filled: Story = { args: { values: filled }, render: args => <ServicesTeamPreview {...args} /> };
export const RequiredValidation: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await expect(canvas.getByText(copy.errors.services)).toBeVisible();
  await expect(search(canvas)).toHaveFocus();
  await expect(args.onContinue).not.toHaveBeenCalled();
} };
export const ValidationRecovery: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await selectService(canvas, copy.serviceOptions[0].label);
  await expect(canvas.queryByText(copy.errors.services)).not.toBeInTheDocument();
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await expect(args.onContinue).toHaveBeenCalledWith({ ...empty, services: ['repairs'] });
} };
export const OtherOnly: Story = { args: { values: { ...empty, services: ['other'] } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: frame.continue }));
  await expect(args.onContinue).toHaveBeenCalledWith({ ...empty, services: ['other'] });
} };
export const SearchAndSelectMultiple: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await selectService(canvas, 'Drain cleaning');
  await selectService(canvas, 'Pet grooming');
  await expect(canvas.getByRole('button', { name: copy.removeLabel('Drain cleaning') })).toBeVisible();
  await expect(canvas.getByRole('button', { name: copy.removeLabel('Pet grooming') })).toBeVisible();
  await expect(canvas.getByRole('status')).toHaveTextContent(copy.selectionCount(2));
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await expect(args.onContinue).toHaveBeenCalledWith({ ...empty, services: ['drain-cleaning', 'pet-grooming'] });
} };
export const SearchByCategory: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.type(search(canvas), 'pet care');
  await expect(await canvas.findByRole('option', { name: 'Pet grooming' })).toBeVisible();
  await expect(canvas.getAllByRole('option')).toHaveLength(5);
  await expect(canvas.queryByRole('option', { name: 'Drain cleaning' })).not.toBeInTheDocument();
} };
export const NoMatches: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.type(search(canvas), 'zzzznomatch');
  await expect(await canvas.findByText(copy.noOptions)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await expect(args.onContinue).not.toHaveBeenCalled();
} };
export const RemoveAndClear: Story = { args: { values: filled }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.removeLabel('Repairs') }));
  await expect(canvas.queryByRole('button', { name: copy.removeLabel('Repairs') })).not.toBeInTheDocument();
  await expect(search(canvas)).toHaveFocus();
  await userEvent.click(search(canvas));
  await userEvent.click(canvas.getByRole('button', { name: copy.clear }));
  await userEvent.keyboard('{Escape}');
  await expect(canvas.queryByRole('list', { name: copy.selected })).not.toBeInTheDocument();
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await expect(canvas.getByText(copy.errors.services)).toBeVisible();
  await expect(args.onContinue).not.toHaveBeenCalled();
} };
export const NoDuplicateSelection: Story = { args: { values: { ...empty, services: ['drain-cleaning'] } }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.type(search(canvas), 'Drain cleaning');
  await expect(await canvas.findByRole('option', { name: 'Drain cleaning' })).toHaveAttribute('aria-selected', 'true');
  await userEvent.click(canvas.getByRole('option', { name: 'Drain cleaning' }));
  await expect(canvas.getByRole('status')).toHaveTextContent(copy.selectionCount(0));
  await userEvent.click(canvas.getByRole('option', { name: 'Drain cleaning' }));
  await expect(canvas.getByRole('status')).toHaveTextContent(copy.selectionCount(1));
  await userEvent.keyboard('{Escape}');
} };
export const OptionalArea: Story = { args: { values: { ...empty, services: ['inspection'] } }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole('textbox'), copy.stories.spacedPostal);
  await userEvent.selectOptions(range(canvas), 'multiple-regions');
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await expect(args.onContinue).toHaveBeenCalledWith({ services: ['inspection'], postalCode: copy.stories.normalizedPostal, serviceRange: 'multiple-regions' });
} };
export const Pending: Story = { args: { values: filled, pending: true }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(search(canvas)).toBeDisabled();
  await expect(canvas.getByRole('textbox')).toBeDisabled();
  await expect(range(canvas)).toBeDisabled();
  for (const button of canvas.getAllByRole('button')) await expect(button).toBeDisabled();
  await expect(args.onContinue).not.toHaveBeenCalled();
} };
export const BackWithoutValidation: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: frame.back }));
  await expect(args.onBack).toHaveBeenCalledTimes(1);
  await expect(args.onContinue).not.toHaveBeenCalled();
  await expect(canvas.queryByText(copy.errors.services)).not.toBeInTheDocument();
} };
export const Keyboard: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.type(search(canvas), 'Drain cleaning');
  await userEvent.keyboard('{ArrowDown}{Enter}{Escape}');
  await expect(canvas.getByRole('button', { name: copy.removeLabel('Drain cleaning') })).toBeVisible();
  await expect(args.onContinue).not.toHaveBeenCalled();
  await userEvent.click(canvas.getByRole('textbox'));
  await userEvent.keyboard('{Enter}');
  await expect(args.onContinue).toHaveBeenCalledWith({ ...empty, services: ['drain-cleaning'] });
} };
export const BackAndContinue: Story = { args: { values: filled }, render: (args) => <ServicesTeamPreview {...args} ownerEmail={teamCopy.stories.owner} />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await expect(canvas.getByRole('heading', { name: frame.steps.team.title })).toHaveFocus();
  await userEvent.click(canvas.getByRole('button', { name: teamCopy.add }));
  await userEvent.type(canvas.getByRole('textbox', { name: teamCopy.email }), teamCopy.stories.email);
  await userEvent.click(canvas.getByRole('button', { name: frame.back }));
  for (const name of ['Repairs', 'Maintenance']) await expect(canvas.getByRole('button', { name: copy.removeLabel(name) })).toBeVisible();
  await expect(canvas.getByRole('textbox')).toHaveValue(filled.postalCode);
  await expect(range(canvas)).toHaveValue(filled.serviceRange);
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await expect(canvas.getByRole('textbox', { name: teamCopy.email })).toHaveValue(teamCopy.stories.email);
} };
export const Mobile: Story = { render: args => <ServicesTeamPreview {...args} />, args: { values: { ...filled, services: ['water-heater-installation', 'air-conditioning-installation', 'gutter-installation-cleaning'] } }, globals: { viewport: { value: 'phone', isRotated: false } } };
