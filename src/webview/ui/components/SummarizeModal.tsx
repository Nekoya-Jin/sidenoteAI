/*
  SummarizeModal 컴포넌트
  - 역할: 요약 프롬프트/입력 텍스트를 받아 LLM 요약 실행 UI 제공
  - 핵심 포인트:
    1) 닫기 버튼은 우측 상단 X 버튼으로 제공
    2) 실행 중(loading)에는 Summarize 비활성화
*/

import React from 'react';

type Props = {
  show: boolean;
  prompt: string;
  onPromptChange: (v: string) => void;
  defaultPrompt?: string;
  text: string;
  onTextChange: (v: string) => void;
  loading: boolean;
  error?: string | null;
  result?: string | null;
  onClose: () => void;
  onResetPrompt: () => void;
  onRun: () => void;
};

export function SummarizeModal(props: Props)
{
  const { show, prompt, onPromptChange, text, onTextChange, loading, error, result, onClose, onResetPrompt, onRun } = props;

  if (!show)
  {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* 내부 클릭은 닫힘 방지 */}
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        {/* 우측 상단 X 버튼 */}
        <button
          type="button"
          aria-label="Close"
          title="Close"
          onClick={onClose}
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
            border: 'none',
            background: 'transparent',
            color: 'var(--vscode-foreground)',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
          }}
        >×</button>

        <h3>Summarize</h3>
        <div>
          {/* 프롬프트 입력 + 초기화 버튼 */}
          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div>Prompt</div>
              <button type="button" className="btn btn-secondary" onClick={onResetPrompt}>Reset</button>
            </div>
            <textarea rows={6} value={prompt} onChange={(e) => onPromptChange(e.target.value)} />
          </label>

          {/* 요약 대상 텍스트 입력 */}
          <label style={{ display: 'block' }}>
            <div style={{ marginBottom: 4 }}>OutPut</div>
            <textarea
              rows={10}
              placeholder="Paste text to summarize"
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
            />
          </label>

          {/* 실행 액션 영역 (닫기는 X 버튼 사용) */}
          <div className="modal-actions">
            <button className="btn" onClick={onRun} disabled={loading}>{loading ? 'Summarizing…' : 'Summarize'}</button>
          </div>

          {/* 오류/결과 표시 */}
          {error && <div className="hint" style={{ color: 'var(--vscode-editorError-foreground)' }}>{error}</div>}
          {result && (
            <div style={{ borderTop: '1px solid var(--vscode-widget-border)', marginTop: 8, paddingTop: 8 }}>
              <div className="hint">Result</div>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
