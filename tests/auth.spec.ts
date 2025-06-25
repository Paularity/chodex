import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /login to chodex/i })).toBeVisible();

  await page.getByLabel('Username').fill('john');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: /login/i }).click();

  await expect(page.getByText(/scan with authenticator|enter the 6-digit otp/i)).toBeVisible();
});
