FROM node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392
WORKDIR /app
ENV NODE_ENV=production
COPY --chown=node:node infra/forms-gateway/gateway.mjs /app/gateway.mjs
USER node
EXPOSE 8080
CMD ["node", "/app/gateway.mjs"]
