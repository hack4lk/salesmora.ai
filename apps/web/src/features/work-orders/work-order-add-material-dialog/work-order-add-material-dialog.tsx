'use client';
import { useState } from 'react';
import { JobDialog } from '../../jobs/job-dialog/job-dialog';
import { MaterialPicker, type MaterialPickerOption, type MaterialPickerProps } from '../../materials/material-picker/material-picker';
import { woButton, woInput, woLabel } from '../work-order-ui';
import { copy } from './work-order-add-material-dialog.data';

export type AddMaterialLine = { catalogId: string; name: string; unit: string; quantity: number; note: string; customerPriceCents: number | null };
export type WorkOrderAddMaterialDialogProps = {
  open: boolean;
  search: MaterialPickerProps['search'];
  showPrices: boolean;
  /** Present only for people who may add or propose catalog items. */
  newMaterial?: { propose: boolean; onStart: () => void };
  pending?: boolean; error?: string;
  onClose: () => void;
  onSubmit: (line: AddMaterialLine) => void | Promise<void>;
};

/** Remounts per opening so a draft never leaks between additions. */
export function WorkOrderAddMaterialDialog(props: WorkOrderAddMaterialDialogProps) {
  return <AddMaterialForm key={String(props.open)} {...props} />;
}

const toCents = (value: string) => { const n = Number(value); return value.trim() !== '' && Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null; };

function AddMaterialForm({ open, search, showPrices, newMaterial, pending, error, onClose, onSubmit }: WorkOrderAddMaterialDialogProps) {
  const [picked, setPicked] = useState<MaterialPickerOption | null>(null), [quantity, setQuantity] = useState('1'), [note, setNote] = useState(''), [price, setPrice] = useState(''), [touched, setTouched] = useState(false);
  const qty = Number(quantity), quantityInvalid = !(Number.isFinite(qty) && qty > 0);
  const pick = (option: MaterialPickerOption) => { setPicked(option); setPrice(option.priceCents === null ? '' : (option.priceCents / 100).toFixed(2)); };
  return (
    <JobDialog open={open} title={copy.title} description={copy.description} confirmLabel={copy.confirm} pending={pending} error={error} closeOnSubmit={false} onClose={onClose}
      onSubmit={() => {
        setTouched(true);
        if (!picked || quantityInvalid) return;
        return onSubmit({ catalogId: picked.id, name: picked.name, unit: picked.unit, quantity: qty, note: note.trim(), customerPriceCents: showPrices ? toCents(price) : null });
      }}>
      <div className="grid min-w-0 gap-4">
        <p className="m-0 text-sm text-muted">{copy.catalogPrompt}</p>
        <MaterialPicker search={search} selected={picked && { id: picked.id, name: picked.name }} onSelect={pick} onClear={() => setPicked(null)} showPrices={showPrices} />
        {touched && !picked && <p role="alert" className="m-0 text-sm text-error">{copy.pickFirst}</p>}
        <div className="grid gap-4 sm:grid-cols-3">
          <label className={woLabel}>{copy.quantity}
            <input className={woInput} type="number" min="0" step="any" inputMode="decimal" value={quantity} aria-invalid={touched && quantityInvalid} onChange={event => setQuantity(event.target.value)} />
            {touched && quantityInvalid && <span role="alert" className="text-sm font-normal text-error">{copy.quantityError}</span>}
          </label>
          <label className={woLabel}>{copy.unit}<input className={woInput} value={picked?.unit ?? ''} readOnly disabled placeholder="—" /></label>
          {showPrices && <label className={woLabel}>{copy.price}<input className={woInput} type="number" min="0" step="0.01" inputMode="decimal" value={price} disabled={!picked} onChange={event => setPrice(event.target.value)} /></label>}
        </div>
        <label className={woLabel}>{copy.note}<input className={woInput} maxLength={500} value={note} onChange={event => setNote(event.target.value)} /></label>
        {newMaterial && (
          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
            <span className="text-sm text-muted">{copy.notListed}</span>
            <button type="button" className={woButton} onClick={newMaterial.onStart}>{newMaterial.propose ? copy.addNewPropose : copy.addNew}</button>
          </div>
        )}
      </div>
    </JobDialog>
  );
}
