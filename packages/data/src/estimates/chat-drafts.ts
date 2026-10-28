import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  estimateDraftChatContentSchema, estimateDraftChatProposeSchema, estimateDraftChatStoredSchema,
  estimateDraftChatRequestSchema, estimateDraftChatViewSchema,
  chatPageContextSchema, estimateIdSchema,
  type AuthorizationContext, type EstimateDraftChatContent, type EstimateDraftChatInput,
  type EstimateDraftChatStored, type EstimateDraftChatView, type PermissionId,
} from "@salesmora/contracts";
import { calculateEstimateTotals } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";
import { materialAccess } from "../materials/store";
import {
  createEstimateDraftInTransaction, updateEstimateDraftInTransaction,
  readEstimateCreationSeedInTransaction, readEstimateEditorInTransaction,
  EstimateDraftConflictError, EstimateDraftValidationError, type EstimateEditorSeed,
} from "./drafts";
import { estimateChatStamp } from "./chat-evidence";
import {
  estimateProposalDigest as digest, estimateProposalIdentity as identityFor,
  estimateProposalAuthority as authority, estimateProposalTurn as activeTurn,
  resolveEstimateProposalId, supersedeEstimateProposals,
} from "./chat-proposals";

type Row = WorkspaceIdentity & {
  id: string; turnId: string; threadId: string;
  state: "pending" | "confirmed" | "cancelled" | "superseded";
  payload: EstimateDraftChatStored;
};
type Request = ReturnType<typeof estimateDraftChatRequestSchema.parse>;
const conflict = (message = "This proposal changed or expired. Request a fresh review.") => new EstimateDraftConflictError(message);
async function catalogStamp(trx: Knex.Transaction, workspaceId: string) {
  const rows = await trx("materialCatalog").where({ workspaceId }).orderBy("id")
    .select("id", trx.raw("xmin::text AS version"));
  return digest(rows);
}
function content(seed: EstimateEditorSeed): EstimateDraftChatContent {
  const saved = seed.estimate?.values;
  return {
    name: saved?.details.name ?? "", scope: saved?.scope ?? "",
    message: saved?.terms.message ?? seed.defaults.message, paymentTerms: saved?.terms.paymentTerms ?? "",
    termsNote: saved?.terms.termsNote ?? seed.defaults.termsNote,
    validUntil: saved?.terms.validUntil ?? seed.defaults.validUntil,
    discount: saved?.totals.discount ?? { type: "none" }, taxRate: saved?.totals.taxRate ?? seed.defaults.taxRate,
    deposit: saved?.terms.deposit ?? seed.defaults.deposit,
    items: saved?.items.map((item, index) => ({
      id: `saved-${index + 1}`, description: item.description, quantity: item.quantity,
      unit: item.unit ?? "", unitPrice: item.unitPrice, taxable: item.taxable, included: item.included,
      priceSource: { type: "saved" as const },
      ...(item.catalog ? { catalog: item.catalog } : {}),
    })) ?? [],
  };
}
function values(seed: EstimateEditorSeed, proposed: EstimateDraftChatContent, userId: string) {
  return {
    details: {
      ...(seed.estimate?.values.details ?? {
        recipientName: seed.parent?.contactName || seed.parent?.customer?.name || "",
        recipientEmail: seed.parent?.recipientEmail ?? "", serviceAddress: seed.parent?.serviceAddress ?? "",
        ownerId: userId,
      }),
      name: proposed.name,
    },
    scope: proposed.scope,
    items: proposed.items.map(line => ({
      description: line.description, quantity: line.quantity, unitPrice: line.unitPrice,
      unit: line.unit, taxable: line.taxable, included: line.included,
      ...(line.catalog ? { catalog: line.catalog } : {}),
    })),
    totals: { discount: proposed.discount, taxRate: proposed.taxRate },
    terms: {
      message: proposed.message, paymentTerms: proposed.paymentTerms, termsNote: proposed.termsNote,
      validUntil: proposed.validUntil, deposit: proposed.deposit,
    },
    internalNotes: seed.estimate?.values.internalNotes ?? "",
    paymentLink: seed.estimate?.values.paymentLink ?? "",
  };
}
export function estimateDraftContentComplete(proposed: EstimateDraftChatContent) {
  const calculation = calculateEstimateTotals(proposed);
  return !!proposed.name.trim() &&
    new Set(proposed.items.map(line => line.id)).size === proposed.items.length &&
    proposed.items.every(line => line.priceSource.type !== "missing" && !!line.unitPrice.trim() &&
      (line.priceSource.type !== "catalog" || !!line.priceSource.name.trim())) &&
    (!calculation.items.error || calculation.items.error === "empty-items") &&
    calculation.items.items.every(line => !Object.keys(line.errors).length) &&
    !Object.keys(calculation.errors).length;
}
function contentIdentity(value: EstimateDraftChatContent) {
  return digest({ ...value, items: value.items.map(line => ({
    id: line.id, description: line.description, quantity: line.quantity, unitPrice: line.unitPrice,
    taxable: line.taxable, included: line.included, unit: line.unit,
  })) });
}
function inputHash(payload: EstimateDraftChatStored) {
  const draft = payload.view.draft;
  return digest({
    actionType: draft.actionType, parent: draft.parent, proposed: draft.proposed,
    ...(draft.actionType === "estimate.update" ? { estimate: draft.estimate, current: draft.current } : {}),
    authorizationVersion: draft.authorizationVersion, createdAt: draft.createdAt, expiresAt: draft.expiresAt,
    values: payload.values, stamp: payload.stamp, catalogStamp: payload.catalogStamp,
  });
}
async function audit(trx: Knex.Transaction, row: Row, action: string) {
  await trx("chatEstimateDraftAudit").insert({
    id: randomUUID(), workspaceId: row.workspaceId, actorId: row.userId, proposalId: row.id,
    action, inputHash: row.payload.view.draft.inputHash,
  });
}
async function seedFor(trx: Knex.Transaction, context: AuthorizationContext, draft: EstimateDraftChatView["draft"]) {
  const seed = draft.actionType === "estimate.update"
    ? await readEstimateEditorInTransaction(trx, context, draft.estimate.id)
    : await readEstimateCreationSeedInTransaction(trx, context, draft.parent.type, draft.parent.id);
  if (!seed.parent?.href || seed.parent.id !== draft.parent.id ||
      !(draft.actionType === "estimate.create" ? seed.capabilities.create : seed.capabilities.update)) {
    throw new AuthorizationAccessError();
  }
  return seed;
}
async function parentVersion(trx: Knex.Transaction, context: AuthorizationContext, type: "lead" | "job", id: string) {
  const parent = await trx(type === "lead" ? "leads" : "jobs").where({ workspaceId: context.workspaceId, id }).first("version");
  if (!parent) throw new AuthorizationAccessError();
  return Number(parent.version);
}
async function noOpenEstimate(trx: Knex.Transaction, context: AuthorizationContext, draft: EstimateDraftChatView["draft"], today: string) {
  if (draft.actionType !== "estimate.create") return;
  const existing = await trx("estimates as e")
    .where({ "e.workspaceId": context.workspaceId, [draft.parent.type === "lead" ? "e.leadId" : "e.jobId"]: draft.parent.id })
    .whereNull("e.archivedAt")
    .whereNotExists(trx("estimates as newer").select(trx.raw("1"))
      .whereRaw(`newer."workspaceId" = e."workspaceId" AND newer."estimateNumber" = e."estimateNumber" AND newer.revision > e.revision`))
    .andWhere(query => query.where("e.status", "draft").orWhere(builder =>
      builder.whereIn("e.status", ["sent", "published"]).where("e.validUntil", ">=", today)))
    .first("e.id");
  if (existing) throw conflict("This parent already has an open Estimate. Review or update it instead of creating a duplicate.");
}
async function current(trx: Knex.Transaction, context: AuthorizationContext, row: Row) {
  const payload = estimateDraftChatStoredSchema.parse(row.payload);
  if (payload.view.draft.id !== row.id || payload.view.draft.inputHash !== inputHash(payload)) throw conflict();
  if (payload.view.draft.authorizationVersion !== await authority(trx, context)) throw new AuthorizationAccessError();
  const seed = await seedFor(trx, context, payload.view.draft);
  const draft = payload.view.draft;
  if (draft.parent.version !== await parentVersion(trx, context, draft.parent.type, draft.parent.id) ||
      (draft.actionType === "estimate.update" && seed.estimate?.version !== draft.estimate.expectedVersion) ||
      payload.stamp !== await estimateChatStamp(trx, context) ||
      payload.catalogStamp !== await catalogStamp(trx, context.workspaceId)) throw conflict();
  await noOpenEstimate(trx, context, draft, seed.today);
  return { payload, seed };
}
function requestMatches(draft: EstimateDraftChatView["draft"], request: Request) {
  return request.proposalId === draft.id && request.inputHash === draft.inputHash &&
    request.authorizationVersion === draft.authorizationVersion && request.actionType === draft.actionType &&
    request.parentType === draft.parent.type && request.parentId === draft.parent.id && request.parentVersion === draft.parent.version &&
    request.estimateId === (draft.actionType === "estimate.update" ? draft.estimate.id : null) &&
    request.expectedVersion === (draft.actionType === "estimate.update" ? draft.estimate.expectedVersion : null);
}
async function insert(
  trx: Knex.Transaction, context: AuthorizationContext, turn: { id: string; threadId: string },
  seed: EstimateEditorSeed, proposed: EstimateDraftChatContent,
): Promise<EstimateDraftChatView> {
  const now = new Date();
  if (!seed.parent?.href) throw new AuthorizationAccessError();
  const baseline = content(seed);
  const id = randomUUID(), token = await authority(trx, context);
  const parent = { type: seed.parent.type, id: seed.parent.id, name: seed.parent.name, number: seed.parent.number,
    version: await parentVersion(trx, context, seed.parent.type, seed.parent.id) };
  const draft = {
    id, inputHash: "0".repeat(64), authorizationVersion: token, parent, proposed,
    createdAt: now.toISOString(), expiresAt: new Date(now.getTime() + 900000).toISOString(), state: "pending" as const,
    ...(seed.estimate ? {
      actionType: "estimate.update" as const, current: baseline,
      estimate: { id: seed.estimate.id, number: seed.estimate.number, revision: seed.estimate.revision, expectedVersion: seed.estimate.version },
    } : { actionType: "estimate.create" as const }),
  };
  await noOpenEstimate(trx, context, draft, seed.today);
  if (seed.estimate && contentIdentity(baseline) === contentIdentity(proposed)) {
    throw conflict("There are no Draft changes to review.");
  }
  const view: EstimateDraftChatView = {
    draft, context: {
      proposalId: id, inputHash: draft.inputHash, authorizationVersion: token,
      parent: { type: parent.type, id: parent.id, version: parent.version },
      estimate: seed.estimate ? { id: seed.estimate.id, version: seed.estimate.version, status: "draft", archived: false } : null,
    },
    grants: { read: true, parentAccess: true, create: seed.capabilities.create, update: seed.capabilities.update },
    canConfirm: estimateDraftContentComplete(proposed), receipt: null,
  };
  const payload: EstimateDraftChatStored = {
    view, values: values(seed, proposed, context.userId), stamp: await estimateChatStamp(trx, context),
    catalogStamp: await catalogStamp(trx, context.workspaceId),
  };
  draft.inputHash = inputHash(payload);
  view.context.inputHash = draft.inputHash;
  const parsed = estimateDraftChatStoredSchema.safeParse(payload);
  if (!parsed.success) throw new EstimateDraftValidationError("This complete proposal is too large or invalid. Use the manual editor.");
  await supersedeEstimateProposals(trx, context, turn);
  const [row] = await trx("chatEstimateDrafts").insert({
    ...identityFor(context), id, turnId: turn.id, threadId: turn.threadId, payload: JSON.stringify(parsed.data),
    createdAt: trx.raw("clock_timestamp()"),
  }).returning("*");
  await audit(trx, row, "proposed");
  await trx("chatTurns").where({ id: turn.id }).update({ estimateStamp: payload.stamp });
  return estimateDraftChatViewSchema.parse(view);
}

