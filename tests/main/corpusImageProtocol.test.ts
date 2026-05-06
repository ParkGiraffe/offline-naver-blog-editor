import { describe, expect, it } from 'vitest';
import { resolveCorpusImagePath, buildCorpusImageUrl } from '@main/corpusImageProtocol';

describe('corpus-image protocol', () => {
  it('round-trips ASCII slug', () => {
    const url = buildCorpusImageUrl('2026-05-05-test', 'images/1.png');
    expect(url).toBe('corpus-image://x/2026-05-05-test/images/1.png');
    expect(resolveCorpusImagePath(url, '/root')).toBe('/root/drafts/2026-05-05-test/images/1.png');
  });

  it('round-trips Korean slug (no punycode breakage)', () => {
    const url = buildCorpusImageUrl('2026-05-06-새-글', 'images/1-abcd.jpg');
    // The host stays "x" so URL parsing does not punycode the Korean part.
    expect(url.startsWith('corpus-image://x/')).toBe(true);
    expect(url).not.toContain('xn--');
    expect(resolveCorpusImagePath(url, '/root')).toBe('/root/drafts/2026-05-06-새-글/images/1-abcd.jpg');
  });

  it('handles slug with spaces and special chars via percent-encoding', () => {
    const url = buildCorpusImageUrl('2026-05-06 my draft', 'images/x.png');
    expect(resolveCorpusImagePath(url, '/root')).toBe('/root/drafts/2026-05-06 my draft/images/x.png');
  });

  it('returns null for malformed url with no rel part', () => {
    expect(resolveCorpusImagePath('corpus-image://x/onlyslug', '/root')).toBeNull();
  });

  it('returns null for empty slug', () => {
    expect(resolveCorpusImagePath('corpus-image://x//images/1.png', '/root')).toBeNull();
  });
});
