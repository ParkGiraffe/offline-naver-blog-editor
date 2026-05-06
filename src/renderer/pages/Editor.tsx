import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import { useDraft } from '../hooks/useDraft';
import { useAutoSave } from '../hooks/useAutoSave';
import { SectionHeading } from '../extensions/SectionHeading';
import { Divider } from '../extensions/Divider';
import { PhotoBlock } from '../extensions/PhotoBlock';
import { inlineMarks } from '../extensions/inlineMarks';
import { SlashMenu } from '../extensions/SlashMenu';
import FloatingToolbar from '../components/FloatingToolbar';
import MetaPanel from '../components/MetaPanel';
import Toast from '../components/Toast';
import { useMacroProgress } from '../hooks/useMacroProgress';
import { buildCorpusImageUrl } from '@shared/corpusImageUrl';

export default function Editor({ slug, onBack }: { slug: string; onBack: () => void }) {
  const initial = useDraft(slug);
  const [fm, setFm] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);
  const [metaOpen, setMetaOpen] = useState(false);
  const [macroState, markStarting] = useMacroProgress();

  const editor = useEditor({
    extensions: [
      StarterKit,
      SectionHeading,
      Divider,
      PhotoBlock.configure({
        onPaste: () => window.giraffe.pasteImage(slug),
        resolveSrc: (rel) => buildCorpusImageUrl(slug, rel),
      }),
      ...inlineMarks,
      SlashMenu,
    ],
    content: initial?.doc,
  }, [initial?.doc]);

  const send = async () => {
    if (!editor || !fm) return;
    const json = editor.getJSON();
    markStarting();
    await window.giraffe.saveDraft(slug, fm, json, meta);
    await window.giraffe.runMacro(slug);
  };

  useEffect(() => {
    if (initial) {
      setFm(initial.frontmatter);
      setMeta(initial.meta);
    }
  }, [initial]);

  const doc = editor?.getJSON();
  useAutoSave(slug, fm, doc, meta, !!fm && !!doc);

  // Drop handler attached at the window level so we always receive image
  // file drops. App.tsx prevents the default file:// navigation.
  useEffect(() => {
    if (!editor) return;
    const onDrop = async (e: DragEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest('.ProseMirror')) return;
      const imageFiles = Array.from(e.dataTransfer?.files || []).filter((f) =>
        f.type.startsWith('image/'),
      );
      if (imageFiles.length === 0) return;
      e.preventDefault();
      e.stopPropagation();
      try {
        const coords = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
        let pos = coords?.pos ?? editor.state.selection.from;
        for (const f of imageFiles) {
          const bytes = new Uint8Array(await f.arrayBuffer());
          const rel = await window.giraffe.dropImage(slug, f.name || 'image.png', bytes);
          if (!rel) continue;
          editor.chain().insertContentAt(pos, { type: 'photoBlock', attrs: { src: rel, alt: '' } }).run();
          pos += 1;
        }
      } catch (err) {
        window.alert('이미지 추가 실패: ' + (err as Error).message);
      }
    };
    window.addEventListener('drop', onDrop, { capture: true });
    return () => window.removeEventListener('drop', onDrop, { capture: true });
  }, [editor, slug]);

  if (!initial) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={onBack}>← 글 목록</button>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: '#888', fontSize: 13 }}>자동 저장됨</span>
          <button onClick={() => setMetaOpen(true)} style={{ padding: '4px 10px' }}>ⓘ 메타</button>
          <button
            onClick={send}
            style={{ background: '#19ce60', color: 'white', padding: '6px 14px', border: 0, borderRadius: 4 }}
          >
            보내기
          </button>
        </div>
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
      <FloatingToolbar editor={editor} />
      <MetaPanel
        open={metaOpen}
        onClose={() => setMetaOpen(false)}
        meta={meta}
        onChange={setMeta}
      />
      <Toast state={macroState} onCancel={() => window.giraffe.cancelMacro()} />
    </div>
  );
}
