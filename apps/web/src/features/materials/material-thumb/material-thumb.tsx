'use client';

import { useState } from 'react';
import { copy } from './material-thumb.data';

export type MaterialThumbProps = { name: string; imageUrl?: string };

export function MaterialThumb({ name, imageUrl = '' }: MaterialThumbProps) {
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = imageUrl !== '' && failed !== imageUrl;
  return (
    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-canvas text-center text-[10px] font-semibold leading-tight text-muted">
      {/* eslint-disable-next-line @next/next/no-img-element -- catalog images come from arbitrary supplier URLs */}
      {showImage ? <img src={imageUrl} alt={copy.imageAlt(name)} loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover" onError={() => setFailed(imageUrl)} /> : copy.noImage}
    </div>
  );
}
