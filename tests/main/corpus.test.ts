import { describe, expect, it, vi } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

vi.mock('electron-store', () => ({
  default: class { private d: any = {}; get(k: string) { return this.d[k]; } set(k: string, v: any) { this.d[k] = v; } }
}));

import { Corpus } from '@main/corpus';

describe('Corpus', () => {
  it('lists drafts sorted by mtime desc, with frontmatter title/category/date', () => {
    const root = mkdtempSync(join(tmpdir(), 'corpus-'));
    mkdirSync(join(root, 'drafts/a'), { recursive: true });
    mkdirSync(join(root, 'drafts/b'), { recursive: true });
    writeFileSync(join(root, 'drafts/a/script.md'), '---\ntitle: A\ncategory: x\ndate: 2026-01-01\n---\n# A\n');
    // sleep a bit so b has later mtime
    const start = Date.now();
    while (Date.now() - start < 5) { /* spin */ }
    writeFileSync(join(root, 'drafts/b/script.md'), '---\ntitle: B\ncategory: y\ndate: 2026-02-02\n---\n# B\n');
    const c = new Corpus();
    c.setPath(root);
    const drafts = c.listDrafts();
    expect(drafts).toHaveLength(2);
    expect(drafts[0].slug).toBe('b');         // newer first
    expect(drafts[0].title).toBe('B');
    expect(drafts[0].category).toBe('y');
    expect(drafts[0].date).toBe('2026-02-02');
    expect(drafts[1].slug).toBe('a');
  });

  it('returns empty list if no path set', () => {
    const c = new Corpus();
    expect(c.listDrafts()).toEqual([]);
  });

  it('returns empty list if drafts/ dir missing', () => {
    const root = mkdtempSync(join(tmpdir(), 'corpus-'));
    const c = new Corpus();
    c.setPath(root);
    expect(c.listDrafts()).toEqual([]);
  });

  it('setPath then getPath round-trips', () => {
    const c = new Corpus();
    c.setPath('/some/where');
    expect(c.getPath()).toBe('/some/where');
  });
});
