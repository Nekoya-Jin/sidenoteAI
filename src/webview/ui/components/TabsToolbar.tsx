/*
  TabsToolbar 컴포넌트
  - 역할: 상단 툴바 레이아웃 내에서 Tabs 컴포넌트를 감싸고, 우측 공간 균형을 맞추기 위한 spacer 제공
  - 전달: 노트 목록, 현재 노트, 추가/전환/이름변경/삭제 콜백을 Tabs로 그대로 전달
*/

import React from "react";
import { Tabs } from "../Tabs";

type Note = { id: string; name: string };

type Props = {
  notes: Note[];
  currentNoteId: string;
  onAdd: () => void;
  onSwitch: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

export function TabsToolbar({
  notes,
  currentNoteId,
  onAdd,
  onSwitch,
  onRename,
  onDelete,
}: Props) 
{
  return (
    <div className="toolbar" style={{ gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        <Tabs
          notes={notes}
          currentNoteId={currentNoteId}
          onAdd={onAdd}
          onSwitch={onSwitch}
          onRename={onRename}
          onDelete={onDelete}
        />
        {/* 우측 여백 확보를 위한 spacer */}
        <div className="spacer" />
      </div>
    </div>
  );
}
