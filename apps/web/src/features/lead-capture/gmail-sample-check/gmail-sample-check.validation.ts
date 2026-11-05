import { matchesGmailCaptureRules, validateGmailCaptureRules, type GmailCaptureRulesValue } from '../gmail-capture-rules/gmail-capture-rules.validation';

/** Derived from the current rule and sample; never reuse a prior sample's result. */
export function checkGmailSample(rules: GmailCaptureRulesValue, sample: { subject: string; body: string } | null) {
  if (!sample) return { status: 'missing' as const, phrases: [] };
  if (validateGmailCaptureRules(rules).length) return { status: 'invalid' as const, phrases: [] };
  return {
    status: matchesGmailCaptureRules(rules, sample) ? 'matches' as const : 'noMatch' as const,
    phrases: rules.phrases.map(phrase => {
      const single = { ...rules, phrases: [phrase] };
      const subject = rules.location !== 'body' && matchesGmailCaptureRules({ ...single, location: 'subject' }, sample);
      const body = rules.location !== 'subject' && matchesGmailCaptureRules({ ...single, location: 'body' }, sample);
      return { ...phrase, location: subject && body ? 'both' as const : subject ? 'subject' as const : body ? 'body' as const : 'none' as const };
    }),
  };
}
