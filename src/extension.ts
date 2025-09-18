import * as vscode from "vscode";
import { NoteViewProvider } from "./noteViewProvider";

export function activate(context: vscode.ExtensionContext) 
{
  console.log("SideNoteAI extension is now active!");

  // Create note view provider
  const noteViewProvider = new NoteViewProvider(context);

  // Register webview view provider
  const webviewProvider = vscode.window.registerWebviewViewProvider(
    "sidenoteAI.memoView",
    noteViewProvider,
    {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    },
  );

  // Register commands (IDs unchanged for compatibility)
  const openNoteCommand = vscode.commands.registerCommand(
    "sidenoteAI.openMemo",
    () => 
{
      noteViewProvider.openNote();
    },
  );

  const clearNoteCommand = vscode.commands.registerCommand(
    "sidenoteAI.clearMemo",
    () => 
{
      noteViewProvider.clearNote();
    },
  );

  const togglePreviewCommand = vscode.commands.registerCommand(
    "sidenoteAI.togglePreview",
    () => 
{
      noteViewProvider.postToWebview({ command: "togglePreview" });
    },
  );

  const summarizeCommand = vscode.commands.registerCommand(
    "sidenoteAI.openSummarize",
    () => 
{
      noteViewProvider.postToWebview({ command: "openSummarize" });
    },
  );

  const settingsCommand = vscode.commands.registerCommand(
    "sidenoteAI.openSettings",
    () => 
{
      noteViewProvider.postToWebview({ command: "openSettings" });
    },
  );

  // Add to subscriptions
  context.subscriptions.push(
    webviewProvider,
    openNoteCommand,
    clearNoteCommand,
    togglePreviewCommand,
    summarizeCommand,
    settingsCommand,
  );
}

export function deactivate() 
{}
