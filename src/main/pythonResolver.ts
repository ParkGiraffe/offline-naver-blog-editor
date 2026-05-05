import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export function findPython3(): string {
  for (const cmd of ['python3', '/usr/bin/python3', '/opt/homebrew/bin/python3', '/usr/local/bin/python3']) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      return cmd;
    } catch {}
  }
  throw new Error('python3 not found in PATH or common locations');
}

export function pasteScriptPath(): string {
  const p = join(homedir(), '.claude/skills/blog/scripts/paste_to_naver.py');
  if (!existsSync(p)) throw new Error(`paste_to_naver.py not found at ${p}`);
  return p;
}
