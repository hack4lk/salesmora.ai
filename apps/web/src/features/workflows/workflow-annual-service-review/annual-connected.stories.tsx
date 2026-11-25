import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { WorkflowDraft, WorkflowEditData } from '@salesmora/contracts';
import { ConnectedWorkflowDraft } from '../connected-workflow-draft';
const workspaceId='00000000-0000-4000-8000-000000000001',id='00000000-0000-4000-8000-000000000002';
const ticket:WorkflowDraft={id,workspaceId,name:'Annual gutter-cleaning review',rule:'Review gutter-cleaning customers every March 15.',state:'pending',inputHash:'a'.repeat(64),expiresAt:'2099-12-31T23:59:00Z',definition:{kind:'annual_service_review',service:'Gutter cleaning',rules:{firstReviewDate:'2030-03-15'},localTime:'09:00',recipientId:'morgan',recipientName:'Morgan Ellis',timezone:'America/New_York',notifications:{inApp:true,email:true}}};
const writes=fn(),reads=fn();
const editData:WorkflowEditData={workflow:{id,workspaceId,name:ticket.name,definition:ticket.definition,version:1,status:'paused'},recipients:[{id:'morgan',name:'Morgan Ellis'},{id:'alex',name:'Alex Parker'}],bookingOptions:{services:[{value:'Gutter cleaning',label:'Gutter cleaning'},{value:'Roofing',label:'Roofing'}],availabilityReady:true}};
const meta={title:'Workflows/Connected annual review',component:ConnectedWorkflowDraft,parameters:{layout:'fullscreen'},decorators:[Story=><main className="min-h-screen bg-assistant-panel p-5 text-assistant-foreground"><div className="mx-auto max-w-2xl"><Story/></div></main>],args:{ticket,disabled:false},beforeEach:()=>{
 writes.mockClear();reads.mockClear();const original=globalThis.fetch;globalThis.fetch=async(input,init)=>{
  const path=String(input);if(path.startsWith('/api/workflows/service-due-options')){reads(path);return Response.json({...editData.bookingOptions,recipients:editData.recipients});}
  if(path.startsWith('/api/workflows/edit')){reads(path);return Response.json(editData);}
  if(path==='/api/chat/workflows/proposals'){const body=JSON.parse(String(init?.body));writes(body);return Response.json({draft:{...ticket,state:'confirmed',...(body.editValues?{editing:{id,version:2,status:'paused'}}:{})}});}
  return original(input,init);
 };return()=>{globalThis.fetch=original;};
}} satisfies Meta<typeof ConnectedWorkflowDraft>;
export default meta;type Story=StoryObj<typeof meta>;
export const Publish:Story={play:async({canvasElement})=>{const c=within(canvasElement);await expect(await c.findByText(/Notify Morgan Ellis/)).toBeVisible();await userEvent.click(c.getByRole('button',{name:'Publish workflow'}));await expect(writes).toHaveBeenCalledWith(expect.objectContaining({annualReviewValues:{name:ticket.name,service:'Gutter cleaning',rules:{firstReviewDate:'2030-03-15'},recipientId:'morgan',localTime:'09:00',notifications:{inApp:true,email:true}}}));}};
export const EditPaused:Story={args:{ticket:{...ticket,editing:{id,version:1,status:'paused'}}},play:async({canvasElement})=>{const c=within(canvasElement);await expect(await c.findByText('This workflow stays paused after saving.')).toBeVisible();await userEvent.click(c.getByRole('button',{name:'Change settings'}));await userEvent.selectOptions(c.getByLabelText('Notify'),'alex');await userEvent.click(c.getByRole('button',{name:'Save changes'}));await expect(writes).toHaveBeenCalledWith(expect.objectContaining({editValues:expect.objectContaining({annualReviewRules:{firstReviewDate:'2030-03-15'},recipientId:'alex'})}));}};
export const SavedHistory:Story={args:{ticket:{...ticket,state:'confirmed'}},play:async({canvasElement})=>{await expect(within(canvasElement).getByText('Workflow published.')).toBeVisible();await expect(reads).not.toHaveBeenCalled();}};
