import { useState } from 'react';

interface Props {
  onDone: () => void;
  onCancel?: () => void;
  initial?: string;
}

export default function Setup({ onDone, onCancel, initial }: Props) {
  const defaultPath = '/Users/bag-yoseb/Desktop/Project/personal/blog/.claude/blog-corpus';
  const [path, setPath] = useState(initial || defaultPath);

  const browse = async () => {
    const picked = await window.giraffe.pickCorpusPath();
    if (picked) setPath(picked);
  };

  const save = async () => {
    if (!path.trim()) return;
    await window.giraffe.setCorpusPath(path.trim());
    onDone();
  };

  return (
    <div style={{ padding: 32, maxWidth: 600 }}>
      <h2>Corpus 경로</h2>
      <p>블로그 corpus 폴더(`drafts/`가 있는 디렉토리)를 지정하세요.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          style={{ flex: 1, padding: 8, fontFamily: 'monospace' }}
        />
        <button onClick={browse} style={{ padding: '6px 12px' }}>폴더 선택</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={save} style={{ padding: '6px 14px' }}>저장</button>
        {onCancel && (
          <button onClick={onCancel} style={{ padding: '6px 14px', background: 'transparent' }}>
            취소
          </button>
        )}
      </div>
    </div>
  );
}
