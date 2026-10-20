// Page copy reused across the site. Data only: no imports, no side effects.
//
// Every claim here is backed by rustguac's README, docs/*.md, config.example.toml,
// packaging (Dockerfile, install.sh, debian/) or the GitHub release notes for the
// synced release (content/docs/_source.json). Keep it that way when editing: if upstream doesn't say it,
// the site doesn't either.
//
// LINKS: internal links are written as root-relative paths ("/docs/<slug>/#anchor").
// CORE passes every `doc` value and every `href="/..."` inside HTML strings through
// href() so the GitHub Pages base path is prepended. Do not prefix them here.
// Anchors follow the GitHub heading-slug algorithm applied to the upstream docs.
// External links point at github.com/sol1/rustguac only.

const GH = "https://github.com/sol1/rustguac";

// Headline for the latest release on the home page pill. It only shows while `version`
// matches the synced release's major.minor, so it never advertises an older release.
export const release = {
  version: "1.13",
  headline: "Connect to a host with the full Connections editor, and SPICE TLS fixes",
};

/* Home page highlight cards (6-8). */
export const highlights = [
  {
    icon: "zap",
    title: "No Java, no Tomcat",
    text: "A single Rust binary in front of guacd, the same battle-tested protocol daemon Apache Guacamole uses. Install from a .deb, a Docker image or one script.",
  },
  {
    icon: "layers",
    title: "Seven session types",
    text: "SSH, RDP, VNC, SPICE, Proxmox VE consoles, headless Chromium web sessions and per-user Docker VDI desktops, all in the browser with no client software.",
  },
  {
    icon: "vault",
    title: "Credentials stay in Vault",
    text: "Connections and their secrets live in HashiCorp Vault or OpenBao KV v2. They are read server-side and never reach the browser.",
  },
  {
    icon: "key",
    title: "OIDC SSO and four roles",
    text: "Sign in with Authentik, Keycloak, Okta, Entra ID, Google or any OpenID Connect provider. OIDC groups map to admin, poweruser, operator and viewer.",
  },
  {
    icon: "route",
    title: "Multi-hop SSH tunnels",
    text: "Chain jump hosts to reach isolated networks for SSH, RDP, VNC, web and Proxmox sessions, with per-hop credentials kept in Vault.",
  },
  {
    icon: "film",
    title: "Recording you can hand over",
    text: "Every session recorded in Guacamole format with an in-app player, disk rotation, one-click MP4 downloads and plain-text SSH typescripts.",
  },
  {
    icon: "shield",
    title: "Locked down by default",
    text: "TLS to the browser and to guacd, localhost-only CIDR allowlists out of the box, per-entry clipboard control, rate limiting and strict framing rules.",
  },
  {
    icon: "gauge",
    title: "H.264 straight to the browser",
    text: "Opt-in RDP H.264 passthrough forwards the server's stream to WebCodecs instead of re-encoding every frame, with AVC444 for crisp text.",
  },
];

/* Session types: ssh rdp vnc spice proxmox web vdi. */
export const protocols = [
  {
    key: "ssh",
    name: "SSH",
    text: "A browser terminal rendered by guacd's SSH plugin (xterm-256color), with file transfer straight to the target.",
    bullets: [
      "Password, private key or an ephemeral Ed25519 keypair generated per session",
      "SFTP between the browser and the target, with no files stored on the rustguac server",
      "Optional plain-text typescript recording per connection",
      "Per-entry font size, and multi-hop jump hosts",
    ],
  },
  {
    key: "rdp",
    name: "RDP",
    text: "Windows and Linux desktops with auto-fit resize, from plain password logins to Kerberos and RemoteApp.",
    bullets: [
      "Kerberos NLA authentication, domain logins and security mode settings",
      "RemoteApp (RAIL), keyboard layout and Wake-on-LAN per entry",
      "H.264 passthrough and the GFX pipeline for smooth video",
      "Drive redirection with optional LUKS-encrypted per-session storage",
    ],
  },
  {
    key: "vnc",
    name: "VNC",
    text: "Connect to any VNC server: KVM and IPMI consoles, existing remote desktops and virtual machine displays.",
    bullets: [
      "Password auth, VeNCrypt and macOS Screen Sharing logins, and UltraVNC's Windows login for Active Directory accounts",
      "Network presets for LAN, WAN and slow links set the encodings, compression and JPEG quality",
      "Per-entry clipboard copy and paste control",
      "Fits the remote screen to the window or shows it at actual size with scroll bars, or resizes servers with their own virtual screen",
      "Reachable through multi-hop SSH tunnels",
    ],
  },
  {
    key: "spice",
    name: "SPICE",
    text: "Direct SPICE displays for libvirt and QEMU consoles.",
    bullets: [
      "TLS with CA verification and certificate-subject pinning",
      "SPICE proxy support",
      "Checked against the VNC/SPICE network allowlist",
    ],
  },
  {
    key: "proxmox",
    name: "Proxmox VE",
    text: "VM consoles brokered through the Proxmox VE API, so only an API token is ever stored.",
    bullets: [
      "One-time SPICE tickets fetched from the PVE spiceproxy API at connect time",
      "Cluster node auto-detected from the VM ID",
      "SSH-tunnel aware, including the API and console hops",
      "Token needs only VM.Console (plus VM.Audit for node auto-detect)",
    ],
  },
  {
    key: "web",
    name: "Web",
    text: "A real Chromium browser running headless on Xvnc on the server, streamed to the user's own browser.",
    bullets: [
      "Native autofill from Vault credentials, so passwords never reach the user",
      "Per-entry domain allowlisting and login scripts (CDP-based, e.g. Playwright)",
      "Isolated profile per session, deleted when the session ends",
      "Chromium managed policy blocks downloads, file dialogs, DevTools UI and extensions",
    ],
  },
  {
    key: "vdi",
    name: "VDI",
    text: "Ephemeral Docker desktop containers, one per user, running xrdp and a Linux desktop. Bring your own image.",
    bullets: [
      "Persist after disconnect and are cleaned up after an idle timeout",
      "Logging out of the desktop stops the container; closing the tab keeps it",
      "Persistent home directories bind-mounted per user",
      "Per-entry CPU, memory and idle limits, plus an image allowlist",
    ],
  },
];

