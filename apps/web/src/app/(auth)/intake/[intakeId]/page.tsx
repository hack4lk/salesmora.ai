import { renderIntakePage } from '../../../../server/lead-capture/intake-page';
import type { CaptureSearchParams } from '../../../../server/lead-capture/read-page';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Intake Review · SalesMora' };
export default async function Page({ params, searchParams }: { params: Promise<{ intakeId: string }>; searchParams: Promise<CaptureSearchParams> }) { return renderIntakePage(await searchParams, (await params).intakeId); }
