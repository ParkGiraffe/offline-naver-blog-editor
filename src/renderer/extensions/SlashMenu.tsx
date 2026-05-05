import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { Editor } from '@tiptap/core';
import { forwardRef, useImperativeHandle, useState } from 'react';

type Item = { title: string; run: (editor: Editor, range: { from: number; to: number }) => void };

const ITEMS: Item[] = [
  {
    title: '섹션 타이틀',
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).setNode('sectionHeading').run();
    },
  },
  {
    title: '구분선',
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).insertContent({ type: 'divider' }).run();
    },
  },
];

interface MenuProps {
  editor: Editor;
  range: { from: number; to: number };
  command: (item: Item) => void;
}

const Menu = forwardRef<{ onKeyDown: (e: { event: KeyboardEvent }) => boolean }, MenuProps>((props, ref) => {
  const [idx, setIdx] = useState(0);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowDown') { setIdx((idx + 1) % ITEMS.length); return true; }
      if (event.key === 'ArrowUp')   { setIdx((idx + ITEMS.length - 1) % ITEMS.length); return true; }
      if (event.key === 'Enter')     { props.command(ITEMS[idx]); return true; }
      return false;
    },
  }));

  return (
    <div style={{
      background: 'white', border: '1px solid #ddd', borderRadius: 6,
      padding: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', minWidth: 160,
    }}>
      {ITEMS.map((it, i) => (
        <div
          key={it.title}
          onClick={() => props.command(it)}
          style={{
            padding: '6px 12px',
            background: i === idx ? '#fff593' : 'transparent',
            borderRadius: 3, cursor: 'pointer',
          }}
        >
          {it.title}
        </div>
      ))}
    </div>
  );
});
Menu.displayName = 'SlashMenu';

export const SlashMenu = Extension.create({
  name: 'slashMenu',
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        startOfLine: false,
        command: ({ editor, range, props }: any) => {
          (props.item as Item).run(editor, range);
        },
        items: () => ITEMS,
        render: () => {
          let component: ReactRenderer<any>;
          let popup: TippyInstance | null = null;

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(Menu, {
                props: { ...props, command: (item: Item) => props.command({ item }) },
                editor: props.editor,
              });
              popup = tippy(document.body, {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },
            onUpdate: (props: any) => {
              component?.updateProps({ ...props, command: (item: Item) => props.command({ item }) });
              popup?.setProps({ getReferenceClientRect: props.clientRect });
            },
            onKeyDown: (props: any) => {
              if (props.event.key === 'Escape') { popup?.hide(); return true; }
              return component?.ref?.onKeyDown(props) ?? false;
            },
            onExit: () => {
              popup?.destroy();
              component?.destroy();
            },
          };
        },
      }) as any,
    ];
  },
});
