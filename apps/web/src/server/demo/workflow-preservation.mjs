import { workflowDefinitionSchema } from '@salesmora/contracts';
import { isDeepStrictEqual } from 'node:util';

const ownerKeys = {
  'DEMO_OWNER_PASSWORD': 'main',
  'DEMO_FREE_OWNER_PASSWORD': 'free',
  'DEMO_STANDARD_OWNER_PASSWORD': 'standard',
};

export function emptyDemoWorkflows() {
  return {
    version: 1, users: {}, workspaces: {}, timezones: {}, workflows: [], services: [], sources: [],
    versions: [], drafts: [], publications: [], templates: [], outreach: [],
    qualifiedWorkers: [], coverage: [], postalCodes: [], assignmentSettings: [],
  };
}

function assertMember(id, workspaceId, members, label) {
  if (id != null && !members.has(`${workspaceId}:${id}`)) {
    throw new Error(`${label} references a user outside the demo workspace; reset stopped.`);
  }
}

function assertAssignment(configuration, workspaceId, members) {
  const assignment = configuration?.workflow?.assignment;
  if (assignment?.kind === 'teammate') {
    assertMember(assignment.teammateId, workspaceId, members, 'Capture source');
  }
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  }
  return value;
}

export function sameDemoWorkflowSnapshot(left, right) {
  const normalize = snapshot => {
    const data = JSON.parse(JSON.stringify(snapshot));
    for (const key of ['workflows', 'services', 'sources', 'versions', 'drafts', 'publications',
      'templates', 'outreach', 'qualifiedWorkers', 'coverage', 'postalCodes', 'assignmentSettings']) {
      data[key] = data[key].map(row => JSON.stringify(canonical(row))).sort();
    }
    return canonical(data);
  };
  return isDeepStrictEqual(normalize(left), normalize(right));
}