export async function estimateDraftChatEvidenceAllowed(trx: Knex.Transaction, context: AuthorizationContext, turnId: string) {
  const row: Row | undefined = await trx("chatEstimateDrafts").where({ ...identityFor(context), turnId })
    .orderBy("createdAt", "desc").first();
  if (!row) return true;
  const payload = estimateDraftChatStoredSchema.parse(row.payload);
  try {
    return payload.view.draft.authorizationVersion === await authority(trx, context) &&
      payload.catalogStamp === await catalogStamp(trx, context.workspaceId) &&
      (row.state !== "pending" || Date.parse(payload.view.draft.expiresAt) > Date.now());
  } catch (error) {
    if (error instanceof AuthorizationAccessError) return false;
    throw error;
  }
}

function userPrice(price: string, quote: string | null, message: string, included: boolean) {
  if (included && /^\d+(?:\.\d{1,2})?$/.test(price) && Number(price) === 0 &&
      quote && /^(?:included at no charge|no charge|free)$/i.test(quote)) {
    return (message.match(/\b(?:included at no charge|no charge|free)\b/gi) ?? [])
      .some(value => value.toLowerCase() === quote.toLowerCase());
  }
  if (!quote || !/^\$?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(quote) ||
      !/^\d+(?:\.\d{1,2})?$/.test(price)) return false;
  const tokens: string[] = message.match(/(?<![\w.,$-])\$?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?(?!\w|[.,]\d)/g) ?? [];
  return tokens.includes(quote) && Number(quote.replace(/[$,]/g, "")) === Number(price);
}
async function proposedContent(
  trx: Knex.Transaction, context: AuthorizationContext, input: EstimateDraftChatInput, seed: EstimateEditorSeed, message: string,
) {
  const baseline = content(seed);
  const proposed: EstimateDraftChatContent = { ...baseline };
  for (const field of ["name", "scope", "message", "paymentTerms", "termsNote", "validUntil", "taxRate"] as const) {
    if (input.changes[field] !== null) proposed[field] = input.changes[field];
  }
  for (const field of ["discount", "deposit"] as const) if (input.changes[field] !== null) proposed[field] = input.changes[field];
  if (input.changes.items !== null) {
    proposed.items = [];
    for (const item of input.changes.items) {
      const saved = item.savedLineId ? baseline.items.find(line => line.id === item.savedLineId) : undefined;
      if (item.savedLineId && !saved) throw new EstimateDraftValidationError("A saved line reference is invalid.");
      const line: EstimateDraftChatContent["items"][number] = {
        id: saved?.id ?? randomUUID(), description: item.description, quantity: item.quantity, unit: item.unit,
        unitPrice: "", taxable: item.taxable, included: item.included, priceSource: { type: "missing" },
      };
      if (item.priceSource === "saved" && saved && saved.unitPrice === item.unitPrice && saved.included === item.included) {
        line.unitPrice = saved.unitPrice; line.priceSource = { type: "saved" };
        if (saved.catalog) line.catalog = saved.catalog;
      } else if (item.priceSource === "user" && item.unitPrice !== null && userPrice(item.unitPrice, item.priceQuote, message, item.included)) {
        line.unitPrice = item.unitPrice; line.priceSource = { type: "user" };
      } else if (item.priceSource === "catalog") {
        const access = materialAccess(context);
        if (!access.read || !access.viewPrices) throw new AuthorizationAccessError();
        const ref = item.catalogRef;
        if (!ref) throw new EstimateDraftValidationError("Name an exact catalog item or leave the price blank.");
        const matches = await trx("materialCatalog").where({ workspaceId: context.workspaceId, status: "active" })
          .whereNull("archivedAt").andWhere(query => query.whereRaw("lower(name) = lower(?)", [ref]).orWhereRaw("lower(sku) = lower(?)", [ref]))
          .limit(2).select("id", "name", "priceCents", "unit", "sku");
        if (matches.length !== 1) throw new EstimateDraftValidationError("Choose one exact accessible catalog name or SKU.");
        if (matches[0].priceCents !== null) {
          line.unitPrice = (Number(matches[0].priceCents) / 100).toFixed(2);
          line.priceSource = { type: "catalog", name: matches[0].name };
        }
        line.unit = matches[0].unit;
        line.catalog = { id: matches[0].id, name: matches[0].name, unit: matches[0].unit, sku: matches[0].sku };
      }
      if (item.included && line.priceSource.type === "missing") line.included = false;
      proposed.items.push(line);
    }
  }
  const parsed = estimateDraftChatContentSchema.safeParse(proposed);
  if (!parsed.success) throw new EstimateDraftValidationError("The proposed Draft fields or saved line references are invalid. Review them in the manual editor.");
  return parsed.data;
}
async function resolveSeed(trx: Knex.Transaction, context: AuthorizationContext, input: EstimateDraftChatInput) {
  if (input.operation === "update") {
    if (input.parentType !== null || input.parentRef !== null) throw new EstimateDraftValidationError("Use one exact Estimate target for a Draft update.");
    const id = await resolveEstimateProposalId(trx, context.workspaceId, input.estimateRef);
    const seed = await readEstimateEditorInTransaction(trx, context, id);
    if (!seed.capabilities.update || !seed.parent?.href) throw new AuthorizationAccessError();
    return seed;
  }
  if (input.estimateRef !== null) throw new EstimateDraftValidationError("Use one Lead or Job parent for a new Draft, not an Estimate target.");
  const type = input.parentType, ref = input.parentRef;
  if (!type || !ref || (!/^(?:LD|J)-\d{4,10}$/i.test(ref) && !estimateIdSchema.safeParse(ref).success)) {
    throw new EstimateDraftValidationError("Provide one exact Lead or Job number or ID.");
  }
  if (/^(LD|J)-/i.test(ref) &&
      (!ref.toUpperCase().startsWith(type === "lead" ? "LD-" : "J-") ||
       Number(ref.slice(ref.indexOf("-") + 1)) <= 0 || Number(ref.slice(ref.indexOf("-") + 1)) > 2147483647)) {
    throw new EstimateDraftValidationError("The exact parent number must match its Lead or Job type.");
  }
  const query = trx(type === "lead" ? "leads" : "jobs").where({ workspaceId: context.workspaceId });
  if (/^(LD|J)-/i.test(ref)) query.where(type === "lead" ? "leadNumber" : "jobNumber", Number(ref.slice(ref.indexOf("-") + 1)));
  else query.where("id", ref);
  const row = await query.first("id");
  if (!row) throw new AuthorizationAccessError();
  return readEstimateCreationSeedInTransaction(trx, context, type, row.id);
}
export async function proposeEstimateChatDraft(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], turnId: string, raw: unknown, signal: AbortSignal,
) {
  const { request } = estimateDraftChatProposeSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    signal.throwIfAborted();
    await authority(trx, context);
    const turn = await activeTurn(trx, context, turnId);
    const pageContext = chatPageContextSchema.parse(turn.pageContext);
    const message = await trx("chatMessages").where({ turnId, role: "user" }).first("text");
    if (!message) throw new AuthorizationAccessError();
    if (request.operation === "update" && !request.estimateRef && ["estimate.detail", "estimate.editor"].includes(turn.surfaceKey)) {
      request.estimateRef = pageContext.recordRefs?.find(ref => ref.type === "estimate")?.id ?? null;
    }
    if (request.operation === "create" && !request.parentRef && request.parentType !== "job" && turn.surfaceKey === "lead.detail") {
      request.parentType = "lead";
      request.parentRef = pageContext.recordRefs?.find(ref => ref.type === "lead")?.id ?? null;
    }
    const seed = await resolveSeed(trx, context, request);
    const proposed = await proposedContent(trx, context, request, seed, message.text);
    const result = await insert(trx, context, turn, seed, proposed);
    signal.throwIfAborted();
    return result;
  });
}

