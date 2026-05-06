import { describe, expect, it, vi } from 'vitest';
import { mkdtempSync, existsSync, readdirSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

vi.mock('electron', () => ({
  clipboard: { readImage: () => ({ isEmpty: () => true }) },
}));

import { saveDroppedImage } from '@main/clipboardImage';

describe('saveDroppedImage', () => {
  it('writes a buffer with hash + counter naming and returns relative path', () => {
    const dir = mkdtempSync(join(tmpdir(), 'images-'));
    const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4, 5]);
    const rel = saveDroppedImage(dir, 'photo.jpg', buf);
    expect(rel).toMatch(/^images\/\d+-[0-9a-f]+\.jpg$/);
    const fname = rel!.split('/').pop()!;
    expect(existsSync(join(dir, fname))).toBe(true);
    expect(readFileSync(join(dir, fname))).toEqual(buf);
  });

  it('returns null on empty buffer', () => {
    const dir = mkdtempSync(join(tmpdir(), 'images-'));
    expect(saveDroppedImage(dir, 'x.png', Buffer.alloc(0))).toBeNull();
    expect(readdirSync(dir)).toHaveLength(0);
  });

  it('falls back to .png for unknown extension', () => {
    const dir = mkdtempSync(join(tmpdir(), 'images-'));
    const rel = saveDroppedImage(dir, 'no-ext-or-weird.exe', Buffer.from('aaa'));
    expect(rel).toMatch(/\.png$/);
  });

  it('counter increments across multiple saves', () => {
    const dir = mkdtempSync(join(tmpdir(), 'images-'));
    const a = saveDroppedImage(dir, 'a.png', Buffer.from('aaa'))!;
    const b = saveDroppedImage(dir, 'b.png', Buffer.from('bbb'))!;
    expect(a).not.toBe(b);
    expect(a.startsWith('images/1-')).toBe(true);
    expect(b.startsWith('images/2-')).toBe(true);
  });
});
