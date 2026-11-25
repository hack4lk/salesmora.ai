import { LegalPage } from '../../features/public-site/legal-page/legal-page';
import { publicSiteLinks } from '../../features/public-site/public-site-links';

export const metadata = { title: 'Terms of Service draft — SalesMora.ai', robots: { index: false, follow: true } };

export default function TermsPage() {
  return <LegalPage document="terms" links={publicSiteLinks} year={new Date().getUTCFullYear()} />;
}
