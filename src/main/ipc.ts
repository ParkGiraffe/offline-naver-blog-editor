export const Channels = {
  getCorpusPath: 'corpus:get',
  setCorpusPath: 'corpus:set',
  listDrafts: 'drafts:list',
  loadDraft: 'drafts:load',
  saveDraft: 'drafts:save',
  createDraft: 'drafts:create',
  pasteImage: 'drafts:pasteImage',
  dropImage: 'drafts:dropImage',
  runMacro: 'macro:run',
  cancelMacro: 'macro:cancel',
  macroProgress: 'macro:progress',
} as const;
