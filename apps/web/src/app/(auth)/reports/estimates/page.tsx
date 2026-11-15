import { renderEstimateReportsPage } from '../../../../server/reports/read-page';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Estimates report | SalesMora' };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return renderEstimateReportsPage(await searchParams);
}
