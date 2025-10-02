import * as vscode from "vscode";
import { SettingsService } from "./services/settingsService";
import { GeminiService } from "./services/geminiService";
import { DEFAULT_SUMMARY_PROMPT } from "./prompts/summaryPrompt";
import { NotesService } from "./services/notesService";
import { MessageRouter } from "./webview/messageRouter";
import { buildHtml } from "./webview/htmlRenderer";
import { NOTE_CONSTANTS } from "./constants";

export class NoteViewProvider implements vscode.WebviewViewProvider 
{
  public static readonly viewType = "sidenoteAI.memoView";
  private static readonly DEFAULT_PROMPT = DEFAULT_SUMMARY_PROMPT;

  private _view?: vscode.WebviewView;
  private _context: vscode.ExtensionContext;
  private _settings: SettingsService;
  private _notesService: NotesService;
  private _router: MessageRouter;

  constructor(context: vscode.ExtensionContext) 
{
    this._context = context;
    this._settings = new SettingsService(
      context,
      NoteViewProvider.DEFAULT_PROMPT,
    );
    this._notesService = new NotesService(context);
    this._router = new MessageRouter();
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) 
{
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._context.extensionUri],
    };

    webviewView.webview.html = buildHtml(
      this._context.extensionUri,
      webviewView.webview,
    );

    // Register message handlers
    this._router.on("updateNote", (m) => 
{
      this._notesService.updateCurrentContent(m.content ?? "");
      this.sendCurrentNoteContent();
    });
    this._router.on("getNote", () => 
{
      this.sendCurrentNoteContent();
    });
    this._router.on("getSettings", async () => 
{
      const data = await this._settings.getSettings();
      webviewView.webview.postMessage({ command: "settingsData", data });
    });
    this._router.on("saveSettings", async (m) => 
{
      const { apiKey, prompt } = m;
      await this._settings.saveSettings(apiKey, prompt);
      webviewView.webview.postMessage({ command: "settingsSaved" });
    });
    this._router.on("requestSummary", async (m) => 
{
      const userText: string = m.text ?? "";
      const apiKey = await this._context.secrets.get("sidenoteAI.geminiApiKey");
      const prompt = this._context.globalState.get<string>(
        "sidenoteAI.prompt",
        NoteViewProvider.DEFAULT_PROMPT,
      );
      if (!apiKey) 
{
        webviewView.webview.postMessage({
          command: "summaryError",
          message: "Gemini API Key is not set.",
        });
        return;
      }
      try 
{
        const gemini = new GeminiService(apiKey);
        const result = await gemini.summarize(userText, prompt);
        webviewView.webview.postMessage({
          command: "summaryResult",
          text: result,
        });
      }
      catch (err: any) 
{
        const msg = err?.message ?? String(err);
        webviewView.webview.postMessage({
          command: "summaryError",
          message: msg,
        });
      }
    });
    this._router.on("resetApiKey", async () => 
{
      const data = await this._settings.resetApiKey();
      webviewView.webview.postMessage({ command: "settingsData", data });
    });
    this._router.on("resetGlobalState", async () => 
{
      const data = await this._settings.resetAll();
      webviewView.webview.postMessage({ command: "settingsData", data });
    });
    this._router.on("getNotes", () => 
{
      this.sendNotesData();
      this.sendCurrentNoteContent();
    });
    this._router.on("createNote", (m) => 
{
      try 
{
        this._notesService.createNote(m.name);
      }
      catch (e: any) 
{
        if (e?.message === "MAX_NOTES") 
{
          vscode.window.showErrorMessage(`You can only create up to ${NOTE_CONSTANTS.MAX_NOTES} notes.`);
        }
        else 
{
          vscode.window.showErrorMessage(String(e?.message ?? e));
        }
      }
      this.sendNotesData();
      this.sendCurrentNoteContent();
    });
    this._router.on("renameNote", (m) => 
{
      try 
{
        this._notesService.renameNote(m.id, m.name);
      }
      catch (e: any) 
{
        if (e?.message === "NAME_CONFLICT") 
{
          vscode.window.showErrorMessage(
            "A note with the same name already exists. Please choose a different name.",
          );
        }
        else 
{
          vscode.window.showErrorMessage(String(e?.message ?? e));
        }
      }
      this.sendNotesData();
    });
    this._router.on("switchNote", (m) => 
{
      this._notesService.switchNote(m.id);
      this.sendNotesData();
      this.sendCurrentNoteContent();
    });
    this._router.on("clearCurrentNote", () => 
{
      this._notesService.clearCurrentNote();
      this.sendCurrentNoteContent();
      vscode.window.showInformationMessage("Memo cleared!");
    });
    this._router.on("deleteNote", (m) => 
{
      try 
{
        this._notesService.deleteNote(m.id);
        vscode.window.showInformationMessage("Memo deleted!");
      }
      catch (e: any) 
{
        if (e?.message === "LAST_NOTE") 
{
          vscode.window.showWarningMessage("Cannot delete the only memo.");
        }
        else 
{
          vscode.window.showErrorMessage(String(e?.message ?? e));
        }
      }
      this.sendNotesData();
      this.sendCurrentNoteContent();
    });
    this._router.on("resetAllNotes", async () => 
{
      const pick = await vscode.window.showWarningMessage(
        "All memos will be deleted and reset to defaults. Proceed?",
        "Yes",
        "No",
      );
      if (pick !== "Yes") 
{
        return;
      }
      await this._notesService.resetAll();
      this.sendNotesData();
      this.sendCurrentNoteContent();
      vscode.window.showInformationMessage(
        "All memos have been reset to defaults.",
      );
    });

    webviewView.webview.onDidReceiveMessage(
      async (message) => 
{
        await this._router.handle(message);
      },
      undefined,
      this._context.subscriptions,
    );

    // Initial payload
    this.sendNotesData();
    this.sendCurrentNoteContent();
  }

  public openNote() 
{
    if (this._view) 
{
      this._view.show?.(true);
    }
  }

  public postToWebview(message: any) 
{
    this._view?.webview.postMessage(message);
  }

  public clearNote() 
{
    vscode.window
      .showWarningMessage(
        "Are you sure you want to clear the memo?",
        "Yes",
        "No",
      )
      .then((selection) => 
{
        if (selection === "Yes") 
{
          this._notesService.clearCurrentNote();
          this._view?.webview.postMessage({
            command: "loadNote",
            content: this._notesService.currentContent,
          });
          vscode.window.showInformationMessage("Memo cleared!");
        }
      });
  }

  private sendNotesData() 
{
    this._view?.webview.postMessage({
      command: "notesData",
      notes: this._notesService.notes,
      currentNoteId: this._notesService.currentNoteId,
    });
  }

  private sendCurrentNoteContent() 
{
    this._view?.webview.postMessage({
      command: "loadNote",
      content: this._notesService.currentContent,
    });
  }
}
