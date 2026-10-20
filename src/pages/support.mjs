import { site } from "../site.mjs";
import { icon } from "../icons.mjs";
import { ids } from "../layout.mjs";

/* ---------- Commercial support (site.maintainer) ---------- */
const m = site.maintainer;
const supportPoints = [
  ["users", "Open-source specialists", `Sol1 has provided managed IT services for businesses since ${m.since}, with Linux and open-source infrastructure at the core of its work.`],
  ["server", "The stack around rustguac", "Sol1 also supports Proxmox VE, NetBox and Ansible network automation, Icinga monitoring and managed Linux firewalls."],
  ["history", "Support hours and SLAs", `Standard support runs ${m.hours}, with extended hours under a service level agreement.`],
];
// The home page shows it as a section (h2); /support/ is the same content as its own page (h1),
// so the link has its own title, description and social card.
export const supportSection = (h = "h2") => `
<section class="section section-alt" id="support" aria-labelledby="support-title">
  <div class="container support">
    <div class="support-text">
      <p class="eyebrow">Commercial support</p>
      <${h} id="support-title">Backed by the team that builds it</${h}>
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

export default {
  slug: "support",
  path: "/support/",
  title: "rustguac commercial support from Sol1",
  description:
    "24 hour commercial support for rustguac from Sol1, the Sydney IT company that develops it. Production deployments, Proxmox VE, NetBox, Icinga and Linux.",
  modified: site.released,
  priority: "0.6",
  changefreq: "monthly",
  searchSection: "Support",
  breadcrumbs: [{ name: "Commercial support", path: "/support/" }],
  og: {
    eyebrow: "Commercial support",
    title: "Backed by <em>the team that builds it</em>",
    sub: "24 hour commercial support for rustguac from Sol1, the Sydney IT company that develops it.",
    support: true,
  },
  ogAlt: "rustguac commercial support from Sol1: backed by the team that builds it",
  about: { "@id": ids.app },
  body: supportSection("h1"),
};
