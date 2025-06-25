import { defineConfig } from '@playwright/test';
import readline from 'node:readline';

async function globalSetup() {
  if (!process.env.OTP) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    process.env.OTP = await new Promise((resolve) =>
      rl.question('Enter OTP for Playwright tests: ', (ans) => {
        rl.close();
        resolve(ans);
      })
    );
  }
}

export default defineConfig({
  testDir: './tests',
  globalSetup,
  webServer: {
    command: 'npx vite dev --port 5174 --strictPort',
    port: 5174,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  use: {
    baseURL: 'http://localhost:5174',
    headless: true,
  },
});
