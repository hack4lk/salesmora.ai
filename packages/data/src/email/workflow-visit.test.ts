import { expect, it } from "vitest";
import { renderWorkflowVisitEmail } from "./workflow-visit";
const input = { baseURL: "https://app.example.test", workspaceId: "00000000-0000-4000-8000-000000000001", visitId: "00000000-0000-4000-8000-000000000002",
  snapshot: { title: "Kitchen repair <script>", customerName: "Jordan Lee", scheduledDate: "2026-11-21", arrivalWindow: "09:00-11:00" as const,
    timezone: "America/New_York", recordLabels: ["J-0042 · Kitchen repair"], totalRecords: 1 } };
it("links the recipient to the canonical date/workspace/visit without customer messaging", () => {
  const email = renderWorkflowVisitEmail(input);
  expect(email.subject).toBe("A scheduled visit has no assignee");
  expect(email.text).toContain("Nov 21, 2026 · 9 AM–11 AM · America/New_York");
  expect(email.text).toContain(`date=2026-11-21&visit=${input.visitId}`);
  expect(email.html).toContain("&lt;script&gt;");
  expect(email.html).not.toContain("<script>");
});
it("omits a missing window and rejects unsafe origins", () => {
  expect(renderWorkflowVisitEmail({ ...input, snapshot: { ...input.snapshot, arrivalWindow: null } }).text).not.toContain("9 AM");
  expect(() => renderWorkflowVisitEmail({ ...input, baseURL: "javascript:alert(1)" })).toThrow();
});
it("describes recorded material issues for a single work order with the canonical visit link", () => {
  const label = "WO-0018 · Faucet <repair>: 2 Needed, 1 Ordered";
  const email = renderWorkflowVisitEmail({ ...input, snapshot: { ...input.snapshot, reason: "materials", recordLabels: [label] } });
  expect(email.subject).toBe("Materials need attention before a visit");
  expect(email.text).toContain(label);
  expect(email.html).toContain("Faucet &lt;repair&gt;: 2 Needed, 1 Ordered");
  expect(email.html).not.toContain("has no assignee");
  expect(email.text).toContain(`visit=${input.visitId}`);
});
