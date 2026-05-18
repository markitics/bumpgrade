import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
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
      "APP_ENV=test PUBLIC_SITE_URL=http://localhost:3100 BETTER_AUTH_URL=http://localhost:3100 BETTER_AUTH_SECRET=playwright-local-better-auth-secret BUMPGRADE_OWNER_EMAILS=m@rkmoriarty.com npm run dev -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
