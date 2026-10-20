// Page shell: <head> (SEO, Open Graph, JSON-LD, CSP), header, footer and shared
// partials. render(page, assets) is called by scripts/build.mjs for every page,
// including the docs and search pages owned by other modules.
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { site, href, abs } from "./site.mjs";
import { icon, githubMark, logoMark } from "./icons.mjs";
import { esc } from "./code.mjs";

export { esc };
export { href, abs };

export const sha256 = (s) => "sha256-" + createHash("sha256").update(s, "utf8").digest("base64");

// External link. rel=noopener on every off-site link (checked by scripts/check.mjs).
export const ext = (url, label, cls = "") => `<a${cls ? ` class="${cls}"` : ""} href="${url}" rel="noopener">${label}</a>`;

// Placeholder written into <html data-search-index>; build.mjs swaps in the real URL.
export const SEARCH_INDEX_TOKEN = "__RUSTGUAC_SEARCH_INDEX__";

/* ---------- Screenshots ---------- */
const shotsFile = new URL("./shots.json", import.meta.url);
const shotsMeta = existsSync(shotsFile) ? JSON.parse(readFileSync(shotsFile, "utf8")) : {};
export const hasShot = (name) => Boolean(shotsMeta[name]);

const shotPath = (theme, name, w) => `/assets/img/shots/${theme}/${name}-${w}.webp`;

export function shotSet(theme, name) {
  const m = shotsMeta[name];
  if (!m) throw new Error(`missing screenshot: ${name} (run node scripts/build-media.mjs shots)`);
  const def = m.widths.includes(960) ? 960 : m.widths[m.widths.length > 1 ? 1 : 0];
  return {
    src: href(shotPath(theme, name, def)),
    srcset: m.widths.map((w) => `${href(shotPath(theme, name, w))} ${w}w`).join(", "),
    full: href(shotPath(theme, name, m.width)),
    fullAbs: abs(shotPath(theme, name, m.width)),
    width: m.width,
    height: m.height,
  };
}

// Both theme variants are emitted; CSS shows the one matching <html data-theme>.
// Lazy images that are display:none are never fetched, so only one variant downloads.
export function shot(name, alt, { sizes = "(min-width: 1180px) 1100px, 94vw", cls = "", fetchpriority = "", eager = false } = {}) {
  if (!shotsMeta[name]) {
    return `<span class="shot shot-missing" role="img" aria-label="${esc(alt)}"></span>`;
  }
  return ["dark", "light"]
    .map((theme) => {
      const s = shotSet(theme, name);
      return `<img class="shot shot-${theme}${cls ? " " + cls : ""}" src="${s.src}" srcset="${s.srcset}" sizes="${sizes}" width="${s.width}" height="${s.height}" alt="${esc(alt)}" loading="${eager ? "eager" : "lazy"}" decoding="async"${fetchpriority ? ` fetchpriority="${fetchpriority}"` : ""} data-full="${s.full}">`;
    })
    .join("");
}

// A screenshot in a browser frame, wrapped in a zoom button for the lightbox.
export function browserShot(name, alt, { url = "rustguac.example.com", sizes, cls = "", fetchpriority = "", eager = false, label } = {}) {
  return `<div class="browser${cls ? " " + cls : ""}">
  <div class="browser-bar" aria-hidden="true"><span class="dots"><i></i><i></i><i></i></span><span class="browser-url">${icon("lock", 12)}${esc(url)}</span></div>
  <button class="zoom" type="button" aria-label="${esc(label || "Enlarge: " + alt)}">${shot(name, alt, { sizes, fetchpriority, eager })}<span class="zoom-hint">${icon("zoom", 16)}</span></button>
</div>`;
}

/* ---------- Structured data ---------- */
export const ids = {
  org: `${site.url}/#organization`,
  website: `${site.url}/#website`,
  app: `${site.url}/#software`,
  code: `${site.url}/#source`,
};

