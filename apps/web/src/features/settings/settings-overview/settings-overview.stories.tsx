import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SettingsOverview, type SettingsOverviewProps } from './settings-overview';
import { settingsOverviewData as copy } from './settings-overview.data';

const meta = {
  title: 'Settings/SettingsOverview', component: SettingsOverview,
  parameters: { layout: 'fullscreen' },
  args: { workspaceName: copy.stories.workspace, profile: { businessName: copy.stories.workspace, businessType: 'plumbing', postalCode: copy.stories.postalCode, serviceRange: '25-miles', services: ['repairs', 'drain-cleaning'] }, permissionsHref: copy.stories.permissionsHref, aiUsageHref: '/settings/ai-usage?workspace=fictional-workspace' },
  decorators: [Story => <main className="mx-auto min-h-screen max-w-6xl p-4 sm:p-8"><Story /></main>],
} satisfies Meta<typeof SettingsOverview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Owner: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('heading', { name: copy.title, level: 1 })).toBeVisible();
  await expect(c.getByRole('heading', { name: copy.businessTitle })).toBeVisible();
  await expect(c.getByRole('link', { name: copy.managePermissions })).toHaveAttribute('href', copy.stories.permissionsHref);
} };
export const Admin: Story = { args: { permissionsHref: undefined, aiUsageHref: undefined }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('link', { name: copy.viewAIUsage })).not.toBeInTheDocument();
  await expect(c.getByRole('heading', { name: copy.businessTitle })).toBeVisible();
  await expect(c.queryByRole('link', { name: copy.managePermissions })).not.toBeInTheDocument();
} };
export const PermissionsOnly: Story = { args: { profile: null, aiUsageHref: undefined }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('heading', { name: copy.businessTitle })).not.toBeInTheDocument();
  await expect(c.getByRole('link', { name: copy.managePermissions })).toBeVisible();
} };
export const MissingOptionalDetails: Story = { args: { profile: { ...meta.args.profile, postalCode: '', serviceRange: '', services: [] } } };
export const LongContent: Story = { args: { workspaceName: copy.stories.longWorkspace, profile: { ...meta.args.profile, businessName: copy.stories.longWorkspace } } };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const JobNotifications: Story = { args: { jobNotificationsHref: '/settings/job-notifications?workspace=fictional-workspace' }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('link', { name: copy.viewJobNotifications })).toHaveAttribute('href', '/settings/job-notifications?workspace=fictional-workspace'); } };

