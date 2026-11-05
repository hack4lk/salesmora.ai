import { createRequire } from 'node:module';
import { readFile, mkdir } from 'node:fs/promises';
const require = createRequire(new URL('../apps/web/package.json', import.meta.url));
const { chromium } = require('@playwright/test');
const addonRequire = createRequire(require.resolve('@storybook/addon-a11y'));
const axe = await readFile(addonRequire.resolve('axe-core/axe.min.js'), 'utf8');
const base = process.env.STORYBOOK_URL ?? 'http://127.0.0.1:6010';
const output = new URL('../.local/releases/capture-assistant-ui-20261102/', import.meta.url);
await mkdir(output, { recursive: true });
const entries = Object.values((await (await fetch(`${base}/index.json`)).json()).entries).filter(entry => entry.type === 'story' && (['Assistant/LeadCaptureResult', 'Assistant/ConnectedCaptureRead', 'Assistant/ConnectedCaptureSetup', 'Assistant/ConnectedCaptureSource'].includes(entry.title) || entry.title === 'Lead Capture/CaptureSetupReview' && entry.name === 'Frozen Assistant Timing'));
if (!entries.length) throw Error('Capture assistant stories were not indexed.');
const selected = process.argv[2] ? entries.filter(story => new RegExp(process.argv[2]).test(story.id)) : entries;
if (!selected.length) throw Error('No matching stories.');
const browser = await chromium.launch(); let passed = 0;
try {
  for (const width of [1440, 768, 320]) for (const story of selected) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => ['finished', 'errored'].includes(window.__STORYBOOK_PREVIEW__?.currentRender?.phase), undefined, { timeout: 60000 });
    if (await page.evaluate(() => window.__STORYBOOK_PREVIEW__.currentRender.phase) !== 'finished') throw Error(`${story.id} interactions failed: ${errors.join('; ')}`);
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error(`${story.id}: overflow at ${width}`);
    await page.addScriptTag({ content: axe });
    const violations = await page.evaluate(async () => (await window.axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(node => node.target) })));
    if (errors.length || violations.length) throw Error(`${story.id} ${width}: ${JSON.stringify({ errors, violations })}`);
    if (['Field Review', 'Publication Review', 'Source Summary', 'Intake Evidence', 'Shared Chat Review', 'Shared Chat Lifecycle', 'Pasted Sample'].includes(story.name)) await page.screenshot({ path: new URL(`${story.id}-${width}.png`, output).pathname, fullPage: true });
    if (story.name === 'Shared Chat Review') {
      const confirm = page.getByRole('button', { name: 'Apply reviewed suggestions' });
      await confirm.scrollIntoViewIfNeeded();
      const bounds = await confirm.boundingBox();
      if (!bounds || bounds.y < 0 || bounds.y + bounds.height > 1000) throw Error(`Shared chat confirmation is unreachable at ${width}px`);
      await page.screenshot({ path: new URL(`${story.id}-${width}-footer.png`, output).pathname });
    }
    console.log(`PASS ${story.name} ${width}px interaction/accessibility/layout`); passed++;
    await page.close();
  }
  console.log(`PASS ${passed} cases`);
} finally { await browser.close(); }
