import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mkdtempSync, existsSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const fakePng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...new Array(100).fill(0)]);

let isEmpty = false;
vi.mock('electron', () => ({
  clipboard: {
    readImage: () => ({
      isEmpty: () => isEmpty,
      toPNG: () => fakePng,
    }),
  },
}));

import { saveClipboardImage } from '@main/clipboardImage';

describe('클립보드 이미지 저장', () => {
  beforeEach(() => { isEmpty = false; });

  it('클립보드 이미지를 PNG로 저장하고 상대 경로를 돌려준다', () => {
    const dir = mkdtempSync(join(tmpdir(), 'images-'));
    const rel = saveClipboardImage(dir);
    expect(rel).toMatch(/^images\/\d+-[0-9a-f]+\.png$/);
    const fname = rel!.split('/').pop()!;
    expect(existsSync(join(dir, fname))).toBe(true);
    expect(readdirSync(dir)).toHaveLength(1);
  });

  it('클립보드에 이미지가 없으면 저장하지 않고 null을 돌려준다', () => {
    isEmpty = true;
    const dir = mkdtempSync(join(tmpdir(), 'images-'));
    expect(saveClipboardImage(dir)).toBeNull();
    expect(readdirSync(dir)).toHaveLength(0);
  });

  it('같은 이미지를 두 번 붙여도 별도 파일로 저장된다', () => {
    const dir = mkdtempSync(join(tmpdir(), 'images-'));
    const a = saveClipboardImage(dir)!;
    const b = saveClipboardImage(dir)!;
    expect(a).not.toBe(b);
    expect(readdirSync(dir)).toHaveLength(2);
  });
});
