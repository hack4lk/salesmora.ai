import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import type { MaterialStatus } from '@salesmora/contracts';
import { MaterialStatusTabs, type MaterialStatusTabsProps } from './material-status-tabs';

function Stateful(props: Partial<MaterialStatusTabsProps>) {
  const [status, setStatus] = useState<MaterialStatus>('active');
  return <MaterialStatusTabs status={status} pendingProposals={2} onChange={setStatus} {...props} />;
}
const meta = { title: 'Materials/MaterialStatusTabs', component: MaterialStatusTabs, args: { status: 'active', pendingProposals: 2, onChange: () => undefined } } satisfies Meta<typeof MaterialStatusTabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Manager: Story = {
  render: () => <Stateful />,
  play: async ({ canvasElement }) => { const c = within(canvasElement); c.getByRole('tab', { name: 'Catalog' }).focus(); await userEvent.keyboard('{ArrowRight}{Enter}'); await expect(c.getByRole('tab', { name: /^Proposed materials/ })).toHaveAttribute('aria-selected', 'true'); },
};
export const RejectedFilter: Story = {
  args: { status: 'rejected' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('tab')).toHaveLength(2);
    await expect(c.getByRole('tab', { name: /^Proposed materials/ })).toHaveAttribute('aria-selected', 'true');
  },
};
export const NoPending: Story = { render: () => <Stateful pendingProposals={0} /> };
