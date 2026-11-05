import { renderCapturePage, type CaptureSearchParams } from '../../../../server/lead-capture/read-page';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Lead Capture · SalesMora' };
export default async function Page({ searchParams, params }: { searchParams: Promise<CaptureSearchParams>; params: Promise<{ sourceId: string }> }) { return renderCapturePage(await searchParams, 'detail', (await params).sourceId); }
