import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { scriptMdToTiptap, tiptapToScriptMd } from './serializer';
import { DraftMeta, DraftMetaSchema, ScriptFrontmatter } from '@shared/schema';

export class DraftStore {
  constructor(private root: string) {}

  private dir(slug: string) { return join(this.root, 'drafts', slug); }

  create(fm: ScriptFrontmatter): string {
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

  save(slug: string, fm: ScriptFrontmatter, doc: any, meta: DraftMeta) {
    DraftMetaSchema.parse(meta);
    writeFileSync(join(this.dir(slug), 'script.md'), tiptapToScriptMd(fm, doc));
    writeFileSync(join(this.dir(slug), 'meta.json'), JSON.stringify(meta, null, 2));
  }

  draftPath(slug: string) { return this.dir(slug); }
  imagesDir(slug: string) { return join(this.dir(slug), 'images'); }
}

function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'untitled';
}
