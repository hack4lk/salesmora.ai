export const jobButton='min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary wrap-anywhere hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
export const jobPrimary='min-h-11 max-w-full cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper wrap-anywhere hover:bg-primary-dark focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
export const jobPanel='min-w-0 rounded-2xl border border-line bg-paper p-5 text-ink sm:p-6';
export const jobInput='min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:bg-canvas';
export const jobLabel='grid min-w-0 gap-2 text-sm font-semibold text-ink';
export function jobDate(value:string|null){if(!value)return '—';const day=value.slice(0,10);return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(day+'T12:00:00Z'));}
export function jobInitials(name:string){return name.split(/\s+/u).slice(0,2).map(p=>p[0]).join('').toUpperCase();}
export function fileSize(bytes:number){return new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(bytes/1000000)+' MB';}

export function jobTimestamp(value:string,timezone='UTC'){return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZone:timezone,timeZoneName:'short'}).format(new Date(value));}
