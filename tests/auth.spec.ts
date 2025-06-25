/** 
 * Use this script via CMD to execute tests:
      set TEST_OTP=562616 && npx playwright test
**/

import { test, expect } from "@playwright/test";

const getOtp = (): string => {
  const otp = process.env.TEST_OTP?.trim();
  if (!otp) throw new Error("❌ TEST_OTP is not set.");
  return otp;
};

// test("login fails with wrong username", async ({ page }) => {
//   await page.goto("/login");
//   await page.fill("#username", "wronguser");
//   await page.fill("#password", "admin");
//   await page.getByRole("button", { name: /login/i }).click();

//   await expect(page.getByText(/invalid username or password/i)).toBeVisible({
//     timeout: 3000,
//   });
// });

// test("login fails with wrong password", async ({ page }) => {
//   await page.goto("/login");
//   await page.fill("#username", "admin");
//   await page.fill("#password", "wrongpass");
//   await page.getByRole("button", { name: /login/i }).click();

//   await expect(page.getByText(/invalid username or password/i)).toBeVisible({
//     timeout: 3000,
//   });
// });

test("login with OTP or QR", async ({ page }) => {
  await page.goto("/login");
  await page.fill("#username", "admin");
  await page.fill("#password", "admin");
  await page.getByRole("button", { name: /login/i }).click();

  const otp = page.getByText("Enter the 6-digit OTP");
  const qr = page.getByText("Scan with Authenticator");

  await Promise.race([
    otp.waitFor({ state: "visible", timeout: 5000 }),
    qr.waitFor({ state: "visible", timeout: 5000 }),
  ]);

  if (await otp.isVisible()) {
    await page.fill('input[name="otp"]', getOtp());
    await page.click('button:has-text("Verify OTP")');
    await expect(page.getByRole("button", { name: /logout/i })).toBeVisible({
      timeout: 5000,
    });
  } else if (await qr.isVisible()) {
    await expect(qr).toBeVisible();
  } else {
    throw new Error("❌ Neither OTP nor QR screen was visible.");
  }
});

test("logout resets session", async ({ page }) => {
  await page.goto("/login");
  await page.fill("#username", "admin");
  await page.fill("#password", "admin");
  await page.getByRole("button", { name: /login/i }).click();

  const otp = page.getByText("Enter the 6-digit OTP");
  await otp.waitFor({ state: "visible", timeout: 5000 });

  await page.fill('input[name="otp"]', getOtp());
  await page.click('button:has-text("Verify OTP")');
  await expect(page.getByRole("button", { name: /logout/i })).toBeVisible({
    timeout: 5000,
  });

  await page.getByRole("button", { name: /logout/i }).click();
  await expect(page.locator("#username")).toBeVisible(); // back to login
});