export function baseGraph() {
  return [
    {
      "@type": "Organization",
      "@id": ids.org,
      name: "rustguac project",
      url: abs("/"),
      logo: { "@type": "ImageObject", url: abs("/assets/icons/icon-512.png"), width: 512, height: 512 },
      sameAs: [site.repo, site.dockerHub],
    },
    {
      "@type": "WebSite",
      "@id": ids.website,
      url: abs("/"),
      name: site.name,
      description: site.description,
      inLanguage: site.lang,
      publisher: { "@id": ids.org },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${abs("/search/")}?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

export function softwareNode() {
  return {
    "@type": "SoftwareApplication",
    "@id": ids.app,
    name: site.name,
    description: site.description,
    url: abs("/"),
    applicationCategory: "NetworkingApplication",
    applicationSubCategory: "Remote desktop gateway",
    operatingSystem: "Linux (Debian 13 package, Docker image)",
    softwareVersion: site.version,
    datePublished: site.released,
    license: site.licenseUrl,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    downloadUrl: site.releases,
    installUrl: abs("/docs/installation/"),
    releaseNotes: site.release,
    softwareHelp: { "@type": "CreativeWork", url: abs("/docs/") },
    screenshot: hasShot("connections") ? shotSet("dark", "connections").fullAbs : undefined,
    image: abs("/assets/og/home.jpg"),
    featureList: [
      "Browser-based SSH with SFTP file transfer and ephemeral keypair auth",
      "RDP with Kerberos NLA, RemoteApp/RAIL, H.264 passthrough and the GFX pipeline",
      "VNC, SPICE and Proxmox VE VM consoles",
      "Web browser sessions: headless Chromium on Xvnc with autofill and domain allowlisting",
      "VDI desktop containers: ephemeral Docker desktops per user",
      "OIDC single sign-on with a 4-tier role system and group mapping",
      "Connection credentials stored in HashiCorp Vault or OpenBao, never sent to the browser",
      "Multi-hop SSH tunnels through jump hosts and bastions",
      "Session recording with a playback UI, session sharing and reports",
      "TLS between browser, rustguac and guacd; CIDR allowlists; rate limiting",
    ],
    author: { "@id": ids.org },
    publisher: { "@id": ids.org },
    sameAs: [site.repo],
  };
}

export function sourceNode() {
  return {
    "@type": "SoftwareSourceCode",
    "@id": ids.code,
    name: `${site.name} source code`,
    codeRepository: site.repo,
    programmingLanguage: "Rust",
    runtimePlatform: "Linux",
    license: site.licenseUrl,
    targetProduct: { "@id": ids.app },
    author: { "@id": ids.org },
  };
}

const stripTags = (s) => String(s).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

export function faqQuestions(faqs) {
  return faqs.map((f) => ({
    "@type": "Question",
    name: decode(stripTags(f.q)),
    acceptedAnswer: { "@type": "Answer", text: decode(stripTags(f.a)) },
  }));
}

/* ---------- Partials ---------- */
export const brand = (size = 30) =>
  `<a class="brand" href="${href("/")}" aria-label="${site.name} home">${logoMark(size)}<span class="wordmark">rust<span>guac</span></span></a>`;

export const searchTrigger = (cls = "") =>
  `<button type="button" class="search-trigger${cls ? " " + cls : ""}" data-search-open aria-label="Search docs and site (Ctrl K)">${icon("search", 16)}<span class="search-trigger-label">Search docs…</span><kbd class="search-kbd" data-search-kbd>Ctrl K</kbd></button>`;

const isCurrent = (navHref, page) => {
  if (navHref.includes("#")) return false;
  if (navHref === "/") return page.path === "/";
  return page.path === navHref || (navHref !== "/" && page.path.startsWith(navHref));
};

function header(page) {
  const links = site.nav
    .map((n) => `<a href="${href(n.href)}"${isCurrent(n.href, page) ? ' aria-current="page"' : ""}>${n.label}</a>`)
    .join("");
  return `<header class="site-header" data-search-ignore>
  <div class="container header-inner">
    ${brand(30)}
    <nav class="nav" aria-label="Primary">${links}</nav>
    <div class="header-actions">
      ${searchTrigger()}
      <a class="release-pill hide-md" href="${site.release}" rel="noopener" title="Release notes for v${site.version}"><span class="pulse" aria-hidden="true"></span>v${site.version}</a>
      <a class="icon-btn hide-sm" href="${site.repo}" rel="noopener" aria-label="rustguac on GitHub" title="rustguac on GitHub">${githubMark(18)}</a>
      <button class="icon-btn theme-toggle" id="themeToggle" type="button" aria-label="Switch to light theme" title="Toggle theme">${icon("sun", 18, "i-sun")}${icon("moon", 18, "i-moon")}</button>
      <button class="icon-btn menu-toggle" id="menuToggle" type="button" aria-label="Open menu" aria-expanded="false" ${page.docsNav ? 'aria-controls="docs-sidebar" data-docs-menu' : 'aria-controls="mobileNav"'}>${icon("menu", 20, "i-menu")}${icon("x", 20, "i-close")}</button>
    </div>
  </div>
  ${page.docsNav ? "" : `<div class="mobile-nav" id="mobileNav" hidden>
    <nav class="container" aria-label="Mobile">
      ${site.nav.map((n) => `<a href="${href(n.href)}"${isCurrent(n.href, page) ? ' aria-current="page"' : ""}>${n.label}${icon("chevron-right", 18)}</a>`).join("")}
      <div class="mobile-cta">
        <a class="btn btn-primary btn-lg" href="${href("/#quickstart")}">${icon("terminal", 18)}<span>Quickstart</span></a>
        <a class="btn btn-ghost btn-lg" href="${site.repo}" rel="noopener">${githubMark(18)}<span>View on GitHub</span></a>
      </div>
      <p class="mobile-release"><a href="${site.release}" rel="noopener"><span class="pulse" aria-hidden="true"></span>Latest release: v${site.version}</a></p>
    </nav>
  </div>`}
</header>`;
}

function crumbItems(page) {
  const items = [{ name: "Home", path: "/" }, ...(page.breadcrumbs || [])];
  // Drop a duplicate "Home" if the page already starts with it.
  if (items.length > 1 && items[1].path === "/") items.splice(1, 1);
  return items;
}

function breadcrumbs(page) {
  if (!page.breadcrumbs || !page.breadcrumbs.length) return "";
  const items = crumbItems(page);
  return `<nav class="crumbs container" aria-label="Breadcrumb" data-search-ignore><ol>${items
    .map((c, i) =>
      i === items.length - 1
        ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
        : `<li><a href="${href(c.path)}">${esc(c.name)}</a>${icon("chevron-right", 14)}</li>`,
    )
    .join("")}</ol></nav>`;
}

function breadcrumbNode(page) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${abs(page.path)}#breadcrumb`,
    itemListElement: crumbItems(page).map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })),
  };
}

