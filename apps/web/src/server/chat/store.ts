import { customerChatEvidenceAllowed } from "@salesmora/data";
import { visibleCustomerResult, customerPageReference } from "./customers";
import { visibleWorkOrderResult, workOrderPageReference } from "./work-orders-actions";
import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type { Knex } from "@salesmora/data";
import type {
  AuthorizationContext,
  ChatRunState,
  ChatTurnRequest,
  ChatPageContext,
  ChatLeadEvidence,
  ChatSurfaceKey,
  HelpSource,
} from "@salesmora/contracts";
import { authorize } from "@salesmora/domain";
import {
  leadHistoryResultSchema,
  leadDetailsResultSchema,
  mergeChatLeadEvidence,
  leadSearchEvidenceSchema,
  leadSearchSnapshotSchema,
} from "@salesmora/contracts";
import { leadSearchEvidenceAllowed } from "@salesmora/data";
import { helpSourceSchema } from "@salesmora/contracts";
import {
  resolveLeadChatContext,
  leadChatEvidenceAllowed,
} from "@salesmora/data";
import {
  chatPageContextSchema,
  chatLeadEvidenceSchema,
} from "@salesmora/contracts";
import { readHelpArticle } from "@salesmora/data";
import { chatStoreData as copy } from "./store.data";
import { AuthorizationAccessError } from "@salesmora/data";
import { authorizedWorkspace } from "../authorization/permissions";
import { database } from "../workspaces/store";
import { chatAccessHash } from "./access-hash";
import { visibleDeletionReceipt } from "./delete-actions";
import { visibleTurnDraft } from "./actions";
export { chatAccessHash } from "./access-hash";

