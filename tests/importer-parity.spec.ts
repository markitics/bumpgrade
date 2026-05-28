import { expect, test } from "@playwright/test";

import {
  importerDraftImportApiRoute,
  importerDraftImportCapabilityId,
  importerDraftImportConfirmationText,
  importerDraftPreviewApiRoute,
  importerDraftRollbackApiRoute,
  importerDraftRollbackCapabilityId,
  importerDraftRollbackConfirmationText,
  importerExportMatchTemplates,
  importerPlatforms,
  importerPrivateRecordReviewActionApiRoute,
  importerPrivateRecordReviewCapabilityId,
  importerPrivateRecordReviewRoute,
  importerSourceData,
  importerSourceDataRoute,
  sourceChecklistPreflightSignals,
} from "../src/lib/importers";

const firstWaveImporterIds = [
  "importer-clickfunnels",
  "importer-samcart",
  "importer-kit",
  "importer-kajabi",
  "importer-shopify",
  "importer-podia",
  "importer-systeme",
  "importer-kartra",
  "importer-thrivecart",
];

type SourceChecklistPayload = {
  id: string;
  label: string;
  bring: string;
  bumpgradeUsesItFor: string;
  reviewBeforePrivatePlan: string;
  preflightSignals: string[];
};

type ExportMatchTemplatePayload = {
  id: string;
  label: string;
  fileKinds: string[];
  requiredHeaderLabels: string[];
  helpfulHeaderLabels: string[];
  signalLabels: string[];
  sourceChecklistItemIds: string[];
  draftEntities: string[];
  usesItFor: string;
  reviewPrompt: string;
};

type ImporterSourcePlatformPayload = {
  id: string;
  competitorId: string;
  platformName: string;
  slug: string;
  status: string;
  route: string;
  compareRoute: string;
  sourceIds: string[];
  inputs: Array<{ kind: string }>;
  importableAreas: Array<{ id: string; draftEntities: string[] }>;
  sourceChecklist: SourceChecklistPayload[];
  exportMatchTemplates: ExportMatchTemplatePayload[];
  unsupportedNow: string[];
};

type ImporterCapabilityPayload = {
  id: string;
  platformId: string;
  platformName: string;
  route: string;
  previewApiRoute: string;
  apiRoute: string;
  privateRecordReviewRoute: string;
  privateRecordReviewActionApiRoute: string;
  confirmationText: string;
  accepts: string[];
  draftEntities: string[];
  preflightReview: {
    route: string;
    responseFields: string[];
    writesRecords: boolean;
    createsDraft: boolean;
    rawSourceEchoed: boolean;
    goLiveEffectsEnabled: boolean;
    exportFileAnalysis: {
      rawFileNamesEchoed: boolean;
      rawRowsEchoed: boolean;
      rawTextEchoed: boolean;
    };
  };
  privateRecordReview: {
    id: string;
    route: string;
    actionApiRoute: string;
    idempotencyRequired: boolean;
    rawRowsEchoed: boolean;
    rawTextEchoed: boolean;
    rawExportFileNamesEchoed: boolean;
    rawExtractedValuesStored: boolean;
    subscriberSendsEnabled: boolean;
    publicExportsEnabled: boolean;
    goLiveEffectsEnabled: boolean;
  };
  rollback: {
    route: string;
    confirmationText: string;
    deletesRecords: boolean;
    preservesPrivateStructuredImportRecords: boolean;
    restartsAvailable: boolean;
    rawSourceEchoed: boolean;
    goLiveEffectsEnabled: boolean;
  };
};

type ImporterSourcePayload = {
  id: string;
  generatedFrom: string;
  currentAvailability: {
    privateDraftImportPlatformIds: string[];
    allDedicatedPrivateDraftImportersLive: boolean;
    privateDraftRollbackLive: boolean;
    platformExportMatchTemplatesLive: boolean;
  };
  commonContract: {
    liveWriteActions: ImporterCapabilityPayload[];
  };
  platforms: ImporterSourcePlatformPayload[];
};

