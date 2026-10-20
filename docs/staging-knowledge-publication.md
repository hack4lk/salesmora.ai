# Staging knowledge publication

`apps/worker/src/publish-staging.ts` is a dedicated operator command for the approved Railway `salesmora` / `staging` worker and private `salesmora_staging` database. It never loads `.env.local`. The original local-only seed/evaluation commands retain their guards. No public HTTP publishing endpoint, new database migration or new service is added.

## Preview and publish

Deploy the updated worker image. In a Railway worker shell, use the existing TypeScript loader:

```sh
cd /app/apps/worker
node --import ./node_modules/tsx/dist/loader.mjs src/publish-staging.ts
node --import ./node_modules/tsx/dist/loader.mjs src/publish-staging.ts --publish DIGEST_FROM_PREVIEW
```

Preview does not connect to PostgreSQL, Redis or OpenAI and needs no provider key. It returns only the content/version digest, counts, embedding space and conservative UTF-8 token upper bound. The current corpus contains eight articles and 23 chunks; the preview upper bound is 7,707 tokens. Inspect `knowledge/operations/manifest.json` and the Markdown before publishing. The planned campaign article remains a negative retrieval control: publication does not make planned content eligible for chat retrieval.

Publishing requires `OPENAI_API_KEY` in the staging worker, with permission for the embedding endpoint. Set a separate staging key through Railway secrets, never source or chat. The web service separately needs a staging key that permits chat Responses and embeddings before `CHAT_ENABLED=true`. The persistent worker can remain `WORKER_TASKS=retention`; this command calls the existing ingestion service directly and exits. It does not need a queue or Redis.

The command checks exact project/environment/service IDs, environment name, production Node mode and private database hostname/name; local, production, other services and test overrides fail closed. These are operator mistake guards, not a substitute for Railway account access controls. The reviewed digest changes with article versions or embedding space. Unknown flags, a missing/stale digest, empty/duplicate content and a total upper bound over 100,000 tokens are refused before mutation.

## Publication and recovery

A session advisory lock rejects another publisher before ingestion. Each article reuses the existing deterministic identity, draft/current-head transitions, vector validation and atomic publication. Already published versions make no new embedding call. Changed text becomes unpublished until its new vectors are ready. Missing articles retire only after all current articles succeed. Failed partial runs are safe to repeat using the same reviewed digest; completed versions are reused. Existing source permission/role/plan/status filters remain mandatory.

Requests use the pinned `text-embedding-3-small` / 1536 space, a 30-second provider timeout and ten-minute total publication deadline. There are no automatic publisher retries. Ingestion usage is recorded as `corpus_embedding`, separate from workspace allowances, with conservative reservations retained for unknown usage. The command prints only a fixed success/failure event, digest and counts; no raw errors, keys, database URLs, article contents or vectors. A failed run exits nonzero.

After publishing, verify a repeat run reports all articles unchanged and perform role-filtered retrieval/citation checks. Preview and mocked tests do not establish real vector publication or semantic quality. Enable chat only after staging provider configuration and bounded live checks are ready. Do not run the local evaluation/browser fixtures against staging; they can reset test resources or use fictional provider overrides.

OpenAI embedding format: [official embedding guide](https://developers.openai.com/api/docs/guides/embeddings).

## First staging attempt

The deployed preview matched the reviewed corpus. The first embedding request failed because OpenAI returned `credit_balance_exhausted`; subsequent bounded availability diagnostics confirmed `insufficient_quota`. One article remains draft, no vectors are published, and the failed corpus usage call is retained. After the API organization has credits, rerun preview/publish with the current digest; no manual database cleanup is needed.

## Funded staging retry — October 13, 2026

After the user funded the API organization, the same reviewed digest published all eight articles and 23 vectors. A repeat invocation reported zero published and eight unchanged articles. Twelve direct role/product-status retrieval and citation checks passed, including Field restrictions, Owner-only permissions help and planned campaign exclusion. Three live semantic queries returned the expected articles. These direct help checks use synthetic default-policy contexts and are distinct from public authenticated application checks. The earlier draft was resumed safely; no manual cleanup or guard bypass was needed.
