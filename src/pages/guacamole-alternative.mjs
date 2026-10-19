import { site, href, hrefAll } from "../site.mjs";
import { icon, githubMark } from "../icons.mjs";
import { ids, esc } from "../layout.mjs";
import { comparison } from "../data.mjs";
import { hl, plain } from "../code.mjs";

// Balanced and factual. Claims about Apache Guacamole come only from rustguac's own
// docs/overview.md ("Key differences") and docs/migration.md; we don't describe
// Guacamole's roadmap or maintenance status.

const same = [
  ["cpu", "The same guacd", "Both use guacd from Apache guacamole-server for protocol translation: the same C daemon, bundled with rustguac."],
  ["code", "The same protocol", "The wire protocol between webapp and guacd is identical, and rustguac uses the same guac-common-js client library and WebSocket framing."],
  ["film", "The same recording format", "Recordings are in the standard Guacamole format and play back in rustguac's bundled player."],
  ["monitor", "The same SSH, RDP and VNC", "The protocol backends come from guacd. rustguac adds web browser and VDI container session types on top."],
];

const guacFit = [
  "You need LDAP, RADIUS, SAML, TOTP or database accounts directly in the remote access gateway, rather than through an OIDC identity provider.",
  "You rely on protocols rustguac doesn't support, such as telnet or Kubernetes.",
  "You want connection data in MySQL or PostgreSQL and would rather not run HashiCorp Vault or OpenBao.",
  "You value a long-established, mature platform over a newer project.",
];
const rgFit = [
  "You'd rather not run Java, Tomcat and a WAR file for the web tier.",
  "Your users already sign in through an OIDC provider such as Authentik, Keycloak, Okta or Entra ID.",
  "You want credentials held in Vault or OpenBao and never sent to the browser.",
  "You need to reach targets through SSH bastions, or want locked-down web sessions and per-user VDI desktops.",
  "You want CIDR allowlists, rate limiting and per-entry clipboard control out of the box.",
];

const steps = [
  {
    t: "Install rustguac alongside Guacamole",
    d: `Run it from the Docker image or the Debian 13 package next to your existing setup. guacd is bundled, so nothing changes on your targets. <a href="${href("/docs/installation/")}">Installation guide</a>.`,
  },
  {
    t: "Connect Vault or OpenBao and OIDC",
    d: `Connections live in Vault or OpenBao KV v2, and users sign in with OIDC. <code>contrib/vault-quickstart.sh</code> provisions Vault in one command. <a href="${href("/docs/deployment-guide/")}">Deployment guide</a>.`,
  },
  {
    t: "Export three tables from Guacamole",
    d: "Dump only the connection, parameter and group tables from the Guacamole MySQL or MariaDB database.",
    code: "mysqldump -u guacamole_user -p guacamole_db \\\n  guacamole_connection \\\n  guacamole_connection_parameter \\\n  guacamole_connection_group \\\n  > guacamole-dump.sql",
  },
  {
    t: "Preview, then import",
    d: "Run with --dry-run to see what would be imported, then again without it to write the entries to Vault. SSH, RDP (including RemoteApp) and VNC connections are imported; telnet and Kubernetes are skipped with a warning.",
    code: "rustguac --config /opt/rustguac/config.toml \\\n  import-guacamole --file guacamole-dump.sql --dry-run",
  },
  {
    t: "Map passthrough tokens",
    d: `Guacamole's <code>\${GUAC_USERNAME}</code> and <code>\${GUAC_PASSWORD}</code> tokens become rustguac <a href="${href("/docs/credential-variables/")}">credential variables</a> with repeatable <code>--map FROM=TO</code> flags. Each user then fills them in once under My Credentials.`,
  },
  {
    t: "Recreate access with OIDC groups",
    d: "Guacamole users, groups and permissions are not imported. Map OIDC groups to rustguac's four roles and restrict folders with allowed groups, then switch users over.",
  },
];

