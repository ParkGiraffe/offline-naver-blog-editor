import { useEffect, useRef } from 'react';

export function useAutoSave(slug: string, fm: any, doc: any, meta: any, enabled: boolean) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!enabled) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      window.giraffe.saveDraft(slug, fm, doc, meta).catch((e) => console.error('save failed', e));
    }, 800);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [slug, fm, doc, meta, enabled]);
}
