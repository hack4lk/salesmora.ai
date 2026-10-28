'use client';
import { useEffect,useLayoutEffect,useRef } from 'react';
/** Invalidates visible business data after a server-confirmed chat mutation; never grants authority. */
export const calendarScheduleChangedEvent = 'salesmora:calendar-schedule-saved';
/** Keep each route's existing scoped reload and filters, rather than remounting it after a chat save. */
export function useCalendarScheduleRefresh(refresh:()=>void | Promise<unknown>) {
  const current = useRef(refresh);
  useLayoutEffect(() => { current.current = refresh; },[refresh]);
  useEffect(() => {
    const reload = () => { void Promise.resolve(current.current()).catch(() => undefined); };
    window.addEventListener(calendarScheduleChangedEvent,reload);
    return () => window.removeEventListener(calendarScheduleChangedEvent,reload);
  },[]);
}
