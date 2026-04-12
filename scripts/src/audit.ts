#!/usr/bin/env tsx
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const PASS = "\x1b[32m✓\x1b[0m";
const FAIL = "\x1b[31m✗\x1b[0m";
const WARN = "\x1b[33m!\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

let errors = 0;
let warnings = 0;

function section(title: string) {
  console.log(`\n${BOLD}━━━ ${title} ━━━${RESET}`);
}

function pass(msg: string) {
  console.log(`  ${PASS} ${msg}`);
}

function fail(msg: string) {
  errors++;
  console.log(`  ${FAIL} ${msg}`);
}

function warn(msg: string) {
  warnings++;
  console.log(`  ${WARN} ${msg}`);
}

function run(cmd: string): string {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: "utf-8", timeout: 60000, stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return "";
  }
}

function fileExists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function dirSize(rel: string): string {
  return run(`du -sh ${rel} 2>/dev/null`).split("\t")[0] || "N/A";
}

console.log(`${BOLD}╔══════════════════════════════════════════╗${RESET}`);
console.log(`${BOLD}║   One&Only Planner Suite — Repo Audit    ║${RESET}`);
console.log(`${BOLD}╚══════════════════════════════════════════╝${RESET}`);
console.log(`${DIM}${new Date().toISOString()}${RESET}`);

section("1. Repository Size");
const total = dirSize(".");
const nodeModules = dirSize("node_modules");
const gitSize = dirSize(".git");
const artifacts = dirSize("artifacts");
const lib = dirSize("lib");
const cache = dirSize(".cache");
console.log(`  Total:        ${total}`);
console.log(`  node_modules: ${nodeModules}`);
console.log(`  .git:         ${gitSize}`);
console.log(`  artifacts:    ${artifacts}`);
console.log(`  lib:          ${lib}`);
console.log(`  .cache:       ${cache}`);

section("2. Source Code Stats");
const tsFiles = run(`find artifacts/planner-suite/src artifacts/api-server/src lib -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l`);
const cssFiles = run(`find artifacts/planner-suite/src -name "*.css" 2>/dev/null | wc -l`);
const totalLines = run(`find artifacts/planner-suite/src artifacts/api-server/src lib -name "*.ts" -o -name "*.tsx" -o -name "*.css" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1`).replace("total", "").trim();
console.log(`  TypeScript files: ${tsFiles}`);
console.log(`  CSS files:        ${cssFiles}`);
console.log(`  Total lines:      ${totalLines}`);

section("3. Structure Checks");
const requiredFiles = [
  "package.json",
  "pnpm-workspace.yaml",
  "pnpm-lock.yaml",
  "tsconfig.json",
  "tsconfig.base.json",
  ".gitignore",
  ".npmrc",
  "artifacts/planner-suite/package.json",
  "artifacts/planner-suite/vite.config.ts",
  "artifacts/api-server/package.json",
  "lib/db/src/schema",
];
for (const f of requiredFiles) {
  fileExists(f) ? pass(f) : fail(`Missing: ${f}`);
}

section("4. Dead Code & Orphans");
const smartdrawDir = fileExists("artifacts/smartdraw-clone");
smartdrawDir ? fail("artifacts/smartdraw-clone still exists") : pass("No smartdraw-clone directory");

const smartdrawRefs = run(`grep -ri "smartdraw" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.css" --include="*.html" -l artifacts/ lib/ 2>/dev/null`);
smartdrawRefs ? fail(`SmartDraw references found in: ${smartdrawRefs}`) : pass("No SmartDraw references in source");

const emptyDirs = run(`find artifacts lib -type d -empty 2>/dev/null`);
emptyDirs ? warn(`Empty directories:\n${emptyDirs.split("\n").map(d => `      ${d}`).join("\n")}`) : pass("No empty directories");

section("5. Build Artifacts (should be gitignored)");
const distDirs = run(`find . -not -path './node_modules/*' -not -path './.git/*' -not -path './.local/*' -name "dist" -type d 2>/dev/null`);
if (distDirs) {
  for (const d of distDirs.split("\n").filter(Boolean)) {
    const tracked = run(`git ls-files --cached ${d} 2>/dev/null`);
    tracked ? fail(`${d} is tracked by git`) : pass(`${d} exists but gitignored`);
  }
} else {
  pass("No dist directories");
}

