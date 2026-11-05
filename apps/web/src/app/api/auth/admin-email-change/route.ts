import { deliverAdminEmailChange } from '../../../../server/admin-email-change-delivery';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return deliverAdminEmailChange(request);
}
