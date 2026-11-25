import { expect, it } from 'vitest';
import { calendarWorkTimeErrorMessage } from './work-time-error';
it('maps only planned-work constraint failures without exposing database text', () => {
  for (const constraint of ['calendar_work_time_valid', 'calendar_work_time_clock'])
    expect(calendarWorkTimeErrorMessage({ code: '23514', constraint, message: 'private SQL' })).toBe('Choose a valid planned work time outside a daylight-saving clock change.');
  for (const error of [null, Error('private SQL'), { code: '23514', constraint: 'another_constraint' }, { code: '42501', constraint: 'calendar_work_time_clock' }])
    expect(calendarWorkTimeErrorMessage(error)).toBeUndefined();
});
