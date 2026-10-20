import { site, href, hrefAll } from "../site.mjs";
import { icon, githubMark, logoMark } from "../icons.mjs";
import { shot, browserShot, hasShot, softwareNode, sourceNode, ids, esc } from "../layout.mjs";
import { highlights, protocols, featureGroups, comparison, faqs, quickstart, useCases, release } from "../data.mjs";
import { hl, plain } from "../code.mjs";

const HERO_SIZES = "(min-width: 1160px) 1100px, 94vw";
const HOST = "rustguac.example.com";

/* ---------- Hero ---------- */
const protoChips = [
  ["ssh", "terminal", "SSH"],
  ["rdp", "monitor", "RDP"],
  ["vnc", "desktop", "VNC"],
  ["spice", "cpu", "SPICE"],
  ["proxmox", "server", "Proxmox VE"],
  ["web", "globe", "Web"],
  ["vdi", "container", "VDI"],
];

const minor = site.version.split(".").slice(0, 2).join(".");
const releaseText = release.version === minor && release.headline ? esc(`New in ${minor}: ${release.headline}`) : "Release notes";

const hero = `
<section class="hero" aria-labelledby="hero-title">
  <div class="hero-bg" aria-hidden="true"></div>
  <div class="container hero-inner">
    <a class="pill" href="${site.release}" rel="noopener"><span class="pill-tag">v${site.version}</span><span>${releaseText}</span>${icon("arrow-right", 15)}</a>
    <h1 class="hero-title" id="hero-title">Remote access in the browser,<br> <span class="accent">without the Java stack.</span></h1>
    <p class="hero-sub">rustguac is a lightweight Rust replacement for the Apache Guacamole Java webapp. SSH, RDP, VNC, SPICE, Proxmox VE consoles, web browsing and VDI desktops through guacd, with OIDC sign-in, credentials kept in Vault and session recording built in.</p>
    <p class="prompt"><span class="prompt-sign" aria-hidden="true">&gt;_</span><span class="prompt-text">${site.motto}</span><span class="caret" aria-hidden="true"></span></p>
    <div class="hero-cta">
      <a class="btn btn-primary btn-lg" href="#quickstart">${icon("terminal", 18)}<span>Quickstart</span></a>
      <a class="btn btn-ghost btn-lg" href="${href("/docs/")}">${icon("book", 18)}<span>Read the docs</span></a>
      <a class="btn btn-ghost btn-lg" href="${site.repo}" rel="noopener">${githubMark(18)}<span>GitHub</span></a>
    </div>
    <ul class="proto-row">
      ${protoChips.map(([k, i, n]) => `<li><a href="#proto-${k}" data-proto="${k}">${icon(i, 16)}<span>${n}</span></a></li>`).join("")}
    </ul>
    <div class="hero-shot">
      ${browserShot("connections", "rustguac Connections page with folders of SSH, RDP, VNC, web and VDI entries", { url: HOST, sizes: HERO_SIZES, fetchpriority: "high", label: "Enlarge: the Connections page" })}
    </div>
  </div>
</section>

<section class="facts" aria-label="Project facts">
  <div class="container facts-inner">
    <div><strong>1</strong><span>Rust binary + guacd</span></div>
    <div><strong>7</strong><span>session types in the browser</span></div>
    <div><strong>4</strong><span>roles mapped from OIDC groups</span></div>
    <div><strong>0</strong><span>credentials sent to the browser</span></div>
  </div>
</section>`;