export class ChatConflictError extends Error {}
export class ChatLimitError extends Error {}
export class ChatCancelledError extends Error {}
export interface ChatIdentity {
  userId: string;
  workspaceId: string;
}
interface Turn extends ChatIdentity {
  id: string;
  threadId: string;
  clientTurnId: string;
  state: ChatRunState;
  customerStamp?: string | null;
  customerResult?: import("@salesmora/contracts").CustomerChatResult;
  workOrderResult?: import("@salesmora/contracts").WorkOrderChatResult;
  surfaceKey: ChatSurfaceKey;
  pageContext: ChatPageContext;
  leadEvidence: ChatLeadEvidence;
  leadHistoryResult: unknown;
  leadDetailsResult: unknown;
  leadSearchSnapshot: unknown;
  leadSearchEvidence: string[];
  requestHash: string;
  accessHash: string | null;
  sources: HelpSource[];
  leaseUntil: Date;
  createdAt: Date;
}
export interface StoredTurn extends Turn {
  messageId: string;
}
const active = ["accepted", "running"];
const leaseMs = 120_000;
function check(context: AuthorizationContext) {
  if (!authorize(context, { permission: "assistant.use" }).allowed)
    throw new AuthorizationAccessError();
}
async function evidenceAllowed(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  turn: Pick<
    Turn,
    | "accessHash"
    | "sources"
    | "leadEvidence"
    | "leadSearchEvidence"
    | "customerStamp"
  >,
) {
  if (!(await customerChatEvidenceAllowed(trx, context, turn.customerStamp)))
    return false;
  if (
    turn.accessHash !== chatAccessHash(context) ||
    !(await leadChatEvidenceAllowed(trx, context, turn.leadEvidence))
  )
    return false;
  if (!(await leadSearchEvidenceAllowed(trx, context, turn.leadSearchEvidence)))
    return false;
  const parsed = helpSourceSchema.array().max(3).safeParse(turn.sources);
  if (!parsed.success) return false;
  for (const source of parsed.data) {
    const article = await readHelpArticle(
      trx,
      context,
      source.slug,
      source.version,
    );
    if (
      !article ||
      !article.sections.some((section) => section.anchor === source.anchor)
    )
      return false;
  }
  return true;
}
async function recover(trx: Knex.Transaction, identity: ChatIdentity) {
  await trx("chatTurns")
    .where(identity)
    .whereIn("state", active)
    .where("leaseUntil", "<=", trx.fn.now())
    .update({ state: "interrupted", finishedAt: trx.fn.now() });
}
async function ownedThread(
  trx: Knex.Transaction,
  identity: ChatIdentity,
  id: string,
) {
  if (
    !(await trx("chatThreads")
      .where({ ...identity, id })
      .first("id"))
  )
    throw new AuthorizationAccessError();
}
async function stored(trx: Knex.Transaction, turn: Turn): Promise<StoredTurn> {
  const message = await trx("chatMessages")
    .where({ turnId: turn.id, role: "assistant" })
    .first("id");
  return { ...turn, messageId: message.id as string };
}
/** Accept before generation. Workspace lock serializes rate/concurrency/idempotency checks. */
export async function acceptTurn(
  identity: ChatIdentity,
  request: ChatTurnRequest,
) {
  return authorizedWorkspace(
    identity.userId,
    identity.workspaceId,
    true,
    async (trx, context) => {
      check(context);
      if (request.workspaceId !== identity.workspaceId)
        throw new AuthorizationAccessError();
      if (request.threadId) await ownedThread(trx, identity, request.threadId);
      await recover(trx, identity);
      const requestHash = createHash("sha256")
        .update(JSON.stringify(request))
        .digest("hex");
      const previous: Turn | undefined = await trx("chatTurns")
        .where({ ...identity, clientTurnId: request.clientTurnId })
        .first();
      if (previous) {
        if (previous.requestHash !== requestHash) throw new ChatConflictError();
        return { turn: await stored(trx, previous), replay: true };
      }
      if (
        await trx("chatTurns")
          .where(identity)
          .whereIn("state", active)
          .first("id")
      )
        throw new ChatConflictError();
      const count = await trx("chatTurns")
        .where(identity)
        .where("createdAt", ">", new Date(Date.now() - 60_000))
        .count<{ count: string }[]>("* as count");
      if (Number(count[0].count) >= 10) throw new ChatLimitError();
      const threadId = request.threadId ?? randomUUID();
      if (!request.threadId)
        await trx("chatThreads").insert({ ...identity, id: threadId });
      const pageContext = chatPageContextSchema.parse({
        ...(request.recordRefs ? { recordRefs: request.recordRefs } : {}),
        ...(request.uiState ? { uiState: request.uiState } : {}),
        ...(request.customerFilters
          ? { customerFilters: request.customerFilters }
          : {}),
      });
      const resolved = await resolveLeadChatContext(trx, context, request);
      const [turn] = await trx("chatTurns")
        .insert({
          ...identity,
          id: randomUUID(),
          threadId,
          clientTurnId: request.clientTurnId,
          requestHash,
          pageContext: JSON.stringify(pageContext),
          leadEvidence: JSON.stringify(resolved.evidence),
          accessHash: chatAccessHash(context),
          surfaceKey: request.surfaceKey,
          state: "accepted",
          leaseUntil: new Date(Date.now() + leaseMs),
        })
        .returning<Turn[]>("*");
      const messageId = randomUUID();
      await trx("chatMessages").insert([
        {
          id: randomUUID(),
          turnId: turn.id,
          role: "user",
          text: request.message,
        },
        { id: messageId, turnId: turn.id, role: "assistant", text: "" },
      ]);
      await trx("chatThreads")
        .where({ id: threadId })
        .update({ updatedAt: trx.fn.now() });
      return { turn: { ...turn, messageId }, replay: false };
    },
  );
}

