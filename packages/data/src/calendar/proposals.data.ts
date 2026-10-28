export const calendarProposalData = {
  conflict:'This visit or proposal changed. Ask for a fresh schedule review.',
  reference:'Provide one exact Job or Work Order number, or a visit ID from a current Calendar result.',
  alreadyUnscheduled:'This visit is already unscheduled; its date and arrival window are empty.',
  unchanged:'This visit already has that date and arrival window.',
  tooLarge:'This visit is too large for a complete chat review. Use Calendar to review it.',
  past:'The proposed date is in the past. You can still save it.',
  after:'The proposed date is after the Job completion deadline. You can still save it.',
  unknown:'Another assigned visit has no arrival window. Timing cannot be fully checked.',
} as const;