/* ---------- Architecture diagram (HTML, responsive, theme-aware) ---------- */
const targets = [
  ["terminal", "SSH server", "terminal + SFTP"],
  ["monitor", "RDP server", "Windows / xrdp"],
  ["desktop", "VNC server", "KVM, IPMI, VMs"],
  ["cpu", "SPICE server", "libvirt / QEMU"],
  ["server", "Proxmox VE", "VM console via API"],
  ["globe", "Xvnc + Chromium", "web sessions"],
  ["container", "Docker + xrdp", "VDI desktops"],
];
const architecture = `
<section class="section" id="architecture" aria-labelledby="arch-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Architecture</p>
      <h2 id="arch-title">One Rust binary between the browser and guacd</h2>
      <p>rustguac replaces Guacamole's Java webapp and keeps guacd, the same C protocol daemon from guacamole-server. It proxies the Guacamole protocol over WebSockets and handles sign-in, session lifecycle, recording and VDI containers.</p>
    </div>
    <figure class="arch">
      <div class="arch-flow">
        <div class="arch-node node-browser">
          <span class="node-icon">${icon("globe", 22)}</span>
          <strong>Browser</strong>
          <span class="node-sub">HTML5 client</span>
          <span class="node-note">No plugins, no client</span>
        </div>
        <div class="arch-wire"><span class="wire-label">WebSocket over HTTPS</span><span class="wire-line" aria-hidden="true"><i></i></span></div>
        <div class="arch-core">
          <div class="arch-node node-core">
            <span class="node-icon node-logo">${logoMark(34, "node-mark")}</span>
            <strong>rustguac</strong>
            <span class="node-sub">Rust · axum · single binary</span>
            <ul class="node-tags"><li>OIDC + roles</li><li>Sessions</li><li>Recording</li><li>VDI</li></ul>
          </div>
          <ul class="arch-sats">
            <li>${icon("vault", 16)}<span><strong>Vault / OpenBao</strong>credentials</span></li>
            <li>${icon("key", 16)}<span><strong>OIDC provider</strong>sign-in</span></li>
          </ul>
        </div>
        <div class="arch-wire"><span class="wire-label">TLS · Guacamole protocol</span><span class="wire-line" aria-hidden="true"><i></i></span></div>
        <div class="arch-node node-guacd">
          <span class="node-icon">${icon("cpu", 22)}</span>
          <strong>guacd</strong>
          <span class="node-sub">from guacamole-server</span>
          <span class="node-note">Bundled, loopback only</span>
        </div>
        <div class="arch-fan" aria-hidden="true"><span class="wire-line"><i></i></span></div>
        <ul class="arch-targets">
          ${targets.map(([i, t, s]) => `<li>${icon(i, 16)}<span><strong>${t}</strong>${s}</span></li>`).join("\n          ")}
        </ul>
      </div>
      <figcaption>Both links are encrypted by default: HTTPS between browsers and rustguac, TLS between rustguac and guacd. SSH, RDP, VNC, web and Proxmox sessions can also be routed through a chain of SSH jump hosts.</figcaption>
    </figure>
  </div>
</section>`;

