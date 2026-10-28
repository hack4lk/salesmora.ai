import { renderCalendarPage } from '../../../server/calendar/read-page';
export default async function CalendarPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return renderCalendarPage(await searchParams);
}
