'use client';
import {copy} from './work-order-print-paper.data';
import {woButton,woPrimary} from '../work-order-ui';

export function WorkOrderPrintToolbar({backHref}:{backHref:string}){
 return <div className="mx-auto mb-4 flex w-full max-w-[8.5in] flex-wrap items-center justify-between gap-3 print:hidden"><a href={backHref} className={`${woButton} inline-flex items-center no-underline`}>{copy.back}</a>
  <button type="button" onClick={()=>window.print()} className={woPrimary}>{copy.saveAsPdf}</button></div>;
}
