// Docs fixes the site applies on top of the synced upstream docs, each one tracking an
// open issue on sol1/rustguac. Once upstream merges a fix, the docs build reports it
// as no longer needed (apply() returns the text unchanged); then delete the entry.
// An apply() that inserts text must first check the text is not there already, so an
// upstream fix that words it differently still makes the entry report as stale.
// New pages that upstream does not have yet live next to this file as <slug>.md.
//
// { issue, file, title, apply(markdown) -> markdown }

const replaceAll = (from, to) => (md) => md.split(from).join(to);

export default [
  {
    issue: 300,
    file: "deployment-guide.md",
    title: "Pull the published Docker Hub image, not ghcr.io",
    apply: replaceAll("ghcr.io/sol1/rustguac:latest", "sol1/rustguac:latest"),
  },
  {
    issue: 301,
    file: "integrations.md",
    title: "SPICE and Proxmox VE in the jump-host session types table",
    apply: (md) =>
      /^\| SPICE \|/m.test(md)
        ? md
        : md.replace(
            /^(\| Web \| Yes \| Tunnel forwards to URL host:port[^\n]*\n)/m,
            "$1| SPICE | Yes | Tunnel forwards to the SPICE host:port |\n" +
              "| Proxmox VE | Yes | The PVE API and the SPICE proxy that Proxmox returns are both tunnelled through the chain (see [SPICE and Proxmox VE](spice-and-proxmox.md#ssh-tunnels-and-jump-hosts)) |\n",
          ),
  },
  {
    issue: 307,
    file: "installation.md",
    title: "Web sessions in Docker need Chromium's sandbox syscalls",
    apply: (md) =>
      /seccomp/.test(md)
        ? md
        : md
            .replace(
              /(    environment:\n      - RUST_LOG=info\n)/,
              "$1    # Web browser sessions: Chromium's sandbox needs syscalls Docker's default seccomp profile blocks\n    security_opt:\n      - seccomp:unconfined\n",
            )
            .replace(
              /^(### Docker Compose example\n)/m,
              "$1\n> [!NOTE]\n> Web browser sessions run Chromium with its normal sandbox, which needs syscalls that Docker's default seccomp profile blocks. Without `seccomp:unconfined` (or a seccomp profile that allows Chromium's sandbox), web sessions fail to start; SSH, RDP, VNC and VDI sessions are unaffected.\n",
            ),
  },
  {
    issue: 303,
    file: "installation.md",
    title: "Post-install steps numbered 1 to 6",
    apply: (md) =>
      md
        .replace(/^6\. \*\*\(Optional\) Set up encrypted drive storage/m, "5. **(Optional) Set up encrypted drive storage")
        .replace(/^7\. \*\*\(Optional\) Enable VDI/m, "6. **(Optional) Enable VDI"),
  },
  {
    issue: 303,
    file: "migration.md",
    title: "Vault split is a section of the page, not a second title",
    apply: (md) => {
      const at = md.search(/^# Splitting to multiple Vaults/m);
      if (at === -1) return md;
      // Demote the section and everything under it one level (outside code fences).
      let fence = false;
      const tail = md
        .slice(at)
        .split("\n")
        .map((line) => {
          if (/^(```|~~~)/.test(line)) fence = !fence;
          return !fence && /^#{1,5} /.test(line) ? `#${line}` : line;
        })
        .join("\n");
      return md.slice(0, at) + tail;
    },
  },
];
