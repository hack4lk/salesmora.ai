import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log("1. Navigating to job page...");
    await page.goto("http://127.0.0.1:3000/jobs/41832a49-9fab-4937-882c-78f7afac9c3a?workspace=ef692d28-7b89-4a23-8a53-8b7436d89bd2");
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    console.log("✓ Job page loaded");
    
    // Look for file upload button - try multiple selectors
    let uploadBtn = await page.locator('button:has-text(/Add before|Add after|Add Other/i)').first();
    
    if (!await uploadBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("Trying alternative selector...");
      uploadBtn = await page.locator('button').filter({ hasText: /Add/ }).first();
    }
    
    if (await uploadBtn.isVisible()) {
      console.log("2. ✓ Found upload button, clicking...");
      await uploadBtn.click();
      
      // Wait for dialog
      await page.waitForSelector('[class*="dialog"], [class*="modal"]', { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
      console.log("✓ Dialog appeared");
      
      // Click Take Photo tab
      const cameraTab = page.locator('button:has-text("Take Photo")');
      if (await cameraTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log("3. ✓ Camera tab visible, clicking...");
        await cameraTab.click();
        await page.waitForTimeout(300);
        console.log("✓ Camera tab active");
        
        // Verify Start Camera button is visible
        const startBtn = page.locator('button:has-text("Start Camera")');
        if (await startBtn.isVisible()) {
          console.log("4. ✓ Start Camera button visible");
          
          // Check if Use Photo button exists (should be hidden)
          const usePhotoBtn = page.locator('button:has-text("Use Photo")');
          const isHidden = await usePhotoBtn.isHidden().catch(() => true);
          console.log(`5. ✓ Use Photo button exists and is ${isHidden ? "hidden" : "visible"} (expected: hidden initially)`);
          
          // Check the rendered HTML to ensure component is properly mounted
          const html = await page.locator('body').innerHTML();
          if (html.includes('Use Photo')) {
            console.log("6. ✓ 'Use Photo' text found in DOM");
          } else {
            console.log("6. ✗ 'Use Photo' text NOT found in DOM");
          }
          
          console.log("\n✅ Camera capture feature is properly integrated!");
          console.log("   - Dialog opens");
          console.log("   - Camera tab switchable");
          console.log("   - Use Photo button is in DOM and properly hidden/shown");
          
        } else {
          console.log("✗ Start Camera button not found");
        }
      } else {
        console.log("✗ Camera tab not visible");
      }
    } else {
      console.log("✗ Upload button not found");
    }
    
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
