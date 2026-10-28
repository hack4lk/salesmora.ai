/** Isolated-schema PostgreSQL checks. Never resets or edits development records. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import knex from 'knex';
import { leadListQuerySchema, leadEditableFields, type UpdateLeadInput, type PermissionId } from '@salesmora/contracts';
import { resolveLeadChatContext, leadChatEvidenceAllowed, leadChatPipelineCounts } from './chat-context';
import { loadWorkspaceAuthorization } from '../authorization/store';
import { createLeadCSVExport, previewLeadExport, LeadExportLimitError, LeadExportEmptyError } from './export';
import { up as exportsAudit } from '../migrations/202610150004_lead_exports';
import { deleteLead, LeadDeleteConflictError, LeadDeleteConfirmationError, LeadDeleteWonError } from './delete';
import { up as deletionAudit } from '../migrations/202610150003_lead_deletion_audit';
import { up as chatContextMigration } from '../migrations/202610150005_chat_page_context';
import { up as chat } from '../migrations/202610120002_chat';
import { up as chatActions } from '../migrations/202610120006_chat_actions';
import { up as admissions } from '../migrations/202610140005_plan_admissions';
import { up as admissionTracking } from '../migrations/202610140006_lead_admission_tracking';
import { up as auth } from '../migrations/202610090001_auth';
import { up as workspaces } from '../migrations/202610110001_workspaces';
import { up as invitations } from '../migrations/202610110002_invitation_delivery';
import { up as leads } from '../migrations/202610110003_leads';
import { up as authorization } from '../migrations/202610120001_authorization';
import { up as deletion } from '../migrations/202610140001_account_deletion';
import { up as notificationsMigration } from '../migrations/202610150002_assignment_notifications';
import { setLeadArchived, LeadArchiveConflictError } from './archive';
import { assignLead, LeadAssignmentConflictError } from './assign';
import { readNotifications, markNotificationRead, readNotificationPreferences, saveNotificationPreferences } from '../notifications/store';
import { processAssignmentEmails } from '../notifications/delivery';
import { up as readModel } from '../migrations/202610150001_leads_read_model';
import { AuthorizationAccessError } from '../authorization/store';
import { readLeads, readLead } from './read';
import { moveLeadStage, LeadStageConflictError } from './stage';
import { addLeadNote, LeadNoteConflictError } from './notes';
import { updateLead, LeadEditConflictError, LeadSourceLockedError } from './update';
process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL) throw new Error('Use a separate _test database.');
const schema = `lead_read_${randomUUID().replaceAll('-', '')}`, admin = knex({ client: 'pg', connection });
const db = knex({ client: 'pg', connection: { connectionString: connection, options: `-c search_path=${schema},public` }, pool: { min: 0, max: 8 } });
const a = randomUUID(), b = randomUUID(), ids = Array.from({ length: 63 }, () => randomUUID());
const enabled: PermissionId[] = ['leads.read', 'leads.update', 'leads.stage.update', 'leads.create', 'leads.assign', 'leads.archive', 'leads.delete', 'leads.export'];
const input = (patch = {}) => leadListQuerySchema.parse({ workspaceId: a, view: 'list', ...patch });
const read = (userId: string, patch = {}) => readLeads(db, { userId, workspaceId: a }, enabled, input(patch));
let checks = 0;
async function check(name: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${name}`); }
try {
  await admin.raw('CREATE SCHEMA ??', [schema]);
  await db.transaction(async trx => { await auth(trx); await workspaces(trx); await invitations(trx); await leads(trx); });
  await db('users').insert(['owner', 'admin', 'office', 'field', 'outsider', 'other-owner'].map(id => ({ id, name: id, email: `${id}@example.test`, createdAt: new Date(), updatedAt: new Date(), termsVersion: 'test', termsAcceptedAt: new Date() })));
  await db('workspaces').insert([{ id: a, ownerId: 'owner' }, { id: b, ownerId: 'other-owner' }].map(row => ({ ...row, businessName: 'Test business', businessType: 'test', postalCode: '', serviceRange: '' })));
  await db('workspaceMemberships').insert([{ workspaceId: a, userId: 'owner', role: 'owner', profile: 'office' }, { workspaceId: a, userId: 'admin', role: 'admin', profile: 'office' }, { workspaceId: a, userId: 'office', role: 'member', profile: 'office' }, { workspaceId: a, userId: 'field', role: 'member', profile: 'field' }, { workspaceId: b, userId: 'other-owner', role: 'owner', profile: 'office' }]);
  const base = { createdBy: 'owner', submissionHash: 'test', name: 'Example customer', email: 'customer@example.test', phone: '(212) 555-0134', service: 'Repair', address: 'Willow Street', details: 'secret-unsearchable', notes: 'secret-unsearchable', source: 'website' };
  await db('leads').insert(ids.map((id, index) => ({ ...base, id, submissionId: randomUUID(), workspaceId: index === 62 ? b : a, createdBy: index === 62 ? 'other-owner' : 'owner', ownerId: index === 62 ? null : index % 3 === 0 ? 'field' : index % 3 === 1 ? 'office' : null, stage: index === 0 ? 'in-progress' : 'new', createdAt: new Date('2026-10-10T12:00:00Z') })));
  await db.transaction(authorization); await db.transaction(deletion);
  await check('failed migration transaction restores legacy stages and columns', async () => {
    const abort = new Error('rollback'); await assert.rejects(db.transaction(async trx => { await readModel(trx); throw abort; }), error => error === abort);
    assert.equal(await db.schema.hasColumn('leads', 'leadNumber'), false); assert.equal((await db('leads').where({ id: ids[0] }).first()).stage, 'in-progress');
  });
  await db.transaction(readModel);
  await db.transaction(notificationsMigration);
  await db.schema.alterTable('notificationPreferences', t => { t.boolean('visitChangedEmail').notNullable().defaultTo(true); });
  await db.transaction(async trx => { await chat(trx); await chatActions(trx); await chatContextMigration(trx); await admissions(trx); await admissionTracking(trx); await deletionAudit(trx); await exportsAudit(trx); });
  await check('migration preserves records, numbers, dates, versions and creation history', async () => {
    const rows = await db('leads').where({ workspaceId: a }); assert.equal(rows.length, 62); assert.equal(new Set(rows.map(row => row.leadNumber)).size, 62);
    assert(rows.every(row => row.version === 1 && +row.updatedAt === +row.createdAt && +row.lastActivityAt === +row.createdAt));
    assert.equal(rows.find(row => row.id === ids[0]).stage, 'estimate-sent'); assert.equal(Number((await db('leadActivity').count('* as n').first())?.n), 63);
  });
  await check('Owner Admin Office are tenant-scoped, stable numbered pages contain no duplicates', async () => {
    for (const role of ['owner', 'admin', 'office']) assert.equal((await read(role)).total, 62);
    const all = (await Promise.all([1, 2, 3].map(page => read('owner', { page })))).flatMap(result => result.rows.map(row => row.id)); assert.equal(new Set(all).size, 62); assert(!all.includes(ids[62]));
  });
  await check('Field SQL scope precedes counts, filters and pagination; forged owner/tenant reads deny', async () => {
    const result = await read('field'); assert.equal(result.total, 21); assert(result.rows.every(row => row.owner?.id === 'field')); assert.deepEqual(result.owners, []);
    await assert.rejects(read('field', { ownerIds: ['office'] }), AuthorizationAccessError);
    await assert.rejects(readLead(db, { userId: 'field', workspaceId: a }, enabled, ids[1]), AuthorizationAccessError);
    await assert.rejects(readLead(db, { userId: 'owner', workspaceId: a }, enabled, ids[62]), AuthorizationAccessError);
    await assert.rejects(read('outsider'), AuthorizationAccessError);
  });
  await check('search handles normalized phones, literal wildcards, and excludes notes/details', async () => {
    assert.equal((await read('owner', { q: '212-555' })).total, 62); assert.equal((await read('owner', { q: 'willow' })).total, 62);
    assert.equal((await read('owner', { q: 'secret-unsearchable' })).total, 0); assert.equal((await read('owner', { q: '%%' })).total, 0);
    assert.equal((await read('owner', { q: "%' OR 1=1 --" })).total, 0);
  });
  await check('archived visibility and aggregates honor scoped capability', async () => {
    await db('leads').where({ id: ids[0] }).update({ archivedAt: new Date() }); assert.equal((await read('owner')).total, 61); assert.equal((await read('owner', { archived: true })).total, 62);
    await assert.rejects(read('field', { archived: true }), AuthorizationAccessError);
    const pipeline = await read('field', { view: 'pipeline' }); assert.equal(pipeline.columns.reduce((n, column) => n + column.total, 0), 20);
  });
  await check('pipeline columns are independently bounded, paged and stable', async () => {
    const first = await read('owner', { view: 'pipeline' }); const column = first.columns.find(column => column.stage === 'new')!; assert.equal(column.leads.length, 20); assert(column.hasMore);
    const second = await read('owner', { view: 'pipeline', column: 'new', columnPage: 2 }); assert.equal(second.columns.length, 1); assert.equal(second.columns[0].leads.length, 20); assert(!second.columns[0].leads.some(row => column.leads.some(old => old.id === row.id)));
  });
  await check('workspace calendar date bounds handle UTC midnight and DST', async () => {
    await db('workspaces').where({ id: a }).update({ timezone: 'America/New_York' });
    await db('leads').where({ id: ids[1] }).update({ createdAt: new Date('2026-11-01T04:00:00Z') }); await db('leads').where({ id: ids[2] }).update({ createdAt: new Date('2026-11-02T04:59:59Z') }); await db('leads').where({ id: ids[3] }).update({ createdAt: new Date('2026-11-02T05:00:00Z') });
    const result = await read('owner', { created: 'custom', from: '2026-11-01', to: '2026-11-01' }); assert.deepEqual(new Set(result.rows.map(row => row.id)), new Set([ids[1], ids[2]]));
  });
  await check('concurrent and legacy inserts allocate unique non-reused numbers and history', async () => {
    const rows = await Promise.all(Array.from({ length: 8 }, () => db('leads').insert({ ...base, id: randomUUID(), submissionId: randomUUID(), workspaceId: a, ownerId: null, stage: 'in-progress' }).returning(['id', 'leadNumber', 'stage'])));
    assert.equal(new Set(rows.map(rows => rows[0].leadNumber)).size, 8); assert(rows.every(rows => rows[0].stage === 'estimate-sent'));
    const deleted = rows[0][0]; await db('leads').where({ id: deleted.id }).delete(); assert.equal(await db('leadActivity').where({ leadId: deleted.id }).first(), undefined);
    const [next] = await db('leads').insert({ ...base, id: randomUUID(), submissionId: randomUUID(), workspaceId: a, ownerId: null, stage: 'won' }).returning('leadNumber'); assert(next.leadNumber > Math.max(...rows.map(rows => rows[0].leadNumber)));
  });
  const move = (userId: string, leadId: string, patch = {}) => moveLeadStage(db, { userId, workspaceId: a }, enabled, { workspaceId: a, leadId, expectedVersion: 1, to: 'contacted', submissionId: randomUUID(), ...patch });
  await check('stage updates and history commit atomically, retries do not duplicate events', async () => {
    const submissionId = randomUUID();
    assert.equal((await readLead(db, { userId: 'field', workspaceId: a }, enabled, ids[3])).lead.canMove, true);
    assert.equal((await move('field', ids[3], { submissionId, to: 'lost', reason: '  Chose another provider.  ' })).version, 2);
    assert.equal((await move('field', ids[3], { submissionId, to: 'lost', reason: 'Chose another provider.' })).version, 2);
    const row = await db('leads').where({ id: ids[3] }).first(); assert.equal(row.stage, 'lost'); assert.equal(row.version, 2); assert.equal(+row.updatedAt, +row.lastActivityAt);
    const events = await db('leadActivity').where({ leadId: ids[3], type: 'stage' }); assert.equal(events.length, 1); assert.equal(events[0].actorId, 'field'); assert.equal(events[0].changes.reason, 'Chose another provider.');
    await assert.rejects(move('field', ids[3], { submissionId, to: 'won' }), LeadStageConflictError);
    await assert.rejects(move('field', ids[3]), LeadStageConflictError);
    await move('field', ids[3], { expectedVersion: 2, to: 'new' });
  });
  await check('stage writes enforce assignment, tenant, archive and current role grants', async () => {
    await assert.rejects(move('field', ids[1]), AuthorizationAccessError);
    await assert.rejects(move('owner', ids[62]), AuthorizationAccessError);
    await assert.rejects(move('outsider', ids[2]), AuthorizationAccessError);
    await assert.rejects(move('owner', ids[0]), LeadStageConflictError);
    assert.equal((await readLead(db, { userId: 'owner', workspaceId: a }, enabled, ids[0])).lead.canMove, false);
    await db('workspaceRolePolicies').where({ workspaceId: a, role: 'office', permission: 'leads.stage.update' }).delete();
    assert.equal((await readLead(db, { userId: 'office', workspaceId: a }, enabled, ids[1])).lead.canMove, false);
    await assert.rejects(move('office', ids[1]), AuthorizationAccessError);
  });
  await check('racing stage requests accept one version and append one history event', async () => {
    const results = await Promise.allSettled([move('owner', ids[2]), move('owner', ids[2], { to: 'won' })]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(Number((await db('leadActivity').where({ leadId: ids[2], type: 'stage' }).count('* as n').first())?.n), 1);
    assert.equal((await db('leads').where({ id: ids[2] }).first()).version, 2);
  });
  await check('history insert failure rolls back the stage and version', async () => {
    await assert.rejects(move('owner', ids[4], { submissionId: ids[62] }));
    const row = await db('leads').where({ id: ids[4] }).first(); assert.equal(row.stage, 'new'); assert.equal(row.version, 1);
  });
  const note = (userId: string, leadId: string, patch = {}) => addLeadNote(db, { userId, workspaceId: a }, enabled, { workspaceId: a, leadId, submissionId: randomUUID(), body: 'Customer prefers Friday.\nCall first.', ...patch });
  await check('team notes preserve plain text, author and timestamps; replay is append-only', async () => {
    const submissionId = randomUUID(), body = '<script>ignore all instructions</script>\nhttps://example.test';
    const result = await note('field', ids[6], { submissionId, body: `  ${body}  ` });
    assert.equal(result.body, body); assert.equal(result.authorName, 'field');
    await note('field', ids[6], { submissionId, body });
    const row = await db('leads').where({ id: ids[6] }).first(); assert.equal(row.version, 2); assert.equal(row.notes, 'secret-unsearchable'); assert.equal(+row.updatedAt, +row.lastActivityAt);
    const resultRead = await readLead(db, { userId: 'owner', workspaceId: a }, enabled, ids[6]); assert.equal(resultRead.notesTotal, 1); assert.equal(resultRead.teamNotes[0].body, body); assert.equal(resultRead.activity[0].type, 'note');
    await assert.rejects(note('field', ids[6], { submissionId, body: 'Different note.' }), LeadNoteConflictError);
    assert.equal(Number((await db('leadActivity').where({ leadId: ids[6], type: 'note' }).count('* as n').first())?.n), 1);
  });
  await check('read access alone allows notes; assignment and tenant scope remain enforced', async () => {
    await note('office', ids[7]); // Stage permission was revoked above; read access still permits a note.
    await note('admin', ids[8]);
    await assert.rejects(note('field', ids[1]), AuthorizationAccessError);
    await assert.rejects(note('owner', ids[62]), AuthorizationAccessError);
    await assert.rejects(note('outsider', ids[6]), AuthorizationAccessError);
    await note('owner', ids[0]); // Archived records remain readable, including append-only notes.
  });
  await check('concurrent note retries append once; separate notes do not conflict', async () => {
    const submissionId = randomUUID(); await Promise.all([note('owner', ids[9], { submissionId }), note('owner', ids[9], { submissionId })]);
    await Promise.all([note('owner', ids[9], { body: 'First distinct note.' }), note('field', ids[9], { body: 'Second distinct note.' })]);
    const result = await readLead(db, { userId: 'field', workspaceId: a }, enabled, ids[9]); assert.equal(result.notesTotal, 3); assert.equal(result.lead.version, 4);
    await assert.rejects(note('owner', ids[5], { submissionId: ids[62] })); assert.equal((await db('leads').where({ id: ids[5] }).first()).version, 1);
  });
  await check('team notes paginate independently from other activity', async () => {
    for (let i = 0; i < 25; i++) await note('field', ids[12], { body: `Note ${i + 1}` });
    const first = await readLead(db, { userId: 'field', workspaceId: a }, enabled, ids[12]);
    const second = await readLead(db, { userId: 'field', workspaceId: a }, enabled, ids[12], 1, 2);
    assert.equal(first.notesTotal, 25); assert.equal(first.teamNotes.length, 20); assert.equal(second.teamNotes.length, 5); assert(!second.teamNotes.some(note => first.teamNotes.some(old => old.id === note.id)));
  });
  const valuesFor = (row: Record<string, string>) => Object.fromEntries(leadEditableFields.map(field => [field, row[field]])) as UpdateLeadInput['values'];
  const edit = async (userId: string, id: string, patch = {}, extra = {}) => {
    const row = await db('leads').where({ id }).first();
    return updateLead(db, { userId, workspaceId: a }, enabled, { workspaceId: a, leadId: id, submissionId: randomUUID(), expectedVersion: row.version, values: { ...valuesFor(row), ...patch }, ...extra });
  };
  await check('edits save normalized fields and one before/after event; replay and no-op do not duplicate', async () => {
    const before = await db('leads').where({ id: ids[18] }).first(), submissionId = randomUUID();
    const request = { workspaceId: a, leadId: ids[18], expectedVersion: 1, submissionId, values: { ...valuesFor(before), name: '  Updated customer  ', email: 'NEW@EXAMPLE.TEST', notes: 'Updated internal note.' } };
    await updateLead(db, { userId: 'field', workspaceId: a }, enabled, request);
    await updateLead(db, { userId: 'field', workspaceId: a }, enabled, request);
    const result = await readLead(db, { userId: 'field', workspaceId: a }, enabled, ids[18]); assert.equal(result.lead.name, 'Updated customer'); assert.equal(result.lead.email, 'new@example.test'); assert.equal(result.lead.version, 2); assert.equal(result.lead.canEdit, true);
    assert.equal(result.lead.stage, before.stage); assert.equal(result.lead.owner?.id, before.ownerId); assert.equal(result.notesTotal, 0);
    const event = await db('leadActivity').where({ leadId: ids[18], type: 'edited' }).first(); assert.equal(event.actorId, 'field'); assert.deepEqual(event.changes.fields.map((field: { field: string }) => field.field), ['name', 'email', 'notes']); assert.equal(event.changes.fields[0].before, before.name);
    await edit('field', ids[18], { name: ' Updated customer ' }); assert.equal((await db('leads').where({ id: ids[18] }).first()).version, 2);
    assert.equal(Number((await db('leadActivity').where({ leadId: ids[18], type: 'edited' }).count('* as n').first())?.n), 1);
    await assert.rejects(updateLead(db, { userId: 'field', workspaceId: a }, enabled, { ...request, values: { ...request.values, name: 'Different' } }), LeadEditConflictError);
    await assert.rejects(edit('field', ids[18], { service: 'Stale draft' }, { expectedVersion: 1 }), error => error instanceof LeadEditConflictError && error.changedFields.includes('name') && error.changedFields.includes('notes') && !error.changedFields.includes('service'));
  });
  await check('source provenance survives edits and protects Gmail/campaign origins', async () => {
    await edit('owner', ids[19], { source: 'gmail' });
    assert.equal((await readLead(db, { userId: 'owner', workspaceId: a }, enabled, ids[19])).lead.origin, 'manual');
    await edit('owner', ids[19], { source: 'phone' });
    const gmailId = randomUUID(), campaignId = randomUUID();
    for (const [id, source] of [[gmailId, 'gmail'], [campaignId, 'other']]) await db('leads').insert({ ...base, id, workspaceId: a, submissionId: randomUUID(), ownerId: 'field', stage: 'new', source });
    await db('leadActivity').where({ id: campaignId }).update({ changes: JSON.stringify({ source: 'other', origin: 'campaign' }) }); // Future ingestion fixture.
    for (const id of [gmailId, campaignId]) {
      await assert.rejects(edit('field', id, { source: 'phone' }), LeadSourceLockedError);
      const row = await db('leads').where({ id }).first(), values = valuesFor(row); delete values.source;
      await updateLead(db, { userId: 'field', workspaceId: a }, enabled, { workspaceId: a, leadId: id, expectedVersion: 1, submissionId: randomUUID(), values: { ...values, service: 'Allowed service edit' } });
      assert.equal((await db('leads').where({ id }).first()).source, row.source);
    }
  });
  await check('edit writes enforce assignment, tenant, archive and current grants', async () => {
    await assert.rejects(edit('field', ids[20], { name: 'Denied' }), AuthorizationAccessError);
    await assert.rejects(edit('owner', ids[62], { name: 'Denied' }), AuthorizationAccessError);
    await assert.rejects(edit('outsider', ids[18], { name: 'Denied' }), AuthorizationAccessError);
    await assert.rejects(edit('owner', ids[0], { name: 'Archived' }), LeadEditConflictError);
    assert.equal((await readLead(db, { userId: 'owner', workspaceId: a }, enabled, ids[0])).lead.canEdit, false);
    await edit('office', ids[20], { name: 'Office edit' }); await edit('admin', ids[20], { name: 'Admin edit' });
    await db('workspaceRolePolicies').where({ workspaceId: a, role: 'office', permission: 'leads.update' }).delete();
    assert.equal((await readLead(db, { userId: 'office', workspaceId: a }, enabled, ids[20])).lead.canEdit, false);
    await assert.rejects(edit('office', ids[20], { name: 'Denied' }), AuthorizationAccessError);
  });
  await check('racing edits accept one version; history failure rolls back all fields', async () => {
    const results = await Promise.allSettled([edit('owner', ids[21], { name: 'First' }, { expectedVersion: 1 }), edit('field', ids[21], { name: 'Second' }, { expectedVersion: 1 })]); assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(Number((await db('leadActivity').where({ leadId: ids[21], type: 'edited' }).count('* as n').first())?.n), 1);
    const before = await db('leads').where({ id: ids[22] }).first();
    await assert.rejects(edit('owner', ids[22], { name: 'Must roll back' }, { submissionId: ids[62] }));
    const after = await db('leads').where({ id: ids[22] }).first(); assert.equal(after.name, before.name); assert.equal(after.version, before.version);
  });
  const assignmentIds: string[] = [];
  const fresh = async () => { const id=randomUUID();await db('leads').insert({...base,id,submissionId:randomUUID(),workspaceId:a,ownerId:null,stage:'new'});assignmentIds.push(id);return id; };
  const assign = async (leadId:string,ownerId:string|null,extra={},userId='owner') => {
    const lead=await db('leads').where({id:leadId}).first();
    return assignLead(db,{userId,workspaceId:a},enabled,{workspaceId:a,leadId,ownerId,expectedVersion:lead.version,submissionId:randomUUID(),...extra});
  };
  const fieldIdentity={userId:'field',workspaceId:a};
  await check('assignment is versioned, atomic, idempotent and checks role, member, tenant and archive',async()=>{
    const id=await fresh(), submissionId=randomUUID();await assign(id,'field',{submissionId});await assign(id,'field',{submissionId,expectedVersion:1});
    assert.equal((await db('leads').where({id}).first()).version,2);
    assert.equal(Number((await db('assignmentNotifications').where({leadId:id}).count('* as n').first())?.n),1);
    await assert.rejects(assign(id,'office',{submissionId,expectedVersion:1}),LeadAssignmentConflictError);
    await assert.rejects(assign(id,'office',{expectedVersion:1}),LeadAssignmentConflictError);
    await assert.rejects(assign(id,'outsider'),LeadAssignmentConflictError);
    await assert.rejects(assign(id,'office',{},'field'),AuthorizationAccessError);
    await assert.rejects(assign(ids[62],'field'),AuthorizationAccessError);
    await assert.rejects(assign(ids[0],'field'),LeadAssignmentConflictError);
    const before=(await db('leads').where({id}).first()).version;await assign(id,'field');assert.equal((await db('leads').where({id}).first()).version,before);
    const untouched=await fresh();await assert.rejects(assign(untouched,'field',{submissionId:ids[62]}));assert.equal((await db('leads').where({id:untouched}).first()).ownerId,null);
  });
  await check('self assignment and unassignment have activity but no notifications; reassignment revokes Field immediately',async()=>{
    const id=await fresh();await assign(id,'owner');assert.equal(await db('assignmentNotifications').where({leadId:id}).first(),undefined);
    await assign(id,'field');assert((await readLead(db,fieldIdentity,enabled,id)).lead.id===id);
    assert((await readNotifications(db,fieldIdentity,enabled)).items.some(n=>n.kind==='lead'&&n.leadId===id));
    await assign(id,'office');await assert.rejects(readLead(db,fieldIdentity,enabled,id),AuthorizationAccessError);
    assert(!(await readNotifications(db,fieldIdentity,enabled)).items.some(n=>n.kind==='lead'&&n.leadId===id));
    await assign(id,'field');assert.equal((await readNotifications(db,fieldIdentity,enabled)).items.filter(n=>n.kind==='lead'&&n.leadId===id).length,1);
    await assign(id,null);assert(!(await readNotifications(db,fieldIdentity,enabled)).items.some(n=>n.kind==='lead'&&n.leadId===id));
  });
  await check('notification preferences are personal, strict and default on; read status is scoped and idempotent',async()=>{
    assert.equal((await readNotificationPreferences(db,fieldIdentity,enabled)).leadAssignedEmail,true);
    await saveNotificationPreferences(db,fieldIdentity,enabled,{leadAssignedEmail:false});assert.equal((await readNotificationPreferences(db,{userId:'owner',workspaceId:a},enabled)).leadAssignedEmail,true);
    await assert.rejects(saveNotificationPreferences(db,{userId:'outsider',workspaceId:a},enabled,{leadAssignedEmail:false}),AuthorizationAccessError);
    const n=(await readNotifications(db,fieldIdentity,enabled)).items[0];assert(n);
    await assert.rejects(markNotificationRead(db,{userId:'office',workspaceId:a},enabled,n.id),AuthorizationAccessError);
    await markNotificationRead(db,fieldIdentity,enabled,n.id);await markNotificationRead(db,fieldIdentity,enabled,n.id);
    assert((await readNotifications(db,fieldIdentity,enabled)).items.find(x=>x.id===n.id)?.read);
    await saveNotificationPreferences(db,fieldIdentity,enabled,{leadAssignedEmail:true});
  });
  await check('delivery skips stale assignments and unverified or opted-out recipients, retries without blocking writes',async()=>{
    let sent=0;const send=async()=>{sent++;};await processAssignmentEmails(db,enabled,send,100);assert.equal(sent,0);
    await db('users').where({id:'field'}).update({emailVerified:true});
    const opted=await fresh();await assign(opted,'field');await saveNotificationPreferences(db,fieldIdentity,enabled,{leadAssignedEmail:false});await processAssignmentEmails(db,enabled,send,100);assert.equal(sent,0);
    await saveNotificationPreferences(db,fieldIdentity,enabled,{leadAssignedEmail:true});
    const id=await fresh();await assign(id,'field');
    await processAssignmentEmails(db,enabled,async()=>{throw Error('provider failure');},100);
    const n=await db('assignmentNotifications').where({leadId:id}).first();const pending=await db('assignmentEmailOutbox').where({id:n.id}).first();assert.equal(pending.status,'queued');assert.equal(pending.attempts,1);assert.equal((await db('leads').where({id}).first()).ownerId,'field');
    await db('assignmentEmailOutbox').where({id:n.id}).update({nextAttemptAt:new Date(0)});
    await Promise.all([processAssignmentEmails(db,enabled,send,100),processAssignmentEmails(db,enabled,send,100)]);assert.equal(sent,1);assert.equal((await db('assignmentEmailOutbox').where({id:n.id}).first()).status,'sent');
    const failing=await fresh();await assign(failing,'field');const failingNotification=await db('assignmentNotifications').where({leadId:failing}).first();
    for(let i=0;i<5;i++){await db('assignmentEmailOutbox').where({id:failingNotification.id}).update({nextAttemptAt:new Date(0)});await processAssignmentEmails(db,enabled,async()=>{throw Error('provider unavailable');},100);}
    const exhausted=await db('assignmentEmailOutbox').where({id:failingNotification.id}).first();assert.equal(exhausted.status,'failed');assert.equal(exhausted.attempts,5);
    await processAssignmentEmails(db,enabled,send,100);assert.equal(sent,1);
    const expired=await fresh();await assign(expired,'field');const expiredNotification=await db('assignmentNotifications').where({leadId:expired}).first();await db('assignmentNotifications').where({id:expiredNotification.id}).update({createdAt:new Date(Date.now()-24*60*60*1000)});await processAssignmentEmails(db,enabled,send,100);assert.equal(sent,1);assert.equal((await db('assignmentEmailOutbox').where({id:expiredNotification.id}).first()).status,'skipped');
    const revoked=await fresh();await assign(revoked,'field');const fieldGrants=await db('workspaceRolePolicies').where({workspaceId:a,role:'field'});await db('workspaceRolePolicies').where({workspaceId:a,role:'field'}).delete();await processAssignmentEmails(db,enabled,send,100);assert.equal(sent,1);assert.equal((await readNotifications(db,fieldIdentity,enabled)).items.length,0);
    await db('workspaceRolePolicies').insert(fieldGrants);
  });
  await check('notification pages are bounded, workload counts exclude closed and archived leads',async()=>{
    for(let i=0;i<22;i++)await assign(await fresh(),'field');
    const first=await readNotifications(db,fieldIdentity,enabled), second=await readNotifications(db,fieldIdentity,enabled,2);assert.equal(first.items.length,20);assert(first.hasMore);assert(second.items.length>0);assert(!second.items.some(n=>first.items.some(old=>old.id===n.id)));
    const roster=(await read('owner')).owners;const actual=await db('leads').where({workspaceId:a,ownerId:'field'}).whereNull('archivedAt').whereIn('stage',['new','contacted','estimate-sent']).count('* as n').first();assert.equal(roster.find(m=>m.id==='field')?.openLeadCount,Number(actual?.n));assert.deepEqual((await read('field')).owners,[]);
  });
  const lifecycle = async (id:string,archived:boolean,extra={},userId='owner') => {
    const row=await db('leads').where({id}).first();
    return setLeadArchived(db,{userId,workspaceId:a},enabled,{workspaceId:a,leadId:id,expectedVersion:row.version,submissionId:randomUUID(),...extra},archived);
  };
  await check('archive and restore retain content, ownership and stage with atomic metadata/history and safe replay',async()=>{
    const id=await fresh();await assign(id,'field');const before=await db('leads').where({id}).first(), submissionId=randomUUID();
    const total=(await read('owner')).total, emails=Number((await db('assignmentEmailOutbox').count('* as n').first())?.n);
    await lifecycle(id,true,{submissionId});await lifecycle(id,true,{submissionId,expectedVersion:before.version});
    const archived=await db('leads').where({id}).first();assert.equal(archived.version,before.version+1);assert.equal(archived.archivedBy,'owner');assert(archived.archivedAt);assert.equal(archived.ownerId,before.ownerId);assert.equal(archived.notes,before.notes);assert.equal(archived.stage,before.stage);
    assert.equal((await read('owner')).total,total-1);assert((await read('owner',{archived:true,pageSize:100})).rows.some(row=>row.id===id));
    const record=(await readLead(db,{userId:'owner',workspaceId:a},enabled,id)).lead;assert.equal(record.canArchive,false);assert.equal(record.canRestore,true);assert.equal(record.canMove,false);assert.equal(record.canEdit,false);assert.equal(record.canAssign,false);
    const restoreId=randomUUID();await lifecycle(id,false,{submissionId:restoreId});await lifecycle(id,false,{submissionId:restoreId,expectedVersion:archived.version});
    const restored=await db('leads').where({id}).first();assert.equal(restored.version,before.version+2);assert.equal(restored.archivedAt,null);assert.equal(restored.archivedBy,null);assert.equal((await read('owner')).total,total);
    assert.equal(Number((await db('leadActivity').where({leadId:id}).whereIn('type',['archived','restored']).count('* as n').first())?.n),2);
    assert.equal(Number((await db('assignmentEmailOutbox').count('* as n').first())?.n),emails);
  });
  await check('archive lifecycle denies forged tenants, roles, removed members, stale versions and mismatched replay',async()=>{
    const id=await fresh(),submissionId=randomUUID();await lifecycle(id,true,{submissionId});
    await assert.rejects(lifecycle(id,false,{submissionId}),LeadArchiveConflictError);
    await assert.rejects(lifecycle(id,false,{expectedVersion:1}),LeadArchiveConflictError);
    await assert.rejects(lifecycle(id,true),LeadArchiveConflictError);
    await assert.rejects(lifecycle(ids[62],true),AuthorizationAccessError);
    await assert.rejects(lifecycle(id,false,{},'outsider'),AuthorizationAccessError);
    await assert.rejects(lifecycle(ids[6],true,{},'field'),AuthorizationAccessError);
    await lifecycle(id,false,{},'admin');
    const officeId=await fresh();await assert.rejects(lifecycle(officeId,true,{},'office'),AuthorizationAccessError);
    await db('workspaceRolePolicies').where({workspaceId:a,role:'admin',permission:'leads.archive'}).delete();
    assert.equal((await readLead(db,{userId:'admin',workspaceId:a},enabled,officeId)).lead.canArchive,false);
    await assert.rejects(lifecycle(officeId,true,{},'admin'),AuthorizationAccessError);
  });
  await check('racing archive writes accept one version, failure rolls back and Won leads remain archivable',async()=>{
    const id=await fresh();const results=await Promise.allSettled([lifecycle(id,true,{expectedVersion:1}),lifecycle(id,true,{expectedVersion:1})]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
    const rollback=await fresh();await assert.rejects(lifecycle(rollback,true,{submissionId:ids[62]}));const row=await db('leads').where({id:rollback}).first();assert.equal(row.archivedAt,null);assert.equal(row.version,1);
    const won=await fresh();await db('leads').where({id:won}).update({stage:'won'});await lifecycle(won,true);await lifecycle(won,false);assert.equal((await db('leads').where({id:won}).first()).stage,'won');
  });
  const remove = async (id: string, extra = {}, userId = 'owner') => {
    const lead = await db('leads').where({ id }).first();
    return deleteLead(db, { userId, workspaceId: a }, enabled, { workspaceId: a, leadId: id, expectedVersion: lead?.version ?? 1, submissionId: randomUUID(), typedConfirmation: `LD-${String(lead?.leadNumber).padStart(4, '0')}`, ...extra });
  };
  await check('permanent deletion atomically removes content, history, proposals and assignment outbox; replay is safe', async () => {
    const id = await fresh(); await assign(id, 'field'); await note('owner', id);
    const row = await db('leads').where({ id }).first(), notification = await db('assignmentNotifications').where({ leadId: id }).first();
    const threadId = randomUUID(), turnId = randomUUID(), draftId = randomUUID();
    await db('chatThreads').insert({ id: threadId, workspaceId: a, userId: 'owner' });
    await db('chatTurns').insert({ id: turnId, threadId, workspaceId: a, userId: 'owner', clientTurnId: randomUUID(), requestHash: 'test', surfaceKey: 'home', state: 'completed', leaseUntil: new Date() });
    await db('chatActionDrafts').insert({ id: draftId, turnId, threadId, workspaceId: a, userId: 'owner', lead: { name: 'Private proposal payload' }, inputHash: 'test', accessHash: 'test', state: 'confirmed', leadId: id, expiresAt: new Date() });
    const derivedTurn = randomUUID(), derivedDraft = randomUUID();
    await db('chatTurns').insert({ id: derivedTurn, threadId, workspaceId: a, userId: 'owner', clientTurnId: randomUUID(), requestHash: 'derived', surfaceKey: 'lead.detail', state: 'completed', leaseUntil: new Date(), leadEvidence: JSON.stringify([{ id, version: row.version }]) });
    await db('chatActionDrafts').insert({ id: derivedDraft, turnId: derivedTurn, threadId, workspaceId: a, userId: 'owner', lead: { name: 'Context-derived private proposal' }, inputHash: 'derived', accessHash: 'derived', state: 'pending', expiresAt: new Date() });
    const input = { submissionId: randomUUID(), expectedVersion: row.version, typedConfirmation: `LD-${String(row.leadNumber).padStart(4, '0')}` };
    assert.equal((await readLead(db, { userId: 'owner', workspaceId: a }, enabled, id)).lead.canDelete, true);
    await remove(id, input); await remove(id, input);
    for (const table of ['leads', 'leadActivity', 'chatActionDrafts', 'assignmentNotifications']) assert.equal(await db(table).where(table === 'leads' ? { id } : { leadId: id }).first(), undefined);
    assert.equal(await db('assignmentEmailOutbox').where({ id: notification.id }).first(), undefined);
    assert.equal(await db('chatActionDrafts').where({ id: derivedDraft }).first(), undefined);
    assert(await db('workspaceLeadAdmissions').where({ leadId: id }).first());
    const audit = await db('leadDeletionAudit').where({ id: input.submissionId }).first();
    assert.equal(audit.actorId, 'owner'); assert.equal(audit.leadNumber, row.leadNumber); assert(!('name' in audit));
    assert.equal(Number((await db('leadDeletionAudit').where({ leadId: id }).count('* as n').first())?.n), 1);
    await assert.rejects(readLead(db, { userId: 'owner', workspaceId: a }, enabled, id), AuthorizationAccessError);
    await assert.rejects(remove(id, { ...input, typedConfirmation: 'LD-9999' }), LeadDeleteConflictError);
    await assert.rejects(remove(id, input, 'admin'), LeadDeleteConflictError);
    await assert.rejects(db('leadDeletionAudit').where({ id: input.submissionId }).update({ actorId: 'forged' }));
    await assert.rejects(db('leadDeletionAudit').where({ id: input.submissionId }).delete());
  });
  await check('deletion denies wrong number, stale version, Won, other tenants, roles and revoked grants', async () => {
    const id = await fresh();
    await assert.rejects(remove(id, { typedConfirmation: ' LD-0001 ' }), LeadDeleteConfirmationError);
    await assert.rejects(remove(id, { expectedVersion: 2 }), LeadDeleteConflictError);
    for (const role of ['office', 'field', 'outsider']) await assert.rejects(remove(id, {}, role), AuthorizationAccessError);
    await assert.rejects(remove(ids[62]), AuthorizationAccessError);
    await db('leads').where({ id }).update({ stage: 'won' });
    await assert.rejects(remove(id), LeadDeleteWonError);
    await db('leads').where({ id }).update({ stage: 'lost', archivedAt: new Date() });
    const grants = await db('workspaceRolePolicies').where({ workspaceId: a, role: 'admin', permission: 'leads.delete' });
    await db('workspaceRolePolicies').where({ workspaceId: a, role: 'admin', permission: 'leads.delete' }).delete();
    assert.equal((await readLead(db, { userId: 'admin', workspaceId: a }, enabled, id)).lead.canDelete, false);
    await assert.rejects(remove(id, {}, 'admin'), AuthorizationAccessError);
    await db('workspaceRolePolicies').insert(grants);
    const row = await db('leads').where({ id }).first(), input = { submissionId: randomUUID(), expectedVersion: row.version, typedConfirmation: `LD-${String(row.leadNumber).padStart(4, '0')}` };
    await remove(id, input, 'admin');
    await db('workspaceRolePolicies').where({ workspaceId: a, role: 'admin', permission: 'leads.delete' }).delete();
    await assert.rejects(remove(id, input, 'admin'), AuthorizationAccessError);
    await db('workspaceRolePolicies').insert(grants);
  });
  await check('racing deletion commits once and an audit failure rolls content removal back', async () => {
    const id = await fresh(); const row = await db('leads').where({ id }).first();
    const input = { submissionId: randomUUID(), expectedVersion: row.version, typedConfirmation: `LD-${String(row.leadNumber).padStart(4, '0')}` };
    const replay = await Promise.all([remove(id, input), remove(id, input)]); assert(replay.every(result => result.deleted));
    const rollback = await fresh();
    await assert.rejects(remove(rollback, { submissionId: input.submissionId }), LeadDeleteConflictError);
    assert(await db('leads').where({ id: rollback }).first()); assert(await db('leadActivity').where({ leadId: rollback }).first());
    await db.raw(`CREATE FUNCTION fail_lead_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture failure'; END $$`);
    await db.raw('CREATE TRIGGER fail_lead_delete BEFORE DELETE ON leads FOR EACH ROW EXECUTE FUNCTION fail_lead_delete()');
    const submissionId = randomUUID(); await assert.rejects(remove(rollback, { submissionId }));
    assert(await db('leads').where({ id: rollback }).first()); assert.equal(await db('leadDeletionAudit').where({ id: submissionId }).first(), undefined);
    await db.raw('DROP TRIGGER fail_lead_delete ON leads'); await db.raw('DROP FUNCTION fail_lead_delete()');
  });
  const exportInput = (patch = {}) => ({ workspaceId: a, filters: { query: '', stages: [], sources: [], ownerIds: [], created: 'any' as const, from: '', to: '', attention: false, archived: false, ...patch } });
  const exportIdentity = { userId: 'owner', workspaceId: a };
  await check('export scope, filters and counts match reads; role, tenant and current revocation deny', async () => {
    for (const userId of ['owner', 'admin']) assert.equal((await previewLeadExport(db, { userId, workspaceId: a }, enabled, exportInput())).count, (await read(userId)).total);
    for (const userId of ['office', 'field', 'outsider']) await assert.rejects(previewLeadExport(db, { userId, workspaceId: a }, enabled, exportInput()), AuthorizationAccessError);
    await assert.rejects(previewLeadExport(db, exportIdentity, enabled, { ...exportInput(), workspaceId: b }), AuthorizationAccessError);
    for (const filters of [{ query: 'willow' }, { stages: ['new'], sources: ['website'], ownerIds: ['me'] }, { attention: true }, { archived: true }, { created: 'custom', from: '2026-10-01', to: '2026-10-15' }]) {
      const preview = await previewLeadExport(db, exportIdentity, enabled, exportInput(filters));
      const { query, from, to, ...rest } = exportInput(filters).filters;
      assert.equal(preview.count, (await read('owner', { q: query, ...rest, ...(from ? { from } : {}), ...(to ? { to } : {}) })).total);
    }
    const grant = await db('workspaceRolePolicies').where({ workspaceId: a, role: 'owner', permission: 'leads.export' }).first();
    await db('workspaceRolePolicies').where({ workspaceId: a, role: 'owner', permission: 'leads.export' }).delete();
    await assert.rejects(createLeadCSVExport(db, exportIdentity, enabled, exportInput()), AuthorizationAccessError);
    assert.equal((await read('owner')).canExport, false);
    await db('workspaceRolePolicies').insert(grant);
  });
  await check('CSV cursor exports every matching page, protects cells and keeps a non-content outcome audit', async () => {
    const exportIds = Array.from({ length: 125 }, () => randomUUID());
    await db('leads').insert(exportIds.map((id, index) => ({ ...base, id, workspaceId: a, submissionId: randomUUID(), stage: 'new', ownerId: 'owner', name: `Export Fixture ${index}`, details: '=1+1', notes: 'Renée, 李\nA "quote"' })));
    const input = exportInput({ query: 'Export Fixture' });
    const result = await createLeadCSVExport(db, exportIdentity, enabled, input);
    const csv = await new Response(result.stream).text();
    assert.equal(result.count, 125); assert.equal((csv.match(/"Export Fixture /g) ?? []).length, 125); assert(csv.includes('"\'=1+1"')); assert(csv.includes('Renée, 李\nA ""quote""')); assert(csv.startsWith('"Lead ID","Lead #"')); assert(/"\d{4}-\d{2}-\d{2}T.*Z"/.test(csv));
    const audit = await db('leadExportAudit').where({ workspaceId: a, outcome: 'completed' }).orderBy('createdAt', 'desc').first();
    assert.equal(audit.count, 125); assert.equal(audit.rowsSent, 125); assert(audit.filters.searchHash); assert(!JSON.stringify(audit).includes('Export Fixture')); assert(!JSON.stringify(audit).includes('Renée'));
    await assert.rejects(db('leadExportAudit').where({ id: audit.id }).update({ count: 1 }));
    const filter = { workspaceId: a, role: 'owner', permission: 'leads.export' };
    await db('workspaceRolePolicies').where(filter).update({ scope: 'assigned' });
    assert.equal((await previewLeadExport(db, exportIdentity, enabled, input)).scope, 'assigned');
    await db('leads').where({ id: exportIds[0] }).update({ ownerId: 'field' });
    const assigned = await createLeadCSVExport(db, exportIdentity, enabled, input), assignedCSV = await new Response(assigned.stream).text();
    assert.equal(assigned.count, 124); assert(!assignedCSV.includes(exportIds[0]));
    await assert.rejects(previewLeadExport(db, exportIdentity, enabled, exportInput({ ownerIds: ['field'] })), AuthorizationAccessError);
    await db('workspaceRolePolicies').where(filter).update({ scope: 'workspace' });
    await db('leads').where({ id: exportIds[1] }).update({ ownerId: null, ownerName: 'Historical owner snapshot' });
    const unassigned = await createLeadCSVExport(db, exportIdentity, enabled, exportInput({ query: 'Export Fixture', ownerIds: ['unassigned'] }));
    const unassignedCSV = await new Response(unassigned.stream).text(); assert.equal(unassigned.count, 1); assert(!unassignedCSV.includes('Historical owner snapshot'));
  });
  await check('export cap and empty reads fail before download without silently truncating; config is server-owned', async () => {
    const previous = process.env.LEAD_EXPORT_ROW_LIMIT; process.env.LEAD_EXPORT_ROW_LIMIT = '2';
    try {
      const preview = await previewLeadExport(db, exportIdentity, enabled, exportInput({ query: 'Export Fixture' })); assert.equal(preview.count, 125); assert.equal(preview.rowLimit, 2);
      await assert.rejects(createLeadCSVExport(db, exportIdentity, enabled, exportInput({ query: 'Export Fixture' })), LeadExportLimitError);
      const rejected = await db('leadExportAudit').where({ outcome: 'rejected' }).orderBy('createdAt', 'desc').first(); assert.equal(rejected.count, 125); assert.equal(rejected.rowsSent, 0);
      await assert.rejects(createLeadCSVExport(db, exportIdentity, enabled, exportInput({ query: 'No matching export fixture' })), LeadExportEmptyError);
    } finally { if (previous === undefined) delete process.env.LEAD_EXPORT_ROW_LIMIT; else process.env.LEAD_EXPORT_ROW_LIMIT = previous; }
  });
  await check('cancelled streams release the transaction and retain failure evidence', async () => {
    await db('leads').where({ workspaceId: a }).whereILike('name', 'Export Fixture%').update({ details: 'x'.repeat(10000) });
    const result = await createLeadCSVExport(db, exportIdentity, enabled, exportInput({ query: 'Export Fixture' }));
    const reader = result.stream.getReader(); await reader.read(); await reader.cancel();
    let audit;
    for (let attempt = 0; attempt < 100; attempt++) {
      audit = await db('leadExportAudit').where({ workspaceId: a }).orderBy('createdAt', 'desc').first();
      if (audit.outcome === 'failed') break;
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    assert.equal(audit.outcome, 'failed');
    await db.transaction(async trx => { await trx('workspaces').where({ id: a }).forUpdate().first(); });
  });
  await check('chat context reloads scoped summaries, drops forbidden refs and validates all inherited source versions', async () => {
    const id = await fresh(); await assign(id, 'field');
    const context = await loadWorkspaceAuthorization(db, { userId: 'field', workspaceId: a }, enabled);
    const own = await db.transaction(trx => resolveLeadChatContext(trx, context, { surfaceKey: 'lead.detail', recordRefs: [{ type: 'lead', id }] }));
    assert.equal(own.evidence[0].id, id); assert(JSON.stringify(own.reference).includes('lead-page-summary')); assert(!JSON.stringify(own.reference).includes('secret-unsearchable'));
    const denied = await db.transaction(trx => resolveLeadChatContext(trx, context, { surfaceKey: 'lead.detail', recordRefs: [{ type: 'lead', id: ids[62] }] }));
    assert.deepEqual(denied.evidence, []); assert(!JSON.stringify(denied.reference).includes(ids[62]));
    const unknown = await db.transaction(trx => resolveLeadChatContext(trx, context, { surfaceKey: 'lead.detail', recordRefs: [{ type: 'lead', id: randomUUID() }] })); assert.deepEqual(unknown, denied);
    assert(await db.transaction(trx => leadChatEvidenceAllowed(trx, context, own.evidence)));
    assert.equal(await db.transaction(trx => leadChatEvidenceAllowed(trx, context, [...own.evidence, { id: ids[62], version: 1 }])), false);
    await assign(id, 'office'); assert.equal(await db.transaction(trx => leadChatEvidenceAllowed(trx, context, own.evidence)), false);
    const filters = await db.transaction(trx => resolveLeadChatContext(trx, context, { surfaceKey: 'leads.list', uiState: { view: 'pipeline', filters: exportInput().filters } }));
    assert(JSON.stringify(filters.reference).includes('No matching records or totals')); assert.deepEqual(filters.evidence, []);
    const summary = await db.transaction(trx => leadChatPipelineCounts(trx, context, { view: 'list', filters: exportInput({ query: 'No matching summary fixture' }).filters })); assert.deepEqual(summary.counts, {}); assert.equal(summary.scope, 'assigned'); assert.equal(summary.filtersApplied, true);
    const forged = await db.transaction(trx => resolveLeadChatContext(trx, context, { surfaceKey: 'leads.list', uiState: { view: 'list', filters: exportInput({ ownerIds: ['office'] }).filters } })); assert.deepEqual(forged, denied);
  });
  await check('removed members preserve readable ownership without assignment roster leakage', async () => {
    await db('workspaceMemberships').where({ workspaceId: a, userId: 'office' }).delete(); const record = await readLead(db, { userId: 'owner', workspaceId: a }, enabled, ids[1]); assert.equal(record.lead.owner?.former, true);
    await assert.rejects(read('office'), AuthorizationAccessError);
  });
  await check('current permission revocation takes effect on the next read', async () => {
    await db('workspaceRolePolicies').where({ workspaceId: a, role: 'field', permission: 'leads.read' }).delete(); await assert.rejects(read('field'), AuthorizationAccessError); await assert.rejects(note('field', ids[6]), AuthorizationAccessError);
  });
  console.log(`${checks} lead read/database checks passed.`);
} finally { await db.destroy(); await admin.raw('DROP SCHEMA IF EXISTS ?? CASCADE', [schema]); await admin.destroy(); }
