import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { WorkflowServiceDueList, type WorkflowServiceDueListProps } from '../workflow-service-due/workflow-service-due-list';
import type { ServiceEmailSendReview } from '../workflow-service-due/workflow-service-due.types';
import { previewServiceEmail } from '../workflow-service-due/service-email-template';
import { NotificationMenu } from '../../notifications/notification-menu/notification-menu';
import { annualCompany, annualCustomers, annualEmailReview, annualRule, annualServices, annualTemplate } from './annual-service-review.fixtures';

function AnnualCustomers(args: WorkflowServiceDueListProps) {
  const [rows, setRows] = useState(args.rows), [template, setTemplate] = useState(args.template), last = useRef<ServiceEmailSendReview>(undefined);
  return <WorkflowServiceDueList {...args} rows={rows} template={template} pagination={{ ...args.pagination, total: rows.length }}
    onResolve={async input => { await args.onResolve(input); setRows(current => input.action === 'dismiss' ? current.filter(row => row.id !== input.cycleId) : current.map(row => row.id === input.cycleId ? { ...row, version: row.version + 1, status: 'snoozed' } : row)); }}
    onSaveTemplate={async input => { await args.onSaveTemplate(input); setTemplate({ ...template, ...input.text, version: template.version + 1 }); }}
    onPrepareEmails={async input => {
      const prepared = await args.onPrepareEmails(input);
      const review = { ...prepared, templateId: template.id, templateVersion: template.version, messages: prepared.messages.map(message => ({ ...message, ...previewServiceEmail(template, args.service.name, rows.find(row => row.id === message.cycleId)!, annualCompany) })) };
      last.current = review; return review;
    }}
    onReviseEmails={async input => { const result = await args.onReviseEmails(input); last.current = result; return result; }}/>
}
const meta = { title: 'Workflows/Annual customer review', component: WorkflowServiceDueList, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="mx-auto min-h-screen max-w-6xl bg-canvas p-4 sm:p-8"><Story/></main>],
  args: { reviewDate: annualRule.firstReviewDate, service: annualServices[0], workflowName: annualRule.name, rows: annualCustomers, today: '2027-03-15',
    pagination: { total: 3, page: 1, pageSize: 25, onPageChange: fn(), onPageSizeChange: fn() }, canRead: true, canManage: true, canEmail: true, company: annualCompany, template: annualTemplate,
    onRetry: fn(), onReloadTemplate: fn(), onBack: fn(), onOpenCustomer: fn(), onOpenJob: fn(), onResolve: fn<WorkflowServiceDueListProps['onResolve']>(async () => {}),
    onGenerate: fn<WorkflowServiceDueListProps['onGenerate']>(async () => ({ subject: 'Planning your spring gutter cleaning?', body: annualTemplate.body })),
    onSaveTemplate: fn<WorkflowServiceDueListProps['onSaveTemplate']>(async () => {}),
    onPrepareEmails: fn<WorkflowServiceDueListProps['onPrepareEmails']>(async input => annualEmailReview(annualCustomers.filter(row => input.cycles.some(cycle => cycle.id === row.id)))),
    onReviseEmails: fn<WorkflowServiceDueListProps['onReviseEmails']>(async input => ({ ...annualEmailReview(), revision: 'annual-v2', messages: input.messages })),
    onSendEmails: fn<WorkflowServiceDueListProps['onSendEmails']>(async () => []),
  }, render: args => <AnnualCustomers {...args}/>,
} satisfies Meta<typeof WorkflowServiceDueList>;
export default meta; type Story = StoryObj<typeof meta>;
export const Customers: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('heading', { name: 'Gutter cleaning review' })).toBeVisible();
  await expect(c.getAllByText('To review')).toHaveLength(3); await expect(c.queryByRole('columnheader', { name: 'Due date' })).not.toBeInTheDocument();
} };
export const DismissCurrentReview: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: 'Actions for Skyler Grant' })); await userEvent.click(await body.findByRole('menuitem', { name: 'Dismiss this review' }));
  const dialog = within(await body.findByRole('dialog', { name: 'Dismiss this reminder?' }));
  await expect(dialog.getByText('This dismisses this year’s review only. Next year’s review is unchanged.')).toBeVisible();
  await userEvent.click(dialog.getByRole('button', { name: 'Dismiss this review' }));
  await expect(args.onResolve).toHaveBeenCalledWith({ cycleId: 'annual-1', expectedVersion: 1, action: 'dismiss' });
  await expect(c.queryByText('Skyler Grant')).not.toBeInTheDocument();
} };
export const ReviewEmail: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('checkbox', { name: 'Select Skyler Grant' })); await userEvent.click(c.getByRole('button', { name: 'Review emails (1)' }));
  const dialog = within(await body.findByRole('dialog', { name: 'Review customer emails' }));
  await expect(dialog.getByRole('button', { name: 'Send 1 email' })).toBeEnabled(); await expect(args.onSendEmails).not.toHaveBeenCalled();
  await expect(dialog.getAllByText(/office@example.test/)[0]).toBeVisible();
} };
export const DraftWithAssistant: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: 'Prepare service email' }));
  const drawer = within(await body.findByRole('dialog', { name: 'Prepare service email' }));
  await expect(drawer.queryByRole('button', { name: /^Due date$/ })).not.toBeInTheDocument();
  await userEvent.type(drawer.getByLabelText('Work with the assistant'), 'Draft a short seasonal gutter-cleaning invitation. Ask customers to call or email our office.');
  await userEvent.click(drawer.getByRole('button', { name: 'Update draft' }));
  await expect(args.onGenerate).toHaveBeenCalledOnce(); await expect(args.onSendEmails).not.toHaveBeenCalled();
} };
export const Empty: Story = { args: { rows: [] } };
export const Initializing: Story = { args: { initializing: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText('Preparing this annual review. Customers will appear when it is ready.')).toBeVisible();
  await expect(c.getByRole('button', { name: 'Prepare service email' })).toBeDisabled();
  await expect(c.getByRole('button', { name: 'Review emails' })).toBeDisabled();
  await expect(c.queryByRole('checkbox', { name: 'Select Skyler Grant' })).not.toBeInTheDocument();
} };
export const Paused: Story = { args: { paused: true } };
export const NoAccess: Story = { args: { canRead: false } };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const NotificationToCustomers: Story = {
  render: function Preview(args) {
    const [show, setShow] = useState(false), [read, setRead] = useState(false);
    return <><div className="mb-6 flex justify-end" onClick={event => { if ((event.target as HTMLElement).closest('a[href="#annual-customers"]')) { event.preventDefault(); setShow(true); } }}>
      <NotificationMenu workspaceName="Example workspace" unreadCount={read ? 0 : 1} state="ready" preferencesHref="#preferences" onOpen={fn()} onRetry={fn()} onLoadMore={fn()} onMarkRead={() => setRead(true)}
        items={[{ id: 'annual-review', title: 'Review gutter-cleaning customers', description: '3 past customers to review · March 15, 2027', createdAt: '2027-03-15T13:00:00Z', read, href: '#annual-customers', actionLabel: 'Review customers' }]}/>
    </div>{show && <AnnualCustomers {...args}/>}</>;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.click(c.getByRole('button', { name: /^Open notifications/ }));
    await userEvent.click(await body.findByRole('link', { name: 'Review customers' }));
    await expect(await c.findByRole('heading', { name: 'Gutter cleaning review' })).toBeVisible();
    await expect(c.getByRole('button', { name: /^Open notifications/ })).toHaveAccessibleName(/0/);
  },
};
