import { useMemo, useState } from 'react';
import { marked } from 'marked';
import type { VSCodeApi } from '../App';
import { useMessageBus } from './useMessageBus';

export function useMarkdownPreview(vscode: VSCodeApi, content: string)
{
  const [isPreview, setIsPreview] = useState(false);

  // Handle preview toggle messages
  useMessageBus(vscode, {
    togglePreview: () => setIsPreview((v) => !v),
  });

  const previewHtml = useMemo(() =>
  {
    if (!isPreview)
    {
      return '';
    }
    marked.setOptions({ headerIds: false, breaks: true } as any);
    return String(marked.parse(content || ''));
  }, [isPreview, content]);

  return { isPreview, setIsPreview, previewHtml } as const;
}
