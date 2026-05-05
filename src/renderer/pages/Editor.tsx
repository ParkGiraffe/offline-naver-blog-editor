export default function Editor({ slug, onBack }: { slug: string; onBack: () => void }) {
  return (
    <div style={{ padding: 24 }}>
      <button onClick={onBack}>← 글 목록</button>
      <h2>{slug}</h2>
      <p style={{ color: '#888' }}>(에디터는 다음 단계에서 구현)</p>
    </div>
  );
}
