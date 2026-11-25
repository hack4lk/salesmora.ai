import { useState, type MouseEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { workspacePlanIdSchema, workspacePlanIds, type WorkspacePlanId } from '@salesmora/contracts';
import { RegistrationPlanScreen } from '../../auth/registration-plan-screen/registration-plan-screen';
import { registrationPlanScreenData as registration } from '../../auth/registration-plan-screen/registration-plan-screen.data';
import { PlanOverview } from './plan-overview';
import { planOverviewData as copy } from './plan-overview.data';

const meta = {
  title: 'Public Site/PlanOverview',
  component: PlanOverview,
  parameters: { layout: 'fullscreen' },
  args: { createAccountHref: '/register' },
} satisfies Meta<typeof PlanOverview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: copy.title })).toHaveAttribute('id', 'plans');
    for (const name of Object.values(copy.names)) {
      await expect(canvas.getByRole('heading', { name, level: 3 })).toBeVisible();
    }
    const links = canvas.getAllByRole('link', { name: copy.action });
    await expect(links).toHaveLength(3);
    for (const [index, link] of links.entries()) {
      await expect(link).toHaveAttribute('href', `${args.createAccountHref}?plan=${workspacePlanIds[index]}`);
    }
    await expect(canvas.getByText('Unlimited published capture sources', { exact: false })).toBeVisible();
    for (const count of [2, 10, 25]) {
      await expect(canvas.getByText(`${count} AI-assisted workflows`, { exact: false })).toBeVisible();
    }
    await expect(canvas.getAllByText(copy.limitPlanned)).toHaveLength(3);
    await expect(canvas.getAllByText(copy.planned)).toHaveLength(6);
    await expect(canvas.queryByText(/Lead and AI allowances reset monthly/)).not.toBeInTheDocument();
    for (const price of ['$0', '$29', '$49']) {
      await expect(canvas.getByText(price, { exact: true })).toBeVisible();
    }
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'phone', isRotated: false } },
  play: Default.play,
};

export const ExistingQuery: Story = {
  args: { createAccountHref: '/register?source=home&plan=old#start' },
  play: async ({ canvasElement }) => {
    const links = within(canvasElement).getAllByRole('link', { name: copy.action });
    for (const [index, link] of links.entries()) {
      await expect(link).toHaveAttribute('href', `/register?source=home&plan=${workspacePlanIds[index]}#start`);
    }
  },
};

function HandoffPreview() {
  const [selected, setSelected] = useState<WorkspacePlanId | null>(null);
  function navigate(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a');
    if (!link) return;
    event.preventDefault();
    const params = new URL(link.href).searchParams;
    const values = params.getAll('plan');
    const parsed = workspacePlanIdSchema.safeParse(values.length === 1 ? values[0] : undefined);
    if (!parsed.success) throw new Error('Invalid plan in the preview link.');
    setSelected(parsed.data);
  }
  if (selected) return <div>
    <button type="button" onClick={() => setSelected(null)}>Back to plan overview</button>
    <RegistrationPlanScreen initialPlan={selected} initialStage="account" notice={registration.preview} onSubmit={async () => ({ ok: true })} />
  </div>;
  return <div onClick={navigate}><PlanOverview createAccountHref="/register" /></div>;
}

export const PlanHandoff: Story = { render: () => <HandoffPreview /> };
export const PlanHandoffInteraction: Story = {
  render: () => <HandoffPreview />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [index, name] of ['Free', 'Standard', 'Premium'].entries()) {
      const card = canvas.getAllByRole('article')[index];
      await userEvent.click(within(card).getByRole('link', { name: copy.action }));
      await expect(canvas.getByRole('heading', { name: registration.accountTitle })).toBeVisible();
      await expect(canvas.getByText(new RegExp(`${name} ·`))).toBeVisible();
      await userEvent.click(canvas.getByRole('button', { name: registration.change }));
      await expect(canvas.getByRole('radio', { name })).toBeChecked();
      await userEvent.click(canvas.getByRole('button', { name: 'Back to plan overview' }));
    }
  },
};
