import { LegalDocument } from '../legal-document/legal-document';
import { privacyDocumentData } from './privacy-document.data';

export function PrivacyDocument() {
  return <LegalDocument {...privacyDocumentData} />;
}
