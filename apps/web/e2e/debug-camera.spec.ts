import { test } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:3000' });

test('debug - list all buttons on job page', async ({ page }) => {
  console.log('Navigating to job...');
  await page.goto('/jobs/41832a49-9fab-4937-882c-78f7afac9c3a?workspace=ef692d28-7b89-4a23-8a53-8b7436d89bd2');
  await page.waitForLoadState('networkidle');
  
  // Get all buttons
  const buttons = await page.locator('button').all();
  console.log(`Found ${buttons.length} buttons on page`);
  
  for (let i = 0; i < Math.min(buttons.length, 20); i++) {
    const text = await buttons[i].textContent();
    const visible = await buttons[i].isVisible();
    console.log(`  Button ${i}: "${text?.trim()}" (visible: ${visible})`);
  }

  // Take screenshot
  await page.screenshot({ path: '/tmp/debug-job-page.png' });
  console.log('Screenshot saved to /tmp/debug-job-page.png');
});
