import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { WebsiteSetupPagePreview, websiteSetupExample } from './website-setup-page-preview';
import { websiteSetupPageData as copy } from './website-setup-page.data';
import { captureSetupHeaderData as header } from '../capture-setup-header/capture-setup-header.data';
import { captureSourceSelectionData as selection } from '../capture-source-selection/capture-source-selection.data';
import { websiteCaptureBriefData as brief } from '../website-capture-brief/website-capture-brief.data';
import { captureFormContentEditorData as content } from '../capture-form-content-editor/capture-form-content-editor.data';
const meta = {
  title: 'Lead Capture/WebsiteSetupPage', component: WebsiteSetupPagePreview, parameters: { layout: 'fullscreen' },
  args: { onSave: fn(), onReview: fn(), onGmailSetup: fn(), onExit: fn() },
} satisfies Meta<typeof WebsiteSetupPagePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Brief: Story = { args: { initialStep: 'intake' } };
export const Fields: Story = { args: { initialStep: 'intake', initialPanel: 'fields' } };
export const Preview: Story = { args: { initialStep: 'intake', initialPanel: 'preview' } };
export const Workflow: Story = { args: { initialStep: 'intake', initialPanel: 'workflow' } };
export const CompleteSetup: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: header.continue }));
  await waitFor(() => expect(c.getByRole('group', { name: copy.sectionsLabel })).toBeVisible());
  await userEvent.click(c.getByRole('button', { name: brief.suggest })); await userEvent.click(c.getByRole('button', { name: brief.use }));
  await userEvent.click(c.getByRole('button', { name: header.continue })); await waitFor(() => expect(c.getByRole('button', { name: copy.sections.fields })).toHaveAttribute('aria-pressed', 'true'));
  await userEvent.click(c.getByRole('button', { name: header.continue })); await waitFor(() => expect(c.getByRole('button', { name: copy.sections.preview })).toHaveAttribute('aria-pressed', 'true'));
  await userEvent.click(c.getByRole('button', { name: header.continue })); await waitFor(() => expect(c.getByRole('button', { name: copy.sections.workflow })).toHaveAttribute('aria-pressed', 'true'));
  await userEvent.click(c.getByRole('button', { name: header.continue })); await expect(args.onReview).toHaveBeenCalledWith({ draftId: 'website-draft', version: 6 }); await expect(args.onSave).toHaveBeenCalledTimes(5); await expect(c.getByText(copy.stories.review)).toBeVisible();
} };
export const LiveFormText: Story = { ...Preview, play: async ({ canvasElement }) => { const c = within(canvasElement); const input = c.getByRole('textbox', { name: content.title }); await userEvent.clear(input); await userEvent.type(input, copy.stories.changedTitle); await expect(c.getByRole('heading', { name: copy.stories.changedTitle })).toBeVisible(); } };
export const SaveDraft: Story = { play: async ({ canvasElement, args }) => { const c = within(canvasElement); const input = c.getByRole('textbox', { name: selection.name }); await userEvent.type(input, ' updated'); await userEvent.click(c.getByRole('button', { name: header.save })); await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ draftId: 'website-draft', expectedVersion: 1, selection: { name: `${copy.stories.name} updated`, source: 'website' } })); await expect(c.getByRole('button', { name: header.save })).toBeDisabled(); } };
export const DiscardNavigation: Story = { args: { initialStep: 'intake' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), b = within(canvasElement.ownerDocument.body); const input = c.getByRole('textbox', { name: brief.brief }); await userEvent.type(input, ' changed'); await userEvent.click(c.getByRole('button', { name: header.exit })); await userEvent.click(b.getByRole('button', { name: header.stay })); await waitFor(() => expect(b.queryByRole('alertdialog')).not.toBeInTheDocument()); await expect(input).toHaveValue(`${copy.stories.brief} changed`); await userEvent.click(c.getByRole('button', { name: header.exit })); await userEvent.click(b.getByRole('button', { name: header.discard })); await waitFor(() => expect(b.queryByRole('alertdialog')).not.toBeInTheDocument()); await expect(args.onExit).toHaveBeenCalledTimes(1); await expect(input).toHaveValue(copy.stories.brief);
} };
export const MissingSourceName: Story = { args: { initialDraft: { ...websiteSetupExample, selection: { name: '', source: 'website' } } }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: header.continue })); await expect(c.getByRole('alert')).toHaveTextContent(copy.sourceError); await expect(args.onSave).not.toHaveBeenCalled(); } };
export const MissingTitle: Story = { args: { initialStep: 'intake', initialPanel: 'preview', initialDraft: { ...websiteSetupExample, content: { ...websiteSetupExample.content, title: '' } } }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: header.continue })); await expect(c.getAllByRole('alert').some(alert => alert.textContent?.includes(copy.contentError))).toBe(true); await expect(args.onSave).not.toHaveBeenCalled(); } };
export const SaveFailure: Story = { args: { failSave: true }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: header.continue })); await expect(c.getByRole('alert')).toHaveTextContent(copy.failed); await expect(c.getByRole('textbox', { name: selection.name })).toHaveValue(copy.stories.name); await expect(args.onReview).not.toHaveBeenCalled(); } };
export const PendingSave: Story = { args: { holdSave: true }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: header.continue })); await expect(c.getByRole('button', { name: header.continue })).toBeDisabled(); await expect(c.getByRole('textbox', { name: selection.name })).toBeDisabled(); await expect(args.onSave).toHaveBeenCalledTimes(1); } };
export const GmailHandoff: Story = { play: async ({ canvasElement, args }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('radio', { name: selection.gmail.title })); await userEvent.click(c.getByRole('button', { name: header.continue })); await expect(args.onGmailSetup).toHaveBeenCalledWith({ draftId: 'website-draft', version: 2 }); await expect(args.onSave).toHaveBeenCalledWith({ draftId: 'website-draft', expectedVersion: 1, selection: { name: copy.stories.name, source: 'gmail' } }); await expect(args.onReview).not.toHaveBeenCalled(); } };
export const ReadOnly: Story = { args: { initialStep: 'intake', initialPanel: 'fields', readOnly: true }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.queryByRole('button', { name: header.continue })).not.toBeInTheDocument(); for (const input of c.getAllByRole('textbox')) await expect(input).toBeDisabled(); } };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByRole('textbox')).not.toBeInTheDocument(); await expect(c.queryByText(copy.stories.name)).not.toBeInTheDocument(); } };
export const DraftRevision: Story = { args: { revision: true, initialStep: 'intake' } };
