'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreateLeadForm, type CreateLeadValues } from './create-lead-form';
import { createLeadFormData } from './create-lead-form.data';
import { createLeadRouteData as copy } from './create-lead-route.data';
export function CreateLeadRoute({ workspaceId, owners }: { workspaceId: string; owners: ReadonlyArray<{ id: string; name: string }> }) {
  const router = useRouter();
  const submissionId = useRef<string | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [version, setVersion] = useState(0);
  const homeHref = `/home?workspace=${encodeURIComponent(workspaceId)}`;
  async function submit(lead: CreateLeadValues) {
    submissionId.current ??= crypto.randomUUID();
    try {
      const response = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId, submissionId: submissionId.current, lead }) });
      if (!response.ok) {
        const data = await response.json();
        return { ok: false as const, message: data.error || createLeadFormData.errors.submission };
      }
      setSaved(true);
      router.refresh();
      return { ok: true as const };
    } catch { return { ok: false as const, message: createLeadFormData.errors.submission }; }
  }
  return <div className="grid gap-6">
    <CreateLeadForm key={version} owners={owners} onSubmit={submit} onCancel={() => router.push(homeHref)} successMessage={copy.success} />
    {saved && <div className="flex flex-wrap gap-6">
      <Link href={homeHref} className="rounded-xl text-primary underline focus-visible:focus-ring">{copy.back}</Link>
      <button type="button" onClick={() => { submissionId.current = undefined; setSaved(false); setVersion(value => value + 1); }} className="rounded-xl text-primary underline focus-visible:focus-ring">{copy.another}</button>
    </div>}
  </div>;
}
