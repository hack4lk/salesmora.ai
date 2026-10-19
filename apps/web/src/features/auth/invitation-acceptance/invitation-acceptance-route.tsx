'use client';
import { useState } from 'react';
import { FormFeedback } from '@salesmora/ui';
import type { InvitationView } from '../../../server/invitations/store';
import { InvitationAcceptance, type InvitationAcceptanceResult } from './invitation-acceptance';
import type { RegistrationSubmission } from '../registration-form/registration-form';
import { invitationAcceptanceData as copy } from './invitation-acceptance.data';
export function InvitationAcceptanceRoute({ view,token,currentEmail }: {view:InvitationView;token?:string;currentEmail?:string}) {
  const [navigationPending,setNavigationPending] = useState(false);
  const [navigationError,setNavigationError] = useState(false);
  const [workspaceId,setWorkspaceId] = useState('workspaceId' in view?view.workspaceId:undefined);
  async function authenticate(switchAccount=false) {
    if (navigationPending) return;
    setNavigationPending(true);setNavigationError(false);
    try {
      const context = await fetch('/api/invitations/context',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});
      if (!context.ok) throw new Error('Invitation context unavailable.');
      if (switchAccount && !(await fetch('/api/auth/sign-out',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:'{}'})).ok) throw new Error('Sign out unavailable.');
      window.location.assign('/login');
    } catch { setNavigationError(true);setNavigationPending(false); }
  }
  async function createAccount(values: RegistrationSubmission) {
    if (!('invitation' in view) || view.availability !== 'ready' || !token) return {ok:false as const,message:copy.accountError};
    const response = await fetch('/api/auth/sign-up/email',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,email:view.invitation.email})});
    if (!response.ok) return {ok:false as const,message:copy.accountError};
    // Re-resolve the invitation and matching session before explicit membership acceptance.
    window.location.reload();
    return {ok:true as const};
  }
  async function accept():Promise<InvitationAcceptanceResult> {
    const response = await fetch('/api/invitations/accept',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});
    const result = await response.json().catch(()=>({ok:false}));
    if (response.ok && result.ok) { setWorkspaceId(result.workspaceId);return {ok:true}; }
    if (response.status===401) { window.location.reload();return {ok:false}; }
    return {ok:false,reason:result.reason};
  }
  async function continueTo(path:string) {
    try {
      const response = await fetch('/api/invitations/context',{method:'DELETE',credentials:'same-origin'});
      if (!response.ok) throw new Error('Context unavailable.');
      window.location.assign(path);
    } catch { setNavigationError(true); }
  }
  const actions = {currentEmail,disabled:navigationPending,onAccept:accept,onCreateAccount:createAccount,onSignIn:()=>{void authenticate();},onSwitchAccount:()=>{void authenticate(true);},onContinue:()=>{void continueTo(`/home?workspace=${encodeURIComponent(workspaceId??'')}`);}};
  return <div className="grid min-w-0 gap-6">
    {navigationError && <FormFeedback kind="error" title={copy.page.authErrorTitle} message={copy.page.authError} />}
    {'invitation' in view?<InvitationAcceptance {...actions} invitation={view.invitation} availability={view.availability}/>:<InvitationAcceptance {...actions} availability={view.availability}/>}
    {!('invitation' in view) && <button type="button" onClick={()=>{void continueTo(currentEmail?'/setup':'/login');}} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring">{copy.page.leave}</button>}
  </div>;
}
