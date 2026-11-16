import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { HomeActionsMenu } from './home-actions-menu';
import { homeActionsMenuData as copy } from './home-actions-menu.data';

const createLead = fn(), reviewIntake = fn(), openCalendar = fn();
const meta = {
  title: 'Home/HomeActionsMenu',
  component: HomeActionsMenu,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-2xl p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><div className="flex justify-end"><Story /></div></main>],
  args: { actions: [{ id: 'createLead', onSelect: createLead }, { id: 'reviewIntake', onSelect: reviewIntake }, { id: 'openCalendar', onSelect: openCalendar }] },
} satisfies Meta<typeof HomeActionsMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = canvas.getByRole('button', { name: copy.label });
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(body.queryByRole('menu')).not.toBeInTheDocument();
  await userEvent.click(trigger);
  await expect(body.getByRole('menu', { name: copy.label })).toBeVisible();
  await expect(body.getAllByRole('menuitem')).toHaveLength(3);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
} };
export const SelectAction: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(canvas.getByRole('button', { name: copy.label }));
  await userEvent.click(body.getByRole('menuitem', { name: copy.actions.createLead }));
  await expect(createLead).toHaveBeenCalledTimes(1);
  await expect(reviewIntake).not.toHaveBeenCalled();
  await expect(openCalendar).not.toHaveBeenCalled();
  await waitFor(() => expect(body.queryByRole('menu')).not.toBeInTheDocument());
} };
export const Keyboard: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = canvas.getByRole('button', { name: copy.label });
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  await expect(body.getByRole('menuitem', { name: copy.actions.createLead })).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}{Enter}');
  await expect(reviewIntake).toHaveBeenCalledTimes(1);
  await expect(createLead).not.toHaveBeenCalled();
  await waitFor(() => expect(trigger).toHaveFocus());
} };
export const Escape: Story = { play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button', { name: copy.label });
  await userEvent.click(trigger);
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(trigger).toHaveFocus());
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
} };
export const OutsideClick: Story = { play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button', { name: copy.label });
  await userEvent.click(trigger);
  const backdrop = canvasElement.ownerDocument.querySelector('.MuiBackdrop-root');
  if (!backdrop) throw new Error('Home actions menu backdrop is missing.');
  await userEvent.click(backdrop);
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
} };
export const Field: Story = { args: { actions: [{ id: 'todaySchedule', onSelect: fn() }, { id: 'myJobs', onSelect: fn() }] }, play: async ({ canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.label }));
  await expect(body.getAllByRole('menuitem')).toHaveLength(2);
  await expect(body.queryByRole('menuitem', { name: copy.actions.createLead })).not.toBeInTheDocument();
  await expect(body.queryByRole('menuitem', { name: copy.actions.reviewIntake })).not.toBeInTheDocument();
} };
export const SingleAction: Story = { args: { actions: [{ id: 'openCalendar', onSelect: fn() }] } };
export const NoActions: Story = { args: { actions: [] }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: copy.label })).not.toBeInTheDocument();
} };
export const LinkedDestinations: Story = { args: { actions: [
  { id: 'createLead', href: `/leads/new?workspace=${copy.stories.workspaceId}` },
  { id: 'reviewIntake', href: `/intake?workspace=${copy.stories.workspaceId}` },
  { id: 'openCalendar', href: `/calendar?workspace=${copy.stories.workspaceId}` },
] }, play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.label }));
  for (const action of args.actions) {
    await expect(body.getByRole('menuitem', { name: copy.actions[action.id] })).toHaveAttribute('href', action.href);
  }
} };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } }, play: Default.play };
