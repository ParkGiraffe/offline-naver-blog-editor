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

describe('saveClipboardImage', () => {
  beforeEach(() => { isEmpty = false; });

  it('writes a PNG and returns images/<n>-<hash>.png', () => {
    const dir = mkdtempSync(join(tmpdir(), 'images-'));
    const rel = saveClipboardImage(dir);
    expect(rel).toMatch(/^images\/\d+-[0-9a-f]+\.png$/);
    const fname = rel!.split('/').pop()!;
    expect(existsSync(join(dir, fname))).toBe(true);
    expect(readdirSync(dir)).toHaveLength(1);
  });

  it('returns null when clipboard has no image', () => {
    isEmpty = true;
    const dir = mkdtempSync(join(tmpdir(), 'images-'));
    expect(saveClipboardImage(dir)).toBeNull();
    expect(readdirSync(dir)).toHaveLength(0);
  });

  it('uses a counter so two pastes with the same buffer get distinct names', () => {
    const dir = mkdtempSync(join(tmpdir(), 'images-'));
    const a = saveClipboardImage(dir)!;
    const b = saveClipboardImage(dir)!;
    expect(a).not.toBe(b);
    expect(readdirSync(dir)).toHaveLength(2);
  });
});