export const releasedLabel = new Date(site.released + "T00:00:00Z").toLocaleDateString("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function footer() {
  const col = (title, links) =>
    `<div class="footer-col"><h2>${title}</h2><ul>${links
      .filter(([h]) => h)
      .map(([h, l]) => (/^https?:/.test(h) ? `<li><a href="${h}" rel="noopener">${l}</a></li>` : `<li><a href="${href(h)}">${l}</a></li>`))
      .join("")}</ul></div>`;
  return `<footer class="site-footer" data-search-ignore>
  <div class="container footer-inner">
    <div class="footer-brand">
      ${brand(28)}
      <p>${site.tagline}. Browser-based SSH, RDP, VNC, SPICE, Proxmox VE consoles, web browsing and VDI desktops through guacd.</p>
      <p class="footer-motto"><span aria-hidden="true">&gt;_</span> ${site.motto}</p>
      <a class="release-chip" href="${site.release}" rel="noopener"><span class="pulse" aria-hidden="true"></span>v${site.version}<span class="muted">· ${releasedLabel}</span></a>
    </div>
    <div class="footer-cols">
      ${col("Product", [["/features/", "Features"], ["/#screens", "Screenshots"], ["/#quickstart", "Quickstart"], ["/guacamole-alternative/", "Guacamole alternative"], ["/support/", "Commercial support"], ["/faq/", "FAQ"], ["/search/", "Search"]])}
      ${col("Docs", [["/docs/", "Documentation"], ["/docs/installation/", "Installation"], ["/docs/configuration/", "Configuration"], ["/docs/deployment-guide/", "Deployment guide"], ["/docs/security/", "Security"], ["/docs/api/", "API reference"], ["/docs/migration/", "Migrating from Guacamole"]])}
      ${col("Project", [[site.repo, "GitHub"], [site.releases, "Releases"], [site.dockerHub, "Docker Hub"], [site.issues, "Issues"], [site.discussions, "Discussions"], [site.security, "Security policy"], [site.websiteRepo, "Website source"]])}
    </div>
  </div>
  <div class="container footer-bottom">
    <div class="footer-legal">
      <p>rustguac is open source under the <a href="${site.licenseFile}" rel="noopener">Apache-2.0 license</a>.</p>
      <p>Independent community website, not affiliated with or endorsed by the Apache Software Foundation. Apache, Apache Guacamole and Guacamole are trademarks of the Apache Software Foundation.</p>
    </div>
    <a class="maker-link" href="${site.maintainer.url}" rel="noopener" aria-label="rustguac is developed by ${site.maintainer.name} and contributors"><span class="maker-by">Developed by</span><span class="sol1-logo maker-logo" aria-hidden="true"></span><span class="maker-and">and contributors</span></a>
  </div>
</footer>`;
}

