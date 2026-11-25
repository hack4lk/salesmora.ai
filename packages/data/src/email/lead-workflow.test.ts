import { expect, it } from "vitest";
import { renderLeadWorkflowEmail } from "./lead-workflow";
const fixture = { baseURL: "https://salesmora.example.test", workspaceId: "00000000-0000-4000-8000-000000000001",
  leadId: "00000000-0000-4000-8000-000000000002", leadNumber: "LD-1042", leadName: "Jordan Lee" };
it("renders a staff reminder with minimal details and a protected lead link", () => {
  const email = renderLeadWorkflowEmail(fixture);
  expect(email.subject).toBe("SalesMora.ai: A new lead is still unassigned");
  expect(email.text).toContain("Lead: LD-1042");
  expect(email.text).toContain(`https://salesmora.example.test/leads/${fixture.leadId}?workspace=${fixture.workspaceId}`);
  expect(email.text).not.toContain("assigned to you");
});
it("escapes record text and rejects unsafe origins and malformed record identities", () => {
  const email = renderLeadWorkflowEmail({ ...fixture, leadName: '<script>alert(1)</script> & repair' });
  expect(email.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt; &amp; repair");
  expect(email.html).not.toContain("<script>");
  expect(() => renderLeadWorkflowEmail({ ...fixture, baseURL: "javascript:alert(1)" })).toThrow();
  expect(() => renderLeadWorkflowEmail({ ...fixture, baseURL: "https://user:pass@example.test" })).toThrow();
  expect(() => renderLeadWorkflowEmail({ ...fixture, leadNumber: "LD-1" })).toThrow();
});
