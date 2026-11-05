export const adminAuditExportData = {
  failed: 'The export request failed. Nothing was automatically retried.',
  invalid: 'The export server returned an invalid response. No file was released.',
  missing: 'Verification is unavailable. Close this review and start again.',
  uncertain: 'The download could not be confirmed. The server may have recorded the export. Check the audit log and start a new review if needed; this request will not be resubmitted.',
  prepared: 'The CSV was prepared and passed to your browser for download. Check that the file was saved securely; the audit event records preparation, not successful delivery.',
  loading: 'Checking registered export verification methods…',
} as const;
