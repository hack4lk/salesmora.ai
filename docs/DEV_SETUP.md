# Development Setup

## Starting the Development Environment

### Quick Start (Both Web & Worker)
```bash
pnpm dev
```

This starts both the web server and worker server concurrently using `concurrently`:
- **Web server**: http://127.0.0.1:3000 (Next.js development mode)
- **Worker server**: Processes file uploads, scans with ClamAV, generates thumbnails

### Individual Servers

**Web Server Only:**
```bash
pnpm web:dev
```

**Worker Server Only:**
```bash
pnpm worker:dev
```

## File Upload Pipeline

The file storage system requires **both** servers running:

1. **Upload** → File sent to `/api/work-orders/[id]/files`
2. **Store** → File encrypted and stored in S3
3. **Queue** → Worker picks up file for processing
4. **Process** → Worker scans with ClamAV, generates thumbnail
5. **Status** → UI polls `/api/work-orders/[id]/files` for updated status
6. **Display** → Thumbnail shown when file reaches "ready" state

## Environment Variables

Configuration is loaded from `.env.local`. Key variables:
- `OBJECT_STORAGE_ENDPOINT`: S3-compatible storage (RustFS locally)
- `FILE_MASTER_KEY`: Encryption key for files
- `CLAMAV_HOST` / `CLAMAV_PORT`: Malware scanning service

See `.env.example` for full list.

## Docker Services

Local development uses Docker containers via `docker-compose`:
- **PostgreSQL** (port 55432)
- **Redis** (port 56379)
- **RustFS** (S3-compatible, port 59000)
- **ClamAV** (port 53310)
- **Mailpit** (SMTP + web UI, port 18025)

Start with:
```bash
pnpm db:setup
```

This ensures all containers are running and databases are initialized.
