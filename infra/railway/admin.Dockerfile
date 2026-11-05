FROM node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392 AS build
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
# Disposable compile-time configuration; no runtime credentials or database access.
RUN ADMIN_DATABASE_URL=postgresql://salesmora_admin_app:build-only@127.0.0.1:1/build \
    ADMIN_AUTH_SECRET=build-only-placeholder-not-a-runtime-secret \
    ADMIN_AUTH_URL=https://admin-staging.salesmora.ai \
    ADMIN_ENVIRONMENT=staging ADMIN_WORKSPACE_EXPORTS_ENABLED=false \
    NEXT_TELEMETRY_DISABLED=1 pnpm --filter @salesmora/admin build

FROM node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /app /app
USER node
WORKDIR /app/apps/admin
EXPOSE 3003
CMD ["sh", "-c", "exec node node_modules/next/dist/bin/next start --hostname :: --port \"${PORT:-3003}\""]
