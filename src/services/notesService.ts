import * as vscode from "vscode";

export type Note = { id: string; name: string };

export class NotesService 
{
  private context: vscode.ExtensionContext;
  private notesList: Note[] = [];
  private currentNoteIdValue: string = "";
  private currentContentValue: string = "";

  constructor(context: vscode.ExtensionContext) 
{
    this.context = context;
    this.loadNotes();
  }

  // ---------- Public getters ----------
  public get notes(): ReadonlyArray<Note> 
{
    return this.notesList;
  }
  public get currentNoteId(): string 
{
    return this.currentNoteIdValue;
  }
  public get currentContent(): string 
{
    return this.currentContentValue;
  }

  public getSnapshot() 
{
    return {
      notes: this.notesList,
      currentNoteId: this.currentNoteIdValue,
      content: this.currentContentValue,
    };
  }

  // ---------- Commands (with rule enforcement) ----------
  public createNote(desiredName?: string): Note 
{
    if (this.notesList.length >= 3) 
{
      throw new Error("MAX_NOTES");
    }
    const base = (desiredName ?? "note").trim() || "note";
    const name = this.ensureUniqueName(base);
    const id = `note-${Date.now()}`;
    this.notesList.push({ id, name });
    this.currentNoteIdValue = id;
    this.saveNotes();
    this.setNoteContent(id, "");
    this.currentContentValue = "";
    return { id, name };
  }

  public renameNote(id: string, newNameRaw: string) 
{
    const newName = (newNameRaw ?? "").trim();
    const target = this.notesList.find((n) => n.id === id);
    if (!target || !newName) 
{
      return;
    }
    const lower = newName.toLowerCase();
    const conflict = this.notesList.some(
      (m) => m.id !== id && m.name.toLowerCase() === lower,
    );
    if (conflict) 
{
      throw new Error("NAME_CONFLICT");
    }
    target.name = newName;
    this.saveNotes();
  }

  public switchNote(id: string) 
{
    if (!id) 
{
      return;
    }
    if (!this.notesList.some((n) => n.id === id)) 
{
      return;
    }
    this.currentNoteIdValue = id;
    this.saveNotes();
    this.currentContentValue = this.getNoteContent(id);
  }

  public clearCurrentNote() 
{
    if (!this.currentNoteIdValue) 
{
      return;
    }
    this.currentContentValue = "";
    this.setNoteContent(this.currentNoteIdValue, "");
  }

  public deleteNote(id: string) 
{
    if (this.notesList.length <= 1) 
{
      throw new Error("LAST_NOTE");
    }
    this.notesList = this.notesList.filter((n) => n.id !== id);
    if (this.currentNoteIdValue === id) 
{
      this.currentNoteIdValue =
        this.notesList.length > 0 ? this.notesList[0].id : "";
      this.currentContentValue = this.currentNoteIdValue
        ? this.getNoteContent(this.currentNoteIdValue)
        : "";
    }
    this.saveNotes();
  }

  public updateCurrentContent(content: string) 
{
    this.currentContentValue = content ?? "";
    if (this.currentNoteIdValue) 
{
      this.setNoteContent(this.currentNoteIdValue, this.currentContentValue);
    }
  }

  public async resetAll(): Promise<void> 
{
    const ws: any = this.context.workspaceState as any;
    const keys: string[] = typeof ws.keys === "function" ? ws.keys() : [];

    const base = this.baseKey();
    const notesKey = this.notesKey();
    const currentKey = this.currentKey();
    const legacyKey = `memo_${base}`;
    const legacyContentPrefix = `memo_${base}_`;
    const noteContentPrefix = `note_${base}_`;

    if (Array.isArray(keys) && keys.length) 
{
      for (const k of keys) 
{
        if (
          k === notesKey ||
          k === currentKey ||
          k === legacyKey ||
          (typeof k === "string" &&
            (k.startsWith(legacyContentPrefix) ||
              k.startsWith(noteContentPrefix)))
        ) 
{
          await this.context.workspaceState.update(k, undefined);
        }
      }
    }
 else 
{
      // Fallback: clear known keys
      await this.context.workspaceState.update(notesKey, undefined);
      await this.context.workspaceState.update(currentKey, undefined);
      await this.context.workspaceState.update(legacyKey, undefined);
    }

    // Reset in-memory state
    this.notesList = [];
    this.currentNoteIdValue = "";
    this.currentContentValue = "";

    // Reseed with default template on next load
    this.loadNotes();
  }

