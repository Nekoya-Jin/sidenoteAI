/*
  AppContext
  - 역할: 설정, 요약, 노트 관련 훅을 통합해 전역 컨텍스트로 제공
  - 구성: useSettings / useSummarize / useNotes에서 반환된 값을 하나의 value로 합쳐 배포
  - 사용: AppProvider로 감싸고, 하위에서 useAppContext()로 접근
*/

import React, { createContext, useContext } from "react";
import type { VSCodeApi } from "../App";
import { useSettings } from "../hooks/useSettings";
import { useSummarize } from "../hooks/useSummarize";
import { useNotes } from "../hooks/useNotes";

export type AppContextValue = {
  settings: ReturnType<typeof useSettings>;
  summarize: ReturnType<typeof useSummarize>;
  notes: ReturnType<typeof useNotes>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  vscode,
  children,
}: {
  vscode: VSCodeApi;
  children: React.ReactNode;
}) 
{
  const settings = useSettings(vscode);
  const summarize = useSummarize(vscode);
  const notes = useNotes(vscode);

  const value: AppContextValue = { settings, summarize, notes };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() 
{
  const ctx = useContext(AppContext);
  if (!ctx) 
{
    throw new Error("useAppContext must be used within AppProvider");
  }
  return ctx;
}
