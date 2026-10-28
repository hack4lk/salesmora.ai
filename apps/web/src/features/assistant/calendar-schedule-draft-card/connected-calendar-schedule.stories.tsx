import type { Meta,StoryObj } from '@storybook/nextjs-vite';
import { expect,fn,userEvent,within,waitFor } from 'storybook/test';
import { calendarProposalViewSchema,type CalendarProposalTicket } from '@salesmora/contracts';
import { ConnectedCalendarSchedule } from './connected-calendar-schedule';
import { calendarClearProposalFixture,calendarScheduleProposalFixture,calendarScheduleContextFixture,calendarScheduleDraftCardData as copy } from './calendar-schedule-draft-card.data';
const draft=calendarScheduleProposalFixture(),view=calendarProposalViewSchema.parse({draft,context:calendarScheduleContextFixture(draft)});
const ticket:CalendarProposalTicket={proposalId:view.context.proposalId,inputHash:view.context.inputHash,visitId:view.context.visitId,revision:view.context.revision,state:'pending'};
const workspaceId='00000000-0000-4000-8000-000000000010';
function mock(mode:'ready'|'access'|'confirmDenied'|'mismatch'|'slow'='ready',review=view) {
 const view=review;
 const original=globalThis.fetch;let reads=0;
 globalThis.fetch=fn(async(input,options)=>{
  if(!String(input).startsWith('/api/chat/calendar/proposals'))throw Error('Unexpected preview request.');
  if(options?.method==='POST') {
   if(mode==='confirmDenied')return Response.json({error:'access_denied'},{status:403});
   if(mode==='slow')await new Promise(resolve=>setTimeout(resolve,300));
   const body=JSON.parse(String(options.body));
   return Response.json({view:{...view,draft:{...view.draft,state:body.decision==='confirm'?'confirmed':'cancelled',records:view.draft.intent==='clear'&&body.decision==='confirm'?view.draft.records.map(r=>r.type==='job'&&r.status==='scheduled'?{...r,status:'needs-scheduling'}:r):view.draft.records}}});
  }
  if(mode==='access'&&reads++)return Response.json({error:'access_denied'},{status:403});
  return Response.json({view:mode==='mismatch'?{...view,draft:{...view.draft,inputHash:'f'.repeat(64)},context:{...view.context,inputHash:'f'.repeat(64)}}:view});
 });return()=>{globalThis.fetch=original;};
}
const meta={title:'Assistant/ConnectedCalendarSchedule',component:ConnectedCalendarSchedule,args:{ticket,workspaceId,disabled:false,onRefresh:fn(async()=>{})},parameters:{layout:'fullscreen'},beforeEach:()=>mock(),
 decorators:[Story=><main className="mx-auto w-full max-w-2xl p-4 sm:p-8"><h1 className="text-heading font-semibold">{copy.stories.heading}</h1><p className="text-sm leading-6 text-muted">{copy.stories.notice}</p><Story/></main>],
} satisfies Meta<typeof ConnectedCalendarSchedule>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={play:async({canvasElement})=>{await expect(await within(canvasElement).findByRole('button',{name:copy.confirm})).toBeEnabled();}};
export const Confirm:Story={play:async({canvasElement,args})=>{const canvas=within(canvasElement);await userEvent.click(await canvas.findByRole('button',{name:copy.confirm}));await expect(await canvas.findByText(copy.states.confirmed)).toBeVisible();await expect(canvas.getByText(copy.saved)).toBeVisible();await expect(canvas.getByText(copy.previous)).toBeVisible();await expect(args.onRefresh).toHaveBeenCalledTimes(1);}};
export const Cancel:Story={play:async({canvasElement})=>{const canvas=within(canvasElement);await userEvent.click(await canvas.findByRole('button',{name:copy.cancel}));await expect(await canvas.findByText(copy.states.cancelled)).toBeVisible();}};
export const AccessChanged:Story={beforeEach:()=>mock('access'),play:async({canvasElement})=>{const canvas=within(canvasElement);await canvas.findByRole('button',{name:copy.confirm});window.dispatchEvent(new Event('focus'));await expect(await canvas.findByText(copy.states.unavailable)).toBeVisible();await expect(canvas.queryByText(draft.records[0].title)).not.toBeInTheDocument();await expect(canvas.queryByRole('button')).not.toBeInTheDocument();}};
export const MismatchedReview:Story={beforeEach:()=>mock('mismatch'),play:async({canvasElement})=>{await expect(await within(canvasElement).findByText(copy.states.unavailable)).toBeVisible();}};
export const RevokedOnConfirm:Story={beforeEach:()=>mock('confirmDenied'),play:async({canvasElement,args})=>{const canvas=within(canvasElement);await userEvent.click(await canvas.findByRole('button',{name:copy.confirm}));await expect(await canvas.findByText(copy.states.unavailable)).toBeVisible();await expect(canvas.queryByText(draft.records[0].title)).not.toBeInTheDocument();await expect(args.onRefresh).not.toHaveBeenCalled();}};
export const SingleFlight:Story={beforeEach:()=>mock('slow'),play:async({canvasElement,args})=>{const canvas=within(canvasElement);await userEvent.dblClick(await canvas.findByRole('button',{name:copy.confirm}));await waitFor(()=>expect(args.onRefresh).toHaveBeenCalledTimes(1));await expect(canvas.getByText(copy.states.confirmed)).toBeVisible();}};
export const Disabled:Story={args:{disabled:true},play:async({canvasElement,args})=>{const canvas=within(canvasElement);await expect(canvas.getByText(copy.states.unavailable)).toBeVisible();await expect(canvas.queryByRole('button')).not.toBeInTheDocument();await expect(args.onRefresh).not.toHaveBeenCalled();}};

const clearDraft=calendarClearProposalFixture(),clearView=calendarProposalViewSchema.parse({draft:clearDraft,context:calendarScheduleContextFixture(clearDraft)});
export const ClearSharedVisit:Story={beforeEach:()=>mock('ready',clearView),play:async({canvasElement})=>{const canvas=within(canvasElement);await expect(await canvas.findByRole('button',{name:copy.clear.confirm})).toBeEnabled();await expect(canvas.getByText(copy.clear.sharedHelp)).toBeVisible();}};
export const ConfirmClear:Story={beforeEach:()=>mock('ready',clearView),play:async({canvasElement,args})=>{const canvas=within(canvasElement);await userEvent.click(await canvas.findByRole('button',{name:copy.clear.confirm}));await expect(await canvas.findByText(copy.clear.confirmed)).toBeVisible();await expect(canvas.getByText(copy.saved)).toBeVisible();await expect(args.onRefresh).toHaveBeenCalledTimes(1);}};
export const CancelClear:Story={beforeEach:()=>mock('ready',clearView),play:async({canvasElement})=>{const canvas=within(canvasElement);await userEvent.click(await canvas.findByRole('button',{name:copy.cancel}));await expect(await canvas.findByText(copy.states.cancelled)).toBeVisible();}};
export const ClearRevokedOnConfirm:Story={beforeEach:()=>mock('confirmDenied',clearView),play:async({canvasElement,args})=>{const canvas=within(canvasElement);await userEvent.click(await canvas.findByRole('button',{name:copy.clear.confirm}));await expect(await canvas.findByText(copy.states.unavailable)).toBeVisible();await expect(canvas.queryByText(clearDraft.records[0].title)).not.toBeInTheDocument();await expect(args.onRefresh).not.toHaveBeenCalled();}};