/* ---------- Session types (vertical tabs) ---------- */
const protoMeta = {
  ssh: { icon: "terminal", doc: "/docs/overview/#ssh" },
  rdp: { icon: "monitor", doc: "/docs/rdp-video-performance/" },
  vnc: { icon: "desktop", doc: "/docs/overview/#vnc" },
  spice: { icon: "cpu", doc: "/docs/overview/#session-types" },
  proxmox: { icon: "server", doc: "/docs/overview/#session-types" },
  web: { icon: "globe", doc: "/docs/web-sessions/" },
  vdi: { icon: "container", doc: "/docs/vdi/" },
};
const protocolsSection = protocols.length
  ? `
<section class="section section-alt" id="protocols" aria-labelledby="proto-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Session types</p>
      <h2 id="proto-title">Seven ways in, one browser tab</h2>
      <p>Everything guacd speaks, plus two session types Apache Guacamole doesn't have: a hardened Chromium on the server and a Linux desktop per user.</p>
    </div>
    <div class="protos">
      <div class="proto-tabs" role="tablist" aria-label="Session types" aria-orientation="vertical">
        ${protocols
          .map((p, i) => `<button class="proto-tab" type="button" role="tab" id="pt-${p.key}" aria-controls="proto-${p.key}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ""}>${icon((protoMeta[p.key] || {}).icon || "plug", 18)}<span>${esc(p.name)}</span></button>`)
          .join("\n        ")}
      </div>
      <div class="proto-panels">
        ${protocols
          .map(
            (p, i) => `<div class="proto-panel" role="tabpanel" id="proto-${p.key}" aria-labelledby="pt-${p.key}" tabindex="0"${i ? " data-inactive" : ""}>
          <div class="proto-head"><span class="card-icon">${icon((protoMeta[p.key] || {}).icon || "plug", 22)}</span><h3>${esc(p.name)}</h3></div>
          <p class="proto-text">${hrefAll(p.text)}</p>
          <ul class="proto-bullets">${(p.bullets || []).map((b) => `<li>${icon("check", 16)}<span>${hrefAll(b)}</span></li>`).join("")}</ul>
          ${protoMeta[p.key] ? `<a class="link-arrow" href="${href(protoMeta[p.key].doc)}">${esc(p.name)} in the docs${icon("arrow-right", 16)}</a>` : ""}
        </div>`,
          )
          .join("\n        ")}
      </div>
    </div>
  </div>
</section>`
  : "";

/* ---------- Highlights ---------- */
const highlightsSection = `
<section class="section" id="features" aria-labelledby="features-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Highlights</p>
      <h2 id="features-title">Built for people who run remote access for a living</h2>
      <p>Security-first defaults, credentials that never leave the server, and a deployment you can explain in one sentence.</p>
    </div>
    <div class="cards">
      ${highlights.map((h) => `<article class="card"><div class="card-icon">${icon(h.icon, 21)}</div><h3>${esc(h.title)}</h3><p>${hrefAll(h.text)}</p></article>`).join("\n      ")}
    </div>
    <p class="section-more"><a class="link-arrow" href="${href("/features/")}">Explore every feature${icon("arrow-right", 16)}</a></p>
  </div>
</section>`;

/* ---------- Screenshot tour ---------- */
// No phone views: rustguac has no mobile layout yet (sol1/rustguac#306).
const screens = [
  { id: "ssh", label: "SSH session", d: "session-ssh", title: "A live SSH session", text: "A full terminal in the browser through guacd, with clipboard, SFTP file transfer and session controls in the side tabs." },
  { id: "websession", label: "Web session", d: "session-desktop", title: "A live web session", text: "Chromium runs on the server and streams into the browser, so internal web apps are reachable without exposing them." },
  { id: "connections", label: "Connections", d: "connections", title: "Connections", text: "Folders of SSH, RDP, VNC, SPICE, Proxmox, web and VDI entries, shown only to the OIDC groups and users each folder allows." },
  { id: "editor", label: "RDP entry", d: "connection-editor-rdp", title: "Connection editor", text: "Every per-entry setting in one form, from security mode and Kerberos to H.264 and clipboard control. Credentials are stored in Vault." },
  { id: "web", label: "Web entry", d: "connection-editor-web", title: "Web session entry", text: "Point Chromium at an internal app, restrict it to allowed domains and let it autofill credentials the user never sees." },
  { id: "vdi", label: "VDI entry", d: "connection-editor-vdi", title: "VDI desktop entry", text: "Pick the Docker image and set CPU, memory and idle limits for each user's desktop container." },
  { id: "tunnel", label: "Jump hosts", d: "ssh-tunnel", title: "Multi-hop SSH tunnels", text: "Chain bastions per entry, each hop with its own credentials, to reach targets on isolated networks." },
  { id: "sessions", label: "Sessions", d: "sessions", title: "Active sessions", text: "Live sessions with share links for control or view-only access, and watch and shadow controls for admins." },
  { id: "recordings", label: "Recordings", d: "recordings", title: "Recordings", text: "Every recorded session in one list, with playback in the browser and one-click MP4 downloads." },
  { id: "player", label: "Player", d: "recording-player", title: "Recording player", text: "Play a session back in the browser and seek through it, without exporting anything." },
  { id: "reports", label: "Reports", d: "reports", title: "Reports", text: "Summary cards, a searchable session history and top connections and users, with CSV export." },
  { id: "admin", label: "Admin", d: "admin", title: "Admin", text: "Manage users, roles and the OIDC group-to-role mappings evaluated on every login." },
].filter((s) => hasShot(s.d));

const showcase = `<div class="showcase">
  <div class="showcase-controls">
    <div class="tabs showcase-tabs" role="tablist" aria-label="Screens">
      ${screens.map((s, i) => `<button class="tab" type="button" role="tab" id="tab-${s.id}" aria-controls="panel-${s.id}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ""}>${s.label}</button>`).join("")}
    </div>
  </div>
  ${screens
    .map(
      (s, i) => `<div class="showcase-panel" role="tabpanel" id="panel-${s.id}" aria-labelledby="tab-${s.id}"${i ? " data-inactive" : ""}><figure>
    <div class="showcase-stage">
      ${browserShot(s.d, `${s.title}: rustguac ${s.label.toLowerCase()} screen`, { url: HOST, sizes: "(min-width: 1160px) 1100px, 94vw", label: `Enlarge: ${s.title}` })}
    </div>
    <figcaption><strong>${s.title}.</strong> ${s.text}</figcaption>
  </figure></div>`,
    )
    .join("\n  ")}
