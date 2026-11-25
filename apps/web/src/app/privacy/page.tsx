import { LegalPage } from '../../features/public-site/legal-page/legal-page';
import { publicSiteLinks } from '../../features/public-site/public-site-links';

export const metadata = { title: 'Privacy Policy draft — SalesMora.ai', robots: { index: false, follow: true } };

export default function PrivacyPage() {
  return <LegalPage document="privacy" links={publicSiteLinks} year={new Date().getUTCFullYear()} />;
}
