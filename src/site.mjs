import { readFileSync } from "node:fs";

// Single source of truth for facts that appear on more than one page.
// `version` and `released` come from content/docs/_source.json, which
// `npm run sync-docs -- --ref vX.Y.Z` writes: syncing a release updates both.
//
// Base path: the site works at a domain root and under a project subpath. Production is
// https://sol1.github.io/rustguac-website/, where the Pages workflow builds with
//   SITE_URL=https://sol1.github.io/rustguac-website node scripts/build.mjs
// `site.url` is the absolute origin + path (no trailing slash) for canonical, og,
// sitemap and JSON-LD URLs. `site.base` is just the path ("" at a domain root).
// Every internal link and asset goes through href().

const raw = (process.env.SITE_URL || "http://127.0.0.1:8080").trim();
const parsed = new URL(raw.endsWith("/") ? raw : raw + "/");
const base = parsed.pathname.replace(/\/+$/, "");

const repo = "https://github.com/sol1/rustguac";
const synced = JSON.parse(readFileSync(new URL("../content/docs/_source.json", import.meta.url), "utf8"));
const version = synced.version;

export const site = {
  // STAGING=1: a preview deploy. Every page is noindex and robots.txt disallows everything.
  staging: process.env.STAGING === "1",
  name: "rustguac",
  url: parsed.origin + base,
  base,
  host: parsed.host,
  lang: "en",
  locale: "en_US",
  tagline: "A lightweight Rust replacement for the Apache Guacamole Java webapp",
  motto: "No Java. No Tomcat. Single binary + guacd.",
  description:
    "rustguac is a lightweight Rust replacement for the Apache Guacamole Java webapp: browser-based SSH, RDP, VNC, SPICE, Proxmox VE consoles, web browsing and VDI desktop containers through guacd. No Java. No Tomcat. Single binary + guacd.",
  version,
  released: synced.releaseDate.slice(0, 10),
  license: "Apache-2.0",
  licenseUrl: "https://www.apache.org/licenses/LICENSE-2.0",
  image: "sol1/rustguac",
  maintainer: { name: "Sol1", url: "https://www.sol1.com.au" },
  repo,
  releases: `${repo}/releases`,
  latestRelease: `${repo}/releases/latest`,
  release: `${repo}/releases/tag/v${version}`,
  issues: `${repo}/issues`,
  newIssue: `${repo}/issues/new`,
  // has_discussions is false on sol1/rustguac (checked with `gh api repos/sol1/rustguac`).
  // Set a URL here if Discussions are ever enabled and the footer and CTA pick it up.
  discussions: "",
  pulls: `${repo}/pulls`,
  security: `${repo}/security/policy`,
  advisories: `${repo}/security/advisories/new`,
  licenseFile: `${repo}/blob/main/LICENSE`,
  dockerHub: "https://hub.docker.com/r/sol1/rustguac",
  guacd: "https://github.com/apache/guacamole-server",
  // Where this website's own source lives. Change it if the repo moves.
  websiteRepo: "https://github.com/sol1/rustguac-website",
  nav: [
    { href: "/features/", label: "Features" },
    { href: "/docs/", label: "Docs" },
    { href: "/#screens", label: "Screenshots" },
    { href: "/guacamole-alternative/", label: "Compare" },
    { href: "/faq/", label: "FAQ" },
  ],
};

// Prefix an internal path with the base path. Absolute URLs, anchors and
// protocol-relative/mailto links pass through untouched.
export function href(path = "/") {
  if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(path)) return path;
  if (!path.startsWith("/")) path = "/" + path;
  return base + path;
}

// Absolute URL for canonical, og, sitemap and JSON-LD.
export const abs = (path = "/") => site.url + (path.startsWith("/") ? path : "/" + path);

// Prepare an HTML fragment from content.mjs: prefix root-relative href/src
// attributes with the base path (content is written with "/docs/..." paths) and
// give outbound links rel="noopener".
export function hrefAll(html) {
  let out = String(html);
  if (base) {
    out = out.replace(/(\s(?:href|src)=")(\/(?!\/)[^"]*)"/g, (m, a, p) =>
      p.startsWith(base + "/") || p === base ? m : `${a}${base}${p}"`,
    );
  }
  return out.replace(/<a\s([^>]*href="https?:[^"]*"[^>]*)>/g, (m, inner) => (/\srel=|^rel=/.test(inner) ? m : `<a ${inner} rel="noopener">`));
}
