import { EstimatePreviewPaper } from "../estimate-preview-paper/estimate-preview-paper";
import type { EstimatePaperSource } from "../estimate-preview-paper/estimate-preview-paper.preview";
import { estimateButton } from "../estimate-ui";

export function EstimateDraftPreviewPage({
  source,
  backHref,
}: {
  source: EstimatePaperSource;
  backHref: string;
}) {
  return (
    <section className="grid min-w-0 gap-6">
      <header className="mx-auto grid w-full max-w-letter gap-3 print:hidden">
        <a href={backHref} className={`${estimateButton} justify-self-start`}>
          {source.state === "draft" ? "Back to edit" : "Back to estimate"}
        </a>
        <h1 className="m-0 text-heading font-semibold">Estimate preview</h1>
        <p className="m-0 text-sm leading-6 text-muted">
          {source.state === "draft"
            ? "Review the saved Draft as customer-facing paper. It is not sent or published."
            : "Review the frozen customer paper. Later business-profile or catalog changes do not alter this revision."}
        </p>
      </header>
      <EstimatePreviewPaper source={source} />
    </section>
  );
}
