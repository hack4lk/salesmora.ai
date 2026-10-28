import {useEffect,useState,type ComponentProps} from 'react';
import {copy} from './job-create-dialog.data';
import {jobDeadlineChoiceData as deadlineCopy} from '../job-deadline-choice/job-deadline-choice.data';
import {jobDate} from '../job-ui';
import {fn,expect,within,userEvent,waitFor} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobCreateDialog} from './job-create-dialog';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobCreateDialog',component:JobCreateDialog,args:{open:true,members:f.jobMembers,customers:f.jobFixtures.map(j=>({id:j.customerId!,name:j.customerName})),onClose:fn(),onConfirm:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobCreateDialog>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Review:Story={args:{initialCustomer:f.jobFixtures[0].customerId!,initialReview:true,initialValues:{title:f.jobFixtures[0].title,primaryOwnerId:f.jobFixtures[0].primaryOwnerId}}};
export const Saving:Story={args:{initialCustomer:f.jobFixtures[0].customerId!,initialReview:true,initialValues:{title:f.jobFixtures[0].title,primaryOwnerId:f.jobFixtures[0].primaryOwnerId},pending:true}};
export const Error:Story={args:{error:f.jobStoryData.failure}};
export const CreateExistingCustomer:Story={play:async({canvasElement,args})=>{const b=within(canvasElement.ownerDocument.body);await userEvent.selectOptions(b.getByLabelText('Customer'),f.jobFixtures[0].customerId!);await userEvent.type(b.getByLabelText('Job title'),f.jobPreviewData.newJob);await userEvent.selectOptions(b.getByLabelText('Primary owner'),'sam');await userEvent.click(b.getByRole('button',{name:'Review job'}));await expect(b.getByRole('heading',{name:'Review new job'})).toBeVisible();await expect(args.onConfirm).not.toHaveBeenCalled();await userEvent.click(b.getByRole('button',{name:'Confirm and create'}));await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({customerId:f.jobFixtures[0].customerId,title:f.jobPreviewData.newJob,primaryOwnerId:'sam'}));}};
export const NewCustomer:Story={play:async({canvasElement})=>{const b=within(canvasElement.ownerDocument.body);await userEvent.selectOptions(b.getByLabelText('Customer'),'new');await userEvent.type(b.getByLabelText('Customer name'),f.jobFixtures[0].customerName);await expect(b.getByLabelText('Email · optional')).toBeVisible();}};

export const DuplicateCustomer:Story={args:{matches:[{id:f.jobFixtures[0].customerId!,name:f.jobFixtures[0].customerName,number:'CU-0001',reason:'name'}]},play:async({canvasElement})=>{const b=within(canvasElement.ownerDocument.body);await userEvent.selectOptions(b.getByLabelText('Customer'),'new');await userEvent.type(b.getByLabelText('Customer name'),f.jobFixtures[0].customerName);await expect(b.getByRole('button',{name:'Use existing CU-0001'})).toBeVisible();}};

export const InvalidPhone:Story={play:async({canvasElement})=>{const b=within(canvasElement.ownerDocument.body);await userEvent.selectOptions(b.getByLabelText('Customer'),'new');await userEvent.type(b.getByLabelText('Phone · optional'),'abc1234567');await expect(b.getByRole('alert')).toBeVisible();await expect(b.getByRole('button',{name:'Review job'})).toBeDisabled();}};

