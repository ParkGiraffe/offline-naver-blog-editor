import { Node, nodeInputRule } from '@tiptap/core';

export const Divider = Node.create({
  name: 'divider',
  group: 'block',
  atom: true,

  parseHTML() { return [{ tag: 'hr' }]; },

  renderHTML() {
    return ['hr', { style: 'border:0;border-top:1px solid #ccc;margin:16px 0;' }];
  },

  addInputRules() {
    return [nodeInputRule({ find: /^---\s$/, type: this.type })];
  },
});
