import { useEffect, useState } from 'react';

export type MacroState = {
  running: boolean;
  starting?: boolean;
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
        setState({ running: true, starting: false, i: e.i, n: e.n, kind: e.kind, detail: e.detail });
      } else if (e.type === 'done') {
        setState((s) => ({ ...s, running: false, starting: false, error: e.ok ? undefined : e.error }));
      }
    });
  }, []);

  function markStarting() {
    setState({ running: true, starting: true, error: undefined });
  }

  return [state, markStarting] as const;
}
