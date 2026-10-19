#!/usr/bin/env node
// Builds the static site into dist/. Zero dependencies: Node 20+ only.
//   node scripts/build.mjs
//   SITE_URL=https://sol1.github.io/rustguac-website node scripts/build.mjs   # production
//   DIST=/tmp/out node scripts/build.mjs                                        # build somewhere other than dist/
// CNAME_DOMAIN, when set, also writes dist/CNAME. Production has no custom domain.
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { site, href, abs } from "../src/site.mjs";
import { corePages, searchPage } from "../src/pages/index.mjs";
import { render, shotSet, hasShot, ogKey, SEARCH_INDEX_TOKEN } from "../src/layout.mjs";
import { faqs, highlights, protocols } from "../src/data.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");
const dist = resolve(root, process.env.DIST || "dist"); // DIST=/some/dir overrides the output directory
const write = (rel, data) => {
  const file = join(dist, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, data);
};
const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 10);
const optional = async (rel) => {
  const file = join(root, rel);
  return existsSync(file) ? import(pathToFileURL(file).href) : null;
};

/* 1. Clean and copy static files */
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
if (existsSync(join(src, "static"))) cpSync(join(src, "static"), dist, { recursive: true });

/* 2. CSS: every src/styles/*.css in filename order, minified (comments and whitespace only) */
const css = readdirSync(join(src, "styles"))
  .filter((f) => f.endsWith(".css"))
  .sort()
  .map((f) => readFileSync(join(src, "styles", f), "utf8"))
  .join("\n")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{};,])\s*/g, "$1")
  .replace(/;}/g, "}")
  .trim();
const cssPath = `/assets/css/site.${hash(css)}.css`;
write(cssPath, css);

/* 3. JS: each src/js/*.js fingerprinted separately */
const js = {};
for (const f of readdirSync(join(src, "js")).filter((f) => f.endsWith(".js")).sort()) {
  const code = readFileSync(join(src, "js", f), "utf8");
  const name = f.replace(/\.js$/, "");
  const p = `/assets/js/${name}.${hash(code)}.js`;
  write(p, code);
  js[name] = href(p);
}
const assets = { css: href(cssPath), js };

/* 4. Pages */
const docsMod = await optional("src/docs/index.mjs");
const docPages = (docsMod && (docsMod.docPages || docsMod.default)) || [];
const pages = [...corePages, ...docPages, ...(searchPage ? [searchPage] : [])];
const seen = new Map();
for (const p of pages) {
  if (seen.has(p.path)) throw new Error(`duplicate page path ${p.path} (${seen.get(p.path)} and ${p.slug})`);
  seen.set(p.path, p.slug);
}
// page.file is an output file only when it is an .html path (404.html); docs pages use
// `file` for their markdown source name.
const outFile = (p) => (p.file && /\.html$/.test(p.file) ? p.file : join(p.path, "index.html"));

/* 5. Render (with a placeholder for the search index URL) */
const rendered = pages.map((page) => ({ page, html: render(page, assets) }));

/* 6. Search index */
const searchMod = await optional("src/search/build-index.mjs");
let searchUrl = "";
let searchStats = null;
if (searchMod && typeof searchMod.buildSearchIndex === "function") {
  const { json, stats } = await searchMod.buildSearchIndex(rendered.map((r) => ({ page: r.page, html: r.html })));
  const body = typeof json === "string" ? json : JSON.stringify(json);
  const p = `/assets/search/index.${hash(body)}.json`;
  write(p, body);
  searchUrl = href(p);
  searchStats = stats || null;
}
for (const r of rendered) {
  r.html = searchUrl
    ? r.html.split(SEARCH_INDEX_TOKEN).join(searchUrl)
    : r.html.replace(` data-search-index="${SEARCH_INDEX_TOKEN}"`, "");
  write(outFile(r.page), r.html);
}

/* 7a. sitemap.xml with lastmod and image entries */
const indexed = pages.filter((p) => p.sitemap !== false && !p.noindex);
const ogFor = (p) => {
  const k = ogKey(p);
  for (const c of [k, p.layout === "docs" ? "docs" : null, "home"]) if (c && existsSync(join(dist, "assets", "og", `${c}.jpg`))) return abs(`/assets/og/${c}.jpg`);
  return null;
};
const xmlEsc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${indexed
  .map((p) => {
    const imgs = [ogFor(p), ...(p.images || []).filter(hasShot).map((n) => shotSet("dark", n).fullAbs)].filter(Boolean);
    return `  <url>
    <loc>${xmlEsc(abs(p.path))}</loc>
    <lastmod>${p.modified || site.released}</lastmod>
    <changefreq>${p.changefreq || "monthly"}</changefreq>
    <priority>${Number(p.priority || 0.5).toFixed(1)}</priority>
${imgs.map((i) => `    <image:image><image:loc>${xmlEsc(i)}</image:loc></image:image>`).join("\n")}
  </url>`;
  })
  .join("\n")}
</urlset>
`;
write("sitemap.xml", sitemap);

/* 7b. robots.txt: everything public, AI crawlers welcome by name */
const aiBots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot", "Applebot-Extended"];
const disallow = `Disallow: ${href("/404.html")}`;
write(
  "robots.txt",
  site.staging
    ? `# Staging preview: not for indexing.\nUser-agent: *\nDisallow: /\n`
    : `User-agent: *
Allow: ${href("/")}
${disallow}

${aiBots.map((b) => `User-agent: ${b}`).join("\n")}
Allow: ${href("/")}
${disallow}

Sitemap: ${abs("/sitemap.xml")}
`,
);