const lightbox = `<dialog class="lightbox" id="lightbox" aria-label="Screenshot preview">
  <div class="lightbox-frame" id="lightboxFrame">
    <span class="lightbox-spinner" aria-hidden="true"></span>
  </div>
  <p class="lightbox-caption" id="lightboxCaption"></p>
  <button class="lightbox-btn lightbox-close" id="lightboxClose" type="button" aria-label="Close preview">${icon("x", 22)}</button>
  <button class="lightbox-btn lightbox-prev" id="lightboxPrev" type="button" aria-label="Previous screenshot">${icon("chevron-left", 24)}</button>
  <button class="lightbox-btn lightbox-next" id="lightboxNext" type="button" aria-label="Next screenshot">${icon("chevron-right", 24)}</button>
</dialog>`;

/* ---------- Social card ---------- */
const ogDir = new URL("./static/assets/og/", import.meta.url);
export function ogKey(page) {
  if (page.ogImage) return page.ogImage;
  if (page.layout === "docs") return page.og ? page.slug.replace(/^(docs-)?/, "docs-") : "docs";
  return page.slug;
}
function ogImageFor(page) {
  const want = ogKey(page);
  for (const k of [want, page.layout === "docs" ? "docs" : null, "home"]) {
    if (k && existsSync(new URL(`${k}.jpg`, ogDir))) return `/assets/og/${k}.jpg`;
  }
  return `/assets/og/${want}.jpg`;
}

/* ---------- Document ---------- */
export const THEME_KEY = "rustguac-theme";
// Theme before first paint (no flash) and the js class for JS-only layout.
export const bootScript = `(function(){var d=document.documentElement,t;d.classList.replace("no-js","js");try{t=localStorage.getItem("${THEME_KEY}")}catch(e){}if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";d.dataset.theme=t})();`;

