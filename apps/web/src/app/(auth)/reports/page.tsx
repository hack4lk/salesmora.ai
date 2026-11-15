import { renderReportCatalogPage } from '../../../server/reports/read-page';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reports | SalesMora' };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return renderReportCatalogPage(await searchParams);
}
