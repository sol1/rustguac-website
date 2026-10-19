// Docs pages: /docs/ (home) and one page per synced upstream doc.
// Markdown lives in content/docs/*.md (scripts/sync-docs.mjs) and is rendered by
// src/lib/markdown.mjs with src/lib/highlight.mjs at build time.
//
// export const docPages  -> page objects for layout.render (layout: "docs")
// export const docsReport -> { brokenAnchors, links, staleFixes } (also printed as build warnings)
import { existsSync, readFileSync } from "node:fs";
import { posix } from "node:path";
import { site, href, abs } from "../site.mjs";
import { icon } from "../icons.mjs";
import { render as renderMarkdown, esc } from "../lib/markdown.mjs";
import { highlight, normalizeLang, detectLang, LABELS } from "../lib/highlight.mjs";
import { sections, flatDocs, docBySlug, quickPath, popular } from "./nav.mjs";
import overlayFixes from "../../content/docs-overlay/fixes.mjs";

const CONTENT = new URL("../../content/docs/", import.meta.url);
// Fixes and new pages proposed upstream but not merged yet (see content/docs-overlay/fixes.mjs).
const OVERLAY = new URL("../../content/docs-overlay/", import.meta.url);
const source = existsSync(new URL("_source.json", CONTENT))
  ? JSON.parse(readFileSync(new URL("_source.json", CONTENT), "utf8"))
  : { repo: "sol1/rustguac", ref: `v${site.version}`, commit: null, version: site.version, releaseDate: site.released, files: {} };

const REPO = `https://github.com/${source.repo}`;
const REF = source.ref || `v${source.version}`;
const VERSION = source.version || site.version;
const SHORT = source.commit ? source.commit.slice(0, 7) : "";
const issueLink = (n) => `${REPO}/issues/${n}`;
const editUrl = (file, pending) => (pending ? issueLink(pending) : `${REPO}/edit/main/docs/${file}`);
const viewUrl = (file, pending) => (pending ? issueLink(pending) : `${REPO}/blob/${REF}/docs/${file}`);
const issueUrl = (title, path) =>
  `${REPO}/issues/new?title=${encodeURIComponent(`Docs: ${title}`)}&body=${encodeURIComponent(`Page: ${abs(path)}\nSource: docs/${path.split("/").filter(Boolean).pop()}.md (${REF})\n\nWhat was unclear or wrong?\n`)}`;
const docPath = (slug) => `/docs/${slug}/`;
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/* ---------------------------------------------------------------- helpers */

// The screenshot on each doc's social card (media/screenshots names).
const OG_SHOT = {
  overview: "connections",
  installation: "session-ssh",
  configuration: "admin",
  "deployment-guide": "sessions",
  "reverse-proxies": "session-desktop",
  "roles-and-access-control": "tokens",
  "web-sessions": "session-desktop",
  "spice-and-proxmox": "connections",
  vdi: "connection-editor-vdi",
  "rdp-video-performance": "connection-editor-rdp",
  "rdp-h264": "connection-editor-rdp",
  "credential-variables": "credentials",
  reports: "reports",
  themes: "themes",
  integrations: "ssh-tunnel",
  netbox: "connections",
  security: "recordings",
  api: "sessions",
  migration: "connections",
};

const copyBtn = `<button type="button" class="copy-btn" data-copy aria-label="Copy code to clipboard">${icon("copy", 15, "i-copy")}${icon("check", 15, "i-done")}<span class="copy-label">Copy</span></button>`;

function codeBlock(code, lang) {
  let l = normalizeLang(lang);
  if (!lang) l = detectLang(code);
  const label = LABELS[l] || lang || "text";
  return `<div class="code-block" data-lang="${esc(l)}"><div class="code-head"><span class="code-lang">${esc(label)}</span>${copyBtn}</div><pre tabindex="0"><code>${highlight(code, l)}</code></pre></div>`;
}

