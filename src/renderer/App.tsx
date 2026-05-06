import { useEffect, useState } from 'react';
import Setup from './pages/Setup';
import DraftsList from './pages/DraftsList';
import Editor from './pages/Editor';
import './shared/types';  // ensure window.giraffe global is registered

type Route = { name: 'list' } | { name: 'editor'; slug: string } | { name: 'setup' } | { name: 'loading' };

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'loading' });

  useEffect(() => {
    window.giraffe.getCorpusPath().then((p) =>
      setRoute(p ? { name: 'list' } : { name: 'setup' })
    );
  }, []);

  // Prevent the default Electron behavior of navigating to a file:// URL
  // when an image is dragged onto the window. Lets ProseMirror's handleDrop fire.
  useEffect(() => {
    const onDragOver = (e: DragEvent) => { e.preventDefault(); };
    const onDrop = (e: DragEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest('.ProseMirror')) {
        e.preventDefault();
      }
    };
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  }, []);

  if (route.name === 'loading') return <div style={{ padding: 24 }}>Loading…</div>;
  if (route.name === 'setup') return <Setup onDone={() => setRoute({ name: 'list' })} />;
  if (route.name === 'list') return <DraftsList onOpen={(slug) => setRoute({ name: 'editor', slug })} />;
  return <Editor slug={route.slug} onBack={() => setRoute({ name: 'list' })} />;
}
