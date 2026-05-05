import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { scriptMdToTiptap, tiptapToScriptMd } from '@main/serializer';

const fix = (p: string) => readFileSync(join(__dirname, '../fixtures/sample-drafts', p), 'utf8');

describe('scriptMdToTiptap', () => {
  it('parses frontmatter', () => {
    const { frontmatter } = scriptMdToTiptap(fix('basic/script.md'));
    expect(frontmatter).toEqual({ title: '테스트 글', category: '잡담', date: '2026-05-05' });
  });

  it('drops the # title line from body (frontmatter has it)', () => {
    const { doc } = scriptMdToTiptap(fix('basic/script.md'));
    expect(doc.content.some((n: any) => n.type === 'heading')).toBe(false);
  });

  it('produces sectionHeading nodes for ##', () => {
    const { doc } = scriptMdToTiptap(fix('basic/script.md'));
    const sections = doc.content.filter((n: any) => n.type === 'sectionHeading');
    expect(sections.map((s: any) => s.content[0].text)).toEqual(['첫 섹션', '두 번째 섹션']);
  });

  it('produces photoBlock for ![](images/N.png)', () => {
    const { doc } = scriptMdToTiptap(fix('basic/script.md'));
    const photos = doc.content.filter((n: any) => n.type === 'photoBlock');
    expect(photos[0].attrs.src).toBe('images/1.png');
  });

  it('produces divider for ---', () => {
    const { doc } = scriptMdToTiptap(fix('basic/script.md'));
    expect(doc.content.some((n: any) => n.type === 'divider')).toBe(true);
  });

  it('preserves inline marks: bold, italic, link', () => {
    const { doc } = scriptMdToTiptap(fix('basic/script.md'));
    const allInline: any[] = doc.content.flatMap((n: any) => n.content || []);
    expect(allInline.some((t: any) => t.marks?.some((m: any) => m.type === 'bold'))).toBe(true);
    expect(allInline.some((t: any) => t.marks?.some((m: any) => m.type === 'italic'))).toBe(true);
    const linked = allInline.find((t: any) => t.marks?.some((m: any) => m.type === 'link'));
    expect(linked?.marks.find((m: any) => m.type === 'link').attrs.href).toBe('https://example.com');
  });
});

describe('round-trip', () => {
  it('preserves byte-for-byte on basic fixture', () => {
    const raw = fix('basic/script.md');
    const { frontmatter, doc } = scriptMdToTiptap(raw);
    const out = tiptapToScriptMd(frontmatter, doc);
    expect(out).toBe(raw);
  });
});

describe('round-trip with full mark set', () => {
  it('round-trips marks/script.md byte-for-byte', () => {
    const raw = fix('marks/script.md');
    const { frontmatter, doc } = scriptMdToTiptap(raw);
    const out = tiptapToScriptMd(frontmatter, doc);
    expect(out).toBe(raw);
  });
});

describe('edge cases', () => {
  const fmHeader = '---\ntitle: t\ncategory: c\ndate: 2026-05-05\n---\n\n# t\n\n';

  it('bold containing single asterisk: **a*b**', () => {
    const { doc } = scriptMdToTiptap(fmHeader + '**a*b** end\n');
    const para = doc.content.find((n) => n.type === 'paragraph')!;
    const bold = (para.content as any[]).find((c) => c.marks?.some((m: any) => m.type === 'bold'));
    expect(bold.text).toBe('a*b');
  });

  it('normalizes CRLF line endings', () => {
    const { doc } = scriptMdToTiptap(fmHeader.replace(/\n/g, '\r\n') + 'line1\r\nline2\r\n');
    const para = doc.content.find((n) => n.type === 'paragraph')!;
    const text = (para.content as any[]).map((c) => c.text).join('');
    expect(text).not.toContain('\r');
    expect(text).toBe('line1\nline2');
  });
});
