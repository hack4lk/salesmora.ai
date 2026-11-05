import { createRequire } from 'node:module';
import { readFile, mkdir } from 'node:fs/promises';
const require = createRequire(new URL('../apps/web/package.json', import.meta.url));
const { chromium } = require('@playwright/test');
const addonRequire = createRequire(require.resolve('@storybook/addon-a11y'));
const axe = await readFile(addonRequire.resolve('axe-core/axe.min.js'), 'utf8');
const base = process.env.STORYBOOK_URL ?? 'http://127.0.0.1:6010';
const output = new URL('../.local/releases/capture-gmail-connections-20261103/', import.meta.url); await mkdir(output, { recursive: true });
const entries = Object.values((await (await fetch(`${base}/index.json`)).json()).entries).filter(entry => entry.type === 'story' && ['Lead Capture/ConnectedGmailAccount', 'Lead Capture/GmailCaptureScope', 'Lead Capture/GmailSamplePicker', 'Lead Capture/GmailEmailExample', 'Lead Capture/GmailFieldMapping', 'Lead Capture/GmailSetupPage'].includes(entry.title));
const selected = process.argv[2] ? entries.filter(story => new RegExp(process.argv[2]).test(story.id)) : entries;
if (!selected.length) throw Error('No matching Gmail stories.');
const browser = await chromium.launch(); let passed = 0;
try {
  for (const width of [1440, 768, 320]) for (const story of selected) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } }), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => ['finished', 'errored'].includes(window.__STORYBOOK_PREVIEW__?.currentRender?.phase), undefined, { timeout: 60000 });
    if (await page.evaluate(() => window.__STORYBOOK_PREVIEW__.currentRender.phase) !== 'finished') throw Error(`${story.id}: ${errors.join('; ')}`);
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error(`${story.id}: horizontal overflow ${width}`);
    await page.addScriptTag({ content: axe });
    const violations = await page.evaluate(async () => (await window.axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })));
    if (errors.length || violations.length) throw Error(`${story.id} ${width}: ${JSON.stringify({ errors, violations })}`);
    if (story.title === 'Lead Capture/ConnectedGmailAccount' || story.title === 'Lead Capture/GmailSamplePicker' || story.id.includes('mailbox-example')) await page.screenshot({ path: new URL(`${story.id}-${width}.png`, output).pathname, fullPage: true });
    console.log(`PASS ${story.id} ${width}px interactions/accessibility/layout`); passed++; await page.close();
  }
  console.log(`PASS ${passed} cases`);
} finally { await browser.close(); }
