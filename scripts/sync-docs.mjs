#!/usr/bin/env node
// Sync the rustguac docs (docs/*.md, content only) into content/docs/.
//
//   node scripts/sync-docs.mjs /path/to/rustguac            copy from a local checkout
//   node scripts/sync-docs.mjs --ref v1.12.1                 download that tag from GitHub (gh, else curl)
//   node scripts/sync-docs.mjs /path/to/rustguac --ref v1.12.1
//                                                            copy locally, but record that ref's
//                                                            commit and per-file dates from GitHub
// Options:
//   --repo owner/name   (default sol1/rustguac)
//   --no-dates          skip per-file commit date lookups
//
// Writes content/docs/*.md and content/docs/_source.json:
//   { repo, ref, commit, version, releaseDate, syncedAt, files: { "api.md": { modified } } }
// Zero dependencies. Never commits anything.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "content", "docs");

const args = process.argv.slice(2);
const opt = (name) => {
  const k = args.indexOf(name);
  if (k === -1) return null;
  const v = args[k + 1];
  args.splice(k, 2);
  return v;
};
const flag = (name) => {
  const k = args.indexOf(name);
  if (k === -1) return false;
  args.splice(k, 1);
  return true;
};
const ref = opt("--ref");
const repo = opt("--repo") || "sol1/rustguac";
const noDates = flag("--no-dates");
const localPath = args[0] ? resolve(args[0]) : null;

if (!localPath && !ref) {
  console.error("usage: node scripts/sync-docs.mjs <rustguac-checkout> [--ref vX.Y.Z]  |  --ref vX.Y.Z");
  process.exit(2);
}
if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error(`bad --repo ${repo}`);
if (ref && !/^[\w./-]+$/.test(ref)) throw new Error(`bad --ref ${ref}`);

const run = (cmd, argv, opts = {}) => execFileSync(cmd, argv, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trim();
const tryRun = (cmd, argv, opts) => { try { return run(cmd, argv, opts); } catch { return null; } };
const hasGh = tryRun("gh", ["--version"]) !== null;
const gh = (path, jq) => (hasGh ? tryRun("gh", ["api", path, ...(jq ? ["--jq", jq] : [])]) : null);

let src = localPath;
let tmp = null;
if (!src) {
  // Download the tag tarball into its own empty directory.
  tmp = mkdtempSync(join(tmpdir(), "rustguac-docs-"));
  const tgz = join(tmp, "src.tar.gz");
  const extract = join(tmp, "x");
  mkdirSync(extract);
  let ok = false;
  if (hasGh) {
    try {
      const buf = execFileSync("gh", ["api", `repos/${repo}/tarball/${ref}`], { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 512 * 1024 * 1024 });
      writeFileSync(tgz, buf);
      ok = true;
    } catch {}
  }
  if (!ok) ok = tryRun("curl", ["-fsSL", "-o", tgz, `https://codeload.github.com/${repo}/tar.gz/${ref}`]) !== null;
  if (!ok) throw new Error(`could not download ${repo}@${ref} (tried gh and curl)`);
  run("tar", ["-xzf", tgz, "-C", extract]);
  const top = readdirSync(extract).filter((d) => !d.startsWith("."));
  if (top.length !== 1) throw new Error("unexpected tarball layout");
  src = join(extract, top[0]);
}

const docsDir = join(src, "docs");
if (!existsSync(docsDir)) throw new Error(`no docs/ directory in ${src}`);
const files = readdirSync(docsDir).filter((f) => /^[a-z0-9][a-z0-9-]*\.md$/.test(f)).sort();
if (!files.length) throw new Error("no docs found");

// version from Cargo.toml
const cargo = existsSync(join(src, "Cargo.toml")) ? readFileSync(join(src, "Cargo.toml"), "utf8") : "";
const version = (/^\s*version\s*=\s*"([^"]+)"/m.exec(cargo.split(/^\[(?!package\])/m)[0]) || [])[1] || (ref || "").replace(/^v/, "") || null;
const refName = ref || (version ? `v${version}` : "main");

// commit
const isGit = existsSync(join(src, ".git")) && tryRun("git", ["-C", src, "rev-parse", "HEAD"]);
let commit = (ref && gh(`repos/${repo}/commits/${encodeURIComponent(refName)}`, ".sha")) || isGit || null;
if (!commit && tmp) {
  const m = /-([0-9a-f]{7,40})$/.exec(src);
  if (m) commit = m[1];
}
const releaseDate =
  (ref && gh(`repos/${repo}/releases/tags/${encodeURIComponent(refName)}`, ".published_at")) ||
  (commit && gh(`repos/${repo}/commits/${commit}`, ".commit.committer.date")) ||
  null;

// Sample data in the upstream docs that isn't RFC 2606 / reserved example data.
// Swapped for example equivalents of the same length where alignment matters.
const SANITIZE = [
  [/\bwww\.saucedemo\.com\b/g, "app.example.com"],
  [/\bsaucedemo\.com\b/g, "app.example.com"],
  [/\b([\w-]+)\.corp\.local\b/g, "$1.example.internal"],
  [/\bcorp\.local\b/g, "example.internal"],
  [/\bmrgelato\b/g, "customer-a"],
  [/^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d  )dave\b/gm, "$1alex"],
];
const sanitize = (s) => SANITIZE.reduce((out, [re, to]) => out.replace(re, to), s);

// write files
mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) if (f.endsWith(".md") && !files.includes(f)) rmSync(join(OUT, f));
const meta = {};
for (const f of files) {
  const body = sanitize(readFileSync(join(docsDir, f), "utf8").replace(/\r\n?/g, "\n"));
  writeFileSync(join(OUT, f), body);
  let modified = null;
  if (!noDates) {
    if (isGit) modified = tryRun("git", ["-C", src, "log", "-1", "--format=%cI", "--", `docs/${f}`]) || null;
    if (!modified && (commit || ref)) {
      modified = gh(`repos/${repo}/commits?path=${encodeURIComponent(`docs/${f}`)}&sha=${encodeURIComponent(commit || refName)}&per_page=1`, ".[0].commit.committer.date") || null;
    }
  }
  meta[f] = { modified: modified || releaseDate, sha256: createHash("sha256").update(body).digest("hex").slice(0, 16) };
  process.stdout.write(`  ${f}  ${meta[f].modified || "-"}\n`);
}

const source = { repo, ref: refName, commit, version, releaseDate, syncedAt: new Date().toISOString(), files: meta };
writeFileSync(join(OUT, "_source.json"), JSON.stringify(source, null, 2) + "\n");
if (tmp) rmSync(tmp, { recursive: true, force: true });
console.log(`synced ${files.length} docs from ${repo}@${refName}${commit ? ` (${commit.slice(0, 7)})` : ""} -> content/docs/`);
