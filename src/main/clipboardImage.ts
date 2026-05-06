import { clipboard } from 'electron';
import { writeFileSync, readdirSync } from 'fs';
import { extname, join } from 'path';
import { createHash } from 'crypto';

export function saveClipboardImage(imagesDir: string): string | null {
  const img = clipboard.readImage();
  if (img.isEmpty()) return null;
  const buf = img.toPNG();
  return writeBuffer(imagesDir, buf, '.png');
}

export function saveDroppedImage(imagesDir: string, originalName: string, buf: Buffer): string | null {
  if (!buf || buf.length === 0) return null;
  const ext = (extname(originalName).toLowerCase() || '.png');
  const allowed = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);
  return writeBuffer(imagesDir, buf, allowed.has(ext) ? ext : '.png');
}

function writeBuffer(imagesDir: string, buf: Buffer, ext: string): string {
  const hash = createHash('sha256').update(buf).digest('hex').slice(0, 8);
  const existing = readdirSync(imagesDir).filter((n) => /\.(png|jpe?g|gif|webp)$/i.test(n)).length;
  const name = `${existing + 1}-${hash}${ext}`;
  writeFileSync(join(imagesDir, name), buf);
  return `images/${name}`;
}
