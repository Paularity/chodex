import { test, expect } from '@playwright/test';

test.describe('auth flow', () => {
  test('login without mfa then register', async ({ page }) => {
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          error: null,
          count: null,
          data: {
            mfaRegistered: false,
            sessionToken: 'session123'
          }
        })
      });
    });

    await page.route('**/auth/register-mfa', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          error: null,
          count: null,
          data: { qrCodeImageBase64: 'Zm9vYmFy' }
        })
      });
    });

    await page.goto('/');
    await expect(page.getByRole('heading', { name: /login to chodex/i })).toBeVisible();
    await page.getByLabel('Username').fill('john');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page.getByText('Scan with Authenticator')).toBeVisible();
  });

  test('login with mfa and verify otp', async ({ page }) => {
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          error: null,
          count: null,
          data: {
            mfaRegistered: true,
            sessionToken: 'session123'
          }
        })
      });
    });

    await page.route('**/auth/verify-totp', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          error: null,
          count: null,
          data: {
            token: 'token',
            refresh: 'refresh'
          }
        })
      });
    });

    await page.goto('/');
    await expect(page.getByRole('heading', { name: /login to chodex/i })).toBeVisible();
    await page.getByLabel('Username').fill('john');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: /login/i }).click();

    // Should show OTP form
    await expect(page.getByText('Enter the 6-digit OTP')).toBeVisible();

    // Fill OTP digits by typing into the first slot
    await page.locator('[data-slot="input-otp-slot"]').first().click();
    await page.keyboard.type('123456');
    // Wait for verify button to become enabled
    await page.getByRole('button', { name: /verify otp/i }).click();

    await expect(page.getByText(/welcome/i)).toBeVisible();
  });
});
