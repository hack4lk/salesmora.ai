import { afterEach, describe, expect, it } from 'vitest';
import { csvLine } from '../leads/csv';
import { reportExportLimits } from './lead-export';

const original = process.env.REPORT_EXPORT_ROW_LIMIT;
afterEach(() => {
  if (original === undefined) delete process.env.REPORT_EXPORT_ROW_LIMIT;
  else process.env.REPORT_EXPORT_ROW_LIMIT = original;
});
describe('report CSV technical limits and bytes', () => {
  it('uses a bounded configurable technical ceiling and rejects malformed values', () => {
    process.env.REPORT_EXPORT_ROW_LIMIT = '50000'; expect(reportExportLimits().rows).toBe(50000);
    for (const value of ['0', '-1', 'NaN', '1000001', '3.5', ' 12']) {
      process.env.REPORT_EXPORT_ROW_LIMIT = value;
      expect(() => reportExportLimits()).toThrow('Invalid report export limit configuration.');
    }
  });
  it('reuses exact quoted CRLF serialization and neutralizes whitespace/formulas without losing Unicode', () => {
    expect(csvLine(['=1', ' +2', '-3', '@x', '\ttext', '\rtext', '\ntext', 'a,b', 'a"b', 'Łódź', null, 0]))
      .toBe(`"'=1","' +2","'-3","'@x","'\ttext","'\rtext","'\ntext","a,b","a""b","Łódź","","0"\r\n`);
    expect(csvLine(['\uFEFF=1', 'a\r\nb'])).toBe(`"'\uFEFF=1","a\r\nb"\r\n`);
  });
});
