export const customerAssistantDraftData = {
  title: "Contact assistant",
  intro:
    "Describe the customer and review the details I recognize before applying them.",
  example:
    "For example: Taylor Brooks, taylor.brooks@example.com, (212) 555-0172.",
  label: "Describe the customer",
  draft: "Draft contact",
  thinking: "Thinking…",
  review: "Suggested details",
  apply: "Fill empty fields",
  hint: "Existing input is preserved. Applying a draft fills empty fields only and never saves the customer.",
  empty: "No contact details recognized. Try a name, email or phone number.",
  error: "The draft could not be prepared. Your form input is unchanged.",
  fields: {
    name: "Full name",
    email: "Email",
    phone: "Phone",
    type: "Type",
    companyName: "Company name",
    location: "Location",
    ownerId: "Owner",
    internalNotes: "Internal notes",
  },
};
