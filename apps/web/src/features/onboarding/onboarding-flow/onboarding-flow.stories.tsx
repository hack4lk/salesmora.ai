import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { FormFeedback } from '@salesmora/ui';
import { OnboardingFlow, type OnboardingFlowProps } from './onboarding-flow';
import { onboardingFlowData as copy } from './onboarding-flow.data';
import { onboardingStepFrameData as frame } from '../onboarding-step-frame/onboarding-step-frame.data';
import { businessProfileStepData as business } from '../business-profile-step/business-profile-step.data';
import { servicesAreaStepData as services } from '../services-area-step/services-area-step.data';
function Preview(args: OnboardingFlowProps) {
  const [complete, setComplete] = useState(false);
  return complete ? <FormFeedback kind="success" message={copy.stories.success} /> : <OnboardingFlow {...args} onCreated={() => { setComplete(true); args.onCreated(); }} />;
}
const meta = {
  title: 'Onboarding/OnboardingFlow', component: OnboardingFlow,
  args: { ownerEmail: copy.stories.email, onCreate: fn().mockResolvedValue({ ok: true }), onCreated: fn() },
  render: args => <Preview {...args} />, parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="mx-auto grid w-full max-w-2xl gap-6 p-4 sm:p-8"><header><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-2 text-sm text-muted">{copy.stories.notice}</p></header><Story /></main>],
} satisfies Meta<typeof OnboardingFlow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const CreateAndRetry: Story = { args: { onCreate: fn().mockResolvedValueOnce({ ok: false, status: 500 }).mockResolvedValue({ ok: true }) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.type(c.getByRole('textbox', { name: business.name }), copy.stories.name);
  await userEvent.selectOptions(c.getByRole('combobox'), 'plumbing');
  await userEvent.click(c.getByRole('button', { name: frame.continue }));
  await userEvent.type(c.getByRole('combobox', { name: services.services }), copy.stories.service);
  await userEvent.click(await c.findByRole('option', { name: copy.stories.service }));
  await userEvent.keyboard('{Escape}');
  await userEvent.click(c.getByRole('button', { name: frame.continue }));
  await userEvent.click(c.getByRole('button', { name: frame.skipTeam }));
  await userEvent.click(c.getByRole('button', { name: frame.create }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.error);
  await expect(c.getByText(copy.stories.name)).toBeVisible();
  await expect(args.onCreated).not.toHaveBeenCalled();
  await userEvent.click(c.getByRole('button', { name: frame.create }));
  await expect(args.onCreate).toHaveBeenLastCalledWith({ business: { businessName: copy.stories.name, businessType: 'plumbing' }, services: { services: ['drain-cleaning'], postalCode: '', serviceRange: '' }, team: { invitations: [] } });
  await expect(c.getByRole('status')).toHaveTextContent(copy.stories.success);
  await expect(args.onCreated).toHaveBeenCalledTimes(1);
} };
