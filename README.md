# SideNoteAI

SideNoteAI is a VS Code extension that adds a convenient AI-enhanced note functionality to your sidebar.
Take quick notes, write documentation, or keep project-specific reminders right within VS Code.
With an optional Gemini API key, you can generate quick AI-powered summaries of your notes directly inside VS Code.

![Image](https://github.com/user-attachments/assets/56594f0c-dbbd-4c55-a0f8-f2ec8e942743)


## Features

- Sidebar Integration: Dedicated note panel in the activity bar
- Markdown Editing + Live Preview
- Auto-Save as you type (per workspace)
- Project-Specific storage (workspace-scoped)
- Clean, VS Code-themed UI
- Multiple notes with tabs (create, rename, delete, switch)
- Interactive preview checkboxes (toggle [ ] / [x] tasks directly in preview)
- AI Summarize (Gemini) with customizable prompt
- Settings modal with API key management (stored in VS Code Secrets)
- Reset All Notes action (with confirmation) to reseed default template

## Usage

1. Click the SideNoteAI icon in the activity bar
2. Create or switch notes using the tabs toolbar
3. Edit in Markdown; use the toolbar to toggle preview
4. Click checkboxes in preview to update your task list
5. Open Settings to set your Gemini API key and manage options
6. Optionally use "Reset All Notes" from Settings to reset data to defaults

## Commands

- SideNoteAI: Open Note (`sidenoteAI.openMemo`)
- SideNoteAI: Clear Note (`sidenoteAI.clearMemo`)
- SideNoteAI: Toggle Preview (`sidenoteAI.togglePreview`)
- SideNoteAI: Summarize (Gemini) (`sidenoteAI.openSummarize`)
- SideNoteAI: Settings (`sidenoteAI.openSettings`)

These also appear as buttons in the view title area.

## Data Storage & Privacy

- Note content is stored in VS Code workspaceState (per-workspace)
- Gemini API key is stored using VS Code Secrets (encrypted)
- No external files are created in your project folders

## Requirements

- VS Code 1.104.0 or higher

## License

MIT

Enjoy!