export async function visibleEstimateChatDraft(trx: Knex.Transaction, context: AuthorizationContext, turnId: string) {
  const row: Row | undefined = await trx("chatEstimateDrafts").where({ ...identityFor(context), turnId }).orderBy("createdAt", "desc").orderBy("id", "desc").first();
  if (!row) return undefined;
  try {
    const parsed = estimateDraftChatStoredSchema.parse(row.payload);
    if (row.state === "confirmed") {
      if (parsed.view.draft.authorizationVersion !== await authority(trx, context)) return undefined;
      if (parsed.resultStamp !== await estimateChatStamp(trx, context) || parsed.view.draft.inputHash !== inputHash(parsed)) return undefined;
      const receipt = parsed.view.receipt;
      if (!receipt) throw conflict();
      const seed = await readEstimateEditorInTransaction(trx, context, receipt.id);
      if (!seed.parent?.href || seed.estimate?.version !== receipt.version) return undefined;
      return estimateDraftChatViewSchema.parse({ ...parsed.view, draft: { ...parsed.view.draft, state: "confirmed" } });
    }
    const { payload } = await current(trx, context, row);
    const state = row.state === "pending" && Date.parse(payload.view.draft.expiresAt) <= Date.now() ? "expired" : row.state;
    return estimateDraftChatViewSchema.parse({ ...payload.view, draft: { ...payload.view.draft, state } });
  } catch (error) {
    if (error instanceof AuthorizationAccessError || error instanceof EstimateDraftConflictError) return undefined;
    throw error;
  }
}

