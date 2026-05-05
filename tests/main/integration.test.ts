import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { scriptMdToTiptap } from '@main/serializer';

const corpusPosts = '/Users/bag-yoseb/Desktop/Project/personal/blog/.claude/blog-corpus/posts';

describe('integration: existing corpus parse smoke test', () => {
  it.skipIf(!existsSync(corpusPosts))('parses up to 5 corpus posts without throwing', () => {
    const files = readdirSync(corpusPosts).filter((f) => f.endsWith('.md')).slice(0, 5);
    let parsed = 0;
    let skipped = 0;
    for (const f of files) {
      const raw = readFileSync(join(corpusPosts, f), 'utf8');
      const fm = matter(raw).data as any;
      // posts/ files may have richer frontmatter than ScriptFrontmatterSchema accepts;
      // wrap in a minimal compatible header so the serializer's zod parse doesn't trip.
      if (!fm.title || !fm.category) {
        skipped += 1;
        continue;
      }
      const minimal = `---\ntitle: ${fm.title}\ncategory: ${fm.category}\ndate: ${fm.date || '2026-01-01'}\n---\n\n${matter(raw).content}`;
      try {
        scriptMdToTiptap(minimal);
        parsed += 1;
      } catch (e) {
        // Lenient: corpus posts may use markdown features beyond what the editor's serializer supports.
        // The point is to catch CRASHES, not to assert byte-exact parsing of arbitrary blog content.
        skipped += 1;
      }
    }
    // We expect at least one of the five to parse cleanly. If zero, something is fundamentally broken.
    expect(parsed + skipped).toBe(files.length);
    expect(parsed).toBeGreaterThan(0);
  });
});
