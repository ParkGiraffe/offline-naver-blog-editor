import type { MacroState } from '../hooks/useMacroProgress';

interface Props {
  state: MacroState;
  onCancel: () => void;
}

export default function Toast({ state, onCancel }: Props) {
  if (!state.running && !state.error) return null;

  return (
    <div style={containerStyle(state.error != null)}>
      <span>{message(state)}</span>
      {!state.error && (
        <button onClick={onCancel} style={cancelButtonStyle}>취소</button>
      )}
    </div>
  );
}

function message(state: MacroState): string {
  if (state.error) return `실패: ${state.error}`;
  if (state.starting) return '5초 안에 네이버 본문 영역을 클릭하세요. 자동 paste 시작됨.';
  return `${state.i}/${state.n} ${state.kind} ${state.detail || ''}`;
}

function containerStyle(isError: boolean): React.CSSProperties {
  return {
    position: 'fixed',
    top: 16,
    right: 16,
    background: isError ? '#fee' : '#19ce60',
    color: isError ? '#c00' : 'white',
    border: `1px solid ${isError ? '#fbb' : 'transparent'}`,
    padding: '10px 14px',
    borderRadius: 6,
    fontSize: 13,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minWidth: 240,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  };
}

const cancelButtonStyle: React.CSSProperties = {
  marginLeft: 'auto',
  background: 'transparent',
  border: '1px solid white',
  color: 'white',
  borderRadius: 3,
  padding: '2px 8px',
  cursor: 'pointer',
};