export async function operateEstimateChatDraft(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], request: Request, decision: "confirm" | "cancel" | "editor" | "open",
) {
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const row: Row | undefined = await trx("chatEstimateDrafts").where({ ...identity, id: request.proposalId }).forUpdate().first();
    if (!row) throw new AuthorizationAccessError();
    await activeTurn(trx, context, row.turnId, true);
    if (!requestMatches(row.payload.view.draft, request)) throw conflict();
    if (row.state === "confirmed" || row.state === "cancelled") {
      if (decision !== (row.state === "confirmed" ? "confirm" : "cancel") && !(decision === "open" && row.state === "confirmed")) throw conflict();
      const view = await visibleEstimateChatDraft(trx, context, row.turnId);
      if (!view || view.draft.id !== row.id) throw new AuthorizationAccessError();
      return { view, ...(decision === "open" && view.receipt
        ? { href: `/estimates/${view.receipt.id}?workspace=${context.workspaceId}` } : {}) };
    }
    if (decision === "open") throw conflict();
    if (row.state !== "pending") throw conflict();
    const { payload } = await current(trx, context, row);
    if (Date.parse(payload.view.draft.expiresAt) <= Date.now()) throw conflict();
    if (decision === "editor") return {
      view: payload.view,
      href: `/estimates/${payload.view.draft.actionType === "estimate.update" ? payload.view.draft.estimate.id : "new"}?workspace=${context.workspaceId}&proposal=${row.id}`,
    };
    if (decision === "confirm") {
      if (!estimateDraftContentComplete(payload.view.draft.proposed)) throw new EstimateDraftValidationError("Complete missing prices and invalid fields in the editor, then review a refreshed proposal.");
      const receipt = payload.view.draft.actionType === "estimate.create"
        ? await createEstimateDraftInTransaction(trx, context, { submissionId: row.id, parent: payload.view.draft.parent, values: payload.values, source: "assistant-confirmed" })
        : await updateEstimateDraftInTransaction(trx, context, {
          workspaceId: context.workspaceId, estimateId: payload.view.draft.estimate.id,
          expectedVersion: payload.view.draft.estimate.expectedVersion, values: payload.values,
        }, "assistant-confirmed");
      payload.view.receipt = receipt;
      payload.resultStamp = await estimateChatStamp(trx, context);
    }
    payload.view.draft.state = decision === "confirm" ? "confirmed" : "cancelled";
    await trx("chatEstimateDrafts").where({ id: row.id }).update({
      state: payload.view.draft.state, payload: JSON.stringify(payload), resolvedAt: trx.fn.now(),
    });
    await audit(trx, row, decision === "confirm" ? "confirmed" : "cancelled");
    return { view: payload.view };
  });
}

