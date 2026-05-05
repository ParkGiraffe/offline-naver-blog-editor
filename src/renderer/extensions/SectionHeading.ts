import { Node, mergeAttributes, textblockTypeInputRule } from '@tiptap/core';

export const SectionHeading = Node.create({
  name: 'sectionHeading',
  group: 'block',
  content: 'text*',
  marks: '',
  defining: true,

  parseHTML() {
    return [{ tag: 'h2[data-section]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'h2',
      mergeAttributes(HTMLAttributes, {
        'data-section': 'true',
        style: 'font-size:24px;background-color:#fff593;font-weight:700;padding:2px 6px;display:inline-block;margin:12px 0;',
      }),
      0,
    ];
  },

  addInputRules() {
    return [textblockTypeInputRule({ find: /^##\s$/, type: this.type })];
  },
});
