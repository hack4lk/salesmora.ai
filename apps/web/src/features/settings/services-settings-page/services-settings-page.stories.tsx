import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ServicesSettingsPage, type ServicesSettingsPageProps } from './services-settings-page';
import type { WorkspaceService } from '../../services/service-types';
import { servicesSettingsData as copy } from './services-settings-page.data';
import {workerFixtures} from '../../services/service-workers-editor/service-workers-editor.fixtures';

const services: WorkspaceService[] = [
  { id: 'service-installation', name: 'Installation', status: 'active', activeWorkflows: 1, references:2, key:'installation' },
  { id: 'service-maintenance', name: 'Maintenance', status: 'active', activeWorkflows: 0, references:0, key:'unused' },
  { id: 'service-repairs', name: 'Repairs', status: 'active', activeWorkflows: 0, references:0, key:'unused' },
  { id: 'service-inspection', name: 'Inspection', status: 'archived', activeWorkflows: 0, references:0, key:'unused' },
];
/** Mock mutation boundary around the actual page; no alternate preview markup or live writes. */
function Preview(args: ServicesSettingsPageProps) {
  const [rows, setRows] = useState(args.services), [version, setVersion] = useState(args.version);
  const [workers,setWorkers]=useState(args.qualifiedWorkers?.byService??{});
  return <ServicesSettingsPage {...args} services={rows} version={version} qualifiedWorkers={args.qualifiedWorkers?{...args.qualifiedWorkers,byService:workers,onSave:async command=>{await args.qualifiedWorkers!.onSave(command);setWorkers(current=>({...current,[command.serviceId]:command.workerIds}));setVersion(v=>v+1);}}:undefined} onSave={async command => {
    await args.onSave(command);
    setRows(previous => command.action === 'add' ? [...previous, { id: 'service-added', name: command.name, status: 'active', activeWorkflows: 0, references:0, key:'unused' }]
      : command.action==='delete'?previous.filter(service=>service.id!==command.serviceId): previous.map(service => service.id !== command.serviceId ? service : command.action === 'rename' ? { ...service, name: command.name }
        : { ...service, status: command.action === 'archive' ? 'archived' : 'active' }));
    setVersion(value => value + 1);
  }} />;
}
const meta = {
  title: 'Settings/Services', component: ServicesSettingsPage, parameters: { layout: 'fullscreen' },
  args: { settingsHref: '/settings?workspace=preview', services, version: 3, canManage: true, onSave: fn(async () => {}), onReload: fn() },
  render: args => <Preview {...args} />,
  decorators: [Story => <main className="mx-auto min-h-screen max-w-5xl bg-canvas p-4 sm:p-8"><p className="mb-5 mt-0 text-sm text-muted">{copy.preview}</p><Story /></main>],
} satisfies Meta<typeof ServicesSettingsPage>;
export default meta;
type Story = StoryObj<typeof meta>;
const dialog = () => within(within(document.body).getByRole('alertdialog'));
async function menu(canvasElement: HTMLElement, name: string, action: string) {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.menu(name) }));
  await userEvent.click(await within(document.body).findByRole('menuitem', { name: action }));
}
export const Default: Story = {};
export const QualifiedWorkers:Story={args:{qualifiedWorkers:{members:workerFixtures,byService:{'service-installation':['alex','taylor']},onSave:fn(async()=>{})}},play:async({canvasElement,args})=>{
 const c=within(canvasElement);await userEvent.click(c.getByRole('button',{name:'2 qualified workers for Installation'}));const d=within(within(document.body).getByRole('dialog',{name:'Qualified workers'}));await userEvent.click(d.getByRole('button',{name:'Move Taylor Reed up'}));await userEvent.click(d.getByRole('button',{name:'Save changes'}));await expect(args.qualifiedWorkers!.onSave).toHaveBeenCalledWith({serviceId:'service-installation',expectedVersion:3,workerIds:['taylor','alex']});
}};
export const QualifiedWorkersMobile:Story={args:QualifiedWorkers.args,globals:{viewport:{value:'phone',isRotated:false}}};
export const AddService: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.add }));
  await expect(dialog().getByRole('button', { name: copy.add })).toBeDisabled();
  await userEvent.type(dialog().getByRole('textbox', { name: copy.name }), '  Emergency repairs  ');
  await userEvent.click(dialog().getByRole('button', { name: copy.add }));
  await expect(args.onSave).toHaveBeenCalledWith({ action: 'add', name: 'Emergency repairs', expectedVersion: 3 });
  await expect(c.getByRole('cell',{name:'Emergency repairs'})).toBeVisible();
  await expect(c.getByText(copy.changed)).toBeVisible();
} };
export const Rename: Story = { play: async ({ canvasElement, args }) => {
  await menu(canvasElement, 'Installation', copy.rename);
  await expect(dialog().getByText(copy.renameDescription)).toBeVisible();
  await expect(dialog().getByRole('button', { name: copy.save })).toBeDisabled();
  await userEvent.clear(dialog().getByRole('textbox', { name: copy.name }));
  await userEvent.type(dialog().getByRole('textbox', { name: copy.name }), 'Equipment installation');
  await userEvent.click(dialog().getByRole('button', { name: copy.save }));
  await expect(args.onSave).toHaveBeenCalledWith({ action: 'rename', serviceId: 'service-installation', name: 'Equipment installation', expectedVersion: 3 });
  await expect(within(canvasElement).getByRole('cell',{name:/Equipment installation/})).toBeVisible();
} };
export const DuplicateName: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.add }));
  await userEvent.type(dialog().getByRole('textbox', { name: copy.name }), 'inspection');
  await expect(dialog().getByText(copy.duplicate)).toBeVisible();
  await expect(dialog().getByRole('button', { name: copy.add })).toBeDisabled();
  await userEvent.click(dialog().getByRole('button', { name: copy.cancel }));
  await expect(args.onSave).not.toHaveBeenCalled();
} };
export const ArchiveAndRestore: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await menu(canvasElement, 'Repairs', copy.archive);
  await userEvent.click(dialog().getByRole('button', { name: copy.archive }));
  await expect(args.onSave).toHaveBeenCalledWith({ action: 'archive', serviceId: 'service-repairs', expectedVersion: 3 });
  await userEvent.click(c.getByRole('tab', { name: 'Archived (2)' }));
  await menu(canvasElement, 'Repairs', copy.restore);
  await userEvent.click(dialog().getByRole('button', { name: copy.restore }));
  await expect(args.onSave).toHaveBeenLastCalledWith({ action: 'restore', serviceId: 'service-repairs', expectedVersion: 4 });
  await userEvent.click(c.getByRole('tab', { name: 'Active (3)' }));
  await expect(c.getByRole('cell',{name:'Repairs'})).toBeVisible();
} };
export const ActiveWorkflowProtection: Story = { play: async ({ canvasElement, args }) => {
  await menu(canvasElement, 'Installation', copy.archive);
  await expect(dialog().getByRole('button', { name: copy.archive })).toBeDisabled();
  await expect(dialog().getByText(`${copy.workflows(1)} ${copy.archiveBlocked}`)).toBeVisible();
  await userEvent.click(dialog().getByRole('button', { name: copy.cancel }));
  await expect(args.onSave).not.toHaveBeenCalled();
} };
export const ReadOnly: Story = { args: { canManage: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText(copy.readOnly)).toBeVisible();
  await expect(c.queryByRole('button', { name: copy.add })).not.toBeInTheDocument();
} };
export const Empty: Story = { args: { services: [] } };
export const Loading: Story = { args: { state: 'loading' } };
export const LoadError: Story = { args: { state: 'error' } };
export const Conflict: Story = { args: { conflict: true } };
export const SaveError: Story = { args: { onSave: fn(async () => { throw Error('Preview save failure'); }) }, play: async ({ canvasElement }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.add }));
  await userEvent.type(dialog().getByRole('textbox', { name: copy.name }), 'Emergency repairs');
  await userEvent.click(dialog().getByRole('button', { name: copy.add }));
  await expect(await dialog().findByRole('alert')).toBeVisible();
  await expect(dialog().getByRole('textbox', { name: copy.name })).toHaveValue('Emergency repairs');
} };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };

export const DeleteUnused: Story = { play: async ({canvasElement,args}) => {
  const c=within(canvasElement); await menu(canvasElement,'Repairs',copy.delete);
  await expect(dialog().getByRole('button',{name:copy.delete})).toBeDisabled();
  await userEvent.type(dialog().getByRole('textbox',{name:copy.deleteConfirm}),'confirm');
  await userEvent.click(dialog().getByRole('button',{name:copy.delete}));
  await expect(args.onSave).toHaveBeenCalledWith({action:'delete',serviceId:'service-repairs',expectedVersion:3,confirmation:'confirm'});
  await expect(c.queryByText('Repairs',{exact:true})).not.toBeInTheDocument();
} };
export const DeleteUsed: Story = { play: async ({canvasElement,args}) => {
  await menu(canvasElement,'Installation',copy.delete);
  await expect(dialog().getByRole('button',{name:copy.delete})).toBeDisabled();
  await expect(dialog().getByText(copy.deleteBlocked)).toBeVisible();
  await userEvent.click(dialog().getByRole('button',{name:copy.cancel}));
  await expect(args.onSave).not.toHaveBeenCalled();
} };
