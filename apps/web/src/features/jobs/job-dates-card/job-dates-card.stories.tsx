import {expect,fn,within} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobDatesCard} from './job-dates-card';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobDatesCard',component:JobDatesCard,args:{job:f.jobFixtures[2],today:f.jobToday,onSchedule:fn(),onDeadline:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobDatesCard>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Unscheduled:Story={args:{job:f.jobFixtures[0]}};
export const Overdue:Story={args:{job:f.jobFixtures[3]}};
export const ReadOnly:Story={args:{job:{...f.jobFixtures[2],capabilities:f.jobReadOnlyCapabilities}}};

export const PlannedWork: Story = {
 args: { job: { ...f.jobFixtures[2], scheduledDate: '2026-11-23', arrivalWindow: null, workTime: { startTime: '08:00', durationMinutes: 60 }, workTimezone: 'America/New_York' } },
 play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText('Planned work')).toBeVisible();
  await expect(c.getByText('8:00 AM–9:00 AM · 1 hour · America/New_York')).toBeVisible();
  await expect(c.queryByText('Arrival window not set')).not.toBeInTheDocument();
 },
};
export const PlannedWorkAndArrival: Story = {
 args: { job: { ...f.jobFixtures[2], scheduledDate: '2026-11-23', arrivalWindow: '08:00-10:00', workTime: { startTime: '08:00', durationMinutes: 60 }, workTimezone: 'America/New_York' } },
 play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText('Planned work')).toBeVisible();
  await expect(c.getByText('08:00-10:00')).toBeVisible();
 },
};
export const NoPlannedTime: Story = {
 args: { job: { ...f.jobFixtures[2], scheduledDate: '2026-11-23', arrivalWindow: null } },
 play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText('Arrival window not set')).toBeVisible();
  await expect(c.queryByText('Planned work')).not.toBeInTheDocument();
 },
};
