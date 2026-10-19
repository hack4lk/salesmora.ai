import type { HelpSection } from '@salesmora/contracts';
import { helpArticleData as copy } from './help-article.data';
export function HelpArticle({ title, sections, workspaceHref }: { title: string; sections: readonly HelpSection[]; workspaceHref: string }) {
  return <main className="min-h-screen bg-canvas px-6 py-8 sm:px-10 sm:py-12">
    <div className="mx-auto max-w-4xl wrap-anywhere">
      <a href={workspaceHref} className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4 focus-visible:focus-ring">{copy.back}</a>
      <article className="mt-6 rounded-2xl border border-line bg-paper p-6 sm:p-10">
        <header><p className="mb-3 mt-0 text-sm font-semibold text-primary">{copy.eyebrow}</p>
          <h1 className="m-0 text-heading font-semibold text-ink sm:text-heading-lg">{title}</h1>
          <p className="mb-0 mt-4 leading-relaxed text-muted">{copy.description}</p></header>
        <nav aria-label={copy.contents} className="my-8 rounded-xl border border-line bg-canvas p-5">
          <p className="m-0 font-semibold text-ink">{copy.contents}</p>
          <ul className="mb-0 mt-3 pl-5">{sections.map(section => <li key={section.anchor}><a href={`#${section.anchor}`} className="inline-flex min-h-11 items-center text-primary underline underline-offset-4 focus-visible:focus-ring">{section.heading}</a></li>)}</ul>
        </nav>
        {sections.map(section => <section key={section.anchor} id={section.anchor} className="mt-8 scroll-mt-8">
          <h2 className="mb-3 mt-0 text-xl font-semibold text-ink">{section.heading}</h2>
          {section.text.split(/\n\s*\n/).map((paragraph, index) => <p key={index} className="my-3 whitespace-pre-line leading-relaxed text-ink">{paragraph}</p>)}
        </section>)}
      </article>
    </div>
  </main>;
}
