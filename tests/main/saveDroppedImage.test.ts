import { describe, expect, it, vi } from 'vitest';
import { mkdtempSync, existsSync, readdirSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

vi.mock('electron', () => ({
  clipboard: { readImage: () => ({ isEmpty: () => true }) },
}));

import { saveDroppedImage } from '@main/clipboardImage';

describe('드롭한 이미지 저장', () => {
  it('버퍼를 해시 + 카운터 이름으로 저장하고 상대 경로를 돌려준다', () => {
    const dir = mkdtempSync(join(tmpdir(), 'images-'));
    const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4, 5]);
    const rel = saveDroppedImage(dir, 'photo.jpg', buf);
    expect(rel).toMatch(/^images\/\d+-[0-9a-f]+\.jpg$/);
    const fname = rel!.split('/').pop()!;
    expect(existsSync(join(dir, fname))).toBe(true);
    expect(readFileSync(join(dir, fname))).toEqual(buf);
  });

  it('빈 버퍼는 저장하지 않고 null을 돌려준다', () => {
    const dir = mkdtempSync(join(tmpdir(), 'images-'));
    expect(saveDroppedImage(dir, 'x.png', Buffer.alloc(0))).toBeNull();
    expect(readdirSync(dir)).toHaveLength(0);
  });

  it('지원하지 않는 확장자는 .png로 저장한다', () => {
    const dir = mkdtempSync(join(tmpdir(), 'images-'));
    const rel = saveDroppedImage(dir, 'no-ext-or-weird.exe', Buffer.from('aaa'));
    expect(rel).toMatch(/\.png$/);
  });

  it('여러 번 저장하면 파일 이름의 카운터가 증가한다', () => {
    const dir = mkdtempSync(join(tmpdir(), 'images-'));
    const a = saveDroppedImage(dir, 'a.png', Buffer.from('aaa'))!;
    const b = saveDroppedImage(dir, 'b.png', Buffer.from('bbb'))!;
    expect(a).not.toBe(b);
    expect(a.startsWith('images/1-')).toBe(true);
    expect(b.startsWith('images/2-')).toBe(true);
  });
});
