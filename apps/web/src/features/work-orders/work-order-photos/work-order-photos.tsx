'use client';

import { useState } from 'react';
import type { WorkOrderStatus } from '@salesmora/contracts';
import {
  photoCategories,
  type WorkOrderCapabilities,
  type WorkOrderPhoto,
  type WorkOrderPhotoCategory,
} from '../work-order-preview.types';
import { woButton, woPanel } from '../work-order-ui';
import { copy } from './work-order-photos.data';
import { FileUploadDialog } from './file-upload-dialog';
import { FilePreviewModal } from './file-preview-modal';
import { useFileRemoval } from '../../../hooks/use-file-removal';

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export type WorkOrderPhotosProps = {
  status: WorkOrderStatus;
  photos: WorkOrderPhoto[];
  workspaceId: string;
  workOrderId: string;
  capabilities: Pick<WorkOrderCapabilities, 'update' | 'progress'>;
  onPhotosChange: () => void;
};

function Tile({
  photo,
  onOpen,
  onRemove,
  removable,
  isRemoving,
}: {
  photo: WorkOrderPhoto;
  onOpen: () => void;
  onRemove: () => void;
  removable: boolean;
  isRemoving: boolean;
}) {
  const ready = photo.state === 'ready';
  return (
    <li className="relative min-w-0 overflow-hidden rounded-xl border border-line bg-paper">
      <button
        type="button"
        disabled={!ready}
        aria-label={copy.open(photo.name)}
        onClick={onOpen}
        className="block aspect-4/3 w-full cursor-pointer bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed"
      >
        {photo.thumbnailUrl && ready ? (
          <img
            src={photo.thumbnailUrl}
            alt={photo.caption || photo.name}
            className="size-full object-cover"
          />
        ) : (
          <span className="grid size-full place-items-center text-xs font-semibold text-muted">
            {photo.kind === 'image' ? copy.imageLabel : copy.documentLabel}
          </span>
        )}
      </button>
      <div className="grid gap-1 p-3">
        <p className="m-0 text-sm font-semibold text-ink wrap-anywhere">
          {photo.name}
        </p>
        {photo.caption && (
          <p className="m-0 text-sm text-ink wrap-anywhere">{photo.caption}</p>
        )}
        <p className="m-0 text-xs text-muted wrap-anywhere">
          {copy.uploadedBy(photo.uploader, when(photo.uploadedAt))}
        </p>
        {photo.state === 'scanning' && (
          <p role="status" className="m-0 text-xs font-semibold text-muted">
            {copy.scanning}
          </p>
        )}
        {photo.state === 'failed' && (
          <p role="alert" className="m-0 text-xs font-semibold text-error">
            {copy.failed}
          </p>
        )}
      </div>
      {removable && photo.canRemove && (
        <button
          type="button"
          disabled={isRemoving}
          aria-label={copy.remove(photo.name)}
          onClick={onRemove}
          className="absolute right-2 top-2 grid size-9 cursor-pointer place-items-center rounded-full border border-line bg-paper text-primary focus-visible:focus-ring disabled:opacity-50"
        >
          ×
        </button>
      )}
    </li>
  );
}

export function WorkOrderPhotos({
  status,
  photos,
  workspaceId,
  workOrderId,
  capabilities: c,
  onPhotosChange,
}: WorkOrderPhotosProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<WorkOrderPhotoCategory>('before');
  const [previewFile, setPreviewFile] = useState<WorkOrderPhoto | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [removingFileId, setRemovingFileId] = useState<string | null>(null);

  const { removeFile, isLoading: isRemoving } = useFileRemoval({
    workspaceId,
    workOrderId,
  });

  const closed = status === 'completed' || status === 'canceled';
  const draft = status === 'draft';
  const canAdd = !closed && (draft ? c.update : c.progress || c.update);
  const note = closed
    ? copy.locked
    : draft && !c.update
      ? null
      : draft
        ? copy.draftHint
        : !canAdd
          ? copy.noUpload
          : null;

  const handleAddClick = (category: WorkOrderPhotoCategory) => {
    setUploadCategory(category);
    setUploadDialogOpen(true);
  };

  const handleOpenFile = (file: WorkOrderPhoto) => {
    setPreviewFile(file);
    setPreviewModalOpen(true);
  };

  const handleRemoveFile = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to remove this file?')) {
      return;
    }

    setRemovingFileId(fileId);
    const success = await removeFile(fileId);
    setRemovingFileId(null);

    if (success) {
      onPhotosChange();
    }
  };

  return (
    <>
      <section className={woPanel} aria-labelledby="wo-photos-title">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="wo-photos-title" className="m-0 text-lg font-semibold">
            {copy.title}
          </h2>
        </header>

        {photos.length === 0 && !canAdd && (
          <p className="m-0 text-sm text-muted">{copy.empty}</p>
        )}

        <div className="grid gap-6">
          {photoCategories.map((cat) => {
            const items = photos.filter((p) => p.category === cat);
            if (items.length === 0 && !canAdd) return null;
            const label = copy.categories[cat];

            return (
              <section key={cat} aria-labelledby={`wo-photos-${cat}`}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h3
                    id={`wo-photos-${cat}`}
                    className="m-0 text-sm font-semibold text-ink"
                  >
                    {label}
                    {items.length > 0 && (
                      <span className="ml-2 font-normal text-muted">
                        {items.length}
                      </span>
                    )}
                  </h3>
                  {canAdd && (
                    <button
                      type="button"
                      className={woButton}
                      onClick={() => handleAddClick(cat)}
                    >
                      {cat === 'other' ? copy.addFile : copy.add(label)}
                    </button>
                  )}
                </div>

                {items.length === 0 ? (
                  <p className="m-0 text-sm text-muted">{copy.emptyCategory}</p>
                ) : (
                  <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-3">
                    {items.map((p) => (
                      <Tile
                        key={p.id}
                        photo={p}
                        removable={!closed}
                        isRemoving={removingFileId === p.id}
                        onOpen={() => handleOpenFile(p)}
                        onRemove={() => handleRemoveFile(p.id)}
                      />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        {canAdd && (
          <p className="mb-0 mt-4 text-xs leading-5 text-muted">{copy.types}</p>
        )}
        {note && (
          <p className="mb-0 mt-2 text-xs leading-5 text-muted">{note}</p>
        )}
        <p className="mb-0 mt-2 text-xs leading-5 text-muted">
          {copy.privacy}
        </p>
      </section>

      <FileUploadDialog
        isOpen={uploadDialogOpen}
        workspaceId={workspaceId}
        workOrderId={workOrderId}
        category={uploadCategory}
        onClose={() => setUploadDialogOpen(false)}
        onUploadComplete={() => {
          onPhotosChange();
        }}
      />

      <FilePreviewModal
        isOpen={previewModalOpen}
        workspaceId={workspaceId}
        workOrderId={workOrderId}
        file={previewFile}
        onClose={() => setPreviewModalOpen(false)}
      />
    </>
  );
}