type CompareSourcePayload = {
  importers: Array<{
    id: string;
    competitorId: string;
    platformName: string;
    status: string;
    route: string;
    sourceIds: string[];
    priority: number;
  }>;
};

const csvHeadersForAllImporterTemplates =
  "email,full_name,tags,status,product_title,checkout_url,order_total,page_url";

function findById<T extends { id: string }>(records: T[], id: string) {
  const record = records.find((item) => item.id === id);
  expect(record, `Expected ${id} to be present`).toBeTruthy();
  if (!record) throw new Error(`Expected ${id} to be present`);
  return record;
}

function privatePreviewPayloadFor(slug: string) {
  const privateSlug = slug.replace(/[^a-z0-9]+/gi, "_").toUpperCase();

  return {
    offerTitle: `${slug} parity import map`,
    sourceUrl: `https://private.example/${slug}/checkout`,
    sourceFileNames: [`${slug}-private-export.csv`],
    pageCopy: `PRIVATE_${privateSlug}_PAGE_COPY`,
    followUpNotes: `PRIVATE_${privateSlug}_FOLLOW_UP`,
    launchGoal: `PRIVATE_${privateSlug}_LAUNCH_GOAL`,
    audience: `PRIVATE_${privateSlug}_AUDIENCE`,
    exportManifest: `${csvHeadersForAllImporterTemplates}
private-buyer@example.com,Private Buyer,PRIVATE_SEGMENT,subscribed,PRIVATE_PRODUCT,https://private.example/${slug}/checkout,97,https://private.example/${slug}/page
`,
  };
}