export async function collectDemoWorkflows(db, demoAccounts) {
  const { rows: [{ present }] } = await db.raw(
    "SELECT to_regclass('public.workflows') IS NOT NULL AS present",
  );
  if (!present) return emptyDemoWorkflows();
  const workflows = await db('workflows').whereNull('deletedAt').select('*');
  if (!workflows.length) return emptyDemoWorkflows();

  const accountByEmail = new Map(demoAccounts.map(account => [account.email, account]));
  const userRows = await db('users').whereIn('email', demoAccounts.map(account => account.email)).select('id', 'email');
  const users = Object.fromEntries(userRows.map(user => [accountByEmail.get(user.email).key, user.id]));
  const workspaceIds = [...new Set(workflows.map(workflow => workflow.workspaceId))];
  const workspaceRows = await db('workspaces as w').join('users as u', 'u.id', 'w.ownerId')
    .whereIn('w.id', workspaceIds).select('w.id', 'w.timezone', 'u.email');
  const workspaces = {};
  const timezones = {};
  for (const workspace of workspaceRows) {
    const key = ownerKeys[accountByEmail.get(workspace.email)?.key];
    if (!key || workspaces[key]) {
      throw new Error('A workflow belongs to a non-demo or ambiguous workspace; reset stopped.');
    }
    workspaces[key] = workspace.id;
    timezones[key] = workspace.timezone;
  }
  if (workspaceRows.length !== workspaceIds.length) {
    throw new Error('A workflow workspace cannot be restored; reset stopped.');
  }

  const allowed = new Map(demoAccounts.map(account => [account.key, account.role]));
  const userKey = new Map(userRows.map(user => [user.id, accountByEmail.get(user.email).key]));
  const memberships = await db('workspaceMemberships').whereIn('workspaceId', workspaceIds)
    .select('workspaceId', 'userId', 'role');
  const members = new Set();
  for (const membership of memberships) {
    const key = userKey.get(membership.userId);
    const workspaceKey = Object.keys(workspaces).find(name => workspaces[name] === membership.workspaceId);
    const expectedWorkspace = key === 'DEMO_FREE_OWNER_PASSWORD' ? 'free' :
      key === 'DEMO_STANDARD_OWNER_PASSWORD' ? 'standard' : 'main';
    if (key && workspaceKey === expectedWorkspace && membership.role === allowed.get(key)) {
      members.add(`${membership.workspaceId}:${membership.userId}`);
    }
  }

  const sourceIds = new Map();
  for (const workflow of workflows) {
    const definition = workflowDefinitionSchema.parse(workflow.definition);
    assertMember(workflow.publisherId, workflow.workspaceId, members, 'Workflow publisher');
    assertMember(definition.recipientId, workflow.workspaceId, members, 'Workflow recipient');
    assertMember(workflow.routingCursor, workflow.workspaceId, members, 'Workflow routing cursor');
    if (definition.kind === 'lead_routing') {
      if (sourceIds.has(definition.sourceId) && sourceIds.get(definition.sourceId) !== workflow.workspaceId) {
        throw new Error('A capture source is referenced across workspaces; reset stopped.');
      }
      sourceIds.set(definition.sourceId, workflow.workspaceId);
      for (const member of definition.routing?.members ?? []) {
        assertMember(member.id, workflow.workspaceId, members, 'Workflow routing');
      }
    }
  }

  const ids = [...sourceIds.keys()];
  const sources = ids.length ? await db('captureSources').whereIn('id', ids).select('*') : [];
  if (sources.length !== sourceIds.size || sources.some(source => source.type !== 'website' ||
      sourceIds.get(source.id) !== source.workspaceId || !source.approvedVersion)) {
    throw new Error('A workflow references an unsupported or unavailable capture source; reset stopped.');
  }
  const versions = ids.length ? await db('captureSourceVersions').whereIn('sourceId', ids).select('*') : [];
  const drafts = ids.length ? await db('captureSourceDrafts').whereIn('sourceId', ids).select('*') : [];
  const publications = ids.length ? await db('capturePublications').whereIn('sourceId', ids).select('*') : [];
  for (const source of sources) {
    assertMember(source.createdBy, source.workspaceId, members, 'Capture source creator');
    if (!versions.some(row => row.sourceId === source.id && row.workspaceId === source.workspaceId &&
        row.configurationVersion === source.approvedVersion)) {
      throw new Error('A workflow capture source has no approved configuration; reset stopped.');
    }
  }
  for (const version of versions) {
    assertMember(version.approvedBy, version.workspaceId, members, 'Capture source approver');
    assertAssignment(version.configuration, version.workspaceId, members);
  }
  for (const draft of drafts) assertAssignment(draft.configuration, draft.workspaceId, members);

  const services = await db('workspaceServices').whereIn('workspaceId', workspaceIds).select('*');
  const templates = await db('serviceEmailTemplates').whereIn('workspaceId', workspaceIds).select('*');
  const outreach = await db('serviceOutreachCompany').whereIn('workspaceId', workspaceIds).select('*');
  const qualifiedWorkers = await db('serviceQualifiedWorkers').whereIn('workspaceId', workspaceIds).select('*');
  const coverage = await db('workspaceMemberCoverage').whereIn('workspaceId', workspaceIds).select('*');
  const postalCodes = await db('workspaceMemberPostalCodes').whereIn('workspaceId', workspaceIds).select('*');
  const assignmentSettings = await db('leadAssignmentSettings').whereIn('workspaceId', workspaceIds).select('*');
  for (const row of [...qualifiedWorkers, ...coverage, ...postalCodes]) {
    assertMember(row.personId, row.workspaceId, members, 'Workflow settings');
  }
  for (const row of assignmentSettings) {
    if (row.value?.kind === 'teammate') assertMember(row.value.teammateId, row.workspaceId, members, 'Lead assignment');
  }
  return {
    version: 1, users, workspaces, timezones, workflows, services, sources, versions, drafts,
    publications, templates, outreach, qualifiedWorkers, coverage, postalCodes, assignmentSettings,
  };
}

