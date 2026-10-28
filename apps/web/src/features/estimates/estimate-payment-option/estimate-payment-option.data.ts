export const estimatePaymentOptionData = {
  title: "Payment option",
  field: "Payment link (optional)",
  hint: "Paste the HTTPS payment link provided by your payment provider. Verify the destination before sharing.",
  invalid: "Enter a complete HTTPS payment link without embedded usernames, passwords or whitespace.",
  tooLong: "Use a payment link of 2,048 characters or fewer.",
  action: "Pay Now",
  external: "Opens in a new tab",
  printedLink: "Payment link",
  stories: {
    notice: "Fictional payment-option preview. Do not enter payment information. No payment provider is connected.",
    link: "https://payments.example.test/checkout/estimate-2048",
    longLink: `https://payments.example.test/checkout/${"estimate-review-".repeat(12)}?reference=EST-2048`,
    unsafeLink: "javascript:alert('not-executed')",
  },
} as const;
