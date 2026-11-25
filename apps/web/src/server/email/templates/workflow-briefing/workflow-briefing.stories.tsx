import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { renderWorkflowBriefingEmail } from "@salesmora/data/email/workflow-briefing";
function EmailPreview(input: Parameters<typeof renderWorkflowBriefingEmail>[0]) {
  const email = renderWorkflowBriefingEmail(input, "/branding/salesmora-email-logo.png");
  return <main className="mx-auto grid w-full max-w-2xl gap-4 p-4">
    <h1 className="m-0 text-heading font-semibold">Monday briefing email</h1>
    <p className="m-0 text-sm text-muted">Fictional saved snapshot. No email is sent.</p>
    <iframe title="Monday briefing email preview" srcDoc={email.html} sandbox="allow-same-origin" className="min-h-screen w-full rounded-xl border border-line bg-canvas" />
  </main>;
}
const meta = { title: "Email/Workflow Briefing", component: EmailPreview,
  args: { baseURL: "https://salesmora.example.test", workspaceId: "00000000-0000-4000-8000-000000000001", briefingId: "00000000-0000-4000-8000-000000000002",
    snapshot: { generatedAt: "2026-11-23T14:00:00.000Z", timezone: "America/New_York", counts: { inactiveLeads: 4, awaitingEstimates: 6, unscheduledJobs: 3, dueSoonJobs: 5 } } },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof EmailPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "phone", isRotated: false } } };
export const PlainText: Story = { render: args => <pre className="whitespace-pre-wrap p-6">{renderWorkflowBriefingEmail(args).text}</pre> };
