FROM node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392 AS build
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
# Auth initializes during route compilation. These are disposable build-only
# values, never deployment credentials; no database/provider is contacted.
RUN DATABASE_URL=postgresql://build:build@127.0.0.1:1/build \
    BETTER_AUTH_SECRET=build-only-placeholder-not-a-runtime-secret \
    BETTER_AUTH_URL=https://build.invalid TERMS_VERSION=build-placeholder \
    CHAT_ENABLED=false NEXT_TELEMETRY_DISABLED=1 pnpm --filter @salesmora/web build

FROM node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
# Retain workspace source and migration runner for the pre-deploy command.
COPY --from=build --chown=node:node /app /app
USER node
WORKDIR /app/apps/web
EXPOSE 3000
# Exec Node directly so Railway's SIGTERM reaches Next.js.
CMD ["sh", "-c", "exec node node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port \"${PORT:-3000}\""]
