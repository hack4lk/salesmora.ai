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
  if (message.startsWith('fixture:calendar-propose:') || message.startsWith('fixture:calendar-propose-slow:')) return {
    async plan() { return [{ name:'calendar_propose_action',args:JSON.parse(message.slice(message.indexOf(':',8)+1)) }]; },
    async *answer(_messages,evidence) {
      yield 'Checking the requested schedule. ';
      if (message.startsWith('fixture:calendar-propose-slow:')) await new Promise(resolve => setTimeout(resolve,1200));
      yield JSON.stringify(evidence).slice(0,6000);
    },
  };
  if (message.startsWith('fixture:calendar:') || message.startsWith('fixture:calendar-slow:')) return {
    async plan() { return [{ name: 'calendar_query', args: JSON.parse(message.slice(message.indexOf(':', 8) + 1)) }]; },
    async *answer(_messages, evidence) {
      yield 'Calendar snapshot checked. ';
      if (message.startsWith('fixture:calendar-slow:')) await new Promise(resolve => setTimeout(resolve,1200));
      yield JSON.stringify(evidence).slice(0, 6000); // Keep this fictional answer within the real graph’s answer budget.
    },
  };
  if (message === 'fixture:calendar-focus' || message === 'fixture:calendar-focus-slow') return {
    async plan() { return []; },
    async *answer(messages) {
      yield 'Checking selected Calendar context. ';
      if (message.endsWith('-slow')) await new Promise(resolve => setTimeout(resolve,1200));
      const reference = [...messages].reverse().find(m => m.role === 'user' && m.text.startsWith('Current page reference'));
      const raw = reference ? JSON.parse(reference.text.slice(reference.text.indexOf('\n')+1)) : null;
      yield JSON.stringify(raw?.page?.selectedVisit ?? raw?.selectedVisit ?? 'No selected visit.');
    },
  };
  if (message === 'fixture:calendar-history') return {
    async plan() { return []; },
    async *answer(messages) { yield 'Historical Calendar context: '; yield messages.filter(m => m.role === 'assistant').map(m => m.text).join(' '); },
  };
  if (message === "fixture:estimate-void-history" || message === "fixture:estimate-void-history-slow")
    return {
      async plan() { return []; },
      async *answer(messages) {
        yield "Checking the app-recorded withdrawal. ";
        if (message.endsWith("-slow")) await new Promise(resolve => setTimeout(resolve, 1200));
        yield messages.some(item => item.role === "assistant" && item.text.includes("App-recorded Estimate withdrawal") &&
          item.text.includes('"state":"confirmed"')) ? "Verified confirmed withdrawal." : "No verified confirmed withdrawal.";
      },
    };
  if (message === "fixture:estimate-archive-history" || message === "fixture:estimate-archive-history-slow")
    return {
      async plan() { return []; },
      async *answer(messages) {
        yield "Checking the app-recorded Archive/Restore proposal. ";
        if (message.endsWith("-slow")) await new Promise(resolve => setTimeout(resolve, 1200));
        yield messages.some(item => item.role === "assistant" && item.text.includes("App-recorded Estimate Archive/Restore proposal") &&
          item.text.includes('"state":"confirmed"')) ? "Verified confirmed Archive/Restore." : "No verified confirmed Archive/Restore.";
      },
    };
  if (message === "fixture:estimate-draft-delete-history" || message === "fixture:estimate-draft-delete-history-slow")
    return {
    async plan() { return []; },
    async *answer(messages) {
      yield "Checking the app-recorded Draft deletion proposal. ";
      if (message.endsWith("-slow")) await new Promise(resolve => setTimeout(resolve, 1200));
      yield messages.some(item => item.role === "assistant" &&
        item.text.includes("App-recorded Estimate Draft deletion proposal") &&
        item.text.includes('"state":"confirmed"')) ? "Verified confirmed Draft deletion." : "No verified confirmed Draft deletion.";
    },
    };
  if (message.startsWith("fixture:estimate-draft-delete:") ||
    message.startsWith("fixture:estimate-draft-delete-slow:"))
    return {
    async plan() {
      const prefix = message.startsWith("fixture:estimate-draft-delete-slow:")
        ? "fixture:estimate-draft-delete-slow:"
        : "fixture:estimate-draft-delete:";
      return [{ name: "estimates_propose_action", args: JSON.parse(message.slice(prefix.length)) }];
    },
    async *answer() {
      yield "Review the permanent Draft-deletion card. Nothing has been deleted. Only exact typed confirmation in its dialog can delete this Draft.";
      if (message.startsWith("fixture:estimate-draft-delete-slow:")) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        yield "Draft-deletion fixture complete.";
      }
    },
    };
  if (message === "fixture:estimate-convert-history")
    return {
      async plan() { return []; },
      async *answer(messages) {
        const history = messages.filter(item => item.role === "assistant").map(item => item.text).join("\n");
        const verified = history.includes("App-recorded Estimate conversion review") &&
          history.includes('"state":"pending"') &&
          !history.includes("customer@example.test") &&
          !history.includes("PRIVATE_ESTIMATE_NOTE") &&
          !history.includes("PRIVATE_CUSTOMER_NOTE");
        yield verified
          ? "Verified pending conversion proposal and Estimate reference only; no Job creation receipt exists."
          : "No verified conversion proposal is available.";
      },
    };
  if (message.startsWith("fixture:estimate-convert:"))
    return {
      async plan() {
        return [{
          name: "estimates_propose_action",
          args: JSON.parse(message.slice("fixture:estimate-convert:".length)),
        }];
      },
      async *answer() {
        yield "Review the conversion card to open the existing Job form. No Job has been created.";
      },
    };
  if (message.startsWith("fixture:estimate-export:"))
    return {
      async plan() {
        return [{
          name: "estimates_propose_action",
          args: JSON.parse(message.slice("fixture:estimate-export:".length)),
        }];
      },
      async *answer() {
        yield "Review the CSV export in the existing Estimates export dialog. No file has been downloaded.";
      },
    };
  if (message.startsWith("fixture:estimate-archive:") || message.startsWith("fixture:estimate-archive-slow:"))
    return {
      async plan() {
        const prefix = message.startsWith("fixture:estimate-archive-slow:") ? "fixture:estimate-archive-slow:" : "fixture:estimate-archive:";
        return [{ name: "estimates_propose_action", args: JSON.parse(message.slice(prefix.length)) }];
      },
      async *answer() {
        yield "Review the Archive/Restore card. Nothing has changed. Only explicit browser confirmation requests the action.";
        if (message.startsWith("fixture:estimate-archive-slow:")) {
          await new Promise(resolve => setTimeout(resolve, 1200));
          yield "Archive/Restore fixture complete.";
        }
      },
    };
  if (message.startsWith("fixture:estimate-void:") || message.startsWith("fixture:estimate-void-slow:"))
    return {
      async plan() {
        const prefix = message.startsWith("fixture:estimate-void-slow:") ? "fixture:estimate-void-slow:" : "fixture:estimate-void:";
        return [{ name: "estimates_propose_action", args: JSON.parse(message.slice(prefix.length)) }];
      },
      async *answer() {
        yield "Review the withdrawal card. Nothing has been withdrawn. Only explicit browser confirmation requests withdrawal.";
        if (message.startsWith("fixture:estimate-void-slow:")) {
          await new Promise(resolve => setTimeout(resolve, 1200));
          yield "Withdrawal fixture complete.";
        }
      },
    };
  if (message === "fixture:estimate-draft-action-history" || message === "fixture:estimate-draft-action-history-slow")
    return {
      async plan() { return []; },
      async *answer(messages) {
        yield "Checking the app-recorded Draft operation. ";
        if (message.endsWith("-slow")) await new Promise(resolve => setTimeout(resolve, 1200));
        yield messages.some(item => item.role === "assistant" && item.text.includes("App-recorded Estimate Draft action") &&
          item.text.includes('"state":"confirmed"')) ? "Verified confirmed Draft operation." : "No verified confirmed Draft operation.";
      },
    };
  if (message.startsWith("fixture:estimate-draft-action:") || message.startsWith("fixture:estimate-draft-action-slow:"))
    return {
      async plan() {
        const prefix = message.startsWith("fixture:estimate-draft-action-slow:") ? "fixture:estimate-draft-action-slow:" : "fixture:estimate-draft-action:";
        return [{ name: "estimates_propose_action", args: JSON.parse(message.slice(prefix.length)) }];
      },
      async *answer() {
        yield "Review the Draft operation card. Nothing has been saved or reused. Only explicit browser confirmation requests the operation.";
        if (message.startsWith("fixture:estimate-draft-action-slow:")) {
          await new Promise(resolve => setTimeout(resolve, 1200));
          yield "Draft action fixture complete.";
        }
      },
    };
  if (message === "fixture:estimate-decision-history" || message === "fixture:estimate-decision-history-slow")
    return {
      async plan() { return []; },
      async *answer(messages) {
        yield "Checking the app-recorded decision outcome. ";
        if (message.endsWith("-slow")) await new Promise(resolve => setTimeout(resolve, 1200));
        yield messages.some(item => item.role === "assistant" && item.text.includes("App-recorded Estimate decision proposal") &&
          item.text.includes('"state":"confirmed"')) ? "Verified recorded decision receipt." : "No verified recorded decision receipt.";
      },
    };
  if (message.startsWith("fixture:estimate-decision:") || message.startsWith("fixture:estimate-decision-slow:"))
    return {
      async plan() {
        const prefix = message.startsWith("fixture:estimate-decision-slow:") ? "fixture:estimate-decision-slow:" : "fixture:estimate-decision:";
        return [{ name: "estimates_propose_action", args: JSON.parse(message.slice(prefix.length)) }];
      },
      async *answer() {
        yield "Review the Decision card. Nothing has been recorded. Only explicit confirmation records the customer's response.";
        if (message.startsWith("fixture:estimate-decision-slow:")) {
          await new Promise(resolve => setTimeout(resolve, 1200));
          yield "Decision fixture complete.";
        }
      },
    };
  if (message.startsWith("fixture:estimate-sharing:"))
    return {
      async plan() {
        return [{ name: "estimates_propose_action", args: JSON.parse(message.slice("fixture:estimate-sharing:".length)) }];
      },
      async *answer() {
        yield "Review the sharing proposal in the app. Nothing has been shared or queued. Only the review's explicit confirmation requests sharing.";
      },
    };
  if (message.startsWith("fixture:estimate-draft:") || message.startsWith("fixture:estimate-draft-slow:"))
    return {
      async plan() {
        const prefix = message.startsWith("fixture:estimate-draft-slow:") ? "fixture:estimate-draft-slow:" : "fixture:estimate-draft:";
        return [{ name: "estimates_propose_action", args: JSON.parse(message.slice(prefix.length)) }];
      },
      async *answer() {
        yield "Review the Estimate Draft proposal. Nothing has been saved. Use the card to confirm, cancel or review missing prices in the editor.";
        if (message.startsWith("fixture:estimate-draft-slow:")) {
          await new Promise(resolve => setTimeout(resolve, 1200));
          yield "Estimate Draft fixture complete.";
        }
      },
    };
  if (message.startsWith("fixture:estimate:") || message.startsWith("fixture:estimate-slow:"))
    return {
      async plan() {
        const prefix = message.startsWith("fixture:estimate-slow:") ? "fixture:estimate-slow:" : "fixture:estimate:";
        return [{ name: "estimates_query", args: { request: JSON.parse(message.slice(prefix.length)) } }];
      },
      async *answer(_messages, evidence) {
        const read = evidence[0];
        yield `Authorized Estimate summary. ${JSON.stringify(read).slice(0, 3000)}`;
        if (message.startsWith("fixture:estimate-slow:")) {
          await new Promise(resolve => setTimeout(resolve, 1200));
          yield "Estimate fixture complete.";
        }
      },
    };
  if (message === "fixture:estimate-history")
    return {
      async plan() { return []; },
      async *answer(messages) {
        yield messages.filter(item => item.role === "assistant").map(item => item.text).join(" ").slice(0, 4000) || "No prior Estimate content.";
      },
    };
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
