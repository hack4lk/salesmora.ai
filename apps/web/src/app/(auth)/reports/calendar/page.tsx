import { renderCalendarReportsPage } from '../../../../server/reports/read-page';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Calendar report | SalesMora' };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return renderCalendarReportsPage(await searchParams);
}
