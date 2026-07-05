// The agent emits citation markers like "[1]" inline in its answers.
// Before rendering with react-markdown we turn each marker into a markdown
// link ("[1](#cite-1)") so a custom <a> component can render it as a
// clickable citation chip — markdown structure (bold, lists) stays intact.

export const CITE_HREF_PREFIX = "#cite-";

export function linkifyCitations(text: string): string {
  return text.replace(/\[(\d+)\]/g, `[$1](${CITE_HREF_PREFIX}$1)`);
}

export function citationNumberFromHref(href: string): number | null {
  if (!href.startsWith(CITE_HREF_PREFIX)) return null;
  const n = Number(href.slice(CITE_HREF_PREFIX.length));
  return Number.isInteger(n) && n > 0 ? n : null;
}
