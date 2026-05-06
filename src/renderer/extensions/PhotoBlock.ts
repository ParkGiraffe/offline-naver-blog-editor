import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface PhotoBlockOptions {
  onPaste: () => Promise<string | null>;
  onDrop: (file: File) => Promise<string | null>;
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
      onDrop: async () => null,
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
    const { onPaste, onDrop } = this.options;
    const type = this.type;

    const insertAt = (view: any, pos: number, rel: string) => {
      const node = type.create({ src: rel, alt: '' });
      const tr = view.state.tr.insert(pos, node);
      view.dispatch(tr);
    };

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
          handleDrop: (view, event, _slice, _moved) => {
            const e = event as DragEvent;
            const files = Array.from(e.dataTransfer?.files || []).filter(
              (f) => f.type.startsWith('image/'),
            );
            if (files.length === 0) return false;
            e.preventDefault();
            const coords = view.posAtCoords({ left: e.clientX, top: e.clientY });
            const insertPos = coords?.pos ?? view.state.selection.from;
            (async () => {
              let pos = insertPos;
              for (const f of files) {
                const rel = await onDrop(f);
                if (!rel) continue;
                insertAt(view, pos, rel);
                pos += 1;
              }
            })();
            return true;
          },
        },
      }),
    ];
  },
});
