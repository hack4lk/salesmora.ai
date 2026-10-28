export const estimateVoidResultData = {
  title: "Estimate withdrawal proposal",
  loading: "Loading the authorized withdrawal review...",
  unavailable: "This withdrawal review is no longer available. Request a fresh review.",
  error: "The withdrawal review could not be checked. Reload it before continuing.",
  historyError: "The operation's checked outcome is shown, but conversation history could not be refreshed. Reload the conversation before continuing.",
  retry: "Reload withdrawal review",
  stories: {
    release: "Release previous response",
    workspace: "Switch sample workspace",
    disable: "Disable host",
  },
} as const;
