/*
  SettingsModal 컴포넌트
  - 역할: 설정(UI) 모달 표시, Gemini API Key 입력/저장/초기화 처리 + 모든 메모 초기화 버튼 제공(테스트/관리용)
  - 핵심 포인트:
    1) 닫기 버튼은 우측 상단의 X 버튼으로 제공
    2) Save 클릭 시 저장만 수행하고, 모달은 닫지 않음(저장 완료 후 설정 재조회)
    3) Reset All Memos는 별도 섹션(가운데 정렬)
*/

import React from 'react';

type Props = {
  show: boolean;
  hasApiKey: boolean;
  apiKeyInput: string;
  onApiKeyChange: (v: string) => void;
  saving: boolean;
  onClose: () => void;
  onReset: () => void; // API Key 초기화
  onSave: () => void;
  onResetAllMemos: () => void; // 모든 메모 초기화
};

export function SettingsModal(props: Props)
{
  const { show, hasApiKey, apiKeyInput, onApiKeyChange, saving, onClose, onReset, onSave, onResetAllMemos } = props;

  // 모달이 비활성 상태면 렌더링하지 않음 (포털/조건부 렌더링 패턴)
  if (!show)
  {
    return null;
  }

  return (
    // 오버레이 클릭 시 닫히고, 내부 클릭은 e.stopPropagation()으로 차단
    <div className="modal-overlay" onClick={onClose}>
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

        <h3>Settings</h3>
        <div>
          {/* API Key 입력 영역 */}
          <label>
            <div style={{ marginBottom: 4 }}>Gemini API Key</div>
            <input
              type="password"
              value={apiKeyInput}
              placeholder={hasApiKey ? '•••••••• (set)' : 'Enter API Key'}
              onChange={(e) => onApiKeyChange(e.target.value)}
            />
          </label>

          {/* 기본 액션: 저장만 유지 (닫기는 X 버튼 사용) */}
          <div className="modal-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn stable" onClick={onSave} disabled={saving}>Save</button>
          </div>

          {/* 간격 + 중앙 정렬된 전체 초기화 섹션 */}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--vscode-widget-border)', display: 'flex', justifyContent: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={() =>
              {
                onResetAllMemos();
              }}
            >Reset All Memos</button>
          </div>
        </div>
      </div>
    </div>
  );
}
