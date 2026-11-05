import { validateCaptureFormFields, type CaptureFormFieldEditorValue } from '../capture-form-field-editor/capture-form-field-editor.validation';
import { validateVisitorCapture } from '../visitor-capture-form/visitor-capture-form.validation';
export type IntakeProposedAnswers = Record<string, string | string[]>;
export type IntakeEditorRecord = { id: string; version: number; resolved: boolean };
export function validIntakeEditorDefinition(record: IntakeEditorRecord, definition: CaptureFormFieldEditorValue): boolean {
  return !!record.id.trim() && Number.isSafeInteger(record.version) && record.version > 0 && validateCaptureFormFields(definition).length === 0
    && definition.contactRequired && ['name', 'service'].every(key => definition.fields.some(field => field.key === key && field.required));
}
/** Same field/choice/contact checks as public capture; authoritative lead validation remains server-side. */
export function validateIntakeProposedAnswers(definition: CaptureFormFieldEditorValue, answers: IntakeProposedAnswers): Record<string, string> {
  return validateVisitorCapture(definition, { answers, consent: true, website: '' }).fields;
}
export function intakeAnswerEdited(original: string | string[] | undefined, current: string | string[] | undefined): boolean {
  if (Array.isArray(original) || Array.isArray(current)) {
    const left = Array.isArray(original) ? original : [], right = Array.isArray(current) ? current : [];
    return left.length !== right.length || left.some(value => !right.includes(value));
  }
  return (original ?? '') !== (current ?? '');
}
