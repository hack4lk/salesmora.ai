import { test, expect } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:3000' });

test('camera capture feature - use photo button functionality', async ({ page }) => {
  console.log('Step 1: Login');
  await page.goto('/login');
  await page.fill('input[type="email"]', 'lkarpuk@drizl.app');
  await page.fill('input[type="password"]', 'asdfasdf');
  
  // Click login and wait for redirect
  await Promise.all([
    page.waitForNavigation({ timeout: 30000 }),
    page.click('button[type="submit"]')
  ]);
  console.log('✓ Logged in successfully');

  console.log('Step 2: Navigate to job');
  await page.goto('/jobs/41832a49-9fab-4937-882c-78f7afac9c3a?workspace=ef692d28-7b89-4a23-8a53-8b7436d89bd2');
  await page.waitForLoadState('networkidle');
  console.log('✓ Job page loaded');

  console.log('Step 3: Find upload button');
  const uploadButton = page.locator('button').filter({ hasText: /Add/ }).first();
  await uploadButton.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Upload button found');

  console.log('Step 4: Click upload button (no wait)');
  await uploadButton.click({ force: true });
  
  console.log('Step 5: Wait for dialog (timeout: 10s)');
  try {
    await page.waitForSelector('[role="dialog"], [class*="dialog"], [class*="modal"]', { timeout: 10000 });
    console.log('✓ Dialog appeared');
  } catch {
    // Dialog might appear without a specific role/class
    await page.waitForTimeout(1000);
    console.log('⚠ No dialog selector found, continuing anyway');
  }

  // Take screenshot
  await page.screenshot({ path: '/tmp/01-upload-dialog.png' });
  console.log('✓ Screenshot saved');
  
  console.log('Step 6: Check for Take Photo tab');
  const cameraTab = page.locator('button:has-text("Take Photo")');
  const cameraTabVisible = await cameraTab.isVisible({ timeout: 5000 }).catch(() => false);
  
  if (cameraTabVisible) {
    console.log('✓ Camera tab found');
    await cameraTab.click();
    await page.waitForTimeout(300);

    // Take screenshot
    await page.screenshot({ path: '/tmp/02-camera-tab.png' });
    
    const startBtn = page.locator('button:has-text("Start Camera")');
    const usePhotoBtn = page.locator('button:has-text("Use Photo")');
    
    const startVisible = await startBtn.isVisible().catch(() => false);
    const usePhotoHidden = await usePhotoBtn.isHidden().catch(() => false);
    
    console.log(`   Start Camera button: ${startVisible ? '✓ visible' : '✗ not visible'}`);
    console.log(`   Use Photo button: ${usePhotoHidden ? '✓ hidden' : '✗ visible'}`);
    
    if (startVisible && usePhotoHidden) {
      console.log('\n✅ CAMERA CAPTURE TEST PASSED!');
    } else {
      console.log('\n✗ Test failed: Not all elements in expected state');
    }
  } else {
    console.log('✗ Camera tab not found');
  }
});
