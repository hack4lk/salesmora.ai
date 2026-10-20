import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
const require = createRequire(new URL('../apps/web/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const addonRequire = createRequire(require.resolve('@storybook/addon-a11y'));
const axeSource = await readFile(addonRequire.resolve('axe-core/axe.min.js'), 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('http://127.0.0.1:6006/iframe.html?id=onboarding-teamstep--add-and-continue&viewMode=story');
    await expect(page.getByRole('combobox', { name: 'Permission role' })).toHaveValue('admin');
    await expect(page.getByRole('combobox', { name: 'Work profile' })).toHaveCount(0);
    await page.screenshot({ path: `/private/tmp/salesmora-role-picker-${width}.png`, fullPage: true });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error(`Role picker overflows at ${width}`);
    await page.goto('http://127.0.0.1:6006/iframe.html?id=workspace-homeoverview--field&viewMode=story');
    await expect(page.getByRole('heading', { name: 'Your assigned work' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create lead' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Create campaign' })).toHaveCount(0);
    await page.goto('http://127.0.0.1:6006/iframe.html?id=workspace-workspacenavigation--denied-capabilities&viewMode=story');
    await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Campaigns', exact: true })).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Management navigation' })).toHaveCount(0);
    await page.goto('http://127.0.0.1:6006/iframe.html?id=workspace-workspacenavigation--workspace-settings&viewMode=story');
    await expect(page.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings?workspace=fictional-workspace');
    await expect(page.getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page');
    for (const story of ['settings-permissions', 'settings-without-permissions']) {
      await page.goto(`http://127.0.0.1:6006/iframe.html?id=workspace-workspacenavigation--${story}&viewMode=story`);
      await page.waitForFunction(() => ['finished', 'errored'].includes(window.__STORYBOOK_PREVIEW__?.currentRender?.phase));
      if (await page.evaluate(() => window.__STORYBOOK_PREVIEW__.currentRender.phase) !== 'finished') throw Error(`${story}: interaction failed`);
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error(`${story}: overflow at ${width}`);
      await page.addScriptTag({ content: axeSource });
      const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector('#storybook-root'), {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      })).violations.map(item => item.id));
      if (violations.length) throw Error(`${story}: ${violations.join(', ')}`);
      await page.screenshot({ path: `/private/tmp/salesmora-${story}-${width}.png`, fullPage: true });
      console.log(`PASS ${story} interactions/accessibility/layout ${width}px`);
    }
  }
  if (errors.length) throw Error(errors.join('\n'));
  console.log('PASS role picker interactions, Field actions, capability-filtered navigation, desktop/mobile layout.');
} finally { await browser.close(); }
