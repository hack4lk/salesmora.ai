import { renderGanttPage } from '../../../../server/gantt/read-page';
export default async function GanttPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return renderGanttPage(await searchParams);
}
