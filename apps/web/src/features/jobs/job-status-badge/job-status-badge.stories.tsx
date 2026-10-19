import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {expect} from "storybook/test";
import {jobStatuses} from "@salesmora/contracts";
import {JobStatusBadge} from "./job-status-badge";
import {jobStatusBadgeData,jobStatusBadgeStoryData as copy} from "./job-status-badge.data";

const meta={
  title:"Jobs/JobStatusBadge",component:JobStatusBadge,args:{status:"needs-scheduling"},
  decorators:[Story=><main className="min-h-screen bg-canvas p-6"><h1 className="m-0 text-xl font-semibold text-ink">{copy.title}</h1><p className="mb-6 text-sm text-muted">{copy.description}</p><Story/></main>],
} satisfies Meta<typeof JobStatusBadge>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const AllStatuses:Story={render:()=> <div className="flex flex-wrap gap-3">{jobStatuses.map(status=><JobStatusBadge key={status} status={status}/>)}</div>,play:async({canvas})=>{for(const status of jobStatuses)await expect(canvas.getByText(jobStatusBadgeData[status].label,{exact:true})).toBeVisible();}};
export const Scheduled:Story={args:{status:"scheduled"}};
export const InProgress:Story={args:{status:"in-progress"}};
export const Waiting:Story={args:{status:"waiting"}};
export const Completed:Story={args:{status:"completed"}};
export const Canceled:Story={args:{status:"canceled"}};
export const InJobSummary:Story={args:{status:"waiting"},render:args=><section className="max-w-sm rounded-xl border border-line bg-white p-4"><p className="m-0 text-sm text-muted">{copy.customer}</p><h2 className="my-2 text-lg font-semibold text-ink">{copy.job}</h2><p className="text-sm text-muted">{copy.label}</p><JobStatusBadge {...args}/><p className="mb-0 text-sm text-muted">{copy.next}</p></section>};
