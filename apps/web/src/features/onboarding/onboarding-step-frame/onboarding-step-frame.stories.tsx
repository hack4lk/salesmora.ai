import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { TextField } from '@salesmora/ui';
import { OnboardingStepFrame, type OnboardingStepFrameProps } from './onboarding-step-frame';
import { onboardingStepFrameData as copy, onboardingStepOrder, type OnboardingStep } from './onboarding-step-frame.data';

const meta = {
  title: 'Onboarding/OnboardingStepFrame', component: OnboardingStepFrame,
  parameters: { layout: 'fullscreen' },
  args: { activeStep: 'business', onContinue: fn(), onBack: fn(), onSkipTeam: fn(), children: <p className="m-0 rounded-xl bg-canvas p-6 text-sm text-muted">{copy.stories.placeholder}</p> },
  decorators: [(Story) => <main className="mx-auto grid w-full max-w-2xl gap-6 p-4 sm:p-8"><header><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p></header><Story /></main>],
} satisfies Meta<typeof OnboardingStepFrame>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Business: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('heading', { name: copy.steps.business.title })).toBeVisible();
  await expect(canvas.queryByRole('button', { name: copy.back })).not.toBeInTheDocument();
  await expect(canvas.getByRole('navigation')).toHaveAccessibleName(copy.progressLabel);
  await expect(canvasElement.querySelector('[aria-current=step]')).toHaveTextContent(copy.steps.business.label);
  await userEvent.click(canvas.getByRole('button', { name: copy.continue }));
  await expect(args.onContinue).toHaveBeenCalledTimes(1);
} };
export const Services: Story = { args: { activeStep: 'services' }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.back }));
  await expect(args.onBack).toHaveBeenCalledTimes(1);
  await expect(args.onContinue).not.toHaveBeenCalled();
} };
export const Team: Story = { args: { activeStep: 'team' }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.skipTeam }));
  await expect(args.onSkipTeam).toHaveBeenCalledTimes(1);
  await expect(args.onContinue).not.toHaveBeenCalled();
} };
export const Review: Story = { args: { activeStep: 'review' }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(args.onContinue).not.toHaveBeenCalled();
  await userEvent.click(canvas.getByRole('button', { name: copy.create }));
  await expect(args.onContinue).toHaveBeenCalledTimes(1);
  await expect(canvas.queryByRole('button', { name: copy.skipTeam })).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { activeStep: 'team', pending: true, children: <TextField label={copy.stories.keyboardLabel} /> }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('form')).toHaveAttribute('aria-busy', 'true');
  await expect(canvas.getByRole('textbox')).toBeDisabled();
  for (const button of canvas.getAllByRole('button')) await expect(button).toBeDisabled();
  await expect(args.onContinue).not.toHaveBeenCalled();
} };
export const Creating: Story = { args: { activeStep: 'review', pending: true } };
export const ContinueDisabled: Story = { args: { activeStep: 'services', continueDisabled: true }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('button', { name: copy.continue })).toBeDisabled();
  await expect(canvas.getByRole('button', { name: copy.back })).toBeEnabled();
  await expect(args.onContinue).not.toHaveBeenCalled();
} };
export const KeyboardSubmit: Story = { args: { children: <TextField label={copy.stories.keyboardLabel} /> }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole('textbox'), copy.stories.keyboardValue);
  await userEvent.keyboard('{Enter}');
  await expect(args.onContinue).toHaveBeenCalledTimes(1);
} };

function InteractiveFrame(args: OnboardingStepFrameProps) {
  const [step, setStep] = useState<OnboardingStep>('business');
  const index = onboardingStepOrder.indexOf(step);
  return <OnboardingStepFrame {...args} activeStep={step} onContinue={() => { args.onContinue(); if (index < 3) setStep(onboardingStepOrder[index + 1]); }} onBack={() => { args.onBack(); setStep(onboardingStepOrder[index - 1]); }} onSkipTeam={() => { args.onSkipTeam?.(); setStep('review'); }} />;
}
export const InteractiveNavigation: Story = { render: (args) => <InteractiveFrame {...args} />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.continue }));
  await expect(canvas.getByRole('heading', { name: copy.steps.services.title })).toHaveFocus();
  await userEvent.click(canvas.getByRole('button', { name: copy.continue }));
  await userEvent.click(canvas.getByRole('button', { name: copy.skipTeam }));
  await expect(canvas.getByRole('heading', { name: copy.steps.review.title })).toHaveFocus();
  await userEvent.click(canvas.getByRole('button', { name: copy.back }));
  await expect(canvas.getByRole('heading', { name: copy.steps.team.title })).toHaveFocus();
} };
export const Mobile: Story = { args: { activeStep: 'team' }, globals: { viewport: { value: 'phone', isRotated: false } } };
