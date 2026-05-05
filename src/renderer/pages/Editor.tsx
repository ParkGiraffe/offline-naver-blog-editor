import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import { useDraft } from '../hooks/useDraft';
import { useAutoSave } from '../hooks/useAutoSave';
import { SectionHeading } from '../extensions/SectionHeading';

export default function Editor({ slug, onBack }: { slug: string; onBack: () => void }) {
  const initial = useDraft(slug);
  const [fm, setFm] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);

  const editor = useEditor({
    extensions: [StarterKit, SectionHeading],
    content: initial?.doc,
  }, [initial?.doc]);

  useEffect(() => {
    if (initial) {
      setFm(initial.frontmatter);
      setMeta(initial.meta);
    }
  }, [initial]);

  const doc = editor?.getJSON();
  useAutoSave(slug, fm, doc, meta, !!fm && !!doc);

  if (!initial) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={onBack}>← 글 목록</button>
        <span style={{ color: '#888', fontSize: 13 }}>자동 저장됨</span>
      </div>
      <input
        value={fm?.title || ''}
        onChange={(e) => setFm({ ...fm, title: e.target.value })}
        placeholder="제목"
        style={{
          display: 'block',
          width: '100%',
          fontSize: 28,
          fontWeight: 700,
          padding: '10px 0',
          border: 0,
          outline: 'none',
          marginBottom: 16,
        }}
      />
      <EditorContent
        editor={editor}
        style={{ minHeight: 400, fontSize: 16, lineHeight: 1.7 }}
      />
    </div>
  );
}
