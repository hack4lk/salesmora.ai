export const estimateDraftActionResultData = {
  title: "Estimate Draft operation",
  loading: "Loading the current Draft review...",
  unavailable: "This Draft proposal is unavailable. Access, the source or the saved Draft may have changed. Request a fresh review.",
  error: "The Draft operation could not be confirmed. Review its current status before retrying.",
  historyError: "The operation completed, but chat history could not be refreshed. Reload to check the current status.",
  retry: "Reload Draft review",
  stories: {
    disable: "Disable this host", release: "Release previous response", replace: "Replace sample proposal",
    workspace: "Switch sample workspace", withheld: "Private review is withheld.",
  },
} as const;
