import { spawn, ChildProcess } from 'child_process';
import { BrowserWindow } from 'electron';
import { findPython3, pasteScriptPath } from './pythonResolver';
import { Channels } from './ipc';

let current: ChildProcess | null = null;

export function isRunning(): boolean { return current !== null; }

export function runMacro(draftPath: string, win: BrowserWindow): void {
  if (current) throw new Error('macro already running');
  const py = findPython3();
  const script = pasteScriptPath();
  // stdio: ignore stdin, pipe stdout (human log) and stderr, pipe fd:3 (json progress)
  const child = spawn(py, [script, draftPath, '--json-progress'], {
    stdio: ['ignore', 'pipe', 'pipe', 'pipe'],
  });
  current = child;

  let fd3Buffer = '';
  child.stdio[3]!.on('data', (chunk: Buffer) => {
    fd3Buffer += chunk.toString('utf8');
    let nl: number;
    while ((nl = fd3Buffer.indexOf('\n')) >= 0) {
      const line = fd3Buffer.slice(0, nl).trim();
      fd3Buffer = fd3Buffer.slice(nl + 1);
      if (!line) continue;
      try {
        const payload = JSON.parse(line);
        if (!win.isDestroyed()) {
          win.webContents.send(Channels.macroProgress, payload);
        }
      } catch {
        // malformed line — ignore
      }
    }
  });

  child.on('exit', (code) => {
    current = null;
    if (code !== 0 && !win.isDestroyed()) {
      win.webContents.send(Channels.macroProgress, { type: 'done', ok: false, error: `exit ${code}` });
    }
  });

  child.on('error', (err) => {
    current = null;
    if (!win.isDestroyed()) {
      win.webContents.send(Channels.macroProgress, { type: 'done', ok: false, error: err.message });
    }
  });
}

export function cancelMacro(): void {
  if (current) {
    current.kill('SIGINT');
    current = null;
  }
}
