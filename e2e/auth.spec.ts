import { test, expect } from '@playwright/test';

const loginRoute = '**/auth/login';
const registerRoute = '**/auth/register-mfa/**';
const verifyRoute = '**/auth/verify-totp';

async function mockLogin(page, mfaRegistered = true) {
  await page.route(loginRoute, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        error: null,
        data: { mfaRegistered, sessionToken: 'token' },
        count: null,
      }),
    });
  });
}

async function mockRegister(page) {
  await page.route(registerRoute, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        error: null,
        data: { secret: 'sec', qrCodeImageBase64: 'data' },
        count: null,
      }),
    });
  });
}

async function mockVerify(page) {
  await page.route(verifyRoute, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        error: null,
        data: { token: 'jwt', refresh: 'ref' },
        count: null,
      }),
    });
  });
}

async function submitLogin(page, username, password) {
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /login/i }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('requires username and password', async ({ page }) => {
  await page.getByRole('button', { name: /login/i }).click();
  await expect(page.getByText('Username is required.')).toBeVisible();

  await submitLogin(page, 'alice', '');
  await expect(page.getByText('Password is required.')).toBeVisible();
});

test('login shows OTP form when MFA registered', async ({ page }) => {
  await mockLogin(page, true);
  await submitLogin(page, 'john', 'secret');
  await expect(page.getByText('Enter the 6-digit OTP')).toBeVisible();
});

test('login shows QR code when MFA not registered', async ({ page }) => {
  await mockLogin(page, false);
  await mockRegister(page);
  await submitLogin(page, 'bob', 'pass');
  await expect(page.getByText('Scan with Authenticator')).toBeVisible();
  await page.getByRole('button', { name: "I've Scanned the QR Code" }).click();
  await expect(page.getByText('Enter the 6-digit OTP')).toBeVisible();
});

test('verify OTP navigates to home page', async ({ page }) => {
  await mockLogin(page, true);
  await mockVerify(page);
  await submitLogin(page, 'jane', 'pw');
  await page.locator('[data-slot="input-otp-slot"]').first().click();
  await page.keyboard.type('123456');
  await page.getByRole('button', { name: /verify otp/i }).click();
  await expect(page.getByText('Welcome, jane!')).toBeVisible();
});

