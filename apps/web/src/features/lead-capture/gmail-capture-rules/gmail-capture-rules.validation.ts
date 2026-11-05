import { gmailCaptureRulesData as copy } from './gmail-capture-rules.data';

export type GmailCaptureRulesValue = {
  location: 'subject' | 'body' | 'both';
  mode: 'all' | 'any';
  phrases: readonly { id: string; text: string }[];
};
export type GmailCaptureRuleIssue = { phraseId?: string; message: string };
export function validateGmailCaptureRules(value: GmailCaptureRulesValue): GmailCaptureRuleIssue[] {
  const issues: GmailCaptureRuleIssue[] = [];
  if (!['subject', 'body', 'both'].includes(value.location)) issues.push({ message: copy.errors.location });
  if (!['all', 'any'].includes(value.mode)) issues.push({ message: copy.errors.mode });
  if (value.phrases.length < 1 || value.phrases.length > 20) issues.push({ message: copy.errors.count });
  const ids = new Set<string>(), texts = new Set<string>();
  for (const phrase of value.phrases) {
    const text = phrase.text.trim().toLowerCase();
    if (!phrase.id || ids.has(phrase.id)) issues.push({ phraseId: phrase.id, message: copy.errors.identity });
    if (!text || phrase.text.length > 200) issues.push({ phraseId: phrase.id, message: copy.errors.text });
    if (text && texts.has(text)) issues.push({ phraseId: phrase.id, message: copy.errors.duplicate });
    ids.add(phrase.id); texts.add(text);
  }
  return issues;
}
/** Literal local matcher for later sample previews. Invalid drafts never become catch-all rules. */
export function matchesGmailCaptureRules(value: GmailCaptureRulesValue, message: { subject: string; body: string }): boolean {
  if (validateGmailCaptureRules(value).length) return false;
  const parts = (value.location === 'both' ? [message.subject, message.body] : [message[value.location]]).map(part => part.toLowerCase());
  const matches = value.phrases.map(phrase => parts.some(part => part.includes(phrase.text.trim().toLowerCase())));
  return value.mode === 'all' ? matches.every(Boolean) : matches.some(Boolean);
}
