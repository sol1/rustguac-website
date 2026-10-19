import { site, href, hrefAll } from "../site.mjs";
import { icon } from "../icons.mjs";
import { browserShot, hasShot, ids, esc } from "../layout.mjs";
import { featureGroups } from "../data.mjs";

// Presentation per group id (the copy itself lives in content.mjs).
const GROUP = {
  identity: { icon: "users", short: "Identity", shot: "tokens", alt: "Personal API tokens, each capped at a maximum role" },
  credentials: { icon: "vault", short: "Vault", shot: "credentials", alt: "My Credentials page where each user fills in credential variables once" },
  network: { icon: "route", short: "Networks", shot: "ssh-tunnel", alt: "SSH tunnel settings with a chain of jump hosts on a connection entry" },
  hardening: { icon: "shield", short: "Hardening" },
  recording: { icon: "film", short: "Recording", shot: "recording-player", alt: "Recording player playing back a session in the browser" },
  collaboration: { icon: "share", short: "Sharing", shot: "sessions", alt: "Sessions page with active sessions and share links" },
  "web-vdi": { icon: "container", short: "Web + VDI", shot: "connection-editor-vdi", alt: "VDI connection entry with image, CPU, memory and idle timeout settings" },
  performance: { icon: "gauge", short: "RDP video", shot: "connection-editor-rdp", alt: "RDP connection entry with H.264 and display settings" },
  operations: { icon: "workflow", short: "Operations", shot: "themes", alt: "The rustguac Connections page in four built-in themes: aurora, light, nord and jaguar" },
};
const meta = (g) => GROUP[g.id] || { icon: g.icon || "sparkles", short: g.short || g.title };

const body = `
<section class="page-hero">
  <div class="hero-bg" aria-hidden="true"></div>
  <div class="container">
    <p class="eyebrow">Features</p>
    <h1>Everything rustguac does, in one place</h1>
    <p class="page-lead">Seven session types through guacd, OIDC sign-in with four roles, credentials kept in Vault or OpenBao, multi-hop SSH tunnels, recording and reports, all from a single Rust binary. Every item links to the documentation that backs it.</p>
    <nav class="jump" aria-label="On this page" data-search-ignore>
      ${featureGroups.map((g) => `<a href="#${g.id}">${icon(meta(g).icon, 16)}${esc(meta(g).short)}</a>`).join("")}
    </nav>
  </div>
</section>

${featureGroups
  .map((g, i) => {
    const m = meta(g);
    const withShot = m.shot && hasShot(m.shot);
    return `<section class="section feature-group${i % 2 ? " section-alt" : ""}" aria-labelledby="${g.id}">
  <div class="container">
    <div class="group-head">
      <div class="card-icon">${icon(m.icon, 22)}</div>
      <div>
        <h2 id="${g.id}">${esc(g.title)}</h2>
        <p>${hrefAll(g.lead)}</p>
      </div>
    </div>
    <div class="group-body${withShot ? " has-shot" : ""}">
      <dl class="feature-list">
        ${g.items
          .map(
            (it) => `<div class="feature-item"><dt>${icon(it.icon || "check", 18)}<span>${esc(it.title)}</span></dt><dd>${hrefAll(it.text)}${it.doc ? ` <a class="feature-doc" href="${href(it.doc)}">Docs${icon("arrow-right", 14)}</a>` : ""}</dd></div>`,
          )
          .join("\n        ")}
      </dl>
      ${withShot ? `<figure class="group-shot">${browserShot(m.shot, m.alt, { sizes: "(min-width: 1160px) 560px, 94vw", label: `Enlarge: ${m.alt}` })}<figcaption>${esc(m.alt)}.</figcaption></figure>` : ""}
    </div>
  </div>
</section>`;
  })
  .join("\n")}

<section class="section cta-section" data-search-ignore>
  <div class="container cta-slim">
    <h2>Try it on your own network</h2>
    <p>One Docker command or one .deb, with guacd included. Then point it at Vault and your OIDC provider.</p>
    <div class="cta-buttons">
      <a class="btn btn-primary btn-lg" href="${href("/#quickstart")}">${icon("terminal", 18)}<span>Quickstart</span></a>
      <a class="btn btn-ghost btn-lg" href="${href("/docs/")}">${icon("book", 18)}<span>Read the docs</span></a>
    </div>
  </div>
</section>
`;

export default {
  slug: "features",
  path: "/features/",
  title: "rustguac features: SSH, RDP, VDI, Vault, OIDC and recording",
  description:
    "Every rustguac feature: SSH, RDP, VNC, SPICE, Proxmox, web and VDI sessions, OIDC roles, Vault-backed credentials, SSH tunnels, recording, reports and the API.",
  modified: site.released,
  priority: "0.9",
  changefreq: "monthly",
  lightbox: true,
  searchSection: "Features",
  breadcrumbs: [{ name: "Features", path: "/features/" }],
  images: ["tokens", "credentials", "ssh-tunnel", "recording-player", "sessions", "connection-editor-vdi"].filter(hasShot),
  og: {
    eyebrow: "Features",
    title: "Seven session types. <em>One Rust binary.</em>",
    sub: "OIDC roles, Vault-backed credentials, SSH tunnels, recording, reports and a REST API.",
    shot: "connection-editor-rdp",
  },
  about: { "@id": ids.app },
  body,
};
