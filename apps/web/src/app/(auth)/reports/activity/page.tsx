import { renderActivityReportsPage } from '../../../../server/reports/read-page';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Activity report | SalesMora' };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return renderActivityReportsPage(await searchParams);
}
