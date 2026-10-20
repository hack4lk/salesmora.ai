import { renderLeadsPage, type LeadSearchParams } from '../../../../server/leads/read-page';
import { leadsReadRouteData as copy } from '../../../../features/leads/leads-page/leads-read-route.data';
export const dynamic = 'force-dynamic';
export const metadata = { title: copy.detailTitle };
export default async function Page({ searchParams, params }: { searchParams: Promise<LeadSearchParams>; params: Promise<{ leadId: string }> }) { return renderLeadsPage(await searchParams, (await params).leadId); }
