import { clipboard } from 'electron';
import { writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

export function saveClipboardImage(imagesDir: string): string | null {
  const img = clipboard.readImage();
  if (img.isEmpty()) return null;
  const buf = img.toPNG();
  const hash = createHash('sha256').update(buf).digest('hex').slice(0, 8);
  const existing = readdirSync(imagesDir).filter((n) => n.endsWith('.png')).length;
  const name = `${existing + 1}-${hash}.png`;
  writeFileSync(join(imagesDir, name), buf);
  return `images/${name}`;
}
