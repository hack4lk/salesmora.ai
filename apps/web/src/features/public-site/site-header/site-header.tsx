import { siteHeaderData as copy } from './site-header.data';
import { sitePrimaryAction } from '../site-action';

export interface SiteHeaderProps {
  links: {
    home: string;
    product: string;
    plans: string;
    faq: string;
    signIn: string;
    createAccount: string;
  };
}

const navigationLink = 'font-semibold text-[#23384d] no-underline hover:text-[#3b6fa5] hover:underline hover:underline-offset-4 focus-visible:focus-ring';

export function SiteHeader({ links }: SiteHeaderProps) {
  return (
    <header className="border-b border-[#e2eaf1] bg-[#f4f8fc]">
      <div className="mx-auto grid min-h-[78px] w-[calc(100%-32px)] max-w-[1120px] grid-cols-[1fr_auto] items-center gap-x-2 gap-y-4 py-4 min-[401px]:gap-x-4 min-[601px]:w-[calc(100%-48px)] min-[851px]:grid-cols-[1fr_auto_1fr] min-[851px]:gap-6 min-[851px]:py-0 max-[401px]:grid-cols-1">
        <a href={links.home} aria-label={copy.homeLabel} className="justify-self-start focus-visible:focus-ring">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={copy.logo} alt={copy.brand} width={190} className="block h-auto w-[168px] min-[401px]:w-[145px] min-[601px]:w-[190px]" />
        </a>
        <nav aria-label={copy.mainNavigation} className="col-span-2 row-start-2 flex flex-wrap items-center gap-x-5 gap-y-2 min-[601px]:gap-x-7 min-[851px]:col-span-1 min-[851px]:row-auto max-[401px]:col-span-1 max-[401px]:row-start-3">
          <a className={navigationLink} href={links.product}>{copy.product}</a>
          <a className={navigationLink} href={links.plans}>{copy.plans}</a>
          <a className={navigationLink} href={links.faq}>{copy.faq}</a>
        </nav>
        <nav aria-label={copy.accountNavigation} className="flex flex-wrap items-center justify-end gap-3 min-[601px]:gap-7 max-[401px]:row-start-2 max-[401px]:justify-start">
          <a className={navigationLink} href={links.signIn}>{copy.signIn}</a>
          <a href={links.createAccount} className={`${sitePrimaryAction} min-h-11 px-2.5 py-2 min-[601px]:min-h-12 min-[601px]:px-5 min-[601px]:py-[11px]`}>
            {copy.createAccount}
          </a>
        </nav>
      </div>
    </header>
  );
}
