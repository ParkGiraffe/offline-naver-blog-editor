import { describe, expect, it } from 'vitest';
import { DraftMetaSchema, ScriptFrontmatterSchema } from '@shared/schema';

describe('DraftMetaSchema', () => {
  it('parses valid meta', () => {
    const meta = {
      title_candidates: ['a','b','c','d','e'],
      hashtags: ['#포코피아'],
      category: '포코피아',
      length: 'normal',
    };
    expect(DraftMetaSchema.parse(meta)).toEqual(meta);
  });
  it('rejects empty title_candidates', () => {
    expect(() => DraftMetaSchema.parse({ title_candidates: [], hashtags: [], category: '' })).toThrow();
  });
});

describe('ScriptFrontmatterSchema', () => {
  it('parses minimal frontmatter', () => {
    const fm = { title: 'x', category: 'y', date: '2026-05-05' };
    expect(ScriptFrontmatterSchema.parse(fm)).toEqual(fm);
  });
});
