#!/usr/bin/env node
// Generates every derived image from the sources in media/ into src/static/.
// Run after changing a screenshot, the logo, or a page's og block. Outputs are
// committed, so `npm run build` never needs ImageMagick, cwebp, oxipng or Chrome.
//
// Needs: ImageMagick 7 (`magick`), `cwebp`, `oxipng` and Google Chrome / Chromium.
//   node scripts/build-media.mjs            # everything
//   node scripts/build-media.mjs shots      # screenshots → WebP + src/shots.json
//   node scripts/build-media.mjs icons og   # favicons/PWA icons + 1200×630 social cards
//   node scripts/build-media.mjs brand      # README wordmarks in media/brand/
//
// Screenshots: media/screenshots/{dark,light}/<name>.png (1440 wide). Any expected
// screenshot that is missing gets a clearly-labelled placeholder so the site still
// builds; shots.json marks those with "placeholder": true. The <name>-mobile.png
// captures are kept as sources only: rustguac has no mobile layout yet
// (sol1/rustguac#306), so the site does not show them and no WebP is generated.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const media = join(root, "media");
const out = join(root, "src", "static");
const tmp = join(tmpdir(), "rustguac-site-media");
mkdirSync(tmp, { recursive: true });

const run = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "ignore", "inherit"] });

const CHROME = [
  process.env.CHROME,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].find((p) => p && existsSync(p));

function chromeShot(html, file, width, height, transparent = false) {
  if (!CHROME) throw new Error("Chrome not found; set CHROME=/path/to/chrome");
  const page = join(tmp, `render-${basename(file)}.html`);
  writeFileSync(page, html);
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--allow-file-access-from-files",
    `--window-size=${width},${height}`,
    "--virtual-time-budget=3000",
    `--screenshot=${file}`,
  ];
  if (transparent) args.push("--default-background-color=00000000");
  args.push(pathToFileURL(page).href);
  execFileSync(CHROME, args, { stdio: "ignore" });
}

// Fonts are inlined as data: URLs: headless Chrome treats each file:// URL as its own
// origin and refuses cross-directory font loads.
const font = (f) => `data:font/woff2;base64,${readFileSync(join(out, "assets", "fonts", f)).toString("base64")}`;
const FONTS = `@font-face{font-family:Inter;src:url(${font("inter-latin.woff2")}) format("woff2");font-weight:400 800}
@font-face{font-family:JBM;src:url(${font("jetbrains-mono-latin.woff2")}) format("woff2");font-weight:400 700}`;

const { LOGO_INNER } = await import("../src/icons.mjs");
const logoSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="${size}" height="${size}">${LOGO_INNER}</svg>`;

/* ---------- Screenshots ---------- */
const EXPECTED = ["connections", "connection-editor-rdp", "connection-editor-web", "connection-editor-vdi", "ssh-tunnel", "credentials", "sessions", "recordings", "recording-player", "reports", "admin", "tokens", "themes"];
// 1440 → 1440, 960, 720, 640.
const widthsFor = (w) => [1440, 960, 720, 640].filter((x) => x <= w);

function placeholder(theme, name, file) {
  const [w, h] = [1440, 900];
  const dark = theme === "dark";
  const label = name.replace(/-/g, " ");
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}
    *{box-sizing:border-box}html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;font-family:Inter,sans-serif}
    body{background:${dark ? "radial-gradient(80% 60% at 30% 0%,#1d2a5a,#0b0e1d 70%)" : "linear-gradient(#f6f8fc,#e9edf6)"};color:${dark ? "#cfd6ef" : "#2a3150"};display:grid;place-items:center}
    .c{text-align:center}.t{font-size:46px;font-weight:800;letter-spacing:-.03em;text-transform:capitalize}
    .s{margin-top:14px;font-family:JBM;font-size:20px;opacity:.7}
    .side{position:absolute;left:0;top:0;bottom:0;width:240px;background:${dark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.03)"};border-right:1px solid ${dark ? "#232a4a" : "#d9deea"}}
  </style></head><body><div class="side"></div><div class="c">${logoSvg(96)}<div class="t">${label}</div><div class="s">placeholder screenshot · ${theme}</div></div></body></html>`;
  chromeShot(html, file, w, h);
}

