import { expect, test } from "@playwright/test";

import {
  assertCustomerProofRegistryIntegrity,
  customerProofPolicy,
  customerProofRecords,
  customerProofSourceDataRoute,
} from "../src/lib/customer-proof";

const customerProofRoutes = [
  "/features",
  "/features/sales-funnels",
  "/compare/clickfunnels-alternative",
  "/pricing",
] as const;

const inventedSocialProofPattern =
  /\b(?:trusted by \d|trusted by leading|join thousands|hundreds of customers|thousands of customers|customer revenue|revenue lift)\b/i;

test.describe("customer proof and trust signals", () => {
  test("registry starts without approved customer claims", () => {
    expect(() => assertCustomerProofRegistryIntegrity()).not.toThrow();
    expect(customerProofRecords).toEqual([]);
    expect(customerProofRecords.filter((record) => record.review.status === "approved")).toHaveLength(0);
  });

  test("source data exposes the approval policy without private proof content", async ({ request }) => {
    const response = await request.get(customerProofSourceDataRoute);
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        id: "bumpgrade-customer-proof-source-data",
        sourceDataRoute: customerProofSourceDataRoute,
        issueNumber: 553,
        records: [],
        policy: expect.objectContaining({
          id: customerProofPolicy.id,
          sourceDataRoute: customerProofSourceDataRoute,
        }),
        summary: expect.objectContaining({
          totalRecords: 0,
          approvedRecords: 0,
          renderedCustomerProofRecords: 0,
          statusCounts: expect.objectContaining({
            approved: 0,
            pending_approval: 0,
            withdrawn: 0,
          }),
        }),
      }),
    );

    const payloadText = JSON.stringify(payload);
    expect(payloadText).not.toMatch(/m@rkmoriarty\.com|raw inbound MIME|codex_inbound_messages|raw customer data/i);
  });

  for (const route of customerProofRoutes) {
    test(`${route} renders the safe empty proof state`, async ({ page }) => {
      await page.goto(route);

      await expect(page.getByText("Customer proof policy").first()).toBeVisible();
      await expect(page.getByText("Approved proof records").first()).toBeVisible();
      await expect(page.locator(".customer-proof-policy strong").first()).toHaveText("0");
      await expect(page.getByRole("link", { name: "View proof records" }).first()).toHaveAttribute(
        "href",
        customerProofSourceDataRoute,
      );

      const html = await page.content();
      expect(html).not.toContain('"@type":"Review"');
      expect(html).not.toMatch(inventedSocialProofPattern);
    });
  }
});
