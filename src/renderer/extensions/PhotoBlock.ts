import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface PhotoBlockOptions {
  onPaste: () => Promise<string | null>;
  resolveSrc: (rel: string) => string;
}

export const PhotoBlock = Node.create<PhotoBlockOptions>({
  name: 'photoBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return {
      onPaste: async () => null,
      resolveSrc: (r) => r,
    };
  },

  addAttributes() {
    return {
      src: { default: '' },
      alt: { default: '' },
    };
  },

  parseHTML() { return [{ tag: 'img[data-photo-block]' }]; },

  renderHTML({ HTMLAttributes }) {
    const resolved = this.options.resolveSrc(HTMLAttributes.src as string);
    return ['img', mergeAttributes(HTMLAttributes, {
      'data-photo-block': 'true',
      src: resolved,
      style: 'max-width:100%;display:block;margin:8px 0;border-radius:6px;',
    })];
  },

  addProseMirrorPlugins() {
    const { onPaste } = this.options;
    const type = this.type;
    return [
      new Plugin({
        key: new PluginKey('photoBlockPaste'),
        props: {
          handlePaste: (view, event) => {
            const items = (event as ClipboardEvent).clipboardData?.items;
            if (!items) return false;
            for (const it of items) {
              if (it.type.startsWith('image/')) {
                event.preventDefault();
                onPaste().then((rel) => {
                  if (!rel) return;
                  const tr = view.state.tr.replaceSelectionWith(type.create({ src: rel, alt: '' }));
                  view.dispatch(tr);
                });
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});
