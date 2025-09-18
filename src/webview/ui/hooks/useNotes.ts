import { useEffect, useState } from "react";
import type { VSCodeApi } from "../App";
import { useMessageBus } from "./useMessageBus";

export type Note = { id: string; name: string };

export function useNotes(vscode: VSCodeApi) 
{
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState("");

  // Listen for notes updates from extension
  useMessageBus(vscode, {
    notesData: (m) => 
{
      setNotes(m.notes ?? []);
      setCurrentNoteId(m.currentNoteId ?? "");
    },
  });

  // Initial load
  useEffect(() => 
{
    vscode.postMessage({ command: "getNotes" });
  }, [vscode]);

  // Commands
  const createNote = () => vscode.postMessage({ command: "createNote" });
  const switchNote = (id: string) =>
    vscode.postMessage({ command: "switchNote", id });
  const renameNote = (id: string, name: string) =>
    vscode.postMessage({ command: "renameNote", id, name });
  const deleteNote = (id: string) =>
    vscode.postMessage({ command: "deleteNote", id });
  const resetAllNotes = () => vscode.postMessage({ command: "resetAllNotes" });

  return {
    notes,
    currentNoteId,
    setNotes,
    setCurrentNoteId,
    createNote,
    switchNote,
    renameNote,
    deleteNote,
    resetAllNotes,
  } as const;
}
