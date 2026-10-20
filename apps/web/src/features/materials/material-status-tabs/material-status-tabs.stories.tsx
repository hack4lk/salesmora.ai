import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import type { MaterialStatus } from '@salesmora/contracts';
import { MaterialStatusTabs, type MaterialStatusTabsProps } from './material-status-tabs';

function Stateful(props: Partial<MaterialStatusTabsProps>) {
  const [status, setStatus] = useState<MaterialStatus>('active');
  return <MaterialStatusTabs status={status} pendingProposals={2} canManage onChange={setStatus} {...props} />;
}
const meta = { title: 'Materials/MaterialStatusTabs', component: MaterialStatusTabs, args: { status: 'active', pendingProposals: 2, canManage: true, onChange: () => undefined } } satisfies Meta<typeof MaterialStatusTabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Manager: Story = {
  render: () => <Stateful />,
  play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: /Proposals/ })); await expect(c.getByRole('button', { name: /Proposals/ })).toHaveAttribute('aria-pressed', 'true'); },
};
export const Proposer: Story = { render: () => <Stateful canManage={false} /> };
export const NoPending: Story = { render: () => <Stateful pendingProposals={0} /> };
