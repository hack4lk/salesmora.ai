import { expect, test } from '@playwright/test';

const pages = [
  { path: '/login', title: 'Welcome back', noReferrer: true },
  { path: '/register', title: 'Create your account', noReferrer: true },
  { path: '/forgot-password', title: 'Forgot your password?', noReferrer: false },
  { path: '/reset-password', title: 'Choose a new password', noReferrer: true },
  { path: '/verify-email', title: 'Email verification', noReferrer: true },
  { path: '/accept-invitation', title: 'Your team invitation', noReferrer: true },
] as const;

for (const width of [320, 1440]) {
  test(`authentication pages use shared public chrome at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const { path, title, noReferrer } of pages) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      if (noReferrer) expect(response?.headers()['referrer-policy']).toBe('no-referrer');
      await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
      await expect(page.locator('header img')).toHaveAttribute('src', '/branding/salesmora-logo.svg');
      await expect(page.getByRole('main')).toHaveAttribute('id', 'main');
      const footer = page.getByRole('contentinfo');
      await expect(footer.getByText('SalesMora is a product of Karpuk Creative, LLC.')).toBeVisible();
      await expect(footer.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms');
      await expect(footer.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}

test('public auth skip navigation and login validation still work', async ({ page }) => {
  await page.goto('/login');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await expect(page.getByText('Enter your password.')).toBeVisible();
  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
});
