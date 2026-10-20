import { renderLeadsPage, type LeadSearchParams } from '../../../server/leads/read-page';
import { leadsReadRouteData as copy } from '../../../features/leads/leads-page/leads-read-route.data';
export const dynamic = 'force-dynamic';
export const metadata = { title: copy.documentTitle };
export default async function Page({ searchParams }: { searchParams: Promise<LeadSearchParams> }) { return renderLeadsPage(await searchParams); }
