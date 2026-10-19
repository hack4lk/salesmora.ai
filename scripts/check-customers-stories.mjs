import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const require = createRequire(
  new URL("../apps/web/package.json", import.meta.url),
);
const { chromium } = require("@playwright/test");
const ts = require("typescript");
const { resolve } = require("node:path");
const addonRequire = createRequire(require.resolve("@storybook/addon-a11y"));
const axeSource = await readFile(
  addonRequire.resolve("axe-core/axe.min.js"),
  "utf8",
);
const storybookUrl = process.env.STORYBOOK_URL ?? "http://127.0.0.1:6006";
const index = await (await fetch(`${storybookUrl}/index.json`)).json();
let stories = Object.values(index.entries).filter(
  (entry) =>
    entry.type === "story" &&
    (entry.title.startsWith("Customers/") ||
      [
        "Data display/MetricCard",
        "Assistant/CustomerDraftCard",
        "Assistant/CustomerExportDraftCard",
        "Assistant/RecordResultsCard",
        "Assistant/CandidatePicker",
      ].includes(entry.title)) &&
    (!process.argv[2] ||
      process.argv[2] === "--play-only" ||
      new RegExp(process.argv[2]).test(entry.id)),
);
if (process.argv[2] === "--play-only") {
  const filtered = [];
  for (const story of stories) {
    const source = await readFile(
      resolve(
        new URL("../apps/web/", import.meta.url).pathname,
        story.importPath,
      ),
      "utf8",
    );
    const ast = ts.createSourceFile(
      story.importPath,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const matching = ast.statements.some(
      (statement) =>
        ts.isVariableStatement(statement) &&
        statement.declarationList.declarations.some((declaration) => {
          if (
            !declaration.initializer ||
            !declaration.initializer.getText(ast).includes("play:")
          )
            return false;
          const id = declaration.name
            .getText(ast)
            .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
            .toLowerCase();
          return story.id.endsWith(`--${id}`);
        }),
    );
    if (matching) filtered.push(story);
  }
  stories = filtered;
}
if (!stories.length) throw Error("Customer/shared stories were not indexed");
const browser = await chromium.launch();
const errors = [];
try {
  const work = [1440, 768, 320].flatMap((width) =>
    stories.map((story) => ({ width, story })),
  );
  let cursor = 0;
  async function worker() {
    while (cursor < work.length) {
      const { width, story } = work[cursor++];
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      try {
        const runtimeErrors = [];
        page.on("pageerror", (error) => runtimeErrors.push(error.message));
        page.on("console", (message) => {
          if (
            message.type() === "error" &&
            !message.text().startsWith("Failed to load resource:")
          )
            runtimeErrors.push(message.text());
        });
        await page.goto(
          `${storybookUrl}/iframe.html?id=${story.id}&viewMode=story`,
        );
        await page.waitForFunction(() =>
          ["finished", "errored"].includes(
            window.__STORYBOOK_PREVIEW__?.currentRender?.phase,
          ),
        );
        const phase = await page.evaluate(
          () => window.__STORYBOOK_PREVIEW__.currentRender.phase,
        );
        if (runtimeErrors.length)
          throw Error(runtimeErrors.join("\n").slice(0, 6000));
        if (phase !== "finished")
          throw Error(`${story.id}: interaction failed at ${width}px`);
        if (
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          )
        )
          throw Error(`${story.id}: horizontal overflow at ${width}px`);
        await page.addScriptTag({ content: axeSource });
        const violations = await page.evaluate(async () =>
          (
            await window.axe.run(document.body, {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21aa"],
              },
            })
          ).violations.map((item) => ({
            id: item.id,
            nodes: item.nodes.map((node) => node.target),
          })),
        );
        if (violations.length)
          throw Error(
            `${story.id} at ${width}px: ${JSON.stringify(violations)}`,
          );
        if (
          [
            "Default",
            "Review",
            "Profile",
            "Drawer",
            "Add",
            "Edit",
            "Assistant Review",
            "Maximum Safe Count",
            "Loading",
            "Error",
          ].includes(story.name)
        ) {
          await page.screenshot({
            path: `/private/tmp/customers-${story.id}-${width}.png`,
            fullPage: true,
          });
        }
        console.log(`PASS ${story.id} ${width}px`);
      } catch (error) {
        errors.push(`${story.id} ${width}px: ${error.message}`);
        console.error(`FAIL ${story.id} ${width}px: ${error.message}`);
      } finally {
        await page.close();
      }
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  if (errors.length) throw Error(errors.join("\n"));
  console.log(
    `PASS ${stories.length * 3} interaction/accessibility/layout checks`,
  );
} finally {
  await browser.close();
}
