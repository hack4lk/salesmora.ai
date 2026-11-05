import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { IntakeReviewPagePreview } from './intake-review-page-preview';
import { intakeReviewPageData as copy } from './intake-review-page.data';
import { defaultIntakeReviewFilters, emptyIntakeReviewFilters } from '../intake-review-toolbar/intake-review-toolbar';
import { intakeReviewListData } from '../intake-review-list/intake-review-list.data';

const meta = {
  title: 'Lead Capture/IntakeReviewPage', component: IntakeReviewPagePreview, parameters: { layout: 'fullscreen' },
  args: { onOpen: fn() },
} satisfies Meta<typeof IntakeReviewPagePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
const review = 'Review · Jamie Carter';
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: review }));
  await expect(args.onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'intake-0', status: 'awaiting' }));
  await expect(c.getByText(copy.stories.opened('Jamie Carter'))).toBeVisible();
} };
export const Search: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.type(c.getByRole('searchbox'), 'MORGAN');
  await expect(c.getByRole('button', { name: 'Review · Morgan Lee' })).toBeVisible();
  await expect(c.queryByRole('button', { name: review })).not.toBeInTheDocument();
} };
export const SourceScoped: Story = { args: { initialFilters: { ...defaultIntakeReviewFilters, sourceId: 'gmail' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('combobox', { name: 'Capture source' })).toHaveValue('gmail');
  await expect(c.getByRole('button', { name: 'Review · Morgan Lee' })).toBeVisible();
  await expect(c.queryByRole('button', { name: review })).not.toBeInTheDocument();
} };
export const ArchivedSourceHistory: Story = { args: { initialFilters: { ...emptyIntakeReviewFilters, sourceId: 'archived' } } };
export const Flags: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.selectOptions(c.getByRole('combobox', { name: 'Review flags' }), 'missing');
  await expect(c.getByRole('button', { name: 'Review · Morgan Lee' })).toBeVisible();
  await expect(c.queryByRole('button', { name: review })).not.toBeInTheDocument();
  await userEvent.selectOptions(c.getByRole('combobox', { name: 'Review flags' }), 'clear');
  await expect(c.getByRole('button', { name: 'Review · Chris Alvarez' })).toBeVisible();
} };
export const History: Story = { args: { initialFilters: { ...emptyIntakeReviewFilters, status: 'approved' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'View details · Jamie Carter' }));
  await expect(args.onOpen).toHaveBeenCalledWith(expect.objectContaining({ status: 'approved' }));
} };
export const Pagination: Story = { args: { many: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Go to page 2' }));
  await expect(c.getByRole('button', { name: 'Review · Morgan Lee 26' })).toBeVisible();
  await userEvent.type(c.getByRole('searchbox'), 'Jamie Carter');
  await expect(c.getByRole('button', { name: 'Review · Jamie Carter 1' })).toBeVisible();
} };
export const PageSizeReset: Story = { args: { many: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Go to page 2' }));
  await userEvent.selectOptions(c.getByRole('combobox', { name: 'Rows per page' }), '50');
  await expect(c.getByRole('button', { name: 'Review · Jamie Carter 1' })).toBeVisible();
} };
export const Empty: Story = { args: { empty: true, initialFilters: emptyIntakeReviewFilters } };
export const NoMatches: Story = { args: { initialFilters: { ...defaultIntakeReviewFilters, search: 'No matching request' } } };
export const UnavailableSource: Story = { args: { initialFilters: { ...defaultIntakeReviewFilters, sourceId: 'unavailable' } } };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('searchbox')).toBeDisabled();
  await expect(c.queryByRole('button', { name: review })).not.toBeInTheDocument();
} };
export const ErrorAndRetry: Story = { args: { state: 'error', initialFilters: { ...defaultIntakeReviewFilters, search: 'Jamie' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(intakeReviewListData.error);
  await userEvent.click(c.getByRole('button', { name: 'Try again' }));
  await expect(c.getByRole('searchbox')).toHaveValue('Jamie'); await expect(c.getByRole('button', { name: review })).toBeVisible();
} };
export const SourcesErrorAndRetry: Story = { args: { sourcesState: 'error' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); const source = c.getByRole('combobox', { name: 'Capture source' });
  await expect(source).toBeDisabled(); await userEvent.click(c.getByRole('button', { name: 'Try again' })); await expect(source).toBeEnabled();
} };
export const SourcesLoading: Story = { args: { sourcesState: 'loading' } };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('searchbox')).toBeDisabled();
  const button = c.getByRole('button', { name: review }); await expect(button).toBeDisabled();
  await userEvent.click(button); await expect(args.onOpen).not.toHaveBeenCalled();
  const scroll = c.queryByRole('group', { name: intakeReviewListData.caption });
  if (scroll) { scroll.focus(); await userEvent.keyboard('{End}'); await waitFor(() => expect(scroll.scrollTop).toBeGreaterThan(0)); }
} };
export const ReadOnly: Story = { args: { readOnly: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.queryByRole('button', { name: review })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: 'View details · Jamie Carter' }));
  await expect(args.onOpen).toHaveBeenCalledWith(expect.objectContaining({ canReview: false }));
} };
export const RestrictedDetails: Story = { args: { restricted: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.queryByRole('button', { name: review })).not.toBeInTheDocument();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(c.queryByRole('searchbox')).not.toBeInTheDocument(); await expect(c.queryByText('Jamie Carter')).not.toBeInTheDocument();
  await expect(args.onOpen).not.toHaveBeenCalled();
} };
export const LongContent: Story = { args: { longContent: true } };
export const Keyboard: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); c.getByRole('button', { name: review }).focus();
  await userEvent.keyboard('{Enter}'); await expect(args.onOpen).toHaveBeenCalledTimes(1);
} };
