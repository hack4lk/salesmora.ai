import { notFoundScreenData as copy } from './not-found-screen.data';

export function NotFoundScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-canvas p-6 text-center">
      <header>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={copy.logoSrc} alt={copy.brandName} width={540} height={144} className="h-auto w-brand-logo" />
      </header>
      <main aria-labelledby="not-found-title" className="w-full max-w-form rounded-3xl border border-line bg-paper p-6 sm:p-10">
        <p className="mb-6 text-display-lg font-semibold text-primary">{copy.code}</p>
        <h1 id="not-found-title" className="mb-3 text-heading font-semibold">{copy.title}</h1>
        <p className="mb-8 leading-relaxed text-muted">{copy.description}</p>
        <nav aria-label={copy.title} className="grid gap-3">
          <a href={copy.signInHref} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-paper hover:bg-primary-dark focus-visible:focus-ring">{copy.signIn}</a>
          <a href={copy.registerHref} className="inline-flex min-h-11 items-center justify-center rounded-xl px-6 py-3 font-semibold text-primary underline underline-offset-2 hover:text-primary-dark focus-visible:focus-ring">{copy.register}</a>
        </nav>
      </main>
    </div>
  );
}
