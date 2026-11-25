import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { WorkflowDraft, WorkflowEditData } from '@salesmora/contracts';
import { ConnectedWorkflowDraft } from '../connected-workflow-draft';
const workspaceId='00000000-0000-4000-8000-000000000001',id='00000000-0000-4000-8000-000000000002';
const ticket:WorkflowDraft={id,workspaceId,name:'Customer visit reminder',rule:'Email customers before visits.',state:'pending',inputHash:'a'.repeat(64),expiresAt:'2099-12-31T23:59:00Z',definition:{kind:'customer_visit_reminder',calendarDaysBefore:1,localTime:'09:00',recipientId:'owner',recipientName:'Owner',timezone:'America/New_York',notifications:{inApp:false,email:true}}};
const setup={company:{version:1,name:'Example Home Services',phone:'555-010-0142',email:'office@example.test'},senderReady:true,canConfigureCompany:true};
const writes=fn(),reads=fn();let missing=false;
const editData:WorkflowEditData={workflow:{id,workspaceId,name:ticket.name,definition:ticket.definition,version:1,status:'paused'},recipients:[{id:'owner',name:'Owner'}],customerVisitOptions:setup};
const meta={title:'Workflows/Connected customer visit reminder',component:ConnectedWorkflowDraft,parameters:{layout:'fullscreen'},decorators:[Story=><main className="min-h-screen bg-assistant-panel p-5 text-assistant-foreground"><div className="mx-auto max-w-2xl"><Story/></div></main>],args:{ticket,disabled:false},beforeEach:()=>{
 writes.mockClear();reads.mockClear();missing=false;const original=globalThis.fetch;globalThis.fetch=async(input,init)=>{
  const path=String(input);
  if(path.startsWith('/api/workflows/customer-visit-options')){if(init?.method==='POST'){writes(JSON.parse(String(init.body)));missing=false;return Response.json(setup);}reads(path);return Response.json(missing?{...setup,company:{...setup.company,phone:'',email:''}}:setup);}
  if(path.startsWith('/api/workflows/edit')){reads(path);return Response.json(editData);}
  if(path==='/api/chat/workflows/proposals'){const body=JSON.parse(String(init?.body));writes(body);return Response.json({draft:{...ticket,state:'confirmed',...(body.editValues?{editing:{id,version:2,status:'paused'}}:{})}});}
  return original(input,init);
 };return()=>{globalThis.fetch=original;};
}} satisfies Meta<typeof ConnectedWorkflowDraft>;
export default meta;type Story=StoryObj<typeof meta>;
export const Publish:Story={play:async({canvasElement})=>{const c=within(canvasElement);await expect(await c.findByText(/Automatically email each customer/)).toBeVisible();await userEvent.click(c.getByRole('button',{name:'Publish workflow'}));await expect(writes).toHaveBeenCalledWith(expect.objectContaining({customerVisitValues:{name:ticket.name,localTime:'09:00'}}));}};
export const EditPaused:Story={args:{ticket:{...ticket,editing:{id,version:1,status:'paused'}}},play:async({canvasElement})=>{const c=within(canvasElement);await expect(await c.findByText('This workflow stays paused after saving.')).toBeVisible();const time=c.getByLabelText('Send at');await userEvent.clear(time);await userEvent.type(time,'08:00');await userEvent.click(c.getByRole('button',{name:'Save changes'}));await expect(writes).toHaveBeenCalledWith(expect.objectContaining({editValues:expect.objectContaining({localTime:'08:00',recipientId:'owner',notifications:{inApp:false,email:true}})}));}};
export const MissingCompanySetup:Story={beforeEach:()=>{missing=true;},play:async({canvasElement})=>{const c=within(canvasElement);await userEvent.click(await c.findByRole('button',{name:'Open email settings'}));await userEvent.type(c.getByLabelText('Company phone'),'555-010-0142');await userEvent.type(c.getByLabelText('Company email'),'office@example.test');await userEvent.click(c.getByRole('button',{name:'Save contact details'}));await expect(writes).toHaveBeenCalledWith({action:'company',expectedVersion:1,phone:'555-010-0142',email:'office@example.test'});await expect(c.getByRole('button',{name:'Publish workflow'})).toBeEnabled();await expect(writes).toHaveBeenCalledTimes(1);}};
export const SavedHistory:Story={args:{ticket:{...ticket,state:'confirmed'}},play:async({canvasElement})=>{await expect(within(canvasElement).getByText('Workflow published.')).toBeVisible();await expect(reads).not.toHaveBeenCalled();}};
