import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SideDrawer, type SideDrawerProps } from './side-drawer';
import { sideDrawerData as copy } from './side-drawer.data';
import { TextField } from '../../forms/text-field/text-field';
import { SubmitButton } from '../../forms/submit-button/submit-button';

const button = 'min-h-11 cursor-pointer rounded-xl border border-line px-4 py-2 font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
function Preview({ form = false, long = false, ...args }: Omit<SideDrawerProps, 'children' | 'footer'> & { form?: boolean; long?: boolean }) {
  const [open, setOpen] = useState(args.open);
  const [saved, setSaved] = useState(false);
  const close = () => { setOpen(false); args.onClose(); };
  return <main className="min-h-screen bg-canvas p-6 sm:p-8">
    <h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.pageTitle}</h1>
    <p className="text-muted">{copy.stories.pageDescription}</p>
    <button type="button" className={button} onClick={() => setOpen(true)}>{copy.stories.open}</button>
    {saved && <p role="status" className="text-success">{copy.stories.saved}</p>}
    <SideDrawer {...args} open={open} onClose={close} footer={form ?
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" disabled={args.busy} className={button} onClick={close}>{copy.stories.cancel}</button>
        <SubmitButton form="drawer-preview-form" fullWidth={false} label={copy.stories.save} pending={args.busy}/>
      </div> : <a className={`${button} inline-flex items-center`} href="#record" onClick={event => event.preventDefault()}>{copy.stories.fullRecord}</a>}>
      {form ? <form id="drawer-preview-form" className="grid gap-6" onSubmit={event => { event.preventDefault(); if (!args.busy) { setSaved(true); close(); } }}>
        <TextField label={copy.stories.name} required defaultValue={copy.stories.values[0]} disabled={args.busy}/>
        <TextField label={copy.stories.email} type="email" required defaultValue={copy.stories.values[1]} disabled={args.busy}/>
      </form> : <div className="grid gap-8">
        <section><h3 className="mb-4 mt-0 text-base font-semibold">{copy.stories.section}</h3>
          <dl className="m-0 grid gap-4">{[copy.stories.name, copy.stories.email, copy.stories.owner].map((label, index) => <div key={label}><dt className="text-sm text-muted">{label}</dt><dd className="m-0 mt-1">{copy.stories.values[index]}</dd></div>)}</dl>
        </section>
        <section className="border-t border-line pt-6"><h3 className="mb-3 mt-0 text-base font-semibold">{copy.stories.nextTitle}</h3><p className="m-0 leading-6 text-muted">{copy.stories.next}</p></section>
        {long && <section className="border-t border-line pt-6"><h3 className="mb-4 mt-0 text-base font-semibold">{copy.stories.activity}</h3><ol className="m-0 grid gap-6 pl-5">{Array.from({ length: 18 }, (_, index) => <li key={index}><p className="m-0">{copy.stories.activityItem(index + 1)}</p><p className="mb-0 mt-1 text-sm text-muted">{copy.stories.activityTime}</p></li>)}</ol></section>}
      </div>}
    </SideDrawer>
  </main>;
}
const meta = { title: 'Layout/SideDrawer', component: Preview, parameters: { layout: 'fullscreen' }, args: { open: true, title: copy.stories.title, description: copy.stories.description, onClose: fn() } } satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Open: Story = {};
export const WithForm: Story = { args: { form: true, title: copy.stories.formTitle, description: copy.stories.formDescription } };
export const LongContent: Story = { args: { long: true } };
export const Narrow: Story = { parameters: { viewport: { value: 'mobile1' } } };
export const Busy: Story = { args: { form: true, busy: true, title: copy.stories.formTitle }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement.ownerDocument.body);
  await expect(c.getByRole('button', { name: copy.close })).toBeDisabled();
  await userEvent.keyboard('{Escape}');
  await expect(args.onClose).not.toHaveBeenCalled();
  await expect(c.getByRole('dialog')).toBeVisible();
} };
export const FocusTrap: Story = { args: { open: false, form: true, title: copy.stories.formTitle }, play: async ({ canvasElement }) => {
  const c = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: copy.stories.open });
  await userEvent.click(trigger);
  const dialog = c.getByRole('dialog');
  const save = c.getByRole('button', { name: copy.stories.save });
  save.focus();
  await userEvent.tab();
  await expect(c.getByRole('button', { name: copy.close })).toHaveFocus();
  await userEvent.tab({ shift: true });
  await expect(save).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect(dialog).not.toBeInTheDocument();
  await expect(trigger).toHaveFocus();
} };
