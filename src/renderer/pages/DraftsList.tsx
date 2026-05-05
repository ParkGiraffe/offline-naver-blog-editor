import { useEffect, useMemo, useState } from 'react';

type Draft = { slug: string; title: string; category: string; date: string; mtime: number };

export default function DraftsList({ onOpen }: { onOpen: (slug: string) => void }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');

  useEffect(() => {
    window.giraffe.listDrafts().then(setDrafts);
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

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        Drafts
        <button onClick={create} style={{ fontSize: 14, padding: '4px 12px' }}>+ 새 글</button>
      </h2>
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
            <li key={d.slug} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <a onClick={() => onOpen(d.slug)} style={{ cursor: 'pointer', color: '#212529' }}>
                <strong>{d.title}</strong>
                <span style={{ color: '#888', marginLeft: 8, fontSize: 13 }}>
                  {d.category} · {d.date}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
