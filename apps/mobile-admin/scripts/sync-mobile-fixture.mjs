#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const appRoot = path.resolve(import.meta.dirname, "..");
const repoRoot = path.resolve(appRoot, "../..");
const sourcePath = path.join(repoRoot, "src/lib/mobile-admin.ts");
const fixturePath = path.join(appRoot, "fixtures/mobile-admin-contract.json");
const androidAssetPath = path.join(appRoot, "android/src/main/assets/mobile-admin-contract.json");

const source = readFileSync(sourcePath, "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const moduleValue = { exports: {} };
const execute = new Function("exports", "module", transpiled);
execute(moduleValue.exports, moduleValue);

const contract = moduleValue.exports.mobileAdminContract;
if (!contract || contract.id !== "bumpgrade-mobile-admin-contract") {
  throw new Error("Could not load mobileAdminContract from src/lib/mobile-admin.ts.");
}

mkdirSync(path.dirname(fixturePath), { recursive: true });
mkdirSync(path.dirname(androidAssetPath), { recursive: true });
const serialized = `${JSON.stringify(contract, null, 2)}\n`;
writeFileSync(fixturePath, serialized, "utf8");
writeFileSync(androidAssetPath, serialized, "utf8");
console.log(`Synced ${path.relative(repoRoot, fixturePath)} from src/lib/mobile-admin.ts.`);
console.log(`Synced ${path.relative(repoRoot, androidAssetPath)} from src/lib/mobile-admin.ts.`);
