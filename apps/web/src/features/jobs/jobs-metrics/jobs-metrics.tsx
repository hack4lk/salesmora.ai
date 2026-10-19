import {MetricCard} from '@salesmora/ui';import {copy} from './jobs-metrics.data';
export function JobsMetrics({active,overdue,waiting,unassigned,state='ready'}:{active:number;overdue:number;waiting:number;unassigned:number;state?:'ready'|'loading'|'error'}){
 return <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">{(['active','overdue','waiting','unassigned'] as const).map((key,i)=><MetricCard key={key} state={state} label={copy[key]} value={{active,overdue,waiting,unassigned}[key]} description={copy.descriptions[i]}/>)}</div>;
}