const CALLOUT_ICON = { note: "info", tip: "zap", important: "star", warning: "alert", caution: "alert" };
function callout(type, title, inner) {
  return `<div class="callout callout-${type}" role="note"><span class="callout-icon" aria-hidden="true">${icon(CALLOUT_ICON[type] || "info", 18)}</span><div class="callout-body">${title ? `<p class="callout-title">${esc(title)}</p>` : ""}\n${inner}\n</div></div>`;
}

/** Trim to <= max chars on a word boundary, preferring a sentence end. */
export function trimDescription(text, min = 70, max = 160) {
  let t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sentence = cut.match(/^.*[.!?](?=\s)/);
  if (sentence && sentence[0].length >= min) return sentence[0];
  const word = cut.slice(0, max - 1).replace(/\s+\S*$/, "").replace(/[\s,;:—–-]+$/, "");
  return word + "…";
}

/* ---------------------------------------------------------------- link rewriting */

const links = []; // { from, slug, hash, raw }
function makeLinkRewriter(file) {
  const from = file.replace(/\.md$/, "");
  return (url, kind) => {
    if (/^(mailto:|tel:)/i.test(url)) return { href: url, external: false };
    if (url.startsWith("#")) {
      links.push({ from, slug: from, hash: decodeURIComponent(url.slice(1)), raw: url });
      return { href: url, external: false };
    }
    // GitHub links to the docs themselves come home to the site.
    const gh = /^https:\/\/github\.com\/sol1\/rustguac\/(?:blob|tree)\/[^/]+\/docs\/([a-z0-9-]+)\.md(#.*)?$/i.exec(url);
    if (gh && docBySlug[gh[1]]) {
      const hash = gh[2] ? gh[2].slice(1) : "";
      links.push({ from, slug: gh[1], hash, raw: url });
      return { href: href(docPath(gh[1])) + (hash ? `#${hash}` : ""), external: false };
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("//")) return { href: url, external: true };
    // Relative to docs/ in the repo.
    const [pathPart, ...h] = url.split("#");
    const hash = h.join("#");
    const target = posix.normalize(posix.join("docs", pathPart || file));
    const m = /^docs\/([a-z0-9-]+)\.md$/.exec(target);
    if (m && docBySlug[m[1]]) {
      links.push({ from, slug: m[1], hash: decodeURIComponent(hash), raw: url });
      return { href: href(docPath(m[1])) + (hash ? `#${hash}` : ""), external: false };
    }
    if (target.startsWith("..")) return { href: `${REPO}/blob/${REF}/`, external: true };
    if (kind === "image") return { href: `https://raw.githubusercontent.com/${source.repo}/${REF}/${target}`, external: true };
    const isDir = pathPart.endsWith("/") || !/\.[a-z0-9]+$/i.test(target);
    return { href: `${REPO}/${isDir ? "tree" : "blob"}/${REF}/${target.replace(/\/$/, "")}${hash ? `#${hash}` : ""}`, external: true };
  };
}

/* ---------------------------------------------------------------- render docs */

const staleFixes = []; // overlay fixes that no longer change anything: merged upstream?
const rendered = flatDocs.map((d) => {
  const file = `${d.slug}.md`;
  const upstream = new URL(file, CONTENT);
  const pending = !existsSync(upstream) && existsSync(new URL(file, OVERLAY)) ? d.issue : null;
  if (existsSync(upstream) && existsSync(new URL(file, OVERLAY)) && !process.env.DOCS_QUIET)
    console.warn(`docs: upstream now has ${file}; the overlay copy is ignored, delete content/docs-overlay/${file} and its nav issue`);
  if (!existsSync(upstream) && !pending) throw new Error(`docs: missing content/docs/${file} (run node scripts/sync-docs.mjs)`);
  let markdown = readFileSync(pending ? new URL(file, OVERLAY) : upstream, "utf8");
  const fixes = [];
  for (const f of overlayFixes.filter((f) => f.file === file)) {
    const next = f.apply(markdown);
    if (next === markdown) staleFixes.push(f);
    else if (!fixes.includes(f.issue)) fixes.push(f.issue);
    markdown = next;
  }
  const r = renderMarkdown(markdown, { link: makeLinkRewriter(file), code: codeBlock, callout, stripTitle: true });
  return { ...d, file, markdown, pending, fixes, ...r };
});

// Verify every internal anchor resolves.
const idsBySlug = Object.fromEntries(rendered.map((r) => [r.slug, new Set(r.headings.map((h) => h.id))]));
export const brokenAnchors = links
  .filter((l) => l.hash && !idsBySlug[l.slug]?.has(l.hash))
  .map((l) => ({ from: `docs/${l.from}.md`, to: `docs/${l.slug}.md#${l.hash}`, link: l.raw }));
for (const p of popular) if (p.hash && !idsBySlug[p.slug]?.has(p.hash)) brokenAnchors.push({ from: "src/docs/nav.mjs (popular)", to: `docs/${p.slug}.md#${p.hash}`, link: p.hash });
if (brokenAnchors.length && !process.env.DOCS_QUIET) {
  console.warn(`docs: ${brokenAnchors.length} upstream anchor(s) do not resolve (links kept as-is):`);
  for (const b of brokenAnchors) console.warn(`  ${b.from} -> ${b.to}`);
}
for (const f of staleFixes) if (!process.env.DOCS_QUIET) console.warn(`docs: overlay fix for #${f.issue} (${f.file}: ${f.title}) no longer applies; remove it from content/docs-overlay/fixes.mjs`);
export const docsReport = { brokenAnchors, links: links.length, staleFixes };

/* ---------------------------------------------------------------- partials */

function sidebar(current) {
  const groups = sections
    .map((s) => {
      const has = s.docs.some((d) => d.slug === current);
      const items = s.docs
        .map((d) => {
          const cur = d.slug === current;
          return `<li><a href="${href(docPath(d.slug))}"${cur ? ' aria-current="page"' : ""}>${esc(d.title)}</a></li>`;
        })
        .join("");
      return `<details class="docs-nav-group${has ? " has-current" : ""}" data-group="${s.id}" open>
<summary><span class="docs-nav-icon" aria-hidden="true">${icon(s.icon, 16)}</span><span class="docs-nav-label">${esc(s.title)}</span>${icon("chevron-down", 16, "docs-nav-chevron")}</summary>
<ul>${items}</ul>
</details>`;
    })
    .join("\n");
  return `<aside class="docs-sidebar" id="docs-sidebar" aria-label="Documentation" data-search-ignore>
<div class="docs-drawer-head"><span>Documentation</span><button type="button" class="icon-btn" data-docs-close aria-label="Close menu">${icon("x", 18)}</button></div>
<div class="docs-sidebar-scroll">
<a class="docs-nav-home${current ? "" : ' is-current" aria-current="page'}" href="${href("/docs/")}">${icon("book", 16)}<span>Docs home</span></a>
<nav class="docs-nav" aria-label="Docs sections">
${groups}
</nav>
<div class="docs-sidebar-foot">
<a href="${site.release}" rel="noopener"><span class="pulse" aria-hidden="true"></span>rustguac v${esc(VERSION)}</a>
<a href="${REPO}/tree/${REF}/docs" rel="noopener">${icon("github", 14)}Docs source</a>
</div>
</div>
</aside>`;
}

function tocList(headings, compact = false) {
  // Very long pages (the API reference) list only h2s in the side TOC.
  let items = headings.filter((h) => h.depth === 2 || h.depth === 3);
  if (compact && items.length > 40) items = items.filter((h) => h.depth === 2);
  if (!items.length) return "";
  let html = "<ol>";
  let open3 = false;
  items.forEach((h, k) => {
    if (h.depth === 2) {
      if (open3) { html += "</ol></li>"; open3 = false; }
      else if (k > 0) html += "</li>";
      html += `<li><a href="#${h.id}" data-toc="${h.id}">${esc(h.text)}</a>`;
    } else {
      if (!open3) { html += k === 0 ? "<li><ol>" : "<ol>"; open3 = true; }
      html += `<li><a href="#${h.id}" data-toc="${h.id}">${esc(h.text)}</a></li>`;
    }
  });
  html += open3 ? "</ol></li>" : "</li>";
  return html + "</ol>";
}

function pager(i) {
  const prev = flatDocs[i - 1];
  const next = flatDocs[i + 1];
  const card = (d, dir) =>
    d
      ? `<a class="docs-pager-card docs-pager-${dir}" href="${href(docPath(d.slug))}" rel="${dir}"><span class="docs-pager-dir">${dir === "prev" ? `${icon("chevron-left", 15)}Previous` : `Next${icon("chevron-right", 15)}`}</span><span class="docs-pager-title">${esc(d.title)}</span><span class="docs-pager-section">${esc(d.section.title)}</span></a>`
      : `<span class="docs-pager-card is-empty" aria-hidden="true"></span>`;
  return `<nav class="docs-pager" aria-label="Previous and next page" data-search-ignore>${card(prev, "prev")}${card(next, "next")}</nav>`;
}

const mobileBar = (label) =>
  `<div class="docs-mobilebar" data-search-ignore>
<button type="button" class="docs-menu-btn" data-docs-menu aria-controls="docs-sidebar" aria-expanded="false">${icon("menu", 18)}<span>Menu</span></button>
<a class="docs-menu-link" href="#docs-sidebar">${icon("menu", 18)}<span>All docs</span></a>
<span class="docs-mobilebar-label">${label}</span>
</div>`;

/* ---------------------------------------------------------------- doc pages */

const docPagesList = rendered.map((r, i) => {
  const path = docPath(r.slug);
  const modified = source.files?.[r.file]?.modified || source.releaseDate || site.released;
  const seoTitleBase = `${r.title} · rustguac docs`;
  const title = seoTitleBase.length <= 65 ? seoTitleBase : `${r.navTitle || r.title.slice(0, 50)} · rustguac docs`;
  let description = trimDescription(r.firstParagraphText || "");
  const balanced = (description.match(/\(/g) || []).length === (description.match(/\)/g) || []).length;
  if (r.seoFromNav || description.length < 70 || !balanced || /:$/.test(description)) {
    description = trimDescription(`${r.title}: ${r.description}`);
    if (description.length < 70) description = trimDescription(`${description} Part of the rustguac documentation.`);
  }
  const toc = tocList(r.headings, true);
  const words = r.text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 230));
  const issue = issueUrl(r.title, path);

  const body = `<div class="docs-shell" data-docs>
${mobileBar(`${esc(r.section.title)} <span aria-hidden="true">›</span> ${esc(r.title)}`)}
${sidebar(r.slug)}
<div class="docs-scrim" data-docs-scrim hidden></div>
<article class="docs-article" aria-labelledby="${esc(r.titleId || "doc-title")}">
<nav class="docs-crumbs" aria-label="Breadcrumb" data-search-ignore><ol>
<li><a href="${href("/docs/")}">Docs</a>${icon("chevron-right", 14)}</li>
<li><a href="${href("/docs/")}#${r.section.id}">${esc(r.section.title)}</a>${icon("chevron-right", 14)}</li>
<li><span aria-current="page">${esc(r.title)}</span></li>
</ol></nav>
<header class="docs-header">
<h1 id="${esc(r.titleId || "doc-title")}">${esc(r.title)}</h1>
<p class="docs-lead">${esc(r.description)}</p>
<div class="docs-meta" data-search-ignore>
<span>${icon("history", 14)}Updated <time datetime="${esc(modified)}">${fmtDate(modified)}</time></span>
<span>${icon("book", 14)}${minutes} min read</span>
<a href="${editUrl(r.file, r.pending)}" rel="noopener">${icon("github", 14)}Edit on GitHub</a>
</div>
</header>
${toc ? `<details class="docs-toc-mobile" data-search-ignore><summary>${icon("file-text", 16)}<span>On this page</span>${icon("chevron-down", 16, "docs-toc-chevron")}</summary><nav aria-label="On this page (compact)">${tocList(r.headings)}</nav></details>` : ""}
<div class="doc-content">
${r.html}
</div>
<footer class="docs-footer" data-search-ignore>
<div class="docs-feedback">
<p class="docs-feedback-q">${icon("chat", 18)}<span>Was this page helpful?</span></p>
<div class="docs-feedback-links">
<a class="btn btn-ghost btn-sm" href="${issue}" rel="noopener">${icon("bug", 15)}Open an issue</a>
<a class="btn btn-ghost btn-sm" href="${editUrl(r.file, r.pending)}" rel="noopener">${icon("github", 15)}Edit this page on GitHub</a>
<a class="btn btn-ghost btn-sm" href="${viewUrl(r.file, r.pending)}" rel="noopener">${icon("code", 15)}View source</a>
</div>
</div>
${pager(i)}
<p class="docs-synced">${icon("git-branch", 14)}<span>${
  r.pending
    ? `Proposed for the rustguac docs in <a href="${issueLink(r.pending)}" rel="noopener">#${r.pending}</a> and not merged upstream yet.`
    : `Synced from <a href="${REPO}/tree/${REF}/docs" rel="noopener">rustguac v${esc(VERSION)}</a>${SHORT ? ` (<a href="${REPO}/commit/${source.commit}" rel="noopener"><code>${SHORT}</code></a>)` : ""}, <code>docs/${esc(r.file)}</code>${
        r.fixes.length ? `, with fixes from ${r.fixes.map((n) => `<a href="${issueLink(n)}" rel="noopener">#${n}</a>`).join(", ")}` : ""
      }.`
} Documentation © the rustguac contributors, <a href="${site.licenseFile}" rel="noopener">Apache-2.0</a>.</span></p>
</footer>
</article>
${toc ? `<aside class="docs-toc" aria-label="On this page" data-search-ignore>
<p class="docs-toc-title">On this page</p>
<nav aria-label="Table of contents">${toc}</nav>
<div class="docs-toc-actions">
<a href="${editUrl(r.file, r.pending)}" rel="noopener">${icon("github", 14)}Edit this page</a>
<a href="${issue}" rel="noopener">${icon("bug", 14)}Report an issue</a>
<a href="#main" data-docs-top>${icon("arrow-up-right", 14)}Back to top</a>
</div>
</aside>` : ""}
</div>`;

  return {
    slug: `docs-${r.slug}`,
    path,
    title,
    description,
    h1: r.title,
    headline: r.title,
    layout: "docs",
    section: r.section.title,
    searchSection: `Docs › ${r.section.title}`,
    breadcrumbs: [
      { name: "Docs", path: "/docs/" },
      { name: r.title, path },
    ],
    pageType: ["TechArticle"],
    modified,
    datePublished: undefined,
    wordCount: words,
    priority: r.slug === "overview" || r.slug === "installation" ? 0.8 : 0.7,
    changefreq: "monthly",
    file: `docs/${r.file}`,
    doc: { slug: r.slug, file: r.file, markdown: r.markdown, text: r.text, headings: r.headings, source: viewUrl(r.file, r.pending) },
    // Social card: scripts/build-media.mjs og renders it to assets/og/docs-<slug>.jpg.
    og: {
      eyebrow: `Docs · ${esc(r.section.title)}`,
      title: esc(r.title).replace(/(\S+)$/, "<em>$1</em>"),
      sub: esc(r.description),
      shot: OG_SHOT[r.slug] || "connections",
    },
    ogAlt: `${r.title}: rustguac documentation`,
    body,
  };
});

/* ---------------------------------------------------------------- docs home */

const docsHome = (() => {
  const total = rendered.length;
  const cards = sections
    .map(
      (s) => `<section class="docs-home-section" id="${s.id}" aria-labelledby="${s.id}-h">
<div class="docs-home-section-head">
<span class="docs-home-section-icon" aria-hidden="true">${icon(s.icon, 20)}</span>
<div><h2 id="${s.id}-h">${esc(s.title)}</h2><p>${esc(s.blurb)}</p></div>
</div>
<ul class="docs-card-grid">
${s.docs
  .map(
    (d) => `<li><a class="docs-card" href="${href(docPath(d.slug))}"><span class="docs-card-icon" aria-hidden="true">${icon(d.icon, 18)}</span><span class="docs-card-title">${esc(d.title)}</span><span class="docs-card-desc">${esc(d.description)}</span><span class="docs-card-arrow" aria-hidden="true">${icon("arrow-right", 16)}</span></a></li>`,
  )
  .join("\n")}
</ul>
</section>`,
    )
    .join("\n");

  const steps = quickPath
    .map(
      (q, k) => `<li><a class="docs-step" href="${href(docPath(q.slug))}"><span class="docs-step-num" aria-hidden="true">${k + 1}</span><span class="docs-step-body"><span class="docs-step-title">${esc(q.step)}</span><span class="docs-step-text">${esc(q.text)}</span></span>${icon("arrow-right", 16, "docs-step-arrow")}</a></li>`,
    )
    .join("");

  const pop = popular
    .map((p) => `<li><a href="${href(docPath(p.slug))}${p.hash ? `#${p.hash}` : ""}">${icon("arrow-right", 14)}<span>${esc(p.title)}</span></a></li>`)
    .join("");

  const body = `<div class="docs-home" data-docs>
<section class="docs-hero">
<div class="docs-hero-inner">
<nav class="docs-crumbs" aria-label="Breadcrumb" data-search-ignore><ol><li><a href="${href("/")}">Home</a>${icon("chevron-right", 14)}</li><li><span aria-current="page">Docs</span></li></ol></nav>
<p class="docs-eyebrow"><span class="pulse" aria-hidden="true"></span>rustguac v${esc(VERSION)} documentation</p>
<h1>Install, configure and run rustguac</h1>
<p class="docs-hero-lead">Everything from a first install to a hardened production deployment: OIDC sign-in, Vault-backed connections, web and VDI sessions, the REST API and migrating from Apache Guacamole.</p>
<button type="button" class="docs-search" data-search-open aria-label="Search the documentation (Ctrl K)">${icon("search", 18)}<span class="docs-search-text">Search the docs, e.g. “OIDC groups” or “%2F”</span><kbd class="search-kbd" data-search-kbd>Ctrl K</kbd></button>
<noscript><p class="docs-search-nojs"><a href="${href("/search/")}">Open the search page</a> or browse the sections below.</p></noscript>
<p class="docs-hero-meta">${total} guides · synced from <a href="${REPO}/tree/${REF}/docs" rel="noopener"><code>sol1/rustguac/docs</code> @ ${esc(REF)}</a></p>
</div>
</section>
<div class="docs-home-body">
<section class="docs-quick" aria-labelledby="quick-h">
<h2 id="quick-h">Quick start</h2>
<ol class="docs-steps">${steps}</ol>
</section>
${cards}
<section class="docs-popular" aria-labelledby="popular-h" data-search-ignore>
<h2 id="popular-h">Popular topics</h2>
<ul>${pop}</ul>
</section>
<aside class="docs-home-help" data-search-ignore>
<div><h2>Can't find something?</h2><p>The docs are synced from the rustguac repository. Ask or report a gap on GitHub, and improvements to the docs are welcome as pull requests.</p></div>
<div class="docs-home-help-links">
<a class="btn btn-primary" href="${REPO}/issues/new?title=${encodeURIComponent("Docs: ")}" rel="noopener">${icon("bug", 16)}Open an issue</a>
<a class="btn btn-ghost" href="${REPO}/tree/${REF}/docs" rel="noopener">${icon("github", 16)}Browse docs on GitHub</a>
</div>
</aside>
</div>
</div>`;

  return {
    slug: "docs",
    path: "/docs/",
    title: "rustguac docs: install, configure and deploy",
    description:
      "rustguac documentation: installation, configuration, production deployment, OIDC roles, Vault connections, web and VDI sessions, security and the REST API.",
    h1: "Install, configure and run rustguac",
    layout: "docs",
    section: "",
    searchSection: "Docs",
    breadcrumbs: [{ name: "Docs", path: "/docs/" }],
    pageType: ["CollectionPage"],
    modified: source.releaseDate || site.released,
    priority: 0.9,
    changefreq: "weekly",
    body,
  };
})();

export const docPages = [docsHome, ...docPagesList];
export default docPages;
