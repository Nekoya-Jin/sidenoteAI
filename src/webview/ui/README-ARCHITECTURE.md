SideNoteAI Webview UI Architecture (brief)

- App.tsx
  - Wraps with AppProvider (aggregated context) and renders InnerApp
- context/AppContext.tsx
  - Aggregates settings, summarize, notes hooks into a single provider
- hooks/
  - useNotes: notes list/state and commands
  - useSettings: settings modal state and actions
  - useSummarize: summarize modal state and actions
  - useMemoContent: memo content state + debounced save
  - useMarkdownPreview: preview toggle handling + HTML rendering
  - useMessageBus: one-time window message listener with handler ref
- components/
  - TabsToolbar: wraps Tabs and top toolbar
  - EditorPane: editor/preview area
  - SettingsModal, SummarizeModal

Deprecated (replaced by AppContext):
- context/NotesContext.tsx
- context/SettingsContext.tsx
- context/SummarizeContext.tsx

Notes:
- Follow Allman brace style per eslint.config.mjs
- Keep VS Code theme variables for styling
