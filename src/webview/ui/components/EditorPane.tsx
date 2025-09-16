/*
  EditorPane 컴포넌트
  - 역할: 메모 에디터(텍스트)와 미리보기(HTML) 영역 전환 표시
  - 핵심 포인트:
    1) isPreview=true면 미리보기만, false면 텍스트 편집기만 렌더링
    2) 콘텐츠 변경 시 onChange 콜백으로 상위 상태 갱신(디바운스는 상위 훅에서 관리)
    3) textareaRef로 외부에서 포커스 제어 가능
    4) 미리보기 체크박스 클릭 시 원본 마크다운의 해당 Task를 토글해 반영
*/

import React, { useEffect, useRef } from 'react';

export type EditorPaneProps = {
  isPreview: boolean;
  content: string;
  previewHtml: string;
  onChange: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
};

export function EditorPane({ isPreview, content, previewHtml, onChange, textareaRef }: EditorPaneProps)
{
  const previewRef = useRef<HTMLDivElement | null>(null);

  // 미리보기 렌더 후 checkbox의 disabled 속성을 제거해 클릭 가능하게 함
  useEffect(() =>
  {
    if (!isPreview || !previewRef.current)
    {
      return;
    }
    const inputs = previewRef.current.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    inputs.forEach((el) => el.removeAttribute('disabled'));
  }, [isPreview, previewHtml]);

  // 체크박스 클릭 → 원본 마크다운의 N번째 Task를 토글
  const onPreviewClick = (e: React.MouseEvent) =>
  {
    const target = e.target as HTMLElement | null;
    const input = target?.closest?.('input[type="checkbox"]') as HTMLInputElement | null;
    if (!input || !previewRef.current)
    {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    const all = Array.from(previewRef.current.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
    const idx = all.indexOf(input);
    if (idx < 0)
    {
      return;
    }
    const next = toggleTaskAtIndex(content, idx);
    if (next !== content)
    {
      onChange(next);
    }
  };

  // 코드 펜스 내부는 건너뛰고, 체크박스 문법만 N번째를 토글
  function toggleTaskAtIndex(src: string, targetIndex: number): string
  {
    const lines = src.split('\n');
    let inFence = false;
    let count = 0;

    for (let i = 0; i < lines.length; i++)
    {
      const line = lines[i];

      // 코드 펜스 토글 (``` 또는 ~~~)
      if (/^\s*(```|~~~)/.test(line))
      {
        inFence = !inFence;
        continue;
      }
      if (inFence)
      {
        continue;
      }

      const m = line.match(/^(\s*[-*+] )\[( |x|X)\](.*)$/);
      if (m)
      {
        if (count === targetIndex)
        {
          const checked = m[2].toLowerCase() === 'x';
          lines[i] = `${m[1]}[${checked ? ' ' : 'x'}]${m[3]}`;
          return lines.join('\n');
        }
        count += 1;
      }
    }
    return src;
  }

  return (
    <div className="editor-container">
      {!isPreview && (
        <textarea
          ref={textareaRef}
          id="memoEditor"
          placeholder="Start writing your memo in Markdown..."
          value={content}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {isPreview && (
        <div
          id="memoPreview"
          ref={previewRef}
          className="preview-container"
          onClick={onPreviewClick}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      )}
    </div>
  );
}
