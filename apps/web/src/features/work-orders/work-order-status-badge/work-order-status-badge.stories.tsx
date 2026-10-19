import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {expect} from "storybook/test";
import {workOrderStatuses} from "@salesmora/contracts";
import {WorkOrderStatusBadge} from "./work-order-status-badge";
import {workOrderStatusBadgeData,workOrderStatusBadgeStoryData as copy} from "./work-order-status-badge.data";

const meta={
  title:"Work Orders/WorkOrderStatusBadge",component:WorkOrderStatusBadge,args:{status:"draft"},
  decorators:[Story=><main className="min-h-screen bg-canvas p-6"><h1 className="m-0 text-xl font-semibold text-ink">{copy.title}</h1><p className="mb-6 text-sm text-muted">{copy.description}</p><Story/></main>],
} satisfies Meta<typeof WorkOrderStatusBadge>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const AllStatuses:Story={render:()=> <div className="flex flex-wrap gap-3">{workOrderStatuses.map(status=><WorkOrderStatusBadge key={status} status={status}/>)}</div>,play:async({canvas})=>{for(const status of workOrderStatuses)await expect(canvas.getByText(workOrderStatusBadgeData[status].label,{exact:true})).toBeVisible();}};
export const Issued:Story={args:{status:"issued"}};
export const InProgress:Story={args:{status:"in-progress"}};
export const Completed:Story={args:{status:"completed"}};
export const Canceled:Story={args:{status:"canceled"}};
export const InWorkOrderSummary:Story={args:{status:"in-progress"},render:args=><section className="max-w-sm rounded-xl border border-line bg-white p-4"><p className="m-0 text-sm text-muted">{copy.customer}</p><h2 className="my-2 text-lg font-semibold text-ink">{copy.workOrder}</h2><p className="text-sm text-muted">{copy.label}</p><WorkOrderStatusBadge {...args}/><p className="mb-0 text-sm text-muted">{copy.next}</p></section>};
