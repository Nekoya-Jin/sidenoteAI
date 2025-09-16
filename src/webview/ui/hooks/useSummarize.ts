import { useState } from 'react';
import { useMessageBus } from './useMessageBus';
import type { VSCodeApi } from '../App';

export function useSummarize(vscode: VSCodeApi)
{
  const [showSummarize, setShowSummarize] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [pendingSummaryAfterSave, setPendingSummaryAfterSave] = useState(false);

  useMessageBus(vscode, {
    openSummarize: () =>
    {
      setShowSummarize(true);
      setSummaryResult(null);
      setSummaryError(null);
      vscode.postMessage({ command: 'getSettings' });
    },
    settingsData: (m) =>
    {
      const data = m.data ?? null;
      setPromptInput(data?.prompt ?? '');
    },
    summaryResult: (m) =>
    {
      setSummaryLoading(false);
      setSummaryResult(m.text ?? '');
    },
    summaryError: (m) =>
    {
      setSummaryLoading(false);
      setSummaryError(m.message ?? 'An error occurred.');
    },
  });

  const onClose = () => setShowSummarize(false);
  const onResetPrompt = (defaultPrompt?: string) =>
  {
    const def = defaultPrompt ?? '';
    setPromptInput(def);
    vscode.postMessage({ command: 'saveSettings', prompt: def });
  };

  const onRun = (currentPrompt?: string) =>
  {
    setSummaryLoading(true);
    setSummaryResult(null);
    setSummaryError(null);
    const cur = currentPrompt ?? '';
    if ((promptInput ?? '') !== cur)
    {
      setPendingSummaryAfterSave(true);
      vscode.postMessage({ command: 'saveSettings', prompt: promptInput });
    }
    else
    {
      vscode.postMessage({ command: 'requestSummary', text: summaryText });
    }
  };

  // This should be triggered from outside when settingsSaved arrives
  const onSettingsSaved = () =>
  {
    if (pendingSummaryAfterSave)
    {
      setPendingSummaryAfterSave(false);
      vscode.postMessage({ command: 'requestSummary', text: summaryText });
    }
  };

  return {
    showSummarize,
    promptInput,
    setPromptInput,
    summaryText,
    setSummaryText,
    summaryLoading,
    summaryResult,
    summaryError,
    onClose,
    onResetPrompt,
    onRun,
    onSettingsSaved,
  } as const;
}
