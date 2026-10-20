# File storage and uploads plan

Status: **QA walkthrough complete** — all 16 questions and every requirement row decided (rows marked bulk were agreed together). — October 20, 2026. Q1 decided (upload through our server) and Railway behavior verified against current docs (§3.1).
Scope: one shared, private file-storage service on Railway that every feature reuses (work-order photos and files, job files and note attachments, and later customers, leads, estimates, chat attachments and catalog images), plus the first two consumers: **work-order photos** and **job files**.

## How to use this document

1. Decide §10 (open questions) first. Q2 (encryption) and Q16 (DR location) shape the rest; Q1 is decided.
2. Walk §6 by group. Each requirement has an ID and a blank **Decision / Status** cell (Agreed / Changed / Deferred / Rejected).
3. Record decisions in the rows and in §10. Update prototypes and code after the walkthrough, not before.

**Inherited decisions (do not re-decide)** from [job-module-plan.md](job-module-plan.md), [local-development.md](local-development.md) and [registration-pricing-billing-plan.md](registration-pricing-billing-plan.md):
- Files live in a **private Railway Storage Bucket**, never in PostgreSQL or on a service filesystem. Metadata and tenant ownership live in PostgreSQL.
- Maximum **10 MB per file**; allowed types are validated on the server.
- Downloads are blocked until any configured malware scan marks the file clean.
- Confirmed removal names the file, warns it is permanent, destroys the per-file key, deletes the object and keeps only non-content audit metadata.
- Quotas by plan: **1 GB Free, 10 GB Standard, 25 GB Premium**; warn at 80% and 100%.
- Staging and production use separate buckets. Local development uses RustFS (local container) or a non-production bucket.
- Railway buckets do not offer server-side encryption, versioning, object lock or lifecycle rules, so sensitive files use application-level envelope encryption. Daily encrypted copies go to a second private bucket with 30-day retention (RPO 24 h, RTO one business day).

---

## 1. Current state

- **No storage exists.** No bucket client, no file tables and no upload route. [account-deletion.md](account-deletion.md) confirms there is no tenant file store yet.
- **Work-order photos:** the `work-order-photos` component (`.tsx`, `.data.ts`, `.stories.tsx`) is built to the prototype, with Before, After and Other files groups, a scanning state, a failed state, a lock when the work order is closed, and remove. **It is not rendered anywhere.** `WorkOrderDetailPage` does not include it, nothing passes it data, and there is no backend. Its props are `photos`, `capabilities`, `onAdd`, `onOpen` and `onRemove`, so it is ready to wire once an API exists.
- **Jobs:** `job-files`, `job-attachment-dialog`, `job-file-description-dialog` and the note composer attachments exist as prototype UI with preview data only. `docs/jobs.md` lists attachments as pending until storage exists.
- **Materials:** `imageUrl` is a pasted external URL, with a thumbnail backfill. There is no upload.
- **Plans and billing:** quotas are approved but there is no storage meter. Billing docs say not to show invented live storage usage.
- **Permissions:** work-order crew may add photos (ACC-4, `workorders.progress`); no dedicated file permissions exist yet.

## 2. Goals and non-goals

Goals:
- One storage service and one upload flow, reused by every feature, so security rules live in one place.
- Photos from a phone camera on a job site work well on a poor connection.
- Tenant isolation, permission checks on every preview and download, and auditable add and remove.
- A path that works locally (RustFS) and on Railway with the same code.

Non-goals (now):
- Public file links, folders and file sharing outside the workspace.
- Offline upload queues (work orders Q16 deferred offline use).
- Video, and large file support above 10 MB.
- Full-text search of file contents.

## 3. Architecture on Railway

```
Browser ──multipart/streamed upload──▶ Web service (Next.js route)
                                         │ authorize, validate type and size, check quota
                                         │ encrypt (envelope), generate opaque key
                                         ▼
                                  Railway Storage Bucket (private)
                                         ▲
Worker service ── scan (ClamAV), thumbnail, HEIC→JPEG, DR copy ──┘
PostgreSQL: files, file links, usage, audit
```

