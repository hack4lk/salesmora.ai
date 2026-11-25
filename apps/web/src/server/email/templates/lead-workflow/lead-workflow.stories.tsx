import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { renderLeadWorkflowEmail, type LeadWorkflowEmailInput } from "@salesmora/data/email/lead-workflow";

function EmailPreview(input: LeadWorkflowEmailInput) {
  const email = renderLeadWorkflowEmail(input, "/branding/salesmora-email-logo.png");
  return <main className="mx-auto grid w-full max-w-2xl gap-6 p-4 sm:p-8">
    <header><h1 className="m-0 text-heading font-semibold">Unassigned lead reminder email</h1>
      <p>Preview only. No email is sent; the lead is fictional.</p><p>{email.subject}</p></header>
    <iframe title="Unassigned lead reminder email preview" srcDoc={email.html} sandbox="allow-same-origin"
      className="min-h-screen w-full rounded-xl border border-line bg-canvas" />
  </main>;
}
const meta = { title: "Email/Lead Workflow", component: EmailPreview,
  args: { baseURL: "https://salesmora.example.test", workspaceId: "00000000-0000-4000-8000-000000000001",
    leadId: "00000000-0000-4000-8000-000000000002", leadNumber: "LD-1042", leadName: "Jordan Lee" },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof EmailPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "phone", isRotated: false } } };
export const PlainText: Story = { render: args => <pre className="mx-auto max-w-2xl whitespace-pre-wrap p-6">{renderLeadWorkflowEmail(args).text}</pre> };
