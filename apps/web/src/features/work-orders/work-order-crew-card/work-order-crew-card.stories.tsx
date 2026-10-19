import {useState,type ComponentProps} from 'react';
import {fn,expect,userEvent} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {WorkOrderCrewCard} from './work-order-crew-card';
import {crewCapabilities,officeCapabilities,workOrderAssignmentFixtures,workOrderContact,workOrderMembers} from '../work-order-preview.data';

const {team,solo,unassigned}=workOrderAssignmentFixtures;
const Stateful=(args:ComponentProps<typeof WorkOrderCrewCard>)=>{
 const [assignment,setAssignment]=useState(args.assignment);
 return <WorkOrderCrewCard {...args} assignment={assignment} onSave={v=>{args.onSave(v);setAssignment(v)}}/>;
};
const meta={title:'Work Orders/WorkOrderCrewCard',component:WorkOrderCrewCard,render:args=><Stateful {...args}/>,
 args:{status:'issued',assignment:team,members:workOrderMembers,schedule:{date:'2026-10-21',window:'09:00-11:00'},contact:workOrderContact,capabilities:officeCapabilities,canSchedule:true,onSave:fn(),onOpenSchedule:fn()},
 decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-md"><Story/></div></main>],
 parameters:{layout:'fullscreen'}} satisfies Meta<typeof WorkOrderCrewCard>;
export default meta;type Story=StoryObj<typeof meta>;
export const OfficeAssigning:Story={play:async({canvas,args})=>{
 await userEvent.click(canvas.getByRole('button',{name:'Change crew'}));
 await userEvent.selectOptions(canvas.getByRole('combobox',{name:'Primary assignee'}),'u4');
 await userEvent.click(canvas.getByRole('button',{name:'Save crew'}));
 await expect(args.onSave).toHaveBeenCalledWith({assigneeId:'u4',crewIds:['u2','u3']});
 await userEvent.click(canvas.getByRole('button',{name:'Open in calendar'}));
 await expect(args.onOpenSchedule).toHaveBeenCalled();}};
export const CrewView:Story={args:{capabilities:crewCapabilities,canSchedule:false}};
export const PrimaryCanSchedule:Story={args:{capabilities:crewCapabilities,canSchedule:true}};
export const Solo:Story={args:{assignment:solo}};
export const DraftUnassigned:Story={args:{status:'draft',assignment:unassigned,schedule:{date:null,window:null}}};
export const NoPhone:Story={args:{contact:{...workOrderContact,phone:null}}};
export const Completed:Story={args:{status:'completed'}};
export const Canceled:Story={args:{status:'canceled'}};
