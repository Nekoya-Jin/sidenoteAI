/*
  App 컴포넌트 (Webview 루트)
  - 역할: VS Code에서 주입한 vscode API를 하위에 전달하고, 전역 컨텍스트(AppProvider)로 훅들을 통합
  - 구성: TabsToolbar, EditorPane, SettingsModal, SummarizeModal로 화면 구성
  - 주의: 메모 내용 저장은 상위 훅에서 디바운스/플러시 처리, 노트 전환/삭제 시 즉시 플러시 호출
*/

import React, { useRef } from 'react';
import { SettingsModal } from './components/SettingsModal';
import { SummarizeModal } from './components/SummarizeModal';
import { useMessageBus } from './hooks/useMessageBus';
import { TabsToolbar } from './components/TabsToolbar';
import { EditorPane } from './components/EditorPane';
import { AppProvider, useAppContext } from './context/AppContext';
import { useMarkdownPreview } from './hooks/useMarkdownPreview';
import { useMemoContent } from './hooks/useMemoContent';

export type VSCodeApi = {
  postMessage: (msg: any) => void;
  setState?: (state: any) => void;
  getState?: () => any;
};

export function App({ vscode }: { vscode: VSCodeApi })
{
  // 에디터 DOM 접근을 위한 ref (외부 포커스 제어 용도)
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    <AppProvider vscode={vscode}>
      <InnerApp vscode={vscode} editorRef={editorRef} />
    </AppProvider>
  );
}

function InnerApp({ vscode, editorRef }: { vscode: VSCodeApi; editorRef: React.RefObject<HTMLTextAreaElement> })
{
  const { notes: notesCtx, settings: settingsCtx, summarize: summarizeCtx } = useAppContext();
  const { notes: noteList, currentNoteId, createNote, switchNote, renameNote, deleteNote } = notesCtx;
  const settingsState = settingsCtx.settings;

  // 콘텐츠 상태 및 미리보기 HTML 생성 훅
  const { content: memoContent, setContent: setMemoContent, flushNow } = useMemoContent(vscode, 300);
  const { isPreview, previewHtml } = useMarkdownPreview(vscode, memoContent);

  // 확장-웹뷰 메시지 브리지: 설정 저장 완료 신호 처리
  useMessageBus(vscode, {
    settingsSaved: () => summarizeCtx.onSettingsSaved(),
  });

  // 노트 관련 콜백: 전환/삭제 전에 즉시 플러시하여 유실 방지
  const onAddNote = () => createNote();
  const onSwitchNote = (id: string) =>
  {
    flushNow();
    switchNote(id);
  };
  const onRenameNote = (id: string, name: string) => renameNote(id, name);
  const onDeleteNote = (id: string) =>
  {
    flushNow();
    deleteNote(id);
  };

  return (
    <div className="memo-container">
      <TabsToolbar
        notes={noteList}
        currentNoteId={currentNoteId}
        onAdd={onAddNote}
        onSwitch={onSwitchNote}
        onRename={onRenameNote}
        onDelete={onDeleteNote}
      />

      <EditorPane
        isPreview={isPreview}
        content={memoContent}
        previewHtml={previewHtml}
        onChange={setMemoContent}
        textareaRef={editorRef}
      />

      <SettingsModal
        show={settingsCtx.showSettings}
        hasApiKey={!!settingsState?.hasApiKey}
        apiKeyInput={settingsCtx.apiKeyInput}
        onApiKeyChange={settingsCtx.setApiKeyInput}
        saving={settingsCtx.savingSettings}
        onClose={settingsCtx.onClose}
        onReset={settingsCtx.onReset}
        onSave={settingsCtx.onSave}
        onResetAllMemos={notesCtx.resetAllMemos}
      />

      <SummarizeModal
        show={summarizeCtx.showSummarize}
        prompt={summarizeCtx.promptInput}
        onPromptChange={summarizeCtx.setPromptInput}
        defaultPrompt={settingsState?.defaultPrompt}
        text={summarizeCtx.summaryText}
        onTextChange={summarizeCtx.setSummaryText}
        loading={summarizeCtx.summaryLoading}
        error={summarizeCtx.summaryError}
        result={summarizeCtx.summaryResult}
        onClose={summarizeCtx.onClose}
        onResetPrompt={() => summarizeCtx.onResetPrompt(settingsState?.defaultPrompt)}
        onRun={() => summarizeCtx.onRun(settingsState?.prompt)}
      />
    </div>
  );
}
