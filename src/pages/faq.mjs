import { site, href, hrefAll } from "../site.mjs";
import { icon, githubMark } from "../icons.mjs";
import { ids } from "../layout.mjs";
import { faqs } from "../data.mjs";

const slug = (q) => q.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const body = `
<section class="page-hero">
  <div class="hero-bg" aria-hidden="true"></div>
  <div class="container narrow">
    <p class="eyebrow">FAQ</p>
    <h1>rustguac questions, answered</h1>
    <p class="page-lead">Installation, Vault, sign-in, protocols, recording, migration from Apache Guacamole and security. Can't find it here? <a href="${href("/docs/")}">Search the docs</a> or <a href="${site.issues}" rel="noopener">open an issue</a>.</p>
  </div>
</section>

<section class="section section-tight">
  <div class="container narrow">
    <div class="faq faq-full">
      ${faqs
        .map((f, i) => `<details id="${slug(f.q)}"${i === 0 ? " open" : ""}><summary><h2 id="q-${slug(f.q)}">${f.q}</h2>${icon("chevron-down", 20)}</summary><div class="faq-a"><p>${hrefAll(f.a)}</p></div></details>`)
        .join("\n      ")}
    </div>
  </div>
</section>

<section class="section cta-section" data-search-ignore>
  <div class="container cta-slim">
    <h2>Still curious?</h2>
    <p>The documentation covers installation, configuration, Vault, OIDC, security and the API in depth.</p>
    <div class="cta-buttons">
      <a class="btn btn-primary btn-lg" href="${href("/docs/")}">${icon("book", 18)}<span>Read the docs</span></a>
      <a class="btn btn-ghost btn-lg" href="${site.issues}" rel="noopener">${githubMark(18)}<span>Ask on GitHub</span></a>
    </div>
  </div>
</section>
`;

export default {
  slug: "faq",
  path: "/faq/",
  title: "rustguac FAQ: install, Vault, OIDC, protocols and migration",
  description:
    "Answers about rustguac: Docker and Debian installs, Vault and OpenBao, OIDC providers, supported protocols, recording, browsers and migrating from Guacamole.",
  modified: site.released,
  priority: "0.8",
  changefreq: "monthly",
  pageType: ["WebPage", "FAQPage"],
  searchSection: "FAQ",
  breadcrumbs: [{ name: "FAQ", path: "/faq/" }],
  og: {
    eyebrow: "FAQ",
    title: "rustguac questions, <em>answered</em>",
    sub: "Install, Vault, OIDC, protocols, recording, browsers and migrating from Guacamole.",
    shot: "recordings",
  },
  about: { "@id": ids.app },
  faq: faqs,
  body,
};