async function deadlineBody(element: HTMLElement) { const b = within(element.ownerDocument.body); await waitFor(()=>expect(b.getByRole('dialog')).toBeVisible()); return b; }
const deadlineContext = { context: { rule: { mode: 'relative' as const, days: 14, count: 'business' as const }, revision: deadlineCopy.stories.revision, projectedDate: deadlineCopy.stories.projected, createdDate: deadlineCopy.stories.created, timezone: deadlineCopy.stories.timezone }, canOverride: true, onReload: fn() };
const validDraft = { customerId: f.jobFixtures[0].customerId!, title: f.jobFixtures[0].title, primaryOwnerId: f.jobFixtures[0].primaryOwnerId };
export const WithWorkspaceDefault: Story = { args: { deadlineContext, initialValues: validDraft } };
export const DefaultDeadlineReview: Story = { args: { deadlineContext, initialValues: validDraft, initialReview: true }, play: async ({ canvasElement, args }) => { const b = await deadlineBody(canvasElement); await waitFor(()=>expect(b.getByText(copy.defaultChoice)).toBeVisible()); await expect(b.getByText(jobDate(deadlineCopy.stories.projected))).toBeVisible(); await expect(args.onConfirm).not.toHaveBeenCalled(); } };
export const ConfirmWorkspaceDeadline: Story = { args: { deadlineContext, initialValues: validDraft }, play: async ({ canvasElement, args }) => {
  const b = await deadlineBody(canvasElement); await userEvent.click(b.getByRole('button', { name: copy.review })); await expect(args.onConfirm).not.toHaveBeenCalled();
  await userEvent.click(b.getByRole('button', { name: copy.confirm })); await expect(args.onConfirm).toHaveBeenCalledOnce(); await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ completionDeadline: deadlineCopy.stories.projected, deadlineIntent: { mode: 'workspace', revision: deadlineCopy.stories.revision }, deadlinePreview: { revision: deadlineCopy.stories.revision, createdDate: deadlineCopy.stories.created, resolvedDate: deadlineCopy.stories.projected, timezone: deadlineCopy.stories.timezone } }));
} };
export const ExplicitlyNoDeadline: Story = { args: { deadlineContext, initialValues: validDraft }, play: async ({ canvasElement, args }) => {
  const b = await deadlineBody(canvasElement); await userEvent.click(b.getByRole('radio', { name: deadlineCopy.unset })); await userEvent.click(b.getByRole('button', { name: copy.review })); await expect(b.getByText(copy.unsetChoice)).toBeVisible(); await userEvent.click(b.getByRole('button', { name: copy.confirm })); await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ completionDeadline: null, deadlineIntent: { mode: 'unset' } }));
} };
export const CustomDeadline: Story = { args: { deadlineContext, initialValues: validDraft }, play: async ({ canvasElement, args }) => {
  const b = await deadlineBody(canvasElement); await userEvent.click(b.getByRole('radio', { name: deadlineCopy.custom })); await expect(b.getByRole('button', { name: copy.review })).toBeDisabled(); await userEvent.type(b.getByLabelText(deadlineCopy.date), deadlineCopy.stories.customDate); await userEvent.click(b.getByRole('button', { name: copy.review })); await expect(b.getByText(jobDate(deadlineCopy.stories.customDate))).toBeVisible(); await userEvent.click(b.getByRole('button', { name: copy.confirm })); await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ completionDeadline: deadlineCopy.stories.customDate, deadlineIntent: { mode: 'date', date: deadlineCopy.stories.customDate } }));
} };
export const UnsetWorkspaceDefault: Story = { args: { deadlineContext: { ...deadlineContext, context: { ...deadlineContext.context, rule: { mode: 'unset' }, projectedDate: null } }, initialValues: validDraft }, play: async ({ canvasElement, args }) => {
  const b = await deadlineBody(canvasElement); await userEvent.click(b.getByRole('button', { name: copy.review })); await expect(b.getByText(copy.defaultChoice)).toBeVisible(); await userEvent.click(b.getByRole('button', { name: copy.confirm })); await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ completionDeadline: null, deadlineIntent: { mode: 'workspace', revision: deadlineCopy.stories.revision } }));
} };
export const DeadlineRuleLoading: Story = { args: { deadlineContext: { ...deadlineContext, state: 'loading' }, initialValues: validDraft }, play: async ({ canvasElement }) => { const b = await deadlineBody(canvasElement); await expect(b.getByRole('button', { name: copy.review })).toBeDisabled(); await expect(b.queryByRole('radio')).not.toBeInTheDocument(); } };
export const DeadlineRuleError: Story = { args: { deadlineContext: { ...deadlineContext, state: 'error' }, initialValues: validDraft }, play: async ({ canvasElement, args }) => { const b = await deadlineBody(canvasElement); await userEvent.click(b.getByRole('button', { name: deadlineCopy.reload })); await expect(args.deadlineContext!.onReload).toHaveBeenCalledOnce(); await expect(b.getByRole('button', { name: copy.review })).toBeDisabled(); } };
export const WorkspaceDeadlineOnly: Story = { args: { deadlineContext: { ...deadlineContext, canOverride: false }, canSchedule: false, initialValues: validDraft }, play: async ({ canvasElement }) => { const b = await deadlineBody(canvasElement); await expect(b.getByRole('radio', { name: deadlineCopy.custom })).toBeDisabled(); await expect(b.getByRole('radio', { name: deadlineCopy.unset })).toBeDisabled(); await expect(b.getByRole('button', { name: copy.review })).toBeEnabled(); } };
function ChangedDeadlinePreview(args: ComponentProps<typeof JobCreateDialog>) {
  const [context, setContext] = useState(args.deadlineContext!);
  useEffect(() => { const change = () => setContext(previous => ({ ...previous, context: { ...previous.context, revision: 'deadline-v2' } })); window.addEventListener('job-create-deadline-change', change); return () => window.removeEventListener('job-create-deadline-change', change); }, []);
  return <JobCreateDialog {...args} deadlineContext={context}/>;
}
export const DefaultChangedDuringReview: Story = { args: { deadlineContext, initialValues: validDraft }, render: args => <ChangedDeadlinePreview {...args}/>, play: async ({ canvasElement, args }) => {
  const b = await deadlineBody(canvasElement); await userEvent.click(b.getByRole('button', { name: copy.review })); canvasElement.ownerDocument.defaultView?.dispatchEvent(new Event('job-create-deadline-change'));
  await waitFor(() => expect(b.getByRole('heading', { name: copy.title })).toBeVisible()); await expect(b.getByLabelText(copy.job)).toHaveValue(validDraft.title); await expect(b.getByRole('button', { name: copy.review })).toBeDisabled(); await expect(args.onConfirm).not.toHaveBeenCalled();
  await userEvent.click(b.getByRole('button', { name: deadlineCopy.useCurrent })); await userEvent.click(b.getByRole('button', { name: copy.review })); await userEvent.click(b.getByRole('button', { name: copy.confirm })); await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ deadlineIntent: { mode: 'workspace', revision: 'deadline-v2' } }));
} };
export const DeadlineSaveFailure: Story = { args: { deadlineContext, initialValues: validDraft, initialReview: true, onConfirm: fn(async () => { throw new globalThis.Error(); }) }, play: async ({ canvasElement, args }) => { const b = await deadlineBody(canvasElement); await userEvent.click(b.getByRole('button', { name: copy.confirm })); await expect(b.getByRole('dialog')).toBeVisible(); await expect(b.getByText(copy.defaultChoice)).toBeVisible(); await expect(args.onClose).not.toHaveBeenCalled(); } };
export const DeadlinePendingReview: Story = { args: { deadlineContext, initialValues: validDraft, initialReview: true, pending: true } };
