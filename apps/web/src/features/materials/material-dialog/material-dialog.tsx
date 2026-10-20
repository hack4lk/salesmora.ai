'use client';
import { useId, useState } from 'react';
import { materialUnits, type MaterialView } from '@salesmora/contracts';
import { JobDialog } from '../../jobs/job-dialog/job-dialog';
import { woInput, woLabel, woButton } from '../../work-orders/work-order-ui';
import { copy } from './material-dialog.data';
import { emptyMaterialForm, formErrors, formFromMaterial, marginFromForm, priceFromMarkup, type MaterialFormValues } from './material-form';

export type MaterialDialogMode = 'create' | 'propose' | 'edit' | 'approve';
export type MaterialDialogProps = {
  open: boolean; mode: MaterialDialogMode; material?: MaterialView; canViewCosts: boolean; canViewPrices: boolean;
  categories: string[]; suppliers: string[]; existingNames?: string[];
  pending?: boolean; error?: string; conflict?: boolean; onReload?: () => void;
  /** Adds quantity and note fields so the same form can create a catalog item and use it on a work order. */
  withLine?: boolean;
  onClose: () => void; onSubmit: (values: MaterialFormValues, line: MaterialLineValues) => void | Promise<void>;
};
export type MaterialLineValues = { quantity: number; note: string };

/** Remounts per opening so a draft never leaks between items. */
export function MaterialDialog(props: MaterialDialogProps) {
  return <MaterialForm key={`${props.open}:${props.material?.id ?? 'new'}:${props.material?.version ?? 0}`} {...props} />;
}

function MaterialForm({ open, mode, material, canViewCosts, canViewPrices, categories, suppliers, existingNames = [], pending, error, conflict, onReload, withLine = false, onClose, onSubmit }: MaterialDialogProps) {
  const id = useId(), access = { canViewCosts, canViewPrices };
  const [values, setValues] = useState<MaterialFormValues>(material ? formFromMaterial(material) : emptyMaterialForm), [markup, setMarkup] = useState(''), [touched, setTouched] = useState(false);
  const [quantity, setQuantity] = useState('1'), [lineNote, setLineNote] = useState(''), quantityValue = Number(quantity), quantityInvalid = withLine && !(Number.isFinite(quantityValue) && quantityValue > 0);
  const set = (patch: Partial<MaterialFormValues>) => setValues(current => ({ ...current, ...patch }));
  const errors = formErrors(values, access), invalid = Object.keys(errors).length > 0, margin = marginFromForm(values);
  const duplicate = values.name.trim() !== '' && values.name.trim().toLowerCase() !== material?.name.toLowerCase() && existingNames.some(name => name.toLowerCase() === values.name.trim().toLowerCase());
  const show = (key: keyof MaterialFormValues) => touched ? errors[key] : undefined;
  const field = (key: keyof MaterialFormValues, label: string, extra: object = {}) => (
    <label className={woLabel}>{label}
      <input className={woInput} value={values[key]} aria-invalid={!!show(key)} aria-describedby={show(key) ? `${id}-${key}` : undefined} onChange={event => set({ [key]: event.target.value })} {...extra} />
      {show(key) && <span id={`${id}-${key}`} role="alert" className="text-sm font-normal text-error">{errors[key]}</span>}
    </label>
  );
  return (
    <JobDialog open={open} title={withLine ? copy.line.titles[mode as 'create' | 'propose'] : copy.titles[mode]} description={withLine ? copy.line.descriptions[mode as 'create' | 'propose'] : copy.descriptions[mode]} confirmLabel={withLine ? copy.line.confirm[mode as 'create' | 'propose'] : copy.confirm[mode]} pending={pending} error={error} conflict={conflict} onReload={onReload} closeOnSubmit={false}
      onClose={onClose} onSubmit={() => { setTouched(true); if (!invalid && !quantityInvalid) return onSubmit(values, { quantity: quantityValue, note: lineNote.trim() }); }}>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">{field('name', copy.fields.name, { maxLength: 200, autoComplete: 'off' })}</div>
        {duplicate && <p role="status" className="m-0 text-sm text-muted sm:col-span-2">{copy.duplicateName(values.name.trim())}</p>}
        {field('sku', copy.fields.sku, { maxLength: 80, autoComplete: 'off' })}
        <label className={woLabel}>{copy.fields.unit}
          <select className={woInput} value={values.unit} onChange={event => set({ unit: event.target.value as MaterialFormValues['unit'] })}>{materialUnits.map(unit => <option key={unit} value={unit}>{copy.units[unit]}</option>)}</select>
        </label>
        <label className={woLabel}>{copy.fields.category}<input className={woInput} list={`${id}-categories`} maxLength={80} value={values.category} onChange={event => set({ category: event.target.value })} /><datalist id={`${id}-categories`}>{categories.map(item => <option key={item} value={item} />)}</datalist></label>
        <label className={woLabel}>{copy.fields.supplier}<input className={woInput} list={`${id}-suppliers`} maxLength={120} value={values.supplier} onChange={event => set({ supplier: event.target.value })} /><datalist id={`${id}-suppliers`}>{suppliers.map(item => <option key={item} value={item} />)}</datalist></label>
        {canViewCosts && field('cost', copy.fields.cost, { inputMode: 'decimal', placeholder: '0.00' })}
        {canViewPrices && field('price', copy.fields.price, { inputMode: 'decimal', placeholder: '0.00' })}
        {canViewCosts && canViewPrices && (
          <div className="flex flex-wrap items-end gap-3 sm:col-span-2">
            <label className={`${woLabel} w-32`}>{copy.fields.markup}<input className={woInput} inputMode="decimal" value={markup} onChange={event => setMarkup(event.target.value)} /></label>
            <button type="button" className={woButton} disabled={priceFromMarkup(values.cost, markup) === null} onClick={() => { const next = priceFromMarkup(values.cost, markup); if (next !== null) set({ price: next }); }}>{copy.applyMarkup}</button>
            {margin !== null && <span role="status" className="pb-3 text-sm text-muted">{copy.margin(margin)}</span>}
          </div>
        )}
        {withLine && (
          <>
            <label className={woLabel}>{copy.line.quantity}
              <input className={woInput} type="number" min="0" step="any" inputMode="decimal" value={quantity} aria-invalid={touched && quantityInvalid} onChange={event => setQuantity(event.target.value)} />
              {touched && quantityInvalid && <span role="alert" className="text-sm font-normal text-error">{copy.line.quantityError}</span>}
            </label>
            <label className={woLabel}>{copy.line.note}<input className={woInput} maxLength={500} value={lineNote} onChange={event => setLineNote(event.target.value)} /></label>
          </>
        )}
        {!canViewCosts && !canViewPrices && <p className="m-0 text-sm text-muted sm:col-span-2">{copy.noPriceAccess}</p>}
        {field('sourceUrl', copy.fields.sourceUrl, { inputMode: 'url', maxLength: 2000 })}
        {field('imageUrl', copy.fields.imageUrl, { inputMode: 'url', maxLength: 2000 })}
        <label className={`${woLabel} sm:col-span-2`}>{copy.fields.notes}<textarea className={woInput} rows={3} maxLength={1000} value={values.notes} onChange={event => set({ notes: event.target.value })} /></label>
      </div>
    </JobDialog>
  );
}