export async function readEstimateChatDraftEditor(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], id: string,
) {
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const row: Row | undefined = await trx("chatEstimateDrafts").where({ ...identity, id }).first();
    if (!row || !["pending", "confirmed"].includes(row.state)) throw new AuthorizationAccessError();
    await activeTurn(trx, context, row.turnId, true);
    if (row.state === "confirmed") {
      const view = await visibleEstimateChatDraft(trx, context, row.turnId);
      if (!view?.receipt || view.draft.id !== row.id) throw new AuthorizationAccessError();
      const seed = await readEstimateEditorInTransaction(trx, context, view.receipt.id);
      return { view, seed, threadId: row.threadId };
    }
    const { payload, seed } = await current(trx, context, row);
    if (Date.parse(payload.view.draft.expiresAt) <= Date.now()) throw conflict();
    return { view: payload.view, seed, threadId: row.threadId };
  });
}
export async function refreshEstimateChatDraft(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], request: Request, rawContent: unknown,
) {
  const proposed = estimateDraftChatContentSchema.parse(rawContent);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const row: Row | undefined = await trx("chatEstimateDrafts").where({ ...identity, id: request.proposalId }).forUpdate().first();
    if (!row || row.state !== "pending") throw new AuthorizationAccessError();
    if (!requestMatches(row.payload.view.draft, request)) throw conflict();
    const turn = await activeTurn(trx, context, row.turnId, true);
    const { payload, seed } = await current(trx, context, row);
    if (Date.parse(payload.view.draft.expiresAt) <= Date.now()) throw conflict();
    // Browser-edited prices are explicit user input; source labels are never trusted from the request.
    for (const line of proposed.items) {
      const previous = payload.view.draft.proposed.items.find(item => item.id === line.id);
      line.priceSource = previous && previous.unitPrice === line.unitPrice && previous.included === line.included
        ? previous.priceSource : { type: line.unitPrice.trim() ? "user" : "missing" };
      delete line.catalog;
      if (previous?.catalog && previous.unitPrice === line.unitPrice && previous.included === line.included) line.catalog = previous.catalog;
    }
    const view = await insert(trx, context, turn, seed, proposed);
    return { view };
  });
}
