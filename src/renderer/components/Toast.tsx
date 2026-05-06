import type { MacroState } from '../hooks/useMacroProgress';

interface Props {
  state: MacroState;
  onCancel: () => void;
}

export default function Toast({ state, onCancel }: Props) {
  if (!state.running && !state.error) return null;

  const bg = state.error ? '#fee' : '#19ce60';
  const fg = state.error ? '#c00' : 'white';
  const border = state.error ? '#fbb' : 'transparent';

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        background: bg,
        color: fg,
        border: `1px solid ${border}`,
        padding: '10px 14px',
        borderRadius: 6,
        fontSize: 13,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        minWidth: 240,
        zIndex: 100,
      }}
    >
      {state.error ? (
        <span>실패: {state.error}</span>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>
            {state.i}/{state.n} {state.kind} {state.detail || ''}
          </span>
          <button
            onClick={onCancel}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: '1px solid white',
              color: 'white',
              borderRadius: 3,
              padding: '2px 8px',
              cursor: 'pointer',
            }}
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}
