import { useState } from 'react';
import type { VSCodeApi } from '../App';
import { useMessageBus } from './useMessageBus';
import { useDebouncedSender } from './useDebouncedSender';

export function useMemoContent(vscode: VSCodeApi, delay = 300)
{
  const [content, setContent] = useState('');

  // Receive content from extension
  useMessageBus(vscode, {
    loadMemo: (m) => setContent(m.content ?? ''),
  });

  // Debounced auto-save and manual flush
  const flushNow = useDebouncedSender(vscode, content, delay);

  return { content, setContent, flushNow } as const;
}
