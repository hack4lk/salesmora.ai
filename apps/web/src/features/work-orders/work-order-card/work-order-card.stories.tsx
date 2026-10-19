import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {WorkOrderCard} from './work-order-card';
import {workOrderFixtures,workOrderPreviewData,crewCapabilities} from '../work-order-preview.data';

const meta={title:'Work Orders/WorkOrderCard',component:WorkOrderCard,args:{workOrder:workOrderFixtures[2],onOpen:fn(),onAction:fn()},
 decorators:[Story=><main className="min-h-screen bg-canvas p-6"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{workOrderPreviewData.workspace}</h1><div className="max-w-sm"><Story/></div></main>],
} satisfies Meta<typeof WorkOrderCard>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Draft:Story={args:{workOrder:workOrderFixtures[0]}};
export const Overdue:Story={args:{workOrder:workOrderFixtures[3]}};
export const Completed:Story={args:{workOrder:workOrderFixtures[4]}};
export const LongTitle:Story={args:{workOrder:{...workOrderFixtures[2],title:workOrderPreviewData.longTitle}}};
export const Crew:Story={args:{workOrder:{...workOrderFixtures[2],capabilities:crewCapabilities}}};
export const Dragging:Story={args:{dragging:true}};
export const Disabled:Story={args:{disabled:true}};
