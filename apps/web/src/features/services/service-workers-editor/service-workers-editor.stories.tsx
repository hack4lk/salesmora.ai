import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {expect,fn,userEvent,within} from 'storybook/test';
import {ServiceWorkersEditor} from './service-workers-editor';
import {serviceWorkersEditorData as copy} from './service-workers-editor.data';
import {workerFixtures} from './service-workers-editor.fixtures';
const meta={title:'Services/Qualified Workers',component:ServiceWorkersEditor,
 args:{open:true,service:{id:'service-installation',name:'Installation'},version:3,selectedIds:['alex','taylor'],members:workerFixtures,canManage:true,onClose:fn(),onReload:fn(),onSave:fn(async()=>{})},
 parameters:{layout:'fullscreen'},decorators:[Story=><main className="min-h-screen bg-canvas p-6"><h1 className="m-0 text-heading font-semibold text-ink">Services</h1><Story/></main>],
}satisfies Meta<typeof ServiceWorkersEditor>;
export default meta;type Story=StoryObj<typeof meta>;
const drawer=()=>within(within(document.body).getByRole('dialog',{name:copy.title}));
export const Default:Story={play:async()=>{await expect(drawer().getByRole('button',{name:copy.save})).toBeDisabled();await expect(drawer().getByText(copy.orderHelp)).toBeVisible();}};
export const AddAndOrder:Story={play:async({args})=>{
 const d=drawer();await userEvent.type(d.getByRole('combobox',{name:copy.add}),'Jamie');await userEvent.click(await d.findByRole('option',{name:'Jamie Morgan'}));await expect(d.getByRole('combobox',{name:copy.add})).toHaveFocus();
 await userEvent.click(d.getByRole('button',{name:copy.up('Jamie Morgan')}));await expect(args.onSave).not.toHaveBeenCalled();await userEvent.click(d.getByRole('button',{name:copy.save}));
 await expect(args.onSave).toHaveBeenCalledWith({serviceId:args.service.id,expectedVersion:3,workerIds:['alex','jamie','taylor']});await expect(args.onClose).toHaveBeenCalledOnce();
}};
export const KeyboardOrder:Story={play:async({args})=>{const d=drawer(),button=d.getByRole('button',{name:copy.up('Taylor Reed')});button.focus();await userEvent.keyboard('{Enter}');await userEvent.click(d.getByRole('button',{name:copy.save}));await expect(args.onSave).toHaveBeenCalledWith({serviceId:args.service.id,expectedVersion:3,workerIds:['taylor','alex']});}};
export const Cancel:Story={play:async({args})=>{const d=drawer();await userEvent.click(d.getByRole('button',{name:copy.remove('Alex Parker')}));await userEvent.click(d.getByRole('button',{name:copy.cancel}));await expect(args.onSave).not.toHaveBeenCalled();await expect(args.onClose).toHaveBeenCalledOnce();}};
export const ClearWorkers:Story={play:async({args})=>{const d=drawer();await userEvent.click(d.getByRole('button',{name:copy.remove('Alex Parker')}));await userEvent.click(d.getByRole('button',{name:copy.remove('Taylor Reed')}));await expect(d.getByText(copy.empty)).toBeVisible();await userEvent.click(d.getByRole('button',{name:copy.save}));await expect(args.onSave).toHaveBeenCalledWith({serviceId:args.service.id,expectedVersion:3,workerIds:[]});}};
export const UnavailableWorker:Story={args:{selectedIds:['alex','former']},play:async({args})=>{const d=drawer();await expect(d.getByText(copy.unavailableHelp)).toBeVisible();await expect(d.getByRole('button',{name:copy.save})).toBeDisabled();await userEvent.click(d.getByRole('button',{name:copy.remove('Former teammate')}));await userEvent.click(d.getByRole('button',{name:copy.save}));await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({workerIds:['alex']}));}};
export const Empty:Story={args:{selectedIds:[]}};
export const NoMembers:Story={args:{selectedIds:[],members:[]}};
export const ReadOnly:Story={args:{canManage:false},play:async()=>{const d=drawer();await expect(d.getByText(copy.readOnly)).toBeVisible();await expect(d.queryByRole('button',{name:copy.save})).not.toBeInTheDocument();await expect(d.queryByRole('combobox')).not.toBeInTheDocument();}};
export const SaveError:Story={args:{onSave:fn(async()=>{throw Error('Mock save failure');})},play:async()=>{const d=drawer();await userEvent.click(d.getByRole('button',{name:copy.remove('Taylor Reed')}));await userEvent.click(d.getByRole('button',{name:copy.save}));await expect(await d.findByText(copy.failed)).toBeVisible();await expect(d.getByText('Alex Parker',{exact:true})).toBeVisible();await expect(d.queryByText('Taylor Reed',{exact:true})).not.toBeInTheDocument();}};
export const Conflict:Story={args:{conflict:true},play:async({args})=>{const d=drawer();await expect(d.getByRole('button',{name:copy.save})).toBeDisabled();await userEvent.click(d.getByRole('button',{name:copy.reload}));await expect(args.onReload).toHaveBeenCalledOnce();}};
export const Loading:Story={args:{state:'loading'}};
export const LoadError:Story={args:{state:'error'}};
export const Pending:Story={args:{pending:true}};
export const Mobile:Story={globals:{viewport:{value:'phone',isRotated:false}}};
