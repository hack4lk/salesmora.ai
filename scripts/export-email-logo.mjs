import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '../apps/web/node_modules/@playwright/test/index.mjs';
const root = new URL('../', import.meta.url);
const svg = await readFile(new URL('apps/web/public/branding/salesmora-logo.svg', root), 'utf8');
const font = await readFile(new URL('apps/web/public/fonts/source-sans-3/source-sans-3-variable.woff2', root));
const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 540, height: 144 }, deviceScaleFactor: 2 });
  await page.setContent(`<style>@font-face{font-family:'Source Sans 3';src:url(data:font/woff2;base64,${font.toString('base64')}) format('woff2');font-weight:200 900}body{margin:0}svg{display:block;width:540px;height:144px}</style>${svg}`);
  await page.evaluate(() => document.fonts.load('700 48px "Source Sans 3"'));
  await page.locator('svg').screenshot({ path: fileURLToPath(new URL('apps/web/public/branding/salesmora-email-logo.png', root)), omitBackground: true });
  console.log('Exported approved SVG and Source Sans 3 as a PNG for email.');
} finally { await browser.close(); }
