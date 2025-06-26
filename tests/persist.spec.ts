import { test, expect } from '@playwright/test';

const storageKey = 'auth-storage';
const loggedInState = {
  state: {
    token: 'valid-token',
    user: 'admin',
    isAuthenticated: true,
  },
  version: 0,
};

test('user stays logged in after refresh', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [storageKey, JSON.stringify(loggedInState)]);
  await page.reload();
  await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
});

test('logout clears state and prevents access on refresh', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [storageKey, JSON.stringify(loggedInState)]);
  await page.reload();
  await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
  await page.getByRole('button', { name: /logout/i }).click();
  await expect(page.getByText(/login to chodex/i)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/login to chodex/i)).toBeVisible();
});

test('corrupted token redirects to login', async ({ page }) => {
  const bad = { ...loggedInState, state: { ...loggedInState.state, token: '' } };
  await page.goto('/');
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [storageKey, JSON.stringify(bad)]);
  await page.reload();
  await expect(page.getByText(/login to chodex/i)).toBeVisible();
});

test('fresh load with no token shows login screen', async ({ page }) => {
  await page.goto('/');
  await page.evaluate((k) => localStorage.removeItem(k), storageKey);
  await page.reload();
  await expect(page.getByText(/login to chodex/i)).toBeVisible();
});
