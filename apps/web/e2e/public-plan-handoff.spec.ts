import { expect, test } from '@playwright/test';

test('homepage plan links preserve the chosen intent through registration', async ({ page }) => {
  test.skip(process.env.SALESMORA_BILLING_TEST !== '1', 'Plan selection requires sandbox billing.');
  const submittedPlans: string[] = [];
  await page.route('**/api/auth/sign-up/email', async route => {
    submittedPlans.push(route.request().postDataJSON().plan);
    await route.fulfill({ status: 400, contentType: 'application/json', body: '{}' });
  });
  for (const [name, id] of [['Free', 'free'], ['Standard', 'standard'], ['Premium', 'premium']]) {
    await page.goto('/');
    const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name, exact: true }) });
    await card.getByRole('link', { name: 'Create an account' }).click();
    await expect(page).toHaveURL(new RegExp(`/register\\?plan=${id}$`));
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Create your account', exact: true })).toBeVisible();
    await expect(page.getByText(new RegExp(`${name} ·`))).toBeVisible();
    await page.getByRole('button', { name: 'Change plan' }).click();
    await expect(page.getByRole('radio', { name, exact: true })).toBeChecked();
    await page.getByRole('button', { name: `Continue with ${name}` }).click();
    await page.locator('input[name=name]').fill('Example User');
    await page.locator('input[name=email]').fill('owner@example.com');
    await page.locator('input[name=password]').fill('Fictional-password-42!');
    await page.locator('input[name=confirmPassword]').fill('Fictional-password-42!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: name === 'Free' ? 'Create free account' : 'Create account and continue' }).click();
    await expect.poll(() => submittedPlans.at(-1)).toBe(id);
    await expect(page.getByRole('button', { name: 'Change plan' })).toBeEnabled();
  }
});

test('invalid or repeated plan parameters show feedback instead of selecting the requested plan', async ({ page }) => {
  test.skip(process.env.SALESMORA_BILLING_TEST !== '1', 'Plan selection requires sandbox billing.');
  for (const query of ['plan=invalid', 'plan=standard&plan=premium']) {
    await page.goto(`/register?${query}`);
    await expect(page.getByRole('status')).toHaveText('The requested plan is unavailable. Please choose a plan.');
    await expect(page.getByRole('radio', { name: 'Free', exact: true })).toBeChecked();
  }
  await page.goto('/register');
  await expect(page.getByRole('radio', { name: 'Free', exact: true })).toBeChecked();
  await expect(page.getByRole('status')).toHaveCount(0);
});

test('registration keeps its existing behavior when sandbox billing is disabled', async ({ page }) => {
  test.skip(process.env.SALESMORA_BILLING_TEST === '1', 'This case requires sandbox billing to be disabled.');
  await page.goto('/register?plan=premium');
  await expect(page.getByRole('heading', { name: 'Create your account', exact: true })).toBeVisible();
  await expect(page.getByRole('radio')).toHaveCount(0);
});