/* Full catalog for /features/. Each group becomes a section with an anchor. */
export const featureGroups = [
  {
    id: "identity",
    title: "Identity and access control",
    lead: "Bring your OpenID Connect provider, map its groups to four roles, and decide folder by folder who sees what.",
    items: [
      {
        icon: "key",
        title: "OIDC single sign-on",
        text: "Any OpenID Connect provider, with PKCE and nonce validation. Authentik, Google, Okta, Keycloak and JumpCloud are tested, with step-by-step guides for Authentik and Microsoft Entra ID.",
        doc: "/docs/integrations/#oidc-single-sign-on",
      },
      {
        icon: "users",
        title: "Four-tier roles",
        text: "admin, poweruser, operator and viewer. Each role includes everything below it, from read-only viewing up to managing users, connections and tokens.",
        doc: "/docs/roles-and-access-control/#role-hierarchy",
      },
      {
        icon: "workflow",
        title: "Group-to-role mappings",
        text: "OIDC groups are evaluated on every login and the highest matching role wins. Manage mappings in the Admin page, the API or with rustguac map-group.",
        doc: "/docs/roles-and-access-control/#group-to-role-mappings-1",
      },
      {
        icon: "folder",
        title: "Folder access by group or user",
        text: "Each Connections folder lists allowed OIDC groups and individual users. Folders you can't open are hidden, not shown-then-denied, and subfolders can inherit or stand alone.",
        doc: "/docs/roles-and-access-control/#folder-access-control",
      },
      {
        icon: "user-check",
        title: "Only the users you add",
        text: "Set auto_create_users = false and only accounts an admin has added can sign in. Logins are bound to the provider's permanent subject, not just an email.",
        doc: "/docs/roles-and-access-control/#only-users-you-have-added",
      },
      {
        icon: "ticket",
        title: "API keys and user tokens",
        text: "SHA-256 hashed admin API keys with IP allowlists and expiry, plus rgu_-prefixed personal tokens capped at a max role and fully audited.",
        doc: "/docs/roles-and-access-control/#user-api-tokens-1",
      },
    ],
  },
  {
    id: "credentials",
    title: "Connections and credentials in Vault",
    lead: "Connection entries and their secrets live in HashiCorp Vault or OpenBao KV v2, read server-side and never sent to the browser.",
    items: [
      {
        icon: "vault",
        title: "Vault or OpenBao KV v2",
        text: "Folders, entries and credentials stored under a dedicated path with AppRole auth, optional mTLS and Vault Enterprise / OpenBao namespaces.",
        doc: "/docs/integrations/#vault--openbao-connections",
      },
      {
        icon: "zap",
        title: "One-command Vault setup",
        text: "contrib/vault-quickstart.sh detects vault or bao and provisions an existing server, a throwaway dev server, or a local systemd install with auto-unseal.",
        doc: "/docs/integrations/#quickstart-script",
      },
      {
        icon: "fingerprint",
        title: "Workload JWT login",
        text: "New in 1.12: log into Vault with a short-lived Kubernetes service-account token, Nomad workload identity or SPIRE JWT-SVID instead of a stored AppRole secret.",
        doc: "/docs/integrations/#workload-jwt-authentication",
      },
      {
        icon: "cloud",
        title: "Multiple Vaults for DR",
        text: "Give the shared and instance scopes their own Vault so a central outage doesn't take local connections down. vault-migrate copies a scope between backends.",
        doc: "/docs/configuration/#multiple-vault-backends-disaster-recovery",
      },
      {
        icon: "keyboard",
        title: "Credential variables",
        text: "Entries reference $corp_username and $corp_password; each user fills them in once under My Credentials. Similar to Guacamole's LDAP passthrough, without binding to LDAP.",
        doc: "/docs/credential-variables/#how-it-works",
      },
      {
        icon: "layers",
        title: "Folder default credentials",
        text: "A folder can lend a username, password, key or domain per session type to entries with none of their own, so imported or webhook-created entries connect straight away.",
        doc: "/docs/credential-variables/#folder-default-credentials",
      },
    ],
  },
  {
    id: "network",
    title: "Reach isolated networks safely",
    lead: "Get to targets behind bastions without opening them up, and keep rustguac itself from becoming a pivot.",
    items: [
      {
        icon: "route",
        title: "Multi-hop SSH tunnels",
        text: "Chain one or more bastions per connection entry or per ad-hoc session. Each hop has its own password or key, stored in Vault and never sent to the browser.",
        doc: "/docs/integrations/#ssh-tunnel--multi-hop-jump-hosts",
      },
      {
        icon: "network",
        title: "CIDR allowlists per protocol",
        text: "SSH, RDP, VNC/SPICE and web targets are checked against their own allowlists before connecting. All four default to localhost only, which blocks SSRF out of the box.",
        doc: "/docs/security/#network-allowlists-ssrf-protection",
      },
      {
        icon: "shield",
        title: "Policy for ad-hoc sessions",
        text: "Sessions a poweruser creates themselves can't switch off site-wide recording, enable a disabled drive, borrow a fixed VDI account or exceed the VDI resource defaults.",
        doc: "/docs/security/#ad-hoc-sessions-from-non-admins",
      },
      {
        icon: "lock",
        title: "Kerberos NLA for RDP",
        text: "Authenticate RDP sessions with Kerberos, configured per entry, with three ways to discover the KDC.",
        doc: "/docs/integrations/#rdp-kerberos-nla-authentication",
      },
      {
        icon: "server",
        title: "HAProxy and Knocknoc",
        text: "Production-ready HAProxy examples, plus Knocknoc identity-aware access that hides the login page from scanners until a user has authenticated.",
        doc: "/docs/integrations/#knocknoc-zero-trust-access",
      },
      {
        icon: "plug",
        title: "Any reverse proxy",
        text: "Recipes for HAProxy, nginx, Caddy, Apache mod_proxy and Traefik, including the %2F gotcha for nested folders and trusted-proxy client IPs.",
        doc: "/docs/reverse-proxies/#haproxy-recommended",
      },
    ],
  },
  {
    id: "hardening",
    title: "Hardened by default",
    lead: "Secure defaults throughout, documented in a dedicated security guide and backed by a private vulnerability reporting policy.",
    items: [
      {
        icon: "lock",
        title: "TLS on both links",
        text: "HTTPS to browsers via rustls, and TLS between rustguac and guacd, which listens on loopback only. Or terminate TLS at your reverse proxy.",
        doc: "/docs/security/#tls-encryption",
      },
      {
        icon: "gauge",
        title: "Rate limiting",
        text: "OIDC login is always limited per client IP. Turn on rate_limit for per-IP limits on the API, session creation and WebSockets.",
        doc: "/docs/security/#rate-limiting",
      },
      {
        icon: "clipboard",
        title: "Per-entry clipboard control",
        text: "Disable copy, paste or both on any connection for data loss prevention, using guacd's native disable-copy and disable-paste.",
        doc: "/docs/security/#clipboard-control",
      },
      {
        icon: "eye",
        title: "Anti-clickjacking",
        text: "No page can be framed by another site. Only sessions from entries an admin marks fullscreen-on-connect may be framed, and only by rustguac itself.",
        doc: "/docs/security/#framing-and-clickjacking",
      },
      {
        icon: "globe",
        title: "Hardened Chromium",
        text: "Web sessions run with Chromium's sandbox, a managed policy that blocks downloads, file dialogs and extensions, and a fresh profile per session.",
        doc: "/docs/security/#web-session-hardening",
      },
      {
        icon: "scroll",
        title: "Audit trails",
        text: "Authentication, session and admin events are logged with client IPs. Token operations and administrative CLI actions each get their own audit table.",
        doc: "/docs/security/#audit-logging",
      },
    ],
  },
  {
    id: "recording",
    title: "Recording, reports and compliance",
    lead: "Know who connected where, for how long, and what happened on screen.",
    items: [
      {
        icon: "film",
        title: "Session recording",
        text: "Recordings in the standard Guacamole format, played back in the browser, with disk-usage rotation, a global cap and per-entry limits.",
        doc: "/docs/configuration/#recording-section",
      },
      {
        icon: "download",
        title: "MP4 downloads",
        text: "New in 1.12: one click converts a recording to MP4 in the background with guacenc, under the same access rules as the recording itself.",
        doc: "/docs/configuration/#mp4-downloads",
      },
      {
        icon: "terminal",
        title: "SSH typescripts",
        text: "Opt-in, per-connection plain-text terminal logs compatible with script and scriptreplay. Listed in the UI but never downloadable through it.",
        doc: "/docs/configuration/#ssh-typescript-recording",
      },
      {
        icon: "lock",
        title: "Encrypted at rest",
        text: "Point typescripts at the LUKS-encrypted volume rustguac already manages, with the key held in Vault.",
        doc: "/docs/configuration/#encryption-at-rest-luks",
      },
      {
        icon: "chart",
        title: "Reports",
        text: "Summary cards, a searchable session history and leaderboards for top connections and users, for powerusers and above.",
        doc: "/docs/reports/#summary-cards",
      },
      {
        icon: "file-text",
        title: "CSV export",
        text: "Export filtered session history (user, entry, type, date range) as CSV with UTC ISO 8601 timestamps, from the UI or the API.",
        doc: "/docs/reports/#csv-export",
      },
    ],
  },
  {
    id: "collaboration",
    title: "Sharing and file transfer",
    lead: "Work on a session together, watch one live, and move files without leaving the browser.",
    items: [
      {
        icon: "share",
        title: "Share links",
        text: "Every shareable session has two links: one with keyboard and mouse control, and a separate view-only token that guacd enforces.",
        doc: "/docs/security/#session-security",
      },
      {
        icon: "eye",
        title: "Admin shadowing",
        text: "Admins watch or join live sessions through shadow tokens, optionally read-only. Only a session's creator can make its first connection.",
        doc: "/docs/api/#post-apisessionsidshadow",
      },
      {
        icon: "monitor",
        title: "Live thumbnails",
        text: "An Active Sessions section shows previews refreshed every 10 seconds, including dormant VDI desktops. Click one to reconnect.",
        doc: "/docs/vdi/#active-sessions",
      },
      {
        icon: "folder",
        title: "RDP drive redirection",
        text: "File transfer through a per-session directory on the rustguac server, removed when the session ends by default, with upload and download switchable separately.",
        doc: "/docs/integrations/#rdp-drive-redirection",
      },
      {
        icon: "lock",
        title: "LUKS-encrypted drives",
        text: "Put drive storage on a LUKS volume whose key is held in Vault and passed to cryptsetup on stdin, never on disk.",
        doc: "/docs/integrations/#luks-encryption",
      },
      {
        icon: "terminal",
        title: "SFTP for SSH",
        text: "Transfer files directly between the browser and the SSH target, with nothing stored on the rustguac host.",
        doc: "/docs/integrations/#ssh-sftp",
      },
    ],
  },
  {
    id: "web-vdi",
    title: "Web sessions and VDI desktops",
    lead: "Two session types Apache Guacamole doesn't have: a locked-down browser on the server, and a Linux desktop per user on demand.",
    items: [
      {
        icon: "globe",
        title: "Native autofill",
        text: "Chromium fills in credentials from Vault, so users land on an authenticated page without ever seeing the password.",
        doc: "/docs/web-sessions/#native-autofill",
      },
      {
        icon: "search",
        title: "Domain allowlisting",
        text: "Lock a web entry to specific domains (subdomains included). Everything else is blocked from resolving inside Chromium.",
        doc: "/docs/web-sessions/#domain-allowlisting",
      },
      {
        icon: "code",
        title: "Login scripts",
        text: "Automate multi-step logins over the Chrome DevTools Protocol, with Playwright and shell examples in the docs.",
        doc: "/docs/web-sessions/#login-scripts",
      },
      {
        icon: "container",
        title: "Container lifecycle",
        text: "A container per user, reused on reconnect, kept through tab closes and network drops, removed on desktop logout or idle timeout.",
        doc: "/docs/vdi/#container-lifecycle",
      },
      {
        icon: "database",
        title: "Persistent homes",
        text: "Set home_base and each user's home directory is bind-mounted into their container, surviving restarts.",
        doc: "/docs/vdi/#persistent-home-directories",
      },
      {
        icon: "cpu",
        title: "Limits and guard rails",
        text: "Per-entry CPU, memory and idle limits, an allowed_images list, no --privileged, and an RDP password generated per session.",
        doc: "/docs/vdi/#per-entry-settings",
      },
    ],
  },
  {
    id: "performance",
    title: "RDP video performance",
    lead: "Smooth desktops and video without burning a CPU core per session.",
    items: [
      {
        icon: "gauge",
        title: "H.264 passthrough",
        text: "guacd forwards the RDP server's H.264 to the browser's WebCodecs decoder instead of re-encoding frames as JPEG/WebP. Opt-in per connection.",
        doc: "/docs/rdp-h264/#h264-passthrough-for-rdp",
      },
      {
        icon: "monitor",
        title: "AVC444 full colour",
        text: "Both AVC444 views are combined in a WebGL2 pass for true 4:4:4 chroma, so ClearType text keeps its colour detail. Falls back to 4:2:0 without WebGL2.",
        doc: "/docs/rdp-video-performance/#enable-avc-444-h264-full-colour",
      },
      {
        icon: "settings",
        title: "Windows host settings",
        text: "The Windows 11 host settings that make RDP send H.264, and how to verify passthrough is engaged.",
        doc: "/docs/rdp-h264/#windows-11-host-settings",
      },
      {
        icon: "server",
        title: "xrdp tuning",
        text: "Rebuild xrdp with x264 on Debian 13 for the GFX pipeline, with audio redirection and NVIDIA acceleration guides.",
        doc: "/docs/rdp-video-performance/#linux-xrdp-tuning-debian-13",
      },
    ],
  },
  {
    id: "operations",
    title: "Integrations and operations",
    lead: "Automate it, embed it, theme it, and move off Guacamole without retyping a connection.",
    items: [
      {
        icon: "code",
        title: "REST API",
        text: "Sessions, recordings, users, group mappings, connections and tokens are all available over a documented REST API.",
        doc: "/docs/api/#sessions",
      },
      {
        icon: "ticket",
        title: "Headless ws-ticket flow",
        text: "A backend creates a session with its API key, mints a single-use 30-second ticket, and sends the browser to a ready-to-open URL. The key never leaves the backend.",
        doc: "/docs/api/#headless-api-integration",
      },
      {
        icon: "database",
        title: "NetBox sync",
        text: "One-click console links on device pages and webhook-driven Connections sync, using NetBox's built-in custom fields, links and event rules. No plugin needed.",
        doc: "/docs/netbox/#webhook-driven-connections-sync",
      },
      {
        icon: "history",
        title: "Import from Guacamole",
        text: "import-guacamole reads a MySQL/MariaDB dump and writes SSH, RDP and VNC connections into Vault, with a dry run and token mapping.",
        doc: "/docs/migration/#step-1-export-the-guacamole-database",
      },
      {
        icon: "palette",
        title: "Themes",
        text: "Eight built-in presets, per-colour overrides and your own logo in config.toml, or drop in a .toml theme with no recompile.",
        doc: "/docs/themes/#built-in-presets",
      },
      {
        icon: "copy",
        title: "Bulk move, copy and delete",
        text: "Re-file many entries at once with credentials kept intact, from the UI or POST /api/addressbook/bulk, all recorded in the address book audit log.",
        doc: "/docs/api/#post-apiaddressbookbulk-admin",
      },
    ],
  },
];

