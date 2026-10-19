import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { BusinessProfileStep, type BusinessProfileStepProps, type BusinessProfileValues } from './business-profile-step';
import { businessProfileStepData as copy } from './business-profile-step.data';
import { teamStepData as teamCopy } from '../team-step/team-step.data';
import { ServicesTeamPreview } from '../services-area-step/services-team-preview';
import { servicesAreaStepData as area } from '../services-area-step/services-area-step.data';
import { onboardingStepFrameData as frame } from '../onboarding-step-frame/onboarding-step-frame.data';

function ControlledStep(args: BusinessProfileStepProps) {
  const [values, setValues] = useState(args.values);
  return <BusinessProfileStep {...args} values={values} onChange={(next) => { setValues(next); args.onChange(next); }} />;
}
const meta = {
  title: 'Onboarding/BusinessProfileStep', component: BusinessProfileStep,
  args: { values: { businessName: '', businessType: '' }, onChange: fn(), onContinue: fn() },
  render: (args) => <ControlledStep {...args} />,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="mx-auto grid w-full max-w-2xl gap-6 p-4 sm:p-8"><header><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p></header><Story /></main>],
} satisfies Meta<typeof BusinessProfileStep>;
export default meta;
type Story = StoryObj<typeof meta>;
const valid: BusinessProfileValues = { businessName: copy.stories.name, businessType: 'plumbing' };

export const Default: Story = { render: (args) => <BackAndContinueDemo {...args} /> };
export const Filled: Story = { args: { values: valid }, render: (args) => <BackAndContinueDemo {...args} /> };
export const RequiredValidation: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await expect(canvas.getByRole('textbox')).toHaveFocus();
  await expect(canvas.getByText(copy.errors.name)).toBeVisible();
  await expect(canvas.getByText(copy.errors.type)).toBeVisible();
  await expect(args.onContinue).not.toHaveBeenCalled();
} };
export const TypeRequired: Story = { args: { values: { ...valid, businessType: '' } }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await expect(canvas.getByRole('combobox')).toHaveFocus();
  await expect(args.onContinue).not.toHaveBeenCalled();
} };
export const ValidationRecovery: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await userEvent.type(canvas.getByRole('textbox'), copy.stories.spacedName);
  await userEvent.selectOptions(canvas.getByRole('combobox'), valid.businessType);
  await expect(canvas.queryByText(copy.errors.name)).not.toBeInTheDocument();
  await expect(canvas.queryByText(copy.errors.type)).not.toBeInTheDocument();
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await expect(args.onContinue).toHaveBeenCalledWith(valid);
} };
export const WhitespaceName: Story = { args: { values: { ...valid, businessName: '   ' } }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await expect(canvas.getByRole('textbox')).toHaveFocus();
  await expect(canvas.getByText(copy.errors.name)).toBeVisible();
  await expect(args.onContinue).not.toHaveBeenCalled();
} };
export const BusinessTypes: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole('textbox'), valid.businessName);
  const select = canvas.getByRole('combobox');
  await expect(canvas.getAllByRole('option')).toHaveLength(copy.types.length + 1);
  for (const type of copy.types) {
    await userEvent.selectOptions(select, type.value);
    await expect(select).toHaveValue(type.value);
  }
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await expect(args.onContinue).toHaveBeenCalledWith({ ...valid, businessType: 'other' });
} };
export const Pending: Story = { args: { values: valid, pending: true }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('textbox')).toBeDisabled();
  await expect(canvas.getByRole('combobox')).toBeDisabled();
  await expect(canvas.getByRole('button', { name: frame.pending })).toBeDisabled();
} };
export const KeyboardSubmit: Story = { args: { values: valid }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('textbox'));
  await userEvent.keyboard('{Enter}');
  await expect(args.onContinue).toHaveBeenCalledWith(valid);
} };

function BackAndContinueDemo(args: BusinessProfileStepProps & { ownerEmail?: string }) {
  return <ServicesTeamPreview values={{ services: [], postalCode: '', serviceRange: '' }} onChange={() => {}} onBack={() => {}} onContinue={() => {}} initialStep="business" businessArgs={args} ownerEmail={args.ownerEmail} />;
}
export const BackAndContinue: Story = { render: (args) => <BackAndContinueDemo {...args} ownerEmail={teamCopy.stories.owner} />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole('textbox'), valid.businessName);
  await userEvent.selectOptions(canvas.getByRole('combobox'), valid.businessType);
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await expect(canvas.getByRole('heading', { name: frame.steps.services.title })).toHaveFocus();
  await userEvent.type(canvas.getByRole('combobox', { name: area.services }), area.serviceOptions[0].label);
  await userEvent.click(await canvas.findByRole('option', { name: area.serviceOptions[0].label }));
  await userEvent.keyboard('{Escape}');
  await userEvent.type(canvas.getByRole('textbox'), area.stories.postal);
  await userEvent.selectOptions(canvas.getByRole('combobox', { name: area.range }), '25-miles');
  await userEvent.click(canvas.getByRole('button', { name: frame.back }));
  await expect(canvas.getByRole('textbox')).toHaveValue(valid.businessName);
  await expect(canvas.getByRole('combobox')).toHaveValue(valid.businessType);
  await expect(canvas.getByRole('heading', { name: frame.steps.business.title })).toHaveFocus();
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await expect(canvas.getByRole('button', { name: area.removeLabel(area.serviceOptions[0].label) })).toBeVisible();
  await expect(canvas.getByRole('textbox')).toHaveValue(area.stories.postal);
  await expect(canvas.getByRole('combobox', { name: area.range })).toHaveValue('25-miles');
  await userEvent.click(canvas.getByRole('button', { name: frame.continue }));
  await expect(canvas.getByRole('heading', { name: frame.steps.team.title })).toHaveFocus();
  await userEvent.click(canvas.getByRole('button', { name: frame.back }));
} };
export const Mobile: Story = { render: (args) => <BackAndContinueDemo {...args} />, args: { values: { ...valid, businessType: 'construction' } }, globals: { viewport: { value: 'phone', isRotated: false } } };