function shots() {
  const dest = join(out, "assets", "img", "shots");
  rmSync(dest, { recursive: true, force: true });
  const manifest = {};
  let placeholders = 0;
  for (const theme of ["dark", "light"]) {
    mkdirSync(join(dest, theme), { recursive: true });
    const dir = join(media, "screenshots", theme);
    const found = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".png")).map((f) => f.replace(/\.png$/, "")).filter((n) => !n.endsWith("-mobile")) : [];
    const names = [...new Set([...EXPECTED, ...found])].sort();
    for (const name of names) {
      let src = join(dir, `${name}.png`);
      let isPlaceholder = false;
      if (!existsSync(src)) {
        src = join(tmp, `placeholder-${theme}-${name}.png`);
        placeholder(theme, name, src);
        isPlaceholder = true;
        placeholders++;
      }
      const [w, h] = execFileSync("magick", ["identify", "-format", "%w %h", src]).toString().split(" ").map(Number);
      const widths = widthsFor(w);
      for (const width of widths) {
        const png = join(tmp, `${theme}-${name}-${width}.png`);
        run("magick", [src, "-strip", "-filter", "Lanczos", "-resize", `${width}x`, png]);
        const webp = join(dest, theme, `${name}-${width}.webp`);
        const q = width === w ? ["-q", "92", "-m", "6", "-sharp_yuv"] : ["-q", "86", "-m", "6", "-sharp_yuv"];
        run("cwebp", ["-quiet", "-metadata", "none", ...q, png, "-o", webp]);
      }
      const prev = manifest[name];
      // Both themes must share dimensions (one width/height attribute pair per <img>);
      // keep the larger height if they differ slightly.
      manifest[name] = {
        width: w,
        height: prev ? Math.max(prev.height, h) : h,
        widths,
        ...(isPlaceholder || (prev && prev.placeholder) ? { placeholder: true } : {}),
      };
    }
  }
  writeFileSync(join(root, "src", "shots.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`shots: ${Object.keys(manifest).length} screenshots × 2 themes${placeholders ? ` (${placeholders} placeholders)` : ""}`);
}

/* ---------- Brand: SVG mark + README wordmarks ---------- */
function brand() {
  const dir = join(media, "brand");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "logo.svg"), logoSvg(128) + "\n");
  for (const theme of ["dark", "light"]) {
    const color = theme === "dark" ? "#e8ebf5" : "#10132a";
    const teal = theme === "dark" ? "#5bc0be" : "#1b7c79";
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}
      html,body{margin:0;background:transparent}
      .w{display:inline-flex;align-items:center;gap:36px;padding:20px 28px}
      .t{font-family:Inter,sans-serif;font-weight:800;font-size:150px;letter-spacing:-.045em;color:${color};line-height:1}
      .t span{color:${teal}}</style></head><body><div class="w">${logoSvg(190)}<div class="t">rust<span>guac</span></div></div></body></html>`;
    const png = join(tmp, `wordmark-${theme}.png`);
    chromeShot(html, png, 1400, 260, true);
    const file = join(dir, `wordmark-${theme}.png`);
    run("magick", [png, "-trim", "+repage", "-bordercolor", "none", "-border", "8", "-resize", "880x", "-strip", file]);
    run("oxipng", ["-q", "-o", "4", "--strip", "all", file]);
  }
  console.log("brand: media/brand/logo.svg, wordmark-dark.png, wordmark-light.png");
}

/* ---------- Icons: SVG favicon, ICO, apple-touch, PWA + maskable ---------- */
function icons() {
  writeFileSync(join(out, "favicon.svg"), logoSvg(128).replace(/ width="128" height="128"/, "") + "\n");
  const tile = (size, pad, radius) => `<!doctype html><html><head><style>
    html,body{margin:0;background:transparent}
    .t{width:${size}px;height:${size}px;display:grid;place-items:center;border-radius:${radius}px;
       background:radial-gradient(120% 120% at 30% 0%,#22305e 0%,#12142a 55%,#0a0c16 100%)}
    svg{width:${size - pad * 2}px;height:${size - pad * 2}px}
  </style></head><body><div class="t">${logoSvg(size)}</div></body></html>`;
  const bare = (size) => `<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style></head><body>${logoSvg(size)}</body></html>`;
  const dir = join(out, "assets", "icons");
  mkdirSync(dir, { recursive: true });
  const jobs = [
    ["apple-touch-icon.png", tile(180, 22, 0), 180, out, false], // opaque; iOS rounds corners itself
    ["icon-192.png", tile(192, 22, 42), 192, dir, true],
    ["icon-512.png", tile(512, 60, 112), 512, dir, true],
    ["icon-maskable-512.png", tile(512, 118, 0), 512, dir, false], // mark inside the 80% safe zone
    ["ico-48.png", bare(48), 48, tmp, true],
    ["ico-32.png", bare(32), 32, tmp, true],
    ["ico-16.png", bare(16), 16, tmp, true],
  ];
  for (const [name, html, size, d, transparent] of jobs) {
    const raw = join(tmp, `raw-${name}`);
    chromeShot(html, raw, size, size, transparent);
    run("magick", [raw, "-crop", `${size}x${size}+0+0`, "+repage", "-strip", join(d, name)]);
  }
  run("magick", [join(tmp, "ico-16.png"), join(tmp, "ico-32.png"), join(tmp, "ico-48.png"), join(out, "favicon.ico")]);
  for (const f of ["apple-touch-icon.png", "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/icons/icon-maskable-512.png"]) {
    run("oxipng", ["-q", "-o", "4", "--strip", "all", join(out, f)]);
  }
  console.log("icons: favicon.svg, favicon.ico, apple-touch-icon, PWA 192/512 + maskable");
}

/* ---------- Social cards (1200×630): one per page with an `og` block + generic docs ---------- */
async function og() {
  const { pages: corePages } = await import("../src/pages/index.mjs");
  const { ogKey } = await import("../src/layout.mjs");
  let docPages = [];
  if (existsSync(join(root, "src", "docs", "index.mjs"))) {
    const m = await import(pathToFileURL(join(root, "src", "docs", "index.mjs")).href);
    docPages = (m.docPages || m.default || []).filter((p) => p.og);
  }
  const shotFile = (n) => {
    const f = join(out, "assets", "img", "shots", "dark", `${n}-960.webp`);
    return existsSync(f) ? pathToFileURL(f).href : null;
  };
  const dest = join(out, "assets", "og");
  mkdirSync(dest, { recursive: true });
  const cards = [
    ...corePages.filter((p) => p.og).map((p) => ({ key: ogKey(p), og: p.og })),
    ...docPages.map((p) => ({ key: ogKey(p), og: p.og })),
    {
      key: "docs",
      og: {
        eyebrow: "Documentation",
        title: "Install, configure and run <em>rustguac</em>",
        sub: "Installation, configuration, OIDC roles, Vault connections, web and VDI sessions, security and the REST API.",
        shot: "connection-editor-rdp",
      },
    },
  ];
  for (const { key, og: o } of cards) {
    const len = o.title.replace(/<[^>]+>/g, "").length;
    const size = o.size || (len > 52 ? 48 : len > 40 ? 54 : 60);
    const shot = shotFile(o.shot || "connections");
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}
      *{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden}
      body{font-family:Inter,sans-serif;color:#e8ebf5;background:#0a0c16;position:relative}
      .glow{position:absolute;inset:0;background:
        radial-gradient(55% 70% at 85% 0%,rgba(91,192,190,.30),transparent 70%),
        radial-gradient(40% 50% at 100% 100%,rgba(233,69,96,.16),transparent 70%),
        radial-gradient(45% 60% at 0% 100%,rgba(91,192,190,.12),transparent 70%)}
      .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(160,175,230,.05) 1px,transparent 1px),
        linear-gradient(90deg,rgba(160,175,230,.05) 1px,transparent 1px);background-size:40px 40px;
        -webkit-mask-image:linear-gradient(180deg,#000 30%,transparent)}
      .copy{position:absolute;left:72px;top:62px;width:${shot ? 600 : 1000}px}
      .brand{display:flex;align-items:center;gap:16px}
      .brand svg{width:64px;height:64px;filter:drop-shadow(0 8px 20px rgba(91,192,190,.35))}
      .brand b{font-size:44px;font-weight:800;letter-spacing:-.045em}.brand b span{color:#5bc0be}
      .eyebrow{margin-top:58px;font-family:JBM;font-size:20px;letter-spacing:.14em;text-transform:uppercase;color:#84dcd9}
      .eyebrow i{font-style:normal;color:#e94560;letter-spacing:0;margin-right:12px;font-weight:700}
      h1{margin:16px 0 0;font-size:${size}px;line-height:1.05;letter-spacing:-.04em;font-weight:800}
      h1 em{font-style:normal;background:linear-gradient(92deg,#5bc0be,#9be7e3 55%,#5bc0be);-webkit-background-clip:text;color:transparent}
      p{margin:22px 0 0;font-size:24px;line-height:1.42;color:#a5abc6}
      .foot{position:absolute;left:72px;bottom:52px;font-family:JBM;font-size:19px;color:#8088a8;display:flex;gap:22px}
      .foot b{color:#d8ddf0;font-weight:500}.foot i{font-style:normal;color:#e94560;font-weight:700}
      .shot{position:absolute;left:730px;top:118px;width:780px;border-radius:16px;overflow:hidden;
        border:1px solid #2b3259;box-shadow:0 40px 80px -20px rgba(0,0,0,.8),0 0 0 6px rgba(91,192,190,.06)}
      .bar{height:30px;background:#0f1224;border-bottom:1px solid #20264a;display:flex;gap:8px;align-items:center;padding:0 12px}
      .bar span{width:10px;height:10px;border-radius:50%;background:#2b3259}
      .shot img{display:block;width:100%}
    </style></head><body><div class="glow"></div><div class="grid"></div>
      <div class="copy">
        <div class="brand">${logoSvg(64)}<b>rust<span>guac</span></b></div>
        <div class="eyebrow"><i>&gt;_</i>${o.eyebrow}</div>
        <h1>${o.title}</h1>
        <p>${o.sub}</p>
      </div>
      <div class="foot"><b>github.com/sol1/rustguac</b><span>Apache-2.0</span></div>
      ${shot ? `<div class="shot"><div class="bar"><span></span><span></span><span></span></div><img src="${shot}"></div>` : ""}
    </body></html>`;
    const png = join(tmp, `og-${key}.png`);
    chromeShot(html, png, 1200, 630);
    const jpg = join(dest, `${key}.jpg`);
    run("magick", [png, "-crop", "1200x630+0+0", "+repage", "-strip", "-sampling-factor", "4:2:0", "-quality", "86", "-interlace", "Plane", jpg]);
    console.log(`og: ${key}.jpg ${Math.round(statSync(jpg).size / 1024)} KB`);
  }
}

const want = new Set(process.argv.slice(2));
const all = want.size === 0;
if (all || want.has("shots")) shots();
if (all || want.has("brand")) brand();
if (all || want.has("icons")) icons();
if (all || want.has("og")) await og();