</div>`;

const screensSection = screens.length
  ? `
<section class="section section-alt" id="screens" aria-labelledby="screens-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Screenshots</p>
      <h2 id="screens-title">A tour of the web UI</h2>
      <p>Pick a screen, or flip this site's theme: the screenshots follow, in rustguac's own <em>aurora</em> and <em>light</em> themes.</p>
    </div>
    ${showcase}
  </div>
</section>`
  : `<div id="screens"></div>`;

/* ---------- Use cases ---------- */
const useCasesSection = useCases.length
  ? `
<section class="section" id="use-cases" aria-labelledby="uses-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Use cases</p>
      <h2 id="uses-title">Where rustguac fits</h2>
      <p>From a homelab with a Proxmox cluster to an MSP handing out access per customer.</p>
    </div>
    <div class="cards cols-3">
      ${useCases.map((u) => `<article class="card"><div class="card-icon">${icon(u.icon, 21)}</div><h3>${esc(u.title)}</h3><p>${hrefAll(u.text)}</p></article>`).join("\n      ")}
    </div>
  </div>
</section>`
  : "";

/* ---------- Security ---------- */
const hardening = (featureGroups.find((g) => g.id === "hardening") || { items: [] }).items.slice(0, 6);
const secToml = `
# config.toml: which networks each protocol may reach.
# Every list defaults to localhost only (SSRF-safe).
ssh_allowed_networks = ["127.0.0.0/8", "::1/128", "198.51.100.0/24"]
rdp_allowed_networks = ["203.0.113.0/24"]
vnc_allowed_networks = ["127.0.0.0/8", "::1/128"]
web_allowed_networks = ["127.0.0.0/8", "::1/128"]

# Per-IP limits on the API, session creation and WebSockets
rate_limit = true

