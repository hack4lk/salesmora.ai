import { describe, expect, it } from 'vitest';
import { csvCell, csvLine, leadCSVHeaders } from './csv';

describe('lead CSV encoding', () => {
  it('quotes commas, quotes, multiline content and Unicode without losing data', () => {
    expect(csvLine(['Renée, 李', 'A "quote"\nNext line', null])).toBe('"Renée, 李","A ""quote""\nNext line",""\r\n');
    expect(leadCSVHeaders).toHaveLength(16);
  });
  it('neutralizes formulas including whitespace, BOM, tab and CR prefixes', () => {
    for (const text of ['=1+1', '+cmd', '-2+1', '@SUM(A1)', '\tformula', '\rformula', '\nformula', '  =1+1', '\uFEFF=1+1']) expect(csvCell(text)).toBe(`"'${text}"`);
    expect(csvCell('Normal text')).toBe('"Normal text"');
  });
});
