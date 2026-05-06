export interface GiraffeBridge {
  getCorpusPath(): Promise<string | undefined>;
  setCorpusPath(p: string): Promise<void>;
  listDrafts(): Promise<Array<{ slug: string; title: string; category: string; date: string; mtime: number }>>;
  loadDraft(slug: string): Promise<{ frontmatter: any; doc: any; meta: any }>;
  saveDraft(slug: string, fm: any, doc: any, meta: any): Promise<void>;
  createDraft(fm: any): Promise<string>;
  deleteDraft(slug: string): Promise<void>;
  deleteAllDrafts(): Promise<number>;
  pasteImage(slug: string): Promise<string | null>;
  dropImage(slug: string, name: string, bytes: Uint8Array): Promise<string | null>;
  runMacro(slug: string): Promise<void>;
  cancelMacro(): Promise<void>;
  onMacroProgress(cb: (e: { type: 'progress'; i: number; n: number; kind: string; detail?: string } | { type: 'done'; ok: boolean; error?: string }) => void): () => void;
  openInFinder(path: string): Promise<void>;
  pickCorpusPath(): Promise<string | null>;
}

declare global { interface Window { giraffe: GiraffeBridge; } }

export {};
