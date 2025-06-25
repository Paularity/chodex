import { test, expect } from '@playwright/test';

const loginResponseRegistered = {
  success: true,
  error: null,
  count: null,
  data: { mfaRegistered: true, sessionToken: 'abc' }
};

const loginResponseNotRegistered = {
  success: true,
  error: null,
  count: null,
  data: { mfaRegistered: false, sessionToken: 'abc' }
};

const registerMfaResponse = {
  success: true,
  error: null,
  count: null,
  data: { secret: 'secret', qrCodeImageBase64: 'dGVzdA==' }
};

const verifyOtpResponse = {
  success: true,
  error: null,
  count: null,
  data: { token: 'token', refresh: 'refresh' }
};

test.describe('Authentication flow', () => {
  test('login with existing MFA', async ({ page }) => {
    await page.route('**/auth/login', route => route.fulfill({
      status: 200,
      body: JSON.stringify(loginResponseRegistered),
      contentType: 'application/json'
    }));
    await page.route('**/auth/verify-totp', route => route.fulfill({
      status: 200,
      body: JSON.stringify(verifyOtpResponse),
      contentType: 'application/json'
    }));

    await page.goto('/');
    await page.getByLabel('Username').fill('john');
    await page.getByLabel('Password').fill('secret');
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page.getByText('Enter the 6-digit OTP')).toBeVisible();

    await page.locator('input[data-input-otp]').fill('123456');
    await page.getByRole('button', { name: /verify otp/i }).click();

    await expect(page.getByText('Welcome, john!')).toBeVisible();
  });

  test('register MFA when not configured', async ({ page }) => {
    await page.route('**/auth/login', route => route.fulfill({
      status: 200,
      body: JSON.stringify(loginResponseNotRegistered),
      contentType: 'application/json'
    }));
    await page.route('**/auth/register-mfa/**', route => route.fulfill({
      status: 200,
      body: JSON.stringify(registerMfaResponse),
      contentType: 'application/json'
    }));
    await page.route('**/auth/verify-totp', route => route.fulfill({
      status: 200,
      body: JSON.stringify(verifyOtpResponse),
      contentType: 'application/json'
    }));

    await page.goto('/');
    await page.getByLabel('Username').fill('alice');
    await page.getByLabel('Password').fill('secret');
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page.getByText('Scan with Authenticator')).toBeVisible();
    await page.getByRole('button', { name: "I've Scanned the QR Code" }).click();

    await expect(page.getByText('Enter the 6-digit OTP')).toBeVisible();
    await page.locator('input[data-input-otp]').fill('654321');
    await page.getByRole('button', { name: /verify otp/i }).click();

    await expect(page.getByText('Welcome, alice!')).toBeVisible();
  });
});
