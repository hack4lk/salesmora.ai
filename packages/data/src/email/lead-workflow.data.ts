export const leadWorkflowEmailData = {
  brand: "SalesMora.ai", heading: "A new lead is still unassigned",
  subject: (heading: string) => `SalesMora.ai: ${heading}`,
  leadNumber: "Lead", name: "Name", view: "View lead",
  access: "Sign in to review the current lead and choose its owner. Your access may have changed since this reminder.",
  preferences: "Notification preferences", fallback: "If the button does not work, copy and paste this link into your browser:",
  logoCid: "cid:salesmora-logo",
} as const;
