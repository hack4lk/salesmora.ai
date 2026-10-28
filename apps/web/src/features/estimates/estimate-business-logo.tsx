"use client";

import { useState } from "react";
import Image from "next/image";
import { estimatePreviewPaperData as c } from "./estimate-preview-paper/estimate-preview-paper.data";
import { isEstimatePaperLogoPath } from "./estimate-preview-paper/estimate-preview-paper.preview";

type Props = { name: string; logoPath: string | null; onError?: () => void };

export function EstimateBusinessLogo(props: Props) {
  return <BusinessLogoImage key={props.logoPath} {...props} />;
}

function BusinessLogoImage({ name, logoPath, onError }: Props) {
  const [failed, setFailed] = useState(false);
  return logoPath && isEstimatePaperLogoPath(logoPath) && !failed
    ? <Image unoptimized loading="eager" src={logoPath} alt={c.logo(name)} width={48} height={48}
      className="size-12 shrink-0 object-contain" onError={() => { setFailed(true); onError?.(); }} />
    : <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-xl border border-primary text-xl font-bold text-primary">{name.trim().slice(0, 1)}</span>;
}