const tsbuildinfo = run(`find . -not -path './node_modules/*' -not -path './.git/*' -name "*.tsbuildinfo" 2>/dev/null`);
if (tsbuildinfo) {
  for (const f of tsbuildinfo.split("\n").filter(Boolean)) {
    const tracked = run(`git ls-files --cached ${f} 2>/dev/null`);
    tracked ? fail(`${f} is tracked by git`) : pass(`${f} exists but gitignored`);
  }
}

section("6. TypeScript");
console.log(`  Running typecheck...`);
const typecheck = run("pnpm run typecheck 2>&1");
if (typecheck.includes("error TS")) {
  const errCount = (typecheck.match(/error TS/g) || []).length;
  fail(`TypeScript errors: ${errCount}`);
  const errLines = typecheck.split("\n").filter(l => l.includes("error TS")).slice(0, 5);
  for (const l of errLines) {
    console.log(`      ${DIM}${l.trim()}${RESET}`);
  }
} else {
  pass("Zero TypeScript errors");
}

section("7. Dependencies");
const outdatedPkgs = run("pnpm outdated --recursive --format json 2>/dev/null");
if (outdatedPkgs && outdatedPkgs !== "{}") {
  warn("Some packages may be outdated (run 'pnpm outdated -r' to check)");
} else {
  pass("Dependencies up to date");
}

const missingPeer = run("pnpm install --frozen-lockfile 2>&1 | grep -i 'missing peer' | head -5");
if (missingPeer) {
  warn(`Missing peer dependencies:\n${missingPeer.split("\n").map(l => `      ${l.trim()}`).join("\n")}`);
} else {
  pass("No missing peer dependency warnings");
}

section("8. Security");
const junkFiles = run(`find . -not -path './node_modules/*' -not -path './.git/*' -not -path './.local/*' -not -path './.cache/*' -not -path './.pythonlibs/*' \\( -name "*.env" -o -name "*.pem" -o -name "*.key" -o -name "*.secret" -o -name ".env.local" -o -name ".env.production" \\) 2>/dev/null`);
junkFiles ? fail(`Sensitive files found:\n${junkFiles.split("\n").map(f => `      ${f}`).join("\n")}`) : pass("No exposed secrets/env files");

const hardcodedKeys = run(`grep -rn "sk_live\\|sk_test\\|AKIA\\|ghp_\\|ghu_\\|github_pat_" --include="*.ts" --include="*.tsx" --include="*.json" artifacts/ lib/ 2>/dev/null | head -5`);
hardcodedKeys ? fail(`Hardcoded API keys found:\n${hardcodedKeys.split("\n").map(l => `      ${l.trim()}`).join("\n")}`) : pass("No hardcoded API keys in source");

section("9. Git Hygiene");
const trackedIgnored = run(`git ls-files -i --exclude-standard 2>/dev/null`);
trackedIgnored ? warn(`Files tracked but should be gitignored:\n${trackedIgnored.split("\n").slice(0, 5).map(f => `      ${f}`).join("\n")}`) : pass("No tracked files that should be ignored");

const largeFiles = run(`find . -not -path './node_modules/*' -not -path './.git/*' -not -path './.local/*' -not -path './.cache/*' -not -path './.pythonlibs/*' -type f -size +2M 2>/dev/null`);
if (largeFiles) {
  warn(`Large files (>2MB):\n${largeFiles.split("\n").map(f => `      ${f}`).join("\n")}`);
} else {
  pass("No oversized files in source");
}

section("10. Workspace Packages");
const workspaces = run("pnpm list -r --depth -1 --json 2>/dev/null");
if (workspaces) {
  try {
    const pkgs = JSON.parse(workspaces);
    for (const pkg of pkgs) {
      const loc = pkg.path?.replace(ROOT + "/", "") || "root";
      pass(`${pkg.name}@${pkg.version} ${DIM}(${loc})${RESET}`);
    }
  } catch {
    warn("Could not parse workspace list");
  }
}

console.log(`\n${BOLD}━━━ Summary ━━━${RESET}`);
if (errors === 0 && warnings === 0) {
  console.log(`\n  ${PASS} ${BOLD}All checks passed!${RESET}\n`);
} else {
  console.log(`\n  Errors:   ${errors > 0 ? `\x1b[31m${errors}\x1b[0m` : "0"}`);
  console.log(`  Warnings: ${warnings > 0 ? `\x1b[33m${warnings}\x1b[0m` : "0"}`);
  console.log();
}

process.exit(errors > 0 ? 1 : 0);