- **Storage adapter** (`packages/data` or a new `packages/storage`): a small interface (`put`, `get`, `delete`, `head`) over an S3-compatible client configured by env vars (endpoint, bucket, region, access key, secret, path-style flag). One implementation covers RustFS locally and Railway in deployed environments.
- **Upload path:** because files are encrypted by the application and must be scanned and thumbnailed by our code, the bytes pass through our servers. Browser-direct presigned uploads would put plaintext in the bucket, so they are not the recommendation (see Q1). Files are capped at 10 MB, which fits a streamed route.
- **Download path:** an authenticated route checks access, streams and decrypts the object, and sets `Content-Disposition`, `X-Content-Type-Options: nosniff` and `Cache-Control: private, no-store`. Image previews use a stored, resized thumbnail.
- **Worker:** the existing worker service ([worker-deployment.md](worker-deployment.md)) processes a queue: scan, thumbnail and HEIC conversion, then marks the file `ready` or `failed`.
- **Railway setup:** one bucket per environment (production, staging, plus a separate DR bucket), credentials as service variables referenced only by web and worker, no public bucket URL.

### 3.1 Railway behavior verified (October 20, 2026)

Checked against docs.railway.com (Storage Buckets, Uploading and Serving Files, Storage Buckets Billing, Pricing plans). Re-verify before S0 since these pages change.

