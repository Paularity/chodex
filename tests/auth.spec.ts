import { test, expect } from '@playwright/test';

test('login shows OTP or registration', async ({ page }) => {
  await page.goto('/login');

  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin');
  await page.getByRole('button', { name: /login/i }).click();

  const otpHeading = page.getByText('Enter the 6-digit OTP');
  const qrHeading = page.getByText('Scan with Authenticator');

  await Promise.race([
    otpHeading.waitFor({ state: 'visible' }),
    qrHeading.waitFor({ state: 'visible' }),
  ]);

  const isOtp = await otpHeading.isVisible();
  const isQr = await qrHeading.isVisible();
  expect(isOtp || isQr).toBe(true);
});
