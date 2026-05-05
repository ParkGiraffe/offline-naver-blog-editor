import { Editor, BubbleMenu } from '@tiptap/react';

const btn = (label: string, onClick: () => void, active = false) => (
  <button
    key={label}
    onClick={onClick}
    style={{
      padding: '4px 10px',
      background: active ? '#fff593' : 'white',
      border: '1px solid #ddd',
      borderRadius: 4,
      cursor: 'pointer',
      fontSize: 13,
    }}
  >
    {label}
  </button>
);

export default function FloatingToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
      <div style={{
        display: 'flex', gap: 4, padding: 4, background: 'white',
        border: '1px solid #ccc', borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        {btn('B', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
        {btn('I', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
        {btn('U', () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'))}
        {btn('형광', () => editor.chain().focus().toggleHighlight().run(), editor.isActive('highlight'))}
        {btn('🔗', () => {
          const href = window.prompt('링크 URL:');
          if (href) editor.chain().focus().setLink({ href }).run();
        })}
      </div>
    </BubbleMenu>
  );
}
