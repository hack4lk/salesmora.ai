import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { renderEstimateEmail, type EstimateEmailInput } from "@salesmora/data/email/estimate";
import { estimateEmailData as copy } from "@salesmora/data/email/estimate-data";

function EmailPreview(input: EstimateEmailInput) {
  const email = renderEstimateEmail(input, copy.stories.logo);
  return <main className="mx-auto grid w-full max-w-2xl gap-6 p-4 sm:p-8">
    <header><h1 className="m-0 text-heading font-semibold">{copy.stories.title}</h1>
      <p>{copy.stories.notice}</p><p>{email.subject}</p><p>{copy.stories.replyToLabel}: {email.replyTo}</p></header>
    <iframe title={copy.stories.frame} srcDoc={email.html} sandbox="allow-same-origin"
      className="min-h-screen w-full rounded-xl border border-line bg-canvas" />
  </main>;
}
const meta = {
  title: "Email/Estimate", component: EmailPreview,
  args: copy.stories, parameters: { layout: "fullscreen" },
} satisfies Meta<typeof EmailPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ args }) => {
    const email = renderEstimateEmail(args);
    await expect(email.html).toContain(copy.attribution);
    await expect(email.html).toContain(`href="${copy.learnMoreURL}"`);
    await expect(email.text).toContain(`${copy.attribution} ${copy.learnMore}: ${copy.learnMoreURL}`);
  },
};
export const EscapedContent: Story = {
  args: { businessName: "Fixture <script>alert(1)</script> & Co", name: "Replace <img src=x> pipes" },
  play: async ({ args }) => {
    const email = renderEstimateEmail(args);
    await expect(email.html).not.toContain("<script>");
    await expect(email.html).not.toContain("<img src=x>");
    await expect(email.html).toContain("&lt;script&gt;");
  },
};
export const Mobile: Story = { globals: { viewport: { value: "phone", isRotated: false } } };
export const WithPayment: Story = {
  args: { paymentLink: "https://payments.example.test/checkout?token=fictional&estimate=EST-2048" },
  play: async ({ args }) => {
    const email = renderEstimateEmail(args);
    await expect(email.html).not.toContain("The business has provided an external payment option for this estimate.");
    await expect(email.html).toContain(`>${copy.payment.action}</a>`);
    await expect(email.text).toContain(args.paymentLink!);
  },
};
export const PlainText: Story = {
  render: args => <pre className="mx-auto max-w-2xl whitespace-pre-wrap p-6">{renderEstimateEmail(args).text}</pre>,
};
