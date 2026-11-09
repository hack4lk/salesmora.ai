import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type { Knex } from 'knex';
import { permissionIds, type ActivityReportQuery } from '@salesmora/contracts';
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from '../authorization/store';
import { createDatabase } from '../database';
import { prepareActivityReportInTransaction, readActivityReportInTransaction } from './activity';
import { prepareActivityReportCSVProjectionInTransaction } from './activity-export-projection';
import { readActivityReportWithAuthorityInTransaction, initialActivityReportWithAuthorityInTransaction } from './activity-read';
import { addCalendarDays } from '@salesmora/domain';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
const db = createDatabase(connection);
const workspaceId = randomUUID(), otherWorkspace = randomUUID();
const owner = randomUUID(), field = randomUUID(), office = randomUUID(), outsider = randomUUID(), former = randomUUID();
const enabled = [...permissionIds], rollback = new Error('Rollback Activity fixtures.');
let checks = 0;
async function check(name: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${name}`); }
try {
  await assert.rejects(db.transaction(async trx => {
    await trx('users').insert([owner, field, office, outsider, former].map(id => ({
      id, name: id === owner ? 'Owner actor' : id === field ? 'Field actor' : 'Other actor',
      email: `${id}@example.test`, termsVersion: 'fixture', termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    })));
    await trx('workspaces').insert([
      { id: workspaceId, ownerId: owner }, { id: otherWorkspace, ownerId: outsider },
    ].map(row => ({ ...row, businessName: 'Activity fixture', businessType: 'test', postalCode: '', serviceRange: '', timezone: 'America/New_York' })));
    await trx('workspaceMemberships').insert([
      { workspaceId, userId: owner, role: 'owner' }, { workspaceId, userId: field, role: 'field' },
      { workspaceId, userId: office, role: 'office' }, { workspaceId: otherWorkspace, userId: outsider, role: 'owner' },
    ]);
    await initializeWorkspacePolicy(trx, { workspaceId, userId: owner });
    await initializeWorkspacePolicy(trx, { workspaceId: otherWorkspace, userId: outsider });
    async function seedLead(ownerId: string, archived = false, ws = workspaceId) {
      const id = randomUUID();
      await trx('leads').insert({ id, workspaceId: ws, createdBy: ws === workspaceId ? owner : outsider,
        submissionId: randomUUID(), submissionHash: 'fixture', name: 'Native lead', email: '', phone: '', service: '', address: '',
        details: 'PRIVATE_RECORD', notes: 'PRIVATE_NOTE', source: 'website', stage: 'new', ownerId,
        archivedAt: archived ? '2026-11-04T12:00:00Z' : null, createdAt: '2026-10-01T12:00:00Z' });
      return id;
    }
    const mine = await seedLead(field), other = await seedLead(office), archived = await seedLead(office, true);
    const foreign = await seedLead(outsider, false, otherWorkspace);
    async function seedJob(primaryOwnerId: string, status = 'needs-scheduling') {
      const id = randomUUID();
      await trx('jobs').insert({ id, workspaceId, primaryOwnerId, createdBy: owner, title: 'Native Job', customerName: 'PRIVATE_CUSTOMER',
        service: '', location: '', description: 'PRIVATE_JOB_DESCRIPTION', status });
      return id;
    }
    const job = await seedJob(office, 'completed'), hiddenJob = await seedJob(office, 'canceled');
    await trx('jobTeamMembers').insert([
      { workspaceId, jobId: job, userId: field }, { workspaceId, jobId: job, userId: owner },
    ]);
    async function leadEvent(id: string, type: string, time = '2026-11-02T12:00:00Z',
      actorId: string | null = owner, actorType = 'user', eventId = randomUUID()) {
      await trx('leadActivity').insert({ id: eventId, workspaceId: id === foreign ? otherWorkspace : workspaceId, leadId: id,
        actorId, actorName: 'PRIVATE_HISTORICAL_ACTOR', actorType, type, changes: JSON.stringify({ body: 'PRIVATE_EVENT_NOTE', fields: ['notes'], token: 'PRIVATE_TOKEN' }),
        createdAt: time });
      return eventId;
    }
    async function jobEvent(id: string, type: string, time = '2026-11-02T12:00:00Z',
      actorId: string | null = field, source = 'assistant-confirmed', eventId = randomUUID(), to = 'completed') {
      await trx('jobActivity').insert({ id: eventId, workspaceId, jobId: id, actorId, actorName: 'PRIVATE_HISTORICAL_ACTOR',
        source, type, changes: JSON.stringify({ to, body: 'PRIVATE_EVENT_NOTE', price: 'PRIVATE_MONEY' }), createdAt: time });
      return eventId;
    }
    const sharedId = randomUUID();
    await leadEvent(mine, 'stage', '2026-11-02T12:00:00Z', owner, 'user', sharedId);
    await jobEvent(job, 'status', '2026-11-02T12:00:00Z', field, 'assistant-confirmed', sharedId);
    await leadEvent(other, 'edited');
    await leadEvent(archived, 'archived');
    await leadEvent(mine, 'assigned', '2026-11-01T04:00:00Z', null, 'system');
    await jobEvent(job, 'deadline', '2026-11-03T04:59:59.999Z', null, 'system');
    await leadEvent(other, 'restored', '2026-11-02T12:00:00Z', former);
    await jobEvent(hiddenJob, 'schedule');
    await leadEvent(mine, 'note');
    await jobEvent(job, 'note');
    await leadEvent(foreign, 'unrecognized-private-type');
    await leadEvent(other, 'created', '2026-11-01T03:59:59.999Z');
    await jobEvent(job, 'edit', '2026-11-03T05:00:00Z');
    const readIn = (transaction: Knex.Transaction, userId = owner, patch: Partial<ActivityReportQuery> = {}, permissions = enabled) =>
      withWorkspaceAuthorization(transaction, { workspaceId, userId }, permissions, false, (transaction, context) =>
        readActivityReportInTransaction(transaction, context, {
          workspaceId, view: 'activity', period: { from: '2026-11-01', to: '2026-11-02' },
          filters: { domains: [], actions: [], actors: [] }, page: 1, pageSize: 25, ...patch,
        }));
    const read = (userId = owner, patch: Partial<ActivityReportQuery> = {}, permissions = enabled) => readIn(trx, userId, patch, permissions);
    await check('authority envelope preserves native period facets and session identity with local initial dates', async () => {
      await withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, enabled, false, async (transaction, context) => {
        const query: ActivityReportQuery = { workspaceId, view: 'activity', period: { from: '2026-11-01', to: '2026-11-02' },
          filters: { domains: [], actions: [], actors: [] }, page: 1, pageSize: 25 };
        const result = await readActivityReportWithAuthorityInTransaction(transaction, context, query);
        assert.deepEqual(result.report, await readActivityReportInTransaction(transaction, context, query));
        assert.equal(result.viewerId, owner);
        assert.equal(result.policyRevision, context.policy.revision);
        assert.equal(result.authority.scope, 'workspace');
        const initial = await initialActivityReportWithAuthorityInTransaction(transaction, context);
        assert.deepEqual(initial.query.period, { from: addCalendarDays(initial.report.today, -29), to: initial.report.today });
        assert.deepEqual(initial.query.filters, { domains: [], actions: [], actors: [] });
        await assert.rejects(readActivityReportWithAuthorityInTransaction(transaction, context,
          { ...query, workspaceId: otherWorkspace }), AuthorizationAccessError);
      });
      await withWorkspaceAuthorization(trx, { workspaceId, userId: field }, enabled, false, async (transaction, context) => {
        const initial = await initialActivityReportWithAuthorityInTransaction(transaction, context);
        assert.equal(initial.authority.scope, 'assigned');
        assert.ok(initial.report.includedDomains.every(item => item.scope === 'assigned'));
        assert.ok(initial.report.omittedDomains.some(item => item.domain === 'customer'));
      });
      await assert.rejects(withWorkspaceAuthorization(trx, { workspaceId, userId: owner },
        enabled.filter(id => id !== 'reports.read'), false, initialActivityReportWithAuthorityInTransaction), AuthorizationAccessError);
    });
    await check('safe native union uses namespaced identities, exact DST bounds, completed/canceled Jobs and stable ties without member multiplication', async () => {
      const result = await read();
      assert.equal(result.total, 8);
      assert.deepEqual(result.includedDomains, [
        { domain: 'lead', scope: 'workspace', archiveVisibility: 'included' },
        { domain: 'job', scope: 'workspace', archiveVisibility: 'not-applicable' },
        { domain: 'customer', scope: 'workspace', archiveVisibility: 'included' },
        { domain: 'estimate', scope: 'workspace', archiveVisibility: 'included' },
        { domain: 'work-order', scope: 'workspace', archiveVisibility: 'included' },
      ]);
      assert.equal(result.omittedDomains.length, 0);
      assert.equal(result.rows.filter(row => row.eventId === sharedId).length, 2);
      assert(result.rows.find(row => row.eventId === sharedId && row.domain === 'job')?.action === 'completed');
      const ties = result.rows.filter(row => row.occurredAt.startsWith('2026-11-02T12:00:00'));
      assert.deepEqual(ties.map(row => `${row.domain}:${row.eventId}`), ties.map(row => `${row.domain}:${row.eventId}`).sort());
      assert(!JSON.stringify(result).includes('PRIVATE_'));
      assert(!JSON.stringify(result).includes(foreign));
      assert(result.rows.some(row => row.actor.key === 'system'));
      assert(result.rows.some(row => row.actor.label === 'Former or unavailable actor' && row.actor.key === 'unavailable-actor'));
    });
    await check('facets are OR within and AND across; actor options come only from authorized period events', async () => {
      const filters = { domains: ['lead', 'job'] as const, actions: ['stage-changed', 'completed'] as const, actors: [`member:${owner}`, `member:${field}`] };
      const result = await read(owner, { filters: { domains: [...filters.domains], actions: [...filters.actions], actors: filters.actors } });
      assert.equal(result.total, 2);
      const single = await read(owner, { filters: { domains: ['job'], actions: ['completed'], actors: [`member:${field}`] } });
      assert.equal(single.total, 1);
      assert.equal(single.rows[0]?.domain, 'job');
      assert(!result.options.actors.some(actor => actor.value.includes(outsider) || actor.value.includes(former)));
      await assert.rejects(read(owner, { filters: { domains: [], actions: [], actors: ['member:hidden'] } }), AuthorizationAccessError);
      await assert.rejects(read(owner, { filters: { domains: [], actions: ['sent'], actors: [] } }), AuthorizationAccessError);
      assert.equal((await read(owner, { filters: { domains: ['work-order'], actions: [], actors: [] } })).total, 0);
    });
    await check('current assigned scopes authorize parents before totals and actor facets; reassignment removes past history', async () => {
      const result = await read(field);
      assert.equal(result.total, 4);
      assert(result.rows.every(row => row.recordId === mine || row.recordId === job));
      assert(!result.rows.some(row => row.recordId === hiddenJob || row.recordId === archived));
      assert(!result.options.actors.some(actor => actor.value === 'unavailable-actor'));
      await trx('leads').where({ id: mine }).update({ ownerId: office });
      await trx('jobTeamMembers').where({ workspaceId, jobId: job, userId: field }).delete();
      assert.equal((await read(field)).total, 0);
      await trx('leads').where({ id: mine }).update({ ownerId: field });
      await trx('jobTeamMembers').insert({ workspaceId, jobId: job, userId: field });
    });
    await check('domain and archive revocation narrows output without querying inaccessible unknown histories; entrance and foreign workspace deny', async () => {
      for (const permission of ['leads.read', 'jobs.read'] as const) {
        const reduced = enabled.filter(id => id !== permission);
        const result = await read(owner, {}, reduced);
        const deniedDomain = permission === 'leads.read' ? 'lead' : 'job';
        assert(result.rows.every(row => row.domain !== deniedDomain));
        assert(result.omittedDomains.some(item => item.domain === deniedDomain && item.reason === 'permissions'));
        await assert.rejects(read(owner, { filters: { domains: [deniedDomain], actions: [], actors: [] } }, reduced), AuthorizationAccessError);
      }
      const reduced = enabled.filter(id => id !== 'leads.archive');
      const withoutArchive = await read(owner, {}, reduced);
      assert.equal(withoutArchive.total, 7);
      assert(!withoutArchive.rows.some(row => row.recordId === archived));
      await assert.rejects(read(owner, {}, enabled.filter(id => id !== 'reports.read')), AuthorizationAccessError);
      await assert.rejects(read(outsider), AuthorizationAccessError);
      await assert.rejects(read(owner, { workspaceId: otherWorkspace }), AuthorizationAccessError);
      await assert.rejects(read(owner, { period: { from: '2099-01-01', to: '2099-01-02' } }), RangeError);
    });
    const mappingRollback = new Error('Rollback Activity mapping fixtures.');
    await assert.rejects(trx.transaction(async inner => {
      await check('every supported native Lead/Job event maps to a safe generic action without projecting changes', async () => {
        const leadMappings = { created: 'created', edited: 'updated', assigned: 'assignment-changed', stage: 'stage-changed',
          archived: 'archived', restored: 'updated' };
        const jobMappings = { created: 'created', edit: 'updated', assign: 'assignment-changed', deadline: 'deadline-changed',
          schedule: 'visit-changed', status: 'status-changed' };
        const expected = new Map<string, string>();
        for (const [type, action] of Object.entries(leadMappings)) {
          const id = await leadEvent(mine, type, '2026-11-02T13:00:00.000001Z', owner, 'assistant-confirmed');
          expected.set(`lead:${id}`, action);
        }
        for (const [type, action] of Object.entries(jobMappings)) {
          const id = await jobEvent(job, type, '2026-11-02T13:00:00.000002Z', null, 'ui', randomUUID(), 'canceled');
          expected.set(`job:${id}`, action);
        }
        const result = await readIn(inner);
        for (const [key, action] of expected) {
          const row = result.rows.find(row => `${row.domain}:${row.eventId}` === key);
          assert.equal(row?.action, action);
          if (row?.domain === 'job') assert.equal(row.actor.label, 'Former or unavailable actor');
        }
        assert(!JSON.stringify(result).includes('PRIVATE_'));
        assert(result.rows[0]?.domain === 'job');
      });
      throw mappingRollback;
    }), error => error === mappingRollback);
    await check('assigned Reports scope intersects otherwise workspace domain reads without widening genuine policy', async () => {
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'assigned' });
      const result = await read();
      assert.equal(result.total, 2);
      assert(result.includedDomains.every(item => item.scope === 'assigned'));
      assert(result.rows.every(row => row.domain === 'job' && row.recordId === job));
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'workspace' });
    });
    const customerRollback = new Error('Rollback Customer Activity fixtures.');
    await assert.rejects(trx.transaction(async inner => {
      const read = (userId = owner, patch: Partial<ActivityReportQuery> = {}, permissions = enabled) => readIn(inner, userId, patch, permissions);
      const customerFilters = { domains: ['customer'] as const, actions: [], actors: [] };
      const customerRead = (patch: Partial<ActivityReportQuery> = {}, permissions = enabled) =>
        read(owner, { filters: { ...customerFilters, domains: [...customerFilters.domains] }, ...patch }, permissions);
      async function seedCustomer(ws = workspaceId, archived = false): Promise<string> {
        const id = randomUUID();
        await inner('customers').insert({ id, workspaceId: ws, name: 'Native Customer', type: 'person',
          companyName: '', email: 'PRIVATE_EMAIL', phone: 'PRIVATE_PHONE', location: 'PRIVATE_LOCATION',
          internalNotes: 'PRIVATE_CUSTOMER_NOTE', ownerId: ws === workspaceId ? field : outsider,
          archivedAt: archived ? '2026-11-04T12:00:00Z' : null });
        return id;
      }
      const customer = await seedCustomer(), archivedCustomer = await seedCustomer(workspaceId, true);
      const foreignCustomer = await seedCustomer(otherWorkspace);
      async function customerEvent(id: string, type: string, actorId: string | null = owner,
        eventId: string = randomUUID(), at = '2026-11-02T12:00:00Z') {
        await inner('customerActivity').insert({ id: eventId, workspaceId: id === foreignCustomer ? otherWorkspace : workspaceId,
          customerId: id, actorId, actorName: 'PRIVATE_SAVED_NAME', type, body: 'PRIVATE_BODY_LEAD_REFERENCE',
          createdAt: at });
        return eventId;
      }
      const expected = new Map<string, string>();
      for (const [type, action] of Object.entries({ created: 'created', updated: 'updated', archived: 'archived',
        restored: 'updated', linked: 'updated', unlinked: 'updated' })) {
        expected.set(await customerEvent(customer, type, owner, type === 'created' ? sharedId : randomUUID()), action);
      }
      await customerEvent(archivedCustomer, 'archived', office);
      await customerEvent(customer, 'updated', null);
      await customerEvent(customer, 'note');
      await customerEvent(foreignCustomer, 'unknown-private-action', outsider);
      await customerEvent(customer, 'created', owner, randomUUID(), '2026-11-01T03:59:59.999Z');
      await customerEvent(customer, 'created', owner, randomUUID(), '2026-11-03T05:00:00Z');
      await inner('leads').whereIn('id', [mine, other]).update({ customerId: customer });
      await check('Customer union reads native events once, including links/restores, without copying linked Lead histories or body details', async () => {
        const result = await customerRead();
        assert.equal(result.total, 8);
        for (const [id, action] of expected) assert.equal(result.rows.find(row => row.eventId === id)?.action, action);
        assert(result.rows.every(row => row.domain === 'customer' && [customer, archivedCustomer].includes(row.recordId)));
        assert(result.rows.every(row => row.recordLabel.startsWith('Customer CU-')));
        assert(!JSON.stringify(result).includes('PRIVATE_'));
        assert(!JSON.stringify(result).includes(mine));
        assert(!JSON.stringify(result).includes(foreignCustomer));
        assert(result.rows.some(row => row.actor.key === 'unavailable-actor'));
        assert(!result.rows.some(row => row.actor.kind === 'system'));
        const all = await read();
        assert.equal(all.total, 16);
        assert.equal(all.rows.filter(row => row.eventId === sharedId).length, 3);
        const filtered = await customerRead({ filters: { domains: ['customer'], actions: ['created', 'updated'], actors: [`member:${owner}`] } });
        assert.equal(filtered.total, 5);
        assert(filtered.rows.every(row => row.domain === 'customer' && row.actor.key === `member:${owner}`));
        const start = await customerEvent(customer, 'created', owner, randomUUID(), '2026-11-01T04:00:00Z');
        const end = await customerEvent(customer, 'created', owner, randomUUID(), '2026-11-03T04:59:59.999Z');
        assert.equal((await customerRead()).total, 10);
        await inner('customerActivity').whereIn('id', [start, end]).delete();
      });
      await check('related Customer access and assigned Reports never grant Customer history or its actor facets', async () => {
        const fieldResult = await read(field);
        assert.equal(fieldResult.total, 4);
        assert(!fieldResult.options.domains.includes('customer'));
        assert(fieldResult.omittedDomains.some(item => item.domain === 'customer' && item.reason === 'permissions'));
        await assert.rejects(read(field, { filters: { domains: ['customer'], actions: [], actors: [] } }), AuthorizationAccessError);
        await inner('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'assigned' });
        const assigned = await read();
        assert(!assigned.options.domains.includes('customer'));
        await assert.rejects(customerRead(), AuthorizationAccessError);
        await inner('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'workspace' });
      });
      await check('Customer archive/full-read revocation removes rows and exclusive actor options; Lead revocation does not remove native Customer history', async () => {
        const withoutArchive = await customerRead({}, enabled.filter(id => id !== 'customers.archive'));
        assert.equal(withoutArchive.total, 7);
        assert(!withoutArchive.rows.some(row => row.recordId === archivedCustomer));
        assert(!withoutArchive.options.actors.some(actor => actor.value === `member:${office}`));
        assert.equal(withoutArchive.includedDomains.find(item => item.domain === 'customer')?.archiveVisibility, 'excluded');
        const withoutCustomers = enabled.filter(id => id !== 'customers.read');
        const reduced = await read(owner, {}, withoutCustomers);
        assert.equal(reduced.total, 8);
        assert(!reduced.options.actors.some(actor => actor.value === `member:${office}`));
        assert(reduced.omittedDomains.some(item => item.domain === 'customer' && item.reason === 'permissions'));
        await assert.rejects(customerRead({}, withoutCustomers), AuthorizationAccessError);
        assert.equal((await customerRead({}, enabled.filter(id => id !== 'leads.read'))).total, 8);
      });
      await check('unknown Customer types fail outside the selected page/filter, but inaccessible/archived histories never trigger a failure', async () => {
        const unknown = await customerEvent(customer, 'unknown-customer-action');
        await assert.rejects(customerRead({ filters: { domains: ['customer'], actions: ['created'], actors: [] } }), /unsupported event/);
        assert.equal((await read(field)).total, 4);
        assert.equal((await read(owner, {}, enabled.filter(id => id !== 'customers.read'))).total, 8);
        await inner('customerActivity').where({ id: unknown }).delete();
        const archivedUnknown = await customerEvent(archivedCustomer, 'unknown-archived-action');
        await assert.rejects(customerRead(), /unsupported event/);
        assert.equal((await customerRead({}, enabled.filter(id => id !== 'customers.archive'))).total, 7);
        await inner('customerActivity').where({ id: archivedUnknown }).delete();
      });
      await check('Customer event dates preserve DST and fractional-offset boundaries and deletion removes native history only', async () => {
        for (const timezone of ['Asia/Kathmandu', 'Pacific/Kiritimati']) {
          await inner('workspaces').where({ id: workspaceId }).update({ timezone });
          const result = await customerRead();
          const expected = await inner('customerActivity').where({ workspaceId }).whereNot('type', 'note')
            .whereRaw(`("createdAt" AT TIME ZONE ?)::date BETWEEN ?::date AND ?::date`,
            [timezone, '2026-11-01', '2026-11-02']).count('* as count').first();
          assert.equal(result.total, Number(expected?.count));
        }
        await inner('workspaces').where({ id: workspaceId }).update({ timezone: 'America/New_York' });
        await inner('leads').where({ customerId: customer }).update({ customerId: null });
        await inner('customers').where({ id: customer }).delete();
        const result = await customerRead();
        assert.equal(result.total, 1);
        assert(!result.rows.some(row => row.actor.key === 'unavailable-actor'));
        assert.equal((await read()).total, 9);
      });
      await check('Customer evidence pagination clamps 25/50/100 without multiplying linked records or changing facets', async () => {
        for (let index = 0; index < 101; index++) await customerEvent(archivedCustomer, 'updated', office);
        for (const pageSize of [25, 50, 100] as const) {
          const first = await customerRead({ pageSize }), last = await customerRead({ pageSize, page: 999 });
          assert.equal(first.total, 102);
          assert.equal(first.rows.length, pageSize);
          assert.equal(last.page, Math.ceil(102 / pageSize));
          assert.equal(last.rows.length, 102 % pageSize);
          assert.deepEqual(first.options, last.options);
          const ids = new Set(first.rows.map(row => row.eventId));
          assert(last.rows.every(row => !ids.has(row.eventId)));
        }
      });
      throw customerRollback;
    }), error => error === customerRollback);
    const estimateRollback = new Error('Rollback Estimate Activity fixtures.');
    await assert.rejects(trx.transaction(async inner => {
      const read = (userId = owner, patch: Partial<ActivityReportQuery> = {}, permissions = enabled) => readIn(inner, userId, patch, permissions);
      const estimateRead = (patch: Partial<ActivityReportQuery> = {}, permissions = enabled) =>
        read(owner, { filters: { domains: ['estimate'], actions: [], actors: [] }, pageSize: 100, ...patch }, permissions);
      async function seedEstimate(number: number, options: { leadId?: string; jobId?: string; revision?: number;
        archived?: boolean; workspace?: string; status?: string } = {}): Promise<string> {
        const id = randomUUID();
        await inner('estimates').insert({ id, workspaceId: options.workspace ?? workspaceId, estimateNumber: number,
          revision: options.revision ?? 1, name: 'Native Estimate', parentType: options.leadId ? 'lead' : 'job',
          leadId: options.leadId ?? null, jobId: options.leadId ? null : options.jobId ?? job, createdBy: owner,
          status: options.status ?? 'draft', publishedAt: options.status === 'published' ? '2026-10-01T12:00:00Z' : null,
          archivedAt: options.archived ? '2026-11-04T12:00:00Z' : null });
        return id;
      }
      const estimate = await seedEstimate(301, { status: 'published' });
      const draft = await seedEstimate(301, { revision: 2 });
      const archivedEstimate = await seedEstimate(302, { archived: true });
      const hiddenEstimate = await seedEstimate(303, { jobId: hiddenJob });
      const leadEstimate = await seedEstimate(304, { leadId: mine });
      const foreignEstimate = await seedEstimate(305, { leadId: foreign, workspace: otherWorkspace });
      async function estimateEvent(id: string, type: string, options: { actorId?: string | null; source?: string;
        changes?: unknown; eventId?: string; at?: string } = {}) {
        const eventId = options.eventId ?? randomUUID();
        await inner('estimate_activity').insert({ id: eventId, workspaceId: id === foreignEstimate ? otherWorkspace : workspaceId,
          estimateId: id, actorId: options.actorId === undefined ? owner : options.actorId,
          actorName: 'PRIVATE_ESTIMATE_ACTOR', source: options.source ?? 'ui', type,
          changes: JSON.stringify(options.changes ?? {}), createdAt: options.at ?? '2026-11-02T12:00:00Z' });
        return eventId;
      }
      const decision = { outcome: 'accepted', decisionDate: '2026-11-01', channel: 'phone', note: 'PRIVATE_DECISION_NOTE' };
      const expected = new Map<string, string>();
      const mappings = { created: 'created', 'draft.saved': 'updated', sent: 'sent', published: 'updated',
        'revision-created': 'created', superseded: 'updated', expired: 'updated', archived: 'archived',
        restored: 'updated', resent: 'sent', 'email-sent': 'sent', 'delivery-failed': 'updated', viewed: 'updated',
        'decision-recorded': 'decision-recorded', 'decision-corrected': 'decision-recorded', converted: 'updated', voided: 'updated' };
      for (const [type, action] of Object.entries(mappings)) {
        const id = await estimateEvent(estimate, type, {
          eventId: type === 'created' ? sharedId : undefined,
          source: type === 'email-sent' || type === 'delivery-failed' ? 'worker' : type === 'viewed' ? 'system'
            : type === 'draft.saved' ? 'assistant-confirmed' : 'ui',
          changes: { decision, reason: 'PRIVATE_REASON', convertedJob: { id: job, number: 'J-PRIVATE' },
            fields: ['internalNotes', 'paymentLink'], status: { before: 'draft', after: 'sent' },
            revision: { before: 1, after: 2 }, totalCents: 99999, token: 'PRIVATE_TOKEN',
            error: 'PRIVATE_DELIVERY_ERROR', content: 'PRIVATE_FROZEN_PAPER' },
        });
        expected.set(id, action);
      }
      await estimateEvent(draft, 'created', { actorId: field });
      await estimateEvent(archivedEstimate, 'archived', { actorId: office });
      await estimateEvent(hiddenEstimate, 'created');
      await estimateEvent(leadEstimate, 'created');
      await estimateEvent(foreignEstimate, 'unknown-private-action');
      await check('Estimate native histories include every surviving revision/draft and safely map all lifecycle/delivery/decision events', async () => {
        const result = await estimateRead();
        assert.equal(result.total, 21);
        for (const [id, action] of expected) assert.equal(result.rows.find(row => row.eventId === id)?.action, action);
        assert(result.rows.some(row => row.recordId === estimate && row.recordLabel.includes('revision 1')));
        assert(result.rows.some(row => row.recordId === draft && row.recordLabel.includes('revision 2')));
        assert(!JSON.stringify(result).includes('PRIVATE_'));
        assert(!JSON.stringify(result).includes('totalCents'));
        assert(!JSON.stringify(result).includes('validation'));
        assert(!JSON.stringify(result).includes(foreignEstimate));
        for (const type of ['email-sent', 'delivery-failed', 'viewed']) {
          const saved = await inner('estimate_activity').where({ estimateId: estimate, type }).first('id');
          assert.equal(result.rows.find(row => row.eventId === saved.id)?.actor.kind, 'system');
        }
        const all = await read(owner, { pageSize: 100 });
        assert.equal(all.total, 29);
        assert.equal(all.rows.filter(row => row.eventId === sharedId).length, 3);
        const filtered = await estimateRead({ filters: { domains: ['estimate'], actions: ['decision-recorded'], actors: [`member:${owner}`] } });
        assert.equal(filtered.total, 2);
      });
      await check('assigned Estimate/Reports authority requires current assigned Job parents, never Lead parents or other Jobs', async () => {
        const result = await read(field, { filters: { domains: ['estimate'], actions: [], actors: [] }, pageSize: 100 });
        assert.equal(result.total, 18);
        assert(result.rows.every(row => [estimate, draft].includes(row.recordId)));
        assert(!result.options.actors.some(actor => actor.value === `member:${office}`));
        await inner('jobTeamMembers').where({ workspaceId, jobId: job, userId: field }).delete();
        assert.equal((await read(field, { filters: { domains: ['estimate'], actions: [], actors: [] } })).total, 0);
        await inner('jobTeamMembers').insert({ workspaceId, jobId: job, userId: field });
        await inner('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'assigned' });
        const assigned = await estimateRead();
        assert.equal(assigned.total, 19);
        assert.equal(assigned.includedDomains.find(item => item.domain === 'estimate')?.scope, 'assigned');
        await inner('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'workspace' });
      });
      await check('Estimate read/archive revocation redacts history and exclusive facets without adding Financial permission requirements', async () => {
        const withoutArchive = await estimateRead({}, enabled.filter(id => id !== 'estimates.archive'));
        assert.equal(withoutArchive.total, 20);
        assert(!withoutArchive.rows.some(row => row.recordId === archivedEstimate));
        assert(!withoutArchive.options.actors.some(actor => actor.value === `member:${office}`));
        const reduced = enabled.filter(id => id !== 'estimates.read');
        assert.equal((await read(owner, { pageSize: 100 }, reduced)).total, 8);
        await assert.rejects(estimateRead({}, reduced), AuthorizationAccessError);
        const noJobs = enabled.filter(id => id !== 'jobs.read');
        const assigned = await read(field, {}, noJobs);
        assert(!assigned.options.domains.includes('estimate'));
        await assert.rejects(read(field, { filters: { domains: ['estimate'], actions: [], actors: [] } }, noJobs), AuthorizationAccessError);
        assert.equal((await estimateRead({}, enabled.filter(id => id !== 'leads.read'))).total, 21);
        await assert.rejects(estimateRead({}, enabled.filter(id => id !== 'leads.read' && id !== 'jobs.read')), AuthorizationAccessError);
      });
      await check('Estimate history validates native metadata before filters/pages, while inaccessible malformed histories never leak or fail', async () => {
        for (const changes of [null, { fields: ['not-a-field'] }, { decision: { ...decision, decisionDate: '2026-02-30' } }, {}]) {
          const id = await estimateEvent(estimate, 'decision-recorded', { changes, at: '2026-11-01T05:00:00Z' });
          await assert.rejects(estimateRead({ filters: { domains: ['estimate'], actions: ['created'], actors: [] }, pageSize: 25 }), /history/);
          await inner('estimate_activity').where({ id }).delete();
        }
        const invalid = await estimateEvent(hiddenEstimate, 'unknown-event');
        await assert.rejects(estimateRead(), /unsupported event/);
        assert.equal((await read(field, { filters: { domains: ['estimate'], actions: [], actors: [] } })).total, 18);
        assert.equal((await read(owner, {}, enabled.filter(id => id !== 'estimates.read'))).total, 8);
        await inner('estimate_activity').where({ id: invalid }).delete();
        const archivedInvalid = await estimateEvent(archivedEstimate, 'voided', { changes: {} });
        await assert.rejects(estimateRead(), /history/);
        assert.equal((await estimateRead({}, enabled.filter(id => id !== 'estimates.archive'))).total, 20);
        await inner('estimate_activity').where({ id: archivedInvalid }).delete();
      });
      await check('Estimate event periods use native recorded time at DST/fractional boundaries, and deleted revisions remove only their events', async () => {
        const start = await estimateEvent(estimate, 'created', { at: '2026-11-01T04:00:00Z' });
        const end = await estimateEvent(estimate, 'created', { at: '2026-11-03T04:59:59.999Z' });
        const before = await estimateEvent(estimate, 'created', { at: '2026-11-01T03:59:59.999Z' });
        const after = await estimateEvent(estimate, 'created', { at: '2026-11-03T05:00:00Z' });
        assert.equal((await estimateRead()).total, 23);
        for (const timezone of ['Asia/Kathmandu', 'Pacific/Kiritimati']) {
          await inner('workspaces').where({ id: workspaceId }).update({ timezone });
          const expected = await inner('estimate_activity').where({ workspaceId })
            .whereRaw(`("createdAt" AT TIME ZONE ?)::date BETWEEN ?::date AND ?::date`, [timezone, '2026-11-01', '2026-11-02']).count('* as count').first();
          assert.equal((await estimateRead()).total, Number(expected?.count));
        }
        await inner('workspaces').where({ id: workspaceId }).update({ timezone: 'America/New_York' });
        await inner('estimate_activity').whereIn('id', [start, end, before, after]).delete();
        await inner('estimates').where({ id: draft }).delete();
        assert.equal((await estimateRead()).total, 20);
        assert((await estimateRead()).rows.some(row => row.recordId === estimate));
      });
      await check('bounded Estimate validation scans beyond 100 events; 25/50/100 evidence pages reconcile and unseen corruption fails', async () => {
        for (let i = 0; i < 101; i++) await estimateEvent(estimate, 'draft.saved', { at: '2026-11-02T13:00:00Z' });
        for (const pageSize of [25, 50, 100] as const) {
          const first = await estimateRead({ pageSize }), last = await estimateRead({ pageSize, page: 999 });
          assert.equal(first.total, 121);
          assert.equal(first.rows.length, pageSize);
          assert.equal(last.page, Math.ceil(121 / pageSize));
          assert.equal(last.rows.length, 121 % pageSize);
          assert.deepEqual(first.options, last.options);
          const ids = new Set(first.rows.map(row => row.eventId));
          assert(last.rows.every(row => !ids.has(row.eventId)));
        }
        await estimateEvent(estimate, 'decision-corrected', { changes: { decision }, at: '2026-11-01T05:00:00Z' });
        await assert.rejects(estimateRead({ pageSize: 25 }), /history/);
      });
      throw estimateRollback;
    }), error => error === estimateRollback);
    const workOrderRollback = new Error('Rollback Work Order Activity fixtures.');
    await assert.rejects(trx.transaction(async inner => {
      const read = (userId = owner, patch: Partial<ActivityReportQuery> = {}, permissions = enabled) =>
        readIn(inner, userId, patch, permissions);
      const orderRead = (patch: Partial<ActivityReportQuery> = {}, permissions = enabled, userId = owner) =>
        read(userId, { filters: { domains: ['work-order'], actions: [], actors: [] }, pageSize: 100, ...patch }, permissions);
      async function seedOrder(parentId: string, options: { assigneeId?: string; archived?: boolean; draft?: boolean; ws?: string } = {}): Promise<string> {
        const id = randomUUID();
        await inner('workOrders').insert({ id, workspaceId: options.ws ?? workspaceId, jobId: parentId,
          title: 'Native Work Order', instructions: 'PRIVATE_INSTRUCTIONS', accessNotes: 'PRIVATE_ACCESS', safetyNotes: 'PRIVATE_SAFETY',
          status: options.draft ? 'draft' : options.archived ? 'completed' : 'issued',
          issuedAt: options.draft ? null : '2026-10-01T12:00:00Z',
          completedAt: options.archived ? '2026-10-02T12:00:00Z' : null,
          archivedAt: options.archived ? '2026-10-03T12:00:00Z' : null,
          primaryAssigneeId: options.assigneeId ?? null, createdBy: options.ws ? outsider : owner });
        return id;
      }
      const ownedJob = await seedJob(field), foreignJob = randomUUID();
      await inner('jobs').insert({ id: foreignJob, workspaceId: otherWorkspace, createdBy: outsider, title: 'PRIVATE_FOREIGN_JOB',
        customerName: '', service: '', location: '', description: '', status: 'needs-scheduling' });
      const order = await seedOrder(job), draftOrder = await seedOrder(job, { draft: true, assigneeId: field });
      const archivedOrder = await seedOrder(hiddenJob, { archived: true, assigneeId: office });
      const hiddenOrder = await seedOrder(hiddenJob, { assigneeId: office });
      const directOrder = await seedOrder(hiddenJob, { assigneeId: field }), crewOrder = await seedOrder(hiddenJob);
      const ownedOrder = await seedOrder(ownedJob), foreignOrder = await seedOrder(foreignJob, { ws: otherWorkspace });
      await inner('workOrderCrew').insert([
        { workspaceId, workOrderId: crewOrder, userId: field }, { workspaceId, workOrderId: order, userId: owner },
        { workspaceId, workOrderId: order, userId: office },
      ]);
      async function orderEvent(id: string, type: string, options: {
        changes?: unknown; actorId?: string | null; source?: string; at?: string; eventId?: string;
      } = {}): Promise<string> {
        const eventId = options.eventId ?? randomUUID();
        await inner('workOrderActivity').insert({ id: eventId, workspaceId: id === foreignOrder ? otherWorkspace : workspaceId,
          workOrderId: id, type, changes: JSON.stringify(options.changes === undefined ? { private: 'PRIVATE_METADATA' } : options.changes),
          actorId: options.actorId === undefined ? owner : options.actorId, actorName: 'PRIVATE_SAVED_ACTOR',
          source: options.source ?? 'ui', createdAt: options.at ?? '2026-11-02T12:00:00Z' });
        return eventId;
      }
      const mappings: { type: string; action: string; changes?: unknown; source?: string; actorId?: string | null }[] = [
        { type: 'created', action: 'created' }, { type: 'edit', action: 'updated' },
        { type: 'assign', action: 'assignment-changed', source: 'assistant-confirmed' },
        { type: 'tasks', action: 'updated' }, { type: 'materials', action: 'updated', changes: { to: ['PRIVATE_MATERIAL'], costCents: 999 } },
        { type: 'task-toggle', action: 'updated', changes: { taskId: randomUUID(), done: false } },
        { type: 'task-toggle', action: 'status-changed', changes: { taskId: randomUUID(), done: true, from: 'issued', to: 'in-progress' } },
        ...['issued', 'in-progress', 'canceled'].map(to => ({ type: 'status', action: 'status-changed', changes: { to, reason: 'PRIVATE_REASON' } })),
        { type: 'complete', action: 'completed', changes: { to: 'completed', summary: 'PRIVATE_COMPLETION', signatureImage: 'PRIVATE_SIGNATURE' } },
        ...['draft', 'in-progress'].map(to => ({ type: 'reopen', action: 'status-changed', changes: { to, previousCompletion: 'PRIVATE_COMPLETION' } })),
        { type: 'archive', action: 'archived', changes: { archived: true } },
        { type: 'archive', action: 'updated', changes: { archived: false } },
        ...['schedule', 'visit-linked', 'visit-separated'].map(type => ({
          type, action: 'visit-changed', changes: { visitId: randomUUID(), to: { scheduledDate: '2027-01-01' } },
        })),
        { type: 'file_uploaded', action: 'updated', changes: { fileName: 'PRIVATE_FILENAME' }, source: 'system', actorId: null },
        { type: 'file_removed', action: 'updated', changes: { fileName: 'PRIVATE_FILENAME' }, actorId: null },
      ];
      const expected = new Map<string, string>();
      for (const mapping of mappings) expected.set(await orderEvent(order, mapping.type, {
        ...mapping, eventId: mapping.type === 'created' ? sharedId : undefined,
      }), mapping.action);
      for (const id of [draftOrder, archivedOrder, hiddenOrder, directOrder, crewOrder, ownedOrder]) {
        await orderEvent(id, 'created', { actorId: [archivedOrder, hiddenOrder].includes(id) ? office : owner });
      }
      await orderEvent(order, 'note', { changes: ['PRIVATE_NOTE'] });
      await orderEvent(foreignOrder, 'unknown-private-type', { actorId: outsider });
      const total = mappings.length + 6, assignedTotal = mappings.length + 3;
      await check('Work Order native union maps all mutation/file/shared-visit histories once, without notes, completions or parent-Job data', async () => {
        const result = await orderRead();
        assert.equal(result.total, total);
        assert.equal(result.includedDomains.find(item => item.domain === 'work-order')?.archiveVisibility, 'included');
        assert.equal(result.omittedDomains.length, 0);
        for (const [id, action] of expected) assert.equal(result.rows.find(row => row.eventId === id)?.action, action);
        assert(result.rows.every(row => row.recordLabel.startsWith('Work Order WO-')));
        assert(result.rows.some(row => row.recordId === draftOrder));
        assert(result.rows.some(row => row.recordId === archivedOrder));
        assert(result.rows.some(row => row.actor.kind === 'system'));
        assert(result.rows.some(row => row.actor.key === 'unavailable-actor'));
        assert(!JSON.stringify(result).includes('PRIVATE_'));
        assert(!JSON.stringify(result).includes('validation'));
        assert(!JSON.stringify(result).includes(hiddenJob));
        assert(!JSON.stringify(result).includes(foreignOrder));
        const all = await read(owner, { pageSize: 100 });
        assert.equal(all.total, total + 8);
        assert.equal(all.rows.filter(row => row.eventId === sharedId).length, 3);
        const filtered = await orderRead({ filters: { domains: ['work-order'], actions: ['created', 'completed'], actors: [`member:${owner}`] } });
        assert.equal(filtered.total, 6);
        assert.deepEqual(filtered.options, result.options);
      });
      await check('assigned Work Order history preserves primary/crew/parent-owner/team authority, hides Drafts, and revokes old events on reassignment', async () => {
        const assigned = await orderRead({}, enabled, field);
        assert.equal(assigned.total, assignedTotal);
        assert(assigned.rows.every(row => [order, directOrder, crewOrder, ownedOrder].includes(row.recordId)));
        assert(!assigned.options.actors.some(actor => actor.value === `member:${office}`));
        await inner('workOrders').where({ id: directOrder }).update({ primaryAssigneeId: office });
        await inner('workOrderCrew').where({ workspaceId, workOrderId: crewOrder, userId: field }).delete();
        await inner('jobs').where({ id: ownedJob }).update({ primaryOwnerId: office });
        await inner('jobTeamMembers').where({ workspaceId, jobId: job, userId: field }).delete();
        assert.equal((await orderRead({}, enabled, field)).total, 0);
        await inner('workOrders').where({ id: directOrder }).update({ primaryAssigneeId: field });
        await inner('workOrderCrew').insert({ workspaceId, workOrderId: crewOrder, userId: field });
        await inner('jobs').where({ id: ownedJob }).update({ primaryOwnerId: field });
        await inner('jobTeamMembers').insert({ workspaceId, jobId: job, userId: field });
        await inner('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'workorders.read' }).update({ scope: 'workspace' });
        assert.equal((await orderRead({}, enabled, field)).total, assignedTotal);
        await inner('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'workorders.read' }).update({ scope: 'assigned_job' });
        await inner('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'assigned' });
        assert.equal((await orderRead()).total, mappings.length);
        assert.equal((await orderRead()).includedDomains.find(item => item.domain === 'work-order')?.scope, 'assigned');
        await inner('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'workspace' });
        await inner('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'reports.read' }).update({ scope: 'workspace' });
        assert.equal((await orderRead({}, enabled, field)).total, assignedTotal);
        assert.equal((await orderRead({}, enabled, field)).includedDomains.find(item => item.domain === 'work-order')?.scope, 'assigned');
        await inner('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'reports.read' }).update({ scope: 'assigned' });
      });
      await check('Work Order read revocation omits its exclusive facets; readable archives and direct assignment need no archive, price or parent-Job grant', async () => {
        const noMutation = enabled.filter(id => !['workorders.archive', 'workorders.view_prices', 'workorders.view_costs'].includes(id));
        assert.equal((await orderRead({}, noMutation)).total, total);
        await inner('workOrders').where({ id: archivedOrder }).update({ primaryAssigneeId: field });
        assert.equal((await orderRead({}, noMutation, field)).total, assignedTotal + 1);
        await inner('workOrders').where({ id: archivedOrder }).update({ primaryAssigneeId: office });
        const noJobs = enabled.filter(id => id !== 'jobs.read');
        assert.equal((await orderRead({}, noJobs, field)).total, assignedTotal);
        const limited = await orderRead({}, noJobs);
        assert(!limited.options.domains.includes('job'));
        assert(!JSON.stringify(limited).includes(hiddenJob));
        const noOrders = enabled.filter(id => id !== 'workorders.read');
        const result = await read(owner, {}, noOrders);
        assert.equal(result.total, 8);
        assert(result.omittedDomains.some(item => item.domain === 'work-order' && item.reason === 'permissions'));
        assert(!result.options.actors.some(actor => actor.value === `member:${office}`));
        await assert.rejects(orderRead({}, noOrders), AuthorizationAccessError);
        await assert.rejects(orderRead({}, enabled.filter(id => id !== 'jobs.read' && id !== 'leads.read')), AuthorizationAccessError);
      });
      await check('malformed Work Order action discriminators fail before facet/page narrowing, while inaccessible histories never fail or leak', async () => {
        for (const [type, changes] of [
          ['unknown-native-type', {}], ['edit', []], ['status', { to: 'not-a-status' }],
          ['complete', { to: 'issued' }], ['reopen', { to: 'completed' }],
          ['archive', { archived: 'false' }], ['task-toggle', { done: 'true' }],
          ['task-toggle', { done: false, from: 'issued', to: 'in-progress' }],
        ] as const) {
          const id = await orderEvent(order, type, { changes, at: '2026-11-01T05:00:00Z' });
          await assert.rejects(orderRead({ pageSize: 25, filters: { domains: ['work-order'], actions: ['created'], actors: [`member:${owner}`] } }), /unsupported event/);
          assert.equal((await read(owner, {}, enabled.filter(id => id !== 'workorders.read'))).total, 8);
          await inner('workOrderActivity').where({ id }).delete();
        }
        const hidden = await orderEvent(hiddenOrder, 'unknown-event');
        const draft = await orderEvent(draftOrder, 'unknown-event');
        await assert.rejects(orderRead(), /unsupported event/);
        assert.equal((await orderRead({}, enabled, field)).total, assignedTotal);
        await inner('workOrderActivity').whereIn('id', [hidden, draft]).delete();
        const archived = await orderEvent(archivedOrder, 'unknown-event');
        await assert.rejects(orderRead({}, enabled.filter(id => id !== 'workorders.archive')), /unsupported event/);
        assert.equal((await orderRead({}, enabled, field)).total, assignedTotal);
        await inner('workOrderActivity').where({ id: archived }).delete();
      });
      await check('Work Order recorded history uses exact DST/fractional date bounds; Draft deletion removes native history without delete-audit inference', async () => {
        const start = await orderEvent(order, 'edit', { at: '2026-11-01T04:00:00Z' });
        const end = await orderEvent(order, 'edit', { at: '2026-11-03T04:59:59.999999Z' });
        const before = await orderEvent(order, 'edit', { at: '2026-11-01T03:59:59.999999Z' });
        const after = await orderEvent(order, 'edit', { at: '2026-11-03T05:00:00Z' });
        assert.equal((await orderRead()).total, total + 2);
        for (const timezone of ['Asia/Kathmandu', 'Pacific/Kiritimati']) {
          await inner('workspaces').where({ id: workspaceId }).update({ timezone });
          const expected = await inner('workOrderActivity').where({ workspaceId }).whereNot('type', 'note')
            .whereRaw(`("createdAt" AT TIME ZONE ?)::date BETWEEN ?::date AND ?::date`, [timezone, '2026-11-01', '2026-11-02']).count('* as count').first();
          assert.equal((await orderRead()).total, Number(expected?.count));
        }
        await inner('workspaces').where({ id: workspaceId }).update({ timezone: 'America/New_York' });
        await inner('workOrderActivity').whereIn('id', [start, end, before, after]).delete();
        await inner('workOrders').where({ id: draftOrder }).delete();
        assert.equal((await orderRead()).total, total - 1);
        assert(!(await orderRead()).rows.some(row => row.recordId === draftOrder));
        assert.equal(Number((await inner('workOrderActivity').where({ workOrderId: draftOrder }).count('* as count').first())?.count), 0);
      });
      await check('Work Order evidence pages reconcile 25/50/100 bounds without crew multiplication and reject unseen corruption', async () => {
        for (let i = 0; i < 101; i++) await orderEvent(order, 'edit', { at: '2026-11-02T13:00:00.000001Z' });
        const paginatedTotal = total + 100;
        for (const pageSize of [25, 50, 100] as const) {
          const first = await orderRead({ pageSize }), last = await orderRead({ pageSize, page: 999 });
          assert.equal(first.total, paginatedTotal);
          assert.equal(first.rows.length, pageSize);
          assert.equal(last.page, Math.ceil(paginatedTotal / pageSize));
          assert.equal(last.rows.length, paginatedTotal % pageSize || pageSize);
          assert.deepEqual(first.options, last.options);
          const ids = new Set(first.rows.map(row => row.eventId));
          assert(last.rows.every(row => !ids.has(row.eventId)));
        }
        await orderEvent(order, 'status', { changes: { to: 'invalid-oldest-status' }, at: '2026-11-01T05:00:00Z' });
        await assert.rejects(orderRead({ pageSize: 25 }), /unsupported event/);
      });
      throw workOrderRollback;
    }), error => error === workOrderRollback);
    const malformedRollback = new Error('Rollback malformed Activity.');
    await assert.rejects(trx.transaction(async inner => {
      const malformed = await leadEvent(other, 'unknown-native-action');
      await check('unknown authorized types fail explicitly even when action/actor filters would hide them, but inaccessible unknown rows do not leak', async () => {
        await assert.rejects(readIn(inner), /unsupported event/);
        await assert.rejects(readIn(inner, owner, { filters: { domains: ['lead'], actions: ['created'], actors: [] } }), /unsupported event/);
        assert.equal((await readIn(inner, field)).total, 4);
        await trx('leadActivity').where({ id: malformed }).delete();
        const broken = await jobEvent(job, 'status', undefined, undefined, undefined, undefined, 'invalid-status');
        await assert.rejects(readIn(inner), /unsupported event/);
        await trx('jobActivity').where({ id: broken }).delete();
        const invalidPayload = await leadEvent(other, 'edited');
        await trx('leadActivity').where({ id: invalidPayload }).update({ changes: JSON.stringify(['PRIVATE_UNSUPPORTED_PAYLOAD']) });
        await assert.rejects(readIn(inner), /unsupported event/);
        await trx('leadActivity').where({ id: invalidPayload }).delete();
      });
      throw malformedRollback;
    }), error => error === malformedRollback);
    await check('business event-date periods use fractional offsets and empty snapshots retain explicit scope/options', async () => {
      for (const timezone of ['Asia/Kathmandu', 'Pacific/Kiritimati']) {
        await trx('workspaces').where({ id: workspaceId }).update({ timezone });
        const result = await read();
        assert.equal(result.timezone, timezone);
        const expected = await trx.raw(`SELECT count(*)::int AS count FROM (
          SELECT "createdAt" FROM "leadActivity" WHERE "workspaceId" = ? AND type <> 'note'
          UNION ALL SELECT "createdAt" FROM "jobActivity" WHERE "workspaceId" = ? AND type <> 'note'
        ) e WHERE ("createdAt" AT TIME ZONE ?)::date BETWEEN ?::date AND ?::date`,
        [workspaceId, workspaceId, timezone, '2026-11-01', '2026-11-02']);
        assert.equal(result.total, expected.rows[0].count);
      }
      await trx('workspaces').where({ id: workspaceId }).update({ timezone: 'America/New_York' });
      const empty = await read(owner, { period: { from: '2026-01-01', to: '2026-01-02' }, page: 999 });
      assert.equal(empty.total, 0);
      assert.equal(empty.page, 1);
      assert.deepEqual(empty.options.actions, []);
      assert.deepEqual(empty.options.actors, []);
    });
    await check('deleted parent records remove counts, safe references and actor facets', async () => {
      await trx('leads').where({ id: other }).delete();
      assert.equal((await read()).total, 6);
      assert(!(await read()).options.actors.some(actor => actor.value === 'unavailable-actor'));
      await trx('jobs').where({ id: hiddenJob }).delete();
      assert.equal((await read()).total, 5);
    });
    await check('whole-population totals and facets share stable 25/50/100 evidence pages with exact clamping', async () => {
      for (let i = 0; i < 101; i++) await jobEvent(job, 'edit', '2026-11-02T13:00:00Z');
      for (const pageSize of [25, 50, 100] as const) {
        const first = await read(owner, { pageSize }), last = await read(owner, { pageSize, page: 999 });
        assert.equal(first.total, 106);
        assert.equal(first.rows.length, pageSize);
        assert.equal(last.page, Math.ceil(106 / pageSize));
        assert.equal(last.rows.length, 106 % pageSize);
        assert.deepEqual(first.options, last.options);
        const keys = new Set(first.rows.map(row => `${row.domain}:${row.eventId}`));
        assert(last.rows.every(row => !keys.has(`${row.domain}:${row.eventId}`)));
      }
      await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled' });
      try {
        const query: ActivityReportQuery = { workspaceId, view: 'activity', period: { from: '2026-11-01', to: '2026-11-02' },
          filters: { domains: [], actions: [], actors: [] }, page: 1, pageSize: 100 };
        await withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, enabled, false, async (transaction, context) => {
          const projection = await prepareActivityReportInTransaction(transaction, context, query, 'export');
          const rows = [];
          for await (const row of projection.evidence()) rows.push(row);
          const first = await readActivityReportInTransaction(transaction, context, query);
          const last = await readActivityReportInTransaction(transaction, context, { ...query, page: 2 });
          assert.equal(rows.length, 106);
          assert.deepEqual(rows, [...first.rows, ...last.rows]);
          const csv = await prepareActivityReportCSVProjectionInTransaction(transaction, context,
            { query: { workspaceId, view: 'activity', period: query.period, filters: query.filters }, dataset: 'evidence' });
          const csvRows = [];
          for await (const row of csv.rows()) csvRows.push(row);
          assert.equal(csv.count, 106);
          assert(csvRows.every(row => row.length === csv.columns.length));
          assert.deepEqual(csvRows.map(row => row[7]), rows.map(row => row.eventId));
          assert(!JSON.stringify(csvRows).includes('PRIVATE_EVENT_NOTE'));
          const summary = await prepareActivityReportCSVProjectionInTransaction(transaction, context,
            { query: { workspaceId, view: 'activity', period: query.period, filters: query.filters }, dataset: 'summary' });
          const summaryRows = [];
          for await (const row of summary.rows()) summaryRows.push(row);
          assert.equal(summaryRows[0]?.at(-1), 106);
          const abort = new AbortController(), cursor = projection.evidence(abort.signal);
          assert.equal((await cursor.next()).done, false);
          abort.abort();
          await assert.rejects(cursor.next(), /abort/i);
        });
        await withWorkspaceAuthorization(trx, { workspaceId, userId: owner },
          enabled.filter(id => id !== 'jobs.export'), false, async (transaction, context) => {
            const projection = await prepareActivityReportInTransaction(transaction, context, query, 'export');
            assert(projection.report.omittedDomains.some(item => item.domain === 'job'));
            const rows = [];
            for await (const row of projection.evidence()) rows.push(row);
            assert(rows.every(row => row.domain !== 'job'));
            await assert.rejects(prepareActivityReportInTransaction(transaction, context,
              { ...query, filters: { ...query.filters, domains: ['job'] } }, 'export'), AuthorizationAccessError);
          });
      } finally {
        await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.export' }).delete();
      }
      const unknown = await jobEvent(job, 'unknown-oldest', '2026-11-01T05:00:00Z');
      await assert.rejects(read(owner, { filters: { domains: [], actions: ['updated'], actors: [] } }), /unsupported event/);
      await trx('jobActivity').where({ id: unknown }).delete();
      await trx('workspaceMemberships').where({ workspaceId, userId: field }).delete();
      await assert.rejects(read(field), AuthorizationAccessError);
      assert((await read()).options.actors.some(actor => actor.value === 'unavailable-actor'));
    });
    throw rollback;
  }), error => error === rollback);
  console.log(`${checks} Activity report database journeys passed.`);
} finally { await db.destroy(); }