function EstimatesPreview(args: SettingsOverviewProps) {
  const [requested, setRequested] = useState(false);
  return <div onClick={event => {
    if (event.target instanceof Element && event.target.closest('a')) {
      event.preventDefault();
      if (event.target.closest('a')?.getAttribute('href') === args.estimatesHref) setRequested(true);
    }
  }}>
    <p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.stories.estimatesNotice}</p>
    <SettingsOverview {...args} />
    {requested && <p role="status" className="mt-4 text-sm text-muted">{copy.stories.estimatesNavigation}</p>}
  </div>;
}
async function estimatesVisible({ canvasElement }: { canvasElement: HTMLElement }) {
  const c = within(canvasElement);
  const card = within(c.getByRole('region', { name: copy.estimatesTitle }));
  await expect(card.getByText(copy.estimatesDescription)).toBeVisible();
  await expect(card.getByRole('link', { name: copy.viewEstimates })).toHaveAttribute('href', copy.stories.estimatesHref);
  await expect(card.queryByRole('textbox')).not.toBeInTheDocument();
  await expect(card.queryByRole('button')).not.toBeInTheDocument();
  await expect(card.queryByRole('img')).not.toBeInTheDocument();
}
export const EstimatesOwner: Story = {
  args: { estimatesHref: copy.stories.estimatesHref },
  render: args => <EstimatesPreview {...args} />,
  play: estimatesVisible,
};
export const EstimatesAdmin: Story = {
  args: { estimatesHref: copy.stories.estimatesHref, permissionsHref: undefined, aiUsageHref: undefined },
  render: EstimatesOwner.render,
  play: async context => { await estimatesVisible(context); if (Admin.play) await Admin.play(context); },
};
export const EstimatesOnly: Story = {
  args: { profile: null, estimatesHref: copy.stories.estimatesHref, permissionsHref: undefined, aiUsageHref: undefined },
  render: EstimatesOwner.render,
  play: async context => {
    await estimatesVisible(context);
    await expect(within(context.canvasElement).getAllByRole('link')).toHaveLength(1);
  },
};
export const EstimatesUnavailable: Story = {
  args: { estimatesHref: undefined },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('region', { name: copy.estimatesTitle })).not.toBeInTheDocument();
    await expect(c.queryByRole('link', { name: copy.viewEstimates })).not.toBeInTheDocument();
    await expect(c.getByRole('link', { name: copy.managePermissions })).toBeVisible();
  },
};
export const EstimatesNavigationRequest: Story = {
  args: EstimatesOwner.args, render: EstimatesOwner.render,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('link', { name: copy.viewEstimates }));
    await expect(c.getByRole('status')).toHaveTextContent(copy.stories.estimatesNavigation);
    await expect(c.getByRole('region', { name: copy.estimatesTitle })).toBeVisible();
  },
};
export const EstimatesKeyboard: Story = {
  args: EstimatesOnly.args, render: EstimatesOwner.render,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), link = c.getByRole('link', { name: copy.viewEstimates });
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(getComputedStyle(link).outlineWidth).toBe('3px');
    await userEvent.keyboard('{Enter}');
    await expect(c.getByRole('status')).toHaveTextContent(copy.stories.estimatesNavigation);
  },
};
export const EstimatesLongContent: Story = {
  args: { ...EstimatesOwner.args, workspaceName: 'W'.repeat(200), profile: { ...meta.args.profile, businessName: 'N'.repeat(200) } },
  render: EstimatesOwner.render, play: estimatesVisible,
};
export const EstimatesMobile: Story = {
  args: EstimatesOwner.args, render: EstimatesOwner.render,
  globals: { viewport: { value: 'phone', isRotated: false } }, play: estimatesVisible,
};
export const AllSettingsCards: Story = {
  args: { estimatesHref: copy.stories.estimatesHref, workOrdersHref: copy.stories.workOrdersHref,
    jobNotificationsHref: '/settings/job-notifications?workspace=fictional-workspace',
    accountHref: '/settings/account?workspace=fictional-workspace', billingHref: '/settings/billing?workspace=fictional-workspace' },
  render: EstimatesOwner.render,
  play: async context => {
    await estimatesVisible(context);
    const c = within(context.canvasElement);
    for (const name of [copy.viewAccount, copy.viewBilling, copy.viewAIUsage, copy.viewJobNotifications, copy.viewWorkOrders, copy.managePermissions])
      await expect(c.getByRole('link', { name })).toBeVisible();
    await expect(c.getAllByRole('link')).toHaveLength(7);
    const grid = c.getByRole('region', { name: copy.estimatesTitle }).parentElement;
    if (!grid) throw new Error('Expected the settings card grid.');
    const viewport = context.canvasElement.ownerDocument.defaultView;
    if (!viewport) throw new Error('Expected the preview viewport.');
    const columns = viewport.matchMedia('(min-width: 75rem)').matches ? 3 : viewport.matchMedia('(min-width: 37.5rem)').matches ? 2 : 1;
    await expect(getComputedStyle(grid).gridTemplateColumns.split(' ')).toHaveLength(columns);
    await expect(grid.children).toHaveLength(7);
    const business = c.getByRole('region', { name: copy.businessTitle }).getBoundingClientRect();
    await expect(business.width).toBe(grid.getBoundingClientRect().width);
    await expect(business.bottom).toBeLessThan(grid.getBoundingClientRect().top);
  },
};
export const CompactCardsMobile: Story = {
  args: AllSettingsCards.args, render: AllSettingsCards.render, play: AllSettingsCards.play,
  globals: { viewport: { value: 'phone', isRotated: false } },
};
