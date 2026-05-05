type Meta = {
  title_candidates: string[];
  hashtags: string[];
  category: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  meta: Meta | null;
  onChange: (m: Meta) => void;
  knownCategories?: string[];
}

export default function MetaPanel({ open, onClose, meta, onChange, knownCategories = [] }: Props) {
  if (!open || !meta) return null;

  const update = (patch: Partial<Meta>) => onChange({ ...meta, ...patch });

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: 360,
      background: 'white', borderLeft: '1px solid #e0e0e4', padding: 16,
      boxShadow: '-4px 0 16px rgba(0,0,0,0.06)',
      overflowY: 'auto',
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>메타</h3>
        <button onClick={onClose} style={{ border: 0, background: 'transparent', fontSize: 18, cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>카테고리</label>
        <input
          list="meta-categories"
          value={meta.category}
          onChange={(e) => update({ category: e.target.value })}
          style={{ width: '100%', padding: 6, boxSizing: 'border-box' }}
        />
        <datalist id="meta-categories">
          {knownCategories.map((c) => <option key={c} value={c} />)}
        </datalist>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>해시태그 (콤마로 구분)</label>
        <input
          value={meta.hashtags.join(', ')}
          onChange={(e) => update({ hashtags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          style={{ width: '100%', padding: 6, boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>제목 후보 (한 줄에 하나)</label>
        <textarea
          value={meta.title_candidates.join('\n')}
          onChange={(e) => update({ title_candidates: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
          style={{ width: '100%', height: 140, padding: 6, boxSizing: 'border-box', fontFamily: 'inherit' }}
        />
      </div>
    </div>
  );
}
