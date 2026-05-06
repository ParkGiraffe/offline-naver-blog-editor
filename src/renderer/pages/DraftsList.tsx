import { useEffect, useMemo, useState } from 'react';

type Draft = { slug: string; title: string; category: string; date: string; mtime: number };

interface Props {
  onOpen: (slug: string) => void;
  onChangeCorpus: () => void;
}

export default function DraftsList({ onOpen, onChangeCorpus }: Props) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [corpusPath, setCorpusPath] = useState<string | undefined>(undefined);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');

  const refresh = () => window.giraffe.listDrafts().then(setDrafts);

  useEffect(() => {
    refresh();
    window.giraffe.getCorpusPath().then(setCorpusPath);
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(drafts.map((d) => d.category).filter(Boolean))).sort(),
    [drafts],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return drafts.filter((d) => {
      if (cat && d.category !== cat) return false;
      if (needle && !d.title.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [drafts, q, cat]);

  const create = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const slug = await window.giraffe.createDraft({ title: '새 글', category: cat || '잡담', date: today });
    onOpen(slug);
  };

  const removeOne = async (d: Draft) => {
    if (!window.confirm(`"${d.title}" 삭제할까요?\n폴더 전체(이미지 포함)가 사라지고 되돌릴 수 없습니다.`)) return;
    await window.giraffe.deleteDraft(d.slug);
    await refresh();
  };

  const removeAll = async () => {
    if (drafts.length === 0) return;
    const first = window.confirm(
      `드래프트 ${drafts.length}개를 모두 삭제할까요?\n` +
      `posts/, style-guide.md 같은 학습 데이터는 보존됩니다.`,
    );
    if (!first) return;
    const second = window.prompt('확인을 위해 "삭제"라고 입력하세요.');
    if (second?.trim() !== '삭제') return;
    const removed = await window.giraffe.deleteAllDrafts();
    await refresh();
    window.alert(`${removed}개 삭제 완료.`);
  };

  const openCorpusInFinder = () => {
    if (corpusPath) window.giraffe.openInFinder(corpusPath);
  };

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        Drafts
        <button onClick={create} style={{ fontSize: 14, padding: '4px 12px' }}>+ 새 글</button>
        <span style={{ flex: 1 }} />
        {drafts.length > 0 && (
          <button onClick={removeAll} style={dangerButtonStyle}>전체 삭제</button>
        )}
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#666', margin: '4px 0 12px' }}>
        <span>corpus:</span>
        <code style={{ flex: 1, padding: '2px 6px', background: '#f6f6f8', borderRadius: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {corpusPath || '(미설정)'}
        </code>
        <button onClick={openCorpusInFinder} disabled={!corpusPath} style={subtleButtonStyle}>📁 Finder</button>
        <button onClick={onChangeCorpus} style={subtleButtonStyle}>변경</button>
      </div>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="제목 검색"
          style={{ flex: 1, padding: 6 }}
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)} style={{ padding: 6 }}>
          <option value="">모든 카테고리</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? (
        <p style={{ color: '#888' }}>{drafts.length === 0 ? '드래프트 없음' : '결과 없음'}</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filtered.map((d) => (
            <li key={d.slug} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <a onClick={() => onOpen(d.slug)} style={{ cursor: 'pointer', color: '#212529', flex: 1 }}>
                <strong>{d.title}</strong>
                <span style={{ color: '#888', marginLeft: 8, fontSize: 13 }}>
                  {d.category} · {d.date}
                </span>
              </a>
              <button
                onClick={() => removeOne(d)}
                aria-label={`${d.title} 삭제`}
                title="삭제"
                style={{ background: 'transparent', border: 0, color: '#c00', cursor: 'pointer', padding: '4px 8px', fontSize: 16 }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const dangerButtonStyle: React.CSSProperties = {
  fontSize: 12, padding: '4px 10px', color: '#c00',
  background: 'transparent', border: '1px solid #fbb', borderRadius: 4,
};

const subtleButtonStyle: React.CSSProperties = {
  fontSize: 11, padding: '2px 8px', color: '#444',
  background: 'transparent', border: '1px solid #ddd', borderRadius: 3, cursor: 'pointer',
};
