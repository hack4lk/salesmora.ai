import type { EstimateRevisionReviewInput } from "./estimate-revision-review.preview";

export const estimateRevisionReviewData = {
  title: "Replace previous revision",
  replacement: (number: string, before: number, after: number) => `${number}: revision ${before} will be replaced by revision ${after}.`,
  effects: "Only confirming Send or Publish replaces the previous revision and disables its customer link. Its frozen paper and staff history remain available.",
  paymentTitle: "Review carried payment link",
  paymentHint: "This link was copied from the previous revision. Check that it is valid for the updated amount and terms, or return to Details to change or remove it.",
  acknowledge: "I checked this payment link against the current revision's amount and terms.",
  noCarriedLink: "No unchanged payment link from the previous revision needs confirmation.",
  unavailable: "Revision review is unavailable. Your access may have changed.",
  invalid: "This revision review is incomplete or out of date. Reload and review before sharing.",
  required: "Check the carried payment link before confirming Send or Publish.",
  stories: {
    notice: "Component preview: fictional replacement review. Nothing is sent, published or replaced.",
    confirm: "Confirm and publish",
    confirmed: "Replacement review confirmed. No estimate changed.",
    changePaper: "Change sample amount",
    changeSource: "Change previous revision",
    revoke: "Remove sample access",
    number: "EST-2048",
    name: "Kitchen remodel estimate",
    recipient: "Jordan Lee",
    paymentLink: "https://payments.example.test/checkout?estimate=EST-2048",
  },
} as const;

export const estimateRevisionReviewFixture: EstimateRevisionReviewInput = {
  estimate: {
    id: "a0d6b18b-6aec-4f7d-a0be-e0de8bf648b1", number: estimateRevisionReviewData.stories.number, revision: 2, version: 1,
    name: estimateRevisionReviewData.stories.name, status: "draft", archived: false,
    recipientName: estimateRevisionReviewData.stories.recipient, totalCents: 104793, validUntil: "2026-11-25",
  },
  preview: { state: "ready", estimateId: "a0d6b18b-6aec-4f7d-a0be-e0de8bf648b1", version: 1, snapshotHash: "a".repeat(64) },
  revision: {
    sourceEstimateId: "b1e7c29c-6aec-4f7d-a0be-e0de8bf648b2", sourceVersion: 2, sourceRevision: 1,
    sourceStatus: "published", requiresPaymentLinkReview: true,
  },
  canRead: true, canSend: true, paymentLink: estimateRevisionReviewData.stories.paymentLink, value: null,
};