/** Persist each bounded delta before release; revalidate permission and cancellation every time. */
export async function appendDelta(
  identity: ChatIdentity,
  id: string,
  delta: string,
) {
  if (!delta || delta.length > 8000) throw new ChatLimitError();
  return authorizedWorkspace(
    identity.userId,
    identity.workspaceId,
    true,
    async (trx, context) => {
      check(context);
      const turn: Turn | undefined = await trx("chatTurns")
        .where({ ...identity, id })
        .forUpdate()
        .first();
      if (!turn || !(await evidenceAllowed(trx, context, turn)))
        throw new AuthorizationAccessError();
      if (!active.includes(turn.state)) throw new ChatCancelledError();
      if (new Date(turn.leaseUntil).getTime() <= Date.now())
        throw new ChatCancelledError();
      const message = await trx("chatMessages")
        .where({ turnId: id, role: "assistant" })
        .first();
      if (message.text.length + delta.length > 32000)
        throw new ChatLimitError();
      await trx("chatMessages")
        .where({ id: message.id })
        .update({ text: message.text + delta });
      await trx("chatTurns").where({ id }).update({ state: "running" });
    },
  );
}

/** Cleanup may mark its own accepted run terminal after revocation; it never returns transcript data. */
export async function finishTurn(
  identity: ChatIdentity,
  id: string,
  state: "completed" | "failed" | "cancelled",
) {
  if (state === "completed") {
    return authorizedWorkspace(
      identity.userId,
      identity.workspaceId,
      true,
      async (trx, context) => {
        check(context);
        const current = await trx("chatTurns")
          .where({ ...identity, id })
          .first();
        if (!current || !(await evidenceAllowed(trx, context, current)))
          throw new AuthorizationAccessError();
        const updated = await trx("chatTurns")
          .where({ ...identity, id })
          .whereIn("state", active)
          .update({ state, finishedAt: trx.fn.now() });
        if (!updated) throw new ChatCancelledError();
      },
    );
  }
  await database()("chatTurns")
    .where({ ...identity, id })
    .whereIn("state", active)
    .update({ state, finishedAt: database().fn.now() });
}
export async function cancelTurn(identity: ChatIdentity, id: string) {
  return authorizedWorkspace(
    identity.userId,
    identity.workspaceId,
    true,
    async (trx, context) => {
      check(context);
      const turn = await trx("chatTurns")
        .where({ ...identity, id })
        .first("id");
      if (!turn) throw new AuthorizationAccessError();
      await trx("chatTurns")
        .where({ id })
        .whereIn("state", active)
        .update({ state: "cancelled", finishedAt: trx.fn.now() });
    },
  );
}
/** Execution control only; never returns transcript data or grants access. */
export async function turnStillActive(identity: ChatIdentity, id: string) {
  return !!(await database()("chatTurns")
    .where({ ...identity, id })
    .whereIn("state", active)
    .where("leaseUntil", ">", database().fn.now())
    .first("id"));
}
export async function readThreads(identity: ChatIdentity, threadId?: string) {
  return authorizedWorkspace(
    identity.userId,
    identity.workspaceId,
    true,
    async (trx, context) => {
      check(context);
      await recover(trx, identity);
      if (!threadId)
        return {
          threads: await trx("chatThreads")
            .where(identity)
            .orderBy("updatedAt", "desc")
            .orderBy("id")
            .limit(50)
            .select("id", "createdAt", "updatedAt"),
        };
      await ownedThread(trx, identity, threadId);
      const turns = await trx("chatTurns")
        .where({ ...identity, threadId })
        .orderBy("createdAt", "desc")
        .orderBy("id")
        .limit(50)
        .select(
          "id",
          "state",
          "clientTurnId",
          "createdAt",
          "accessHash",
          "sources",
          "surfaceKey",
          "pageContext",
          "leadEvidence",
          "leadSearchSnapshot",
          "leadSearchEvidence",
          "leadDetailsResult",
          "leadHistoryResult",
          "customerStamp",
          "customerResult",
          "workOrderResult",
        );
      turns.reverse();
      const messages = turns.length
        ? await trx("chatMessages")
            .whereIn(
              "turnId",
              turns.map((turn) => turn.id),
            )
            .select("id", "turnId", "role", "text")
        : [];
      const order = new Map(turns.map((turn, index) => [turn.id, index]));
      messages.sort(
        (a, b) =>
          order.get(a.turnId)! - order.get(b.turnId)! ||
          (a.role === "user" ? -1 : 1),
      );
      const visibleTurns = [];
      for (const turn of turns) {
        const allowed = await evidenceAllowed(trx, context, turn);
        if (!allowed)
          for (const message of messages)
            if (message.turnId === turn.id && message.role === "assistant")
              message.text = copy.restricted;
        visibleTurns.push({
          id: turn.id,
          state: turn.state,
          clientTurnId: turn.clientTurnId,
          createdAt: turn.createdAt,
          customerStamp: allowed
            ? (turn.customerStamp ?? undefined)
            : undefined,
          customerResult:
            allowed && turn.state === "completed"
              ? await visibleCustomerResult(trx, turn)
              : undefined,
          workOrderResult:
            allowed && turn.state === "completed"
              ? await visibleWorkOrderResult(trx, context, turn)
              : undefined,
          surfaceKey: turn.surfaceKey,
          pageContext: turn.pageContext,
          leadEvidence: allowed ? turn.leadEvidence : [],
          searchEvidence: allowed ? turn.leadSearchEvidence : [],
          searchResult:
            allowed && turn.state === "completed" && turn.leadSearchSnapshot
              ? leadSearchSnapshotSchema.parse(turn.leadSearchSnapshot).result
              : undefined,
          historyResult:
            allowed && turn.state === "completed" && turn.leadHistoryResult
              ? leadHistoryResultSchema.parse(turn.leadHistoryResult)
              : undefined,
          detailsResult:
            allowed && turn.state === "completed" && turn.leadDetailsResult
              ? leadDetailsResultSchema.parse(turn.leadDetailsResult)
              : undefined,
          sources: allowed ? turn.sources : [],
          action:
            turn.state === "completed"
              ? allowed
                ? await visibleTurnDraft(trx, context, turn.id)
                : await visibleDeletionReceipt(trx, context, turn.id)
              : undefined,
        });
      }
      return { threadId, turns: visibleTurns, messages };
    },
  );
}
export async function deleteThread(identity: ChatIdentity, threadId: string) {
  return authorizedWorkspace(
    identity.userId,
    identity.workspaceId,
    true,
    async (trx, context) => {
      check(context);
      await ownedThread(trx, identity, threadId);
      await recover(trx, identity);
      if (
        await trx("chatTurns")
          .where({ threadId })
          .whereIn("state", active)
          .first("id")
      )
        throw new ChatConflictError();
      // Delete execution checkpoints in the same transaction as the app transcript.
      const turnIds = trx("chatTurns")
        .where({ ...identity, threadId })
        .select(trx.raw("id::text"));
      for (const table of [
        "checkpoint_writes",
        "checkpoint_blobs",
        "checkpoints",
      ])
        await trx(table).whereIn("thread_id", turnIds.clone()).delete();
      await trx("chatThreads")
        .where({ ...identity, id: threadId })
        .delete();
    },
  );
}

