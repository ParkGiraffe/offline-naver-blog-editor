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

export default function Editor({ slug, onBack }: { slug: string; onBack: () => void }) {
  const initial = useDraft(slug);
  const [fm, setFm] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);
  const [metaOpen, setMetaOpen] = useState(false);
  const macroState = useMacroProgress();

  const send = async () => {
    if (!editor || !fm) return;
    const json = editor.getJSON();
    const blocks = (json.content || []).length;
    const photos = (json.content || []).filter((n: any) => n.type === 'photoBlock').length;
    const ok = window.confirm(
      `${blocks} 블록 (사진 ${photos}장) 보낼게요.\n` +
      `네이버 블로그 새글 창의 본문 영역을 클릭한 뒤 확인을 누르세요.`
    );
    if (!ok) return;
    await window.giraffe.saveDraft(slug, fm, json, meta);
    await window.giraffe.runMacro(slug);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      SectionHeading,
      Divider,
      PhotoBlock.configure({
        onPaste: () => window.giraffe.pasteImage(slug),
        resolveSrc: (rel) => `corpus-image://${slug}/${encodeURI(rel)}`,
      }),
      ...inlineMarks,
      SlashMenu,
    ],
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

  // Direct DOM-level drop handler — ProseMirror's plugin handleDrop doesn't
  // reliably fire for OS file drops. Capture phase so we win over any
  // ProseMirror internal handling.
  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const onDrop = async (e: DragEvent) => {
      const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith('image/'));
      if (files.length === 0) return;
      e.preventDefault();
      e.stopPropagation();
      const coords = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
      let pos = coords?.pos ?? editor.state.selection.from;
      for (const f of files) {
        const buf = await f.arrayBuffer();
        // Convert to base64 in chunks to avoid stack overflow on large files.
        const bytes = new Uint8Array(buf);
        let bin = '';
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
          bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
        }
        const base64 = btoa(bin);
        const rel = await window.giraffe.dropImage(slug, f.name, base64);
        if (!rel) continue;
        editor.chain().insertContentAt(pos, { type: 'photoBlock', attrs: { src: rel, alt: '' } }).run();
        pos += 1;
      }
    };
    dom.addEventListener('drop', onDrop, { capture: true });
    return () => dom.removeEventListener('drop', onDrop, { capture: true });
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
