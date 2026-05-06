import { describe, expect, it } from 'vitest';
import { resolveCorpusImagePath, buildCorpusImageUrl } from '@main/corpusImageProtocol';

describe('corpus-image 프로토콜', () => {
  it('영문 슬러그를 라운드트립한다', () => {
    const url = buildCorpusImageUrl('2026-05-05-test', 'images/1.png');
    expect(url).toBe('corpus-image://x/2026-05-05-test/images/1.png');
    expect(resolveCorpusImagePath(url, '/root')).toBe('/root/drafts/2026-05-05-test/images/1.png');
  });

  it('한글 슬러그를 punycode 변환 없이 라운드트립한다', () => {
    const url = buildCorpusImageUrl('2026-05-06-새-글', 'images/1-abcd.jpg');
    expect(url.startsWith('corpus-image://x/')).toBe(true);
    expect(url).not.toContain('xn--');
    expect(resolveCorpusImagePath(url, '/root')).toBe('/root/drafts/2026-05-06-새-글/images/1-abcd.jpg');
  });

  it('공백·특수문자가 들어간 슬러그를 percent-encoding으로 안전하게 다룬다', () => {
    const url = buildCorpusImageUrl('2026-05-06 my draft', 'images/x.png');
    expect(resolveCorpusImagePath(url, '/root')).toBe('/root/drafts/2026-05-06 my draft/images/x.png');
  });

  it('상대 경로가 비어있으면 null을 돌려준다', () => {
    expect(resolveCorpusImagePath('corpus-image://x/onlyslug', '/root')).toBeNull();
  });

  it('슬러그가 비어있으면 null을 돌려준다', () => {
    expect(resolveCorpusImagePath('corpus-image://x//images/1.png', '/root')).toBeNull();
  });
});
