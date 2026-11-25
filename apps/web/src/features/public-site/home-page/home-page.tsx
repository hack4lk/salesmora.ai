import { HomeCta } from '../home-cta/home-cta';
import { HomeFaq } from '../home-faq/home-faq';
import { HomeHero } from '../home-hero/home-hero';
import { HowItWorks } from '../how-it-works/how-it-works';
import { PlanOverview } from '../plan-overview/plan-overview';
import { ProductFeatures } from '../product-features/product-features';
import { SiteFooter, type SiteFooterProps } from '../site-footer/site-footer';
import { SiteHeader, type SiteHeaderProps } from '../site-header/site-header';
import styles from '../site-skip-link.module.css';

export interface HomePageProps {
  links: SiteHeaderProps['links'] & Extract<SiteFooterProps, { context: 'marketing' }>['links'];
  year: number;
}

export function HomePage({ links, year }: HomePageProps) {
  return (
    <>
      <a href="#main" className={styles.skip}>Skip to content</a>
      <SiteHeader links={links} />
      <main id="main">
        <HomeHero links={links} />
        <ProductFeatures />
        <HowItWorks />
        <PlanOverview createAccountHref={links.createAccount} />
        <HomeFaq />
        <HomeCta links={links} />
      </main>
      <SiteFooter context="marketing" links={links} year={year} />
    </>
  );
}
