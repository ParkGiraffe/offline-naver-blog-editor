import { useEffect, useState } from 'react';

type Draft = { slug: string; title: string; category: string; date: string; mtime: number };

export default function DraftsList({ onOpen }: { onOpen: (slug: string) => void }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    window.giraffe.listDrafts().then(setDrafts);
  }, []);

  const create = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const slug = await window.giraffe.createDraft({ title: '새 글', category: '잡담', date: today });
    onOpen(slug);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        Drafts
        <button onClick={create} style={{ fontSize: 14, padding: '4px 12px' }}>+ 새 글</button>
      </h2>
      {drafts.length === 0 ? (
        <p style={{ color: '#888' }}>드래프트 없음</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {drafts.map((d) => (
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
