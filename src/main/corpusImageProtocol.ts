import { join } from 'path';

export { buildCorpusImageUrl } from '@shared/corpusImageUrl';

/**
 * Parse a `corpus-image://x/<slug>/<rel>` URL into a disk path under
 * `<corpusRoot>/drafts/<slug>/<rel>`. Returns null on malformed input.
 */
export function resolveCorpusImagePath(rawUrl: string, corpusRoot: string): string | null {
  const u = new URL(rawUrl);
  const decoded = decodeURIComponent(u.pathname);
  const idx = decoded.indexOf('/', 1);
  if (idx < 0) return null;
  const slug = decoded.slice(1, idx);
  const rel = decoded.slice(idx + 1);
  if (!slug || !rel) return null;
  return join(corpusRoot, 'drafts', slug, rel);
}
