import { HomePage } from '../features/public-site/home-page/home-page';
import { publicSiteLinks } from '../features/public-site/public-site-links';

export default function PublicHomePage() {
  return <HomePage links={publicSiteLinks} year={new Date().getUTCFullYear()} />;
}