  // ---------- Persistence helpers ----------
  private baseKey() 
{
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    return workspaceFolder ? workspaceFolder.uri.fsPath : "global";
  }
  private notesKey() 
{
    return `notes_${this.baseKey()}`;
  }
  private currentKey() 
{
    return `currentNote_${this.baseKey()}`;
  }
  private contentKey(id: string) 
{
    return `note_${this.baseKey()}_${id}`;
  }

  private loadNotes() 
{
    const notes = this.context.workspaceState.get<Note[]>(this.notesKey(), []);
    const current = this.context.workspaceState.get<string>(
      this.currentKey(),
      "",
    );
    // Migration from single memo: if no multi-note state exists, seed with legacy single memo content
    if (!notes || notes.length === 0) 
{
      const legacyKey = `memo_${this.baseKey()}`;
      const legacy = this.context.workspaceState.get<string>(
        legacyKey,
        this.defaultTemplate(),
      );
      const id = "note-1";
      const name = this.ensureUniqueName("note");
      this.notesList = [{ id, name }];
      this.currentNoteIdValue = id;
      this.setNoteContent(id, legacy);
      this.saveNotes();
      this.currentContentValue = legacy;
      return;
    }
    this.notesList = notes;
    this.currentNoteIdValue = current || notes[0]?.id;
    this.currentContentValue = this.currentNoteIdValue
      ? this.getNoteContent(this.currentNoteIdValue)
      : "";
  }

  private saveNotes() 
{
    this.context.workspaceState.update(this.notesKey(), this.notesList);
    this.context.workspaceState.update(
      this.currentKey(),
      this.currentNoteIdValue,
    );
  }

  private getNoteContent(id: string): string 
{
    return this.context.workspaceState.get<string>(this.contentKey(id), "");
  }

  private setNoteContent(id: string, content: string) 
{
    this.context.workspaceState.update(this.contentKey(id), content);
  }

  private ensureUniqueName(desiredBase: string): string 
{
    const base = (desiredBase || "note").trim();
    const used = new Set(this.notesList.map((n) => n.name.toLowerCase()));
    let candidate = base;
    let i = 0;
    while (used.has(candidate.toLowerCase())) 
{
      i += 1;
      candidate = `${base} (${i})`;
    }
    return candidate;
  }

  private defaultTemplate(): string 
{
    const today = new Date().toISOString().slice(0, 10);
    return [
      "# My Note",
      "",
      "Welcome to SideNoteAI! This starter template showcases common Markdown features.",
      "",
      "## Today",
      "- Date: " + today,
      "- Mood: 🙂",
      "",
      "---",
      "",
      "## Todos",
      "- [ ] Outline today's goals",
      "- [ ] Write down key notes",
      "- [ ] Review and summarize",
      "",
      "## Notes",
      "- You can write normal paragraphs here.",
      "- Use emphasis like **bold**, *italic*, and `inline code`.",
      "- Create lists:",
      "  - Nested item 1",
      "  - Nested item 2",
      "",
      "> Tip: Right-click a tab to Rename or Delete. Use the toolbar to add a new note.",
      "",
      "## Code",
      "```ts",
      "function greet(name: string) {",
      "  console.log(`Hello, ${name}!`);",
      "}",
      "```",
      "",
      "## Table",
      "| Key | Value |",
      "| --- | ----- |",
      "| Language | TypeScript |",
      "| Editor   | VS Code     |",
      "",
      "## Links & Images",
      "- Link: [VS Code](https://code.visualstudio.com)",
      "- Image:",
      "",
      "![SideNoteAI](https://via.placeholder.com/800x300?text=SideNoteAI)",
      "",
      "---",
      "",
      "## Scratchpad",
      "- Use this section freely to jot down ideas.",
    ].join("\n");
  }
}