export async function restoreDemoWorkflows(db, snapshot) {
  if (snapshot.version !== 1 || !Array.isArray(snapshot.workflows)) {
    throw new Error('Invalid workflow snapshot.');
  }
  await db.transaction(async trx => {
    for (const row of snapshot.assignmentSettings) {
      const updated = await trx('leadAssignmentSettings').where({ workspaceId: row.workspaceId })
        .update({ value: row.value, version: row.version, updatedAt: row.updatedAt });
      if (updated !== 1) throw new Error('A workflow lead assignment setting could not be restored.');
    }
    for (const row of snapshot.sources) {
      await trx('captureSources').insert({
        ...row, status: 'paused', scheduledAt: null, timezone: null,
      });
    }
    for (const [table, rows] of [
      ['captureSourceVersions', snapshot.versions],
      ['captureSourceDrafts', snapshot.drafts],
      ['capturePublications', snapshot.publications],
      ['serviceOutreachCompany', snapshot.outreach],
      ['serviceQualifiedWorkers', snapshot.qualifiedWorkers],
      ['workspaceMemberCoverage', snapshot.coverage],
      ['workspaceMemberPostalCodes', snapshot.postalCodes],
    ]) {
      if (rows.length) await trx(table).insert(rows);
    }
    for (const row of snapshot.workflows) {
      workflowDefinitionSchema.parse(row.definition);
      await trx('workflows').insert({ ...row, status: 'paused', deletedAt: null });
      await trx('workflowSteps').where({ workspaceId: row.workspaceId, workflowId: row.id, status: 'queued' })
        .update({ status: 'held' });
    }
    for (const row of snapshot.templates) {
      await trx('serviceEmailTemplates').insert(row)
        .onConflict(['workspaceId', 'serviceId', 'purpose'])
        .merge(['subject', 'body', 'version']);
    }
  });
}

export async function verifyDemoWorkflows(db, snapshot) {
  const rows = await db('workflows').whereNull('deletedAt').select('id', 'status', 'definition', 'workspaceId', 'serviceId', 'publisherId');
  if (rows.length !== snapshot.workflows.length) throw new Error('Restored workflow count does not match the snapshot.');
  for (const expected of snapshot.workflows) {
    const actual = rows.find(row => row.id === expected.id && row.workspaceId === expected.workspaceId);
    if (!actual || actual.status !== 'paused' || actual.serviceId !== expected.serviceId ||
        actual.publisherId !== expected.publisherId || !isDeepStrictEqual(actual.definition, expected.definition)) {
      throw new Error('A workflow was not restored paused with its original definition.');
    }
  }
  for (const expected of snapshot.sources) {
    const actual = await db('captureSources').where({ id: expected.id, workspaceId: expected.workspaceId }).first('status', 'approvedVersion');
    if (!actual || actual.status !== 'paused' || actual.approvedVersion !== expected.approvedVersion) {
      throw new Error('A workflow capture source was not restored paused.');
    }
  }
  for (const expected of snapshot.versions) {
    const actual = await db('captureSourceVersions').where({
      workspaceId: expected.workspaceId, sourceId: expected.sourceId, configurationVersion: expected.configurationVersion,
    }).first('configuration');
    if (!actual || !isDeepStrictEqual(actual.configuration, expected.configuration)) {
      throw new Error('A capture source configuration was not restored.');
    }
  }
  for (const expected of snapshot.drafts) {
    const actual = await db('captureSourceDrafts').where({ id: expected.id, workspaceId: expected.workspaceId }).first('configuration');
    if (!actual || !isDeepStrictEqual(actual.configuration, expected.configuration)) {
      throw new Error('A capture source draft was not restored.');
    }
  }
  for (const expected of snapshot.templates) {
    const actual = await db('serviceEmailTemplates').where({
      workspaceId: expected.workspaceId, serviceId: expected.serviceId, purpose: expected.purpose,
    }).first('subject', 'body', 'version');
    if (!actual || actual.subject !== expected.subject || actual.body !== expected.body || actual.version !== expected.version) {
      throw new Error('A workflow email template was not restored.');
    }
  }
  const queued = await db('workflowSteps').where('status', 'queued').whereIn('workflowId', snapshot.workflows.map(row => row.id)).first('id');
  if (queued) throw new Error('Restored workflows must not have queued steps.');
  const pending = await db('workflowQueueOutbox as q').join('workflowSteps as s', 's.id', 'q.stepId')
    .whereNull('q.completedAt').whereIn('s.workflowId', snapshot.workflows.map(row => row.id)).first('q.id');
  if (pending) throw new Error('Restored workflows must not have pending queue deliveries.');
}