/* rustguac vs Apache Guacamole. Sourced from docs/overview.md "Key differences"
   and docs/migration.md. Keep it balanced: say where Guacamole has more. */
export const comparison = {
  columns: ["rustguac", "Apache Guacamole"],
  rows: [
    {
      label: "Web application runtime",
      a: "Rust, single binary",
      b: "Java (Tomcat + Guice + Jersey)",
    },
    {
      label: "Protocol daemon",
      a: "guacd from guacamole-server, bundled",
      b: "guacd from guacamole-server",
      note: "Same daemon, same Guacamole wire protocol and JavaScript client library.",
    },
    {
      label: "Application database",
      a: "SQLite, embedded",
      b: "MySQL / PostgreSQL",
    },
    {
      label: "Connection credentials",
      a: "Vault / OpenBao KV v2, server-side only",
      b: "Database tables",
      note: "rustguac needs Vault or OpenBao for its Connections UI; without it only ad-hoc API sessions are available.",
    },
    {
      label: "User authentication",
      a: "OIDC SSO, API keys, user API tokens",
      b: "LDAP, RADIUS, TOTP, SAML, database",
      note: "Guacamole supports more authentication back ends. rustguac relies on your OIDC provider for MFA and directory integration.",
    },
    {
      label: "Session types",
      a: "SSH, RDP, VNC, SPICE, Proxmox VE, web, VDI",
      b: "SSH, RDP, VNC, telnet, Kubernetes and others",
      note: "rustguac's importer skips telnet and Kubernetes connections.",
    },
    {
      label: "Web browser sessions",
      a: "Headless Chromium on Xvnc, with autofill and domain allowlists",
      b: "Not supported",
    },
    {
      label: "VDI desktops",
      a: "Ephemeral Docker container per user",
      b: "Not supported",
    },
    {
      label: "Multi-hop SSH tunnels",
      a: "Chain bastions per entry or session",
      b: "Not supported",
    },
    {
      label: "Ephemeral SSH keys",
      a: "Ed25519 keypair per session",
      b: "Not supported",
    },
    {
      label: "Network allowlists",
      a: "CIDR allowlists per protocol",
      b: "Not supported",
    },
    {
      label: "Rate limiting",
      a: "Per-IP, per-endpoint",
      b: "Not built in",
    },
    {
      label: "Clipboard control",
      a: "Disable copy and/or paste per entry",
      b: "Not per-connection",
    },
    {
      label: "File transfer encryption",
      a: "LUKS with keys in Vault",
      b: "Not supported",
    },
    {
      label: "Session sharing",
      a: "Control and view-only share links, admin shadowing",
      b: "Connection sharing",
    },
    {
      label: "Recording",
      a: "Guacamole format, in-app player, MP4 download, SSH typescripts",
      b: "Guacamole format",
    },
    {
      label: "Maturity",
      a: "Newer project; built and tested on Debian 13, Docker elsewhere",
      b: "Mature, feature-rich platform",
    },
    {
      label: "Migration path",
      a: "Imports SSH, RDP and VNC connections from a Guacamole MySQL/MariaDB dump",
      b: "n/a",
      note: "Guacamole users, groups and permissions are not imported; use OIDC group mappings and folder access instead.",
    },
  ],
};

