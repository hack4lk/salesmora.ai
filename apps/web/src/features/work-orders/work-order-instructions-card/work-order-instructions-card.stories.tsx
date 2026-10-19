import {useState,type ComponentProps} from 'react';
import {fn,expect,userEvent} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {WorkOrderInstructionsCard} from './work-order-instructions-card';
import {crewCapabilities,officeCapabilities,readOnlyCapabilities,workOrderInstructionFixtures} from '../work-order-preview.data';

const {full,empty,safetyOnly}=workOrderInstructionFixtures;
const Stateful=(args:ComponentProps<typeof WorkOrderInstructionsCard>)=>{
 const [value,setValue]=useState(args.value);
 return <WorkOrderInstructionsCard {...args} value={value} onSave={v=>{args.onSave(v);setValue(v)}}/>;
};
const meta={title:'Work Orders/WorkOrderInstructionsCard',component:WorkOrderInstructionsCard,render:args=><Stateful {...args}/>,
 args:{status:'issued',value:full,capabilities:officeCapabilities,onSave:fn()},
 decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-3xl"><Story/></div></main>],
 parameters:{layout:'fullscreen'}} satisfies Meta<typeof WorkOrderInstructionsCard>;
export default meta;type Story=StoryObj<typeof meta>;
export const OfficeEditing:Story={play:async({canvas,args})=>{
 await userEvent.click(canvas.getByRole('button',{name:'Edit'}));
 await expect(canvas.getByRole('textbox',{name:/Scope of work/})).toBeVisible();
 await userEvent.click(canvas.getByRole('button',{name:'Save'}));
 await expect(args.onSave).toHaveBeenCalledWith(full);
 await expect(canvas.getByRole('button',{name:'Edit'})).toBeVisible();}};
export const CrewView:Story={args:{capabilities:crewCapabilities}};
export const ChangedAfterIssue:Story={args:{changedAfterIssue:true}};
export const SafetyOnly:Story={args:{value:safetyOnly}};
export const DraftEmpty:Story={args:{status:'draft',value:empty}};
export const EmptyReadOnly:Story={args:{value:empty,capabilities:readOnlyCapabilities}};
export const Completed:Story={args:{status:'completed'}};
export const Canceled:Story={args:{status:'canceled'}};
export const ReadOnly:Story={args:{capabilities:readOnlyCapabilities}};