const [colA, colB] = comparison.columns;
const body = `
<section class="page-hero">
  <div class="hero-bg" aria-hidden="true"></div>
  <div class="container narrow">
    <p class="eyebrow">Compare</p>
    <h1>An Apache Guacamole alternative, without the Java stack</h1>
    <p class="page-lead">Apache Guacamole is a mature, feature-rich platform. rustguac is a purpose-built alternative to its Java web application: one Rust binary in front of the same guacd, with OIDC sign-in, credentials in Vault, multi-hop SSH tunnels, web sessions and VDI desktops.</p>
    <div class="hero-cta left">
      <a class="btn btn-primary btn-lg" href="#migration">${icon("history", 18)}<span>How to migrate</span></a>
      <a class="btn btn-ghost btn-lg" href="#comparison">${icon("layers", 18)}<span>Side by side</span></a>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="what">
  <div class="container narrow prose">
    <h2 id="what">What rustguac is</h2>
    <p>rustguac is an open-source, Apache-2.0 licensed replacement for the Apache Guacamole Java webapp. It sits between web browsers and guacd, proxying the Guacamole protocol over WebSockets, and manages session lifecycle, authentication, session recording, VDI container orchestration and Vault-backed connection storage.</p>
    <p>There is no Tomcat, no WAR file and no JVM to tune: a single Rust binary plus guacd, installed from a Debian 13 package, a Docker image or one script.</p>
  </div>
  <div class="container">
    <h2 class="sub-h2" id="same">What stays the same</h2>
    <div class="cards">
      ${same.map(([i, t, d]) => `<article class="card"><div class="card-icon">${icon(i, 21)}</div><h3>${t}</h3><p>${d}</p></article>`).join("\n      ")}
    </div>
  </div>
</section>

<section class="section section-alt" aria-labelledby="comparison">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Side by side</p>
      <h2 id="comparison">rustguac vs Apache Guacamole</h2>
      <p>How the two web applications differ, based on rustguac's own documentation. Both sit in front of guacd.</p>
    </div>
    <div class="table-wrap">
      <table class="compare compare-full">
        <thead><tr><th scope="col">Area</th><th scope="col" class="col-us">${esc(colA)}</th><th scope="col">${esc(colB)}</th></tr></thead>
        <tbody>
          ${comparison.rows
            .map(
              (r) =>
                `<tr><th scope="row">${esc(r.label)}${r.note ? `<span class="row-note">${hrefAll(r.note)}</span>` : ""}</th><td class="col-us" data-label="${esc(colA)}">${hrefAll(r.a)}</td><td data-label="${esc(colB)}"${/^(not supported|not built|n\/a)/i.test(r.b) ? ' class="cell-na"' : ""}>${hrefAll(r.b)}</td></tr>`,
            )
            .join("\n          ")}
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="fit">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Honest fit</p>
      <h2 id="fit">Which one should you run?</h2>
      <p>Both put SSH, RDP and VNC in a browser through guacd. The right choice depends on how you authenticate users and where you want credentials to live.</p>
    </div>
    <div class="fit-grid">
      <div class="fit fit-us">
        <h3>${icon("check", 20)}rustguac is a good fit if</h3>
        <ul>${rgFit.map((x) => `<li>${x}</li>`).join("")}</ul>
      </div>
      <div class="fit fit-them">
        <h3>${icon("info", 20)}Apache Guacamole may suit you better if</h3>
        <ul>${guacFit.map((x) => `<li>${x}</li>`).join("")}</ul>
      </div>
    </div>
  </div>
</section>

<section class="section section-alt" aria-labelledby="migration">
  <div class="container narrow">
    <div class="section-head">
      <p class="eyebrow">Migration</p>
      <h2 id="migration">Moving from Apache Guacamole</h2>
      <p>rustguac imports SSH, RDP and VNC connections from a Guacamole MySQL/MariaDB dump straight into Vault. The import is additive and has a dry run, so you can run both side by side while you switch.</p>
    </div>
    <ol class="timeline">
      ${steps
        .map(
          (s) => `<li><h3>${s.t}</h3><p>${s.d}</p>${s.code ? `<pre tabindex="0"><code data-plain="${esc(plain(s.code))}">${hl(s.code, "bash")}</code></pre>` : ""}</li>`,
        )
        .join("\n      ")}
    </ol>
    <p class="section-more"><a class="link-arrow" href="${href("/docs/migration/")}">Read the full migration guide${icon("arrow-right", 16)}</a></p>
  </div>
</section>

<section class="section cta-section" data-search-ignore>
  <div class="container cta-slim">
    <h2>See it for yourself</h2>
    <p>One Docker command gets you a running instance with guacd included.</p>
    <div class="cta-buttons">
      <a class="btn btn-primary btn-lg" href="${href("/#quickstart")}">${icon("terminal", 18)}<span>Quickstart</span></a>
      <a class="btn btn-ghost btn-lg" href="${site.repo}" rel="noopener">${githubMark(18)}<span>View on GitHub</span></a>
    </div>
  </div>
</section>
`;

export default {
  slug: "guacamole-alternative",
  path: "/guacamole-alternative/",
  title: "Apache Guacamole alternative without Java: rustguac compared",
  description:
    "rustguac is a lightweight Apache Guacamole alternative: the same guacd, no Java or Tomcat, OIDC, Vault-backed credentials, VDI and a Guacamole import.",
  modified: site.released,
  priority: "0.9",
  changefreq: "monthly",
  searchSection: "Compare",
  breadcrumbs: [{ name: "Apache Guacamole alternative", path: "/guacamole-alternative/" }],
  og: {
    eyebrow: "Compare",
    title: "An Apache Guacamole alternative, <em>without the Java stack</em>",
    sub: "Same guacd. One Rust binary with OIDC, Vault, SSH tunnels, web sessions and VDI.",
    shot: "sessions",
  },
  about: { "@id": ids.app },
  body,
};
