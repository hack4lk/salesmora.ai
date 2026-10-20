export const dynamic = 'force-dynamic';

// Process liveness only. Database readiness is checked by migrations and the
// authenticated staging smoke checks; never expose service configuration here.
export async function GET() {
  return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
}
