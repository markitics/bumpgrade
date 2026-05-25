#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import ts from "typescript";

const appRoot = path.resolve(import.meta.dirname, "..");
const repoRoot = path.resolve(appRoot, "../..");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function loadCurrentContract() {
  const source = readFileSync(path.join(repoRoot, "src/lib/mobile-admin.ts"), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const moduleValue = { exports: {} };
  new Function("exports", "module", transpiled)(moduleValue.exports, moduleValue);
  return moduleValue.exports.mobileAdminContract;
}

const fixturePath = path.join(appRoot, "fixtures/mobile-admin-contract.json");
const appSourcePath = path.join(appRoot, "src/App.tsx");
const projectPath = path.join(appRoot, "ios/BumpgradeMobileAdmin.xcodeproj/project.pbxproj");
const smokeScriptPath = path.join(appRoot, "scripts/run-ios-smoke.sh");

assert(existsSync(fixturePath), "Missing mobile admin fixture.");
assert(existsSync(appSourcePath), "Missing Expo app entrypoint.");
assert(existsSync(projectPath), "Missing iOS smoke Xcode project.");
assert(existsSync(smokeScriptPath), "Missing iOS smoke script.");

const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
const currentContract = loadCurrentContract();

assert(JSON.stringify(fixture) === JSON.stringify(currentContract), "Fixture is stale. Run npm --prefix apps/mobile-admin run fixture:sync.");
assert(fixture.id === "bumpgrade-mobile-admin-contract", "Fixture has unexpected contract id.");
assert(fixture.childIssues.some((slice) => slice.platform === "ios" && slice.issue === 67), "Fixture does not include iOS issue #67.");
assert(fixture.childIssues.some((slice) => slice.platform === "android" && slice.issue === 68), "Fixture does not include Android issue #68.");
assert(fixture.childIssues.find((slice) => slice.platform === "ios")?.sourceDataRoute === "/mobile-admin/ios/source-data", "iOS slice source-data route is missing.");
assert(fixture.publicBaseUrl === "https://bumpgrade.com", "Fixture does not include the public mobile base URL.");
assert(fixture.liveDashboard?.route === "/mobile-admin/dashboard/source-data", "Fixture does not include the live mobile dashboard route.");
assert(fixture.liveDashboard?.renderedInScaffoldsIssue === 155, "Fixture does not record issue #155 as the mobile dashboard scaffold render slice.");
assert(fixture.liveDashboard?.liveHydrationIssue === 157, "Fixture does not record issue #157 as the mobile dashboard live hydration slice.");
assert(fixture.privateAuth?.issue === 414, "Fixture does not include the issue #414 mobile private-auth contract.");
assert(fixture.privateAuth?.sessionRoute === "/api/auth/[...all]", "Fixture does not reuse the Better Auth session route.");
assert(fixture.privateRowsApi?.route === "/api/mobile-admin/private-rows", "Fixture does not include the mobile private rows API route.");
assert(fixture.privateRowsApi?.status === "owner-mobile-private-rows-ready", "Fixture does not include the mobile private rows API status.");
assert(fixture.privateRowActionsApi?.route === "/api/mobile-admin/private-rows/actions", "Fixture does not include the mobile private row actions API route.");
assert(fixture.privateRowActionsApi?.status === "owner-mobile-private-row-actions-ready", "Fixture does not include the mobile private row actions API status.");
assert(fixture.commerceReviewApi?.route === "/api/mobile-admin/commerce-reviews", "Fixture does not include the mobile commerce review API route.");
assert(fixture.commerceReviewApi?.status === "owner-mobile-commerce-review-ready", "Fixture does not include the mobile commerce review API status.");
assert(fixture.actionIntentApi?.route === "/api/mobile-admin/actions", "Fixture does not include the mobile action intent API route.");
assert(fixture.actionIntentApi?.status === "owner-mobile-action-intent-ready", "Fixture does not include the mobile action intent API status.");
assert(fixture.pushNotificationBoundary?.id === "mobile-push-notification-boundary", "Fixture does not include the mobile push boundary.");
assert(fixture.pushNotificationBoundary?.sendCapability === "disabled-provider-contract-required", "Fixture does not keep push sends disabled.");
assert(
  fixture.pushNotificationBoundary?.requiredProviders?.some((provider) => provider.platform === "ios" && provider.provider === "APNs"),
  "Fixture does not include the iOS APNs provider requirement.",
);
assert(fixture.distributionReadiness?.id === "mobile-distribution-readiness-boundary", "Fixture does not include the distribution boundary.");
assert(fixture.distributionReadiness?.installableDistributionClaim === false, "Fixture must not claim installable distribution.");
assert(
  fixture.distributionReadiness?.platformEvidence?.some((evidence) => evidence.platform === "ios"),
  "Fixture does not include iOS distribution evidence boundaries.",
);
assert(fixture.confirmedActions?.some((action) => action.id === "mobile-confirm-review-agent-work"), "Fixture does not include the mobile confirmed-action contract.");

const appSource = readFileSync(appSourcePath, "utf8");
assert(appSource.includes("mobileAdminContractFixture"), "Expo app does not read the generated fixture.");
assert(appSource.includes("Bumpgrade mobile admin"), "Expo app title is missing.");
assert(appSource.includes("Live dashboard"), "Expo app does not render the live dashboard panel.");
assert(appSource.includes("Director brief"), "Expo app does not render the Director brief panel.");
assert(appSource.includes("Private auth"), "Expo app does not render the private auth panel.");
assert(appSource.includes("Private rows API"), "Expo app does not render the mobile private rows API panel.");
assert(appSource.includes("Private row actions API"), "Expo app does not render the mobile private row actions API panel.");
assert(appSource.includes("Commerce review API"), "Expo app does not render the mobile commerce review API panel.");
assert(appSource.includes("Action intent API"), "Expo app does not render the mobile action intent API panel.");
assert(appSource.includes("Push boundary"), "Expo app does not render the mobile push boundary panel.");
assert(appSource.includes("Distribution boundary"), "Expo app does not render the mobile distribution boundary panel.");
assert(appSource.includes("Confirmed mobile actions"), "Expo app does not render the confirmed actions panel.");
assert(appSource.includes("fetch(url)"), "Expo app does not fetch the live dashboard route.");
assert(appSource.includes("Live network"), "Expo app does not distinguish live network hydration from fixture fallback.");

const xcodeVersion = spawnSync("xcodebuild", ["-version"], { encoding: "utf8" });
assert(xcodeVersion.status === 0, "xcodebuild is not available for iOS validation.");

console.log("iOS mobile admin scaffold validated.");
console.log(xcodeVersion.stdout.trim().split("\n").join(" "));
