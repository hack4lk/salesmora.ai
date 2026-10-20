import {useState,type ComponentProps} from 'react';
import {fn,expect} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {WorkOrderSignoff} from './work-order-signoff';
import {crewCapabilities,officeCapabilities,readOnlyCapabilities,workOrderCompletionFixture} from '../work-order-preview.data';

const Stateful=(args:ComponentProps<typeof WorkOrderSignoff>)=>{
 const [status,setStatus]=useState(args.status);const [completion,setCompletion]=useState(args.completion);
 return <WorkOrderSignoff {...args} status={status} completion={completion}
  onComplete={i=>{args.onComplete(i);setStatus('completed');setCompletion({summary:i.summary,followUp:i.followUp,followUpNote:i.followUpNote,completedByName:'Sam Rivera',completedAt:'2026-10-19T13:00:00',signerName:i.signerName||null,signedAt:i.signerName?'2026-10-19T13:00:00':null,signatureUrl:i.signatureDataUrl,overrideReason:i.overrideReason})}}
  onReopen={()=>{args.onReopen();setStatus('in-progress');setCompletion(null)}}/>;
};
const meta={title:'Work Orders/WorkOrderSignoff',component:WorkOrderSignoff,render:args=><Stateful {...args}/>,
 args:{status:'in-progress',completion:null,openRequiredTasks:0,signoffRequired:true,canOverride:false,capabilities:crewCapabilities,onComplete:fn(),onReopen:fn()},
 decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-2xl"><Story/></div></main>],
 parameters:{layout:'fullscreen'}} satisfies Meta<typeof WorkOrderSignoff>;
export default meta;type Story=StoryObj<typeof meta>;
export const CompleteWithSignature:Story={play:async({canvas})=>{
 await expect(canvas.getByRole('button',{name:'Complete work order'})).toBeDisabled();}};
export const SignoffNotRequired:Story={args:{signoffRequired:false}};
export const RequiredTasksOpenCrew:Story={args:{openRequiredTasks:2}};
export const RequiredTasksOpenOfficeOverride:Story={args:{openRequiredTasks:2,canOverride:true,capabilities:officeCapabilities}};
export const CompletedSigned:Story={args:{status:'completed',completion:workOrderCompletionFixture,capabilities:officeCapabilities}};
export const CompletedCrew:Story={args:{status:'completed',completion:workOrderCompletionFixture}};
export const CompletedUnsigned:Story={args:{status:'completed',completion:{...workOrderCompletionFixture,signerName:null,signedAt:null,followUp:'none',followUpNote:''}}};
export const CompletedWithOverride:Story={args:{status:'completed',completion:{...workOrderCompletionFixture,overrideReason:'Customer cancelled the haul-away task.'},capabilities:officeCapabilities}};
export const Issued:Story={args:{status:'issued'}};
export const Draft:Story={args:{status:'draft',capabilities:officeCapabilities}};
export const Canceled:Story={args:{status:'canceled',capabilities:officeCapabilities}};
export const ReadOnly:Story={args:{capabilities:readOnlyCapabilities}};