| Topic | What Railway documents | Effect on this plan |
|---|---|---|
| Access | Private, S3-compatible (Tigris backend). No public buckets. Only reachable over the public network, not Railway private networking. | Matches STO-2. All traffic goes over HTTPS on the public network. |
| Supported S3 features | Put, Get, Head, Delete, List, Copy, presigned URLs, tagging, multipart. | Enough for the adapter. Multipart is available if the 10 MB limit is ever raised. |
| Not supported | Server-side encryption API, versioning, object locks, lifecycle configuration. | We need our own orphan sweeper (OPS-3), tombstones and DR copies. |
| Encryption at rest | The FAQ says buckets are "encrypted at rest", yet the SSE API is unsupported. The docs do not say who holds the keys. | Keep application envelope encryption (Q2). Treat provider encryption as defense in depth, not a control we can rely on or describe to customers as ours. |
| Backups | No automatic backups or snapshots. A deleted bucket is restorable for 52 hours, then destroyed. | DR copies (OPS-1) are required. Restrict who can delete a bucket in Railway. |
| Environments | Each environment gets its own bucket with isolated credentials, including PR environments. | Matches STO-3. Preview deployments never see production files. |
| Region | Chosen at creation and cannot be changed. | Pick the region next to the web service before S0. |
| URL style | Virtual-hosted style by default; older buckets may need path-style. Variables: `BUCKET`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`, `REGION`, `ENDPOINT`. | The adapter keeps a path-style flag. Use `BUCKET`, not `RAILWAY_BUCKET_NAME`, for the S3 name. |
| Presigned URLs | Valid up to 90 days. | Not used for upload (Q1). Possible later for non-sensitive assets. |
| CORS | Needed only for browser-direct uploads. | Not needed with server uploads, which is a small simplification. |
| Bucket cost | $0.015 per GB-month. S3 operations and bucket egress are free. | Cheap: the 25 GB top tier is about $0.38 a month per workspace at full use. |
| Service egress | Our service sending data to the bucket or to users is billed at $0.05 per GB. Bucket-to-service reads are free. | With server upload, each upload costs egress once (service to bucket) and each download costs egress once (service to user). Direct presigned downloads would avoid the second charge, but are unavailable with encryption. Acceptable at 10 MB per file. |
| Plan limits | Free plan: bucket access is suspended when credits run out. Hobby: 1 TB cap. Pro: unlimited. A hard usage limit also suspends bucket access (reads and writes). | Production must run on a paid plan, and a Railway hard limit must not be set so low that file access is cut off. |

Consequences recorded in the plan:
- **Q1 decided:** uploads and downloads go through our server, encrypted, then scanned by the worker.
- **DR bucket location (Q16 decided: same project, second bucket):** this protects against a bad delete or corruption in the live bucket, but not against account suspension, a hard usage limit or deleting the project. Accepted risk; revisit before the first paying customers rely on it. Mitigations: worker-only credentials for the DR bucket, STO-7 spend alerts, and restricted Railway project permissions.
- **Quota enforcement is ours:** Railway has no per-workspace limits, so `workspaceStorageUsage` is the source of truth.

## 4. Data model (proposed)

| Table | Purpose |
|---|---|
| `files` | `id`, `workspaceId`, opaque `storageKey`, `thumbnailKey`, display `name`, detected `contentType`, `kind` (image or document), `byteSize`, `sha256`, wrapped data key, `state` (uploading, scanning, ready, failed, removed), `uploadedBy`, `createdAt`, `removedAt` |
| `fileLinks` | One file attached to one record: `fileId`, `workspaceId`, `entityType` (`work_order`, `job`, `job_note`, later others), `entityId`, `category` (before, after, other), `caption`, `position`. Removing a link and removing a file are separate steps. |
| `fileEvents` | Audit: upload, download, remove, scan result, who and when. No file content. |
| `workspaceStorageUsage` | Stored bytes per workspace, updated with the upload and remove in one transaction. Staged uploads reserve capacity. |
| `fileDeletionTombstones` | Durable record of confirmed deletions, applied before any restore. |

Rules: every query is scoped by `workspaceId`. The composite key `(workspaceId, id)` is used on links so a link can never point at another tenant's file. Object keys are random and never contain the file name or workspace name.

## 5. Upload flow

1. User picks a file or opens the camera on mobile. The client checks type and size for fast feedback only.
2. Client sends `POST /api/files` with the entity (type, id), category and the file. The server authorizes the user for that entity and the "add" action, re-checks type by content sniffing (not extension), checks size and the workspace quota, and reserves capacity.
3. Server encrypts, writes the object, inserts `files` (`scanning`) and `fileLinks`, and queues the worker job. The response returns the file with state `scanning`.
4. Worker scans, creates a thumbnail (images), converts HEIC to a viewable JPEG, then sets `ready` (or `failed` with a reason). Capacity is released if it fails.
5. The UI shows the tile as "Security scan pending" until ready (already built in `WorkOrderPhotos`), then the thumbnail.
6. Remove: confirmation dialog naming the file, then the file becomes unavailable immediately, the key is destroyed, the object is deleted, a tombstone and audit event are written and usage is decremented.

## 6. Requirements

Each row has a blank **Decision / Status** cell for the walkthrough.

### Group A. Storage service

| ID | Requirement | Decision / Status |
|---|---|---|
| STO-1 | One S3-compatible storage adapter used by all features; RustFS locally, Railway bucket deployed | Agreed (bulk) |
| STO-2 | Bucket is private; no public URLs; credentials only in web and worker service variables | Agreed (bulk) |
| STO-3 | Separate buckets for production, staging, development and disaster recovery; the DR bucket is a second bucket in the same Railway project (Q16), with its own credentials available only to the worker | Agreed (bulk) |
| STO-4 | Opaque random object keys; no file or workspace names in keys | Agreed (bulk) |
| STO-5 | Adapter is unit-testable with an in-memory fake; a rehearsal runs against RustFS | Agreed (bulk) |
| STO-7 | Production runs on a paid Railway plan; alert on Railway usage and hard limits so a spend cap cannot suspend file access | Agreed (bulk) |
| STO-6 | Health check: the app reports storage as degraded (not down) and disables upload UI when the bucket is unreachable | Agreed (bulk) |

### Group B. Upload and validation

| ID | Requirement | Decision / Status |
|---|---|---|
| UPL-1 | Allowed types: JPEG, PNG, HEIC, WebP, PDF, DOCX, XLSX, TXT (as in the built component copy) | Agreed (Q10) |
| UPL-2 | Type is verified by content sniffing; extension and client MIME are not trusted; mismatches are rejected | Agreed (bulk) |
| UPL-3 | Maximum 10 MB per file; multiple files per action, up to a per-request cap | Agreed (bulk): up to 10 files per request |
| UPL-4 | Mobile camera capture (`capture` attribute) and file picker both supported | Agreed (bulk) |
| UPL-5 | Client downscales very large photos (for example longest side 2,560 px) before upload to save bandwidth; original is not kept | Agreed (Q11) |
| UPL-6 | Per-file progress, retry and cancel; failed uploads show the existing "Upload failed" state | Agreed (bulk) |
| UPL-7 | Duplicate detection by hash within the same record (warn, allow) | Agreed (bulk): warn and allow |
| UPL-8 | Rate limit uploads per user and per workspace | Agreed (bulk): 30 uploads per user per minute, 300 per workspace per hour |
| UPL-9 | Filenames are sanitised for display; the original name is stored as text only | Agreed (bulk) |
| UPL-10 | Uploads are idempotent: a retried request with the same submission id does not create a second file | Agreed (bulk) |

### Group C. Security and privacy

| ID | Requirement | Decision / Status |
|---|---|---|
| SEC-1 | Every upload, preview, download and removal re-checks workspace membership and permission on the parent record | Agreed (bulk) |
| SEC-2 | Application-level envelope encryption: random per-file data key, wrapped by a master key held outside the bucket (see Q2) | Agreed (Q2) |
| SEC-3 | Malware scan before first download; `scanning` and `failed` files are never served | Agreed (Q3) |
| SEC-4 | Serve with `nosniff`, `Content-Disposition: attachment` for documents, `private, no-store`; images only inline from the thumbnail route | Agreed (bulk) |
| SEC-5 | Strip EXIF location and device data from photos by default (see Q5) | Agreed (Q5) |
| SEC-6 | Removal destroys the key, deletes the object and writes a tombstone; backups apply tombstones before any restore | Agreed (bulk) |
| SEC-7 | Downloads are logged (who, when, which file) for owner and admin review | Agreed (Q9) |
| SEC-8 | Field users see only files on records they can see; closed work orders lock add and remove (as built) | Agreed (bulk) |

### Group D. Quotas and billing

| ID | Requirement | Decision / Status |
|---|---|---|
| QTA-1 | Quota by plan: 1 GB, 10 GB, 25 GB of stored bytes; reserved during upload, released on failure | Agreed (bulk) |
| QTA-2 | Warn owner and admins at 80% and 100%; at 100% uploads are refused with a clear message and a link to billing | Agreed (bulk) |
| QTA-3 | Usage meter shown in Settings, Billing only once the meter is live (no invented numbers) | Agreed (bulk): shown only when the meter is live |
| QTA-4 | Existing files stay readable and downloadable when over quota (for example after a downgrade); only new uploads are blocked | Agreed (Q12) |
| QTA-5 | Thumbnails and DR copies do not count toward the customer's quota | Agreed (bulk) |

### Group E. Work-order photos and files

| ID | Requirement | Decision / Status |
|---|---|---|
| WOP-1 | Render the built `WorkOrderPhotos` component on the work-order record page, below Instructions and above Time and notes (prototype order) | Agreed (bulk) |
| WOP-2 | Categories Before, After and Other files, with caption editing | Agreed (bulk) |
| WOP-3 | Add rights follow ACC-4: crew assigned to the work order add photos on issued work orders; office adds on drafts; none after completed or canceled | Agreed (bulk) |
| WOP-4 | Remove rights: uploader or office; confirmation names the file | Agreed (Q8) |
| WOP-5 | Tapping a photo opens a lightbox with previous and next, caption, uploader and time, and a download for documents | Agreed (bulk) |
| WOP-6 | Completion sign-off screen and print sheet show the Before and After photos | Agreed (bulk): print sheet and sign-off show Before and After thumbnails |
| WOP-7 | Work-order notifications and history record "photo added" and "photo removed" | Agreed (bulk) |
| WOP-8 | Assistant can answer "how many photos on WO-123" and list file names (read only); it never opens file contents | Agreed (Q14) |
| WOP-9 | Photos follow the work order when it is moved to another job; deleting a work order removes its files through the standard removal path | Agreed (bulk): files follow the work order; delete uses the standard removal path |

### Group F. Jobs files and notes

| ID | Requirement | Decision / Status |
|---|---|---|
| JBF-1 | Wire the prototype Job Files section, attachment dialog and description dialog to the same service with `entityType = job` | Agreed (bulk) |
| JBF-2 | Progress-note attachments link to the note and also appear in the job's Files section; removing a file keeps the note and records that the file was removed | Agreed (bulk) |
| JBF-3 | Job and work-order files stay separate lists, with a read-only "from work orders" roll-up on the job (see Q7) | Agreed (Q7) |
| JBF-4 | Job activity records file added and removed | Agreed (bulk) |

### Group G. Other consumers (later)

| ID | Requirement | Decision / Status |
|---|---|---|
| OTH-1 | Material catalog image upload as an alternative to a pasted URL (see Q6) | Deferred (Q6): URL only for now |
| OTH-2 | Customer and lead documents and photos | Deferred: later slice |
| OTH-3 | Estimate attachments and signed customer documents | Deferred: with estimates |
| OTH-4 | Chat attachments (images to the assistant) with explicit retention rules | Deferred: needs retention rules |
| OTH-5 | Business logo and user avatar (public-safe, smaller limits) | Deferred: later slice |

### Group H. Operations

| ID | Requirement | Decision / Status |
|---|---|---|
| OPS-1 | Daily encrypted copy of active files to the DR bucket, 30-day retention; quarterly restore drill | Agreed (Q16): same project, second bucket |
| OPS-2 | Account and workspace deletion removes every file, key and DR copy under the existing deletion process | Agreed (bulk) |
| OPS-3 | Orphan sweeper: objects without a `files` row and `uploading` rows older than 24 h are removed | Agreed (bulk) |
| OPS-4 | Usage reconciliation job compares bucket totals with `workspaceStorageUsage` and alerts on drift | Agreed (bulk) |
| OPS-5 | Key rotation procedure for the master key and for bucket credentials | Agreed (bulk) |
| OPS-6 | Logs never contain keys, signed URLs or file content | Agreed (bulk) |

## 7. UI and components

Follow [component-conventions.md](component-conventions.md): small kebab-case components, each with `.tsx`, `.data.ts` and `.stories.tsx`.

Existing, to wire up: `work-order-photos`, `job-files`, `job-attachment-dialog`, `job-file-description-dialog`, `job-note-composer`.

New shared components (in `packages/ui` or the web features folder):
- `file-picker` (button plus drag and drop, camera on mobile, type and size hints)
- `upload-progress-list` (per-file progress, retry, cancel, errors)
- `file-lightbox` (image viewer with previous and next, caption, download)
- `file-remove-dialog` (names the file, permanent-loss warning)
- `storage-usage-card` (quota bar with 80% and 100% states, for Billing)
- `storage-unavailable-banner`

Stories to cover: empty, uploading, scanning, ready, failed, over quota, locked, read-only, narrow and mobile, and keyboard use.

## 8. Delivery slices

| Slice | Scope |
|---|---|
| S0 | Decide §10; create Railway buckets (staging first) and local RustFS in `compose.yaml`; document env vars |
| S1 | Storage adapter, `files` / `fileLinks` / `fileEvents` / usage tables, upload and download routes, encryption, authorization, rehearsal against RustFS |
| S2 | Worker: scan, thumbnails, HEIC conversion, orphan sweeper |
| S3 | Consumers together (Q15): wire `WorkOrderPhotos` (lightbox, remove dialog, history, notifications, print and sign-off) and the job Files section, attachment dialogs and note attachments, plus the read-only work-order roll-up on the job |
| S4 | Quotas, warnings, Billing usage card |
| S5 | DR copies, restore drill, deletion integration |
| S6 | Assistant read tools, then other consumers (Group G) |

## 9. Risks

- **Encryption versus direct upload:** envelope encryption forces uploads and downloads through our servers. This costs some bandwidth on the web service, but 10 MB files keep it manageable.
- **Railway bucket limits:** no versioning, locks, lifecycle rules or backups, so our own sweeper and DR copies must do that work. Verified October 20, 2026 (§3.1); re-check before S0.
- **Spend limits:** a Railway hard usage limit or an unpaid plan suspends all bucket reads and writes, which would make every photo unavailable. Monitor it.
- **Malware scanning cost:** ClamAV needs memory and signature updates. A small dedicated worker is needed.
- **HEIC support:** converting needs a native library (for example sharp with libheif); confirm it builds in the Railway image.
- **Privacy:** photos can show people, addresses and documents. EXIF stripping and access checks matter more than for ordinary data.
- **Quota drift:** counters can disagree with the bucket; reconciliation is required.
- **Scope creep:** a generic documents feature. Keep v1 to attach-to-record.

## 10. Open questions (walk through first)

Recommended option first.

| # | Question | Options | Decision |
|---|---|---|---|
| Q1 | Upload and download path | Through our server, encrypted (**recommended**, needed for encryption and scanning) / browser-direct presigned URLs (simpler, but plaintext in the bucket) | **Decided: through our server** |
| Q2 | Encryption at rest | Application envelope encryption with a master key in a Railway secret, rotatable (**recommended**, matches existing docs) / rely on bucket privacy only / external KMS later |  **Decided: app-level envelope encryption, master key in a Railway secret, rotatable** |
| Q3 | Malware scan in v1 | ClamAV worker, files unavailable until clean (**recommended**, matches existing docs) / scan later and serve immediately |  **Decided: ClamAV worker; files unavailable until clean** |
| Q4 | Where does photo processing run | Worker service (**recommended**) / inline in the upload request |  **Decided: worker service, in the background** |
| Q5 | EXIF handling | Strip location and device data, keep orientation (**recommended**) / keep everything / office setting |  **Decided: strip location and device data, keep orientation** |
| Q6 | Material catalog images | Keep URL only for now (**recommended**) / add upload through the same service with workspace-private serving / both |  **Decided: keep URL only for now (OTH-1 stays later)** |
| Q7 | Job versus work-order files | Separate lists with a read-only roll-up on the job (**recommended**) / one shared list |  **Decided: separate lists, read-only roll-up on the job** |
| Q8 | Who can remove a file | Uploader or office (**recommended**) / office only / any crew on the record |  **Decided: uploader or office** |
| Q9 | Who can view downloads log | Owner and admin (**recommended**) / everyone with record access |  **Decided: owner and admin** |
| Q10 | File types beyond the list | Keep the list in UPL-1 (**recommended**) / add DWG, CSV, ZIP / office-configurable |  **Decided: keep the UPL-1 list** |
| Q11 | Photo resizing before upload | Client downscale to 2,560 px (**recommended**) / upload originals up to 10 MB / server-side only |  **Decided: client downscale to 2,560 px** |
| Q12 | Over-quota behavior | Block new uploads only, keep existing files (**recommended**) / also lock downloads |  **Decided: block new uploads only** |
| Q13 | Free plan | Same features with 1 GB (**recommended**) / photos only on paid plans |  **Decided: Free plan gets uploads with 1 GB** |
| Q14 | Assistant access | Counts and file names only (**recommended**) / may describe images later with explicit consent |  **Decided: counts and file names only** |
| Q16 | Disaster-recovery location | Separate Railway project with its own credentials (**recommended**) / same project, second bucket / external S3 provider (for example AWS S3 or Backblaze) |  **Decided: same Railway project, second bucket (accepted risk, see §3.1)** |
| Q15 | First consumer | Work-order photos (**recommended**, component already built) / job files / both together |  **Decided: work-order photos and job files together** |

## 11. Acceptance for the first release (S1 to S3)

Status: **all questions and requirement rows decided October 20, 2026.** S0 config written (RustFS in `compose.yaml`, env vars, runbook); local verification and the Railway buckets are pending. Next: S1.

- A crew member on an issued work order can add a Before photo from a phone, sees "Security scan pending", then the thumbnail.
- The same photo cannot be fetched by another workspace, by a user without access to the work order, or while scanning.
- A closed work order cannot gain or lose files.
- Removing a file deletes the object and key and records an audit event.
- Uploading past the quota is refused and existing files stay viewable.
- Locally, `docker compose up` starts RustFS and the same tests pass against it.
