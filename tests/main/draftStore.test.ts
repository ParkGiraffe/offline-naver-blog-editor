import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { DraftStore } from '@main/draftStore';

function tmpCorpus() {
  const root = mkdtempSync(join(tmpdir(), 'corpus-'));
  mkdirSync(join(root, 'drafts'), { recursive: true });
  return root;
}

describe('DraftStore', () => {
  it('creates a new draft folder with slug, script.md, meta.json, images/', () => {
    const root = tmpCorpus();
    const store = new DraftStore(root);
    const slug = store.create({ title: '테스트 제목', category: '잡담', date: '2026-05-05' });
    expect(slug).toMatch(/^2026-05-05-/);
    expect(existsSync(join(root, 'drafts', slug, 'script.md'))).toBe(true);
    expect(existsSync(join(root, 'drafts', slug, 'meta.json'))).toBe(true);
    expect(existsSync(join(root, 'drafts', slug, 'images'))).toBe(true);
  });

  it('avoids slug collision by appending -2, -3, ...', () => {
    const root = tmpCorpus();
    const store = new DraftStore(root);
    const a = store.create({ title: '같은 제목', category: 'x', date: '2026-05-05' });
    const b = store.create({ title: '같은 제목', category: 'x', date: '2026-05-05' });
    expect(a).not.toBe(b);
    expect(b).toMatch(/-2$/);
  });

  it('saves and reloads a draft byte-exact (round-trip via serializer)', () => {
    const root = tmpCorpus();
    const store = new DraftStore(root);
    const slug = store.create({ title: 'x', category: 'y', date: '2026-05-05' });
    const fm = { title: 'x', category: 'y', date: '2026-05-05' };
    const doc: any = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '안녕' }] }] };
    const meta = { title_candidates: ['x'], hashtags: ['#tag'], category: 'y' };
    store.save(slug, fm, doc, meta);
    const loaded = store.load(slug);
    expect(loaded.doc.content).toEqual(doc.content);
    expect(loaded.frontmatter).toEqual(fm);
    expect(loaded.meta).toEqual(meta);
  });

  it('rejects save with invalid meta (zod throws)', () => {
    const root = tmpCorpus();
    const store = new DraftStore(root);
    const slug = store.create({ title: 'x', category: 'y', date: '2026-05-05' });
    expect(() => store.save(
      slug,
      { title: 'x', category: 'y', date: '2026-05-05' },
      { type: 'doc', content: [] },
      { title_candidates: [], hashtags: [], category: 'y' } as any,  // empty title_candidates → zod fail
    )).toThrow();
  });

  it('exposes draftPath and imagesDir helpers', () => {
    const root = tmpCorpus();
    const store = new DraftStore(root);
    const slug = store.create({ title: 'x', category: 'y', date: '2026-05-05' });
    expect(store.draftPath(slug)).toBe(join(root, 'drafts', slug));
    expect(store.imagesDir(slug)).toBe(join(root, 'drafts', slug, 'images'));
  });
});
