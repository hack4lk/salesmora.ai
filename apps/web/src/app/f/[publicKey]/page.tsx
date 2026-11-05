import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { PublicCapturePage } from '../../../features/lead-capture/public-capture-page/public-capture-page';
import { publicCapturePageData as copy } from '../../../features/lead-capture/public-capture-page/public-capture-page.data';
import { publicCaptureSource } from '../../../server/lead-capture/public';
export const dynamic = 'force-dynamic';
export const metadata = { title: copy.documentTitle, robots: { index: false, follow: false, noarchive: true }, referrer: 'no-referrer' as const };
export default async function HostedCapturePage({ params }: { params: Promise<{ publicKey: string }> }) {
  const { publicKey } = await params;
  const source = await publicCaptureSource(publicKey, (await headers()).get('host'), false);
  if (source.state === 'not-found') notFound(); return <PublicCapturePage source={source} />;
}
