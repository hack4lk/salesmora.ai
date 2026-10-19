import { fileURLToPath } from "node:url";
import { createDatabase } from "./database";
import {
  configureWorkspaceAIBudget,
  defaultMonthlyAITokens,
  workspaceAIAllowance,
} from "./ai-usage";
process.loadEnvFile(
  fileURLToPath(new URL("../../../.env.local", import.meta.url)),
);
const target = process.argv.includes("--test")
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;
if (
  process.env.NODE_ENV === "production" ||
  !target ||
  !["127.0.0.1", "localhost"].includes(new URL(target).hostname) ||
  (process.argv.includes("--test") &&
    !new URL(target).pathname.endsWith("_test"))
)
  throw Error(
    "Budget configuration requires a local development/test database",
  );
const value = (name: string) => process.argv[process.argv.indexOf(name) + 1];
const workspaceId = value("--workspace");
const tokens = value("--tokens");
if (
  !process.argv.includes("--workspace") ||
  !/^[0-9a-f-]{36}$/i.test(workspaceId ?? "")
)
  throw Error("Supply --workspace with its workspace UUID");
const db = createDatabase(target);
try {
  if (!(await db("workspaces").where({ id: workspaceId }).first()))
    throw Error("Workspace unavailable");
  if (process.argv.includes("--tokens"))
    await configureWorkspaceAIBudget(
      db,
      workspaceId,
      defaultMonthlyAITokens(tokens ?? ""),
    );
  const allowance = await workspaceAIAllowance(db, workspaceId);
  console.log(
    JSON.stringify({
      workspaceId,
      monthlyTokens: allowance.monthlyTokens,
      usedOrReservedTokens: allowance.usedTokens.toString(),
      remainingTokens: (BigInt(allowance.monthlyTokens) > allowance.usedTokens
        ? BigInt(allowance.monthlyTokens) - allowance.usedTokens
        : 0n
      ).toString(),
    }),
  );
} finally {
  await db.destroy();
}
