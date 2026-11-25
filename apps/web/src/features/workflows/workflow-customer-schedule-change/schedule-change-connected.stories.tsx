import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { WorkflowDraft, WorkflowEditData } from '@salesmora/contracts';
import { ConnectedWorkflowDraft } from '../connected-workflow-draft';
const workspaceId='00000000-0000-4000-8000-000000000001',id='00000000-0000-4000-8000-000000000002';
const ticket:WorkflowDraft={id,workspaceId,name:'Customer schedule-change notices',rule:'Email customers after saved visit changes.',state:'pending',inputHash:'a'.repeat(64),expiresAt:'2099-12-31T23:59:00Z',definition:{kind:'customer_schedule_change',quietMinutes:5,maxBurstMinutes:15,recipientId:'owner',recipientName:'Owner',timezone:'America/New_York',notifications:{inApp:false,email:true}}};
const writes=fn(),reads=fn(),setup={company:{version:1,name:'Fixture Company',phone:'555-010-0100',email:'office@example.test'},senderReady:true,canConfigureCompany:true};
const editData:WorkflowEditData={workflow:{id,workspaceId,name:ticket.name,definition:ticket.definition,version:1,status:'paused'},recipients:[{id:'owner',name:'Owner'}],scheduleChangeOptions:setup};
const meta={title:'Workflows/Connected customer schedule changes',component:ConnectedWorkflowDraft,parameters:{layout:'fullscreen'},decorators:[Story=><main className="min-h-screen bg-assistant-panel p-5 text-assistant-foreground"><div className="mx-auto max-w-2xl"><Story/></div></main>],args:{ticket,disabled:false},beforeEach:()=>{
 writes.mockClear();reads.mockClear();const original=globalThis.fetch;globalThis.fetch=async(input,init)=>{
  const path=String(input);if(path.startsWith('/api/workflows/schedule-change-options')){reads(path);return Response.json(setup);}
  if(path.startsWith('/api/workflows/edit')){reads(path);return Response.json(editData);}
  if(path==='/api/chat/workflows/proposals'){const body=JSON.parse(String(init?.body));writes(body);return Response.json({draft:{...ticket,state:'confirmed',...(body.editValues?{editing:{id,version:2,status:'paused'}}:{})}});}
  return original(input,init);
 };return()=>{globalThis.fetch=original;};
}} satisfies Meta<typeof ConnectedWorkflowDraft>;
export default meta;type Story=StoryObj<typeof meta>;
export const Publish:Story={play:async({canvasElement})=>{const c=within(canvasElement);await expect(await c.findByText('5 minutes after the latest change')).toBeVisible();await userEvent.click(c.getByRole('button',{name:'Publish workflow'}));await expect(writes).toHaveBeenCalledWith(expect.objectContaining({scheduleChangeValues:{name:ticket.name}}));await expect(reads).toHaveBeenCalledTimes(1);}};
export const EditPaused:Story={args:{ticket:{...ticket,editing:{id,version:1,status:'paused'}}},play:async({canvasElement})=>{const c=within(canvasElement);await expect(await c.findByText('This workflow stays paused after saving.')).toBeVisible();await userEvent.click(c.getByRole('button',{name:'Change settings'}));await userEvent.clear(c.getByLabelText('Workflow name'));await userEvent.type(c.getByLabelText('Workflow name'),'Customer visit updates');await userEvent.click(c.getByRole('button',{name:'Save changes'}));await expect(writes).toHaveBeenCalledWith(expect.objectContaining({editValues:{name:'Customer visit updates',localTime:'17:00',businessDays:null,recipientId:'owner',notifications:{inApp:false,email:true}}}));}};
export const SavedHistory:Story={args:{ticket:{...ticket,state:'confirmed'}},play:async({canvasElement})=>{await expect(within(canvasElement).getByText('Workflow published.')).toBeVisible();await expect(reads).not.toHaveBeenCalled();}};
