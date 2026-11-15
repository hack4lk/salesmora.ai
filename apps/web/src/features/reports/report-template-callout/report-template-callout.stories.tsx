import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ReportTemplateCallout } from './report-template-callout';
import { reportTemplateCalloutData as copy } from './report-template-callout.data';

const meta = {
  title: 'Reports/ReportTemplateCallout',
  component: ReportTemplateCallout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Results-screen configuration-only template callout from the approved prototype. Save requests the reviewed name dialog; update requests the reviewed replacement confirmation. The host binds the displayed/applied configuration and template version, supplies current user/workspace capabilities and performs persistence and authorization. No saved rows, grants, API or direct mutations. Mount only for a reviewed report configuration.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="max-w-4xl"><Story /></div></main>],
  args: { configurationLabel: 'New leads / Last 30 days, including today / All authorized assignments / All sources', canRead: true, canSave: true, onSave: fn(), onUpdate: fn(), onViewTemplates: fn() },
} satisfies Meta<typeof ReportTemplateCallout>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  await expect(c.queryByText(copy.description)).not.toBeInTheDocument();
  await expect(c.queryByText(args.configurationLabel)).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.help }));
  const help = await body.findByRole('dialog', { name: copy.help });
  await waitFor(() => expect(within(help).getByText(copy.description)).toBeVisible());
  await expect(within(help).getByText(args.configurationLabel)).toBeVisible();
  await expect(within(help).getByText(copy.personal)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect(c.queryByRole('button', { name: copy.update })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(args.onSave).toHaveBeenCalledTimes(1);
  await userEvent.click(c.getByRole('button', { name: copy.view }));
  await expect(args.onViewTemplates).toHaveBeenCalledTimes(1);
  await expect(args.onUpdate).not.toHaveBeenCalled();
} };
export const ExistingTemplate: Story = { args: { activeTemplate: { id: 'my-intake', name: 'Monthly intake', canUpdate: true } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.help }));
  await waitFor(() => expect(within(canvasElement.ownerDocument.body).getByText(copy.basedOn('Monthly intake'))).toBeVisible());
  await userEvent.keyboard('{Escape}');
  await userEvent.click(c.getByRole('button', { name: copy.update }));
  await expect(args.onUpdate).toHaveBeenCalledWith('my-intake');
  await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(args.onSave).toHaveBeenCalledTimes(1);
} };
export const UpdateUnavailable: Story = { args: { activeTemplate: { id: 'my-intake', name: 'Monthly intake', canUpdate: false } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('button', { name: copy.update })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.update }));
  await expect(args.onUpdate).not.toHaveBeenCalled();
  await expect(c.getByRole('button', { name: copy.save })).toBeEnabled();
} };
export const UpdateOnly: Story = { args: { ...ExistingTemplate.args, canSave: false }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.update }));
  await expect(args.onUpdate).toHaveBeenCalledWith('my-intake');
  await expect(args.onSave).not.toHaveBeenCalled();
} };
export const ReadOnly: Story = { args: { canSave: false }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByText(copy.readOnly)).toBeVisible();
  await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.view }));
  await expect(args.onViewTemplates).toHaveBeenCalledTimes(1);
  await expect(args.onSave).not.toHaveBeenCalled();
} };
export const PermissionDenied: Story = { args: { canRead: false, ...ExistingTemplate.args }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(c.queryByText(copy.basedOn('Monthly intake'))).not.toBeInTheDocument();
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { ...ExistingTemplate.args, pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.pending);
  for (const button of c.getAllByRole('button').filter(button => !button.hasAttribute('aria-haspopup'))) {
    await expect(button).toBeDisabled();
    await userEvent.click(button);
  }
  for (const callback of [args.onSave, args.onUpdate, args.onViewTemplates]) await expect(callback).not.toHaveBeenCalled();
} };
export const HostError: Story = { args: { error: 'This template changed since you opened it. Review its latest configuration before updating.', ...ExistingTemplate.args }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(args.error!);
  await expect(c.getByRole('heading', { name: copy.title })).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.view }));
  await expect(args.onViewTemplates).toHaveBeenCalledTimes(1);
} };
export const KeyboardActions: Story = { args: ExistingTemplate.args, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  c.getByRole('button', { name: copy.save }).focus();
  await userEvent.keyboard('{Enter}');
  await expect(args.onSave).toHaveBeenCalledTimes(1);
  await userEvent.tab();
  await expect(c.getByRole('button', { name: copy.update })).toHaveFocus();
  await userEvent.keyboard(' ');
  await expect(args.onUpdate).toHaveBeenCalledWith('my-intake');
  await userEvent.tab();
  await expect(c.getByRole('button', { name: copy.view })).toHaveFocus();
} };
export const LongContent: Story = { args: { configurationLabel: 'Authorized-report-configuration-'.repeat(20), activeTemplate: { id: 'long', name: 'My-personal-configuration-'.repeat(20), canUpdate: true } } };
