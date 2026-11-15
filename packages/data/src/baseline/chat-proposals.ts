import type { Knex } from 'knex';

const families = `'action','estimateDraft','estimateSharing','estimateDecision','estimateDraftAction',
  'estimateVoid','estimateArchive','estimateDraftDelete','estimateConversion','calendar',
  'captureSetup','captureSource','customer','workOrder','material'`;
const pendingFamilies = `'estimateDraft','estimateSharing','estimateDecision','estimateDraftAction',
  'estimateVoid','estimateArchive','estimateDraftDelete','estimateConversion','calendar','captureSetup','captureSource'`;
const leadPayloadFields = ['stagePayload', 'updatePayload', 'assignmentPayload', 'notePayload', 'archivePayload', 'exportPayload', 'deletePayload'];
const leadRules = [
  ['lead.create', 'leads.create', null], ['lead.stage', 'leads.stage.update', 'stagePayload'],
  ['lead.update', 'leads.update', 'updatePayload'], ['lead.assign', 'leads.assign', 'assignmentPayload'],
  ['lead.note', 'leads.read', 'notePayload'], ['lead.archive', 'leads.archive', 'archivePayload'],
  ['lead.export', 'leads.export', 'exportPayload'], ['lead.delete', 'leads.delete', 'deletePayload'],
] as const;
const historicalSources = `'chatEstimateDraftAudit','chatEstimateShareAudit','chatEstimateDecisionAudit',
  'chatEstimateDraftActionAudit','chatEstimateVoidAudit','chatEstimateArchiveAudit',
  'chatEstimateDraftDeleteAudit','chatEstimateConversionAudit','chatCalendarProposalAudit',
  'chatCaptureSetupAudit','chatCaptureSourceAudit'`;