/* 7c. llms.txt and llms-full.txt */
const strip = (s) =>
  String(s)
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const docs = docPages.filter((p) => p.path !== "/docs/" && !p.noindex);
const docLine = (p) => {
  const name = p.h1 || p.title;
  // Some descriptions lead with the page title ("Security: TLS, ..."); don't repeat it.
  const desc = p.description.startsWith(`${name}: `) ? p.description.slice(name.length + 2) : p.description;
  return `- [${name}](${abs(p.path)}): ${desc}`;
};
const docsBySection = docs.reduce((m, p) => {
  const s = p.section || "Docs";
  (m[s] = m[s] || []).push(p);
  return m;
}, {});
write(
  "llms.txt",
  `# ${site.name}

> ${site.description}

- Latest version: ${site.version} (released ${site.released}), ${site.license} licensed
- Source, releases and issues: ${site.repo}
- Docker image: ${site.image} (${site.dockerHub})
- Packages: Debian 13 .deb for amd64 and arm64 from ${site.releases}
- Session types: ${protocols.map((p) => p.name).join(", ")}
- Requires guacd (bundled) and HashiCorp Vault or OpenBao for the Connections UI; OIDC is optional
- This is an independent community website, not affiliated with the Apache Software Foundation

## Site

- [Home](${abs("/")}): overview, architecture, session types, screenshots and quickstart
- [Features](${abs("/features/")}): the full feature catalog with links into the docs
- [Apache Guacamole alternative](${abs("/guacamole-alternative/")}): how rustguac compares, and how to migrate
- [FAQ](${abs("/faq/")}): installation, Vault, OIDC, protocols, recording and migration
- [Documentation](${abs("/docs/")}): every guide, synced from the rustguac repository
- [Full documentation as one text file](${abs("/llms-full.txt")})

## Documentation

${Object.entries(docsBySection)
  .map(([s, list]) => `### ${s}\n\n${list.map(docLine).join("\n")}`)
  .join("\n\n")}

## Highlights

${highlights.map((h) => `- ${h.title}: ${strip(h.text)}`).join("\n")}

## FAQ

${faqs.map((f) => `### ${strip(f.q)}\n\n${strip(f.a)}`).join("\n\n")}
`,
);
const docText = (p) => {
  if (p.doc && p.doc.markdown) return p.doc.markdown.trim();
  const r = rendered.find((x) => x.page === p);
  const main = r ? (r.html.match(/<main[^>]*>([\s\S]*?)<\/main>/) || [])[1] || "" : "";
  return strip(main.replace(/<(script|style)[\s\S]*?<\/\1>/g, "")).replace(/\n{3,}/g, "\n\n").trim();
};
write(
  "llms-full.txt",
  `# ${site.name} documentation (full text)

> ${site.description}

Version ${site.version}. Source: ${site.repo}. Each section below is one page of the documentation at ${abs("/docs/")}.

${docs.map((p) => `---\n\n<!-- ${abs(p.path)} -->\n\n${docText(p)}\n`).join("\n")}`,
);

/* 7d. Web app manifest */
write(
  "site.webmanifest",
  JSON.stringify(
    {
      name: site.name,
      short_name: site.name,
      description: site.tagline,
      start_url: href("/"),
      scope: href("/"),
      display: "browser",
      background_color: "#0a0c16",
      theme_color: "#0a0c16",
      icons: [
        { src: href("/assets/icons/icon-192.png"), sizes: "192x192", type: "image/png" },
        { src: href("/assets/icons/icon-512.png"), sizes: "512x512", type: "image/png" },
        { src: href("/assets/icons/icon-maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    null,
    2,
  ) + "\n",
);

/* 7e. security.txt (RFC 9116), humans.txt, .nojekyll, CNAME */
const expires = new Date(Date.parse(site.released) + 365 * 864e5).toISOString().replace(/\.\d+Z$/, "Z");
write(
  ".well-known/security.txt",
  `Contact: ${site.advisories}
Expires: ${expires}
Policy: ${site.security}
Preferred-Languages: en
Canonical: ${abs("/.well-known/security.txt")}
`,
);
write(
  "humans.txt",
  `/* PROJECT */
Name: ${site.name}
Developed by: ${site.maintainer.name} and contributors
Source: ${site.repo}

/* SITE */
Community website, built with plain HTML, CSS and vanilla JavaScript
Fonts: Inter, JetBrains Mono (SIL OFL 1.1)
Website source: ${site.websiteRepo}
`,
);
write(".nojekyll", "");
const cname = (process.env.CNAME_DOMAIN || "").trim();
if (cname) write("CNAME", cname + "\n");

console.log(
  `built ${pages.length} pages (${corePages.length} core, ${docPages.length} docs${searchPage ? ", search" : ""}) → ${dist}` +
    `\n  base: "${site.base || "/"}"  url: ${site.url}` +
    `\n  css: ${assets.css}\n  js: ${Object.values(js).join(", ")}` +
    (searchUrl ? `\n  search: ${searchUrl}${searchStats ? " " + JSON.stringify(searchStats) : ""}` : "\n  search: (no indexer yet)") +
    (cname ? `\n  CNAME: ${cname}` : ""),
);
