/**
 * Build a `corpus-image://x/<slug>/<rel>` URL.
 *
 * The fixed `x` host avoids Electron's automatic punycode conversion of
 * non-ASCII slugs (e.g. Korean) when the slug is placed in the host slot.
 * Both `slug` and each path segment of `rel` are percent-encoded.
 */
export function buildCorpusImageUrl(slug: string, rel: string): string {
  const slugPart = encodeURIComponent(slug);
  const relPart = rel.split('/').map(encodeURIComponent).join('/');
  return `corpus-image://x/${slugPart}/${relPart}`;
}
