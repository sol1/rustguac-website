// Site copy from src/content.mjs (data only, owned by the content author).
// Missing exports default to empty values so a page section simply disappears
// instead of failing the build.
import * as mod from "./content.mjs";

export const highlights = mod.highlights || [];
export const protocols = mod.protocols || [];
export const featureGroups = mod.featureGroups || [];
export const comparison = mod.comparison || { columns: ["rustguac", "Apache Guacamole"], rows: [] };
export const faqs = mod.faqs || [];
export const quickstart = mod.quickstart || [];
export const useCases = mod.useCases || [];
export const release = mod.release || {};
