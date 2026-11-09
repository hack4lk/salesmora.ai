import { renderLeadReportsPage } from '../../../../server/reports/read-page';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Leads report | SalesMora' };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return renderLeadReportsPage(await searchParams);
}