/** Freeze all evidence before releasing output; subsequent deltas/history recheck it. */
export async function rememberTurnSources(
  identity: ChatIdentity,
  id: string,
  sources: HelpSource[],
) {
  return authorizedWorkspace(
    identity.userId,
    identity.workspaceId,
    true,
    async (trx, context) => {
      check(context);
      const turn = await trx("chatTurns")
        .where({ ...identity, id })
        .first();
      if (!turn || !active.includes(turn.state)) throw new ChatCancelledError();
      if (!(await evidenceAllowed(trx, context, { ...turn, sources })))
        throw new AuthorizationAccessError();
      await trx("chatTurns")
        .where({ id })
        .update({ sources: JSON.stringify(sources) });
    },
  );
}
export async function validateTurnEvidence(identity: ChatIdentity, id: string) {
  return authorizedWorkspace(
    identity.userId,
    identity.workspaceId,
    false,
    async (trx, context) => {
      check(context);
      const turn = await trx("chatTurns")
        .where({ ...identity, id })
        .first();
      if (!turn || !(await evidenceAllowed(trx, context, turn)))
        throw new AuthorizationAccessError();
      return context;
    },
  );
}

/** Context is reconstructed only from persisted intent, never from client labels. */
export async function turnPageReference(identity: ChatIdentity, id: string) {
  return authorizedWorkspace(
    identity.userId,
    identity.workspaceId,
    false,
    async (trx, context) => {
      check(context);
      const turn: Turn | undefined = await trx("chatTurns")
        .where({ ...identity, id })
        .first();
      if (!turn || !(await evidenceAllowed(trx, context, turn)))
        throw new AuthorizationAccessError();
      const intent = chatPageContextSchema.parse(turn.pageContext);
      if (
        turn.surfaceKey === "customer.detail" ||
        turn.surfaceKey === "customers.list"
      )
        return customerPageReference(trx, context, turn);
      if (
        turn.surfaceKey === "work_order.detail" ||
        turn.surfaceKey === "work_order.list"
      )
        return workOrderPageReference(trx, context, turn);
      if (
        intent.recordRefs?.length &&
        !turn.leadEvidence.some(
          (source) => source.id === intent.recordRefs![0].id,
        )
      )
        return {
          kind: "page-context-unavailable",
          message:
            "The selected record is unavailable. Do not infer private information.",
        };
      return (
        await resolveLeadChatContext(trx, context, {
          surfaceKey: turn.surfaceKey,
          ...intent,
        })
      ).reference;
    },
  );
}
/** Carry CRM provenance through answers that reuse authorized conversation history. */
export async function rememberTurnLeadEvidence(
  identity: ChatIdentity,
  id: string,
  sources: ChatLeadEvidence,
) {
  return authorizedWorkspace(
    identity.userId,
    identity.workspaceId,
    true,
    async (trx, context) => {
      check(context);
      const turn: Turn | undefined = await trx("chatTurns")
        .where({ ...identity, id })
        .first();
      if (
        !turn ||
        !active.includes(turn.state) ||
        !(await evidenceAllowed(trx, context, turn))
      )
        throw new AuthorizationAccessError();
      const merged = chatLeadEvidenceSchema.parse(
        mergeChatLeadEvidence(turn.leadEvidence, sources),
      );
      if (!(await leadChatEvidenceAllowed(trx, context, merged)))
        throw new AuthorizationAccessError();
      await trx("chatTurns")
        .where({ id })
        .update({ leadEvidence: JSON.stringify(merged) });
    },
  );
}

/** Carry search provenance through later answers, including empty searches and matching totals. */
export async function rememberTurnSearchEvidence(
  identity: ChatIdentity,
  id: string,
  ids: readonly string[],
) {
  return authorizedWorkspace(
    identity.userId,
    identity.workspaceId,
    true,
    async (trx, context) => {
      check(context);
      const turn: Turn | undefined = await trx("chatTurns")
        .where({ ...identity, id })
        .first();
      if (
        !turn ||
        !active.includes(turn.state) ||
        !(await evidenceAllowed(trx, context, turn))
      )
        throw new AuthorizationAccessError();
      const merged = leadSearchEvidenceSchema.parse([
        ...new Set([...turn.leadSearchEvidence, ...ids]),
      ]);
      if (!(await leadSearchEvidenceAllowed(trx, context, merged)))
        throw new AuthorizationAccessError();
      await trx("chatTurns")
        .where({ id })
        .update({ leadSearchEvidence: JSON.stringify(merged) });
    },
  );
}
