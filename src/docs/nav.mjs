// Docs sidebar: sections and ordering. Mirrors the "Documentation" grouping in
// the upstream README (Getting started / Features / Integration & reference),
// with Overview first, Reverse proxies next to the deployment guide and Themes
// under Features. Descriptions paraphrase the README's one-liners (or the doc's
// own intro where the README has none), so every claim is backed upstream.
//
// Each doc: { slug, title (short sidebar/card title), description (one line), icon }
//   issue: an upstream issue proposing the page; it is listed only while
//          content/docs/ or content/docs-overlay/ has the markdown.
// The page <h1> comes from the markdown itself.

import { existsSync } from "node:fs";

const hasMarkdown = (slug) =>
  ["../../content/docs/", "../../content/docs-overlay/"].some((dir) => existsSync(new URL(`${dir}${slug}.md`, import.meta.url)));

const allSections = [
  {
    id: "getting-started",
    title: "Getting started",
    icon: "zap",
    blurb: "What rustguac is, how to install it, configure it and put it into production.",
    docs: [
      { slug: "overview", title: "Overview", icon: "book", description: "What rustguac is, how it compares to Apache Guacamole, architecture and session types." },
      { slug: "installation", title: "Installation", icon: "download", description: "Debian packages, Docker, bare-metal, RPM from source and development builds." },
      { slug: "configuration", title: "Configuration", icon: "settings", description: "The TOML config reference, with every section and setting." },
      { slug: "deployment-guide", title: "Deployment guide", icon: "server", description: "Step-by-step production setup: HAProxy, OIDC, Vault, Knocknoc, drives and recording." },
      { slug: "reverse-proxies", title: "Reverse proxies", icon: "route", description: "HAProxy, nginx, Caddy, Apache and Traefik in front of rustguac, and the %2F gotcha." },
    ],
  },
  {
    id: "features",
    title: "Features",
    icon: "layers",
    blurb: "Roles, web and VDI sessions, RDP video, credentials, reports and themes.",
    docs: [
      { slug: "roles-and-access-control", title: "Roles & access control", icon: "users", description: "OIDC, the 4-tier role hierarchy, group mappings, folder access and API tokens." },
      { slug: "web-sessions", title: "Web browser sessions", icon: "globe", description: "Chromium sessions with autofill, domain allowlisting and login scripts." },
      { slug: "spice-and-proxmox", title: "SPICE & Proxmox VE", icon: "monitor", description: "SPICE displays and Proxmox VE VM consoles: API tokens, one-time tickets, TLS pinning and tunnels." },
      { slug: "vdi", title: "VDI desktop containers", icon: "container", description: "Ephemeral Docker desktops: image requirements, lifecycle and persistent homes." },
      { slug: "rdp-video-performance", title: "RDP video performance", icon: "gauge", description: "H.264 passthrough, the GFX pipeline, and Windows and xrdp tuning." },
      { slug: "rdp-h264", title: "RDP H.264 passthrough", icon: "film", description: "Enabling H.264 passthrough and the Windows host settings it requires." },
      { slug: "credential-variables", title: "Credential variables", icon: "key", description: "Shared credentials across connection entries, stored per user in Vault." },
      { slug: "reports", title: "Reports", icon: "chart", description: "Session analytics, history, leaderboards and CSV export." },
      { slug: "themes", title: "Themes", icon: "palette", description: "Built-in colour presets, per-user switching and your own brand themes." },
    ],
  },
  {
    id: "integration-reference",
    title: "Integration & reference",
    icon: "plug",
    blurb: "Vault, SSO, NetBox, security hardening, the REST API and migrating from Guacamole.",
    docs: [
      { slug: "integrations", title: "Integrations", icon: "plug", seoFromNav: true, description: "OIDC SSO, Vault/OpenBao, SSH tunnels, Kerberos, HAProxy, Knocknoc and LUKS drives." },
      { slug: "netbox", title: "NetBox", icon: "network", description: "One-click consoles and connections sync via custom fields and webhooks." },
      { slug: "security", title: "Security", icon: "shield", description: "TLS, network allowlists, rate limiting, headers, audit logging and hardening." },
      { slug: "api", title: "API reference", icon: "code", description: "REST endpoints, the session connection flow and headless ws-ticket integration." },
      { slug: "migration", title: "Migration from Guacamole", icon: "workflow", description: "Import connections from an Apache Guacamole MySQL/MariaDB database into Vault." },
    ],
  },
];

export const sections = allSections.map((s) => ({ ...s, docs: s.docs.filter((d) => !d.issue || hasMarkdown(d.slug)) }));

/** Flat, ordered list of docs with their section attached. */
export const flatDocs = sections.flatMap((s) => s.docs.map((d) => ({ ...d, section: s })));

export const docBySlug = Object.fromEntries(flatDocs.map((d) => [d.slug, d]));

/** Quick-start path on the docs home. */
export const quickPath = [
  { slug: "installation", step: "Install", text: "Debian package, Docker image or the install script." },
  { slug: "configuration", step: "Configure", text: "One TOML file: TLS, OIDC, Vault, recording and more." },
  { slug: "deployment-guide", step: "Deploy", text: "Behind HAProxy with SSO, Vault and a locked-down network." },
];

/** Popular destinations on the docs home (anchors are verified at build time). */
export const popular = [
  { slug: "integrations", hash: "vault--openbao-connections", title: "Set up Vault / OpenBao connections" },
  { slug: "integrations", hash: "oidc-single-sign-on", title: "OIDC single sign-on" },
  { slug: "roles-and-access-control", hash: "group-to-role-mappings", title: "Map OIDC groups to roles" },
  { slug: "installation", hash: "option-c-docker", title: "Run with Docker" },
  { slug: "reverse-proxies", hash: "the-2f-gotcha", title: "Reverse proxies and the %2F gotcha" },
  { slug: "web-sessions", hash: "native-autofill", title: "Web session autofill" },
  { slug: "api", hash: "connecting-to-a-session", title: "Connect to a session via the API" },
  { slug: "migration", hash: "", title: "Migrate from Apache Guacamole" },
];
