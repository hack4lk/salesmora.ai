'use client';

import { ganttChartPreviewData } from '../gantt-chart.fixtures';
import type { GanttChartData } from '../gantt-chart.types';
import { GanttChart } from './gantt-chart';

export type GanttChartPreviewProps = {
  data?: GanttChartData;
  today?: string;
  truncated?: boolean;
  workspaceId?: string;
};

/**
 * Storybook preview wrapper for the Gantt chart.
 * Defaults to today's date because the sample data is relative to today.
 */
export function GanttChartPreview({ data = ganttChartPreviewData, today = new Date().toISOString().split('T')[0], truncated, workspaceId }: GanttChartPreviewProps) {
  return (
    <main className="min-h-screen bg-canvas p-4 sm:p-6">
      <GanttChart
        jobs={data.jobs}
        teamMembers={data.teamMembers}
        customers={data.customers}
        today={today}
        truncated={truncated}
        workspaceId={workspaceId}
      />
    </main>
  );
}
