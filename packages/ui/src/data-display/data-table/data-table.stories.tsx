import {useState} from 'react';
import type {Meta,StoryObj} from '@storybook/react';
import {expect,fn,userEvent,within} from 'storybook/test';
import {DataTable,type DataTableProps,type DataTableColumn} from './data-table';
import {dataTableData as copy} from './data-table.data';
type Row=typeof copy.stories.rows[number];
type PreviewProps=Omit<DataTableProps<Row>,'columns'|'getRowId'|'getRowLabel'|'renderCard'|'rows'>&{rows?:readonly Row[]};
const link=(row:Row)=><a href={copy.stories.link(row.id)} onClick={event=>event.preventDefault()} className="rounded-lg font-semibold text-primary hover:underline focus-visible:focus-ring">{row.name}</a>;
const columns:DataTableColumn<Row>[]=[
 {id:'name',label:copy.stories.lead,render:link,sortable:true},
 {id:'service',label:copy.stories.service,render:row=>row.service,sortable:true},
 {id:'stage',label:copy.stories.stage,render:row=>row.stage,sortable:true},
 {id:'source',label:copy.stories.source,render:row=>row.source,sortable:true},
 {id:'owner',label:copy.stories.owner,render:row=>row.owner??copy.stories.unassigned,sortable:true},
 {id:'created',label:copy.stories.created,render:row=>row.created,sortable:true},
];
function Preview(args:PreviewProps){
 const [sort,setSort]=useState(args.sort??{column:'created',direction:'desc' as const});
 const [selected,setSelected]=useState<readonly string[]>(args.selectedIds??[]);
 const [opened,setOpened]=useState('');
 const rows=[...(args.rows??copy.stories.rows)].sort((left,right)=>{
  const key=sort.column as keyof Row;
  if(key==='owner'&&(!left.owner||!right.owner))return !left.owner?(!right.owner?0:1):-1;
  const order=key==='stage'?copy.stories.stageOrder.indexOf(left.stage)-copy.stories.stageOrder.indexOf(right.stage):key==='created'?copy.stories.rows.indexOf(right)-copy.stories.rows.indexOf(left):String(left[key]??copy.stories.unassigned).localeCompare(String(right[key]??copy.stories.unassigned));
  return sort.direction==='asc'?order:-order;
 });
 return <div className="grid min-w-0 gap-4"><DataTable {...args} rows={rows} columns={columns} getRowId={row=>row.id} getRowLabel={row=>row.name} sort={sort}
   onSort={args.onSort?(column,direction)=>{args.onSort?.(column,direction);setSort({column,direction});}:undefined}
   selectedIds={selected} onSelectionChange={args.onSelectionChange?ids=>{setSelected(ids);args.onSelectionChange?.(ids);}:undefined}
   onRowOpen={args.onRowOpen?row=>{setOpened(copy.stories.opened(row.name));args.onRowOpen?.(row);}:undefined}
   renderCard={row=><div className="grid min-w-0 gap-3"><div>{link(row)}<p className="mb-0 mt-1 text-sm text-muted">{row.service}</p></div><dl className="m-0 grid gap-2 text-sm">{[[copy.stories.stage,row.stage],[copy.stories.owner,row.owner??copy.stories.unassigned],[copy.stories.created,row.created]].map(([label,value])=><div key={label} className="flex flex-wrap justify-between gap-2"><dt className="text-muted">{label}</dt><dd className="m-0 font-semibold">{value}</dd></div>)}</dl></div>}/>
   {args.onSelectionChange&&<p role="status" className="m-0 text-sm text-muted">{copy.stories.selected(selected.length)}</p>}
   {opened&&<p role="status" className="m-0 text-sm text-primary">{opened}</p>}
 </div>;
}
const meta={title:'Data display/DataTable',component:Preview,parameters:{layout:'fullscreen'},
 args:{caption:copy.stories.caption,rows:copy.stories.rows,onSort:fn(),onRowOpen:fn()},
 decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><header className="mb-6"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-3 text-sm leading-6 text-muted">{copy.stories.description}</p></header><Story/></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Default:Story={play:async({canvasElement})=>{const c=within(canvasElement);await expect(c.getByRole('region',{name:copy.stories.caption})).toBeVisible();await expect(c.getByRole('link',{name:copy.stories.rows[0].name})).toBeVisible();}};
export const Sorted:Story={args:{sort:{column:'name',direction:'asc'}}};
export const Selectable:Story={args:{onSelectionChange:fn(),selectedIds:['jordan']},play:async({canvasElement,args})=>{
 const c=within(canvasElement);await expect(c.getByRole('checkbox',{name:copy.selectRow(copy.stories.rows[0].name)})).toBeChecked();
 await userEvent.click(c.getByRole('checkbox',{name:copy.selectPage}));
 await expect(c.getByRole('status')).toHaveTextContent(copy.stories.selected(5));
 await expect(args.onRowOpen).not.toHaveBeenCalled();
}};
export const Loading:Story={args:{state:'loading',onSelectionChange:fn()},play:async({canvasElement})=>{
 const c=within(canvasElement);await expect(c.getByRole('region',{name:copy.stories.caption})).toHaveAttribute('aria-busy','true');await expect(c.getByRole('status')).toHaveTextContent(copy.loading);await expect(c.queryByRole('checkbox')).not.toBeInTheDocument();
}};
export const Empty:Story={args:{rows:[],emptyMessage:copy.stories.empty}};
export const Error:Story={args:{state:'error',errorMessage:copy.stories.error,onRetry:fn()},play:async({canvasElement,args})=>{
 const c=within(canvasElement);await expect(c.getByRole('alert')).toHaveTextContent(copy.stories.error);await userEvent.click(c.getByRole('button',{name:copy.retry}));await expect(args.onRetry).toHaveBeenCalledTimes(1);
}};
export const Narrow:Story={args:{onSelectionChange:fn()},parameters:{viewport:{value:'mobile1'}}};
export const ReadOnly:Story={args:{onRowOpen:undefined,onSort:undefined}};
export const SortInteraction:Story={play:async({canvasElement,args})=>{
 const c=within(canvasElement),header=c.queryByRole('button',{name:copy.sort(copy.stories.lead,'asc')});
 if(!header)return;
 await userEvent.click(header);await expect(args.onSort).toHaveBeenCalledWith('name','asc');await expect(c.getByRole('columnheader',{name:copy.sort(copy.stories.lead,'desc')})).toHaveAttribute('aria-sort','ascending');
}};
export const KeyboardOpen:Story={play:async({canvasElement,args})=>{
 const c=within(canvasElement),row=c.queryByRole('row',{name:new RegExp(copy.stories.rows[0].name)});
 if(!row)return;
 row.focus();await userEvent.keyboard('{Enter}');await expect(args.onRowOpen).toHaveBeenCalledWith(copy.stories.rows[0]);
}};
export const LinkDoesNotOpenDrawer:Story={play:async({canvasElement,args})=>{
 const c=within(canvasElement);await userEvent.click(c.getByRole('link',{name:copy.stories.rows[0].name}));await expect(args.onRowOpen).not.toHaveBeenCalled();
}};
