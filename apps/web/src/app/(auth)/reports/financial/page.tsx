import { renderFinancialReportsPage } from '../../../../server/reports/read-page';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Financial report | SalesMora' };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return renderFinancialReportsPage(await searchParams);
}
