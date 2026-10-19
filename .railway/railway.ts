import { defineRailway, image, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const postgresVolume = volume("postgres-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "us-west2", sizeMB: 5000 });
  const redisVolume = volume("redis-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "us-west2", sizeMB: 5000 });
  const worker = service("worker", {
    build: { buildEnvironment: "V3", builder: "DOCKERFILE", dockerfilePath: "infra/railway/worker.Dockerfile" },
    replicas: { "us-west2": 1 },
    deploy: { drainingSeconds: 40, restartPolicyMaxRetries: 3 },
  });
  const web = service("web", {
    build: { buildEnvironment: "V3", builder: "DOCKERFILE", dockerfilePath: "infra/railway/web.Dockerfile" },
    healthcheck: "/api/health",
    healthcheckTimeout: 120,
    preDeploy: "node --import /app/packages/data/node_modules/tsx/dist/loader.mjs /app/packages/data/src/migrate.ts",
    replicas: { "us-west2": 1 },
    deploy: { drainingSeconds: 100, restartPolicyMaxRetries: 3 },
  });
  const redis = service("redis", {
    source: image("redis:7.4-alpine@sha256:858f009f9709ce576febc734aa78b8f6d624b82571f9ddb6bda4377c833b3499"),
    start: "sh -c 'exec /usr/local/bin/docker-entrypoint.sh redis-server --bind 0.0.0.0 :: --requirepass \"${REDIS_PASSWORD:?}\" --appendonly yes --appendfsync everysec --maxmemory-policy noeviction' ",
    replicas: { "us-west2": 1 },
    deploy: { drainingSeconds: 40, restartPolicyMaxRetries: 3 },
    volumeMounts: { "/data": redisVolume },
  });
  const postgres = service("postgres", {
    build: { buildEnvironment: "V3", builder: "DOCKERFILE", dockerfilePath: "infra/postgres/Dockerfile" },
    replicas: { "us-west2": 1 },
    deploy: { drainingSeconds: 40, restartPolicyMaxRetries: 3 },
    volumeMounts: { "/var/lib/postgresql/data": postgresVolume },
  });

  // The CLI imports this ownership policy; SDK 3.15's ProjectDefinition types
  // do not yet declare it. Keep it on the definition so secrets stay unmanaged.
  const staging = {
    variables: { managed: false },
    resources: [worker, web, redis, postgres, postgresVolume, redisVolume],
  };
  return project("salesmora", staging);
});
