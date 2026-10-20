import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';

const require = createRequire(new URL('../apps/web/package.json', import.meta.url));
const { chromium } = require('@playwright/test');
const addonRequire = createRequire(require.resolve('@storybook/addon-a11y'));
const axeSource = await readFile(addonRequire.resolve('axe-core/axe.min.js'), 'utf8');
const index = await (await fetch('http://127.0.0.1:6006/index.json')).json();
const stories = Object.values(index.entries).filter(entry => entry.type === 'story' && ['Assistant/AssistantPanel', 'Assistant/LeadDraftCard', 'Assistant/ContextChip', 'Assistant/LeadStageDraftCard', 'Assistant/LeadUpdateDraftCard', 'Assistant/LeadAssignmentDraftCard', 'Assistant/LeadNoteDraftCard', 'Assistant/LeadArchiveDraftCard', 'Assistant/LeadExportDraftCard', 'Assistant/LeadDeleteDraftCard', 'Assistant/LeadSearchResultsCard', 'Assistant/LeadDetailsCard', 'Assistant/LeadActivityCard'].includes(entry.title) && (!process.argv[2] || new RegExp(process.argv[2]).test(entry.id)));
if (!stories.length) throw Error('Assistant stories were not indexed');
const browser = await chromium.launch();
const errors = [];
try {
  for (const width of [1440, 320]) {
    for (const story of stories) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      page.on('pageerror', error => errors.push(`${story.id}: ${error.message}`));
      await page.goto(`http://127.0.0.1:6006/iframe.html?id=${story.id}&viewMode=story`);
      await page.waitForFunction(() => ['finished', 'errored'].includes(window.__STORYBOOK_PREVIEW__?.currentRender?.phase));
      const phase = await page.evaluate(() => window.__STORYBOOK_PREVIEW__.currentRender.phase);
      if (phase !== 'finished') throw Error(`${story.id}: interaction failed at ${width}px`);
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error(`${story.id}: horizontal overflow at ${width}px`);
      await page.addScriptTag({ content: axeSource });
      const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector('#storybook-root'), {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      })).violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })));
      if (violations.length) throw Error(`${story.id} at ${width}px: ${JSON.stringify(violations)}`);
      if (['Thinking', 'Stop Stream', 'Interrupted Stream', 'Streaming', 'Sources', 'Review', 'Confirmed', 'Expired', 'Monthly Allowance'].includes(story.name)) {
        if (story.name === 'Monthly Allowance') await page.getByRole('alert').scrollIntoViewIfNeeded();
        await page.screenshot({ path: `/private/tmp/assistant-${story.name.toLowerCase().replaceAll(' ', '-')}-${width}.png`, fullPage: false });
      }
      await page.close();
      console.log(`PASS ${story.name} ${width}px`);
    }
  }
  if (errors.length) throw Error(errors.join('\n'));
  console.log(`PASS ${stories.length * 2} interaction/accessibility/layout checks`);
} finally {
  await browser.close();
}
