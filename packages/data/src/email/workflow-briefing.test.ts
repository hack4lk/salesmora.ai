import { expect, it } from "vitest";
import { renderWorkflowBriefingEmail } from "./workflow-briefing";
const input = { baseURL: "https://app.example.test", workspaceId: "00000000-0000-4000-8000-000000000001", briefingId: "00000000-0000-4000-8000-000000000002",
  snapshot: { generatedAt: "2026-11-23T14:00:00.000Z", timezone: "America/New_York", counts: { inactiveLeads: 4, awaitingEstimates: 6, unscheduledJobs: 3, dueSoonJobs: 5 } } };
it("renders the saved counts and a protected workspace-bound briefing link", () => {
  const email = renderWorkflowBriefingEmail(input);
  expect(email.subject).toBe("Your Monday briefing is ready");
  expect(email.text).toContain("Inactive leads: 4");
  expect(email.text).toContain("America/New_York");
  expect(email.html).toContain(`/workflows/briefings/${input.briefingId}?workspace=${input.workspaceId}`);
  expect(email.text).toContain("Counts can overlap");
});
it("handles zero counts honestly and rejects unsafe links/counts", () => {
  expect(renderWorkflowBriefingEmail({ ...input, snapshot: { ...input.snapshot, counts: { inactiveLeads: 0, awaitingEstimates: 0, unscheduledJobs: 0, dueSoonJobs: 0 } } }).text).toContain("No items in these four categories.");
  expect(() => renderWorkflowBriefingEmail({ ...input, baseURL: "javascript:alert(1)" })).toThrow();
  expect(() => renderWorkflowBriefingEmail({ ...input, snapshot: { ...input.snapshot, counts: { ...input.snapshot.counts, inactiveLeads: -1 } } })).toThrow();
});
