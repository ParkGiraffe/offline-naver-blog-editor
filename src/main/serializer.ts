import matter from 'gray-matter';
import { ScriptFrontmatter, ScriptFrontmatterSchema } from '@shared/schema';

type TiptapNode = { type: string; attrs?: any; content?: TiptapNode[]; text?: string; marks?: any[] };

const RX_INLINE = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]]+)\]\(([^)]+)\))/g;

function parseInline(text: string): TiptapNode[] {
  const out: TiptapNode[] = [];
  let last = 0;
  for (const m of text.matchAll(RX_INLINE)) {
    const idx = m.index!;
    if (idx > last) out.push({ type: 'text', text: text.slice(last, idx) });
    if (m[2]) out.push({ type: 'text', text: m[2], marks: [{ type: 'bold' }] });
    else if (m[4]) out.push({ type: 'text', text: m[4], marks: [{ type: 'italic' }] });
    else if (m[6]) out.push({ type: 'text', text: m[6], marks: [{ type: 'link', attrs: { href: m[7] } }] });
    last = idx + m[0].length;
  }
  if (last < text.length) out.push({ type: 'text', text: text.slice(last) });
  return out;
}

export function scriptMdToTiptap(raw: string): { frontmatter: ScriptFrontmatter; doc: TiptapNode } {
  const parsed = matter(raw);
  const rawData = { ...parsed.data };
  if (rawData.date instanceof Date) {
    rawData.date = rawData.date.toISOString().slice(0, 10);
  }
  const frontmatter = ScriptFrontmatterSchema.parse(rawData);
  const lines = parsed.content.split('\n');
  const content: TiptapNode[] = [];
  let buf: string[] = [];

  const flushPara = () => {
    const text = buf.join('\n').trim();
    buf = [];
    if (!text) return;
    content.push({ type: 'paragraph', content: parseInline(text) });
  };

  for (const line of lines) {
    if (line.startsWith('# ')) { flushPara(); continue; }  // # title 본문에서 제외
    if (line.startsWith('## ')) {
      flushPara();
      content.push({ type: 'sectionHeading', content: [{ type: 'text', text: line.slice(3).trim() }] });
      continue;
    }
    if (line.trim() === '---') { flushPara(); content.push({ type: 'divider' }); continue; }
    const photo = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (photo) {
      flushPara();
      content.push({ type: 'photoBlock', attrs: { src: photo[2], alt: photo[1] } });
      continue;
    }
    if (line.trim() === '') { flushPara(); continue; }
    buf.push(line);
  }
  flushPara();

  return { frontmatter, doc: { type: 'doc', content } };
}
