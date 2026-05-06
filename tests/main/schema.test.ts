import { describe, expect, it } from 'vitest';
import { DraftMetaSchema, ScriptFrontmatterSchema } from '@shared/schema';

describe('드래프트 메타 검증', () => {
  it('유효한 메타를 그대로 통과시킨다', () => {
    const meta = {
      title_candidates: ['a', 'b', 'c', 'd', 'e'],
      hashtags: ['#포코피아'],
      category: '포코피아',
      length: 'normal',
    };
    expect(DraftMetaSchema.parse(meta)).toEqual(meta);
  });

  it('제목 후보가 비어있으면 거부한다', () => {
    expect(() =>
      DraftMetaSchema.parse({ title_candidates: [], hashtags: [], category: '' }),
    ).toThrow();
  });
});

describe('스크립트 프론트매터 검증', () => {
  it('제목·카테고리·날짜만 있으면 통과한다', () => {
    const fm = { title: 'x', category: 'y', date: '2026-05-05' };
    expect(ScriptFrontmatterSchema.parse(fm)).toEqual(fm);
  });
});
