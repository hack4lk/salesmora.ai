import "server-only";
import { createAIUsageRecorder } from "@salesmora/data";
import { database } from "../workspaces/store";

/** Never enable a fictional provider against the normal app/customer database. */
export function testChatProviderEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.SALESMORA_TEST_SERVER === "1" &&
    process.env.CHAT_TEST_PROVIDER === "fixture" &&
    !!process.env.DATABASE_URL &&
    new URL(process.env.DATABASE_URL).pathname.endsWith("_test")
  );
}
export async function* testChatResponse(
  message: string,
  signal: AbortSignal,
  identity?: { userId: string; workspaceId: string; turnId: string },
) {
  if (!testChatProviderEnabled()) throw new Error("Provider unavailable");
  if (message === "fixture:budget") {
    if (!identity) throw Error("Fixture identity missing");
    const finish = await createAIUsageRecorder(database(), identity).start(
      "fictional-budget-fixture",
      "answer",
      100,
    );
    await finish({
      outcome: "completed",
      tokens: {
        inputTokens: 50,
        outputTokens: 50,
        totalTokens: 100,
        cachedInputTokens: 0,
        reasoningTokens: 0,
      },
    });
  }
  const delay = (ms: number) =>
    new Promise<void>((resolve, reject) => {
      const stop = () => {
        clearTimeout(timer);
        reject(new Error("Cancelled"));
      };
      const timer = setTimeout(() => {
        signal.removeEventListener("abort", stop);
        resolve();
      }, ms);
      signal.addEventListener("abort", stop, { once: true });
      if (signal.aborted) stop();
    });
  await delay(
    message === "fixture:timeout"
      ? 95_000
      : message === "fixture:heartbeat"
        ? 10_200
        : message === "fixture:slow"
          ? 600
          : 80,
  );
  yield "Fictional test response. ";
  await delay(message === "fixture:slow" ? 600 : 80);
  if (message === "fixture:fail")
    throw new Error("Private provider failure must never be exposed");
  yield "Streaming works 🌍. ";
  await delay(80);
  yield "No CRM records were read or changed.";
}

