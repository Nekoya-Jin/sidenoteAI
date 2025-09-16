# SideMemo

SideMemo is a VS Code extension that adds a convenient memo functionality to your sidebar. 
Take quick notes, write documentation, or keep project-specific reminders right within VS Code.
With an optional Gemini API key, you can generate quick AI-powered summaries of your notes directly inside VS Code.

## Features

- Sidebar Integration: Dedicated memo panel in the activity bar
- Markdown Editing + Live Preview
- Auto-Save as you type (per workspace)
- Project-Specific storage (workspace-scoped)
- Clean, VS Code-themed UI
- Multiple memos with tabs (create, rename, delete, switch)
- Interactive preview checkboxes (toggle [ ] / [x] tasks directly in preview)
- AI Summarize (Gemini) with customizable prompt
- Settings modal with API key management (stored in VS Code Secrets)
- Reset All Memos action (with confirmation) to reseed default template

## Usage

1. Click the SideMemo icon in the activity bar
2. Create or switch memos using the tabs toolbar
3. Edit in Markdown; use the toolbar to toggle preview
4. Click checkboxes in preview to update your task list
5. Open Settings to set your Gemini API key and manage options
6. Optionally use "Reset All Memos" from Settings to reset data to defaults

## Commands

- SideMemo: Open Memo (`sidememo.openMemo`)
- SideMemo: Clear Memo (`sidememo.clearMemo`)
- SideMemo: Toggle Preview (`sidememo.togglePreview`)
- SideMemo: Summarize (Gemini) (`sidememo.openSummarize`)
- SideMemo: Settings (`sidememo.openSettings`)

These also appear as buttons in the view title area.

## Data Storage & Privacy

- Memo content is stored in VS Code workspaceState (per-workspace)
- Gemini API key is stored using VS Code Secrets (encrypted)
- No external files are created in your project folders

## Requirements

- VS Code 1.104.0 or higher

## License

MIT

Enjoy!
