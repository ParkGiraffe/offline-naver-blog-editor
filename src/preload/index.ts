import { contextBridge, ipcRenderer } from 'electron';
import { Channels } from '../main/ipc';

contextBridge.exposeInMainWorld('giraffe', {
  getCorpusPath: () => ipcRenderer.invoke(Channels.getCorpusPath),
  setCorpusPath: (p: string) => ipcRenderer.invoke(Channels.setCorpusPath, p),
  listDrafts: () => ipcRenderer.invoke(Channels.listDrafts),
  loadDraft: (slug: string) => ipcRenderer.invoke(Channels.loadDraft, slug),
  saveDraft: (slug: string, fm: any, doc: any, meta: any) =>
    ipcRenderer.invoke(Channels.saveDraft, slug, fm, doc, meta),
  createDraft: (fm: any) => ipcRenderer.invoke(Channels.createDraft, fm),
  deleteDraft: (slug: string) => ipcRenderer.invoke(Channels.deleteDraft, slug),
  deleteAllDrafts: () => ipcRenderer.invoke(Channels.deleteAllDrafts),
  pasteImage: (slug: string) => ipcRenderer.invoke(Channels.pasteImage, slug),
  dropImage: (slug: string, name: string, bytes: Uint8Array) =>
    ipcRenderer.invoke(Channels.dropImage, slug, name, bytes),
  runMacro: (slug: string) => ipcRenderer.invoke(Channels.runMacro, slug),
  cancelMacro: () => ipcRenderer.invoke(Channels.cancelMacro),
  onMacroProgress: (cb: (e: any) => void) => {
    const h = (_: any, payload: any) => cb(payload);
    ipcRenderer.on(Channels.macroProgress, h);
    return () => ipcRenderer.removeListener(Channels.macroProgress, h);
  },
  openInFinder: (path: string) => ipcRenderer.invoke(Channels.openInFinder, path),
  pickCorpusPath: () => ipcRenderer.invoke(Channels.pickCorpusPath),
});
