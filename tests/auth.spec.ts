import { test, expect } from '@playwright/test';
import readline from 'readline';

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, ans => { rl.close(); resolve(ans); }));
}

test('otp login flow', async ({ page }) => {
  await page.goto('/login');

  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin');
  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForSelector('#otp');
  const otp = await askQuestion('Enter OTP: ');
  await page.fill('#otp', otp);
  await page.click('button:has-text("Verify OTP")');

  await expect(page.locator('.dashboard')).toBeVisible();
});
