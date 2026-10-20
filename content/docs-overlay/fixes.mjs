// Docs fixes the site applies on top of the synced upstream docs, each one tracking an
// open issue on sol1/rustguac. Once upstream merges a fix, the docs build reports it
// as no longer needed (apply() returns the text unchanged); then delete the entry.
// An apply() that inserts text must first check the text is not there already, so an
// upstream fix that words it differently still makes the entry report as stale.
// New pages that upstream does not have yet live next to this file as <slug>.md.
//
// { issue, file, title, apply(markdown) -> markdown }

export default [];
