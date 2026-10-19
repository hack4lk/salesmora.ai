import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { planChangeRequestSchema } from '@salesmora/contracts';
import { BillingAccessError, sandboxBillingEnabled, previewPlanChange, confirmPlanChange, undoPlanChange } from '@salesmora/data';
import { getSession } from '../../../../server/auth/session';
import { database } from '../../../../server/workspaces/store';
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function POST(request: Request) {
    if (!sandboxBillingEnabled())
        return reply({ error: 'Billing is unavailable.' }, 503);
    if (!process.env.BETTER_AUTH_URL || request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL).origin)
        return reply({ error: 'Invalid origin.' }, 403);
    const session = await getSession();
    if (!session)
        return reply({ error: 'Sign in to continue.' }, 401);
    const text = await request.text();
    if (text.length > 2000)
        return reply({ error: 'Request too large.' }, 413);
    let body;
    try {
        body = planChangeRequestSchema.parse(JSON.parse(text));
    }
    catch {
        return reply({ error: 'Invalid plan request.' }, 400);
    }
    try {
        const db = database(), now = Date.now();
        const rate = await db('rateLimits').insert({ id: randomUUID(), key: `billing-plan:${session.user.id}`, count: 1, lastRequest: now }).onConflict('key').merge({ count: db.raw('CASE WHEN "rateLimits"."lastRequest" < ? THEN 1 ELSE "rateLimits".count+1 END', [now - 60000]), lastRequest: db.raw('CASE WHEN "rateLimits"."lastRequest" < ? THEN ? ELSE "rateLimits"."lastRequest" END', [now - 60000, now]) }).returning('count');
        if (Number(rate[0].count) > 20)
            return reply({ error: 'Too many requests. Try again in a minute.' }, 429);
        return reply(body.action === 'preview' ? await previewPlanChange(db, session.user.id, body.workspaceId, body.plan) : body.action === 'undo' ? await undoPlanChange(db, session.user.id, body.workspaceId, body.quoteId) : await confirmPlanChange(db, session.user.id, body.workspaceId, body.quoteId, body.action === 'refresh'));
    }
    catch (error) {
        return reply({ error: error instanceof BillingAccessError ? error.message : 'Plan change could not be completed. Your current plan is preserved; refresh and review again.' }, error instanceof BillingAccessError ? 403 : 409);
    }
}
