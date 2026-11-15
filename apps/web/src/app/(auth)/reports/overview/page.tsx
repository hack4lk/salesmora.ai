import { renderBusinessOverviewPage } from '../../../../server/reports/read-page';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Business Overview | SalesMora' };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return renderBusinessOverviewPage(await searchParams);
}
