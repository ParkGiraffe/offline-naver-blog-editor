import { useEffect, useState } from 'react';

export type MacroState = {
  running: boolean;
  i?: number;
  n?: number;
  kind?: string;
  detail?: string;
  error?: string;
};

export function useMacroProgress() {
  const [state, setState] = useState<MacroState>({ running: false });

  useEffect(() => {
    return window.giraffe.onMacroProgress((e: any) => {
      if (e.type === 'progress') {
        setState({ running: true, i: e.i, n: e.n, kind: e.kind, detail: e.detail });
      } else if (e.type === 'done') {
        setState((s) => ({ ...s, running: false, error: e.ok ? undefined : e.error }));
      }
    });
  }, []);

  return state;
}
