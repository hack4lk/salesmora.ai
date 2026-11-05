import 'server-only';
import { captureGmailConfiguration, googleCaptureProvider, CaptureGmailProviderError } from '@salesmora/data/lead-capture/gmail-provider';
export function gmailConnectionConfiguration() {
  const config = captureGmailConfiguration(process.env);
  if (!config) throw new CaptureGmailProviderError('configuration');
  return config;
}
export function gmailConnectionProvider() { const config = gmailConnectionConfiguration(); return { config, provider: googleCaptureProvider(config) }; }
