import matter from 'gray-matter';
import { ScriptFrontmatter, ScriptFrontmatterSchema } from '@shared/schema';

type TiptapNode = { type: string; attrs?: any; content?: TiptapNode[]; text?: string; marks?: any[] };
type DocNode = { type: 'doc'; content: TiptapNode[] };

// Lazy quantifiers so bold can wrap content containing single `*` (e.g. `**a*b**`).
const RX_INLINE = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(<u>([^<]+)<\/u>)|(<mark>([^<]+)<\/mark>)|(\[([^\]]+)\]\(([^)]+)\))/g;

function parseInline(text: string): TiptapNode[] {
  const out: TiptapNode[] = [];
  let last = 0;
  for (const m of text.matchAll(RX_INLINE)) {
    const idx = m.index!;
    if (idx > last) out.push({ type: 'text', text: text.slice(last, idx) });
    if (m[2]) out.push({ type: 'text', text: m[2], marks: [{ type: 'bold' }] });
    else if (m[4]) out.push({ type: 'text', text: m[4], marks: [{ type: 'italic' }] });
    else if (m[6]) out.push({ type: 'text', text: m[6], marks: [{ type: 'underline' }] });
    else if (m[8]) out.push({ type: 'text', text: m[8], marks: [{ type: 'highlight' }] });
    else if (m[10]) out.push({ type: 'text', text: m[10], marks: [{ type: 'link', attrs: { href: m[11] } }] });
    last = idx + m[0].length;
  }
  if (last < text.length) out.push({ type: 'text', text: text.slice(last) });
  return out;
}

export function scriptMdToTiptap(raw: string): { frontmatter: ScriptFrontmatter; doc: DocNode } {
  const parsed = matter(raw);
  const rawData = { ...parsed.data };
  if (rawData.date instanceof Date) {
    rawData.date = rawData.date.toISOString().slice(0, 10);
  }
  const frontmatter = ScriptFrontmatterSchema.parse(rawData);
  const lines = parsed.content.replace(/\r\n?/g, '\n').split('\n');
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

function inlineToMd(nodes: TiptapNode[] | undefined): string {
  if (!nodes) return '';
  return nodes.map(n => {
    if (n.type !== 'text') return '';
    let s = n.text || '';
    for (const mk of n.marks || []) {
      if (mk.type === 'bold') s = `**${s}**`;
      else if (mk.type === 'italic') s = `*${s}*`;
      else if (mk.type === 'link') s = `[${s}](${mk.attrs.href})`;
      else if (mk.type === 'underline') s = `<u>${s}</u>`;
      else if (mk.type === 'highlight') s = `<mark>${s}</mark>`;
      else if (mk.type === 'textColor') s = `<span style="color:${mk.attrs.color}">${s}</span>`;
    }
    return s;
  }).join('');
}

export function tiptapToScriptMd(fm: ScriptFrontmatter, doc: DocNode | TiptapNode): string {
  const head = `---\ntitle: ${fm.title}\ncategory: ${fm.category}\ndate: ${fm.date}\n---\n\n# ${fm.title}\n\n`;
  const body = (doc.content || []).map(n => {
    if (n.type === 'paragraph') return inlineToMd(n.content) + '\n';
    if (n.type === 'sectionHeading') return `## ${n.content?.[0]?.text || ''}\n`;
    if (n.type === 'divider') return `---\n`;
    if (n.type === 'photoBlock') return `![${n.attrs?.alt || ''}](${n.attrs?.src})\n`;
    return '';
  }).join('\n');
  return head + body.trimEnd() + '\n';
}
