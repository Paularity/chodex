import { test, expect } from "@playwright/test";

test("login with OTP or QR, and completes OTP flow if needed", async ({
  page,
}) => {
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
    const OTP = process.env.TEST_OTP || ""; // ✅ pulled from inline env var
    if (!OTP) throw new Error("❌ TEST_OTP not set.");
    await page.fill('input[name="otp"]', OTP);
    await page.click('button:has-text("Verify OTP")');
    await expect(page.getByText(/welcome, admin/i)).toBeVisible({
      timeout: 5000,
    });
  } else if (await qr.isVisible()) {
    console.log("🛠 MFA registration flow detected. QR code shown.");
    await expect(qr).toBeVisible();
  } else {
    throw new Error("❌ Neither OTP nor QR screen was visible.");
  }
});
