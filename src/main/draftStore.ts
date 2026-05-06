import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, rmSync, statSync } from 'fs';
import { join } from 'path';
import { scriptMdToTiptap, tiptapToScriptMd } from './serializer';
import { DraftMeta, DraftMetaSchema, ScriptFrontmatter, ScriptFrontmatterSchema } from '@shared/schema';

export class DraftStore {
  constructor(private root: string) {}

  private dir(slug: string) { return join(this.root, 'drafts', slug); }

  private draftsRoot() { return join(this.root, 'drafts'); }

  create(fm: ScriptFrontmatter): string {
    ScriptFrontmatterSchema.parse(fm);
    // Convention: original draft keeps the bare slug; collisions get -2, -3, ...
    // (matches WordPress/Naver behaviour — `-1` is never used).
    const baseSlug = `${fm.date}-${slugify(fm.title)}`;
    let slug = baseSlug, n = 1;
    while (existsSync(this.dir(slug))) { n += 1; slug = `${baseSlug}-${n}`; }
    mkdirSync(join(this.dir(slug), 'images'), { recursive: true });
    const initialDoc = { type: 'doc' as const, content: [{ type: 'paragraph' as const }] };
    const meta: DraftMeta = { title_candidates: [fm.title], hashtags: [], category: fm.category };
    writeFileSync(join(this.dir(slug), 'script.md'), tiptapToScriptMd(fm, initialDoc));
    writeFileSync(join(this.dir(slug), 'meta.json'), JSON.stringify(meta, null, 2));
    return slug;
  }

  load(slug: string) {
    const md = readFileSync(join(this.dir(slug), 'script.md'), 'utf8');
    const { frontmatter, doc } = scriptMdToTiptap(md);
    const metaRaw = JSON.parse(readFileSync(join(this.dir(slug), 'meta.json'), 'utf8'));
    const meta = DraftMetaSchema.parse(metaRaw);
    return { frontmatter, doc, meta };
  }

  // `doc` is `any` — TipTap JSON shape is loose by design; the serializer
  // silently skips unknown node types rather than throwing.
  save(slug: string, fm: ScriptFrontmatter, doc: any, meta: DraftMeta) {
    ScriptFrontmatterSchema.parse(fm);
    DraftMetaSchema.parse(meta);
    // Render both first so a serialization error doesn't leave files out of sync.
    const mdContent = tiptapToScriptMd(fm, doc);
    const metaContent = JSON.stringify(meta, null, 2);
    writeFileSync(join(this.dir(slug), 'script.md'), mdContent);
    writeFileSync(join(this.dir(slug), 'meta.json'), metaContent);
  }

  /** Permanently removes a single draft folder. No-op if it doesn't exist. */
  delete(slug: string): void {
    const target = this.dir(slug);
    if (!existsSync(target)) return;
    rmSync(target, { recursive: true, force: true });
  }

  /**
   * Permanently removes every draft directory under `<corpus>/drafts/`.
   * Leaves sibling corpus content (`posts/`, `style-guide.md`, `index.json`,
   * `raw/`) untouched — those are learning data, not editor output.
   */
  deleteAll(): number {
    const root = this.draftsRoot();
    if (!existsSync(root)) return 0;
    const entries = readdirSync(root).filter((name) => statSync(join(root, name)).isDirectory());
    for (const name of entries) {
      rmSync(join(root, name), { recursive: true, force: true });
    }
    return entries.length;
  }

  draftPath(slug: string) { return this.dir(slug); }
  imagesDir(slug: string) { return join(this.dir(slug), 'images'); }
}

function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .slice(0, 60)
    .replace(/^-+|-+$/g, '')
    || 'untitled';
}
