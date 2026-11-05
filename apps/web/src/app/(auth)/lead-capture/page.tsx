import { renderCapturePage, type CaptureSearchParams } from '../../../server/lead-capture/read-page';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Lead Capture · SalesMora' };
export default async function Page({ searchParams }: { searchParams: Promise<CaptureSearchParams> }) { return renderCapturePage(await searchParams, 'list'); }