/** Fixture model exercises the real graph/tool/approval boundaries without provider usage. */
export function testDraftModel(
  message: string,
): import("@salesmora/agent").ConversationModel | undefined {
  if (!testChatProviderEnabled()) return;
  if (message.startsWith("fixture:customer:"))
    return {
      async plan() {
        const request = JSON.parse(message.slice("fixture:customer:".length));
        return [{ name: request.tool, args: { request: request.request } }];
      },
      async *answer() {
        yield "Current authorized customer result. Review any proposal before confirming.";
      },
    };
  if (message === "fixture:customer-history")
    return {
      async plan() {
        return [];
      },
      async *answer(messages) {
        yield messages
          .filter((m) => m.role === "assistant")
          .map((m) => m.text)
          .join(" ")
          .slice(0, 4000) || "No prior customer content.";
      },
    };
  if (
    message.startsWith("fixture:search:") ||
    message.startsWith("fixture:search-slow:")
  )
    return {
      async plan() {
        return [
          {
            name: "leads_query",
            args: {
              request: {
                operation: "search",
                input: JSON.parse(
                  message.slice(
                    message.startsWith("fixture:search-slow:")
                      ? "fixture:search-slow:".length
                      : "fixture:search:".length,
                  ),
                ),
              },
            },
          },
        ];
      },
      async *answer(_messages, evidence) {
        yield JSON.stringify(evidence);
        if (message.startsWith("fixture:search-slow:")) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
          yield "Search fixture complete.";
        }
      },
    };
  if (message === "fixture:search-history")
    return {
      async plan() {
        return [];
      },
      async *answer(messages) {
        yield messages
          .filter((item) => item.role === "assistant")
          .map((item) => item.text)
          .join(" ")
          .slice(0, 4000) || "No prior search content.";
      },
    };
  if (
    message === "fixture:history-followup" ||
    message === "fixture:details-history"
  )
    return {
      async plan() {
        return [];
      },
      async *answer(messages) {
        yield messages
          .filter((item) => item.role === "assistant")
          .map((item) => item.text)
          .join(" ")
          .slice(0, 4000) || "No prior details.";
      },
    };
  if (
    message.startsWith("fixture:history:") ||
    message.startsWith("fixture:history-slow:")
  )
    return {
      async plan() {
        return [
          {
            name: "leads_query",
            args: {
              request: {
                operation: "history",
                input: JSON.parse(
                  message.slice(
                    message.startsWith("fixture:history-slow:")
                      ? "fixture:history-slow:".length
                      : "fixture:history:".length,
                  ),
                ),
              },
            },
          },
        ];
      },
      async *answer(_messages, evidence) {
        const text = JSON.stringify(evidence);
        yield text.length < 4000
          ? text
          : "Read the authorized lead history in the card.";
        if (message.startsWith("fixture:history-slow:")) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
          yield "History fixture complete.";
        }
      },
    };
  if (
    message.startsWith("fixture:details:") ||
    message.startsWith("fixture:details-slow:")
  )
    return {
      async plan() {
        return [
          {
            name: "leads_query",
            args: {
              request: {
                operation: "details",
                input: JSON.parse(
                  message.slice(
                    message.startsWith("fixture:details-slow:")
                      ? "fixture:details-slow:".length
                      : "fixture:details:".length,
                  ),
                ),
              },
            },
          },
        ];
      },
      async *answer(_messages, evidence) {
        const text = JSON.stringify(evidence);
        yield text.length < 4000
          ? text
          : "Read the authorized lead details in the card.";
        if (message.startsWith("fixture:details-slow:")) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
          yield "Details fixture complete.";
        }
      },
    };
  if (message.startsWith("fixture:delete:"))
    return {
      async plan() {
        return [
          {
            name: "leads_propose_action",
            args: {
              request: {
                operation: "delete",
                input: JSON.parse(message.slice("fixture:delete:".length)),
              },
            },
          },
        ];
      },
      async *answer(_messages, evidence) {
        yield JSON.stringify(evidence).includes("lead-delete-proposed")
          ? "Review the deletion. Type the lead number in the card and choose Confirm permanent deletion."
          : JSON.stringify(evidence);
      },
    };
  if (message.startsWith("fixture:export:"))
    return {
      async plan() {
        return [
          {
            name: "leads_propose_action",
            args: {
              request: {
                operation: "export_csv",
                input: JSON.parse(message.slice("fixture:export:".length)),
              },
            },
          },
        ];
      },
      async *answer(_messages, evidence) {
        yield JSON.stringify(evidence).includes("lead-export-proposed")
          ? "Review the export and click Confirm and download CSV."
          : JSON.stringify(evidence);
      },
    };
  if (message.startsWith("fixture:archive:"))
    return {
      async plan() {
        return [
          {
            name: "leads_propose_action",
            args: {
              request: {
                operation: "set_archived",
                input: JSON.parse(message.slice("fixture:archive:".length)),
              },
            },
          },
        ];
      },
      async *answer(_messages, evidence) {
        yield JSON.stringify(evidence).includes("lead-archive-proposed")
          ? "Review the archive or restore proposal and confirm on the card."
          : JSON.stringify(evidence);
      },
    };
  if (message.startsWith("fixture:note:"))
    return {
      async plan() {
        return [
          {
            name: "leads_propose_action",
            args: {
              request: {
                operation: "add_note",
                input: JSON.parse(message.slice("fixture:note:".length)),
              },
            },
          },
        ];
      },
      async *answer(_messages, evidence) {
        yield JSON.stringify(evidence).includes("lead-note-proposed")
          ? "Review the note and click Confirm and add note."
          : JSON.stringify(evidence);
      },
    };
  if (message.startsWith("fixture:assign:"))
    return {
      async plan() {
        return [
          {
            name: "leads_propose_action",
            args: {
              request: {
                operation: "assign",
                input: JSON.parse(message.slice("fixture:assign:".length)),
              },
            },
          },
        ];
      },
      async *answer(_messages, evidence) {
        yield JSON.stringify(evidence).includes("lead-assignment-proposed")
          ? "Review the assignment and click Confirm assignment change."
          : JSON.stringify(evidence);
      },
    };
  if (message.startsWith("fixture:combined:"))
    return {
      async plan() {
        return [
          {
            name: "leads_propose_action",
            args: {
              request: {
                operation: "update_with_stage",
                input: JSON.parse(message.slice("fixture:combined:".length)),
              },
            },
          },
        ];
      },
      async *answer(_messages, evidence) {
        yield JSON.stringify(evidence).includes("lead-update-proposed")
          ? "Review both changes and click Confirm lead changes."
          : JSON.stringify(evidence);
      },
    };
  if (message.startsWith("fixture:update"))
    return {
      async plan() {
        return [
          {
            name: "leads_propose_action",
            args: {
              request: {
                operation: "update",
                input: message.startsWith("fixture:update:")
                  ? JSON.parse(message.slice("fixture:update:".length))
                  : {
                      leadRef: "",
                      changes: [{ field: "phone", value: "(212) 555-0188" }],
                    },
              },
            },
          },
        ];
      },
      async *answer(_messages, evidence) {
        yield JSON.stringify(evidence).includes("lead-update-proposed")
          ? "Review the changes and click Confirm lead changes."
          : JSON.stringify(evidence);
      },
    };
  if (message.startsWith("fixture:stage"))
    return {
      async plan() {
        return [
          {
            name: "leads_propose_action",
            args: {
              request: {
                operation: "change_stage",
                input: {
                  leadRef: message.startsWith("fixture:stage-ref:")
                    ? message.slice("fixture:stage-ref:".length)
                    : "",
                  to:
                    message === "fixture:stage-lost" ? "lost" : "estimate-sent",
                  reason:
                    message === "fixture:stage-lost"
                      ? "Customer chose another provider."
                      : "",
                },
              },
            },
          },
        ];
      },
      async *answer() {
        yield "Review the stage proposal and click Confirm stage change. No estimate will be sent.";
      },
    };
  if (message.startsWith("fixture:context"))
    return {
      async plan() {
        return message === "fixture:context-counts"
          ? [
              {
                name: "leads_query",
                args: { request: { operation: "pipeline_summary", input: {} } },
              },
            ]
          : [];
      },
      async *answer(messages, evidence) {
        if (message === "fixture:context-counts") {
          yield JSON.stringify(evidence);
          return;
        }
        const reference = messages.find(
          (item) =>
            item.role === "user" &&
            item.text.startsWith("Current page reference ("),
        )?.text;
        yield reference ?? "No page reference supplied.";
        if (message === "fixture:context-slow")
          await new Promise((resolve) => setTimeout(resolve, 800));
        yield " Context fixture complete.";
      },
    };
  if (!message.startsWith("fixture:draft")) return;
  return {
    async plan() {
      return [
        {
          name: "leads_propose_action",
          args: {
            request: {
              operation: "create",
              input: {
                name:
                  message === "fixture:draft-missing"
                    ? ""
                    : "Fictional draft customer",
                service: "Furnace repair",
                email: "draft@example.test",
                phone: "",
                address: "",
                details: "Fictional development request",
                notes: "",
                source: "other",
                stage: "new",
                ownerId: message.startsWith("fixture:draft-owner:")
                  ? message.slice("fixture:draft-owner:".length)
                  : "",
              },
            },
          },
        },
      ];
    },
    async *answer(_messages, evidence) {
      yield JSON.stringify(evidence).includes("lead-draft-missing-fields")
        ? "Please provide the lead name."
        : "Review the draft and explicitly confirm to create the lead.";
    },
  };
}