test.describe("importer parity contracts", () => {
  test("source data and private capability contracts stay table-driven across first-wave platforms", async ({ request }) => {
    const importerResponse = await request.get(importerSourceDataRoute);
    expect(importerResponse.ok(), await importerResponse.text()).toBeTruthy();
    const importerPayload = (await importerResponse.json()) as ImporterSourcePayload;

    const compareResponse = await request.get("/compare/source-data");
    expect(compareResponse.ok(), await compareResponse.text()).toBeTruthy();
    const comparePayload = (await compareResponse.json()) as CompareSourcePayload;

    const platformIds = importerPlatforms.map((platform) => platform.id);
    expect(platformIds).toEqual(expect.arrayContaining(firstWaveImporterIds));
    expect(new Set(platformIds).size).toBe(platformIds.length);
    expect(importerPayload.platforms.map((platform) => platform.id)).toEqual(platformIds);
    expect(importerPayload.currentAvailability.privateDraftImportPlatformIds).toEqual(platformIds);
    expect(importerPayload.currentAvailability.allDedicatedPrivateDraftImportersLive).toBe(true);
    expect(importerPayload.currentAvailability.privateDraftRollbackLive).toBe(true);
    expect(importerPayload.currentAvailability.platformExportMatchTemplatesLive).toBe(true);

    const rollbackCapabilityIds = new Set<string>();

    for (const platform of importerPlatforms) {
      await test.step(platform.platformName, async () => {
        const sourceRecord = findById(importerPayload.platforms, platform.id);
        const comparisonRecord = findById(comparePayload.importers, platform.id);
        const liveWriteAction = findById(importerPayload.commonContract.liveWriteActions, importerDraftImportCapabilityId(platform.id));
        const sourceChecklistIds = new Set(platform.sourceChecklist.map((item) => item.id));
        const expectedTemplateIds = importerExportMatchTemplates(platform).map((template) => template.id);
        const rollbackCapabilityId = importerDraftRollbackCapabilityId(platform.id);

        rollbackCapabilityIds.add(rollbackCapabilityId);

        expect(sourceRecord).toEqual(
          expect.objectContaining({
            id: platform.id,
            competitorId: platform.competitorId,
            platformName: platform.platformName,
            slug: platform.slug,
            status: "private-draft-live",
            route: platform.route,
            compareRoute: platform.compareRoute,
            sourceIds: platform.sourceIds,
          }),
        );
        expect(comparisonRecord).toEqual(
          expect.objectContaining({
            id: platform.id,
            competitorId: platform.competitorId,
            platformName: platform.platformName,
            status: platform.status,
            route: platform.route,
            sourceIds: platform.sourceIds,
            priority: platform.priority,
          }),
        );

        expect(sourceRecord.sourceChecklist).toHaveLength(platform.sourceChecklist.length);
        for (const checklistItem of platform.sourceChecklist) {
          const sourceChecklistItem = findById(sourceRecord.sourceChecklist, checklistItem.id);
          expect(sourceChecklistItem).toEqual(
            expect.objectContaining({
              label: checklistItem.label,
              bring: checklistItem.bring,
              bumpgradeUsesItFor: checklistItem.bumpgradeUsesItFor,
              reviewBeforePrivatePlan: checklistItem.reviewBeforePrivatePlan,
              preflightSignals: sourceChecklistPreflightSignals(checklistItem),
            }),
          );
        }

        expect(sourceRecord.exportMatchTemplates.map((template) => template.id)).toEqual(expectedTemplateIds);
        for (const template of importerExportMatchTemplates(platform)) {
          const sourceTemplate = findById(sourceRecord.exportMatchTemplates, template.id);
          expect(template.sourceChecklistItemIds.every((id) => sourceChecklistIds.has(id))).toBe(true);
          expect(sourceTemplate).toEqual(
            expect.objectContaining({
              label: template.label,
              fileKinds: template.fileKinds,
              requiredHeaderLabels: template.requiredHeaderLabels,
              helpfulHeaderLabels: template.helpfulHeaderLabels,
              signalLabels: template.signalLabels,
              sourceChecklistItemIds: template.sourceChecklistItemIds,
              draftEntities: template.draftEntities,
              usesItFor: template.usesItFor,
              reviewPrompt: template.reviewPrompt,
            }),
          );
        }

        expect(liveWriteAction).toEqual(
          expect.objectContaining({
            id: importerDraftImportCapabilityId(platform.id),
            platformId: platform.id,
            platformName: platform.platformName,
            route: platform.route,
            previewApiRoute: importerDraftPreviewApiRoute(platform.slug),
            apiRoute: importerDraftImportApiRoute(platform.slug),
            privateRecordReviewRoute: importerPrivateRecordReviewRoute(platform.slug),
            privateRecordReviewActionApiRoute: importerPrivateRecordReviewActionApiRoute(platform.slug),
            confirmationText: importerDraftImportConfirmationText(platform.platformName),
            accepts: platform.inputs.map((input) => input.kind),
            draftEntities: Array.from(new Set(platform.importableAreas.flatMap((area) => area.draftEntities))),
          }),
        );
        expect(liveWriteAction.preflightReview).toEqual(
          expect.objectContaining({
            route: importerDraftPreviewApiRoute(platform.slug),
            writesRecords: false,
            createsDraft: false,
            rawSourceEchoed: false,
            goLiveEffectsEnabled: false,
            responseFields: expect.arrayContaining(["sourceChecklistReview", "exportFileAnalysis", "platformExportMatches"]),
            exportFileAnalysis: expect.objectContaining({
              rawFileNamesEchoed: false,
              rawRowsEchoed: false,
              rawTextEchoed: false,
            }),
          }),
        );
        expect(liveWriteAction.privateRecordReview).toEqual(
          expect.objectContaining({
            id: importerPrivateRecordReviewCapabilityId(platform.id),
            route: importerPrivateRecordReviewRoute(platform.slug),
            actionApiRoute: importerPrivateRecordReviewActionApiRoute(platform.slug),
            idempotencyRequired: true,
            rawRowsEchoed: false,
            rawTextEchoed: false,
            rawExportFileNamesEchoed: false,
            rawExtractedValuesStored: false,
            subscriberSendsEnabled: false,
            publicExportsEnabled: false,
            goLiveEffectsEnabled: false,
          }),
        );
        expect(liveWriteAction.rollback).toEqual(
          expect.objectContaining({
            route: importerDraftRollbackApiRoute(platform.slug),
            confirmationText: importerDraftRollbackConfirmationText(platform.platformName),
            deletesRecords: false,
            preservesPrivateStructuredImportRecords: true,
            restartsAvailable: true,
            rawSourceEchoed: false,
            goLiveEffectsEnabled: false,
          }),
        );
        expect(rollbackCapabilityId).toMatch(/-private-draft-rollback$/);
      });
    }

    expect(rollbackCapabilityIds.size).toBe(importerPlatforms.length);
    expect(importerPayload.id).toBe(importerSourceData.id);
    expect(importerPayload.generatedFrom).toBe("src/lib/importers.ts");
  });

  test("public preview APIs redact source material while recognizing each platform export template", async ({ request }) => {
    for (const platform of importerPlatforms) {
      await test.step(platform.platformName, async () => {
        const previewRoute = importerDraftPreviewApiRoute(platform.slug);
        const response = await request.post(previewRoute, {
          headers: { accept: "application/json" },
          data: privatePreviewPayloadFor(platform.slug),
        });
        expect(response.ok(), await response.text()).toBeTruthy();
        const payload = await response.json();
        const expectedTemplate = importerExportMatchTemplates(platform)[0];

        expect(payload).toEqual(
          expect.objectContaining({
            ok: true,
            route: previewRoute,
            platform: expect.objectContaining({
              id: platform.id,
              slug: platform.slug,
              platformName: platform.platformName,
              route: platform.route,
            }),
            preview: expect.objectContaining({
              writesRecords: false,
              paidGoLiveRequired: true,
              inputSummary: expect.objectContaining({
                sourceUrlProvided: true,
                sourceFileNameCount: 1,
                parsedExportFileCount: 1,
                pageCopyProvided: true,
                followUpNotesProvided: true,
                launchGoalProvided: true,
                audienceProvided: true,
                rawSourceEchoed: false,
              }),
              exportFileAnalysis: expect.objectContaining({
                fileCount: 1,
                parsedFileCount: 1,
                detectedHeaderLabels: expect.arrayContaining(expectedTemplate.requiredHeaderLabels),
                rawExportFilesIncluded: false,
                rawFileNamesEchoed: false,
                rawRowsEchoed: false,
                rawTextEchoed: false,
              }),
              platformExportMatches: expect.arrayContaining([
                expect.objectContaining({
                  id: expectedTemplate.id,
                  status: "recognized",
                  matchedRequiredHeaders: expect.arrayContaining(expectedTemplate.requiredHeaderLabels),
                  sourceChecklistItemIds: expect.arrayContaining(expectedTemplate.sourceChecklistItemIds),
                  draftEntities: expect.arrayContaining(expectedTemplate.draftEntities),
                  rawSourceEchoed: false,
                }),
              ]),
            }),
            redaction: expect.objectContaining({
              rawExportFilesIncluded: false,
              exportFileNamesEchoed: false,
              rawExportFileNamesEchoed: false,
              rawExportRowsEchoed: false,
              rawExportTextEchoed: false,
              rawPastedMaterialIncludedInResponse: false,
              persistsRecords: false,
              publicPublishingEnabled: false,
              liveCheckoutEnabled: false,
              subscriberSendsEnabled: false,
            }),
          }),
        );
        expect(payload.preview.sourceChecklistReview).toHaveLength(platform.sourceChecklist.length);
        for (const item of platform.sourceChecklist) {
          expect(payload.preview.sourceChecklistReview).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: item.id,
                label: item.label,
                status: "ready_to_review",
                rawSourceEchoed: false,
              }),
            ]),
          );
        }

        const serializedPayload = JSON.stringify(payload);
        expect(serializedPayload).not.toContain("private.example");
        expect(serializedPayload).not.toContain(`${platform.slug}-private-export.csv`);
        expect(serializedPayload).not.toContain("private-buyer@example.com");
        expect(serializedPayload).not.toContain("Private Buyer");
        expect(serializedPayload).not.toContain("PRIVATE_SEGMENT");
        expect(serializedPayload).not.toContain("PRIVATE_PRODUCT");
        expect(serializedPayload).not.toContain("PAGE_COPY");
        expect(serializedPayload).not.toContain("FOLLOW_UP");
        expect(serializedPayload).not.toContain("LAUNCH_GOAL");
        expect(serializedPayload).not.toContain("AUDIENCE");
      });
    }
  });

  test("rollback routes expose public-safe unauthenticated errors for every importer", async ({ request }) => {
    for (const platform of importerPlatforms) {
      await test.step(platform.platformName, async () => {
        const rollbackRoute = importerDraftRollbackApiRoute(platform.slug);
        const idempotencyKey = `playwright-${platform.slug}-rollback-parity`;
        const response = await request.post(rollbackRoute, {
          headers: { accept: "application/json" },
          data: {
            return: "json",
            draftId: `${platform.slug}-private-draft`,
            expectedRevisionId: `${platform.slug}-private-revision`,
            confirmationText: importerDraftRollbackConfirmationText(platform.platformName),
            idempotencyKey,
          },
        });
        expect(response.status()).toBe(401);
        const payload = await response.json();

        expect(payload).toEqual(
          expect.objectContaining({
            ok: false,
            code: "PUBLISHER_SESSION_REQUIRED",
            route: rollbackRoute,
            platform: expect.objectContaining({
              id: platform.id,
              slug: platform.slug,
              platformName: platform.platformName,
              route: platform.route,
            }),
            redaction: expect.objectContaining({
              rawPastedMaterialIncludedInResponse: false,
              publicPublishingEnabled: false,
              liveCheckoutEnabled: false,
              subscriberSendsEnabled: false,
              deletedDraftRows: false,
              deletedStepRows: false,
              deletedAuditRows: false,
            }),
          }),
        );
        expect(JSON.stringify(payload)).not.toContain(idempotencyKey);
      });
    }
  });

  test("public importer and comparison pages render the source-guide flow for every platform", async ({ page }) => {
    for (const platform of importerPlatforms) {
      await test.step(`${platform.platformName} importer page`, async () => {
        await page.goto(platform.route);
        await expect(page.getByRole("heading", { name: platform.headline })).toBeVisible();
        await expect(page.getByRole("link", { name: `Compare ${platform.platformName}` })).toHaveAttribute(
          "href",
          platform.compareRoute,
        );
        const sourceGuide = page.locator("section").filter({ hasText: `${platform.platformName} source guide` });
        await expect(sourceGuide.getByRole("heading", { name: "Bring the pieces Bumpgrade can actually use." })).toBeVisible();

        for (const item of platform.sourceChecklist) {
          await expect(sourceGuide.getByRole("heading", { name: item.label, exact: true })).toBeVisible();
          await expect(sourceGuide.getByText(item.bumpgradeUsesItFor)).toBeVisible();
          await expect(sourceGuide.getByText(item.reviewBeforePrivatePlan)).toBeVisible();
        }
      });

      await test.step(`${platform.platformName} comparison route`, async () => {
        await page.goto(platform.compareRoute);
        await expect(page.getByText(platform.summary)).toBeVisible();
        await expect(page.getByRole("link", { name: "Open importer" }).first()).toHaveAttribute("href", platform.route);
      });
    }
  });
});
