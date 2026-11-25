import { productFeaturesData as copy } from './product-features.data';

const icons = {
  assistant: (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-16 w-16">
      <rect x="10" y="13" width="36" height="31" rx="10" fill="#3b6fa5" /><path d="M20 43l-3 7 11-7" fill="#3b6fa5" />
      <rect x="17" y="21" width="9" height="9" rx="2" fill="#b2e9db" /><rect x="29" y="21" width="9" height="9" rx="2" fill="#f4f8fc" />
      <rect x="17" y="33" width="9" height="6" rx="2" fill="#7ccbb7" /><rect x="29" y="33" width="9" height="6" rx="2" fill="#8db5d5" />
      <circle cx="49" cy="18" r="7" fill="#7ccbb7" /><path d="M49 14v8m-4-4h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  workflow: (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-16 w-16">
      <path d="M17 25h13c8 0 8 15 16 15" fill="none" stroke="#3b6fa5" strokeWidth="4" strokeLinecap="round" />
      <rect x="7" y="15" width="18" height="18" rx="5" fill="#7ccbb7" /><rect x="39" y="31" width="18" height="18" rx="5" fill="#3b6fa5" />
      <rect x="12" y="20" width="8" height="8" rx="2" fill="#f4f8fc" /><path d="M44 40l3 3 6-7" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="38" cy="17" r="5" fill="#b2e9db" />
    </svg>
  ),
  connected: (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-16 w-16">
      <rect x="9" y="12" width="27" height="33" rx="6" fill="#8db5d5" /><rect x="17" y="19" width="27" height="33" rx="6" fill="#3b6fa5" /><rect x="25" y="26" width="27" height="27" rx="6" fill="#7ccbb7" />
      <path d="M31 34h15M31 40h11M31 46h8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" /><circle cx="49" cy="16" r="6" fill="#b2e9db" />
    </svg>
  ),
};

const iconBackground = { assistant: 'bg-[#e4f4f0]', workflow: 'bg-[#e8f1fb]', connected: 'bg-[#ebf7f4]' };

export function ProductFeatures() {
  return (
    <section id="product" aria-labelledby="product-heading" className="scroll-mt-6 bg-white py-16 min-[601px]:py-[88px]">
      <div className="mx-auto w-[calc(100%-32px)] max-w-[1120px] min-[601px]:w-[calc(100%-48px)]">
        <div className="mb-9 max-w-[660px]">
          <p className="m-0 mb-4 text-[13px] font-bold tracking-[0.1em] text-[#276c68] uppercase">{copy.eyebrow}</p>
          <h2 id="product-heading" className="m-0 text-[clamp(30px,3vw,40px)] leading-[1.18] font-semibold tracking-[-0.025em] text-[#276c68]">{copy.title}</h2>
          <p className="mt-3.5 mb-0 text-lg leading-[1.6] text-[#52677b]">{copy.description}</p>
        </div>
        <div className="grid gap-5 min-[601px]:grid-cols-2 min-[851px]:grid-cols-3">
          {copy.features.map(feature => (
            <article key={feature.icon} className="rounded-2xl border border-[#e2eaf1] bg-white p-7 text-center">
              <span className={`mx-auto grid h-[76px] w-[76px] place-items-center rounded-[22px] ${iconBackground[feature.icon]}`}>{icons[feature.icon]}</span>
              <h3 className="mt-[18px] mb-2 text-[21px] font-semibold text-[#315c8a]">{feature.title}</h3>
              <p className="m-0 leading-[1.6] text-[#52677b]">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