/* FAQs: marked up once, on /faq/. Each answer stands alone; the first sentence answers. */
export const faqs = [
  {
    q: "What is rustguac?",
    a: `rustguac is a lightweight, open-source replacement for the Apache Guacamole Java web application, written in Rust. It gives you browser-based SSH, RDP, VNC, SPICE, Proxmox VE consoles, web browser sessions and Docker VDI desktops through guacd, the same protocol daemon Guacamole uses. It adds OIDC single sign-on, a four-tier role system, Vault-backed connection storage, multi-hop SSH tunnels and session recording. See the <a href="/docs/overview/#what-is-rustguac">overview</a>.`,
  },
  {
    q: "Is rustguac a drop-in replacement for Apache Guacamole?",
    a: `Not quite: rustguac replaces Guacamole's Java web application but keeps guacd and the Guacamole protocol, so your targets don't change while the management side does. Connections live in Vault or OpenBao instead of a SQL database, users sign in with OIDC instead of LDAP, RADIUS, TOTP, SAML or database accounts, and Guacamole user and group permissions are not carried over. The <code>import-guacamole</code> command brings across SSH, RDP and VNC connections from a MySQL/MariaDB dump. See <a href="/guacamole-alternative/">rustguac vs Apache Guacamole</a>.`,
  },
  {
    q: "Does rustguac need Java or Tomcat?",
    a: `No. rustguac is a single Rust binary plus guacd, with no Java, no Tomcat, no WAR files and no JVM tuning. guacd is built from Apache guacamole-server and bundled in the .deb package and Docker image, so there is nothing separate to install.`,
  },
  {
    q: "Which protocols does rustguac support?",
    a: `rustguac supports seven session types: SSH, RDP, VNC, SPICE, Proxmox VE VM consoles, web browser sessions (headless Chromium on Xvnc) and VDI desktops (Docker containers running xrdp). SSH supports SFTP and ephemeral keys, and RDP supports Kerberos NLA, RemoteApp, H.264 passthrough and the GFX pipeline. Telnet and Kubernetes are not supported.`,
  },
  {
    q: "Do I need HashiCorp Vault to run rustguac?",
    a: `You need HashiCorp Vault or OpenBao for the Connections UI, which is rustguac's main user-facing feature. Connection entries and credentials are stored in Vault or OpenBao KV v2 and read server-side. Without one, rustguac still runs, but users can only make ad-hoc connections, from <strong>Connect to a host</strong> beside the search box or through the API. The bundled <code>contrib/vault-quickstart.sh</code> sets up an existing server, a dev server or a local install in one command; see <a href="/docs/integrations/#quickstart-script">Vault quickstart</a>.`,
  },
  {
    q: "How do I install rustguac with Docker?",
    a: `Run <code>docker run -d -p 8089:8089 sol1/rustguac:latest</code>, then read the one-time admin API key from the container logs. The image bundles guacd, uses TLS between rustguac and guacd, and serves HTTP on port 8089, so put a reverse proxy in front for HTTPS. To keep your settings, bind-mount a <code>config.toml</code> to <code>/opt/rustguac/config.toml</code>. Web browser sessions also need the seccomp profile shipped in the image (<code>--security-opt seccomp=seccomp-chromium.json</code>), because Docker's default profile blocks Chromium's sandbox; see <a href="/docs/web-sessions/#running-under-docker">running under Docker</a>. The <a href="/docs/installation/#docker-compose-example">installation guide</a> has a Docker Compose example with volumes for data and recordings.`,
  },
  {
    q: "Can I run rustguac with Docker Compose or Kubernetes?",
    a: `Yes, rustguac ships as a Docker image, and the docs include a Docker Compose example with volumes for the database and recordings. The documentation does not provide a Helm chart or Kubernetes manifests. It does document logging into Vault or OpenBao with a projected Kubernetes service-account token (workload JWT auth, added in 1.12), so a pod needs no stored Vault secret. See <a href="/docs/installation/#docker-compose-example">Docker Compose</a> and <a href="/docs/integrations/#workload-jwt-authentication">workload JWT authentication</a>.`,
  },
  {
    q: "Which Linux distributions are supported?",
    a: `rustguac is built and tested on Debian 13 (Trixie), with pre-built .deb packages for amd64 and arm64. On other distributions the Docker image is the recommended path, because the bundled guacd needs FreeRDP 3.15 or newer. An RPM spec and build script are included but untested, and source builds on Ubuntu 24.04 are possible but untested. See <a href="/docs/installation/#other-linux-distributions">other Linux distributions</a>.`,
  },
  {
    q: "Which OIDC providers work with rustguac?",
    a: `rustguac works with any OpenID Connect provider. Authentik, Google, Okta, Keycloak and JumpCloud have been tested, and the docs include step-by-step guides for Authentik and Microsoft Entra ID. OIDC groups can be mapped to roles and used to restrict Connections folders. See <a href="/docs/integrations/#oidc-single-sign-on">OIDC single sign-on</a>.`,
  },
  {
    q: "Does rustguac support LDAP, SAML, RADIUS or TOTP?",
    a: `No. rustguac authenticates users with OIDC single sign-on, plus API keys and personal API tokens for automation. It has no LDAP, SAML, RADIUS or built-in TOTP login. If your directory or MFA lives behind an identity provider that speaks OIDC, such as Keycloak, Authentik, Okta or Entra ID, put rustguac behind that. Credential variables give a similar experience to Guacamole's LDAP credential passthrough without binding to LDAP.`,
  },
  {
    q: "Does rustguac record sessions?",
    a: `Yes. rustguac records sessions in the standard Guacamole format, plays them back in the browser, and rotates them by disk usage or count. Since 1.12, any recording can be downloaded as MP4. SSH connections can also write an opt-in plain-text typescript for audit, which is listed in the UI but never downloadable through it. See <a href="/docs/configuration/#recording-section">recording settings</a>.`,
  },
  {
    q: "Which browsers does rustguac support?",
    a: `rustguac works in any modern browser, including Chrome, Firefox, Edge, Safari, Chromium and Brave. The only caveat is H.264-accelerated RDP, which is off by default and enabled per connection. It needs a browser that decodes H.264 through WebCodecs, which means Chrome or Firefox. Chromium and Brave builds without the bundled H.264 codec, and older Safari, show a blank display on those connections.`,
  },
  {
    q: "What is rustguac's licence?",
    a: `rustguac is licensed under the Apache License 2.0. The source, releases and issue tracker are on <a href="${GH}">GitHub</a>.`,
  },
  {
    q: "Who maintains rustguac, and is commercial support available?",
    a: `rustguac is developed by Sol1 and contributors in the open on <a href="${GH}">GitHub</a>, where issues and pull requests are welcome. According to the project README, commercial support for rustguac is available from Sol1; see <a href="/#support">commercial support</a> for how to reach them. This website is a community project and is not affiliated with the Apache Software Foundation.`,
  },
  {
    q: "How do I migrate from Apache Guacamole?",
    a: `Dump the <code>guacamole_connection</code>, <code>guacamole_connection_parameter</code> and <code>guacamole_connection_group</code> tables with mysqldump, then run <code>rustguac import-guacamole --file guacamole-dump.sql --dry-run</code> to preview and run it again without <code>--dry-run</code> to write to Vault. SSH, RDP (including RemoteApp) and VNC connections are imported, and connection groups become name prefixes. <code>--map</code> turns Guacamole's <code>\${GUAC_USERNAME}</code> tokens into rustguac credential variables. Users and permissions are not imported. See the <a href="/docs/migration/#step-1-export-the-guacamole-database">migration guide</a>.`,
  },
  {
    q: "Is rustguac secure, and how do I report a vulnerability?",
    a: `rustguac ships with secure defaults: TLS to the browser and to guacd, network allowlists that default to localhost only, credentials kept server-side in Vault, hashed API keys, strict framing headers and optional rate limiting, all described in the <a href="/docs/security/#tls-encryption">security guide</a>. Report vulnerabilities privately through GitHub's private vulnerability reporting at <a href="${GH}/security">github.com/sol1/rustguac/security</a>, not in a public issue. Security fixes go into the latest release.`,
  },
  {
    q: "What do I need to run VDI desktops?",
    a: `VDI needs Docker on the same host as rustguac, the <code>rustguac</code> user in the <code>docker</code> group, a <code>[vdi]</code> section in <code>config.toml</code>, and at least one pre-pulled image that runs xrdp on port 3389. The image either provisions its account from the <code>VDI_USERNAME</code> and <code>VDI_PASSWORD</code> environment variables or uses a baked-in account. A minimal Debian and xfce4 example is in <code>contrib/vdi-test-image/</code>. See <a href="/docs/vdi/#prerequisites">VDI prerequisites</a>.`,
  },
  {
    q: "Can I embed rustguac sessions in my own application?",
    a: `Yes, using the headless API. Your backend creates a session with an API key (<code>POST /api/sessions</code>), mints a single-use, 30-second WebSocket ticket (<code>POST /api/ws-ticket</code>), and sends the user's browser to <code>client_url?ticket=…</code>, so the API key never reaches the browser. You can also build your own client on the same WebSocket using the Guacamole protocol. rustguac pages refuse to be framed by other sites, so open the session URL as a page or window. See <a href="/docs/api/#headless-api-integration">headless API integration</a>.`,
  },
  {
    q: "Can rustguac reach servers behind a bastion host?",
    a: `Yes. SSH, RDP, VNC, web and Proxmox sessions can be routed through a chain of SSH jump hosts, each with its own username and password or private key. Configure the chain on a connection entry, or add jump hosts to an ad-hoc session. Jump host credentials are stored in Vault and never sent to the browser. See <a href="/docs/integrations/#ssh-tunnel--multi-hop-jump-hosts">multi-hop SSH tunnels</a>.`,
  },
  {
    q: "Does rustguac work with NetBox?",
    a: `Yes. rustguac adds one-click console links to NetBox device pages and can keep its Connections in sync through NetBox webhooks, using NetBox's built-in custom fields, custom links and event rules. No NetBox plugin is required. See the <a href="/docs/netbox/#netbox-integration">NetBox guide</a>.`,
  },
];

