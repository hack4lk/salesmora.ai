import { siteFooterData as copy } from './site-footer.data';

type LegalLinks = { terms: string; privacy: string };
type StandardLinks = LegalLinks & { support: string };
type MarketingLinks = StandardLinks & { howItWorks: string; faq: string; createAccount: string; signIn: string };

export type SiteFooterProps =
  | { context: 'marketing'; links: MarketingLinks; year: number; currentPage?: 'terms' | 'privacy' }
  | { context: 'workspace' | 'auth'; links: StandardLinks; year: number }
  | { context: 'hosted' | 'embedded' | 'estimate' | 'print'; links: LegalLinks };

const standardLink = 'text-[#315c8a] underline underline-offset-[3px] focus-visible:focus-ring';
const marketingLink = 'text-[15px] text-[#eef5fa] no-underline hover:text-white hover:underline hover:underline-offset-4 focus-visible:focus-ring';

export function SiteFooter(props: SiteFooterProps) {
  if (props.context === 'marketing') {
    const { links, year, currentPage } = props;
    return (
      <footer className="bg-[#23384d] py-14 pb-7 text-[#eef5fa]">
        <div className="mx-auto w-[calc(100%-32px)] max-w-[1120px] min-[601px]:w-[calc(100%-48px)]">
          <div className="grid grid-cols-2 gap-7 min-[851px]:grid-cols-[2fr_1fr_1fr_1fr] min-[851px]:gap-9">
            <div className="col-span-2 min-[601px]:col-span-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={copy.logo} alt={copy.brand} width={190} className="h-auto w-[190px] rounded-lg bg-white p-2" />
              <p className="mt-4 max-w-[300px] text-[15px] leading-6 text-[#d2e0eb]">{copy.tagline}</p>
              <p className="mt-4 max-w-[300px] text-[15px] leading-6 text-[#d2e0eb]">{copy.product}</p>
            </div>
            <nav aria-label={copy.productNavigation}>
              <h2 className="mb-4 text-[15px] font-bold">{copy.productHeading}</h2>
              <ul className="m-0 grid list-none gap-3 p-0"><li><a className={marketingLink} href={links.howItWorks}>{copy.howItWorks}</a></li><li><a className={marketingLink} href={links.faq}>{copy.faq}</a></li></ul>
            </nav>
            <nav aria-label={copy.accountNavigation}>
              <h2 className="mb-4 text-[15px] font-bold">{copy.accountHeading}</h2>
              <ul className="m-0 grid list-none gap-3 p-0"><li><a className={marketingLink} href={links.createAccount}>{copy.createAccount}</a></li><li><a className={marketingLink} href={links.signIn}>{copy.signIn}</a></li></ul>
            </nav>
            <nav aria-label={copy.legalNavigation}>
              <h2 className="mb-4 text-[15px] font-bold">{copy.legalHeading}</h2>
              <ul className="m-0 grid list-none gap-3 p-0"><li><a className={marketingLink} href={links.terms} aria-current={currentPage === 'terms' ? 'page' : undefined}>{copy.terms}</a></li><li><a className={marketingLink} href={links.privacy} aria-current={currentPage === 'privacy' ? 'page' : undefined}>{copy.privacy}</a></li><li><a className={marketingLink} href={links.support}>{copy.support}</a></li></ul>
            </nav>
          </div>
          <div className="mt-8 flex flex-wrap justify-between gap-5 border-t border-[#536a7e] pt-[22px] text-sm text-[#d2e0eb] min-[601px]:mt-[52px]">
            <p className="m-0">© {year} Karpuk Creative, LLC</p><p className="m-0">{copy.madeFor}</p>
          </div>
        </div>
      </footer>
    );
  }

  if (props.context === 'workspace' || props.context === 'auth') {
    const { context, links, year } = props;
    return (
      <footer className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-[#e2eaf1] bg-white px-4 py-5 text-sm leading-5 text-[#52677b] min-[601px]:px-6 min-[851px]:px-12 ${context === 'workspace' ? 'pb-[110px] min-[851px]:pb-6 min-[851px]:pr-[260px]' : ''}`}>
        <p className="m-0">SalesMora is a product of Karpuk Creative, LLC · © {year}</p>
        <nav aria-label={copy.navigation[context]} className="flex flex-wrap gap-x-5 gap-y-2">
          <a className={standardLink} href={links.terms}>{copy.terms}</a>
          <a className={standardLink} href={links.privacy}>{copy.privacy}</a>
          <a className={standardLink} href={links.support}>{copy.support}</a>
        </nav>
      </footer>
    );
  }

  const { context, links } = props;
  return (
    <footer className={`mx-auto mt-6 flex w-full max-w-[760px] flex-wrap items-center justify-between gap-x-5 gap-y-2 text-[13px] leading-5 text-[#52677b] max-[600px]:flex-col max-[600px]:items-start print:hidden ${context === 'embedded' ? 'mt-4 text-xs' : ''}`}>
      <p className="m-0">{copy.product}</p>
      <nav aria-label={copy.navigation[context]} className="flex flex-wrap gap-x-3.5 gap-y-2">
        <a className={standardLink} href={links.terms} target="_blank" rel="noopener noreferrer">{copy.customerTerms} {copy.newTab}</a>
        <a className={standardLink} href={links.privacy} target="_blank" rel="noopener noreferrer">{copy.customerPrivacy} {copy.newTab}</a>
      </nav>
    </footer>
  );
}
