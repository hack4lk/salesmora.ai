'use client';

import { useRef, useState } from 'react';
import { WorkspaceNavigation } from '@salesmora/ui';
import { CaptureReviewPage } from './capture-review-page';
import { captureReviewPageData as copy } from './capture-review-page.data';
import { captureReviewFixture, captureReviewResultFixture } from './capture-review-page.fixtures';
import type { CaptureSetupDestination } from '../capture-setup-header/capture-setup-header';
import type { CaptureReviewLaunchResult, CaptureReviewLaunchRequest } from './capture-review-page.validation';
import type { CaptureReviewSection, CaptureLaunchValue, CaptureSetupReviewDraft } from '../capture-setup-review/capture-setup-review.validation';
export type CaptureReviewPagePreviewProps = {
  initialDraft?: CaptureSetupReviewDraft; initialValue?: CaptureLaunchValue; canRead?: boolean; canEdit?: boolean; canLaunch?: boolean; revision?: boolean;
  failOnce?: boolean; holdLaunch?: boolean; invalidResult?: boolean; changeDuringLaunch?: boolean; failCopy?: boolean;
  onApprove?: (request: CaptureReviewLaunchRequest) => Promise<void>;
  onLaunch: (request: CaptureReviewLaunchRequest) => void;
  onEdit: (section: CaptureReviewSection) => void; onNavigate: (destination: CaptureSetupDestination) => void; onOpenSource: (source: CaptureReviewLaunchResult) => void; onOpenIntake: (source: CaptureReviewLaunchResult) => void; onCopy: (text: string) => void;
};
const clock = () => Date.parse(copy.stories.now);
/** Explicit simulation: no routing, launch, OAuth, hosting, clipboard or persistence side effects. */
export function CaptureReviewPagePreview({ initialDraft = captureReviewFixture(), initialValue = { mode: 'now', localDateTime: '' }, canRead = true, canEdit = true, canLaunch = true, revision = false, failOnce = false, holdLaunch = false, invalidResult = false, changeDuringLaunch = false, failCopy = false, onApprove, onLaunch, onEdit, onNavigate, onOpenSource, onOpenIntake, onCopy }: CaptureReviewPagePreviewProps) {
  const [draft, setDraft] = useState(initialDraft), [value, setValue] = useState(initialValue), [message, setMessage] = useState(''), count = useRef(0);
  return <div className="min-h-screen bg-canvas text-ink md:flex">
    <WorkspaceNavigation workspaceName={copy.stories.workspace} user={{ name: copy.stories.viewer, email: copy.stories.email, role: 'owner' }} currentPage="campaigns" contentId="capture-review-preview-content" authorizedPages={canRead ? ['home', 'campaigns', 'settings'] : ['home', 'settings']} availablePages={['campaigns']} onNavigate={() => {}} onAccountSettings={() => {}} onSignOut={() => {}} accountSettingsAvailable={false} />
    <main id="capture-review-preview-content" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 focus-visible:focus-ring sm:px-8 sm:py-8"><p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.stories.description}</p>{message && canRead && <p role="status" className="mb-5 mt-0 text-sm text-muted">{message}</p>}
      <CaptureReviewPage onApprove={onApprove} draft={draft} value={value} canRead={canRead} canEdit={canEdit} canLaunch={canLaunch} revision={revision} now={clock} onChange={setValue}
        onEdit={section => { onEdit(section); setMessage(copy.stories.navigation); }} onNavigate={destination => { onNavigate(destination); setMessage(copy.stories.navigation); }}
        onLaunch={async request => { onLaunch(request); count.current += 1; if (holdLaunch) await new Promise<void>(() => {}); if (failOnce && count.current === 1) throw new Error(copy.stories.failure); if (changeDuringLaunch) { setDraft({ ...draft, version: draft.version + 1 }); await new Promise<void>(resolve => setTimeout(resolve, 20)); } const result = captureReviewResultFixture(request); return invalidResult ? { ...result, draftVersion: request.draft.version + 1 } : result; }}
        onCopy={async text => { onCopy(text); if (failCopy) throw new Error(copy.stories.failure); }} onOpenSource={source => { onOpenSource(source); setMessage(copy.stories.dashboard); }} onOpenIntake={source => { onOpenIntake(source); setMessage(copy.stories.intake); }} />
    </main>
  </div>;
}
