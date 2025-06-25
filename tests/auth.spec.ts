import { test, expect } from '@playwright/test';

const OTP = process.env.OTP || '';

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

test('login fails with invalid credentials', async ({ page }) => {
  await page.goto('/login');

  await page.fill('#username', 'wrong');
  await page.fill('#password', 'wrong');
  await page.getByRole('button', { name: /login/i }).click();

  // Expect an error toast or message
  await expect(page.getByText(/invalid username or password/i)).toBeVisible();
});

test('login with mfa and verify otp', async ({ page }) => {
  await page.goto('/login');

  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin');
  await page.getByRole('button', { name: /login/i }).click();

  const otpInput = page.locator('#otp');
  const qrHeading = page.getByText('Scan with Authenticator');

  await Promise.race([
    otpInput.waitFor({ state: 'visible' }),
    qrHeading.waitFor({ state: 'visible' }),
  ]);

  if (await qrHeading.isVisible()) {
    test.skip('MFA not registered, skipping OTP verification');
  }

  await otpInput.fill(OTP);
  await page.getByRole('button', { name: /verify otp/i }).click();

  await expect(page.getByText(/welcome/i)).toBeVisible();
});
