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
assert(fixture.liveDashboard?.route === "/mobile-admin/dashboard/source-data", "Fixture does not include the live mobile dashboard route.");
assert(fixture.liveDashboard?.renderedInScaffoldsIssue === 155, "Fixture does not record issue #155 as the mobile dashboard scaffold render slice.");

const appSource = readFileSync(appSourcePath, "utf8");
assert(appSource.includes("mobileAdminContractFixture"), "Expo app does not read the generated fixture.");
assert(appSource.includes("Bumpgrade mobile admin"), "Expo app title is missing.");
assert(appSource.includes("Live dashboard"), "Expo app does not render the live dashboard panel.");

const xcodeVersion = spawnSync("xcodebuild", ["-version"], { encoding: "utf8" });
assert(xcodeVersion.status === 0, "xcodebuild is not available for iOS validation.");

console.log("iOS mobile admin scaffold validated.");
console.log(xcodeVersion.stdout.trim().split("\n").join(" "));
