import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { renderWorkflowVisitEmail } from "@salesmora/data/email/workflow-visit";
function EmailPreview(input: Parameters<typeof renderWorkflowVisitEmail>[0]) {
  const email = renderWorkflowVisitEmail(input, "/branding/salesmora-email-logo.png");
  return <main className="mx-auto grid w-full max-w-2xl gap-4 p-4"><h1 className="m-0 text-heading font-semibold">Scheduled visit reminder email</h1>
    <p className="m-0 text-sm text-muted">Fictional visit. No email is sent.</p>
    <iframe title="Scheduled visit reminder email preview" srcDoc={email.html} sandbox="allow-same-origin" className="min-h-screen w-full rounded-xl border border-line bg-canvas" />
  </main>;
}
const meta = { title: "Email/Workflow Visit", component: EmailPreview,
  args: { baseURL: "https://salesmora.example.test", workspaceId: "00000000-0000-4000-8000-000000000001", visitId: "00000000-0000-4000-8000-000000000002",
    snapshot: { title: "Kitchen faucet replacement", customerName: "Jordan Lee", scheduledDate: "2026-11-21", arrivalWindow: "09:00-11:00", timezone: "America/New_York",
      recordLabels: ["J-0042 · Kitchen faucet replacement", "WO-0018 · Faucet installation"], totalRecords: 2 } },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof EmailPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "phone", isRotated: false } } };
export const PlainText: Story = { render: args => <pre className="whitespace-pre-wrap p-6">{renderWorkflowVisitEmail(args).text}</pre> };

export const Materials: Story = { args: { snapshot: { ...meta.args.snapshot, reason: "materials", recordLabels: ["WO-0018 · Faucet installation: 2 Needed, 1 Ordered"], totalRecords: 1 } } };
export const MobileMaterials: Story = { ...Materials, globals: { viewport: { value: "phone", isRotated: false } } };
