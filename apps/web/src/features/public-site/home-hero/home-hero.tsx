import { sitePrimaryAction } from '../site-action';
import { homeHeroData as copy } from './home-hero.data';
import styles from './home-hero.module.css';

export interface HomeHeroProps {
  links: { createAccount: string; product: string };
}

export function HomeHero({ links }: HomeHeroProps) {
  return (
    <div className="relative isolate overflow-hidden bg-[#f4f8fc] before:pointer-events-none before:absolute before:-top-[220px] before:-left-[200px] before:-z-10 before:h-[520px] before:w-[520px] before:rounded-full before:border before:border-[#3b6fa51c] before:shadow-[0_0_0_30px_rgb(59_111_165_/_0.035),0_0_0_65px_rgb(59_111_165_/_0.025)] before:content-['']">
      <div className="pointer-events-none relative z-10 mx-auto flex w-[calc(100%-32px)] max-w-[1120px] items-center pt-12 pb-8 min-[601px]:w-[calc(100%-48px)] min-[601px]:pt-16 min-[601px]:pb-12 min-[851px]:min-h-[590px] min-[851px]:pb-20">
        <div className="pointer-events-auto w-full min-[851px]:w-[44%]">
          <h1 className="m-0 max-w-[600px] text-[40px] leading-[1.08] font-semibold tracking-[-0.035em] text-[#3b6fa5] min-[601px]:text-[clamp(42px,5vw,62px)]">{copy.title}</h1>
          <p className="mt-6 mb-0 max-w-[550px] text-[18px] leading-[1.6] text-[#276c68] min-[601px]:text-[20px]">{copy.description}</p>
          <div className="mt-[30px] flex flex-wrap items-center gap-3">
            <a href={links.createAccount} className={`${sitePrimaryAction} min-h-12 px-5 py-[11px]`}>{copy.createAccount}</a>
            <a href={links.product} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#3b6fa5] bg-white px-5 py-[11px] text-center font-semibold text-[#3b6fa5] no-underline hover:bg-[#edf4fa] focus-visible:focus-ring">{copy.explore}</a>
          </div>
        </div>
      </div>
      <div className="relative h-[330px] w-full min-[601px]:h-[420px] min-[851px]:absolute min-[851px]:inset-y-0 min-[851px]:right-0 min-[851px]:h-full min-[851px]:w-[55%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={copy.image} alt={copy.imageAlt} className="block h-full w-full object-cover object-center [mask-image:linear-gradient(to_bottom,transparent_0%,#000_12%)] min-[851px]:[mask-image:linear-gradient(to_right,transparent_0%,#000_20%)]" />
        <div className={`${styles.assistantPreview} absolute right-[6%] bottom-[14%] max-w-[300px] rounded-2xl border border-[#cfe0eb] bg-white p-[18px] shadow-[0_16px_40px_#23384d24]`}>
          <strong className="block text-[15px]">{copy.previewTitle}</strong>
          <span className="mt-1.5 block text-sm leading-[1.4] text-[#52677b]">{copy.previewDescription}</span>
        </div>
      </div>
    </div>
  );
}