/* Install snippets. Commands match README.md and docs/installation.md. */
export const quickstart = [
  {
    id: "docker",
    label: "Docker",
    lang: "bash",
    code: [
      "docker pull sol1/rustguac:latest",
      "",
      "# Web sessions need the image's seccomp profile for Chromium's sandbox",
      "docker run --rm --entrypoint cat sol1/rustguac:latest /opt/rustguac/seccomp-chromium.json > seccomp-chromium.json",
      "docker run -d --name rustguac -p 8089:8089 --security-opt seccomp=seccomp-chromium.json sol1/rustguac:latest",
      "",
      "# First start prints a one-time admin API key",
      "docker logs rustguac",
    ].join("\n"),
    note: "Serves HTTP on port 8089, so put a reverse proxy in front for HTTPS. Bind-mount config.toml to /opt/rustguac/config.toml to keep settings. For VDI, also mount /var/run/docker.sock and add the docker group.",
  },
  {
    id: "deb",
    label: "Debian 13 (.deb)",
    lang: "bash",
    code: [
      "# Download rustguac_*.deb (amd64 or arm64) from GitHub Releases",
      "sudo apt install ./rustguac_*.deb",
      "/opt/rustguac/bin/rustguac --config /opt/rustguac/config.toml add-admin --name admin",
      "sudo systemctl enable --now rustguac",
    ].join("\n"),
    note: "Installs to /opt/rustguac and starts both rustguac-guacd and rustguac. Save the printed API key: it is shown once. Edit /opt/rustguac/config.toml, then set up Vault or OpenBao for the Connections UI.",
  },
  {
    id: "source",
    label: "From source",
    lang: "bash",
    code: [
      "git clone https://github.com/sol1/rustguac.git",
      "cd rustguac",
      "sudo ./install.sh",
      "/opt/rustguac/bin/rustguac --config /opt/rustguac/config.toml add-admin --name admin",
      "sudo systemctl start rustguac",
    ].join("\n"),
    note: "For Debian 13. Builds patched guacd and rustguac, creates the rustguac user, generates a self-signed certificate and installs systemd services. Use --no-tls to serve plain HTTP on port 8089, or --hostname=FQDN to name the certificate.",
  },
];