export function render(page, assets = {}) {
  const url = abs(page.path);
  const title = page.title;
  const ogPath = ogImageFor(page);
  const ogImage = abs(ogPath);
  const layout = page.layout || "default";
  const types = [].concat(page.pageType || ["WebPage"]);

  const graph = [...baseGraph(), ...(page.schema || []), ...(page.jsonld || [])];
  const webPage = {
    "@type": types.length === 1 ? types[0] : types,
    "@id": `${url}#webpage`,
    url,
    name: title,
    description: page.description,
    inLanguage: site.lang,
    isPartOf: { "@id": ids.website },
    primaryImageOfPage: { "@type": "ImageObject", url: ogImage, width: 1200, height: 630 },
    dateModified: page.modified || site.released,
  };
  if (types.includes("TechArticle") || types.includes("Article")) {
    Object.assign(webPage, {
      headline: (page.headline || page.h1 || title).slice(0, 110),
      author: { "@id": ids.org },
      publisher: { "@id": ids.org },
      image: ogImage,
      mainEntityOfPage: url,
      about: { "@id": ids.app },
    });
    if (page.datePublished) webPage.datePublished = page.datePublished;
    if (page.wordCount) webPage.wordCount = page.wordCount;
  }
  if (page.about) webPage.about = page.about;
  const crumbsOn = page.breadcrumbs && page.breadcrumbs.length;
  if (crumbsOn) {
    webPage.breadcrumb = { "@id": `${url}#breadcrumb` };
    graph.push(breadcrumbNode(page));
  }
  if (page.mainEntity) webPage.mainEntity = page.mainEntity;
  if (page.faq && types.includes("FAQPage")) webPage.mainEntity = faqQuestions(page.faq);
  graph.push(webPage);
  const jsonld = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");

  const inlineScripts = [bootScript, ...(page.inlineScripts || [])];
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${inlineScripts.map((s) => `'${sha256(s)}'`).join(" ")}`,
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "worker-src 'self'",
    ...(site.url.startsWith("https:") ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  const js = assets.js || {};
  const scripts = [js.main, js.search, layout === "docs" ? js.docs : null]
    .filter(Boolean)
    .map((s) => `<script src="${s}" defer></script>`)
    .join("\n");
  const section = page.searchSection || (layout === "docs" ? `Docs${page.section ? " › " + page.section : ""}` : "Site");
  const searchAttr = assets.searchIndex === false ? "" : ` data-search-index="${assets.searchIndex || SEARCH_INDEX_TOKEN}"`;

  return `<!DOCTYPE html>
<html lang="${site.lang}" class="no-js" data-theme="dark" data-base="${site.base}"${searchAttr}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${site.staging ? "noindex, nofollow" : page.noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}">
<script>${bootScript}</script>
${(page.inlineScripts || []).map((s) => `<script>${s}</script>`).join("\n")}
<link rel="preload" href="${href("/assets/fonts/inter-latin.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${assets.css}">
<meta name="color-scheme" content="dark light">
<meta name="theme-color" content="#0a0c16" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#fbfcfe" media="(prefers-color-scheme: light)">
<meta name="format-detection" content="telephone=no">
<meta name="application-name" content="${site.name}">
<meta name="apple-mobile-web-app-title" content="${site.name}">
<link rel="icon" href="${href("/favicon.ico")}" sizes="48x48">
<link rel="icon" href="${href("/favicon.svg")}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${href("/apple-touch-icon.png")}">
<link rel="manifest" href="${href("/site.webmanifest")}">
<link rel="author" href="${href("/humans.txt")}">
<link rel="search" type="text/plain" title="llms.txt" href="${href("/llms.txt")}">
<meta property="og:type" content="${types.includes("TechArticle") ? "article" : "website"}">
<meta property="og:site_name" content="${site.name}">
<meta property="og:locale" content="${site.locale}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(page.ogTitle || title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(page.ogAlt || `${site.name}: ${site.tagline}`)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.ogTitle || title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${ogImage}">
<script type="application/ld+json">${jsonld}</script>
${scripts}
${page.headExtra || ""}</head>
<body class="page-${esc(page.slug)} layout-${layout}${page.bodyClass ? " " + page.bodyClass : ""}">
<a class="skip-link" href="#main">Skip to content</a>
${header(page)}
<main id="main" tabindex="-1" data-search-section="${esc(section)}">
${layout === "docs" ? "" : breadcrumbs(page)}
${page.body}
</main>
${footer()}
${page.lightbox ? lightbox : ""}
</body>
</html>
`;
}
