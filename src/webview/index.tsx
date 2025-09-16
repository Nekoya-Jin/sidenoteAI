/*
  Webview 엔트리 포인트
  - 역할: VS Code에서 제공하는 acquireVsCodeApi()를 통해 vscode API를 획득하고,
          React 앱을 root 요소에 마운트
  - 주의: postMessage는 vscode.postMessage를 감싸 동일 인터페이스로 전달
*/

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';

declare global
{
  interface Window { acquireVsCodeApi: () => any }
}

const vscode = window.acquireVsCodeApi();

const rootEl = document.getElementById('root')!;
const root = createRoot(rootEl);

root.render(<App vscode={{
  ...vscode,
  postMessage: (msg: any) =>
  {
    vscode.postMessage(msg);
  },
  setState: (state: any) => vscode.setState?.(state),
  getState: () => vscode.getState?.(),
}} />);
