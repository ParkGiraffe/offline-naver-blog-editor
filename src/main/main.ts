import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { Channels } from './ipc';
import { Corpus } from './corpus';
import { DraftStore } from './draftStore';
import { saveClipboardImage } from './clipboardImage';
import { runMacro, cancelMacro } from './macroRunner';

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
    },
  });
  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

const corpus = new Corpus();
function store(): DraftStore {
  const p = corpus.getPath();
  if (!p) throw new Error('corpus path not set');
  return new DraftStore(p);
}

app.whenReady().then(() => {
  ipcMain.handle(Channels.getCorpusPath, () => corpus.getPath());
  ipcMain.handle(Channels.setCorpusPath, (_e, p: string) => corpus.setPath(p));
  ipcMain.handle(Channels.listDrafts, () => corpus.listDrafts());
  ipcMain.handle(Channels.loadDraft, (_e, slug: string) => store().load(slug));
  ipcMain.handle(Channels.saveDraft, (_e, slug: string, fm: any, doc: any, meta: any) =>
    store().save(slug, fm, doc, meta));
  ipcMain.handle(Channels.createDraft, (_e, fm: any) => store().create(fm));
  ipcMain.handle(Channels.pasteImage, (_e, slug: string) =>
    saveClipboardImage(store().imagesDir(slug)));
  ipcMain.handle(Channels.runMacro, (e, slug: string) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    if (!win) throw new Error('no window');
    runMacro(store().draftPath(slug), win);
  });
  ipcMain.handle(Channels.cancelMacro, () => cancelMacro());

  createWindow();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