[tls]
cert_path = "/opt/rustguac/tls/cert.pem"
key_path = "/opt/rustguac/tls/key.pem"
# Set this and rustguac talks TLS to guacd as well
guacd_cert_path = "/opt/rustguac/tls/cert.pem"
`;
const securitySection = `
<section class="section section-alt" id="security" aria-labelledby="sec-title">
  <div class="container sec-grid">
    <div class="sec-copy">
      <p class="eyebrow">Security</p>
      <h2 class="h2" id="sec-title">Locked down before you change a setting</h2>
      <p class="lead">Credentials stay in Vault and on the server. Network allowlists start at localhost. Both hops are encrypted. Then you open up exactly what you need.</p>
      <ul class="checklist">
        ${hardening.map((h) => `<li>${icon("check", 18)}<span><strong>${esc(h.title)}.</strong> ${hrefAll(h.text)}</span></li>`).join("\n        ")}
      </ul>
      <p class="sec-more"><a class="link-arrow" href="${href("/docs/security/")}">Read the security guide${icon("arrow-right", 16)}</a></p>
    </div>
    <div class="sec-side">
      <div class="terminal">
        <div class="terminal-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="terminal-title">/opt/rustguac/config.toml</span></div>
        <pre tabindex="0"><code>${hl(secToml, "toml")}</code></pre>
      </div>
      <a class="sec-report" href="${site.security}" rel="noopener">${icon("shield", 20)}<span><strong>Found a vulnerability?</strong>Report it privately through GitHub's private vulnerability reporting.</span>${icon("arrow-up-right", 16)}</a>
    </div>
  </div>
</section>`;

/* ---------- Quickstart ---------- */
const qsSection = quickstart.length
  ? `
<section class="section" id="quickstart" aria-labelledby="qs-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Quickstart</p>
      <h2 id="qs-title">Running in a couple of minutes</h2>
      <p>Docker anywhere, a .deb for Debian 13 (amd64 and arm64), or build it all from source. guacd is bundled every way.</p>
    </div>
    <div class="quickstart">
      <div class="terminal">
        <div class="terminal-bar">
          <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <div class="terminal-tabs" role="tablist" aria-label="Install method">
            ${quickstart.map((q, i) => `<button class="terminal-tab" type="button" role="tab" id="qt-${q.id}" aria-controls="qp-${q.id}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ""}>${esc(q.label)}</button>`).join("")}
          </div>
          <button class="copy-btn" type="button" data-copy aria-label="Copy commands">${icon("copy", 15, "i-copy")}${icon("check", 15, "i-done")}<span class="copy-label">Copy</span></button>
        </div>
        ${quickstart
          .map(
            (q, i) => `<div class="terminal-pane" role="tabpanel" id="qp-${q.id}" aria-labelledby="qt-${q.id}" tabindex="0"${i ? " data-inactive" : ""}><span class="terminal-pane-label">${esc(q.label)}</span><pre><code data-plain="${esc(plain(q.code))}">${hl(q.code, q.lang)}</code></pre>${q.note ? `<p class="terminal-note">${hrefAll(esc(q.note))}</p>` : ""}</div>`,
          )
          .join("\n        ")}
      </div>
      <div class="quickstart-notes">
        <ol class="steps">
          <li><strong>Install</strong> with Docker, the Debian package or the install script. Each one ships guacd and starts it for you.</li>
          <li><strong>Save the admin API key.</strong> It is printed once: by <code>add-admin</code>, or in the container logs on first start.</li>
          <li><strong>Connect Vault or OpenBao</strong> to turn on the Connections UI. <code>contrib/vault-quickstart.sh</code> sets one up in a single command.</li>
          <li><strong>Add OIDC</strong> and map your groups to admin, poweruser, operator and viewer.</li>
        </ol>
        <div class="quickstart-links">
          <a class="btn btn-ghost" href="${href("/docs/installation/")}">${icon("book", 16)}<span>Installation guide</span></a>
          <a class="btn btn-ghost" href="${href("/docs/deployment-guide/")}">${icon("route", 16)}<span>Production deployment</span></a>
        </div>
        <p class="note"><strong>Not on Debian 13?</strong> Use the Docker image: the packaged guacd needs FreeRDP 3.15 or newer. See <a href="${href("/docs/installation/")}">all install options</a>.</p>
      </div>
    </div>
  </div>
