/** Only recognized constraint failures get a user-facing validation message; never expose SQL text. */
export function calendarWorkTimeErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error && error.code === '23514' && 'constraint' in error &&
    (error.constraint === 'calendar_work_time_valid' || error.constraint === 'calendar_work_time_clock'))
    return 'Choose a valid planned work time outside a daylight-saving clock change.';
  return undefined;
}
