#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import ts from "typescript";

const appRoot = path.resolve(import.meta.dirname, "..");
const repoRoot = path.resolve(appRoot, "../..");
const androidHome = process.env.ANDROID_HOME || path.join(process.env.HOME ?? "", "Library/Android/sdk");
const buildTools = process.env.ANDROID_BUILD_TOOLS || path.join(androidHome, "build-tools/36.0.0");
const defaultAvd = process.env.ANDROID_AVD_NAME || "MusicWebs_API_36";

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

function commandSucceeds(command, args) {
  return spawnSync(command, args, { encoding: "utf8" }).status === 0;
}

const fixturePath = path.join(appRoot, "fixtures/mobile-admin-contract.json");
const androidAssetPath = path.join(appRoot, "android/src/main/assets/mobile-admin-contract.json");
const manifestPath = path.join(appRoot, "android/AndroidManifest.xml");
const activityPath = path.join(appRoot, "android/src/main/java/com/bumpgrade/mobileadmin/MainActivity.java");
const smokeScriptPath = path.join(appRoot, "scripts/run-android-smoke.sh");

assert(existsSync(fixturePath), "Missing mobile admin fixture.");
assert(existsSync(androidAssetPath), "Missing Android bundled fixture asset.");
assert(existsSync(manifestPath), "Missing Android manifest.");
assert(existsSync(activityPath), "Missing Android MainActivity.");
assert(existsSync(smokeScriptPath), "Missing Android smoke script.");

const fixtureText = readFileSync(fixturePath, "utf8");
const fixture = JSON.parse(fixtureText);
const currentContract = loadCurrentContract();

assert(JSON.stringify(fixture) === JSON.stringify(currentContract), "Fixture is stale. Run npm --prefix apps/mobile-admin run fixture:sync.");
assert(readFileSync(androidAssetPath, "utf8") === fixtureText, "Android asset fixture is stale. Run npm --prefix apps/mobile-admin run fixture:sync.");
assert(fixture.childIssues.some((slice) => slice.platform === "android" && slice.issue === 68), "Fixture does not include Android issue #68.");
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
  fixture.pushNotificationBoundary?.requiredProviders?.some((provider) => provider.platform === "android" && provider.provider === "FCM"),
  "Fixture does not include the Android FCM provider requirement.",
);
assert(fixture.distributionReadiness?.id === "mobile-distribution-readiness-boundary", "Fixture does not include the distribution boundary.");
assert(fixture.distributionReadiness?.installableDistributionClaim === false, "Fixture must not claim installable distribution.");
assert(
  fixture.distributionReadiness?.platformEvidence?.some((evidence) => evidence.platform === "android"),
  "Fixture does not include Android distribution evidence boundaries.",
);
assert(fixture.confirmedActions?.some((action) => action.id === "mobile-confirm-review-agent-work"), "Fixture does not include the mobile confirmed-action contract.");
assert(
  fixture.childIssues.find((slice) => slice.platform === "android")?.sourceDataRoute === "/mobile-admin/android/source-data",
  "Android slice source-data route is missing.",
);

const activitySource = readFileSync(activityPath, "utf8");
const manifestSource = readFileSync(manifestPath, "utf8");
assert(activitySource.includes("mobile-admin-contract.json"), "Android activity does not read the generated fixture asset.");
assert(activitySource.includes("Bumpgrade mobile admin"), "Android activity title is missing.");
assert(activitySource.includes("Live dashboard"), "Android activity does not render the live dashboard panel.");
assert(activitySource.includes("Director brief"), "Android activity does not render the Director brief panel.");
assert(activitySource.includes("Private auth"), "Android activity does not render the private auth panel.");
assert(activitySource.includes("Private rows API"), "Android activity does not render the mobile private rows API panel.");
assert(activitySource.includes("Private row actions API"), "Android activity does not render the mobile private row actions API panel.");
assert(activitySource.includes("Commerce review API"), "Android activity does not render the mobile commerce review API panel.");
assert(activitySource.includes("Action intent API"), "Android activity does not render the mobile action intent API panel.");
assert(activitySource.includes("Push boundary"), "Android activity does not render the mobile push boundary panel.");
assert(activitySource.includes("Distribution boundary"), "Android activity does not render the mobile distribution boundary panel.");
assert(activitySource.includes("Confirmed mobile actions"), "Android activity does not render the confirmed actions panel.");
assert(activitySource.includes("HttpURLConnection"), "Android activity does not fetch the live dashboard route.");
assert(activitySource.includes("Live network"), "Android activity does not distinguish live network hydration from fixture fallback.");
assert(manifestSource.includes("android.permission.INTERNET"), "Android manifest does not allow the live dashboard network read.");

for (const tool of ["aapt2", "d8", "zipalign", "apksigner"]) {
  assert(existsSync(path.join(buildTools, tool)), `Missing Android build tool: ${tool}.`);
}
assert(existsSync(path.join(androidHome, "platforms/android-36/android.jar")), "Missing Android API 36 platform jar.");
assert(commandSucceeds(path.join(androidHome, "platform-tools/adb"), ["version"]), "adb is not available.");
const emulatorList = spawnSync(path.join(androidHome, "emulator/emulator"), ["-list-avds"], { encoding: "utf8" });
assert(emulatorList.status === 0, "Android emulator is not available.");
assert(emulatorList.stdout.split(/\s+/).includes(defaultAvd), `Default AVD ${defaultAvd} is not installed.`);

console.log("Android mobile admin scaffold validated.");
console.log(`Default AVD: ${defaultAvd}`);