</section>`
  : "";

/* ---------- Comparison teaser ---------- */
const wantRows = ["Web application runtime", "Protocol daemon", "Connection credentials", "User authentication", "Web browser sessions", "VDI desktops", "Maturity"];
const teaserRows = comparison.rows.filter((r) => wantRows.includes(r.label));
const rowsToShow = teaserRows.length >= 4 ? teaserRows : comparison.rows.slice(0, 7);
const [colA, colB] = comparison.columns;
const compareSection = rowsToShow.length
  ? `
<section class="section section-alt" id="compare" aria-labelledby="compare-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Coming from Apache Guacamole?</p>
      <h2 id="compare-title">Same guacd, a different webapp</h2>
      <p>Apache Guacamole is a mature, feature-rich platform. rustguac keeps its battle-tested protocol daemon and swaps the Java stack for one Rust binary with Vault, OIDC and more session types.</p>
    </div>
    <div class="table-wrap">
      <table class="compare">
        <thead><tr><th scope="col">Area</th><th scope="col" class="col-us">${esc(colA)}</th><th scope="col">${esc(colB)}</th></tr></thead>
        <tbody>
          ${rowsToShow.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td class="col-us" data-label="${esc(colA)}">${hrefAll(r.a)}</td><td data-label="${esc(colB)}"${/^(not supported|n\/a)/i.test(r.b) ? ' class="cell-na"' : ""}>${hrefAll(r.b)}</td></tr>`).join("\n          ")}
        </tbody>
      </table>
    </div>
    <div class="compare-more">
      <a class="link-arrow" href="${href("/guacamole-alternative/")}">The full comparison${icon("arrow-right", 16)}</a>
      <a class="link-arrow" href="${href("/docs/migration/")}">Import your Guacamole connections${icon("arrow-right", 16)}</a>
    </div>
  </div>
</section>`
  : "";

/* ---------- FAQ teaser ---------- */
const pick = (re) => faqs.find((f) => re.test(f.q));
const homeFaqs = [/^What is rustguac/, /drop-in/i, /need HashiCorp Vault|need .*Vault/i, /install rustguac with Docker/i, /LDAP, SAML/i, /migrate/i]
  .map(pick)
  .filter(Boolean);
const faqSection = homeFaqs.length
  ? `
<section class="section" id="faq" aria-labelledby="faq-title">
  <div class="container narrow">
    <div class="section-head">
      <p class="eyebrow">FAQ</p>
      <h2 id="faq-title">Common questions</h2>
    </div>
    <div class="faq">
      ${homeFaqs.map((f) => `<details name="faq"><summary><h3>${f.q}</h3>${icon("chevron-down", 20)}</summary><div class="faq-a"><p>${hrefAll(f.a)}</p></div></details>`).join("\n      ")}
    </div>
    <p class="section-more"><a class="link-arrow" href="${href("/faq/")}">All questions${icon("arrow-right", 16)}</a></p>
  </div>
</section>`
  : "";

/* ---------- Commercial support (site.maintainer) ---------- */
const m = site.maintainer;
const supportPoints = [
  ["users", "Open-source specialists", `Sol1 has provided managed IT services for businesses since ${m.since}, with Linux and open-source infrastructure at the core of its work.`],
  ["server", "The stack around rustguac", "Sol1 also supports Proxmox VE, NetBox and Ansible network automation, Icinga monitoring and managed Linux firewalls."],
  ["history", "Support hours and SLAs", `Standard support runs ${m.hours}, with extended hours under a service level agreement.`],
];
const supportSection = `
<section class="section section-alt" id="support" aria-labelledby="support-title">
  <div class="container support">
    <div class="support-text">
      <p class="eyebrow">Commercial support</p>
      <h2 id="support-title">Backed by the team that builds it</h2>
      <p class="live-badge"><span class="live-dot" aria-hidden="true"></span>24 hour commercial support available</p>
      <p class="support-lead">rustguac is developed by ${m.name}, a Sydney IT company. Running it somewhere that matters? <a href="${m.contact}" rel="noopener">Have a chat with the team</a>.</p>
      <ul class="support-points">
        ${supportPoints.map(([i, t, d]) => `<li>${icon(i, 20)}<span><strong>${t}</strong>${d}</span></li>`).join("\n        ")}
      </ul>
    </div>
    <aside class="support-card" aria-label="Contact ${m.name}">
      <span class="sol1-logo support-logo" role="img" aria-label="${m.name}"></span>
      <p>Talk to ${m.name} about running rustguac in production.</p>
      <a class="btn btn-primary btn-lg" href="${m.contact}" rel="noopener">${icon("chat", 18)}<span>Contact ${m.name}</span></a>
      <ul class="support-contact">
        <li>${icon("phone", 16)}<a href="tel:${m.phone.replace(/\s/g, "")}">${m.phone.replace(/ /g, "&nbsp;")}</a></li>
        <li>${icon("history", 16)}<span>${m.hours}</span></li>
      </ul>
    </aside>
  </div>
</section>`;

/* ---------- Final CTA ---------- */
const ctaSection = `
<section class="section cta-section" id="community" aria-labelledby="community-title" data-search-ignore>
  <div class="container">
    <div class="cta">
      <div class="cta-text">
        <p class="eyebrow">Open source</p>
        <h2 id="community-title">Apache-2.0, built in the open</h2>
        <p>rustguac is developed by Sol1 and contributors on GitHub. Star the repo, report a bug, or send a pull request.</p>
        <div class="cta-buttons">
          <a class="btn btn-primary btn-lg" href="${site.repo}" rel="noopener">${githubMark(18)}<span>Star on GitHub</span></a>
          <a class="btn btn-ghost btn-lg" href="${href("/docs/")}">${icon("book", 18)}<span>Documentation</span></a>
        </div>
      </div>
      <div class="mini-cards">
        <a class="mini-card" href="${site.releases}" rel="noopener">${icon("download", 20)}<span><strong>Releases</strong>.deb packages for amd64 and arm64, and release notes.</span></a>
        <a class="mini-card" href="${site.dockerHub}" rel="noopener">${icon("container", 20)}<span><strong>Docker Hub</strong>The <code>${site.image}</code> image, guacd included.</span></a>
        <a class="mini-card" href="${site.issues}" rel="noopener">${icon("bug", 20)}<span><strong>Issues</strong>Report a bug or request a feature.</span></a>
        <a class="mini-card" href="${site.security}" rel="noopener">${icon("shield", 20)}<span><strong>Security</strong>Private vulnerability reporting.</span></a>
      </div>
    </div>
  </div>
</section>`;

const body = [hero, architecture, protocolsSection, highlightsSection, screensSection, securitySection, qsSection, useCasesSection, compareSection, faqSection, supportSection, ctaSection].join("\n");

export default {
  slug: "home",
  path: "/",
  title: "rustguac: lightweight Rust alternative to Apache Guacamole",
  description:
    "Browser-based SSH, RDP, VNC, SPICE, Proxmox VE, web and VDI sessions through guacd. A single Rust binary with OIDC, Vault-backed credentials and recording.",
  modified: site.released,
  priority: "1.0",
  changefreq: "weekly",
  lightbox: true,
  searchSection: "Home",
  images: ["connections", "sessions", "recordings", "reports", "admin"].filter(hasShot),
  og: {
    eyebrow: "Open-source remote access gateway",
    title: "Remote access in the browser, <em>without the Java stack.</em>",
    sub: "SSH, RDP, VNC, SPICE, Proxmox VE, web and VDI sessions through guacd. One Rust binary.",
    shot: "connections",
  },
  ogAlt: "rustguac: remote access in the browser, without the Java stack",
  about: { "@id": ids.app },
  mainEntity: { "@id": ids.app },
  schema: [softwareNode(), sourceNode()],
  body,
};
