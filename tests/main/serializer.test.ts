import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { scriptMdToTiptap, tiptapToScriptMd } from '@main/serializer';

const fix = (p: string) => readFileSync(join(__dirname, '../fixtures/sample-drafts', p), 'utf8');

describe('script.md → TipTap', () => {
  it('프론트매터를 별도 객체로 분리한다', () => {
    const { frontmatter } = scriptMdToTiptap(fix('basic/script.md'));
    expect(frontmatter).toEqual({ title: '테스트 글', category: '잡담', date: '2026-05-05' });
  });

  it('# 제목은 본문에서 제외하고 프론트매터에만 둔다', () => {
    const { doc } = scriptMdToTiptap(fix('basic/script.md'));
    expect(doc.content.some((n: any) => n.type === 'heading')).toBe(false);
  });

  it('## 줄은 섹션 헤딩 노드가 된다', () => {
    const { doc } = scriptMdToTiptap(fix('basic/script.md'));
    const sections = doc.content.filter((n: any) => n.type === 'sectionHeading');
    expect(sections.map((s: any) => s.content[0].text)).toEqual(['첫 섹션', '두 번째 섹션']);
  });

  it('![](경로)는 사진 블록이 된다', () => {
    const { doc } = scriptMdToTiptap(fix('basic/script.md'));
    const photos = doc.content.filter((n: any) => n.type === 'photoBlock');
    expect(photos[0].attrs.src).toBe('images/1.png');
  });

  it('--- 줄은 구분선이 된다', () => {
    const { doc } = scriptMdToTiptap(fix('basic/script.md'));
    expect(doc.content.some((n: any) => n.type === 'divider')).toBe(true);
  });

  it('굵게·기울임·링크 인라인 마크가 보존된다', () => {
    const { doc } = scriptMdToTiptap(fix('basic/script.md'));
    const allInline: any[] = doc.content.flatMap((n: any) => n.content || []);
    expect(allInline.some((t: any) => t.marks?.some((m: any) => m.type === 'bold'))).toBe(true);
    expect(allInline.some((t: any) => t.marks?.some((m: any) => m.type === 'italic'))).toBe(true);
    const linked = allInline.find((t: any) => t.marks?.some((m: any) => m.type === 'link'));
    expect(linked?.marks.find((m: any) => m.type === 'link').attrs.href).toBe('https://example.com');
  });
});

describe('script.md ↔ TipTap 라운드트립', () => {
  it('기본 픽스처는 바이트 단위로 동일하다', () => {
    const raw = fix('basic/script.md');
    const { frontmatter, doc } = scriptMdToTiptap(raw);
    expect(tiptapToScriptMd(frontmatter, doc)).toBe(raw);
  });

  it('인라인 마크 풀세트가 들어가도 바이트 단위로 동일하다', () => {
    const raw = fix('marks/script.md');
    const { frontmatter, doc } = scriptMdToTiptap(raw);
    expect(tiptapToScriptMd(frontmatter, doc)).toBe(raw);
  });
});

describe('파서 엣지 케이스', () => {
  const fmHeader = '---\ntitle: t\ncategory: c\ndate: 2026-05-05\n---\n\n# t\n\n';

  it('굵게 영역 안에 별표 한 개가 있어도 굵게로 인식한다', () => {
    const { doc } = scriptMdToTiptap(fmHeader + '**a*b** end\n');
    const para = doc.content.find((n) => n.type === 'paragraph')!;
    const bold = (para.content as any[]).find((c) => c.marks?.some((m: any) => m.type === 'bold'));
    expect(bold.text).toBe('a*b');
  });

  it('Windows 줄바꿈도 본문에 \\r 없이 정상 파싱한다', () => {
    const { doc } = scriptMdToTiptap(fmHeader.replace(/\n/g, '\r\n') + 'line1\r\nline2\r\n');
    const para = doc.content.find((n) => n.type === 'paragraph')!;
    const text = (para.content as any[]).map((c) => c.text).join('');
    expect(text).not.toContain('\r');
    expect(text).toBe('line1\nline2');
  });
});
