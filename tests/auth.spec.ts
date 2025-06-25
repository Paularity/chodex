import { test, expect } from '@playwright/test';
import readlineSync from 'readline-sync';

test('otp login flow', async ({ page }) => {
  await page.goto('/login');

  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin');
  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForSelector('#otp');
  const otp = process.env.OTP ?? readlineSync.question('Enter OTP: ');
  await page.fill('#otp', otp);
  await page.click('button:has-text("Verify OTP")');

  await expect(page.locator('.dashboard')).toBeVisible();
});
