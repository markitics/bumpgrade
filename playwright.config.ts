import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command:
      "APP_ENV=test PUBLIC_SITE_URL=http://localhost:3100 BETTER_AUTH_URL=http://localhost:3100 BETTER_AUTH_SECRET=playwright-local-better-auth-secret BUMPGRADE_OWNER_EMAILS=m@rkmoriarty.com,unverified-owner@example.com BUMPGRADE_ENFORCE_EMAIL_VERIFICATION=true STRIPE_SECRET_KEY_SANDBOX=sk_test_incomplete npm run preview:worker -- --port 3100 --local --live-reload false --var APP_ENV:test --var PUBLIC_SITE_URL:http://localhost:3100 --var BETTER_AUTH_URL:http://localhost:3100 --var BETTER_AUTH_SECRET:playwright-local-better-auth-secret --var BUMPGRADE_OWNER_EMAILS:m@rkmoriarty.com,unverified-owner@example.com --var BUMPGRADE_ENFORCE_EMAIL_VERIFICATION:true --var STRIPE_SECRET_KEY_SANDBOX:sk_test_incomplete",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
