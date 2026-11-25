import { LegalDocument } from '../legal-document/legal-document';
import { termsDocumentData } from './terms-document.data';

export function TermsDocument() {
  return <LegalDocument {...termsDocumentData} />;
}
