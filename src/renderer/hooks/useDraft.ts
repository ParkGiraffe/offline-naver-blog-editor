import { useEffect, useState } from 'react';

export type DraftData = { frontmatter: any; doc: any; meta: any };

export function useDraft(slug: string) {
  const [data, setData] = useState<DraftData | null>(null);
  useEffect(() => {
    let alive = true;
    window.giraffe.loadDraft(slug).then((d) => { if (alive) setData(d); });
    return () => { alive = false; };
  }, [slug]);
  return data;
}
