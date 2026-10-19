# SalesMora staging infrastructure

`.railway/railway.ts` describes the four existing services and their two persistent volumes. It targets the `salesmora` project / `staging` environment; the initial import plan had no changes. All variable values are unmanaged and remain in Railway, including credentials and private URL references.

Use Node 22, pnpm from the repository's packageManager field, and Railway CLI 5.66.0 or newer. Install with `pnpm install --frozen-lockfile`. Confirm the linked project/environment with `railway status` before these commands:

```sh
railway config plan --environment staging
railway config apply --environment staging
railway up --service web --environment staging --detach
railway up --service worker --environment staging --detach
```

Review each plan. Whole-project configuration can delete a service or volume if omitted; retain all resources in this file. Do not pass destructive confirmation flags without reviewing an intentional destructive change. Do not use include-variables, decrypt-variables or show-values when capturing evidence: they can expose credentials. A source upload does not automatically apply IaC, and no GitHub auto-deploy is connected.

The JSON/TOML Config as Code format is deprecated and cannot be enabled for these new services. Keep this single supported authoring file. See [the staging runbook](../docs/railway-staging.md) for credentials, service setup, release gates and deployment evidence.
