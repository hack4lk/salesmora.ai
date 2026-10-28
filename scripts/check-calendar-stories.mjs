import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
const require = createRequire(new URL('../apps/web/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const addonRequire = createRequire(require.resolve('@storybook/addon-a11y'));
const axeSource = await readFile(addonRequire.resolve('axe-core/axe.min.js'), 'utf8');
const base = process.env.STORYBOOK_URL ?? 'http://127.0.0.1:6006';
const index = await (await fetch(`${base}/index.json`)).json();
const filter = process.argv[2] ? new RegExp(process.argv[2]) : /calendar-calendareventcard--/;
const stories = Object.values(index.entries).filter(e => e.type === 'story' && e.title.startsWith('Calendar/') && filter.test(e.id));
if (!stories.length) throw Error('No matching Calendar stories.');
const browser = await chromium.launch();
const failures = [];
let passed = 0;
try {
  const widths = stories.some(story => ['Calendar/CalendarWeekGrid', 'Calendar/CalendarPage'].includes(story.title)) ? [1440, 1024, 768, 320] : [1440, 768, 320];
  for (const width of widths) {
    for (const story of stories) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      page.setDefaultTimeout(10000);
      const errors = [];
      try {
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
        await page.goto(`${base}/iframe.html?id=${story.id}&viewMode=story`);
        await page.waitForFunction(() => ['finished', 'errored'].includes(window.__STORYBOOK_PREVIEW__?.currentRender?.phase));
        if (await page.evaluate(() => window.__STORYBOOK_PREVIEW__.currentRender.phase) !== 'finished') throw Error('Story interaction failed.');
        if (story.id === 'calendar-calendardaycolumn--keyboard') {
          await page.waitForFunction(() => document.querySelector('[data-calendar-keyboard-complete="true"]'));
        }
        if (errors.length) throw Error(errors.join('\n'));
        if (story.title === 'Calendar/CalendarVisitPeekDrawer' && story.name !== 'Keyboard') {
          await expect(page.getByRole('dialog')).toHaveCSS('transform', 'none');
        }
        if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error('Horizontal overflow.');
        if (story.title === 'Calendar/CalendarWeekGrid' && !['Error', 'Loading'].includes(story.name)) {
          const dayGroups = page.getByRole('group');
          const first = await dayGroups.nth(0).boundingBox(), second = await dayGroups.nth(1).boundingBox();
          if (!first || !second) throw Error('Missing Calendar day groups.');
          if (width >= 900 && (Math.abs(first.y - second.y) > 1 || second.x <= first.x)) throw Error('Week must use seven columns at desktop/tablet widths.');
          if (width < 900 && second.y <= first.y) throw Error('Week must use a vertical day list below the tablet breakpoint.');
        }
        if (story.title === 'Calendar/CalendarPage' && !(await page.getByRole('dialog').count())) {
          const days = page.getByRole('region', { name: 'Week schedule', exact: true }).getByRole('group');
          if (await days.count()) {
            const first = await days.nth(0).boundingBox(), second = await days.nth(1).boundingBox();
            if (!first || !second) throw Error('Missing composed Calendar days.');
            if (width >= 900 && (Math.abs(first.y - second.y) > 1 || second.x <= first.x)) throw Error('Composed week must use seven columns.');
            if (width < 900 && second.y <= first.y) throw Error('Composed week must stack on mobile.');
          }
        }
        await page.addScriptTag({ content: axeSource });
        const violations = await page.evaluate(async () => (await window.axe.run(document.body, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
        })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })));
        if (violations.length) throw Error(JSON.stringify(violations));
        if (story.id === 'calendar-calendardaycolumn--keyboard') {
          // Native browser keys verify focus-visible through the MUI modal lifecycle;
          // synthetic Storybook key events don't update Chromium's input modality.
          const more = page.getByRole('button', { name: '+3 more visits', exact: true });
          await more.focus();
          await page.keyboard.press('Enter');
          await expect(page.getByRole('dialog')).toBeVisible();
          await page.screenshot({ path: `/private/tmp/calendar-day-popover-${width}.png`, fullPage: true, animations: 'disabled' });
          const modalViolations = await page.evaluate(async () => (await window.axe.run(document.body, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
          })).violations.map(v => v.id));
          if (modalViolations.length) throw Error(`Day popover accessibility: ${modalViolations.join(', ')}`);
          await page.keyboard.press('Escape');
          await expect(page.getByRole('dialog')).toHaveCount(0);
          await expect(more).toBeFocused();
        }
        if (story.id === 'calendar-calendarvisitpeekdrawer--keyboard') {
          const launcher = page.getByRole('button', { name: 'Open visit', exact: true });
          await launcher.focus();
          await page.keyboard.press('Enter');
          const dialog = page.getByRole('dialog');
          await expect(dialog).toBeVisible();
          const reschedule = dialog.getByRole('button', { name: 'Reschedule visit', exact: true });
          const close = dialog.getByRole('button', { name: 'Close panel', exact: true });
          await reschedule.focus();
          await page.keyboard.press('Tab');
          await expect(close).toBeFocused();
          await page.keyboard.press('Shift+Tab');
          await expect(reschedule).toBeFocused();
          const drawerViolations = await page.evaluate(async () => (await window.axe.run(document.body, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
          })).violations.map(v => v.id));
          if (drawerViolations.length) throw Error(`Visit drawer accessibility: ${drawerViolations.join(', ')}`);
          await page.keyboard.press('Escape');
          await expect(page.getByRole('dialog')).toHaveCount(0);
          await expect(launcher).toBeFocused();
        }
        if (story.id === 'calendar-calendarscheduledialog--keyboard') {
          const launcher = page.getByRole('button', { name: 'Open scheduling', exact: true });
          await launcher.focus(); await page.keyboard.press('Enter');
          const dialog = page.getByRole('dialog'); await expect(dialog).toBeVisible();
          const cancel = dialog.getByRole('button', { name: 'Cancel', exact: true });
          const close = dialog.getByRole('button', { name: 'Close', exact: true });
          await cancel.focus(); await page.keyboard.press('Tab'); await expect(close).toBeFocused();
          await page.keyboard.press('Shift+Tab'); await expect(cancel).toBeFocused();
          await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
          await expect(launcher).toBeFocused();
        }
        if (story.id === 'calendar-calendarscheduledialog--saving') {
          await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toBeVisible();
        }
        if (story.name === 'Keyboard') {
          const outline = await page.locator(':focus').evaluate(button => {
            const style = getComputedStyle(button);
            return { width: parseFloat(style.outlineWidth), style: style.outlineStyle };
          });
          if (!outline.width || outline.style === 'none') throw Error('Keyboard focus outline missing.');
        }
        if (['Default', 'Work Order Only', 'Field Scoped', 'Long Content', 'Year Boundary', 'Read Only', 'Review', 'Clear Schedule', 'Warnings'].includes(story.name))
          await page.screenshot({ path: `/private/tmp/${story.id}-${width}.png`, fullPage: true, animations: 'disabled' });
        console.log(`PASS ${story.id} ${width}px`); passed++;
      } catch (error) {
        const failure = `${story.id} ${width}px: ${error.message}`;
        failures.push(failure); console.error(`FAIL ${failure}`);
        await page.screenshot({ path: `/private/tmp/${story.id}-failure-${width}.png`, fullPage: true }).catch(() => {});
      } finally { await page.close(); }
    }
  }
  if (failures.length) throw Error(failures.join('\n'));
  console.log(`PASS ${passed} Calendar interaction/accessibility/layout checks`);
} finally { await browser.close(); }
