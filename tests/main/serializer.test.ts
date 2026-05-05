import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { scriptMdToTiptap } from '@main/serializer';

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
