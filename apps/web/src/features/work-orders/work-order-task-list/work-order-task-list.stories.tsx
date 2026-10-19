import {useState,type ComponentProps} from 'react';
import {fn,expect,userEvent,waitFor} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {WorkOrderTaskList} from './work-order-task-list';
import type {WorkOrderTask} from '../work-order-preview.types';
import {crewCapabilities,officeCapabilities,readOnlyCapabilities,workOrderTaskFixtures} from '../work-order-preview.data';

const [mixed,allDone,empty]=workOrderTaskFixtures.map(f=>f.tasks);
const StatefulTaskList=(args:ComponentProps<typeof WorkOrderTaskList>)=>{
 const [tasks,setTasks]=useState(args.tasks);
 return <WorkOrderTaskList {...args} tasks={tasks}
  onToggle={(id,done)=>{args.onToggle(id,done);setTasks(ts=>ts.map(t=>t.id===id?{...t,done,doneByName:done?'Sam Rivera':null,doneAt:done?'2026-10-19T13:00:00':null}:t))}}
  onAdd={(label,required)=>{args.onAdd(label,required);setTasks(ts=>[...ts,{id:`new-${ts.length+1}`,label,required,done:false,doneByName:null,doneAt:null}])}}
  onRemove={id=>{args.onRemove(id);setTasks(ts=>ts.filter(t=>t.id!==id))}}
  onToggleRequired={(id,required)=>{args.onToggleRequired(id,required);setTasks(ts=>ts.map(t=>t.id===id?{...t,required}:t))}}/>;
};
const meta={title:'Work Orders/WorkOrderTaskList',component:WorkOrderTaskList,render:args=><StatefulTaskList {...args}/>,
 args:{status:'in-progress',tasks:mixed,capabilities:officeCapabilities,onToggle:fn(),onAdd:fn(),onRemove:fn(),onToggleRequired:fn()},
 decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-3xl"><Story/></div></main>],
 parameters:{layout:'fullscreen'}} satisfies Meta<typeof WorkOrderTaskList>;
export default meta;type Story=StoryObj<typeof meta>;
export const InProgress:Story={play:async({canvas,args})=>{
 await userEvent.click(canvas.getByRole('checkbox',{name:'Install new unit and connect lines'}));
 await expect(args.onToggle).toHaveBeenCalledWith('t3',true);
 await userEvent.type(canvas.getByRole('textbox',{name:'New task'}),'Cap the water line');
 await waitFor(()=>expect(canvas.getByRole('button',{name:'Add task'})).toBeEnabled());await userEvent.click(canvas.getByRole('button',{name:'Add task'}));
 await expect(args.onAdd).toHaveBeenCalledWith('Cap the water line',false);
 await userEvent.click(canvas.getByRole('button',{name:'Remove task: Haul away old unit'}));
 await expect(args.onRemove).toHaveBeenCalledWith('t5');}};
export const CrewView:Story={args:{capabilities:crewCapabilities}};
export const Issued:Story={args:{status:'issued',tasks:mixed.map((t):WorkOrderTask=>({...t,done:false,doneByName:null,doneAt:null}))}};
export const Draft:Story={args:{status:'draft',tasks:mixed.map((t):WorkOrderTask=>({...t,done:false,doneByName:null,doneAt:null}))}};
export const DraftEmpty:Story={args:{status:'draft',tasks:empty}};
export const AllDone:Story={args:{tasks:allDone}};
export const Completed:Story={args:{status:'completed',tasks:allDone}};
export const Canceled:Story={args:{status:'canceled'}};
export const ReadOnly:Story={args:{capabilities:readOnlyCapabilities}};
