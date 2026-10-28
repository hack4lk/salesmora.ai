'use client';
import { useCallback,useEffect,useRef,useState } from 'react';
import { calendarProposalBindingSchema,calendarProposalViewSchema,type CalendarProposalTicket,type CalendarProposalView } from '@salesmora/contracts';
import { CalendarScheduleDraftCard,type CalendarScheduleDecision } from './calendar-schedule-draft-card';
import { calendarScheduleDraftCardData as copy } from './calendar-schedule-draft-card.data';
import { calendarScheduleChangedEvent } from '../../calendar/calendar-events';
type Props = { ticket:CalendarProposalTicket;workspaceId:string;disabled:boolean;onRefresh:()=>Promise<void> };
const bindingFor = (ticket:CalendarProposalTicket) => calendarProposalBindingSchema.parse({ proposalId:ticket.proposalId,inputHash:ticket.inputHash,visitId:ticket.visitId,revision:ticket.revision });
export function ConnectedCalendarSchedule(props:Props) {
  return <ConnectedReview key={`${props.workspaceId}:${JSON.stringify(props.ticket)}:${props.disabled}`} {...props}/>;
}
function ConnectedReview({ ticket,workspaceId,disabled,onRefresh }:Props) {
  const [view,setView] = useState<CalendarProposalView>(),[state,setState] = useState<'loading'|'unavailable'>('loading');
  const mounted = useRef(false),sequence = useRef(0),lock = useRef(false),controllers = useRef(new Set<AbortController>());
  const invalidate = useCallback(() => { sequence.current++; },[]);
  const request = useCallback(async (decision?:CalendarScheduleDecision['decision']) => {
    const binding = bindingFor(ticket),controller = new AbortController();controllers.current.add(controller);
    try {
      const params = new URLSearchParams({ workspaceId,...binding });
      const response = await fetch(decision ? '/api/chat/calendar/proposals' : `/api/chat/calendar/proposals?${params}`,{ signal:controller.signal,cache:'no-store',...(decision ? { method:'POST',headers:{ 'Content-Type':'application/json' },body:JSON.stringify({ workspaceId,...binding,decision }) } : {}) });
      if (!response.ok) throw Error(); const next = calendarProposalViewSchema.parse((await response.json()).view);
      if (JSON.stringify(bindingFor({ ...next.context,state:next.draft.state })) !== JSON.stringify(binding)) throw Error();
      return next;
    } finally { controllers.current.delete(controller); }
  },[workspaceId,ticket]);
  const load = useCallback(async () => {
    if (disabled || lock.current) return;const token = ++sequence.current;
    try { const next = await request();if (mounted.current && token === sequence.current) setView(next); }
    catch { if (mounted.current && token === sequence.current) { setView(undefined);setState('unavailable'); } }
  },[disabled,request]);
  useEffect(() => {
    mounted.current = true;const active = controllers.current;
    const timer = setTimeout(() => { void load(); },0),recheck = () => { if (document.visibilityState !== 'hidden') void load(); },idle = setInterval(recheck,15000);
    window.addEventListener('focus',recheck);
    return () => { mounted.current = false;invalidate();for (const controller of active) controller.abort();clearTimeout(timer);clearInterval(idle);window.removeEventListener('focus',recheck); };
  },[load,invalidate]);
  async function decide(input:CalendarScheduleDecision) {
    const { decision,...binding } = input;
    if (disabled || lock.current || !view || JSON.stringify(binding) !== JSON.stringify(bindingFor(ticket))) return { ok:false as const,message:copy.states.unavailable };
    lock.current = true;const token = ++sequence.current;
    try {
      const next = await request(decision);
      if (!mounted.current || token !== sequence.current) return { ok:false as const,message:copy.states.unavailable };
      setView(next);
      if (next.draft.state === 'confirmed') window.dispatchEvent(new Event(calendarScheduleChangedEvent));
      try { await onRefresh(); } catch { /* The saved receipt remains authoritative if transcript refresh fails. */ }
      return { ok:true as const };
    } catch {
      if (mounted.current && token === sequence.current) { setView(undefined);setState('unavailable'); }
      return { ok:false as const,message:copy.states.unavailable };
    } finally { lock.current = false; }
  }
  if (disabled || !view) return <section aria-label={copy.title} aria-busy={!disabled && state === 'loading'} className="mt-4 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground"><h3 className="m-0 text-base font-semibold">{copy.title}</h3><p role="status" className="mb-0 mt-3 text-sm leading-6 text-assistant-muted">{disabled ? copy.states.unavailable : copy.states[state]}</p></section>;
  return <CalendarScheduleDraftCard draft={view.draft} context={view.context} onDecide={decide}/>;
}
