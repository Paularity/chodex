````markdown
# 🔐 Chodex E2E Authentication Tests

This repo includes Playwright tests to verify login behavior, including OTP or QR-based 2FA setup.

## 🧪 Test Coverage

- Login with username/password
- Conditional flow:
  - If OTP screen appears, enter OTP manually via environment variable
  - If QR setup screen appears, confirm MFA registration flow

## 🛠️ Requirements

- Node.js 18+
- Playwright

Install dependencies:

```bash
npm install
npx playwright install
```
````

## ▶️ Run the App with Tests

Start dev server and run tests in **headless** mode with a test OTP:

> **On CMD:**

```cmd
set TEST_OTP=123456 && npx playwright test
```

> **On PowerShell:**

```powershell
$env:TEST_OTP = "123456"; npx playwright test
```

> **On Linux/macOS/Git Bash:**

```bash
TEST_OTP=123456 npx playwright test
```

## ⚙️ Customization

Update your OTP input in `.env` or directly via CLI before every test run, depending on your authenticator app (OTP refreshes every 30 seconds).

## 📁 Project Structure

```
/tests
  └── auth.spec.ts       # OTP-aware login test
playwright.config.ts     # Config with dev server + baseURL
```

## 🧼 Troubleshooting

- If OTP step times out, ensure your test authenticator is synced.
- You can disable OTP verification temporarily for easier test flow debugging.

---