/* Who it's for. Each item maps to documented features. */
export const useCases = [
  {
    icon: "users",
    title: "MSPs and multi-tenant teams",
    text: "Give each customer or team a folder shared with their OIDC groups or named users, keep everyone's credentials in Vault, sync devices from NetBox, and lend folder default credentials to new entries.",
  },
  {
    icon: "shield",
    title: "Privileged access and bastions",
    text: "Replace jump-box logins with browser sessions through multi-hop SSH tunnels, with per-protocol allowlists, ephemeral SSH keys, clipboard control and Knocknoc gating at HAProxy.",
  },
  {
    icon: "film",
    title: "Audit and compliance",
    text: "Record every session, export MP4s for review, keep greppable SSH typescripts on a LUKS volume, and pull session history as CSV for auditors.",
  },
  {
    icon: "server",
    title: "Homelabs and Proxmox",
    text: "Open Proxmox VE VM consoles with a single API token, reach libvirt SPICE displays and IPMI/KVM VNC consoles, and install from one .deb or Docker image.",
  },
  {
    icon: "container",
    title: "Desktops for contractors",
    text: "Hand out an isolated Linux desktop per user from your own Docker image, with persistent homes, resource limits and nothing to install on their machine.",
  },
  {
    icon: "code",
    title: "Remote sessions inside your tools",
    text: "Create sessions from your own backend with the REST API and send users to a single-use ticket URL, or lock a web session to one internal app with autofill.",
  },
];
