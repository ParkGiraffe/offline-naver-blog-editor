import { useState } from 'react';

export default function Setup({ onDone }: { onDone: () => void }) {
  const [path, setPath] = useState('/Users/bag-yoseb/Desktop/Project/personal/blog/.claude/blog-corpus');
  return (
    <div style={{ padding: 32, maxWidth: 600 }}>
      <h2>Corpus 경로</h2>
      <p>블로그 corpus 폴더(`drafts/`가 있는 디렉토리)를 지정하세요.</p>
      <input
        value={path}
        onChange={(e) => setPath(e.target.value)}
        style={{ width: '100%', padding: 8, fontFamily: 'monospace' }}
      />
      <button
        onClick={async () => { await window.giraffe.setCorpusPath(path); onDone(); }}
        style={{ marginTop: 12, padding: '6px 14px' }}
      >
        저장
      </button>
    </div>
  );
}
