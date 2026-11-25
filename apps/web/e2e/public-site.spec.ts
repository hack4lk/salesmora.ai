import { expect, test } from '@playwright/test';
import { homeFaqData } from '../src/features/public-site/home-faq/home-faq.data';
import { homeHeroData } from '../src/features/public-site/home-hero/home-hero.data';
import { registrationScreenData } from '../src/features/auth/registration-screen/registration-screen.data';

for (const width of [320, 1440]) {
  test(`public pages render and navigate at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: homeHeroData.title, level: 1 })).toBeVisible();
    await expect(page.locator('main img').first()).toHaveAttribute('src', homeHeroData.image);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.getByText(homeFaqData.questions[0].question).click();
    await expect(page.getByText(homeFaqData.questions[0].answer)).toBeVisible();
    await page.getByRole('link', { name: 'Terms of Service' }).click();
    await expect(page).toHaveURL(/\/terms$/);
    await expect(page.getByRole('heading', { name: 'Terms of Service', level: 1 })).toBeVisible();
    await expect(page.getByText('Draft for legal review — not effective')).toBeVisible();
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('footer').getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('aria-current', 'page');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.getByRole('link', { name: 'Privacy Policy' }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page.getByRole('heading', { name: 'Privacy Policy', level: 1 })).toBeVisible();
    await expect(page.getByText('Draft for legal and data-practices review — not effective')).toBeVisible();
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('footer').getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('aria-current', 'page');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.getByRole('link', { name: 'Product' }).click();
    await expect(page).toHaveURL(/\/#product$/);
    await expect(page.locator('#product')).toBeVisible();
  });
}

test('registration draft links preserve the unfinished form', async ({ page }) => {
  await page.goto('/register');
  const planContinue = page.getByRole('button', { name: 'Continue with Free' });
  if (await planContinue.isVisible()) await planContinue.click();
  await expect(page.getByText(registrationScreenData.legal.notice)).toBeVisible();
  const name = page.locator('input[name=name]');
  await name.fill('Fictional User');
  for (const [label, path] of [['Terms of Service', '/terms'], ['Privacy Policy', '/privacy']]) {
    const link = page.getByRole('link', { name: `${label} (opens in a new tab)` });
    await expect(link).toHaveAttribute('href', path);
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    const popup = page.waitForEvent('popup');
    await link.click();
    const document = await popup;
    await expect(document).toHaveURL(new RegExp(`${path}$`));
    await expect(document.getByText(/Draft for legal.*review — not effective/)).toBeVisible();
    await document.close();
    await expect(name).toHaveValue('Fictional User');
    await expect(page.getByRole('checkbox')).not.toBeChecked();
  }
});
