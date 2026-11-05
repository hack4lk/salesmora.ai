import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { GmailSetupPagePreview, gmailSetupExample, gmailSetupFindings } from './gmail-setup-page-preview';
import { gmailSetupPageData as copy } from './gmail-setup-page.data';
import { captureSetupHeaderData as header } from '../capture-setup-header/capture-setup-header.data';
import { gmailEmailExampleData as email } from '../gmail-email-example/gmail-email-example.data';
import { gmailFieldMappingData } from '../gmail-field-mapping/gmail-field-mapping.data';
import { gmailCaptureScopeData as scope } from '../gmail-capture-scope/gmail-capture-scope.data';
import { captureSourceSelectionData as selection } from '../capture-source-selection/capture-source-selection.data';
import { gmailFieldSetupProgressData as progress } from '../gmail-field-setup-progress/gmail-field-setup-progress.data';
const mapping = gmailFieldMappingData.findings;
const meta = { title: 'Lead Capture/GmailSetupPage', component: GmailSetupPagePreview, parameters: { layout: 'fullscreen' }, args: { onSave: fn(), onReview: fn(), onWebsiteSetup: fn(), onExit: fn(), onExtract: fn() } } satisfies Meta<typeof GmailSetupPagePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
const fields = { initialStep: 'intake', initialPanel: 'fields', initialScreen: 'findings', initialDraft: gmailSetupFindings() } as const;
const workflow = { initialStep: 'intake', initialPanel: 'workflow', initialDraft: gmailSetupFindings(true) } as const;
export const Default: Story = {};
export const Account: Story = { args: { initialStep: 'intake' } };
export const Rules: Story = { args: { initialStep: 'intake', initialPanel: 'rules' } };
export const Example: Story = { args: { initialStep: 'intake', initialPanel: 'fields' } };
export const Findings: Story = { args: fields };
export const Workflow: Story = { args: workflow };
export const KeyboardTabs: Story = { args: { initialStep: 'intake' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), tabList = within(c.getByRole('tablist', { name: copy.panelsLabel }));
  const tab = (panel: keyof typeof copy.panels) => tabList.getByRole('tab', { name: copy.panels[panel] });
  tab('account').focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect(tab('rules')).toHaveFocus();
  await expect(tab('rules')).toHaveAttribute('aria-selected', 'true');
  await expect(c.getByRole('tabpanel', { name: copy.panels.rules })).toBeVisible();
  const phrase = c.getByRole('textbox', { name: 'Phrase 1' });
  await userEvent.clear(phrase);
  await userEvent.type(phrase, copy.stories.changedPhrase);
  await userEvent.click(tab('rules'));
  await userEvent.keyboard('{End}');
  await expect(tab('workflow')).toHaveFocus();
  await expect(tab('rules')).toHaveAttribute('tabindex', '-1');
  await expect(c.queryByRole('textbox', { name: 'Phrase 1' })).not.toBeInTheDocument();
  await userEvent.keyboard('{Home}{ArrowRight}');
  await expect(c.getByRole('textbox', { name: 'Phrase 1' })).toHaveValue(copy.stories.changedPhrase);
  await expect(args.onSave).not.toHaveBeenCalled();
} };
export const FullSetup: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), next = () => c.getByRole('button', { name: header.continue });
  await userEvent.click(next()); await expect(c.getByRole('tab', { name: copy.panels.account })).toHaveAttribute('aria-selected', 'true');
  await userEvent.click(next()); await expect(c.getByRole('tab', { name: copy.panels.rules })).toHaveAttribute('aria-selected', 'true');
  await userEvent.click(next()); await expect(next()).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: email.extract }));
  await expect(c.getByRole('heading', { name: gmailFieldMappingData.title })).toHaveFocus();
  await expect(args.onExtract).toHaveBeenCalledWith(expect.objectContaining({ accountId: 'gmail-1', draftVersion: 4, example: gmailSetupExample.example }));
  await userEvent.click(c.getByRole('checkbox', { name: mapping.confirm })); await userEvent.click(c.getByRole('button', { name: mapping.approve }));
  await expect(c.getByRole('tab', { name: copy.panels.workflow })).toHaveAttribute('aria-selected', 'true'); await userEvent.click(next());
  await expect(args.onReview).toHaveBeenCalledWith({ draftId: 'gmail-draft', version: 6 }); await expect(args.onSave).toHaveBeenCalledTimes(5);
  await expect(args.onSave.mock.calls.at(-1)![0].gmail.approvedKey).toBeTruthy();
} };
export const BackToExample: Story = { args: fields, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: progress.steps[0] }));
  await expect(c.getByRole('heading', { name: email.title })).toHaveFocus(); await expect(c.getByRole('textbox', { name: email.body })).toHaveValue(copy.stories.body);
  await userEvent.click(c.getByRole('button', { name: progress.steps[1] }));
  await expect(c.getByRole('heading', { name: gmailFieldMappingData.title })).toHaveFocus();
  await expect(args.onExtract).not.toHaveBeenCalled();
  await expect(args.onSave).not.toHaveBeenCalled();
  await userEvent.click(c.getByRole('button', { name: progress.steps[0] }));
  await userEvent.type(c.getByRole('textbox', { name: email.body }), '\nMore details');
  await expect(c.queryByRole('button', { name: progress.steps[1] })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: email.extract }));
  await expect(c.getByRole('checkbox', { name: mapping.confirm })).not.toBeChecked();
} };
export const ApprovalRequired: Story = { args: { ...workflow, initialDraft: gmailSetupFindings() }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: header.continue }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.issues.fields); await expect(args.onReview).not.toHaveBeenCalled(); await expect(args.onSave).not.toHaveBeenCalled();
} };
export const ChangedRules: Story = { args: workflow, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('tab', { name: copy.panels.rules }));
  const input = c.getAllByRole('textbox')[0]; await userEvent.clear(input); await userEvent.type(input, copy.stories.changedPhrase);
  await userEvent.click(c.getByRole('tab', { name: copy.panels.workflow })); await userEvent.click(c.getByRole('button', { name: header.continue }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.issues.fields); await expect(args.onReview).not.toHaveBeenCalled();
} };
export const Extracting: Story = { args: { initialStep: 'intake', initialPanel: 'fields', holdExtract: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: email.extract }));
  await expect(c.getByText(email.working)).toBeVisible(); await expect(c.getByRole('tab', { name: copy.panels.account })).toBeDisabled(); await expect(args.onExtract).toHaveBeenCalledTimes(1);
} };
export const ExtractionFailure: Story = { args: { initialStep: 'intake', initialPanel: 'fields', failExtract: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: email.extract })); await expect(await c.findByRole('alert')).toHaveTextContent(email.failure); await expect(c.getByRole('textbox', { name: email.body })).toHaveValue(copy.stories.body);
} };
export const ApprovalSaveFailure: Story = { args: { ...fields, failSave: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('checkbox', { name: mapping.confirm })); await userEvent.click(c.getByRole('button', { name: mapping.approve }));
  await expect(await c.findByRole('alert')).toHaveTextContent(mapping.approveFailure); await expect(c.getByRole('tab', { name: copy.panels.fields })).toHaveAttribute('aria-selected', 'true'); await expect(args.onReview).not.toHaveBeenCalled();
} };
export const SavePending: Story = { args: { holdSave: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: header.continue })); await expect(c.getByRole('button', { name: header.continue })).toBeDisabled(); await expect(args.onSave).toHaveBeenCalledTimes(1);
} };
export const ReconnectRequired: Story = { args: { initialStep: 'intake', reconnect: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: header.continue })); await expect(c.getAllByRole('alert')[0]).toHaveTextContent(copy.issues.account); await expect(args.onSave).not.toHaveBeenCalled();
} };
export const AccountsError: Story = { args: { initialStep: 'intake', accountsError: true } };
export const UpgradeRequired: Story = { args: { initialStep: 'intake', upgradeRequired: true } };
export const ReadOnly: Story = { args: { ...fields, readOnly: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); for (const input of c.getAllByRole('textbox')) await expect(input).toBeDisabled(); await expect(c.queryByRole('button', { name: mapping.approve })).not.toBeInTheDocument(); await expect(args.onSave).not.toHaveBeenCalled();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByRole('textbox')).not.toBeInTheDocument();
} };
export const WebsiteHandoff: Story = { args: { initialDraft: { ...gmailSetupExample, selection: { name: copy.stories.name, source: 'website' } } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: header.continue })); await expect(args.onWebsiteSetup).toHaveBeenCalledWith({ draftId: 'gmail-draft', version: 2 }); await expect(args.onSave).toHaveBeenCalledWith({ draftId: 'gmail-draft', expectedVersion: 1, selection: { name: copy.stories.name, source: 'website' } });
} };
export const GuidedCustomField: Story = { args: fields, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  const say = async (text: string) => { await userEvent.type(c.getByRole('textbox', { name: mapping.composer }), text); await userEvent.click(c.getByRole('button', { name: mapping.send })); };
  await userEvent.click(c.getByRole('button', { name: mapping.add })); await expect(c.getByText(mapping.askName)).toBeVisible();
  await say(mapping.fieldName); await say(mapping.fieldMeaning); await say(mapping.fieldExample); await userEvent.click(c.getByRole('button', { name: mapping.mandatory }));
  const row = within(c.getByRole('group', { name: mapping.fieldName })); await expect(row.getByRole('textbox', { name: mapping.value })).toHaveValue(mapping.fieldExample);
  await userEvent.click(c.getByRole('checkbox', { name: mapping.confirm })); await userEvent.click(c.getByRole('button', { name: mapping.approve }));
  await expect(args.onSave.mock.calls[0][0].gmail.targets).toContainEqual(expect.objectContaining({ key: 'custom', label: mapping.fieldName, required: true }));
} };

export const ChangedAccount: Story = { args: workflow, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('tab', { name: copy.panels.account }));
  await userEvent.selectOptions(c.getByRole('combobox', { name: scope.account }), 'gmail-2');
  await userEvent.click(c.getByRole('tab', { name: copy.panels.workflow })); await userEvent.click(c.getByRole('button', { name: header.continue }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.issues.fields); await expect(args.onReview).not.toHaveBeenCalled();
} };
export const DiscardNavigation: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body), name = c.getByRole('textbox', { name: selection.name });
  await userEvent.type(name, ' changed'); await userEvent.click(c.getByRole('button', { name: header.exit }));
  await userEvent.click(body.getByRole('button', { name: header.stay })); await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
  await expect(name).toHaveValue(copy.stories.name + ' changed'); await expect(args.onExit).not.toHaveBeenCalled();
  await userEvent.click(c.getByRole('button', { name: header.exit })); await userEvent.click(body.getByRole('button', { name: header.discard }));
  await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument()); await expect(name).toHaveValue(copy.stories.name); await expect(args.onExit).toHaveBeenCalledTimes(1);
} };