export async function createChatProposalTables(db: Knex) {
  await db.schema.createTable('chatProposals', table => {
    table.text('family').notNullable(); table.uuid('id').notNullable(); table.primary(['family', 'id']);
    table.uuid('workspaceId').notNullable(); table.text('userId').notNullable();
    table.uuid('threadId').notNullable(); table.uuid('turnId').notNullable();
    table.foreign(['threadId', 'workspaceId', 'userId']).references(['id', 'workspaceId', 'userId'])
      .inTable('chatThreads').onDelete('CASCADE');
    table.foreign(['turnId', 'threadId', 'workspaceId', 'userId']).references(['id', 'threadId', 'workspaceId', 'userId'])
      .inTable('chatTurns').onDelete('CASCADE');
    table.integer('payloadVersion').notNullable();
    table.text('state').notNullable(); table.uuid('requestId');
    table.string('inputHash', 64).notNullable(); table.jsonb('payload').notNullable();
    table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable(); table.timestamp('resolvedAt', { useTz: true });
    table.check(`family IN (${families})`, [], 'chat_proposal_family');
    table.check(`state IN ('pending','confirmed','cancelled','superseded')`, [], 'chat_proposal_state');
    table.check('"payloadVersion" > 0', [], 'chat_proposal_payload_version');
    table.check(`jsonb_typeof(payload) = 'object'`, [], 'chat_proposal_payload_object');
    table.check(`"inputHash" ~ '^[a-f0-9]{64}$'`, [], 'chat_proposal_input_hash');
    table.check(`(family IN ('captureSetup','captureSource')) = ("requestId" IS NOT NULL)`, [], 'chat_proposal_request_identity');
  });
  await db.raw(`CREATE UNIQUE INDEX chat_proposal_one_per_turn ON "chatProposals" (family,"turnId")
    WHERE family IN ('action','customer')`);
  await db.raw(`CREATE UNIQUE INDEX chat_proposal_work_order_material_turn ON "chatProposals" ("turnId")
    WHERE family IN ('workOrder','material')`);
  await db.raw(`CREATE UNIQUE INDEX chat_proposal_work_order_material_id ON "chatProposals" (id)
    WHERE family IN ('workOrder','material')`);
  await db.raw(`CREATE UNIQUE INDEX chat_proposal_pending_family ON "chatProposals" ("workspaceId","userId","threadId",family)
    WHERE state='pending' AND family IN (${pendingFamilies})`);
  await db.raw(`CREATE UNIQUE INDEX chat_proposal_capture_request ON "chatProposals" ("workspaceId","userId",family,"requestId")
    WHERE family IN ('captureSetup','captureSource')`);
  await db.raw(`CREATE INDEX chat_proposal_owned_history ON "chatProposals"
    ("workspaceId","userId","turnId",family,"createdAt" DESC,id DESC)`);
  await db.raw(`CREATE INDEX chat_proposal_pending_lookup ON "chatProposals" ("workspaceId","userId","threadId",family,id)
    WHERE state='pending'`);
  const leadBody = leadRules.map(([action, capability, field]) => `(
    payload->>'actionType'='${action}' AND payload->>'capability'='${capability}'
    AND ${field ? `jsonb_typeof(payload->'${field}')='object'` : `jsonb_typeof(payload->'lead')='object'`}
    AND ${leadPayloadFields.filter(key => key !== field).map(key =>
      `(payload->'${key}' IS NULL OR payload->'${key}'='null'::jsonb)`).join(' AND ')}
  )`).join(' OR ');
  await db.raw(`ALTER TABLE "chatProposals" ADD CONSTRAINT chat_proposal_lead_body CHECK (
    family <> 'action' OR (
      jsonb_exists(payload,'actionType') AND jsonb_exists(payload,'capability')
      AND jsonb_exists(payload,'lead') AND jsonb_exists(payload,'accessHash')
      AND payload->>'accessHash' ~ '^[a-f0-9]{64}$'
      AND (${leadBody})
    ) IS TRUE)`);
  await db.schema.createTable('chatProposalAudit', table => {
    table.uuid('id').primary(); table.text('family').notNullable(); table.uuid('proposalId').notNullable();
    table.uuid('workspaceId').notNullable(); table.text('actorId');
    table.text('action').notNullable(); table.string('inputHash', 64).notNullable();
    table.jsonb('details').notNullable(); table.timestamp('createdAt', { useTz: true }).notNullable();
    table.text('sourceTable'); table.uuid('sourceId');
    table.check(`family IN (${families})`, [], 'chat_proposal_audit_family');
    table.check(`"inputHash" ~ '^[a-f0-9]{64}$'`, [], 'chat_proposal_audit_hash');
    table.check(`jsonb_typeof(details)='object' AND length(action)>0`, [], 'chat_proposal_audit_details');
    table.check(`("sourceTable" IS NULL) = ("sourceId" IS NULL)`, [], 'chat_proposal_audit_source_pair');
    table.unique(['sourceTable', 'sourceId']);
    table.index(['workspaceId', 'family', 'proposalId']);
  });
  await db.raw(`CREATE FUNCTION chat_proposal_audit_immutable() RETURNS trigger
    LANGUAGE plpgsql SET search_path = public, pg_temp AS $$ BEGIN
    IF TG_OP <> 'TRUNCATE' AND OLD."sourceTable" IN (${historicalSources}) THEN
      IF TG_OP = 'DELETE' AND NOT EXISTS (SELECT 1 FROM public.workspaces WHERE id=OLD."workspaceId") THEN RETURN OLD; END IF;
      IF TG_OP = 'UPDATE' AND OLD."actorId" IS NOT NULL AND NEW."actorId" IS NULL
        AND to_jsonb(OLD)-'actorId'=to_jsonb(NEW)-'actorId'
        AND NOT EXISTS (SELECT 1 FROM public.users WHERE id=OLD."actorId") THEN RETURN NEW; END IF;
    END IF;
    RAISE EXCEPTION 'Canonical proposal lifecycle audit is immutable' USING ERRCODE='23514';
  END $$`);
  await db.raw(`CREATE TRIGGER chat_proposal_audit_immutable BEFORE UPDATE OR DELETE ON "chatProposalAudit"
    FOR EACH ROW EXECUTE FUNCTION chat_proposal_audit_immutable()`);
  await db.raw(`CREATE TRIGGER chat_proposal_audit_no_truncate BEFORE TRUNCATE ON "chatProposalAudit"
    FOR EACH STATEMENT EXECUTE FUNCTION chat_proposal_audit_immutable()`);
  await db.raw(`CREATE FUNCTION chat_historical_audit_parent_erasure() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$ BEGIN
    IF TG_TABLE_NAME='users' THEN
      UPDATE public."chatProposalAudit" SET "actorId"=NULL
        WHERE "actorId"=OLD.id AND "sourceTable" IN (${historicalSources});
    ELSIF TG_TABLE_NAME='workspaces' THEN
      DELETE FROM public."chatProposalAudit" WHERE "workspaceId"=OLD.id AND "sourceTable" IN (${historicalSources});
    ELSE RAISE EXCEPTION 'Unsupported historical audit erasure parent'; END IF;
    RETURN OLD;
  END $$`);
  await db.raw('REVOKE ALL ON FUNCTION chat_historical_audit_parent_erasure() FROM PUBLIC');
  await db.raw(`CREATE TRIGGER chat_historical_audit_actor_erasure AFTER DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION chat_historical_audit_parent_erasure()`);
  await db.raw(`CREATE TRIGGER chat_historical_audit_workspace_erasure AFTER DELETE ON workspaces
    FOR EACH ROW EXECUTE FUNCTION chat_historical_audit_parent_erasure()`);
  await db.raw(`CREATE FUNCTION chat_historical_audit_import_owner() RETURNS trigger
    LANGUAGE plpgsql SET search_path = public, pg_temp AS $$ BEGIN
    IF NEW."sourceTable" IS NOT NULL AND current_user <> (
      SELECT pg_get_userbyid(relowner) FROM pg_class WHERE oid='public."chatProposalAudit"'::regclass
    ) THEN RAISE EXCEPTION 'Historical audit provenance requires the schema owner' USING ERRCODE='42501'; END IF;
    RETURN NEW;
  END $$`);
  await db.raw(`CREATE TRIGGER chat_historical_audit_import_owner BEFORE INSERT ON "chatProposalAudit"
    FOR EACH ROW EXECUTE FUNCTION chat_historical_audit_import_owner()`);
  await db.schema.createTable('chatProposalStorage', table => {
    table.integer('id').primary(); table.text('store').notNullable(); table.integer('contractVersion').notNullable();
    table.timestamp('activatedAt', { useTz: true });
    table.check('id=1 AND "contractVersion">0');
    table.check(`(store='legacy' AND "activatedAt" IS NULL) OR (store='canonical' AND "activatedAt" IS NOT NULL)`);
  });
  await db('chatProposalStorage').insert({ id: 1, store: 'canonical', contractVersion: 1, activatedAt: db.fn.now() });
  await db.raw(`CREATE FUNCTION chat_proposal_storage_monotonic() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF TG_OP='UPDATE' AND OLD.store='legacy' AND NEW.store='canonical'
      AND OLD.id=NEW.id AND OLD."contractVersion"=NEW."contractVersion" THEN RETURN NEW; END IF;
    RAISE EXCEPTION 'Proposal storage authority cannot be removed or downgraded' USING ERRCODE='23514';
  END $$`);
  await db.raw(`CREATE TRIGGER chat_proposal_storage_monotonic BEFORE INSERT OR UPDATE OR DELETE ON "chatProposalStorage"
    FOR EACH ROW EXECUTE FUNCTION chat_proposal_storage_monotonic()`);
  await db.raw(`CREATE TRIGGER chat_proposal_storage_no_truncate BEFORE TRUNCATE ON "chatProposalStorage"
    FOR EACH STATEMENT EXECUTE FUNCTION chat_proposal_storage_monotonic()`);
}
