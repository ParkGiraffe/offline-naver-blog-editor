import Store from 'electron-store';
import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

export type DraftSummary = { slug: string; title: string; category: string; date: string; mtime: number };

export class Corpus {
  private store = new Store<{ corpusPath?: string }>();

  getPath(): string | undefined { return this.store.get('corpusPath'); }
  setPath(p: string) { this.store.set('corpusPath', p); }

  listDrafts(): DraftSummary[] {
    const root = this.getPath();
    if (!root) return [];
    const draftsDir = join(root, 'drafts');
    if (!existsSync(draftsDir)) return [];
    const entries = readdirSync(draftsDir).filter(name => {
      try { return statSync(join(draftsDir, name)).isDirectory(); } catch { return false; }
    });
    return entries.map(slug => {
      const md = join(draftsDir, slug, 'script.md');
      const mtime = existsSync(md) ? statSync(md).mtimeMs : 0;
      let title = slug, category = '', date = '';
      if (existsSync(md)) {
        try {
          const fm = matter(readFileSync(md, 'utf8')).data as any;
          title = fm.title || slug;
          category = fm.category || '';
          date = typeof fm.date === 'string' ? fm.date :
                 fm.date instanceof Date ? fm.date.toISOString().slice(0, 10) : '';
        } catch { /* ignore parse errors, keep defaults */ }
      }
      return { slug, title, category, date, mtime };
    }).sort((a, b) => b.mtime - a.mtime);
  }
}
