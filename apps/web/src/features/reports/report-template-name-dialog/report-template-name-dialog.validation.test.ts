import { describe, expect, it } from 'vitest';
import { reportTemplateNameError } from './report-template-name-dialog.validation';

const existing = [{ id: 'one', name: 'Monthly review' }, { id: 'two', name: 'My intake' }];
describe('personal template names', () => {
  it.each(['', ' ', '\n\t', 'a'.repeat(81)])('rejects invalid name %j', name => {
    expect(reportTemplateNameError(name, existing)).toBe('length');
  });
  it('accepts 1 through 80 characters after trimming', () => {
    expect(reportTemplateNameError('a', existing)).toBeUndefined();
    expect(reportTemplateNameError(` ${'a'.repeat(80)} `, existing)).toBeUndefined();
  });
  it.each(['Monthly review', ' monthly REVIEW ', 'My INTAKE'])('rejects duplicate %j', name => {
    expect(reportTemplateNameError(name, existing)).toBe('duplicate');
  });
  it('excludes only the template being renamed', () => {
    expect(reportTemplateNameError('MONTHLY REVIEW', existing, 'one')).toBeUndefined();
    expect(reportTemplateNameError('My intake', existing, 'one')).toBe('duplicate');
  });
  it('allows the same name when the report area has no such template', () => {
    expect(reportTemplateNameError('Monthly review', [])).toBeUndefined();
  });
});
