import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { DraftStore } from '@main/draftStore';

function tmpCorpus() {
  const root = mkdtempSync(join(tmpdir(), 'corpus-'));
  mkdirSync(join(root, 'drafts'), { recursive: true });
  return root;
}

describe('드래프트 저장소', () => {
  it('새 드래프트를 만들면 script.md·meta.json·images/가 생긴다', () => {
    const root = tmpCorpus();
    const store = new DraftStore(root);
    const slug = store.create({ title: '테스트 제목', category: '잡담', date: '2026-05-05' });
    expect(slug).toMatch(/^2026-05-05-/);
    expect(existsSync(join(root, 'drafts', slug, 'script.md'))).toBe(true);
    expect(existsSync(join(root, 'drafts', slug, 'meta.json'))).toBe(true);
    expect(existsSync(join(root, 'drafts', slug, 'images'))).toBe(true);
  });

  it('같은 제목을 두 번 만들면 두 번째 슬러그에 -2가 붙는다', () => {
    const root = tmpCorpus();
    const store = new DraftStore(root);
    const a = store.create({ title: '같은 제목', category: 'x', date: '2026-05-05' });
    const b = store.create({ title: '같은 제목', category: 'x', date: '2026-05-05' });
    expect(a).not.toBe(b);
    expect(b).toMatch(/-2$/);
  });

  it('저장한 드래프트를 다시 불러오면 본문과 메타가 그대로다', () => {
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

  it('제목 후보가 빈 메타로 저장 시도하면 거부한다', () => {
    const root = tmpCorpus();
    const store = new DraftStore(root);
    const slug = store.create({ title: 'x', category: 'y', date: '2026-05-05' });
    expect(() =>
      store.save(
        slug,
        { title: 'x', category: 'y', date: '2026-05-05' },
        { type: 'doc', content: [] },
        { title_candidates: [], hashtags: [], category: 'y' } as any,
      ),
    ).toThrow();
  });

  it('draftPath와 imagesDir가 절대 경로를 돌려준다', () => {
    const root = tmpCorpus();
    const store = new DraftStore(root);
    const slug = store.create({ title: 'x', category: 'y', date: '2026-05-05' });
    expect(store.draftPath(slug)).toBe(join(root, 'drafts', slug));
    expect(store.imagesDir(slug)).toBe(join(root, 'drafts', slug, 'images'));
  });
});
